const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG USER DATA - Kiểm tra dữ liệu user');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    const debugResult = await page.evaluate(async () => {
      console.log('🔍 Starting user data debug...');
      
      // 1. Reset system first
      if (typeof window.forceResetManhPasswordChanged === 'function') {
        const resetResult = await window.forceResetManhPasswordChanged();
        console.log('Reset result:', resetResult);
      }
      
      // 2. Check users data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const manh = users.find(u => u.name === 'Khổng Đức Mạnh');
      
      console.log('All users:', users.map(u => ({
        name: u.name,
        password_changed: u.password_changed,
        password: u.password ? '***' : 'none'
      })));
      
      console.log('Mạnh data:', manh);
      
      return {
        totalUsers: users.length,
        manhData: manh,
        allUsersPasswordChanged: users.map(u => ({
          name: u.name,
          password_changed: u.password_changed
        }))
      };
    });
    
    console.log('📊 Debug result:', JSON.stringify(debugResult, null, 2));
    
    // Clear localStorage and reload
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Try login
    console.log('\n🔑 Testing login...');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const loginResult = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const loginSuccess = !currentUrl.includes('/login');
      
      // Check auth state
      let authState = {};
      if (typeof window.debugAuthState === 'function') {
        authState = window.debugAuthState();
      }
      
      // Check current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      return {
        loginSuccess,
        currentUrl,
        authState,
        currentUser: {
          name: currentUser.name,
          password_changed: currentUser.password_changed
        }
      };
    });
    
    console.log('📊 Login result:', JSON.stringify(loginResult, null, 2));
    
    // Check if password change is required
    const passwordChangeCheck = await page.evaluate(() => {
      const hasPasswordChangeText = document.body.innerText.includes('Đổi mật khẩu');
      const passwordInputs = document.querySelectorAll('input[type="password"]').length;
      
      return {
        hasPasswordChangeText,
        passwordInputs,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('📊 Password change check:', passwordChangeCheck);
    
    if (!passwordChangeCheck.hasPasswordChangeText && passwordChangeCheck.passwordInputs === 0) {
      console.log('\n❌ PROBLEM: No password change required!');
      console.log('🔧 Trying to force password change requirement...');
      
      const forceResult = await page.evaluate(() => {
        // Force update current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.name) {
          currentUser.password_changed = false;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          // Also update users array
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.name === currentUser.name);
          if (userIndex !== -1) {
            users[userIndex].password_changed = false;
            localStorage.setItem('users', JSON.stringify(users));
          }
          
          return { forced: true, currentUser };
        }
        return { forced: false };
      });
      
      console.log('Force result:', forceResult);
      
      // Reload and check again
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const finalCheck = await page.evaluate(() => {
        const hasPasswordChangeText = document.body.innerText.includes('Đổi mật khẩu');
        const passwordInputs = document.querySelectorAll('input[type="password"]').length;
        
        let authState = {};
        if (typeof window.debugAuthState === 'function') {
          authState = window.debugAuthState();
        }
        
        return {
          hasPasswordChangeText,
          passwordInputs,
          authState,
          currentUrl: window.location.href
        };
      });
      
      console.log('📊 Final check:', JSON.stringify(finalCheck, null, 2));
    }
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
