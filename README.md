# 친구 초대 시스템 MVP

초대한 사람과 받은 사람 모두에게 5,000 포인트를 지급하는 친구 초대 기능

## 기술 스택

- Backend: Node.js + Express + SQLite
- Frontend: React (예정)
- Port: Backend 3001, Frontend 3000

## 설치 및 실행

```bash
cd backend
npm install
npm run init-db    # DB 초기화
npm start          # 서버 실행 (http://localhost:3001)
```

## Step 1 완료 ✅

### DB 스키마

- **users**: 사용자 정보, 고유 초대 코드, 포인트
- **referrals**: 초대 관계 기록 (inviter_id, invitee_id)

### 초대 코드 생성

- 8자리 영문 대문자 + 숫자 (예: `A1B2C3D4`)
- 가입 시 자동 생성, DB 중복 체크로 고유성 보장

### API

- `POST /api/users` - 사용자 생성 (초대 코드 자동 생성)
- `GET /api/users/:id` - 사용자 조회
- `GET /api/users/referral-code/:code` - 초대 코드로 사용자 조회

### 테스트

```bash
cd backend
node test-step1.js
```

## Step 2 완료 ✅

### 추천인 등록 및 포인트 지급

- 추천인 코드로 가입 시 양측에게 5,000 포인트 지급
- 포인트 상수 분리 (`config/constants.js`)
- 유효성 검증 (유효하지 않은 코드, 이메일 중복)

### API

- `POST /api/users/register` - 추천인 코드로 가입
- `GET /api/users/:id/referrals` - 내가 초대한 사람 목록
- `GET /api/users/:id/referral-stats` - 초대 통계

### 테스트

```bash
cd backend
node test-step2.js
```

## 다음 단계

- Step 3: 초대 대시보드 및 공유 UI
- Step 4: 리팩토링 (코드 중복 제거, 상수 분리)
