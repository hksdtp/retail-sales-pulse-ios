const { chromium } = require('playwright');

(async () => {
  console.log('🔐 TEST ALL MEMBERS LOGIN SECURITY');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra logic đăng nhập của TẤT CẢ thành viên');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Danh sách thành viên để test
  const testMembers = [
    { name: 'Khổng Đức Mạnh', email: 'manh.khong@example.com', role: 'retail_director' },
    { name: 'Lương Việt Anh', email: 'vietanh.luong@example.com', role: 'team_leader' },
    { name: 'Nguyễn Thị Hoa', email: 'hoa.nguyen@example.com', role: 'employee' },
    { name: 'Trần Văn Nam', email: 'nam.tran@example.com', role: 'employee' },
    { name: 'Phạm Thị Lan', email: 'lan.pham@example.com', role: 'employee' },
    { name: 'Lê Minh Tuấn', email: 'tuan.le@example.com', role: 'employee' }
  ];
  
  const allResults = [];
  
  try {
    // Lấy danh sách users từ hệ thống
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const systemUsers = await page.evaluate(() => {
      // Tìm tất cả user buttons
      const userElements = Array.from(document.querySelectorAll('button, div')).filter(el => {
        const text = el.textContent || '';
        return text.includes('@') && (text.includes('Nguyễn') || text.includes('Trần') || 
               text.includes('Lê') || text.includes('Phạm') || text.includes('Khổng') || 
               text.includes('Lương') || text.includes('Hoàng'));
      });
      
      return userElements.map(el => {
        const text = el.textContent || '';
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const nameMatch = text.match(/([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*)/);
        
        return {
          email: emailMatch ? emailMatch[1] : null,
          name: nameMatch ? nameMatch[1] : null,
          fullText: text.trim()
        };
      }).filter(user => user.email && user.name);
    });
    
    console.log(`📊 Tìm thấy ${systemUsers.length} users trong hệ thống:`);
    systemUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
    
    // Test từng user
    for (const user of systemUsers.slice(0, 8)) { // Test 8 users đầu tiên
      console.log(`\n🧪 TESTING USER: ${user.name} (${user.email})`);
      console.log('-'.repeat(60));
      
      const userResult = {
        name: user.name,
        email: user.email,
        correctPasswordWorks: false,
        wrongPasswordsBlocked: [],
        adminPasswordBlocked: false,
        hasErrorMessages: false,
        testDetails: []
      };
      
      // Test 1: Mật khẩu đúng "123456"
      console.log(`📋 Test 1: Mật khẩu đúng (123456)`);
      const correctResult = await testUserLogin(page, user, '123456');
      userResult.correctPasswordWorks = correctResult.success;
      userResult.testDetails.push({
        password: '123456',
        expected: 'should work',
        actuallyWorked: correctResult.success,
        hasErrorMessage: correctResult.hasErrorMessage
      });
      
      console.log(correctResult.success ? 
        '✅ PASS: Mật khẩu đúng hoạt động' : 
        '❌ FAIL: Mật khẩu đúng không hoạt động'
      );
      
      if (correctResult.success) {
        await logout(page);
      }
      
      // Test 2: Mật khẩu sai
      const wrongPasswords = ['123457', 'wrong', 'password'];
      for (const wrongPassword of wrongPasswords) {
        console.log(`📋 Test: Mật khẩu sai "${wrongPassword}"`);
        const wrongResult = await testUserLogin(page, user, wrongPassword);
        
        const blocked = !wrongResult.success;
        userResult.wrongPasswordsBlocked.push({
          password: wrongPassword,
          blocked,
          hasErrorMessage: wrongResult.hasErrorMessage
        });
        
        userResult.testDetails.push({
          password: wrongPassword,
          expected: 'should fail',
          actuallyWorked: wrongResult.success,
          hasErrorMessage: wrongResult.hasErrorMessage
        });
        
        if (wrongResult.hasErrorMessage) {
          userResult.hasErrorMessages = true;
        }
        
        console.log(blocked ? 
          `✅ GOOD: Mật khẩu sai "${wrongPassword}" bị chặn` : 
          `❌ SECURITY ISSUE: Mật khẩu sai "${wrongPassword}" vẫn đăng nhập được!`
        );
        
        if (wrongResult.success) {
          await logout(page);
        }
      }
      
      // Test 3: Admin password
      console.log(`📋 Test: Admin password "haininh1"`);
      const adminResult = await testUserLogin(page, user, 'haininh1');
      userResult.adminPasswordBlocked = !adminResult.success;
      
      userResult.testDetails.push({
        password: 'haininh1',
        expected: 'should fail',
        actuallyWorked: adminResult.success,
        hasErrorMessage: adminResult.hasErrorMessage
      });
      
      console.log(userResult.adminPasswordBlocked ? 
        `✅ SECURE: Admin password bị chặn` : 
        `🚨 CRITICAL: Admin password cho phép đăng nhập!`
      );
      
      if (adminResult.success) {
        await logout(page);
      }
      
      allResults.push(userResult);
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
  } finally {
    // ==================== COMPREHENSIVE SECURITY REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('🔐 BÁO CÁO BẢO MẬT TOÀN BỘ THÀNH VIÊN');
    console.log('='.repeat(80));
    
    let totalVulnerabilities = 0;
    let totalUsers = allResults.length;
    let usersWithIssues = 0;
    
    allResults.forEach((result, index) => {
      console.log(`\n${index + 1}. USER: ${result.name} (${result.email})`);
      
      // Check correct password
      if (result.correctPasswordWorks) {
        console.log(`   ✅ Correct password works: YES`);
      } else {
        console.log(`   ❌ Correct password works: NO`);
        usersWithIssues++;
      }
      
      // Check wrong password blocking
      const wrongPasswordIssues = result.wrongPasswordsBlocked.filter(p => !p.blocked);
      if (wrongPasswordIssues.length > 0) {
        console.log(`   🚨 SECURITY ISSUE: ${wrongPasswordIssues.length} wrong passwords allowed!`);
        wrongPasswordIssues.forEach(issue => {
          console.log(`      - "${issue.password}" was NOT blocked`);
        });
        totalVulnerabilities += wrongPasswordIssues.length;
        usersWithIssues++;
      } else {
        console.log(`   ✅ All wrong passwords blocked: ${result.wrongPasswordsBlocked.length} tested`);
      }
      
      // Check admin password
      if (!result.adminPasswordBlocked) {
        console.log(`   🚨 CRITICAL: Admin password allows access!`);
        totalVulnerabilities++;
        usersWithIssues++;
      } else {
        console.log(`   ✅ Admin password properly blocked`);
      }
      
      // Check error messages
      if (result.hasErrorMessages) {
        console.log(`   ✅ Error messages shown`);
      } else {
        console.log(`   ⚠️ No error messages shown`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TỔNG KẾT BẢO MẬT TOÀN HỆ THỐNG:');
    console.log(`👥 Tổng số users tested: ${totalUsers}`);
    console.log(`🚨 Tổng số vulnerabilities: ${totalVulnerabilities}`);
    console.log(`⚠️ Users có vấn đề: ${usersWithIssues}/${totalUsers}`);
    
    const securityScore = Math.round(((totalUsers - usersWithIssues) / totalUsers) * 100);
    console.log(`🛡️ Security Score: ${securityScore}%`);
    
    if (totalVulnerabilities === 0 && usersWithIssues === 0) {
      console.log('\n🎉 PERFECT: Hệ thống hoàn toàn an toàn cho tất cả thành viên!');
    } else if (totalVulnerabilities <= 2) {
      console.log('\n⚠️ WARNING: Có một số vấn đề bảo mật cần khắc phục');
    } else {
      console.log('\n🚨 CRITICAL: Hệ thống có nhiều lỗ hổng bảo mật nghiêm trọng!');
    }
    
    console.log('\n🔧 KHUYẾN NGHỊ:');
    if (usersWithIssues > 0) {
      console.log('1. 🚨 URGENT: Sửa logic đăng nhập cho các users có vấn đề');
      console.log('2. 🔐 Đảm bảo password validation nhất quán cho tất cả users');
      console.log('3. 📝 Thêm error messages rõ ràng');
      console.log('4. 🛡️ Kiểm tra và sửa admin password bypass');
    } else {
      console.log('1. 💬 Cải thiện user experience với error messages');
      console.log('2. 📊 Thêm security logging');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SECURITY TEST TẤT CẢ THÀNH VIÊN HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 15 giây để quan sát kết quả
    await page.waitForTimeout(15000);
    
    await browser.close();
  }
})();

/**
 * Test login cho một user cụ thể
 */
async function testUserLogin(page, user, password) {
  try {
    // Navigate to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Clear session
    await page.evaluate(() => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    });
    
    // Select user by clicking on their button/card
    const userSelected = await page.evaluate((targetUser) => {
      const userElements = Array.from(document.querySelectorAll('button, div')).filter(el => {
        const text = el.textContent || '';
        return text.includes(targetUser.email) || text.includes(targetUser.name);
      });
      
      if (userElements.length > 0) {
        userElements[0].click();
        return true;
      }
      return false;
    }, user);
    
    if (!userSelected) {
      console.log(`⚠️ Could not select user: ${user.name}`);
      return { success: false, hasErrorMessage: false };
    }
    
    await page.waitForTimeout(1000);
    
    // Enter password
    await page.fill('input[type="password"]', password);
    await page.waitForTimeout(500);
    
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
               text.includes('wrong') || text.includes('không đúng') || text.includes('thất bại');
      });
      
      return {
        loginSuccess,
        hasErrorMessage: errorElements.length > 0
      };
    });
    
    return {
      success: result.loginSuccess,
      hasErrorMessage: result.hasErrorMessage
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${user.name}: ${error.message}`);
    return { success: false, hasErrorMessage: false };
  }
}

/**
 * Logout function
 */
async function logout(page) {
  try {
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
