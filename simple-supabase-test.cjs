const { chromium } = require('playwright');

(async () => {
  console.log('🚀 SIMPLE SUPABASE MIGRATION TEST');
  console.log('='.repeat(80));
  console.log('📋 Testing Supabase integration and UI improvements');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test results tracking
  const testResults = {
    step1_pageLoad: false,
    step2_authSetup: false,
    step3_tasksPageAccess: false,
    step4_loadingImprovement: false,
    step5_uiInteraction: false,
    step6_supabaseConfig: false
  };
  
  let testStartTime = Date.now();
  
  try {
    // ==================== BƯỚC 1: PAGE LOAD TEST ====================
    console.log('\n📋 BƯỚC 1: PAGE LOAD TEST - Kiểm tra tải trang');
    console.log('-'.repeat(60));
    
    const loadStart = Date.now();
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loadEnd = Date.now();
    const loadTime = loadEnd - loadStart;
    
    testResults.step1_pageLoad = loadTime < 10000; // 10 seconds threshold
    
    console.log(testResults.step1_pageLoad ? 
      '✅ THÀNH CÔNG: Trang load nhanh' : 
      '❌ THẤT BẠI: Trang load chậm'
    );
    console.log(`📊 Thời gian load: ${loadTime}ms`);
    
    // ==================== BƯỚC 2: AUTH SETUP ====================
    console.log('\n📋 BƯỚC 2: AUTH SETUP - Thiết lập authentication');
    console.log('-'.repeat(60));
    
    // Setup fake session for testing
    const authSetup = await page.evaluate(() => {
      try {
        const fakeUser = {
          id: '1b',
          name: 'Khổng Đức Mạnh',
          email: 'manh.khong@example.com',
          role: 'retail_director',
          team_id: '1',
          location: 'Hà Nội',
          department: 'Bán lẻ',
          department_type: 'retail',
          position: 'Trưởng phòng',
          status: 'active',
          password_changed: true
        };
        
        localStorage.setItem('currentUser', JSON.stringify(fakeUser));
        localStorage.setItem('authToken', 'fake-auth-token');
        localStorage.setItem('loginType', 'standard');
        
        return { success: true, user: fakeUser };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    testResults.step2_authSetup = authSetup.success;
    
    console.log(testResults.step2_authSetup ? 
      '✅ THÀNH CÔNG: Auth setup hoàn tất' : 
      '❌ THẤT BẠI: Auth setup thất bại'
    );
    console.log(`📊 User: ${authSetup.user?.name}`);
    
    // ==================== BƯỚC 3: TASKS PAGE ACCESS ====================
    console.log('\n📋 BƯỚC 3: TASKS PAGE ACCESS - Truy cập trang công việc');
    console.log('-'.repeat(60));
    
    const tasksLoadStart = Date.now();
    
    await page.goto('http://localhost:8088/tasks', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    const tasksLoadEnd = Date.now();
    const tasksLoadTime = tasksLoadEnd - tasksLoadStart;
    
    const tasksPageCheck = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const isOnTasksPage = currentUrl.includes('/tasks');
      const hasButtons = document.querySelectorAll('button').length;
      const hasTasksContent = document.body.innerText.includes('Công việc');
      
      return {
        isOnTasksPage,
        hasButtons,
        hasTasksContent,
        currentUrl,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    testResults.step3_tasksPageAccess = tasksPageCheck.isOnTasksPage && 
                                        tasksPageCheck.hasButtons > 0;
    
    console.log(testResults.step3_tasksPageAccess ? 
      '✅ THÀNH CÔNG: Truy cập trang tasks thành công' : 
      '❌ THẤT BẠI: Không thể truy cập trang tasks'
    );
    console.log(`📊 Thời gian load tasks: ${tasksLoadTime}ms`);
    console.log(`📊 Số buttons: ${tasksPageCheck.hasButtons}`);
    
    // ==================== BƯỚC 4: LOADING IMPROVEMENT TEST ====================
    console.log('\n📋 BƯỚC 4: LOADING IMPROVEMENT TEST - Kiểm tra cải thiện loading');
    console.log('-'.repeat(60));
    
    const loadingCheck = await page.evaluate(() => {
      // Check for blocking loading screens (exclude background elements with negative z-index)
      const blockingLoaders = Array.from(document.querySelectorAll('.fixed.inset-0, [class*="LoadingScreen"]'))
        .filter(el => {
          const style = getComputedStyle(el);
          const zIndex = parseInt(style.zIndex) || 0;
          return style.display !== 'none' &&
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0' &&
                 zIndex >= 0; // Exclude background elements with negative z-index
        });
      
      // Check for inline loading spinners
      const inlineLoaders = document.querySelectorAll('[class*="InlineLoadingSpinner"], .animate-spin');
      
      // Check for loading text
      const hasLoadingText = document.body.innerText.includes('Đang khởi tạo') ||
                            document.body.innerText.includes('Đang tải');
      
      // Check if UI is interactive
      const interactiveButtons = Array.from(document.querySelectorAll('button'))
        .filter(btn => !btn.disabled && btn.offsetParent !== null);
      
      return {
        blockingLoadersCount: blockingLoaders.length,
        inlineLoadersCount: inlineLoaders.length,
        hasLoadingText,
        interactiveButtonsCount: interactiveButtons.length,
        isUIInteractive: interactiveButtons.length > 0 && blockingLoaders.length === 0
      };
    });
    
    testResults.step4_loadingImprovement = loadingCheck.isUIInteractive && 
                                           loadingCheck.blockingLoadersCount === 0;
    
    console.log(testResults.step4_loadingImprovement ? 
      '✅ THÀNH CÔNG: Loading improvement hoạt động' : 
      '❌ THẤT BẠI: Vẫn có blocking loading'
    );
    console.log('📊 Loading check:', JSON.stringify(loadingCheck, null, 2));
    
    // ==================== BƯỚC 5: UI INTERACTION TEST ====================
    console.log('\n📋 BƯỚC 5: UI INTERACTION TEST - Kiểm tra tương tác UI');
    console.log('-'.repeat(60));
    
    let uiInteractionSuccess = false;
    
    try {
      // Test button interactions
      const buttons = await page.locator('button').filter({ 
        hasText: /Tạo|Làm mới|Xuất|Tải lại/ 
      }).all();
      
      console.log(`📊 Tìm thấy ${buttons.length} buttons có thể tương tác`);
      
      if (buttons.length > 0) {
        // Test hover effect
        await buttons[0].hover();
        await page.waitForTimeout(500);
        
        // Test if button is clickable (don't actually click to avoid side effects)
        const isClickable = await buttons[0].isEnabled();
        
        uiInteractionSuccess = isClickable;
        console.log(`✅ Button clickable: ${isClickable}`);
      }
    } catch (error) {
      console.log('⚠️ UI interaction test error:', error.message);
    }
    
    testResults.step5_uiInteraction = uiInteractionSuccess;
    
    console.log(testResults.step5_uiInteraction ? 
      '✅ THÀNH CÔNG: UI tương tác tốt' : 
      '❌ THẤT BẠI: UI không tương tác được'
    );
    
    // ==================== BƯỚC 6: SUPABASE CONFIG TEST ====================
    console.log('\n📋 BƯỚC 6: SUPABASE CONFIG TEST - Kiểm tra cấu hình Supabase');
    console.log('-'.repeat(60));
    
    const supabaseConfigTest = await page.evaluate(async () => {
      try {
        // Check if Supabase service is available
        const hasSupabaseService = typeof window.SupabaseService !== 'undefined';
        
        // Check localStorage for Supabase config
        const supabaseConfig = localStorage.getItem('supabaseConfig');
        const hasStoredConfig = !!supabaseConfig;
        
        // Try to access Supabase via dynamic import
        let importSuccess = false;
        try {
          const module = await import('/src/services/SupabaseService.ts');
          importSuccess = !!module.SupabaseService;
        } catch (e) {
          importSuccess = false;
        }
        
        return {
          success: hasStoredConfig || importSuccess,
          hasSupabaseService,
          hasStoredConfig,
          importSuccess,
          configData: supabaseConfig ? JSON.parse(supabaseConfig) : null
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    testResults.step6_supabaseConfig = supabaseConfigTest.success;
    
    console.log(testResults.step6_supabaseConfig ? 
      '✅ THÀNH CÔNG: Supabase config có sẵn' : 
      '❌ THẤT BẠI: Supabase config không có'
    );
    console.log('📊 Supabase config test:', JSON.stringify(supabaseConfigTest, null, 2));
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // ==================== FINAL REPORT ====================
    const testEndTime = Date.now();
    const testDuration = Math.round((testEndTime - testStartTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TỔNG KẾT SIMPLE SUPABASE TEST');
    console.log('='.repeat(80));
    console.log(`⏱️  Thời gian test: ${testDuration} giây`);
    console.log(`📅 Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('='.repeat(80));
    
    const allResults = [
      { step: 1, name: 'Page Load Performance', success: testResults.step1_pageLoad },
      { step: 2, name: 'Authentication Setup', success: testResults.step2_authSetup },
      { step: 3, name: 'Tasks Page Access', success: testResults.step3_tasksPageAccess },
      { step: 4, name: 'Loading Improvement', success: testResults.step4_loadingImprovement },
      { step: 5, name: 'UI Interaction', success: testResults.step5_uiInteraction },
      { step: 6, name: 'Supabase Configuration', success: testResults.step6_supabaseConfig }
    ];
    
    let successCount = 0;
    allResults.forEach((result) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${result.step.toString().padStart(2, '0')}. ${result.name.padEnd(25, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${allResults.length} tests passed (${Math.round(successCount/allResults.length*100)}%)`);
    
    if (successCount === allResults.length) {
      console.log('🎉 HOÀN HẢO! TẤT CẢ TESTS ĐỀU PASS!');
      console.log('✅ Hệ thống hoạt động hoàn hảo!');
    } else if (successCount >= 4) {
      console.log('🎊 TỐT! HẦU HẾT TESTS PASS!');
      console.log('✅ Hệ thống hoạt động tốt với một số cải thiện nhỏ!');
    } else if (successCount >= 2) {
      console.log('👍 TRUNG BÌNH! CÁC CHỨC NĂNG CƠ BẢN HOẠT ĐỘNG!');
      console.log('⚠️ Cần cải thiện một số tính năng!');
    } else {
      console.log('⚠️ CẦN KHẮC PHỤC! NHIỀU VẤN ĐỀ!');
      console.log('❌ Hệ thống cần được kiểm tra và sửa chữa!');
    }
    
    console.log('\n📊 PHÂN TÍCH CHI TIẾT:');
    console.log(`⚡ Performance: ${testResults.step1_pageLoad ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
    console.log(`🔐 Authentication: ${testResults.step2_authSetup ? 'OK' : 'FAIL'}`);
    console.log(`📋 Tasks Access: ${testResults.step3_tasksPageAccess ? 'OK' : 'FAIL'}`);
    console.log(`🔄 Loading Fix: ${testResults.step4_loadingImprovement ? 'FIXED' : 'STILL BLOCKING'}`);
    console.log(`🎨 UI Interaction: ${testResults.step5_uiInteraction ? 'RESPONSIVE' : 'ISSUES'}`);
    console.log(`🗄️  Supabase Config: ${testResults.step6_supabaseConfig ? 'AVAILABLE' : 'MISSING'}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SIMPLE SUPABASE TEST HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
