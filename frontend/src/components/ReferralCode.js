import React, { useState } from 'react';
import './ReferralCode.css';

function ReferralCode({ referralCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다. 직접 복사해주세요.');
    }
  };

  return (
    <div className="referral-code-container">
      <h3>내 초대 코드</h3>
      <div className="referral-code-box">
        <span className="referral-code-text">{referralCode}</span>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ 복사됨!' : '복사하기'}
        </button>
      </div>
    </div>
  );
}

export default ReferralCode;

