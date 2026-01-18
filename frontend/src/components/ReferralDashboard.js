import React, { useState, useEffect } from 'react';
import ReferralCode from './ReferralCode';
import ApiService from '../services/api';
import './ReferralDashboard.css';

function ReferralDashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, referralsData] = await Promise.all([
          ApiService.getReferralStats(userId),
          ApiService.getReferrals(userId)
        ]);
        setStats(statsData);
        setReferrals(referralsData.referrals || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('대시보드 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  if (loading) {
    return <div className="dashboard-container">로딩 중...</div>;
  }

  if (error) {
    return <div className="dashboard-container error">오류: {error}</div>;
  }

  if (!stats) {
    return <div className="dashboard-container">데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>초대 대시보드</h1>
      
      <ReferralCode referralCode={stats.referralCode} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">초대한 친구</div>
          <div className="stat-value">{stats.totalReferrals}명</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">획득 포인트</div>
          <div className="stat-value">{stats.totalPoints.toLocaleString()}원</div>
        </div>
      </div>

      {referrals.length > 0 && (
        <div className="referrals-list">
          <h3>초대한 친구 목록</h3>
          <ul>
            {referrals.map((referral) => (
              <li key={referral.id}>
                <span className="referral-name">{referral.inviteeName}</span>
                <span className="referral-date">
                  {new Date(referral.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <span className="referral-points">+{referral.pointsGiven.toLocaleString()}원</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="empty-state">
          아직 초대한 친구가 없습니다. 초대 코드를 공유해보세요!
        </div>
      )}
    </div>
  );
}

export default ReferralDashboard;

