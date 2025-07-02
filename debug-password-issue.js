// Debug script để kiểm tra vấn đề mật khẩu
// Ninh ơi - Script này sẽ giúp chúng ta tìm ra vấn đề với password

console.log('🔍 DEBUGGING PASSWORD ISSUE');
console.log('============================');

// Kiểm tra localStorage
console.log('\n📦 1. Kiểm tra localStorage:');
const allKeys = Object.keys(localStorage);
const passwordKeys = allKeys.filter(key => key.startsWith('user_password_'));
const userKeys = allKeys.filter(key => key.includes('User') || key.includes('user'));

console.log('🔑 Password keys found:', passwordKeys);
console.log('👤 User-related keys:', userKeys);

// Hiển thị tất cả mật khẩu đã lưu
passwordKeys.forEach(key => {
  const userId = key.replace('user_password_', '');
  const password = localStorage.getItem(key);
  console.log(`   User ${userId}: ${password ? '***' + password.length + ' chars' : 'null'}`);
});

// Kiểm tra currentUser
console.log('\n👤 2. Kiểm tra currentUser:');
const currentUserStr = localStorage.getItem('currentUser');
if (currentUserStr) {
  try {
    const currentUser = JSON.parse(currentUserStr);
    console.log('Current user:', {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      password_changed: currentUser.password_changed,
      role: currentUser.role
    });
    
    // Kiểm tra mật khẩu của user hiện tại
    const userPassword = localStorage.getItem(`user_password_${currentUser.id}`);
    console.log(`Password for current user (${currentUser.id}):`, userPassword ? '***' + userPassword.length + ' chars' : 'NOT SET');
  } catch (e) {
    console.error('Error parsing currentUser:', e);
  }
} else {
  console.log('No currentUser found in localStorage');
}

// Kiểm tra mockUsers
console.log('\n🎭 3. Kiểm tra mockUsers:');
const mockUsersStr = localStorage.getItem('mockUsers');
if (mockUsersStr) {
  try {
    const mockUsers = JSON.parse(mockUsersStr);
    console.log('MockUsers count:', mockUsers.length);
    mockUsers.forEach(user => {
      console.log(`   ${user.name} (${user.id}): password_changed = ${user.password_changed}`);
    });
  } catch (e) {
    console.error('Error parsing mockUsers:', e);
  }
} else {
  console.log('No mockUsers found in localStorage');
}

// Test function để kiểm tra login
async function testLogin(email, password, description) {
  console.log(`\n🧪 Testing login: ${description}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${'*'.repeat(password.length)}`);
  
  try {
    // Import mockLogin function (cần chạy trong browser console)
    if (typeof window !== 'undefined' && window.mockLogin) {
      const result = await window.mockLogin(email, password);
      console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
      return result;
    } else {
      console.log('   ⚠️ mockLogin not available (run in browser console)');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
}

// Hàm để reset password (emergency fix)
function resetUserPassword(userId, newPassword) {
  console.log(`\n🔧 EMERGENCY: Resetting password for user ${userId}`);
  
  // Lưu mật khẩu mới
  localStorage.setItem(`user_password_${userId}`, newPassword);
  
  // Cập nhật currentUser nếu đó là user hiện tại
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        currentUser.password_changed = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('✅ Updated currentUser password_changed flag');
      }
    } catch (e) {
      console.error('Error updating currentUser:', e);
    }
  }
  
  // Cập nhật mockUsers
  const mockUsersStr = localStorage.getItem('mockUsers');
  if (mockUsersStr) {
    try {
      const mockUsers = JSON.parse(mockUsersStr);
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].password_changed = true;
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        console.log('✅ Updated mockUsers password_changed flag');
      }
    } catch (e) {
      console.error('Error updating mockUsers:', e);
    }
  }
  
  console.log(`✅ Password reset completed for user ${userId}`);
}

// Hàm để clear tất cả password data (nuclear option)
function clearAllPasswordData() {
  console.log('\n💥 NUCLEAR OPTION: Clearing all password data');
  
  const passwordKeys = Object.keys(localStorage).filter(key => key.startsWith('user_password_'));
  passwordKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   Removed: ${key}`);
  });
  
  console.log('✅ All password data cleared');
}

// Export functions for browser console use
if (typeof window !== 'undefined') {
  window.debugPassword = {
    testLogin,
    resetUserPassword,
    clearAllPasswordData
  };
  console.log('\n🛠️ Functions available in browser console:');
  console.log('   debugPassword.testLogin(email, password, description)');
  console.log('   debugPassword.resetUserPassword(userId, newPassword)');
  console.log('   debugPassword.clearAllPasswordData()');
}

console.log('\n✅ Debug completed. Check the output above for issues.');
