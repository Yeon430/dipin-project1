/**
 * 애플리케이션 상수
 */
module.exports = {
  // 포인트 지급 정책
  REFERRAL_REWARD_POINTS: 5000,

  // 에러 메시지
  ERROR_MESSAGES: {
    REQUIRED_EMAIL_NAME: 'email과 name은 필수입니다.',
    EMAIL_ALREADY_EXISTS: '이미 존재하는 이메일입니다.',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_REFERRAL_CODE: '유효하지 않은 초대 코드입니다.',
    SELF_REFERRAL: '자기 자신의 초대 코드는 사용할 수 없습니다.',
    REFERRAL_CODE_VALIDATION_ERROR: '추천인 코드 검증 중 오류가 발생했습니다.'
  },

  // 성공 메시지
  SUCCESS_MESSAGES: {
    USER_CREATED: '사용자 생성 성공',
    REGISTER_SUCCESS: '가입 성공',
    REGISTER_WITH_REFERRAL_SUCCESS: '가입 및 추천인 등록 성공',
    API_STATUS: 'Referral System API'
  },

  // HTTP 상태 코드
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};

