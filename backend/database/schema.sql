-- Users 테이블: 사용자 정보 저장
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,  -- 고유 초대 코드
  points INTEGER DEFAULT 0,             -- 보유 포인트
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Referrals 테이블: 추천 관계 저장
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inviter_id INTEGER NOT NULL,          -- 초대한 사람 (User ID)
  invitee_id INTEGER NOT NULL,          -- 초대받은 사람 (User ID)
  invitee_referral_code TEXT NOT NULL,  -- 초대받은 사람이 사용한 코드
  points_given INTEGER DEFAULT 0,       -- 지급된 포인트 (히스토리 기록용)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inviter_id) REFERENCES users(id),
  FOREIGN KEY (invitee_id) REFERENCES users(id),
  UNIQUE(invitee_id)  -- 한 사람은 한 번만 초대받을 수 있음
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON referrals(inviter_id);
CREATE INDEX IF NOT EXISTS idx_referrals_invitee ON referrals(invitee_id);

