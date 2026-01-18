/**
 * Step 2 테스트: 추천인 등록 API 및 포인트 지급 로직 테스트
 */
const ReferralService = require('./services/referralService');
const User = require('./models/user');
const Referral = require('./models/referral');
const { REFERRAL_REWARD_POINTS } = require('./config/constants');

async function testStep2() {
  console.log('🧪 Step 2 테스트 시작\n');

  try {
    // 테스트 1: 추천인 코드 없이 가입
    console.log('1️⃣ 추천인 코드 없이 가입');
    const user1 = await ReferralService.registerWithReferral({
      email: 'alice@example.com',
      name: '앨리스'
    });
    console.log(`   ✅ 가입 성공: ${user1.user.name} (${user1.user.referral_code})`);
    console.log(`   💰 포인트: ${user1.user.points}`);
    console.log(`   📝 추천인 적용: ${user1.referralApplied}\n`);

    // 테스트 2: 추천인 코드로 가입 (앨리스가 밥 초대)
    console.log('2️⃣ 추천인 코드로 가입 (포인트 지급 확인)');
    const user2 = await ReferralService.registerWithReferral({
      email: 'bob@example.com',
      name: '밥'
    }, user1.user.referral_code);
    
    console.log(`   ✅ 가입 성공: ${user2.user.name} (${user2.user.referral_code})`);
    console.log(`   💰 피초대자 포인트: ${user2.user.points} (기대값: ${REFERRAL_REWARD_POINTS})`);
    console.log(`   📝 추천인 적용: ${user2.referralApplied}`);
    console.log(`   👤 초대자: ${user2.inviter.name}`);
    console.log(`   🎁 지급 포인트: ${user2.pointsGiven}\n`);

    // 초대자 포인트 확인
    User.findById(user1.user.id, (err, alice) => {
      console.log(`   💰 초대자(앨리스) 포인트: ${alice.points} (기대값: ${REFERRAL_REWARD_POINTS})\n`);

      // 테스트 3: 유효하지 않은 추천인 코드
      console.log('3️⃣ 유효하지 않은 추천인 코드로 가입 시도');
      ReferralService.registerWithReferral({
        email: 'charlie@example.com',
        name: '찰리'
      }, 'INVALID123')
        .then(() => {
          console.log('   ❌ 오류: 예외가 발생해야 합니다!\n');
        })
        .catch((error) => {
          console.log(`   ✅ 예상대로 오류 발생: ${error.message}\n`);

          // 테스트 4: 중복 초대 방지 (이미 초대받은 사용자는 다시 초대 불가)
          console.log('4️⃣ 중복 초대 방지 확인');
          ReferralService.registerWithReferral({
            email: 'dave@example.com',
            name: '데이브'
          }, user1.user.referral_code)
            .then(async (result) => {
              console.log(`   ✅ 가입 성공: ${result.user.name}`);
              
              // 데이브가 다시 앨리스 코드로 가입 시도 (이미 가입했으므로 이메일 중복)
              ReferralService.registerWithReferral({
                email: 'dave@example.com',
                name: '데이브2'
              }, user1.user.referral_code)
                .then(() => {
                  console.log('   ❌ 오류: 이메일 중복 오류가 발생해야 합니다!\n');
                })
                .catch((error) => {
                  console.log(`   ✅ 예상대로 오류 발생: ${error.message || '이메일 중복'}\n`);

                  // 테스트 5: 초대 통계 확인
                  console.log('5️⃣ 초대 통계 확인');
                  Referral.findByInviterId(user1.user.id, (err, referrals) => {
                    console.log(`   👥 앨리스가 초대한 사람 수: ${referrals.length}명`);
                    referrals.forEach((r, i) => {
                      console.log(`   ${i + 1}. ${r.invitee_name} (${r.points_given} 포인트 지급)`);
                    });

                    console.log('\n✨ Step 2 테스트 완료!\n');
                    
                    // DB 연결 종료
                    User.close();
                    Referral.close();
                    process.exit(0);
                  });
                });
            })
            .catch((error) => {
              console.error('   ❌ 테스트 오류:', error.message);
              User.close();
              Referral.close();
              process.exit(1);
            });
        });
    });

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
    User.close();
    Referral.close();
    process.exit(1);
  }
}

testStep2();

