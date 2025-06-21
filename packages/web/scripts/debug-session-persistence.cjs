#!/usr/bin/env node

/**
 * Script để debug vấn đề session persistence
 * Tại sao refresh trang lại trở về Khổng Đức Mạnh thay vì Phạm Thị Hương
 */

console.log('🔍 DEBUGGING SESSION PERSISTENCE ISSUE');
console.log('='.repeat(60));

console.log('\n📋 VẤN ĐỀ:');
console.log('- Login với Phạm Thị Hương thành công');
console.log('- Refresh trang → trở về Khổng Đức Mạnh');
console.log('- Session không persist đúng user');

console.log('\n🔍 NGUYÊN NHÂN CÓ THỂ:');
console.log('1. localStorage đang cache user cũ (Khổng Đức Mạnh)');
console.log('2. AuthContext load user từ localStorage thay vì login session');
console.log('3. Conflict giữa Firebase data và API data');
console.log('4. Login không lưu đúng user vào localStorage');
console.log('5. Mock data override API data');

console.log('\n🧪 DEBUG SCRIPT CHO BROWSER CONSOLE:');
console.log('-'.repeat(50));

const debugScript = `
console.log('🔍 DEBUGGING SESSION PERSISTENCE');
console.log('='.repeat(50));

// 1. Kiểm tra localStorage hiện tại
console.log('\\n1. 📦 LOCALSTORAGE HIỆN TẠI:');
console.log('currentUser:', localStorage.getItem('currentUser'));
console.log('authToken:', localStorage.getItem('authToken'));
console.log('loginType:', localStorage.getItem('loginType'));

// Parse currentUser để xem chi tiết
try {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  console.log('Current User Details:', {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    team_id: currentUser.team_id
  });
} catch (e) {
  console.log('No valid currentUser in localStorage');
}

// 2. Kiểm tra tất cả localStorage keys
console.log('\\n2. 🗂️ TẤT CẢ LOCALSTORAGE KEYS:');
Object.keys(localStorage).forEach(key => {
  console.log(\`\${key}: \${localStorage.getItem(key)?.substring(0, 100)}...\`);
});

// 3. Clear tất cả auth data
console.log('\\n3. 🧹 CLEARING ALL AUTH DATA:');
localStorage.removeItem('currentUser');
localStorage.removeItem('authToken');
localStorage.removeItem('loginType');

// Clear Firebase data
localStorage.removeItem('firebaseConfig');
localStorage.removeItem('firebase_initialized');

// Clear cached data
localStorage.removeItem('rawTasks');
localStorage.removeItem('tasks');
localStorage.removeItem('filteredTasks');
localStorage.removeItem('users');
localStorage.removeItem('teams');

// Clear auto-sync data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('user_tasks_') || key.startsWith('auto_sync_')) {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

console.log('✅ Cleared all auth and cached data');

// 4. Force reload để test
console.log('\\n4. 🔄 FORCE RELOAD TEST:');
console.log('Reloading page in 3 seconds...');
setTimeout(() => {
  window.location.reload();
}, 3000);
`;

console.log(debugScript);

console.log('\n🔧 MANUAL FIX STEPS:');
console.log('-'.repeat(50));
console.log('1. Mở browser: http://localhost:8088');
console.log('2. Mở DevTools Console (F12)');
console.log('3. Copy và paste script ở trên');
console.log('4. Chờ page reload tự động');
console.log('5. Login lại với Phạm Thị Hương:');
console.log('   - Email: huong.pham@example.com');
console.log('   - Password: haininh1');
console.log('6. Test refresh page nhiều lần');

console.log('\n🎯 EXPECTED BEHAVIOR AFTER FIX:');
console.log('-'.repeat(50));
console.log('✅ Login với Phạm Thị Hương → localStorage lưu đúng user');
console.log('✅ Refresh page → vẫn là Phạm Thị Hương');
console.log('✅ Không bị revert về Khổng Đức Mạnh');
console.log('✅ Session persistence hoạt động đúng');

console.log('\n🔍 ADDITIONAL DEBUG SCRIPT:');
console.log('-'.repeat(50));

const additionalDebugScript = `
// Script để monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  console.log('📝 localStorage.setItem:', key, value?.substring(0, 100));
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
console.log('Now login and watch the console for localStorage changes');
`;

console.log(additionalDebugScript);

console.log('\n📊 API DATA VERIFICATION:');
console.log('-'.repeat(50));
console.log('Verify API has correct data:');
console.log('curl -s "http://localhost:3003/users" | jq \'.data[] | select(.name | contains("Phạm Thị Hương"))\'');
console.log('curl -s "http://localhost:3003/auth/login" -X POST -H "Content-Type: application/json" -d \'{"email":"huong.pham@example.com","password":"haininh1"}\'');

console.log('\n✅ DEBUG SCRIPT READY!');
console.log('Copy the scripts above and run them in browser console.');
