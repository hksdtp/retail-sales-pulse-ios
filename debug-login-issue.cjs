const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG LOGIN ISSUE');
  console.log('='.repeat(60));
  console.log('📋 Tìm hiểu tại sao users không đăng nhập được với 123456');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('MockAuth') || text.includes('Login') || text.includes('Password') || 
        text.includes('password') || text.includes('user') || text.includes('auth')) {
      consoleLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
    }
  });
  
  try {
    console.log('\n🔍 STEP 1: Navigate to login page');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('\n🔍 STEP 2: Check available users');
    const availableUsers = await page.evaluate(() => {
      // Find all user elements
      const userElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('@') && (
          text.includes('Khổng') || text.includes('Lương') || 
          text.includes('Nguyễn') || text.includes('Lê') || text.includes('Quản')
        );
      });
      
      return userElements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent?.substring(0, 100),
        isClickable: ['BUTTON', 'DIV', 'A'].includes(el.tagName)
      }));
    });
    
    console.log(`📊 Found ${availableUsers.length} user elements:`);
    availableUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.tagName} - ${user.textContent}`);
    });
    
    console.log('\n🔍 STEP 3: Try to login with Khổng Đức Mạnh');
    
    // Try to select Khổng Đức Mạnh
    const userSelected = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('manh.khong@example.com') || text.includes('Khổng Đức Mạnh');
      });
      
      console.log('🔍 Found elements for Khổng Đức Mạnh:', elements.length);
      
      if (elements.length > 0) {
        const element = elements[0];
        console.log('🔍 Clicking element:', element.tagName, element.className);
        element.click();
        return true;
      }
      return false;
    });
    
    console.log(`User selected: ${userSelected}`);
    
    if (userSelected) {
      await page.waitForTimeout(2000);
      
      console.log('\n🔍 STEP 4: Enter password 123456');
      await page.fill('input[type="password"]', '123456');
      await page.waitForTimeout(1000);
      
      console.log('\n🔍 STEP 5: Submit login form');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      console.log('\n🔍 STEP 6: Check login result');
      const loginResult = await page.evaluate(() => {
        const currentUrl = window.location.href;
        const loginSuccess = !currentUrl.includes('/login');
        
        // Check for any error messages
        const errorElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('sai') || text.includes('error') || text.includes('không đúng') ||
                 text.includes('thất bại') || text.includes('invalid');
        });
        
        // Check current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        return {
          loginSuccess,
          currentUrl,
          errorMessages: errorElements.map(el => el.textContent?.trim()).slice(0, 5),
          currentUser: {
            name: currentUser.name,
            email: currentUser.email,
            password_changed: currentUser.password_changed
          },
          hasPasswordChangeModal: document.body.innerText.includes('Đổi mật khẩu') ||
                                  document.body.innerText.includes('Change Password')
        };
      });
      
      console.log('\n📊 LOGIN RESULT:');
      console.log(`✅ Login success: ${loginResult.loginSuccess}`);
      console.log(`🌐 Current URL: ${loginResult.currentUrl}`);
      console.log(`👤 Current user: ${loginResult.currentUser.name || 'None'}`);
      console.log(`🔑 Password changed: ${loginResult.currentUser.password_changed}`);
      console.log(`🔄 Has password change modal: ${loginResult.hasPasswordChangeModal}`);
      
      if (loginResult.errorMessages.length > 0) {
        console.log(`❌ Error messages:`);
        loginResult.errorMessages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg}`);
        });
      }
    } else {
      console.log('❌ Could not select user');
    }
    
    console.log('\n📋 CONSOLE LOGS (Last 20):');
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🔍 ANALYSIS:');
    
    if (consoleLogs.some(log => log.includes('password_changed') && log.includes('true'))) {
      console.log('⚠️ ISSUE: User still has password_changed: true');
    }
    
    if (consoleLogs.some(log => log.includes('stored password') || log.includes('custom password'))) {
      console.log('⚠️ ISSUE: User has stored custom password');
    }
    
    if (consoleLogs.some(log => log.includes('Invalid password'))) {
      console.log('⚠️ ISSUE: Password validation failed');
    }
    
    if (consoleLogs.some(log => log.includes('MockAuth'))) {
      console.log('✅ MockAuth is being used');
    } else {
      console.log('⚠️ MockAuth might not be active');
    }
    
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Check if users have stored passwords in localStorage');
    console.log('2. Verify password_changed flags are actually false');
    console.log('3. Check if there are any password validation overrides');
    console.log('4. Ensure MockAuth is being used instead of API');
    
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
