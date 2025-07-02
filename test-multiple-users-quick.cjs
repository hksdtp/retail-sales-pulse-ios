const { chromium } = require('playwright');

(async () => {
  console.log('🔐 QUICK TEST MULTIPLE USERS SECURITY');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra nhanh logic đăng nhập của nhiều thành viên');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test cases cho nhiều users
  const testUsers = [
    { name: 'Khổng Đức Mạnh', email: 'manh.khong@example.com' },
    { name: 'Lương Việt Anh', email: 'vietanh.luong@example.com' },
    { name: 'Lê Khánh Duy', email: 'khanhduy.le@example.com' },
    { name: 'Quản Thu Hà', email: 'thuha.quan@example.com' },
    { name: 'Nguyễn Thị Thảo', email: 'thao.nguyen@example.com' }
  ];
  
  const allResults = [];
  
  try {
    for (const user of testUsers) {
      console.log(`\n🧪 TESTING: ${user.name}`);
      console.log('-'.repeat(50));
      
      const userResult = {
        name: user.name,
        email: user.email,
        correctPasswordWorks: false,
        wrongPasswordBlocked: false,
        adminPasswordBlocked: false
      };
      
      // Test 1: Correct password "123456"
      console.log(`📋 Test correct password: 123456`);
      const correctResult = await quickTestLogin(page, user.email, '123456');
      userResult.correctPasswordWorks = correctResult.success;
      
      console.log(correctResult.success ? 
        '✅ Correct password works' : 
        '❌ Correct password failed'
      );
      
      if (correctResult.success) {
        await quickLogout(page);
      }
      
      // Test 2: Wrong password
      console.log(`📋 Test wrong password: wrong123`);
      const wrongResult = await quickTestLogin(page, user.email, 'wrong123');
      userResult.wrongPasswordBlocked = !wrongResult.success;
      
      console.log(!wrongResult.success ? 
        '✅ Wrong password blocked' : 
        '❌ SECURITY ISSUE: Wrong password allowed!'
      );
      
      if (wrongResult.success) {
        await quickLogout(page);
      }
      
      // Test 3: Admin password
      console.log(`📋 Test admin password: haininh1`);
      const adminResult = await quickTestLogin(page, user.email, 'haininh1');
      userResult.adminPasswordBlocked = !adminResult.success;
      
      console.log(!adminResult.success ? 
        '✅ Admin password blocked' : 
        '❌ CRITICAL: Admin password allowed!'
      );
      
      if (adminResult.success) {
        await quickLogout(page);
      }
      
      allResults.push(userResult);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // ==================== QUICK REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 QUICK SECURITY REPORT');
    console.log('='.repeat(80));
    
    let totalIssues = 0;
    let usersWithIssues = 0;
    
    allResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      
      let userIssues = 0;
      
      if (!result.correctPasswordWorks) {
        console.log(`   ❌ Cannot login with correct password`);
        userIssues++;
      } else {
        console.log(`   ✅ Correct password works`);
      }
      
      if (!result.wrongPasswordBlocked) {
        console.log(`   🚨 SECURITY: Wrong password not blocked!`);
        userIssues++;
        totalIssues++;
      } else {
        console.log(`   ✅ Wrong password blocked`);
      }
      
      if (!result.adminPasswordBlocked) {
        console.log(`   🚨 CRITICAL: Admin password not blocked!`);
        userIssues++;
        totalIssues++;
      } else {
        console.log(`   ✅ Admin password blocked`);
      }
      
      if (userIssues > 0) {
        usersWithIssues++;
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`👥 Users tested: ${allResults.length}`);
    console.log(`🚨 Total security issues: ${totalIssues}`);
    console.log(`⚠️ Users with issues: ${usersWithIssues}/${allResults.length}`);
    
    const securityScore = Math.round(((allResults.length - usersWithIssues) / allResults.length) * 100);
    console.log(`🛡️ Security Score: ${securityScore}%`);
    
    if (totalIssues === 0) {
      console.log('\n🎉 EXCELLENT: All users secure!');
    } else if (totalIssues <= 2) {
      console.log('\n⚠️ WARNING: Minor security issues found');
    } else {
      console.log('\n🚨 CRITICAL: Major security vulnerabilities!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 QUICK TEST COMPLETE');
    console.log('='.repeat(80));
    
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();

/**
 * Quick test login function
 */
async function quickTestLogin(page, email, password) {
  try {
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Clear session
    await page.evaluate(() => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    });
    
    // Try to find and click user by email
    const userFound = await page.evaluate((targetEmail) => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes(targetEmail) && el.tagName !== 'SCRIPT';
      });
      
      if (elements.length > 0) {
        // Find clickable parent
        let clickableElement = elements[0];
        while (clickableElement && !['BUTTON', 'DIV', 'A'].includes(clickableElement.tagName)) {
          clickableElement = clickableElement.parentElement;
        }
        
        if (clickableElement) {
          clickableElement.click();
          return true;
        }
      }
      return false;
    }, email);
    
    if (!userFound) {
      return { success: false, reason: 'User not found' };
    }
    
    await page.waitForTimeout(500);
    
    // Enter password
    await page.fill('input[type="password"]', password);
    await page.waitForTimeout(300);
    
    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Check result
    const result = await page.evaluate(() => {
      const currentUrl = window.location.href;
      return {
        loginSuccess: !currentUrl.includes('/login'),
        currentUrl
      };
    });
    
    return {
      success: result.loginSuccess,
      url: result.currentUrl
    };
    
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Quick logout
 */
async function quickLogout(page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.waitForTimeout(500);
  } catch (error) {
    // Ignore logout errors
  }
}
