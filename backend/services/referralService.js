const User = require('../models/user');
const Referral = require('../models/referral');
const { REFERRAL_REWARD_POINTS } = require('../config/constants');

class ReferralService {
  /**
   * 추천인 코드로 가입 처리
   * @param {Object} userData - 가입할 사용자 정보
   * @param {string} referralCode - 추천인 코드 (선택)
   * @returns {Promise<Object>} 생성된 사용자 정보 및 포인트 지급 결과
   */
  static async registerWithReferral(userData, referralCode) {
    // 추천인 코드가 없는 경우 단순 가입
    if (!referralCode) {
      const newUser = await User.create({ email: userData.email, name: userData.name });
      return {
        user: newUser,
        referralApplied: false
      };
    }

    // 1. 추천인 코드 유효성 검증
    const validation = await ReferralService.validateReferralCode(referralCode);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const inviter = validation.inviter;

    // 2. 사용자 생성 (초대 코드 자동 생성)
    const newUser = await User.create({ email: userData.email, name: userData.name });

    // 3. 양측에게 포인트 지급
    await User.addPoints(inviter.id, REFERRAL_REWARD_POINTS);
    await User.addPoints(newUser.id, REFERRAL_REWARD_POINTS);

    // 4. 추천 관계 기록
    await Referral.create({
      inviterId: inviter.id,
      inviteeId: newUser.id,
      inviteeReferralCode: referralCode,
      pointsGiven: REFERRAL_REWARD_POINTS
    });

    // 5. 최신 사용자 정보 조회
    return new Promise((resolve, reject) => {
      User.findById(newUser.id, (err, updatedUser) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            user: updatedUser,
            referralApplied: true,
            inviter: inviter,
            pointsGiven: REFERRAL_REWARD_POINTS
          });
        }
      });
    });
  }

  /**
   * 추천인 코드 유효성 검증
   * @param {string} referralCode - 검증할 추천인 코드
   * @returns {Promise<Object>} 검증 결과
   */
  static validateReferralCode(referralCode) {
    return new Promise((resolve) => {
      // 초대 코드로 사용자 조회
      User.findByReferralCode(referralCode, (err, inviter) => {
        if (err) {
          resolve({
            isValid: false,
            error: '추천인 코드 검증 중 오류가 발생했습니다.'
          });
          return;
        }

        // 코드가 존재하지 않음
        if (!inviter) {
          resolve({
            isValid: false,
            error: '유효하지 않은 추천인 코드입니다.'
          });
          return;
        }

        resolve({
          isValid: true,
          inviter: inviter
        });
      });
    });
  }
}

module.exports = ReferralService;
