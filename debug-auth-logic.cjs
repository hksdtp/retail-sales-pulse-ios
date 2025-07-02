const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG AUTHENTICATION LOGIC');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n📋 Điều hướng đến trang login');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    // Debug toàn bộ logic authentication
    const debugResult = await page.evaluate(async () => {
      console.log('🔍 Starting comprehensive debug...');
      
      // 1. Check localStorage data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('📊 LocalStorage Data:');
      console.log('Users count:', users.length);
      console.log('Current user:', currentUser);
      
      // 2. Find Khổng Đức Mạnh
      const manh = users.find(u => u.name === 'Khổng Đức Mạnh');
      console.log('Khổng Đức Mạnh data:', manh);
      
      // 3. Check auth state
      if (typeof window.debugAuthState === 'function') {
        const authState = window.debugAuthState();
        console.log('Auth state:', authState);
      }
      
      // 4. Force reset Mạnh
      if (typeof window.forceResetManhPasswordChanged === 'function') {
        console.log('🔧 Force resetting Mạnh...');
        const resetResult = await window.forceResetManhPasswordChanged();
        console.log('Reset result:', resetResult);
      }
      
      // 5. Update all users to password_changed: false
      if (typeof window.updateAllUsersPasswordChangedToFalse === 'function') {
        console.log('🔧 Updating all users...');
        const updateResult = await window.updateAllUsersPasswordChangedToFalse();
        console.log('Update result:', updateResult);
      }
      
      // 6. Check data after reset
      const usersAfter = JSON.parse(localStorage.getItem('users') || '[]');
      const manhAfter = usersAfter.find(u => u.name === 'Khổng Đức Mạnh');
      console.log('Mạnh after reset:', manhAfter);
      
      return {
        usersBefore: users.length,
        manhBefore: manh,
        manhAfter: manhAfter,
        resetCompleted: true
      };
    });
    
    console.log('📊 Debug results:', JSON.stringify(debugResult, null, 2));
    
    // Clear localStorage và reload
    console.log('\n🔄 Clearing localStorage and reloading...');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test đăng nhập sau khi clear
    console.log('\n📋 Test đăng nhập sau khi clear localStorage');
    
    const loginTest = await page.evaluate(() => {
      // Check if login page loaded properly
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');
      
      return {
        hasPasswordInput: !!passwordInput,
        hasSubmitButton: !!submitButton,
        currentUrl: window.location.href
      };
    });
    
    console.log('Login page status:', loginTest);
    
    if (loginTest.hasPasswordInput) {
      console.log('✅ Attempting login...');
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const afterLoginUrl = page.url();
      console.log('📍 URL after login:', afterLoginUrl);
      
      // Check if password change is required
      const passwordChangeCheck = await page.evaluate(() => {
        const hasPasswordChangeText = document.body.innerText.includes('Đổi mật khẩu');
        const hasPasswordChangeForm = !!document.querySelector('form');
        const passwordInputs = document.querySelectorAll('input[type="password"]').length;
        
        // Check auth state
        let authState = {};
        if (typeof window.debugAuthState === 'function') {
          authState = window.debugAuthState();
        }
        
        return {
          hasPasswordChangeText,
          hasPasswordChangeForm,
          passwordInputs,
          authState,
          currentUrl: window.location.href,
          bodyText: document.body.innerText.substring(0, 500)
        };
      });
      
      console.log('📊 Password change check:', JSON.stringify(passwordChangeCheck, null, 2));
      
      if (passwordChangeCheck.hasPasswordChangeText || passwordChangeCheck.passwordInputs >= 2) {
        console.log('✅ Password change is required - GOOD!');
      } else {
        console.log('❌ Password change is NOT required - PROBLEM!');
        
        // Try to force the issue
        console.log('🔧 Trying to force password change requirement...');
        
        const forceResult = await page.evaluate(async () => {
          // Force reset current user
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.name) {
            currentUser.password_changed = false;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Try to trigger auth state update
            if (typeof window.debugAuthState === 'function') {
              return window.debugAuthState();
            }
          }
          return { forced: true };
        });
        
        console.log('Force result:', forceResult);
        
        // Reload page
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const finalCheck = await page.evaluate(() => {
          return {
            currentUrl: window.location.href,
            hasPasswordChangeText: document.body.innerText.includes('Đổi mật khẩu'),
            passwordInputs: document.querySelectorAll('input[type="password"]').length
          };
        });
        
        console.log('📊 Final check after force:', finalCheck);
      }
    }
    
    // Đợi để quan sát
    console.log('\n⏳ Đợi 15 giây để quan sát...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Debug hoàn thành');
  }
})();
