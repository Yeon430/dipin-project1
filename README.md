# 친구 초대 시스템 MVP

초대한 사람과 받은 사람 모두에게 5,000 포인트를 지급하는 친구 초대 기능

## 기술 스택

- Backend: Node.js + Express + SQLite
- Frontend: React
- Port: Backend 3001, Frontend 3000

## 설치 및 실행

### Backend

```bash
cd backend
npm install
npm run init-db    # DB 초기화
npm start          # 서버 실행 (http://localhost:3001)
```

### Frontend

```bash
cd frontend
npm install
npm start          # 개발 서버 실행 (http://localhost:3000)
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

## Step 3 완료 ✅

### 초대 대시보드 및 공유 UI

- 초대 코드 확인 및 복사 기능
- 초대 통계 표시 (친구 수, 획득 포인트)
- 초대한 친구 목록 조회
- React 컴포넌트 기반 UI

### 주요 컴포넌트

- `ReferralCode` - 초대 코드 표시 및 복사
- `ReferralDashboard` - 대시보드 (통계, 목록)
- API 서비스 레이어로 백엔드 연동

## Step 4 완료 ✅

### 리팩토링 및 설계 개선 (Evaluation 반영)

- **데이터 일관성 보장 (Transaction)**: 
  - `ReferralService`에서 SQLite 트랜잭션을 도입하여 `사용자 생성 - 포인트 지급 - 추천 관계 기록`을 하나의 원자적 단위로 묶었습니다.
  - 도중에 실패할 경우 전체 롤백되어 데이터 무결성을 보장합니다.
- **예외 처리 및 보안 강화**:
  - 본인 초대 코드 사용 방지 로직 추가
  - 중복 요청 및 이메일 중복에 대한 트랜잭션 내 검증 강화
  - 보안을 위해 내부 에러 메시지를 상수화된 메시지로 래핑하여 노출 최소화
- **유지보수성 및 확장성**:
  - `config/constants.js`를 통한 설정 중앙화 (포인트, 메시지, HTTP 상태 코드)
  - `ResponseHelper`, `ValidationHelper` 도입으로 코드 재사용성 극대화

### 트러블슈팅 및 설계 의도

1. **왜 트랜잭션이 필요한가?**
   - 단순히 `await`를 순서대로 호출하면, 사용자 생성 후 포인트 지급 중에 에러가 났을 때 포인트는 안 들어갔는데 가입은 되어버리는 불일치가 발생합니다. 이를 방지하기 위해 명시적인 `BEGIN/COMMIT/ROLLBACK`을 사용했습니다.
2. **효율성 고려**:
   - 한 번의 DB 커넥션 내에서 모든 검증과 삽입을 처리하여 네트워크 및 리소스 오버헤드를 최소화했습니다.
3. **확장성**:
   - 향후 '추천 보상 2배 이벤트' 등이 발생해도 `REFERRAL_REWARD_POINTS` 상수 하나만 변경하면 모든 로직에 즉시 반영됩니다.

### 주요 파일 구조 (Refactored)

- `backend/services/referralService.js`: 핵심 비즈니스 로직 (Transaction 관리)
- `backend/utils/`: 공통 유틸리티 (응답 포맷, 유효성 검사)
- `backend/config/constants.js`: 시스템 전반의 정책 및 설정 상수

