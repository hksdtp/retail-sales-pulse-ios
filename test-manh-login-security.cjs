const { chromium } = require('playwright');

(async () => {
  console.log('🔐 TEST KHỔNG ĐỨC MẠNH LOGIN SECURITY');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra chi tiết logic đăng nhập của Khổng Đức Mạnh');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test cases cho Khổng Đức Mạnh
  const testPasswords = [
    { password: '123456', expected: 'should work', description: 'Mật khẩu mặc định đúng' },
    { password: '123457', expected: 'should fail', description: 'Mật khẩu sai (123457)' },
    { password: 'wrong', expected: 'should fail', description: 'Mật khẩu sai (wrong)' },
    { password: '', expected: 'should fail', description: 'Mật khẩu trống' },
    { password: 'haininh1', expected: 'should fail', description: 'Admin password (vulnerability test)' },
    { password: 'admin', expected: 'should fail', description: 'Mật khẩu sai (admin)' },
    { password: 'password', expected: 'should fail', description: 'Mật khẩu sai (password)' }
  ];
  
  const testResults = [];
  
  try {
    for (const testCase of testPasswords) {
      console.log(`\n🧪 TEST: ${testCase.description}`);
      console.log(`   Password: "${testCase.password}"`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log('-'.repeat(60));
      
      // Navigate to login page
      await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Clear any existing session
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.waitForTimeout(1000);
      
      // Enter password (Khổng Đức Mạnh should be pre-selected)
      await page.fill('input[type="password"]', testCase.password);
      await page.waitForTimeout(500);
      
      // Capture console logs for debugging
      const consoleLogs = [];
      page.on('console', msg => {
        if (msg.text().includes('MockAuth') || msg.text().includes('Login') || msg.text().includes('Password')) {
          consoleLogs.push(msg.text());
        }
      });
      
      // Submit login
      await page.click('button[type="submit"]');
      await page.waitForTimeout(4000);
      
      // Check result
      const result = await page.evaluate(() => {
        const currentUrl = window.location.href;
        const loginSuccess = !currentUrl.includes('/login');
        
        // Check for error messages
        const errorElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('sai') || text.includes('error') || text.includes('invalid') || 
                 text.includes('wrong') || text.includes('không đúng') || text.includes('thất bại') ||
                 text.includes('incorrect') || text.includes('failed');
        });
        
        // Check for success indicators
        const successElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('thành công') || text.includes('success') || text.includes('welcome');
        });
        
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        return {
          loginSuccess,
          currentUrl,
          hasErrorMessage: errorElements.length > 0,
          hasSuccessMessage: successElements.length > 0,
          errorTexts: errorElements.map(el => el.textContent?.trim()).slice(0, 3),
          successTexts: successElements.map(el => el.textContent?.trim()).slice(0, 3),
          currentUser: {
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
          }
        };
      });
      
      // Analyze result
      const isExpectedToWork = testCase.expected === 'should work';
      const actuallyWorked = result.loginSuccess;
      const testPassed = (isExpectedToWork && actuallyWorked) || (!isExpectedToWork && !actuallyWorked);
      
      const testResult = {
        password: testCase.password,
        description: testCase.description,
        expected: testCase.expected,
        actuallyWorked,
        testPassed,
        hasErrorMessage: result.hasErrorMessage,
        hasSuccessMessage: result.hasSuccessMessage,
        currentUrl: result.currentUrl,
        currentUser: result.currentUser,
        consoleLogs: consoleLogs.slice(-10) // Last 10 logs
      };
      
      testResults.push(testResult);
      
      // Log result
      if (testPassed) {
        console.log(`✅ PASS: ${testCase.description}`);
      } else {
        console.log(`❌ FAIL: ${testCase.description}`);
        if (isExpectedToWork && !actuallyWorked) {
          console.log(`   Expected login to work but it failed`);
        } else if (!isExpectedToWork && actuallyWorked) {
          console.log(`   🚨 SECURITY ISSUE: Expected login to fail but it succeeded!`);
        }
      }
      
      console.log(`   Login success: ${actuallyWorked}`);
      console.log(`   Has error message: ${result.hasErrorMessage}`);
      console.log(`   Current URL: ${result.currentUrl}`);
      
      if (result.currentUser.name) {
        console.log(`   Logged in as: ${result.currentUser.name} (${result.currentUser.role})`);
      }
      
      // Show recent console logs
      if (consoleLogs.length > 0) {
        console.log(`   Recent logs:`);
        consoleLogs.slice(-3).forEach(log => {
          console.log(`     ${log}`);
        });
      }
      
      // If login succeeded, logout for next test
      if (actuallyWorked) {
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      }
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
  } finally {
    // ==================== DETAILED SECURITY REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('🔐 BÁO CÁO CHI TIẾT BẢO MẬT ĐĂNG NHẬP - KHỔNG ĐỨC MẠNH');
    console.log('='.repeat(80));
    
    let vulnerabilities = [];
    let passedTests = 0;
    
    testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.description}`);
      console.log(`   Password: "${result.password}"`);
      console.log(`   Expected: ${result.expected}`);
      console.log(`   Actually worked: ${result.actuallyWorked}`);
      console.log(`   Test result: ${result.testPassed ? '✅ PASS' : '❌ FAIL'}`);
      
      if (result.testPassed) {
        passedTests++;
      } else {
        if (result.expected === 'should fail' && result.actuallyWorked) {
          vulnerabilities.push({
            password: result.password,
            description: result.description,
            issue: 'Wrong password allowed login'
          });
          console.log(`   🚨 SECURITY VULNERABILITY: Wrong password allowed login!`);
        }
      }
      
      if (!result.hasErrorMessage && !result.actuallyWorked) {
        console.log(`   ⚠️ Missing error message for failed login`);
      }
      
      if (result.hasSuccessMessage && result.actuallyWorked) {
        console.log(`   ✅ Success message shown`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TỔNG KẾT:');
    console.log(`🧪 Tổng số tests: ${testResults.length}`);
    console.log(`✅ Tests passed: ${passedTests}`);
    console.log(`❌ Tests failed: ${testResults.length - passedTests}`);
    console.log(`🚨 Security vulnerabilities: ${vulnerabilities.length}`);
    
    if (vulnerabilities.length === 0) {
      console.log('\n🎉 EXCELLENT: Không có lỗ hổng bảo mật nào được phát hiện!');
    } else {
      console.log('\n🚨 CRITICAL SECURITY ISSUES FOUND:');
      vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. Password "${vuln.password}": ${vuln.issue}`);
        console.log(`   Description: ${vuln.description}`);
      });
    }
    
    // Specific analysis for admin password
    const adminPasswordTest = testResults.find(r => r.password === 'haininh1');
    if (adminPasswordTest) {
      if (adminPasswordTest.actuallyWorked) {
        console.log('\n🚨 CRITICAL: Admin password "haininh1" allows unauthorized access!');
        console.log('   This is a major security vulnerability that must be fixed immediately.');
      } else {
        console.log('\n✅ SECURE: Admin password "haininh1" is properly blocked.');
      }
    }
    
    console.log('\n🔧 KHUYẾN NGHỊ KHẮC PHỤC:');
    if (vulnerabilities.length > 0) {
      console.log('1. 🚨 URGENT: Fix password validation logic in mockAuth.ts');
      console.log('2. 🔐 Remove or secure admin password bypass');
      console.log('3. 📝 Add proper error messages for failed login attempts');
      console.log('4. 🛡️ Implement rate limiting for failed login attempts');
      console.log('5. 📊 Add security logging for failed login attempts');
    } else {
      console.log('1. 💬 Add user-friendly error messages');
      console.log('2. 📊 Consider adding security logging');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SECURITY TEST HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 15 giây để quan sát kết quả
    await page.waitForTimeout(15000);
    
    await browser.close();
  }
})();
