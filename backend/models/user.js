const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../referral.db');

/**
 * 고유 초대 코드 생성
 * 형식: 8자리 영문 대문자 + 숫자 (예: A1B2C3D4)
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * 사용 가능한 고유 초대 코드 생성 (중복 체크)
 */
function generateUniqueReferralCode(db) {
  return new Promise((resolve, reject) => {
    function tryGenerate() {
      const code = generateReferralCode();
      
      // DB에서 중복 확인
      db.get('SELECT id FROM users WHERE referral_code = ?', [code], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // 중복이면 다시 시도
          tryGenerate();
        } else {
          resolve(code);
        }
      });
    }
    
    tryGenerate();
  });
}

class User {
  static db = null;

  static init() {
    if (!User.db) {
      User.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('User 모델 DB 연결 오류:', err.message);
        }
      });
    }
    return User.db;
  }

  /**
   * 새 사용자 생성 (초대 코드 자동 생성)
   */
  static create(userData) {
    return new Promise(async (resolve, reject) => {
      const db = User.init();
      
      try {
        // 고유 초대 코드 생성
        const referralCode = await generateUniqueReferralCode(db);
        
        db.run(
          'INSERT INTO users (email, name, referral_code, points) VALUES (?, ?, ?, ?)',
          [userData.email, userData.name, referralCode, userData.points || 0],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            // 생성된 사용자 정보 조회
            User.findById(this.lastID, (err, user) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * ID로 사용자 조회
   */
  static findById(id, callback) {
    const db = User.init();
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      callback(err, row);
    });
  }

  /**
   * 이메일로 사용자 조회
   */
  static findByEmail(email, callback) {
    const db = User.init();
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      callback(err, row);
    });
  }

  /**
   * 초대 코드로 사용자 조회
   */
  static findByReferralCode(code, callback) {
    const db = User.init();
    db.get('SELECT * FROM users WHERE referral_code = ?', [code], (err, row) => {
      callback(err, row);
    });
  }

  /**
   * 포인트 추가
   */
  static addPoints(userId, points) {
    return new Promise((resolve, reject) => {
      const db = User.init();
      
      db.run(
        'UPDATE users SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [points, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            User.findById(userId, (err, user) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            });
          }
        }
      );
    });
  }

  /**
   * DB 연결 종료
   */
  static close() {
    if (User.db) {
      User.db.close();
      User.db = null;
    }
  }
}

module.exports = User;

