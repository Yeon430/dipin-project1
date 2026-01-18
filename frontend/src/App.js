import React, { useState } from 'react';
import ReferralDashboard from './components/ReferralDashboard';
import './App.css';

function App() {
  const [userId, setUserId] = useState(1); // 기본값 1, 실제로는 로그인한 사용자 ID

  return (
    <div className="App">
      <header className="App-header">
        <h1>친구 초대 시스템</h1>
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
      </header>
      <main>
        <ReferralDashboard userId={userId} />
      </main>
    </div>
  );
}

export default App;

