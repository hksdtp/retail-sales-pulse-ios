#!/usr/bin/env node

/**
 * Script để force app sử dụng API data thay vì Firebase
 * Để test phân quyền của Phạm Thị Hương
 */

console.log('🔧 FORCING APP TO USE API DATA MODE');
console.log('='.repeat(50));

// Clear localStorage để force reload
console.log('1. 🗑️ Clearing localStorage...');
console.log('   - Removing Firebase config');
console.log('   - Removing cached tasks');
console.log('   - Removing cached users');

// Tạo script để inject vào browser console
const clearScript = `
// Clear Firebase config
localStorage.removeItem('firebaseConfig');
localStorage.removeItem('firebase_initialized');

// Clear cached data
localStorage.removeItem('rawTasks');
localStorage.removeItem('tasks');
localStorage.removeItem('filteredTasks');
localStorage.removeItem('users');
localStorage.removeItem('teams');
localStorage.removeItem('currentUser');

// Clear auto-sync data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('user_tasks_') || key.startsWith('auto_sync_')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ Cleared all localStorage data');
console.log('🔄 Please refresh the page to use API data');
`;

console.log('\n2. 📋 SCRIPT TO RUN IN BROWSER CONSOLE:');
console.log('-'.repeat(50));
console.log(clearScript);

console.log('\n3. 🧪 TESTING STEPS:');
console.log('-'.repeat(50));
console.log('1. Open browser: http://localhost:8088');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Copy and paste the script above');
console.log('5. Press Enter to execute');
console.log('6. Refresh the page (F5)');
console.log('7. Login with:');
console.log('   - Email: huong.pham@example.com');
console.log('   - Password: haininh1');
console.log('8. Check Tasks page - should see 2 tasks of team 5');
console.log('9. Check "Công việc của Nhóm" - should only see team 5 tasks');

console.log('\n4. 📊 EXPECTED RESULTS:');
console.log('-'.repeat(50));
console.log('✅ Phạm Thị Hương should see:');
console.log('   - "Khảo sát khách hàng mới - Team 5" (pending)');
console.log('   - "Báo cáo doanh số tuần - Team 5" (in_progress)');
console.log('');
console.log('❌ Phạm Thị Hương should NOT see:');
console.log('   - "Công việc của team 1 - Không được xem bởi team 5"');
console.log('   - Tasks from other teams');
console.log('');
console.log('⚠️ Admin tasks might be visible depending on isShared flag');

console.log('\n5. 🔍 DEBUG INFO:');
console.log('-'.repeat(50));
console.log('API Endpoints:');
console.log('- Users: http://localhost:3003/users');
console.log('- Tasks: http://localhost:3003/tasks');
console.log('- Health: http://localhost:3003/health');
console.log('');
console.log('User Info:');
console.log('- ID: pham_thi_huong_id');
console.log('- Role: team_leader');
console.log('- Team ID: 5');
console.log('- Location: Hà Nội');

console.log('\n✅ READY TO TEST!');
console.log('Copy the script above and run it in browser console.');
