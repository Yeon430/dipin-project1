/**
 * Step 1 테스트: 초대 코드 생성 로직 테스트
 */
const User = require('./models/user');

async function testStep1() {
  console.log('🧪 Step 1 테스트 시작\n');

  try {
    // 테스트 1: 사용자 생성 및 초대 코드 자동 생성
    console.log('1️⃣ 사용자 생성 (초대 코드 자동 생성)');
    const user1 = await User.create({
      email: 'alice@example.com',
      name: '앨리스'
    });
    console.log(`   ✅ 생성됨: ${user1.name} (${user1.email})`);
    console.log(`   📝 초대 코드: ${user1.referral_code}`);
    console.log(`   💰 포인트: ${user1.points}\n`);

    // 테스트 2: 여러 사용자 생성하여 초대 코드 중복 방지 확인
    console.log('2️⃣ 여러 사용자 생성 (고유 초대 코드 확인)');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        email: `user${i}@example.com`,
        name: `사용자${i}`
      });
      users.push(user);
      console.log(`   - ${user.name}: ${user.referral_code}`);
    }

    // 초대 코드 중복 확인
    const codes = users.map(u => u.referral_code);
    const uniqueCodes = new Set(codes);
    console.log(`\n   ✅ 총 ${users.length}명 생성, 고유 코드 ${uniqueCodes.size}개`);
    if (codes.length === uniqueCodes.size) {
      console.log('   ✅ 모든 초대 코드가 고유합니다!\n');
    } else {
      console.log('   ⚠️ 중복된 코드가 있습니다!\n');
    }

    // 테스트 3: 초대 코드로 사용자 조회
    console.log('3️⃣ 초대 코드로 사용자 조회');
    User.findByReferralCode(users[0].referral_code, (err, foundUser) => {
      if (err) {
        console.error('   ❌ 오류:', err.message);
      } else if (foundUser) {
        console.log(`   ✅ 찾음: ${foundUser.name} (${foundUser.referral_code})`);
      } else {
        console.log('   ❌ 사용자를 찾을 수 없습니다.');
      }
      
      console.log('\n✨ Step 1 테스트 완료!\n');
      
      // DB 연결 종료
      User.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
    User.close();
    process.exit(1);
  }
}

testStep1();

