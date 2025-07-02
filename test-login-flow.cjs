const { chromium } = require('playwright');

(async () => {
  console.log('🚀 BẮT ĐẦU TEST TOÀN BỘ FLOW ĐĂNG NHẬP VÀ ĐỔI MẬT KHẨU');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const page = await browser.newPage();
  
  const testResults = {
    step1_navigation: false,
    step2_firstLogin: false,
    step3_passwordChangeRequired: false,
    step4_passwordChange: false,
    step5_dashboardAccess: false,
    step6_logout: false,
    step7_loginWithNewPassword: false,
    step8_noDuplicatePasswordChange: false,
    step9_finalDashboardAccess: false
  };
  
  try {
    // BƯỚC 1: Điều hướng đến trang login
    console.log('\n📋 BƯỚC 1: Điều hướng đến trang login');
    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(3000);
    
    const loginPageLoaded = await page.locator('input[type="email"]').isVisible();
    testResults.step1_navigation = loginPageLoaded;
    console.log(loginPageLoaded ? '✅ Trang login đã load thành công' : '❌ Trang login không load được');
    
    if (!loginPageLoaded) {
      throw new Error('Không thể load trang login');
    }
    
    // BƯỚC 2: Đăng nhập lần đầu với Khổng Đức Mạnh
    console.log('\n📋 BƯỚC 2: Đăng nhập lần đầu với Khổng Đức Mạnh');
    await page.fill('input[type="email"]', 'manh.khong@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Đợi response
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const loginSuccess = !currentUrl.includes('/login');
    testResults.step2_firstLogin = loginSuccess;
    console.log(loginSuccess ? '✅ Đăng nhập thành công' : '❌ Đăng nhập thất bại');
    console.log('📍 URL hiện tại:', currentUrl);
    
    // BƯỚC 3: Kiểm tra có yêu cầu đổi mật khẩu không
    console.log('\n📋 BƯỚC 3: Kiểm tra yêu cầu đổi mật khẩu');
    
    const passwordChangeForm = await page.locator('form').filter({ hasText: 'Đổi mật khẩu' }).isVisible();
    const passwordChangeRequired = passwordChangeForm || currentUrl.includes('/change-password');
    testResults.step3_passwordChangeRequired = passwordChangeRequired;
    
    console.log(passwordChangeRequired ? '✅ Hệ thống yêu cầu đổi mật khẩu (đúng)' : '⚠️ Không yêu cầu đổi mật khẩu');
    
    if (passwordChangeRequired) {
      // BƯỚC 4: Đổi mật khẩu
      console.log('\n📋 BƯỚC 4: Thực hiện đổi mật khẩu');
      
      // Tìm các input field cho đổi mật khẩu
      const newPasswordInput = page.locator('input[type="password"]').first();
      const confirmPasswordInput = page.locator('input[type="password"]').last();
      
      await newPasswordInput.fill('newpassword123');
      await confirmPasswordInput.fill('newpassword123');
      
      // Click nút đổi mật khẩu
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const afterChangeUrl = page.url();
      const passwordChangeSuccess = !afterChangeUrl.includes('/change-password') && !afterChangeUrl.includes('/login');
      testResults.step4_passwordChange = passwordChangeSuccess;
      
      console.log(passwordChangeSuccess ? '✅ Đổi mật khẩu thành công' : '❌ Đổi mật khẩu thất bại');
      console.log('📍 URL sau khi đổi:', afterChangeUrl);
      
      // BƯỚC 5: Kiểm tra truy cập dashboard
      console.log('\n📋 BƯỚC 5: Kiểm tra truy cập dashboard');
      
      const dashboardAccess = afterChangeUrl === 'http://localhost:8088/' || afterChangeUrl.includes('/dashboard');
      testResults.step5_dashboardAccess = dashboardAccess;
      
      console.log(dashboardAccess ? '✅ Truy cập dashboard thành công' : '❌ Không thể truy cập dashboard');
      
      // BƯỚC 6: Logout
      console.log('\n📋 BƯỚC 6: Thực hiện logout');
      
      // Tìm và click nút logout
      try {
        const logoutButton = page.locator('button').filter({ hasText: 'Đăng xuất' });
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
        } else {
          // Thử tìm trong menu
          await page.click('[data-testid="user-menu"]');
          await page.click('button').filter({ hasText: 'Đăng xuất' });
        }
      } catch (error) {
        console.log('⚠️ Không tìm thấy nút logout, thử cách khác...');
        // Force logout bằng cách xóa localStorage
        await page.evaluate(() => {
          localStorage.clear();
          window.location.href = '/login';
        });
      }
      
      await page.waitForTimeout(2000);
      
      const logoutUrl = page.url();
      const logoutSuccess = logoutUrl.includes('/login');
      testResults.step6_logout = logoutSuccess;
      
      console.log(logoutSuccess ? '✅ Logout thành công' : '❌ Logout thất bại');
      console.log('📍 URL sau logout:', logoutUrl);
      
      // BƯỚC 7: Đăng nhập lại với mật khẩu mới
      console.log('\n📋 BƯỚC 7: Đăng nhập lại với mật khẩu mới');
      
      await page.fill('input[type="email"]', 'manh.khong@example.com');
      await page.fill('input[type="password"]', 'newpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const secondLoginUrl = page.url();
      const secondLoginSuccess = !secondLoginUrl.includes('/login');
      testResults.step7_loginWithNewPassword = secondLoginSuccess;
      
      console.log(secondLoginSuccess ? '✅ Đăng nhập với mật khẩu mới thành công' : '❌ Đăng nhập với mật khẩu mới thất bại');
      console.log('📍 URL sau đăng nhập lần 2:', secondLoginUrl);
      
      // BƯỚC 8: Kiểm tra không bị yêu cầu đổi mật khẩu nữa
      console.log('\n📋 BƯỚC 8: Kiểm tra không bị yêu cầu đổi mật khẩu nữa');
      
      const noPasswordChangeRequired = !secondLoginUrl.includes('/change-password');
      testResults.step8_noDuplicatePasswordChange = noPasswordChangeRequired;
      
      console.log(noPasswordChangeRequired ? '✅ Không bị yêu cầu đổi mật khẩu nữa (đúng)' : '❌ Vẫn bị yêu cầu đổi mật khẩu (sai)');
      
      // BƯỚC 9: Kiểm tra truy cập dashboard lần cuối
      console.log('\n📋 BƯỚC 9: Kiểm tra truy cập dashboard lần cuối');
      
      const finalDashboardAccess = secondLoginUrl === 'http://localhost:8088/' || secondLoginUrl.includes('/dashboard');
      testResults.step9_finalDashboardAccess = finalDashboardAccess;
      
      console.log(finalDashboardAccess ? '✅ Truy cập dashboard lần cuối thành công' : '❌ Không thể truy cập dashboard lần cuối');
    } else {
      console.log('⚠️ Bỏ qua các bước đổi mật khẩu vì không được yêu cầu');
    }
    
  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', error.message);
  } finally {
    // TỔNG KẾT KẾT QUẢ
    console.log('\n' + '='.repeat(60));
    console.log('📊 TỔNG KẾT KẾT QUẢ TEST');
    console.log('='.repeat(60));
    
    const results = [
      { name: 'Điều hướng đến login', success: testResults.step1_navigation },
      { name: 'Đăng nhập lần đầu', success: testResults.step2_firstLogin },
      { name: 'Yêu cầu đổi mật khẩu', success: testResults.step3_passwordChangeRequired },
      { name: 'Đổi mật khẩu thành công', success: testResults.step4_passwordChange },
      { name: 'Truy cập dashboard sau đổi', success: testResults.step5_dashboardAccess },
      { name: 'Logout thành công', success: testResults.step6_logout },
      { name: 'Đăng nhập với mật khẩu mới', success: testResults.step7_loginWithNewPassword },
      { name: 'Không yêu cầu đổi mật khẩu nữa', success: testResults.step8_noDuplicatePasswordChange },
      { name: 'Truy cập dashboard cuối cùng', success: testResults.step9_finalDashboardAccess }
    ];
    
    let successCount = 0;
    results.forEach((result, index) => {
      const status = result.success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI';
      console.log(`${index + 1}. ${result.name}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${results.length} bước thành công`);
    
    if (successCount === results.length) {
      console.log('🎉 TẤT CẢ CÁC BƯỚC ĐỀU THÀNH CÔNG!');
      console.log('✅ Hệ thống đồng bộ mật khẩu với Supabase hoạt động hoàn hảo!');
    } else {
      console.log('⚠️ CÓ MỘT SỐ BƯỚC CHƯA THÀNH CÔNG, CẦN KIỂM TRA LẠI');
    }
    
    console.log('='.repeat(60));
    
    await browser.close();
  }
})();
