const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { REFERRAL_REWARD_POINTS, ERROR_MESSAGES } = require('../config/constants');

const dbPath = path.join(__dirname, '../referral.db');

class ReferralService {
  /**
   * 추천인 코드로 가입 처리 (트랜잭션 적용)
   */
  static async registerWithReferral(userData, referralCode) {
    const db = new sqlite3.Database(dbPath);
    
    return new Promise((resolve, reject) => {
      db.serialize(async () => {
        // 트랜잭션 시작
        db.run('BEGIN TRANSACTION');

        try {
          // 1. 이메일 중복 체크 (트랜잭션 내에서 확인)
          const existingUser = await new Promise((res, rej) => {
            db.get('SELECT id FROM users WHERE email = ?', [userData.email], (err, row) => {
              if (err) rej(err); else res(row);
            });
          });

          if (existingUser) {
            throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
          }

          // 2. 고유 초대 코드 생성 함수 (트랜잭션용)
          const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
            return code;
          };

          let newReferralCode;
          let isUnique = false;
          while (!isUnique) {
            newReferralCode = generateCode();
            const row = await new Promise((res) => {
              db.get('SELECT id FROM users WHERE referral_code = ?', [newReferralCode], (err, row) => res(row));
            });
            if (!row) isUnique = true;
          }

          // 3. 새 사용자 생성
          const newUser = await new Promise((res, rej) => {
            db.run(
              'INSERT INTO users (email, name, referral_code) VALUES (?, ?, ?)',
              [userData.email, userData.name, newReferralCode],
              function(err) {
                if (err) rej(err); else res({ id: this.lastID, email: userData.email, name: userData.name, referral_code: newReferralCode });
              }
            );
          });

          // 4. 추천인 코드 로직 처리
          let referralApplied = false;
          let inviter = null;

          if (referralCode) {
            // 추천인 존재 확인
            inviter = await new Promise((res, rej) => {
              db.get('SELECT id, name FROM users WHERE referral_code = ?', [referralCode], (err, row) => {
                if (err) rej(err); else res(row);
              });
            });

            if (!inviter) {
              throw new Error(ERROR_MESSAGES.INVALID_REFERRAL_CODE);
            }

            // 본인 초대 방지
            if (inviter.id === newUser.id) {
              throw new Error('자기 자신의 초대 코드는 사용할 수 없습니다.');
            }

            // 포인트 지급 (초대자)
            await new Promise((res, rej) => {
              db.run('UPDATE users SET points = points + ? WHERE id = ?', [REFERRAL_REWARD_POINTS, inviter.id], (err) => {
                if (err) rej(err); else res();
              });
            });

            // 포인트 지급 (피초대자)
            await new Promise((res, rej) => {
              db.run('UPDATE users SET points = points + ? WHERE id = ?', [REFERRAL_REWARD_POINTS, newUser.id], (err) => {
                if (err) rej(err); else res();
              });
            });

            // 추천 관계 기록
            await new Promise((res, rej) => {
              db.run(
                'INSERT INTO referrals (inviter_id, invitee_id, invitee_referral_code, points_given) VALUES (?, ?, ?, ?)',
                [inviter.id, newUser.id, referralCode, REFERRAL_REWARD_POINTS],
                (err) => {
                  if (err) rej(err); else res();
                }
              );
            });

            referralApplied = true;
          }

          // 커밋
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              db.close();
              reject(err);
            } else {
              db.close();
              resolve({
                user: { ...newUser, points: referralApplied ? REFERRAL_REWARD_POINTS : 0 },
                referralApplied,
                inviter,
                pointsGiven: referralApplied ? REFERRAL_REWARD_POINTS : 0
              });
            }
          });

        } catch (error) {
          db.run('ROLLBACK', () => {
            db.close();
            reject(error);
          });
        }
      });
    });
  }
}

module.exports = ReferralService;
