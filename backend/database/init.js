const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../referral.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// 기존 DB 파일이 있으면 삭제 (개발용)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일 삭제됨');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
    return;
  }
  console.log('SQLite 데이터베이스 연결됨');
});

// 스키마 파일 읽기 및 실행
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('스키마 생성 오류:', err.message);
    db.close();
    return;
  }
  console.log('✅ 데이터베이스 스키마 생성 완료');
  console.log('  - users 테이블');
  console.log('  - referrals 테이블');
  console.log('  - 인덱스 생성됨');
  
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 닫기 오류:', err.message);
    } else {
      console.log('\n데이터베이스 초기화 완료!');
    }
  });
});

