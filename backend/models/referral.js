const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../referral.db');

class Referral {
  static db = null;

  static init() {
    if (!Referral.db) {
      Referral.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Referral 모델 DB 연결 오류:', err.message);
        }
      });
    }
    return Referral.db;
  }

  /**
   * 추천 관계 생성
   */
  static create(referralData) {
    return new Promise((resolve, reject) => {
      const db = Referral.init();
      
      db.run(
        'INSERT INTO referrals (inviter_id, invitee_id, invitee_referral_code, points_given) VALUES (?, ?, ?, ?)',
        [
          referralData.inviterId,
          referralData.inviteeId,
          referralData.inviteeReferralCode,
          referralData.pointsGiven || 0
        ],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          Referral.findById(this.lastID, (err, referral) => {
            if (err) {
              reject(err);
            } else {
              resolve(referral);
            }
          });
        }
      );
    });
  }

  /**
   * ID로 추천 관계 조회
   */
  static findById(id, callback) {
    const db = Referral.init();
    db.get('SELECT * FROM referrals WHERE id = ?', [id], (err, row) => {
      callback(err, row);
    });
  }

  /**
   * 사용자가 이미 초대받았는지 확인
   */
  static isAlreadyInvited(userId, callback) {
    const db = Referral.init();
    db.get('SELECT id FROM referrals WHERE invitee_id = ?', [userId], (err, row) => {
      callback(err, !!row);
    });
  }

  /**
   * 특정 사용자가 초대한 모든 사람 조회
   */
  static findByInviterId(inviterId, callback) {
    const db = Referral.init();
    db.all(
      `SELECT r.*, u.name as invitee_name, u.email as invitee_email 
       FROM referrals r 
       JOIN users u ON r.invitee_id = u.id 
       WHERE r.inviter_id = ? 
       ORDER BY r.created_at DESC`,
      [inviterId],
      (err, rows) => {
        callback(err, rows);
      }
    );
  }

  /**
   * 초대한 사람 수 조회
   */
  static countByInviterId(inviterId, callback) {
    const db = Referral.init();
    db.get(
      'SELECT COUNT(*) as count FROM referrals WHERE inviter_id = ?',
      [inviterId],
      (err, row) => {
        callback(err, row ? row.count : 0);
      }
    );
  }

  /**
   * DB 연결 종료
   */
  static close() {
    if (Referral.db) {
      Referral.db.close();
      Referral.db = null;
    }
  }
}

module.exports = Referral;

