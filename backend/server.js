const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Referral = require('./models/referral');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Referral System API' });
});

// 사용자 생성 (테스트용)
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'email과 name은 필수입니다.' });
    }
    
    // 이메일 중복 체크
    User.findByEmail(email, (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (existingUser) {
        return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
      }
      
      // 사용자 생성 (초대 코드 자동 생성)
      User.create({ email, name })
        .then(user => {
          res.status(201).json({
            message: '사용자 생성 성공',
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              referralCode: user.referral_code,
              points: user.points
            }
          });
        })
        .catch(error => {
          res.status(500).json({ error: error.message });
        });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 조회 (초대 코드 포함)
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      referralCode: user.referral_code,
      points: user.points,
      createdAt: user.created_at
    });
  });
});

// 초대 코드로 사용자 조회
app.get('/api/users/referral-code/:code', (req, res) => {
  const code = req.params.code;
  
  User.findByReferralCode(code, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: '유효하지 않은 초대 코드입니다.' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      referralCode: user.referral_code
    });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('📊 데이터베이스 모델 초기화 완료');
});

// 프로세스 종료 시 DB 연결 정리
process.on('SIGINT', () => {
  User.close();
  Referral.close();
  process.exit();
});

