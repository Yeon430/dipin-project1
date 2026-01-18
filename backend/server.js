const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Referral = require('./models/referral');
const ReferralService = require('./services/referralService');
const ResponseHelper = require('./utils/responseHelper');
const ValidationHelper = require('./utils/validationHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: SUCCESS_MESSAGES.API_STATUS });
});

// 사용자 생성 (테스트용)
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // 유효성 검증
    const validation = ValidationHelper.validateUserCreation(email, name);
    if (!validation.isValid) {
      return ResponseHelper.sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
    }
    
    // 이메일 중복 체크
    User.findByEmail(email, (err, existingUser) => {
      if (err) {
        return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
      }
      
      if (existingUser) {
        return ResponseHelper.sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      
      // 사용자 생성 (초대 코드 자동 생성)
      User.create({ email, name })
        .then(user => {
          ResponseHelper.sendSuccess(res, HTTP_STATUS.CREATED, {
            message: SUCCESS_MESSAGES.USER_CREATED,
            user: ResponseHelper.formatUserResponse(user)
          });
        })
        .catch(error => {
          ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        });
    });
  } catch (error) {
    ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
});

// 사용자 조회 (초대 코드 포함)
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  User.findById(userId, (err, user) => {
    if (err) {
      return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
    }
    
    if (!user) {
      return ResponseHelper.sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    res.json(ResponseHelper.formatUserResponse(user));
  });
});

// 초대 코드로 사용자 조회
app.get('/api/users/referral-code/:code', (req, res) => {
  const code = req.params.code;
  
  User.findByReferralCode(code, (err, user) => {
    if (err) {
      return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
    }
    
    if (!user) {
      return ResponseHelper.sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.INVALID_REFERRAL_CODE);
    }
    
    res.json({
      id: user.id,
      name: user.name,
      referralCode: user.referral_code
    });
  });
});

// 추천인 등록 및 가입 (Step 2)
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, referralCode } = req.body;
    
    // 유효성 검증
    const validation = ValidationHelper.validateUserCreation(email, name);
    if (!validation.isValid) {
      return ResponseHelper.sendError(res, HTTP_STATUS.BAD_REQUEST, validation.error);
    }
    
    // 이메일 중복 체크
    User.findByEmail(email, async (err, existingUser) => {
      if (err) {
        return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
      }
      
      if (existingUser) {
        return ResponseHelper.sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      
      try {
        // 추천인 코드로 가입 처리
        const result = await ReferralService.registerWithReferral(
          { email, name },
          referralCode
        );
        
        const successMessage = referralCode 
          ? SUCCESS_MESSAGES.REGISTER_WITH_REFERRAL_SUCCESS 
          : SUCCESS_MESSAGES.REGISTER_SUCCESS;
        
        ResponseHelper.sendSuccess(res, HTTP_STATUS.CREATED, {
          message: successMessage,
          user: ResponseHelper.formatUserResponse(result.user),
          referralApplied: result.referralApplied,
          ...(result.referralApplied && {
            pointsGiven: result.pointsGiven,
            inviter: {
              id: result.inviter.id,
              name: result.inviter.name
            }
          })
        });
      } catch (error) {
        // 유효하지 않은 추천인 코드 등 에러 처리
        const statusCode = error.message.includes('추천인 코드') || error.message.includes('유효하지 않은')
          ? HTTP_STATUS.BAD_REQUEST
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;
        
        ResponseHelper.sendError(res, statusCode, error.message);
      }
    });
  } catch (error) {
    ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
});

// 초대 통계 조회 (Step 2 - 추가 API)
app.get('/api/users/:id/referrals', (req, res) => {
  const userId = parseInt(req.params.id);
  
  Referral.findByInviterId(userId, (err, referrals) => {
    if (err) {
      return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
    }
    
    res.json({
      userId: userId,
      totalReferrals: referrals.length,
      referrals: referrals.map(r => ({
        id: r.id,
        inviteeName: r.invitee_name,
        inviteeEmail: r.invitee_email,
        pointsGiven: r.points_given,
        createdAt: r.created_at
      }))
    });
  });
});

// 초대 통계 간단 조회 (Step 2 - 추가 API)
app.get('/api/users/:id/referral-stats', (req, res) => {
  const userId = parseInt(req.params.id);
  
  Referral.countByInviterId(userId, (err, count) => {
    if (err) {
      return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
    }
    
    User.findById(userId, (err, user) => {
      if (err) {
        return ResponseHelper.sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, err.message);
      }
      
      if (!user) {
        return ResponseHelper.sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      res.json({
        userId: userId,
        referralCode: user.referral_code,
        totalReferrals: count,
        totalPoints: user.points
      });
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
