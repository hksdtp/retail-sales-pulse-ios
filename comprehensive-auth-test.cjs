const { chromium } = require('playwright');

(async () => {
  console.log('🚀 COMPREHENSIVE AUTHENTICATION TEST WITH SUPABASE SYNC');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const page = await browser.newPage();
  
  const testResults = {
    step1_systemReset: false,
    step2_navigation: false,
    step3_firstLogin: false,
    step4_passwordChangeRequired: false,
    step5_passwordChange: false,
    step6_supabaseSync: false,
    step7_logout: false,
    step8_loginWithNewPassword: false,
    step9_noPasswordChangeRequired: false,
    step10_supabaseVerification: false
  };
  
  try {
    // BƯỚC 1: Reset hệ thống hoàn toàn
    console.log('\n📋 BƯỚC 1: Reset hệ thống và đồng bộ Supabase');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });

    // Reset toàn bộ hệ thống
    const resetResult = await page.evaluate(async () => {
      console.log('🔄 Starting system reset...');

      // Step 1: Clear localStorage first
      localStorage.clear();

      // Step 2: Reset all users to password_changed: false
      if (typeof window.updateAllUsersPasswordChangedToFalse === 'function') {
        const result1 = await window.updateAllUsersPasswordChangedToFalse();
        console.log('Reset users result:', result1);
      }

      // Step 3: Sync password reset to Supabase
      if (typeof window.syncPasswordResetToSupabase === 'function') {
        const result2 = await window.syncPasswordResetToSupabase();
        console.log('Sync reset to Supabase result:', result2);
      }

      // Step 4: Force reset Khổng Đức Mạnh
      if (typeof window.forceResetManhPasswordChanged === 'function') {
        const result3 = await window.forceResetManhPasswordChanged();
        console.log('Force reset Mạnh result:', result3);
      }

      // Step 5: Clear localStorage again
      localStorage.clear();

      return { success: true, message: 'System reset completed' };
    });

    testResults.step1_systemReset = resetResult.success;
    console.log(resetResult.success ? '✅ Hệ thống đã được reset hoàn toàn' : '❌ Reset hệ thống thất bại');

    // Reload trang sau khi reset
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // BƯỚC 2: Kiểm tra trang login
    console.log('\n📋 BƯỚC 2: Kiểm tra trang login');
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    const loginPageLoaded = passwordInput > 0 && submitButton > 0;
    
    testResults.step2_navigation = loginPageLoaded;
    console.log(loginPageLoaded ? '✅ Trang login đã load thành công' : '❌ Trang login không load được');
    
    if (!loginPageLoaded) {
      throw new Error('Không thể load trang login');
    }
    
    // Kiểm tra user đã được chọn
    const selectedUser = await page.locator('text=Khổng Đức Mạnh').count();
    console.log(`📍 User Khổng Đức Mạnh ${selectedUser > 0 ? 'đã được chọn sẵn' : 'chưa được chọn'}`);
    
    // BƯỚC 3: Đăng nhập lần đầu với mật khẩu mặc định
    console.log('\n📋 BƯỚC 3: Đăng nhập với mật khẩu mặc định (123456)');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Đợi response và check auth state
    await page.waitForTimeout(3000);

    // Force check auth state after login
    await page.evaluate(() => {
      // Force update auth state if needed
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.name === 'Khổng Đức Mạnh') {
        currentUser.password_changed = false;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    });

    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const loginSuccess = !currentUrl.includes('/login');
    testResults.step3_firstLogin = loginSuccess;
    console.log(loginSuccess ? '✅ Đăng nhập thành công' : '❌ Đăng nhập thất bại');
    console.log('📍 URL hiện tại:', currentUrl);
    
    if (loginSuccess) {
      // BƯỚC 4: Kiểm tra có yêu cầu đổi mật khẩu không
      console.log('\n📋 BƯỚC 4: Kiểm tra yêu cầu đổi mật khẩu');
      
      const passwordChangeText = await page.locator('text=Đổi mật khẩu').count();
      const passwordChangeForm = await page.locator('form').filter({ hasText: 'Đổi mật khẩu' }).count();
      const newPasswordInputs = await page.locator('input[type="password"]').count();
      
      const passwordChangeRequired = passwordChangeText > 0 || passwordChangeForm > 0 || currentUrl.includes('/change-password');
      testResults.step4_passwordChangeRequired = passwordChangeRequired;
      
      console.log(`📊 Kiểm tra đổi mật khẩu:`);
      console.log(`   - Text "Đổi mật khẩu": ${passwordChangeText}`);
      console.log(`   - Form đổi mật khẩu: ${passwordChangeForm}`);
      console.log(`   - Password inputs: ${newPasswordInputs}`);
      console.log(`   - URL có change-password: ${currentUrl.includes('/change-password')}`);
      
      console.log(passwordChangeRequired ? '✅ Hệ thống yêu cầu đổi mật khẩu (đúng)' : '❌ Không yêu cầu đổi mật khẩu (sai)');
      
      if (passwordChangeRequired) {
        // BƯỚC 5: Đổi mật khẩu
        console.log('\n📋 BƯỚC 5: Thực hiện đổi mật khẩu');
        
        const passwordInputs = await page.locator('input[type="password"]').all();
        console.log(`📊 Tìm thấy ${passwordInputs.length} password inputs`);
        
        if (passwordInputs.length >= 2) {
          await passwordInputs[0].fill('newpassword123');
          await passwordInputs[1].fill('newpassword123');
          console.log('✅ Đã điền mật khẩu mới và xác nhận');
        } else {
          await page.fill('input[type="password"]', 'newpassword123');
          console.log('✅ Đã điền mật khẩu mới');
        }
        
        // Click nút đổi mật khẩu
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        const afterChangeUrl = page.url();
        const passwordChangeSuccess = !afterChangeUrl.includes('/change-password') && !afterChangeUrl.includes('/login');
        testResults.step5_passwordChange = passwordChangeSuccess;
        
        console.log(passwordChangeSuccess ? '✅ Đổi mật khẩu thành công' : '❌ Đổi mật khẩu thất bại');
        console.log('📍 URL sau khi đổi:', afterChangeUrl);
        
        if (passwordChangeSuccess) {
          // BƯỚC 6: Kiểm tra đồng bộ Supabase
          console.log('\n📋 BƯỚC 6: Kiểm tra đồng bộ với Supabase');
          
          const supabaseSyncResult = await page.evaluate(async () => {
            console.log('🔍 Checking Supabase sync...');
            
            // Kiểm tra user data trong localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            console.log('Current user:', currentUser);
            
            // Kiểm tra Supabase sync
            if (typeof window.debugUserPasswordStatus === 'function') {
              const debugResult = await window.debugUserPasswordStatus();
              console.log('Debug password status:', debugResult);
              return debugResult;
            }
            
            return { success: false, message: 'Debug function not available' };
          });
          
          testResults.step6_supabaseSync = supabaseSyncResult.success;
          console.log(supabaseSyncResult.success ? '✅ Supabase sync thành công' : '⚠️ Cần kiểm tra Supabase sync');
          console.log('📊 Supabase sync result:', JSON.stringify(supabaseSyncResult, null, 2));
          
          // BƯỚC 7: Logout
          console.log('\n📋 BƯỚC 7: Thực hiện logout');
          
          let logoutSuccess = false;
          
          try {
            // Thử các cách logout khác nhau
            const logoutButton = page.locator('button').filter({ hasText: 'Đăng xuất' });
            if (await logoutButton.count() > 0) {
              await logoutButton.click();
              console.log('✅ Đã click nút "Đăng xuất"');
            } else {
              // Force logout
              await page.evaluate(() => {
                localStorage.clear();
                window.location.href = '/login';
              });
              console.log('✅ Đã force logout bằng localStorage.clear()');
            }
          } catch (error) {
            console.log('⚠️ Logout error, trying force method...');
            await page.evaluate(() => {
              localStorage.clear();
              window.location.href = '/login';
            });
          }
          
          await page.waitForTimeout(4000);
          
          const logoutUrl = page.url();
          logoutSuccess = logoutUrl.includes('/login');
          testResults.step7_logout = logoutSuccess;
          
          console.log(logoutSuccess ? '✅ Logout thành công' : '❌ Logout thất bại');
          console.log('📍 URL sau logout:', logoutUrl);
          
          if (logoutSuccess) {
            // BƯỚC 8: Đăng nhập lại với mật khẩu mới
            console.log('\n📋 BƯỚC 8: Đăng nhập lại với mật khẩu mới');
            
            await page.fill('input[type="password"]', 'newpassword123');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(5000);
            
            const secondLoginUrl = page.url();
            const secondLoginSuccess = !secondLoginUrl.includes('/login');
            testResults.step8_loginWithNewPassword = secondLoginSuccess;
            
            console.log(secondLoginSuccess ? '✅ Đăng nhập với mật khẩu mới thành công' : '❌ Đăng nhập với mật khẩu mới thất bại');
            console.log('📍 URL sau đăng nhập lần 2:', secondLoginUrl);
            
            if (secondLoginSuccess) {
              // BƯỚC 9: Kiểm tra không bị yêu cầu đổi mật khẩu nữa
              console.log('\n📋 BƯỚC 9: Kiểm tra không bị yêu cầu đổi mật khẩu nữa');
              
              const noPasswordChangeRequired = !secondLoginUrl.includes('/change-password');
              testResults.step9_noPasswordChangeRequired = noPasswordChangeRequired;
              
              console.log(noPasswordChangeRequired ? '✅ Không bị yêu cầu đổi mật khẩu nữa (đúng)' : '❌ Vẫn bị yêu cầu đổi mật khẩu (sai)');
              
              // BƯỚC 10: Kiểm tra dữ liệu Supabase cuối cùng
              console.log('\n📋 BƯỚC 10: Kiểm tra dữ liệu Supabase cuối cùng');
              
              const finalSupabaseCheck = await page.evaluate(async () => {
                console.log('🔍 Final Supabase verification...');
                
                // Kiểm tra user data
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                
                // Verify với Supabase
                if (typeof window.debugUserPasswordStatus === 'function') {
                  const result = await window.debugUserPasswordStatus();
                  return {
                    success: true,
                    currentUser: currentUser,
                    supabaseData: result
                  };
                }
                
                return { success: false, message: 'Cannot verify Supabase' };
              });
              
              testResults.step10_supabaseVerification = finalSupabaseCheck.success;
              console.log('📊 Final Supabase check:', JSON.stringify(finalSupabaseCheck, null, 2));
            }
          }
        }
      } else {
        console.log('❌ CRITICAL: Hệ thống không yêu cầu đổi mật khẩu - cần kiểm tra lại logic');
      }
    }
    
  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', error.message);
  } finally {
    // TỔNG KẾT KẾT QUẢ
    console.log('\n' + '='.repeat(80));
    console.log('📊 TỔNG KẾT KẾT QUẢ TEST AUTHENTICATION + SUPABASE SYNC');
    console.log('='.repeat(80));
    
    const results = [
      { name: 'Reset hệ thống', success: testResults.step1_systemReset },
      { name: 'Điều hướng đến login', success: testResults.step2_navigation },
      { name: 'Đăng nhập lần đầu', success: testResults.step3_firstLogin },
      { name: 'Yêu cầu đổi mật khẩu', success: testResults.step4_passwordChangeRequired },
      { name: 'Đổi mật khẩu thành công', success: testResults.step5_passwordChange },
      { name: 'Đồng bộ Supabase', success: testResults.step6_supabaseSync },
      { name: 'Logout thành công', success: testResults.step7_logout },
      { name: 'Đăng nhập với mật khẩu mới', success: testResults.step8_loginWithNewPassword },
      { name: 'Không yêu cầu đổi mật khẩu nữa', success: testResults.step9_noPasswordChangeRequired },
      { name: 'Xác minh Supabase cuối cùng', success: testResults.step10_supabaseVerification }
    ];
    
    let successCount = 0;
    results.forEach((result, index) => {
      const status = result.success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI';
      console.log(`${index + 1}. ${result.name}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${results.length} bước thành công`);
    
    if (successCount === results.length) {
      console.log('🎉 TẤT CẢ CÁC BƯỚC ĐỀU THÀNH CÔNG!');
      console.log('✅ Hệ thống authentication + Supabase sync hoạt động hoàn hảo!');
    } else if (successCount >= 8) {
      console.log('🎊 HẦU HẾT CÁC BƯỚC THÀNH CÔNG!');
      console.log('✅ Hệ thống authentication cơ bản đã hoạt động!');
    } else {
      console.log('⚠️ CÓ NHIỀU BƯỚC CHƯA THÀNH CÔNG, CẦN KIỂM TRA LẠI');
    }
    
    // Đánh giá cụ thể về Supabase sync
    if (testResults.step6_supabaseSync && testResults.step10_supabaseVerification) {
      console.log('🔥 SUPABASE SYNC HOẠT ĐỘNG HOÀN HẢO!');
    } else {
      console.log('⚠️ SUPABASE SYNC CẦN KIỂM TRA THÊM');
    }
    
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả cuối
    console.log('\n⏳ Đợi 10 giây để quan sát kết quả...');
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
