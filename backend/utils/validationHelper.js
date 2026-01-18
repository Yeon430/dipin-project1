const { ERROR_MESSAGES } = require('../config/constants');

/**
 * 유효성 검증 헬퍼 유틸리티
 */
class ValidationHelper {
  /**
   * 사용자 생성 요청 유효성 검증
   */
  static validateUserCreation(email, name) {
    if (!email || !name) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.REQUIRED_EMAIL_NAME
      };
    }
    return { isValid: true };
  }

  /**
   * 이메일 중복 체크 콜백 래퍼
   */
  static checkEmailExists(email, callback) {
    return (err, existingUser) => {
      if (err) {
        return callback(err, null);
      }
      if (existingUser) {
        return callback(null, new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS));
      }
      callback(null, null);
    };
  }
}

module.exports = ValidationHelper;

