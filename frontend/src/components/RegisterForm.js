import React, { useState } from 'react';
import ApiService from '../services/api';
import './RegisterForm.css';

function RegisterForm({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await ApiService.register({
        email: email.trim(),
        name: name.trim(),
        referralCode: referralCode.trim() || undefined
      });

      setSuccess(`가입 성공! 사용자 ID: ${result.user.id}`);
      setEmail('');
      setName('');
      setReferralCode('');

      // 성공 콜백 호출 (대시보드로 이동 등)
      if (onRegisterSuccess) {
        setTimeout(() => {
          onRegisterSuccess(result.user.id);
        }, 2000);
      }
    } catch (err) {
      setError(err.message || '가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="email">이메일 *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">이름 *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="referralCode">추천인 코드 (선택)</label>
          <input
            id="referralCode"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="친구의 초대 코드를 입력하세요"
            maxLength="8"
            disabled={loading}
          />
          <small className="form-help">친구로부터 받은 초대 코드를 입력하면 양쪽 모두 포인트를 받습니다!</small>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;

