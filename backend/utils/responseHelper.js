const { HTTP_STATUS } = require('../config/constants');

/**
 * API 응답 헬퍼 유틸리티
 */
class ResponseHelper {
  /**
   * 사용자 객체를 API 응답 형식으로 변환
   */
  static formatUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      referralCode: user.referral_code,
      points: user.points,
      ...(user.created_at && { createdAt: user.created_at })
    };
  }

  /**
   * 에러 응답 전송
   */
  static sendError(res, statusCode, message) {
    return res.status(statusCode).json({ error: message });
  }

  /**
   * 성공 응답 전송
   */
  static sendSuccess(res, statusCode, data) {
    return res.status(statusCode).json(data);
  }
}

module.exports = ResponseHelper;

