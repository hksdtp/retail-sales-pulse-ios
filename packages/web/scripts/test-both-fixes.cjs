#!/usr/bin/env node

/**
 * Script để test cả 2 fixes:
 * 1. Session persistence - không revert về Khổng Đức Mạnh
 * 2. Phạm Thị Hương thấy được tasks của team 5
 */

console.log('🧪 TESTING BOTH FIXES');
console.log('='.repeat(60));

console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
console.log('-'.repeat(50));

console.log('\n1. 🔧 CLEAR BROWSER DATA:');
console.log('   - Open DevTools (F12)');
console.log('   - Go to Console tab');
console.log('   - Run this script:');
console.log(`
// Clear all localStorage
localStorage.clear();

// Clear specific auth data
localStorage.removeItem('currentUser');
localStorage.removeItem('authToken');
localStorage.removeItem('loginType');
localStorage.removeItem('firebaseConfig');
localStorage.removeItem('firebase_initialized');

// Clear cached data
['rawTasks', 'tasks', 'filteredTasks', 'users', 'teams'].forEach(key => {
  localStorage.removeItem(key);
});

console.log('✅ Cleared all data - refresh page');
`);

console.log('\n2. 🔄 REFRESH PAGE:');
console.log('   - Press F5 to refresh');
console.log('   - Should see login form');

console.log('\n3. 🔐 LOGIN AS PHẠM THỊ HƯƠNG:');
console.log('   - Email: huong.pham@example.com');
console.log('   - Password: haininh1');
console.log('   - Click Login');

console.log('\n4. ✅ VERIFY LOGIN SUCCESS:');
console.log('   - Should see "Phạm Thị Hương" in header/user name');
console.log('   - Should NOT see "Khổng Đức Mạnh"');

console.log('\n5. 📋 CHECK TASKS:');
console.log('   - Go to Tasks page');
console.log('   - Should see 2 tasks:');
console.log('     * "Khảo sát khách hàng mới - Team 5"');
console.log('     * "Báo cáo doanh số tuần - Team 5"');
console.log('   - Should NOT see:');
console.log('     * "Công việc của team 1 - Không được xem bởi team 5"');

console.log('\n6. 🔄 TEST SESSION PERSISTENCE:');
console.log('   - Press F5 to refresh page');
console.log('   - Should STILL see "Phạm Thị Hương"');
console.log('   - Should NOT revert to "Khổng Đức Mạnh"');

console.log('\n7. 📊 VERIFY CONSOLE LOGS:');
console.log('   - Check console for debug logs:');
console.log('     * [TEAM_LEADER_DEBUG] messages');
console.log('     * [AuthContext] session restore messages');
console.log('     * Should show team 5 filtering working');

console.log('\n🎯 EXPECTED RESULTS:');
console.log('-'.repeat(50));
console.log('✅ FIX 1: Session Persistence');
console.log('   - Login as Phạm Thị Hương');
console.log('   - Refresh page');
console.log('   - Still shows Phạm Thị Hương (NOT Khổng Đức Mạnh)');
console.log('');
console.log('✅ FIX 2: Task Visibility');
console.log('   - Phạm Thị Hương sees 2 tasks of team 5');
console.log('   - Does NOT see tasks of other teams');
console.log('   - Team leader permissions work correctly');

console.log('\n🔍 DEBUG CONSOLE SCRIPT:');
console.log('-'.repeat(50));
console.log('Run this in console to monitor localStorage:');
console.log(`
// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'currentUser' || key === 'authToken') {
    console.log('📝 localStorage.setItem:', key, value?.substring(0, 100));
  }
  return originalSetItem.apply(this, arguments);
};

const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
  const value = originalGetItem.apply(this, arguments);
  if (key === 'currentUser' || key === 'authToken') {
    console.log('📖 localStorage.getItem:', key, value?.substring(0, 100));
  }
  return value;
};

console.log('✅ localStorage monitoring enabled');
`);

console.log('\n🚨 IF ISSUES PERSIST:');
console.log('-'.repeat(50));
console.log('1. Check console for error messages');
console.log('2. Verify API server is running (http://localhost:3003)');
console.log('3. Check if test environment logic is still active');
console.log('4. Verify team leader permissions in TaskDataProvider');

console.log('\n📊 API VERIFICATION:');
console.log('-'.repeat(50));
console.log('Verify API data is correct:');

async function verifyAPIData() {
  try {
    console.log('\n🔍 Checking API data...');
    
    const [usersRes, teamsRes, tasksRes] = await Promise.all([
      fetch('http://localhost:3003/users'),
      fetch('http://localhost:3003/teams'),
      fetch('http://localhost:3003/tasks')
    ]);

    const [users, teams, tasks] = await Promise.all([
      usersRes.json(),
      teamsRes.json(),
      tasksRes.json()
    ]);

    console.log(`👥 Users: ${users.data?.length || 0}`);
    const huong = users.data?.find(u => u.name.includes('Phạm Thị Hương'));
    if (huong) {
      console.log(`✅ Phạm Thị Hương: ID=${huong.id}, Role=${huong.role}, Team=${huong.team_id}`);
    } else {
      console.log('❌ Phạm Thị Hương not found in API');
    }

    console.log(`🏢 Teams: ${teams.data?.length || 0}`);
    const team5 = teams.data?.find(t => t.id === '5');
    if (team5) {
      console.log(`✅ Team 5: Name=${team5.name}, Leader=${team5.leader_id}`);
    } else {
      console.log('❌ Team 5 not found in API');
    }

    console.log(`📋 Tasks: ${tasks.data?.length || 0}`);
    const team5Tasks = tasks.data?.filter(t => t.teamId === '5') || [];
    console.log(`✅ Team 5 tasks: ${team5Tasks.length}`);
    team5Tasks.forEach(task => {
      console.log(`   - ${task.title}`);
    });

    // Test login
    const loginRes = await fetch('http://localhost:3003/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'huong.pham@example.com',
        password: 'haininh1'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginData.success) {
      console.log(`✅ API Login: ${loginData.data.user.name} (${loginData.data.loginType})`);
    } else {
      console.log(`❌ API Login failed: ${loginData.error}`);
    }

  } catch (error) {
    console.error('❌ API verification failed:', error.message);
  }
}

verifyAPIData().catch(console.error);

console.log('\n✅ READY TO TEST!');
console.log('Follow the manual testing steps above.');
