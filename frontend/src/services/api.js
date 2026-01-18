const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  /**
   * 사용자 정보 조회
   */
  static async getUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('사용자 정보를 불러올 수 없습니다.');
    }
    return response.json();
  }

  /**
   * 초대 통계 조회
   */
  static async getReferralStats(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/referral-stats`);
    if (!response.ok) {
      throw new Error('초대 통계를 불러올 수 없습니다.');
    }
    return response.json();
  }

  /**
   * 초대한 친구 목록 조회
   */
  static async getReferrals(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/referrals`);
    if (!response.ok) {
      throw new Error('초대 목록을 불러올 수 없습니다.');
    }
    return response.json();
  }
}

export default ApiService;

