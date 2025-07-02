const { chromium } = require('playwright');

(async () => {
  console.log('🔐 TEST LOGIN SECURITY - KIỂM TRA BẢO MẬT ĐĂNG NHẬP');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra logic đăng nhập của tất cả thành viên');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test cases để kiểm tra
  const testCases = [
    {
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@example.com',
      correctPassword: '123456',
      wrongPasswords: ['123457', 'wrong', 'abc123', ''],
      adminPassword: 'haininh1'
    },
    {
      name: 'Nguyễn Văn A',
      email: 'a.nguyen@example.com', 
      correctPassword: '123456',
      wrongPasswords: ['wrong123', 'test', '111111'],
      adminPassword: 'haininh1'
    },
    {
      name: 'Trần Thị B',
      email: 'b.tran@example.com',
      correctPassword: '123456', 
      wrongPasswords: ['password', '654321', 'admin'],
      adminPassword: 'haininh1'
    }
  ];
  
  const testResults = [];
  
  try {
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    for (const testCase of testCases) {
      console.log(`\n🧪 TESTING USER: ${testCase.name}`);
      console.log('-'.repeat(60));
      
      const userResults = {
        name: testCase.name,
        email: testCase.email,
        correctPasswordWorks: false,
        wrongPasswordsBlocked: [],
        adminPasswordWorks: false,
        hasErrorMessages: false
      };
      
      // Test 1: Correct password should work
      console.log(`📋 Test 1: Đăng nhập với mật khẩu đúng (${testCase.correctPassword})`);
      
      const correctResult = await testLogin(page, testCase.email, testCase.correctPassword);
      userResults.correctPasswordWorks = correctResult.success;
      
      console.log(correctResult.success ? 
        '✅ PASS: Mật khẩu đúng cho phép đăng nhập' : 
        '❌ FAIL: Mật khẩu đúng không hoạt động'
      );
      
      if (correctResult.success) {
        // Logout để test tiếp
        await logout(page);
      }
      
      // Test 2: Wrong passwords should be blocked
      console.log(`📋 Test 2: Đăng nhập với mật khẩu sai`);
      
      for (const wrongPassword of testCase.wrongPasswords) {
        console.log(`   Testing wrong password: "${wrongPassword}"`);
        
        const wrongResult = await testLogin(page, testCase.email, wrongPassword);
        userResults.wrongPasswordsBlocked.push({
          password: wrongPassword,
          blocked: !wrongResult.success,
          hasErrorMessage: wrongResult.hasErrorMessage
        });
        
        if (wrongResult.success) {
          console.log(`❌ SECURITY ISSUE: Mật khẩu sai "${wrongPassword}" vẫn đăng nhập được!`);
          await logout(page);
        } else {
          console.log(`✅ GOOD: Mật khẩu sai "${wrongPassword}" bị chặn`);
        }
        
        if (wrongResult.hasErrorMessage) {
          userResults.hasErrorMessages = true;
        }
      }
      
      // Test 3: Admin password (security vulnerability check)
      console.log(`📋 Test 3: Kiểm tra admin password vulnerability`);
      
      const adminResult = await testLogin(page, testCase.email, testCase.adminPassword);
      userResults.adminPasswordWorks = adminResult.success;
      
      if (adminResult.success) {
        console.log(`🚨 CRITICAL SECURITY ISSUE: Admin password "${testCase.adminPassword}" cho phép đăng nhập vào tài khoản ${testCase.name}!`);
        await logout(page);
      } else {
        console.log(`✅ SECURE: Admin password không hoạt động với tài khoản ${testCase.name}`);
      }
      
      testResults.push(userResults);
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
  } finally {
    // ==================== COMPREHENSIVE SECURITY REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('🔐 BÁO CÁO BẢO MẬT ĐĂNG NHẬP');
    console.log('='.repeat(80));
    
    let totalVulnerabilities = 0;
    let totalUsers = testResults.length;
    
    testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. USER: ${result.name} (${result.email})`);
      console.log(`   ✅ Correct password works: ${result.correctPasswordWorks}`);
      
      // Check wrong password blocking
      const wrongPasswordIssues = result.wrongPasswordsBlocked.filter(p => !p.blocked);
      if (wrongPasswordIssues.length > 0) {
        console.log(`   🚨 SECURITY ISSUE: ${wrongPasswordIssues.length} wrong passwords allowed login!`);
        wrongPasswordIssues.forEach(issue => {
          console.log(`      - "${issue.password}" was NOT blocked`);
        });
        totalVulnerabilities += wrongPasswordIssues.length;
      } else {
        console.log(`   ✅ All wrong passwords blocked: ${result.wrongPasswordsBlocked.length} tested`);
      }
      
      // Check admin password vulnerability
      if (result.adminPasswordWorks) {
        console.log(`   🚨 CRITICAL: Admin password allows unauthorized access!`);
        totalVulnerabilities++;
      } else {
        console.log(`   ✅ Admin password properly blocked`);
      }
      
      // Check error messages
      if (result.hasErrorMessages) {
        console.log(`   ✅ Error messages shown for wrong passwords`);
      } else {
        console.log(`   ⚠️ WARNING: No error messages for wrong passwords`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TỔNG KẾT BẢO MẬT:');
    console.log(`👥 Tổng số users tested: ${totalUsers}`);
    console.log(`🚨 Tổng số vulnerabilities: ${totalVulnerabilities}`);
    
    if (totalVulnerabilities === 0) {
      console.log('🎉 EXCELLENT: Hệ thống đăng nhập an toàn!');
    } else if (totalVulnerabilities <= 2) {
      console.log('⚠️ WARNING: Có một số vấn đề bảo mật nhỏ cần khắc phục');
    } else {
      console.log('🚨 CRITICAL: Hệ thống có nhiều lỗ hổng bảo mật nghiêm trọng!');
    }
    
    console.log('\n🔧 KHUYẾN NGHỊ:');
    if (testResults.some(r => r.adminPasswordWorks)) {
      console.log('1. 🚨 URGENT: Vô hiệu hóa admin password bypass');
      console.log('2. 🔐 Implement proper password validation');
      console.log('3. 📝 Add proper error messages for failed login');
    }
    if (testResults.some(r => r.wrongPasswordsBlocked.some(p => !p.blocked))) {
      console.log('4. 🔒 Fix password validation logic');
      console.log('5. 🛡️ Add rate limiting for failed attempts');
    }
    if (!testResults.some(r => r.hasErrorMessages)) {
      console.log('6. 💬 Add user-friendly error messages');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SECURITY TEST HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();

/**
 * Test login với email và password
 */
async function testLogin(page, email, password) {
  try {
    // Navigate to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Clear any existing selections
    await page.evaluate(() => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    });
    
    // Select user by email
    const userSelected = await page.evaluate((targetEmail) => {
      // Find user dropdown or selection
      const userButtons = Array.from(document.querySelectorAll('button, div')).filter(el => 
        el.textContent && el.textContent.includes('@')
      );
      
      const targetButton = userButtons.find(btn => btn.textContent.includes(targetEmail));
      if (targetButton) {
        targetButton.click();
        return true;
      }
      return false;
    }, email);
    
    if (!userSelected) {
      console.log(`⚠️ Could not select user with email: ${email}`);
      return { success: false, hasErrorMessage: false };
    }
    
    await page.waitForTimeout(1000);
    
    // Enter password
    await page.fill('input[type="password"]', password);
    await page.waitForTimeout(500);
    
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if login was successful
    const result = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const loginSuccess = !currentUrl.includes('/login');
      
      // Check for error messages
      const errorElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('sai') || text.includes('error') || text.includes('invalid') || 
               text.includes('wrong') || text.includes('không đúng') || text.includes('thất bại');
      });
      
      return {
        loginSuccess,
        currentUrl,
        hasErrorMessage: errorElements.length > 0,
        errorTexts: errorElements.map(el => el.textContent?.trim()).slice(0, 3)
      };
    });
    
    return {
      success: result.loginSuccess,
      hasErrorMessage: result.hasErrorMessage,
      errorTexts: result.errorTexts
    };
    
  } catch (error) {
    console.log(`❌ Error testing login: ${error.message}`);
    return { success: false, hasErrorMessage: false };
  }
}

/**
 * Logout function
 */
async function logout(page) {
  try {
    // Try to find logout button or clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log(`⚠️ Logout error: ${error.message}`);
  }
}
