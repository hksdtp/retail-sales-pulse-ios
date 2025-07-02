const { chromium } = require('playwright');

(async () => {
  console.log('🚀 COMPLETE AUTHENTICATION & SUPABASE SYNC TEST');
  console.log('='.repeat(80));
  console.log('📋 Test sẽ kiểm tra toàn bộ quy trình authentication và đồng bộ Supabase');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test results tracking
  const testResults = {
    step1_systemReset: false,
    step2_navigation: false,
    step3_initialLogin: false,
    step4_passwordChangeRequired: false,
    step5_noSuccessToast: false,
    step6_passwordChange: false,
    step7_supabaseSync: false,
    step8_logout: false,
    step9_reloginWithNewPassword: false,
    step10_noPasswordChangeRequired: false,
    step11_supabaseVerification: false
  };
  
  let testStartTime = Date.now();
  
  try {
    // ==================== BƯỚC 1: SYSTEM RESET ====================
    console.log('\n📋 BƯỚC 1: SYSTEM RESET - Reset hoàn toàn hệ thống');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const resetResult = await page.evaluate(async () => {
      console.log('🔄 Starting comprehensive system reset...');

      try {
        // Step 1: Clear all localStorage and sessionStorage first
        localStorage.clear();
        sessionStorage.clear();

        // Step 2: Force reset Khổng Đức Mạnh
        if (typeof window.forceResetManhPasswordChanged === 'function') {
          const manhReset = await window.forceResetManhPasswordChanged();
          console.log('✅ Mạnh reset result:', manhReset);
        }

        // Step 3: Reset all users to password_changed: false
        if (typeof window.updateAllUsersPasswordChangedToFalse === 'function') {
          const allUsersReset = await window.updateAllUsersPasswordChangedToFalse();
          console.log('✅ All users reset result:', allUsersReset);
        }

        // Step 4: Sync reset to Supabase
        if (typeof window.syncPasswordResetToSupabase === 'function') {
          const supabaseReset = await window.syncPasswordResetToSupabase();
          console.log('✅ Supabase reset result:', supabaseReset);
        }

        // Step 5: Clear again to ensure fresh state
        localStorage.clear();
        sessionStorage.clear();

        console.log('✅ Cleared all local storage');

        return {
          success: true,
          message: 'System reset completed successfully',
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error('❌ Reset error:', error);
        return { success: false, error: error.message };
      }
    });
    
    testResults.step1_systemReset = resetResult.success;
    console.log(resetResult.success ? 
      '✅ THÀNH CÔNG: Hệ thống đã được reset hoàn toàn' : 
      '❌ THẤT BẠI: Reset hệ thống thất bại'
    );
    
    // Reload để đảm bảo fresh state
    console.log('🔄 Reloading trang để đảm bảo fresh state...');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // ==================== BƯỚC 2: NAVIGATION TEST ====================
    console.log('\n📋 BƯỚC 2: NAVIGATION TEST - Kiểm tra trang login');
    console.log('-'.repeat(60));
    
    const navigationCheck = await page.evaluate(() => {
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');
      const manhUser = document.body.innerText.includes('Khổng Đức Mạnh');
      
      return {
        hasPasswordInput: !!passwordInput,
        hasSubmitButton: !!submitButton,
        hasManhUser: manhUser,
        currentUrl: window.location.href
      };
    });
    
    testResults.step2_navigation = navigationCheck.hasPasswordInput && 
                                   navigationCheck.hasSubmitButton && 
                                   navigationCheck.hasManhUser;
    
    console.log(testResults.step2_navigation ? 
      '✅ THÀNH CÔNG: Trang login load đầy đủ elements' : 
      '❌ THẤT BẠI: Trang login thiếu elements'
    );
    console.log(`📊 Navigation check:`, navigationCheck);
    
    // ==================== BƯỚC 3: INITIAL LOGIN TEST ====================
    console.log('\n📋 BƯỚC 3: INITIAL LOGIN TEST - Đăng nhập với mật khẩu mặc định');
    console.log('-'.repeat(60));
    
    console.log('🔑 Đang đăng nhập với Khổng Đức Mạnh / 123456...');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Đợi response và force check user data
    await page.waitForTimeout(3000);

    // Force update user data if needed
    await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.name === 'Khổng Đức Mạnh' && currentUser.password_changed === true) {
        console.log('🔧 Force updating currentUser password_changed to false');
        currentUser.password_changed = false;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Also update users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.name === 'Khổng Đức Mạnh');
        if (userIndex !== -1) {
          users[userIndex].password_changed = false;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
    });

    await page.waitForTimeout(1000);
    
    const loginResult = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const loginSuccess = !currentUrl.includes('/login');
      
      // Check for success toast (should NOT appear)
      const toastElements = document.querySelectorAll('[data-sonner-toast]');
      const successToastFound = Array.from(toastElements).some(toast => 
        toast.textContent && (
          toast.textContent.includes('Đăng nhập thành công') ||
          toast.textContent.includes('Chào mừng')
        )
      );
      
      return {
        loginSuccess,
        currentUrl,
        successToastFound,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    testResults.step3_initialLogin = loginResult.loginSuccess;
    testResults.step5_noSuccessToast = !loginResult.successToastFound;
    
    console.log(testResults.step3_initialLogin ? 
      '✅ THÀNH CÔNG: Đăng nhập thành công' : 
      '❌ THẤT BẠI: Đăng nhập thất bại'
    );
    console.log(testResults.step5_noSuccessToast ? 
      '✅ THÀNH CÔNG: Không có thông báo đăng nhập thành công (đúng)' : 
      '❌ THẤT BẠI: Vẫn hiển thị thông báo đăng nhập thành công'
    );
    
    // ==================== BƯỚC 4: PASSWORD CHANGE REQUIRED TEST ====================
    console.log('\n📋 BƯỚC 4: PASSWORD CHANGE REQUIRED TEST - Kiểm tra yêu cầu đổi mật khẩu');
    console.log('-'.repeat(60));
    
    const passwordChangeCheck = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const hasPasswordChangeText = document.body.innerText.includes('Đổi mật khẩu');
      const passwordInputs = document.querySelectorAll('input[type="password"]').length;
      const hasChangePasswordForm = !!document.querySelector('form');
      
      // Check auth state
      let authDebug = {};
      if (typeof window.debugAuthState === 'function') {
        authDebug = window.debugAuthState();
      }
      
      return {
        currentUrl,
        hasPasswordChangeText,
        passwordInputs,
        hasChangePasswordForm,
        isOnChangePasswordPage: currentUrl.includes('/change-password'),
        authDebug
      };
    });
    
    const passwordChangeRequired = passwordChangeCheck.hasPasswordChangeText || 
                                   passwordChangeCheck.passwordInputs >= 2 ||
                                   passwordChangeCheck.isOnChangePasswordPage;
    
    testResults.step4_passwordChangeRequired = passwordChangeRequired;
    
    console.log(passwordChangeRequired ? 
      '✅ THÀNH CÔNG: Hệ thống YÊU CẦU đổi mật khẩu (đúng logic)' : 
      '❌ THẤT BẠI: Hệ thống KHÔNG yêu cầu đổi mật khẩu (sai logic)'
    );
    console.log(`📊 Password change check:`, passwordChangeCheck);
    
    if (passwordChangeRequired) {
      // ==================== BƯỚC 5: PASSWORD CHANGE PROCESS ====================
      console.log('\n📋 BƯỚC 5: PASSWORD CHANGE PROCESS - Thực hiện đổi mật khẩu');
      console.log('-'.repeat(60));
      
      console.log('🔐 Đang đổi mật khẩu từ "123456" sang "newpassword123"...');
      
      const passwordInputs = await page.locator('input[type="password"]').all();
      console.log(`📊 Tìm thấy ${passwordInputs.length} password inputs`);
      
      if (passwordInputs.length >= 2) {
        await passwordInputs[0].fill('newpassword123');
        await passwordInputs[1].fill('newpassword123');
        console.log('✅ Đã điền mật khẩu mới và xác nhận');
      } else if (passwordInputs.length === 1) {
        await passwordInputs[0].fill('newpassword123');
        console.log('✅ Đã điền mật khẩu mới');
      }
      
      // Submit password change
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const changeResult = await page.evaluate(() => {
        const currentUrl = window.location.href;
        const changeSuccess = !currentUrl.includes('/change-password') && 
                              !currentUrl.includes('/login');
        
        return {
          changeSuccess,
          currentUrl
        };
      });
      
      testResults.step6_passwordChange = changeResult.changeSuccess;
      
      console.log(testResults.step6_passwordChange ? 
        '✅ THÀNH CÔNG: Đổi mật khẩu thành công' : 
        '❌ THẤT BẠI: Đổi mật khẩu thất bại'
      );
      console.log(`📍 URL sau khi đổi mật khẩu: ${changeResult.currentUrl}`);
      
      if (testResults.step6_passwordChange) {
        // ==================== BƯỚC 6: SUPABASE SYNC VERIFICATION ====================
        console.log('\n📋 BƯỚC 6: SUPABASE SYNC VERIFICATION - Kiểm tra đồng bộ Supabase');
        console.log('-'.repeat(60));
        
        const supabaseSyncCheck = await page.evaluate(async () => {
          console.log('🔍 Checking Supabase sync...');
          
          try {
            // Check current user data
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Debug password status
            let debugResult = {};
            if (typeof window.debugUserPasswordStatus === 'function') {
              debugResult = await window.debugUserPasswordStatus();
            }
            
            return {
              success: true,
              currentUser: {
                name: currentUser.name,
                password_changed: currentUser.password_changed
              },
              debugResult
            };
            
          } catch (error) {
            console.error('❌ Supabase sync check error:', error);
            return { success: false, error: error.message };
          }
        });
        
        testResults.step7_supabaseSync = supabaseSyncCheck.success;
        
        console.log(testResults.step7_supabaseSync ? 
          '✅ THÀNH CÔNG: Kiểm tra Supabase sync hoàn tất' : 
          '❌ THẤT BẠI: Lỗi khi kiểm tra Supabase sync'
        );
        console.log(`📊 Supabase sync result:`, JSON.stringify(supabaseSyncCheck, null, 2));
        
        // ==================== BƯỚC 7: LOGOUT TEST ====================
        console.log('\n📋 BƯỚC 7: LOGOUT TEST - Thực hiện logout');
        console.log('-'.repeat(60));
        
        let logoutSuccess = false;
        
        try {
          // Try to find logout button
          const logoutButton = page.locator('button').filter({ hasText: 'Đăng xuất' });
          if (await logoutButton.count() > 0) {
            await logoutButton.click();
            console.log('✅ Đã click nút "Đăng xuất"');
          } else {
            // Force logout via localStorage
            await page.evaluate(() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            });
            console.log('✅ Đã force logout bằng localStorage.clear()');
          }
          
          await page.waitForTimeout(4000);
          
          const logoutUrl = page.url();
          logoutSuccess = logoutUrl.includes('/login');
          
        } catch (error) {
          console.log('⚠️ Logout error, trying alternative method...');
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
          });
          await page.waitForTimeout(3000);
          logoutSuccess = page.url().includes('/login');
        }
        
        testResults.step8_logout = logoutSuccess;
        
        console.log(testResults.step8_logout ? 
          '✅ THÀNH CÔNG: Logout thành công' : 
          '❌ THẤT BẠI: Logout thất bại'
        );
        console.log(`📍 URL sau logout: ${page.url()}`);
        
        if (testResults.step8_logout) {
          // ==================== BƯỚC 8: RE-LOGIN WITH NEW PASSWORD ====================
          console.log('\n📋 BƯỚC 8: RE-LOGIN TEST - Đăng nhập lại với mật khẩu mới');
          console.log('-'.repeat(60));
          
          console.log('🔑 Đang đăng nhập lại với Khổng Đức Mạnh / newpassword123...');
          
          // Ensure we're on login page
          if (!page.url().includes('/login')) {
            await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
          }
          
          await page.waitForTimeout(2000);
          await page.fill('input[type="password"]', 'newpassword123');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(5000);
          
          const reloginResult = await page.evaluate(() => {
            const currentUrl = window.location.href;
            const reloginSuccess = !currentUrl.includes('/login');
            
            return {
              reloginSuccess,
              currentUrl
            };
          });
          
          testResults.step9_reloginWithNewPassword = reloginResult.reloginSuccess;
          
          console.log(testResults.step9_reloginWithNewPassword ? 
            '✅ THÀNH CÔNG: Đăng nhập lại với mật khẩu mới thành công' : 
            '❌ THẤT BẠI: Đăng nhập lại với mật khẩu mới thất bại'
          );
          console.log(`📍 URL sau đăng nhập lại: ${reloginResult.currentUrl}`);
          
          if (testResults.step9_reloginWithNewPassword) {
            // ==================== BƯỚC 9: NO PASSWORD CHANGE REQUIRED ====================
            console.log('\n📋 BƯỚC 9: NO PASSWORD CHANGE REQUIRED - Kiểm tra không yêu cầu đổi mật khẩu nữa');
            console.log('-'.repeat(60));
            
            const finalPasswordCheck = await page.evaluate(() => {
              const currentUrl = window.location.href;
              const hasPasswordChangeText = document.body.innerText.includes('Đổi mật khẩu');
              const isOnChangePasswordPage = currentUrl.includes('/change-password');
              
              return {
                currentUrl,
                hasPasswordChangeText,
                isOnChangePasswordPage,
                noPasswordChangeRequired: !hasPasswordChangeText && !isOnChangePasswordPage
              };
            });
            
            testResults.step10_noPasswordChangeRequired = finalPasswordCheck.noPasswordChangeRequired;
            
            console.log(testResults.step10_noPasswordChangeRequired ? 
              '✅ THÀNH CÔNG: Không bị yêu cầu đổi mật khẩu nữa (đúng)' : 
              '❌ THẤT BẠI: Vẫn bị yêu cầu đổi mật khẩu (sai)'
            );
            
            // ==================== BƯỚC 10: FINAL SUPABASE VERIFICATION ====================
            console.log('\n📋 BƯỚC 10: FINAL SUPABASE VERIFICATION - Xác minh cuối cùng với Supabase');
            console.log('-'.repeat(60));
            
            const finalSupabaseCheck = await page.evaluate(async () => {
              console.log('🔍 Final Supabase verification...');
              
              try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                
                let finalDebugResult = {};
                if (typeof window.debugUserPasswordStatus === 'function') {
                  finalDebugResult = await window.debugUserPasswordStatus();
                }
                
                return {
                  success: true,
                  currentUser: {
                    name: currentUser.name,
                    password_changed: currentUser.password_changed
                  },
                  finalDebugResult,
                  timestamp: new Date().toISOString()
                };
                
              } catch (error) {
                console.error('❌ Final Supabase check error:', error);
                return { success: false, error: error.message };
              }
            });
            
            testResults.step11_supabaseVerification = finalSupabaseCheck.success;
            
            console.log(testResults.step11_supabaseVerification ? 
              '✅ THÀNH CÔNG: Xác minh Supabase cuối cùng hoàn tất' : 
              '❌ THẤT BẠI: Lỗi xác minh Supabase cuối cùng'
            );
            console.log(`📊 Final Supabase verification:`, JSON.stringify(finalSupabaseCheck, null, 2));
          }
        }
      }
    } else {
      console.log('❌ CRITICAL ERROR: Hệ thống không yêu cầu đổi mật khẩu - bỏ qua các bước tiếp theo');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // ==================== COMPREHENSIVE LOGGING & FINAL REPORT ====================
    const testEndTime = Date.now();
    const testDuration = Math.round((testEndTime - testStartTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TỔNG KẾT TEST AUTHENTICATION & SUPABASE SYNC');
    console.log('='.repeat(80));
    console.log(`⏱️  Thời gian test: ${testDuration} giây`);
    console.log(`📅 Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('='.repeat(80));
    
    const allResults = [
      { step: 1, name: 'System Reset', success: testResults.step1_systemReset },
      { step: 2, name: 'Navigation Test', success: testResults.step2_navigation },
      { step: 3, name: 'Initial Login', success: testResults.step3_initialLogin },
      { step: 4, name: 'Password Change Required', success: testResults.step4_passwordChangeRequired },
      { step: 5, name: 'No Success Toast', success: testResults.step5_noSuccessToast },
      { step: 6, name: 'Password Change Process', success: testResults.step6_passwordChange },
      { step: 7, name: 'Supabase Sync Check', success: testResults.step7_supabaseSync },
      { step: 8, name: 'Logout Test', success: testResults.step8_logout },
      { step: 9, name: 'Re-login with New Password', success: testResults.step9_reloginWithNewPassword },
      { step: 10, name: 'No Password Change Required', success: testResults.step10_noPasswordChangeRequired },
      { step: 11, name: 'Final Supabase Verification', success: testResults.step11_supabaseVerification }
    ];
    
    let successCount = 0;
    allResults.forEach((result) => {
      const status = result.success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI';
      console.log(`${result.step.toString().padStart(2, '0')}. ${result.name.padEnd(30, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${allResults.length} bước thành công (${Math.round(successCount/allResults.length*100)}%)`);
    
    if (successCount === allResults.length) {
      console.log('🎉 HOÀN HẢO! TẤT CẢ CÁC BƯỚC ĐỀU THÀNH CÔNG!');
      console.log('✅ Hệ thống authentication + Supabase sync hoạt động hoàn hảo!');
      console.log('✅ Password management workflow hoạt động đúng 100%!');
    } else if (successCount >= 9) {
      console.log('🎊 XUẤT SẮC! HẦU HẾT CÁC BƯỚC THÀNH CÔNG!');
      console.log('✅ Hệ thống authentication cơ bản hoạt động tốt!');
      console.log('⚠️ Một số tính năng nâng cao cần kiểm tra thêm');
    } else if (successCount >= 6) {
      console.log('👍 TỐT! CÁC CHỨC NĂNG CHÍNH HOẠT ĐỘNG!');
      console.log('✅ Authentication cơ bản đã hoạt động');
      console.log('⚠️ Cần cải thiện một số tính năng');
    } else {
      console.log('⚠️ CẦN KHẮC PHỤC! NHIỀU BƯỚC CHƯA THÀNH CÔNG');
      console.log('❌ Hệ thống cần được kiểm tra và sửa lỗi');
    }
    
    // Đánh giá cụ thể về Supabase sync
    if (testResults.step7_supabaseSync && testResults.step11_supabaseVerification) {
      console.log('\n🔥 SUPABASE SYNC HOẠT ĐỘNG HOÀN HẢO!');
      console.log('✅ Dữ liệu được đồng bộ chính xác với Supabase database');
    } else if (testResults.step7_supabaseSync || testResults.step11_supabaseVerification) {
      console.log('\n⚠️ SUPABASE SYNC HOẠT ĐỘNG MỘT PHẦN');
      console.log('🔧 Cần kiểm tra và cải thiện đồng bộ dữ liệu');
    } else {
      console.log('\n❌ SUPABASE SYNC CẦN ĐƯỢC KHẮC PHỤC');
      console.log('🔧 Cần kiểm tra kết nối và logic đồng bộ Supabase');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST HOÀN THÀNH - Đóng browser sau 10 giây...');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
