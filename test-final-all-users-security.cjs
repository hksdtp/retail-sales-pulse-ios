const { chromium } = require('playwright');

(async () => {
  console.log('🔐 FINAL ALL USERS SECURITY TEST');
  console.log('='.repeat(80));
  console.log('📋 Test cuối cùng - Kiểm tra bảo mật đăng nhập cho tất cả thành viên');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test users với manual selection
  const testUsers = [
    'Khổng Đức Mạnh',
    'Lương Việt Anh', 
    'Lê Khánh Duy',
    'Quản Thu Hà',
    'Nguyễn Thị Thảo'
  ];
  
  const allResults = [];
  
  try {
    // Navigate to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 CHECKING AVAILABLE USERS ON PAGE:');
    
    // Check what users are available
    const pageInfo = await page.evaluate(() => {
      // Clear any existing session first
      localStorage.clear();
      sessionStorage.clear();
      
      // Get page content
      const bodyText = document.body.innerText;
      
      // Look for user-related elements
      const userElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('@') || text.includes('Khổng') || text.includes('Lương') ||
               text.includes('Nguyễn') || text.includes('Lê') || text.includes('Quản');
      });
      
      // Check if there's a user selection interface
      const hasUserSelection = bodyText.includes('Chọn người dùng') || 
                              bodyText.includes('Select User') ||
                              userElements.length > 0;
      
      return {
        bodyText: bodyText.substring(0, 500),
        userElementsCount: userElements.length,
        hasUserSelection,
        userElementsInfo: userElements.slice(0, 5).map(el => ({
          tagName: el.tagName,
          text: el.textContent?.substring(0, 100)
        }))
      };
    });
    
    console.log(`📊 Page info:`);
    console.log(`   - User elements found: ${pageInfo.userElementsCount}`);
    console.log(`   - Has user selection: ${pageInfo.hasUserSelection}`);
    console.log(`   - Body text preview: ${pageInfo.bodyText.substring(0, 200)}...`);
    
    if (pageInfo.userElementsCount > 0) {
      console.log(`   - User elements:`);
      pageInfo.userElementsInfo.forEach((el, index) => {
        console.log(`     ${index + 1}. ${el.tagName}: ${el.text}`);
      });
    }
    
    // Manual test approach - directly test login functionality
    console.log('\n🧪 MANUAL LOGIN TESTING APPROACH:');
    console.log('Testing login functionality directly without user selection...');
    
    for (const userName of testUsers.slice(0, 3)) { // Test first 3 users
      console.log(`\n🧪 TESTING: ${userName}`);
      console.log('-'.repeat(50));
      
      const userResult = {
        name: userName,
        correctPasswordWorks: false,
        wrongPasswordBlocked: false,
        adminPasswordBlocked: false,
        testDetails: []
      };
      
      // Test 1: Correct password
      console.log(`📋 Test 1: Correct password (123456)`);
      const correctResult = await testDirectLogin(page, userName, '123456');
      userResult.correctPasswordWorks = correctResult.success;
      userResult.testDetails.push({
        password: '123456',
        success: correctResult.success,
        details: correctResult.details
      });
      
      console.log(correctResult.success ? 
        '✅ Correct password works' : 
        `❌ Correct password failed: ${correctResult.details}`
      );
      
      // Test 2: Wrong password
      console.log(`📋 Test 2: Wrong password (wrong123)`);
      const wrongResult = await testDirectLogin(page, userName, 'wrong123');
      userResult.wrongPasswordBlocked = !wrongResult.success;
      userResult.testDetails.push({
        password: 'wrong123',
        success: wrongResult.success,
        details: wrongResult.details
      });
      
      console.log(!wrongResult.success ? 
        '✅ Wrong password blocked' : 
        `❌ SECURITY ISSUE: Wrong password allowed! ${wrongResult.details}`
      );
      
      // Test 3: Admin password
      console.log(`📋 Test 3: Admin password (haininh1)`);
      const adminResult = await testDirectLogin(page, userName, 'haininh1');
      userResult.adminPasswordBlocked = !adminResult.success;
      userResult.testDetails.push({
        password: 'haininh1',
        success: adminResult.success,
        details: adminResult.details
      });
      
      console.log(!adminResult.success ? 
        '✅ Admin password blocked' : 
        `❌ CRITICAL: Admin password allowed! ${adminResult.details}`
      );
      
      allResults.push(userResult);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // ==================== FINAL COMPREHENSIVE REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('🔐 BÁO CÁO CUỐI CÙNG - BẢO MẬT TẤT CẢ THÀNH VIÊN');
    console.log('='.repeat(80));
    
    let totalVulnerabilities = 0;
    let usersWithIssues = 0;
    let usersCannotLogin = 0;
    
    allResults.forEach((result, index) => {
      console.log(`\n${index + 1}. USER: ${result.name}`);
      
      let userIssues = 0;
      
      // Check login capability
      if (!result.correctPasswordWorks) {
        console.log(`   ❌ Cannot login with correct password`);
        usersCannotLogin++;
        userIssues++;
      } else {
        console.log(`   ✅ Can login with correct password`);
      }
      
      // Check security
      if (!result.wrongPasswordBlocked) {
        console.log(`   🚨 SECURITY: Wrong password not blocked!`);
        totalVulnerabilities++;
        userIssues++;
      } else {
        console.log(`   ✅ Wrong password properly blocked`);
      }
      
      if (!result.adminPasswordBlocked) {
        console.log(`   🚨 CRITICAL: Admin password not blocked!`);
        totalVulnerabilities++;
        userIssues++;
      } else {
        console.log(`   ✅ Admin password properly blocked`);
      }
      
      if (userIssues > 0) {
        usersWithIssues++;
      }
      
      // Show test details
      console.log(`   📋 Test details:`);
      result.testDetails.forEach(test => {
        console.log(`      - Password "${test.password}": ${test.success ? 'SUCCESS' : 'BLOCKED'} (${test.details})`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY:');
    console.log(`👥 Users tested: ${allResults.length}`);
    console.log(`❌ Users cannot login: ${usersCannotLogin}`);
    console.log(`🚨 Security vulnerabilities: ${totalVulnerabilities}`);
    console.log(`⚠️ Users with issues: ${usersWithIssues}/${allResults.length}`);
    
    const functionalityScore = Math.round(((allResults.length - usersCannotLogin) / allResults.length) * 100);
    const securityScore = totalVulnerabilities === 0 ? 100 : Math.max(0, 100 - (totalVulnerabilities * 20));
    
    console.log(`🔧 Functionality Score: ${functionalityScore}%`);
    console.log(`🛡️ Security Score: ${securityScore}%`);
    
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (usersCannotLogin === 0 && totalVulnerabilities === 0) {
      console.log('🎉 PERFECT: All users can login securely!');
    } else if (usersCannotLogin > 0 && totalVulnerabilities === 0) {
      console.log('⚠️ FUNCTIONALITY ISSUE: Some users cannot login but security is good');
    } else if (usersCannotLogin === 0 && totalVulnerabilities > 0) {
      console.log('🚨 SECURITY ISSUE: Users can login but there are vulnerabilities');
    } else {
      console.log('🚨 CRITICAL: Both functionality and security issues exist');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    if (usersCannotLogin > 0) {
      console.log('1. 🔧 Fix user login functionality');
      console.log('2. 📊 Check user data loading');
      console.log('3. 🔍 Debug authentication flow');
    }
    if (totalVulnerabilities > 0) {
      console.log('4. 🛡️ Fix security vulnerabilities');
      console.log('5. 🔐 Strengthen password validation');
    }
    if (usersCannotLogin === 0 && totalVulnerabilities === 0) {
      console.log('1. ✅ System is secure and functional!');
      console.log('2. 📊 Consider adding security monitoring');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FINAL SECURITY TEST COMPLETE');
    console.log('='.repeat(80));
    
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();

/**
 * Test direct login using mockAuth
 */
async function testDirectLogin(page, userName, password) {
  try {
    // Use mockAuth directly
    const result = await page.evaluate(async (testUserName, testPassword) => {
      try {
        // Import mockLogin function
        const { mockLogin } = await import('/src/services/mockAuth.ts');
        
        // Find user email by name
        const userEmailMap = {
          'Khổng Đức Mạnh': 'manh.khong@example.com',
          'Lương Việt Anh': 'vietanh.luong@example.com',
          'Lê Khánh Duy': 'khanhduy.le@example.com',
          'Quản Thu Hà': 'thuha.quan@example.com',
          'Nguyễn Thị Thảo': 'thao.nguyen@example.com'
        };
        
        const email = userEmailMap[testUserName];
        if (!email) {
          return { success: false, details: 'User email not found' };
        }
        
        // Test login
        const loginResult = await mockLogin(email, testPassword);
        
        return {
          success: loginResult.success,
          details: loginResult.success ? 'Login successful' : (loginResult.error || 'Login failed')
        };
        
      } catch (error) {
        return { success: false, details: `Error: ${error.message}` };
      }
    }, userName, password);
    
    return result;
    
  } catch (error) {
    return { success: false, details: `Test error: ${error.message}` };
  }
}
