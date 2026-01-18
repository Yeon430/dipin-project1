import React, { useState } from 'react';
import ReferralDashboard from './components/ReferralDashboard';
import RegisterForm from './components/RegisterForm';
import './App.css';

function App() {
  const [userId, setUserId] = useState(1); // 기본값 1, 실제로는 로그인한 사용자 ID
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterSuccess = (newUserId) => {
    setUserId(newUserId);
    setShowRegister(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>친구 초대 시스템</h1>
        <div className="header-actions">
          <div className="user-selector">
            <label>사용자 ID: </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
              min="1"
              style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button 
            className="register-button"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? '대시보드 보기' : '회원가입'}
          </button>
        </div>
      </header>
      <main>
        {showRegister ? (
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        ) : (
          <ReferralDashboard userId={userId} />
        )}
      </main>
    </div>
  );
}

export default App;

