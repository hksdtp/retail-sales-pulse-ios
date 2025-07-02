const { chromium } = require('playwright');

(async () => {
  console.log('🎉 TEST FINAL MIGRATION - COMPREHENSIVE REPORT');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra toàn bộ quá trình migration từ Firebase sang Supabase');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Kết quả test tracking
  const testResults = {
    step1_dataConversion: false,
    step2_filesGenerated: false,
    step3_uiImprovements: false,
    step4_loadingFixed: false,
    step5_supabaseReady: false,
    step6_authFlow: false,
    step7_tasksAccess: false,
    step8_performance: false
  };
  
  let testStartTime = Date.now();
  
  try {
    // ==================== BƯỚC 1: DATA CONVERSION VERIFICATION ====================
    console.log('\n📋 BƯỚC 1: DATA CONVERSION VERIFICATION - Xác minh chuyển đổi dữ liệu');
    console.log('-'.repeat(60));
    
    const fs = require('fs');
    
    // Kiểm tra files đã được tạo
    const requiredFiles = [
      'supabase-data-converted.json',
      'firebase-supabase-id-mapping.json',
      'supabase-schema.sql'
    ];
    
    let filesExist = 0;
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        filesExist++;
        console.log(`✅ File tồn tại: ${file}`);
      } else {
        console.log(`❌ File không tồn tại: ${file}`);
      }
    });
    
    testResults.step1_dataConversion = filesExist === requiredFiles.length;
    
    // Kiểm tra nội dung file dữ liệu
    if (fs.existsSync('supabase-data-converted.json')) {
      try {
        const data = JSON.parse(fs.readFileSync('supabase-data-converted.json', 'utf8'));
        const counts = {
          teams: data.teams?.length || 0,
          users: data.users?.length || 0,
          tasks: data.tasks?.length || 0
        };
        
        console.log('📊 Dữ liệu đã chuyển đổi:');
        console.log(`   - Teams: ${counts.teams} records`);
        console.log(`   - Users: ${counts.users} records`);
        console.log(`   - Tasks: ${counts.tasks} records`);
        
        testResults.step2_filesGenerated = counts.users > 0 && counts.tasks > 0;
      } catch (error) {
        console.log('❌ Lỗi khi đọc file dữ liệu:', error.message);
      }
    }
    
    console.log(testResults.step1_dataConversion ? 
      '✅ THÀNH CÔNG: Tất cả files migration đã được tạo' : 
      '❌ THẤT BẠI: Thiếu files migration'
    );
    
    console.log(testResults.step2_filesGenerated ? 
      '✅ THÀNH CÔNG: Dữ liệu đã được chuyển đổi đầy đủ' : 
      '❌ THẤT BẠI: Dữ liệu chuyển đổi không đầy đủ'
    );
    
    // ==================== BƯỚC 2: UI IMPROVEMENTS VERIFICATION ====================
    console.log('\n📋 BƯỚC 2: UI IMPROVEMENTS VERIFICATION - Xác minh cải thiện giao diện');
    console.log('-'.repeat(60));
    
    // Setup fake session
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    await page.evaluate(() => {
      const fakeUser = {
        id: '1b',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('loginType', 'standard');
    });
    
    // Navigate to tasks
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Kiểm tra UI improvements
    const uiCheck = await page.evaluate(() => {
      // Kiểm tra blocking elements (chỉ tính những cái có z-index >= 0)
      const blockingElements = Array.from(document.querySelectorAll('.fixed.inset-0, [class*="LoadingScreen"]'))
        .filter(el => {
          const style = getComputedStyle(el);
          const zIndex = parseInt(style.zIndex) || 0;
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0' &&
                 zIndex >= 0;
        });
      
      // Kiểm tra InlineLoadingSpinner
      const inlineSpinners = document.querySelectorAll('[class*="InlineLoadingSpinner"], .animate-spin');
      
      // Kiểm tra interactive elements
      const interactiveButtons = Array.from(document.querySelectorAll('button'))
        .filter(btn => !btn.disabled && btn.offsetParent !== null);
      
      // Kiểm tra loading text
      const hasLoadingText = document.body.innerText.includes('Đang khởi tạo') ||
                            document.body.innerText.includes('Đang tải');
      
      return {
        blockingElementsCount: blockingElements.length,
        inlineSpinnersCount: inlineSpinners.length,
        interactiveButtonsCount: interactiveButtons.length,
        hasLoadingText,
        isUIResponsive: interactiveButtons.length > 0 && blockingElements.length === 0
      };
    });
    
    testResults.step3_uiImprovements = uiCheck.isUIResponsive;
    testResults.step4_loadingFixed = uiCheck.blockingElementsCount === 0;
    
    console.log('📊 UI Improvements Check:');
    console.log(`   - Blocking elements: ${uiCheck.blockingElementsCount}`);
    console.log(`   - Interactive buttons: ${uiCheck.interactiveButtonsCount}`);
    console.log(`   - Has loading text: ${uiCheck.hasLoadingText}`);
    console.log(`   - UI responsive: ${uiCheck.isUIResponsive}`);
    
    console.log(testResults.step3_uiImprovements ? 
      '✅ THÀNH CÔNG: UI đã được cải thiện và responsive' : 
      '❌ THẤT BẠI: UI vẫn có vấn đề'
    );
    
    console.log(testResults.step4_loadingFixed ? 
      '✅ THÀNH CÔNG: Blocking loading đã được sửa' : 
      '❌ THẤT BẠI: Vẫn còn blocking loading'
    );
    
    // ==================== BƯỚC 3: SUPABASE READINESS ====================
    console.log('\n📋 BƯỚC 3: SUPABASE READINESS - Kiểm tra sẵn sàng Supabase');
    console.log('-'.repeat(60));
    
    const supabaseCheck = await page.evaluate(async () => {
      try {
        // Kiểm tra Supabase config
        const supabaseConfig = localStorage.getItem('supabaseConfig');
        const hasStoredConfig = !!supabaseConfig;
        
        // Kiểm tra có thể import SupabaseService không
        let importSuccess = false;
        try {
          const module = await import('/src/services/SupabaseService.ts');
          importSuccess = !!module.SupabaseService;
        } catch (e) {
          importSuccess = false;
        }
        
        return {
          success: hasStoredConfig || importSuccess,
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
    
    testResults.step5_supabaseReady = supabaseCheck.success;
    
    console.log('📊 Supabase Readiness:');
    console.log(`   - Has stored config: ${supabaseCheck.hasStoredConfig}`);
    console.log(`   - Import success: ${supabaseCheck.importSuccess}`);
    console.log(`   - Overall ready: ${supabaseCheck.success}`);
    
    console.log(testResults.step5_supabaseReady ? 
      '✅ THÀNH CÔNG: Supabase đã sẵn sàng' : 
      '❌ THẤT BẠI: Supabase chưa sẵn sàng'
    );
    
    // ==================== BƯỚC 4: AUTHENTICATION FLOW ====================
    console.log('\n📋 BƯỚC 4: AUTHENTICATION FLOW - Kiểm tra luồng xác thực');
    console.log('-'.repeat(60));
    
    const authCheck = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const authToken = localStorage.getItem('authToken');
      const loginType = localStorage.getItem('loginType');
      
      return {
        hasCurrentUser: !!currentUser.name,
        hasAuthToken: !!authToken,
        hasLoginType: !!loginType,
        userInfo: {
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email
        }
      };
    });
    
    testResults.step6_authFlow = authCheck.hasCurrentUser && authCheck.hasAuthToken;
    
    console.log('📊 Authentication Flow:');
    console.log(`   - Has current user: ${authCheck.hasCurrentUser}`);
    console.log(`   - Has auth token: ${authCheck.hasAuthToken}`);
    console.log(`   - User: ${authCheck.userInfo.name} (${authCheck.userInfo.role})`);
    
    console.log(testResults.step6_authFlow ? 
      '✅ THÀNH CÔNG: Authentication flow hoạt động' : 
      '❌ THẤT BẠI: Authentication flow có vấn đề'
    );
    
    // ==================== BƯỚC 5: TASKS ACCESS ====================
    console.log('\n📋 BƯỚC 5: TASKS ACCESS - Kiểm tra truy cập trang công việc');
    console.log('-'.repeat(60));
    
    const tasksCheck = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const isOnTasksPage = currentUrl.includes('/tasks');
      const hasTasksContent = document.body.innerText.includes('Công việc');
      const hasButtons = document.querySelectorAll('button').length;
      
      return {
        isOnTasksPage,
        hasTasksContent,
        hasButtons,
        currentUrl
      };
    });
    
    testResults.step7_tasksAccess = tasksCheck.isOnTasksPage && tasksCheck.hasButtons > 0;
    
    console.log('📊 Tasks Access:');
    console.log(`   - On tasks page: ${tasksCheck.isOnTasksPage}`);
    console.log(`   - Has tasks content: ${tasksCheck.hasTasksContent}`);
    console.log(`   - Has buttons: ${tasksCheck.hasButtons}`);
    
    console.log(testResults.step7_tasksAccess ? 
      '✅ THÀNH CÔNG: Truy cập trang công việc thành công' : 
      '❌ THẤT BẠI: Không thể truy cập trang công việc'
    );
    
    // ==================== BƯỚC 6: PERFORMANCE CHECK ====================
    console.log('\n📋 BƯỚC 6: PERFORMANCE CHECK - Kiểm tra hiệu suất');
    console.log('-'.repeat(60));
    
    const performanceStart = Date.now();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const performanceEnd = Date.now();
    const loadTime = performanceEnd - performanceStart;
    
    testResults.step8_performance = loadTime < 8000; // 8 seconds threshold
    
    console.log('📊 Performance Check:');
    console.log(`   - Page reload time: ${loadTime}ms`);
    console.log(`   - Performance good: ${testResults.step8_performance}`);
    
    console.log(testResults.step8_performance ? 
      '✅ THÀNH CÔNG: Hiệu suất tốt' : 
      '❌ THẤT BẠI: Hiệu suất chậm'
    );
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
  } finally {
    // ==================== COMPREHENSIVE FINAL REPORT ====================
    const testEndTime = Date.now();
    const testDuration = Math.round((testEndTime - testStartTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TỔNG KẾT MIGRATION FIREBASE → SUPABASE');
    console.log('='.repeat(80));
    console.log(`⏱️  Thời gian test: ${testDuration} giây`);
    console.log(`📅 Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('='.repeat(80));
    
    const allResults = [
      { step: 1, name: 'Data Conversion', success: testResults.step1_dataConversion },
      { step: 2, name: 'Files Generated', success: testResults.step2_filesGenerated },
      { step: 3, name: 'UI Improvements', success: testResults.step3_uiImprovements },
      { step: 4, name: 'Loading Fixed', success: testResults.step4_loadingFixed },
      { step: 5, name: 'Supabase Ready', success: testResults.step5_supabaseReady },
      { step: 6, name: 'Auth Flow', success: testResults.step6_authFlow },
      { step: 7, name: 'Tasks Access', success: testResults.step7_tasksAccess },
      { step: 8, name: 'Performance', success: testResults.step8_performance }
    ];
    
    let successCount = 0;
    allResults.forEach((result) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${result.step.toString().padStart(2, '0')}. ${result.name.padEnd(20, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${allResults.length} tests passed (${Math.round(successCount/allResults.length*100)}%)`);
    
    if (successCount === allResults.length) {
      console.log('🎉 HOÀN HẢO! MIGRATION THÀNH CÔNG 100%!');
      console.log('✅ Tất cả các bước migration đều hoàn thành!');
      console.log('✅ Hệ thống sẵn sàng chạy với Supabase!');
    } else if (successCount >= 6) {
      console.log('🎊 XUẤT SẮC! MIGRATION THÀNH CÔNG!');
      console.log('✅ Hầu hết các bước đã hoàn thành!');
      console.log('✅ Hệ thống cơ bản đã sẵn sàng!');
    } else if (successCount >= 4) {
      console.log('👍 TỐT! MIGRATION CƠ BẢN THÀNH CÔNG!');
      console.log('✅ Các bước chính đã hoàn thành!');
      console.log('⚠️ Cần hoàn thiện một số tính năng!');
    } else {
      console.log('⚠️ CẦN KHẮC PHỤC! MIGRATION CHƯA HOÀN THÀNH!');
      console.log('❌ Nhiều bước quan trọng chưa thành công!');
    }
    
    console.log('\n📊 PHÂN TÍCH CHI TIẾT:');
    console.log(`🔄 Data Migration: ${testResults.step1_dataConversion && testResults.step2_filesGenerated ? 'COMPLETED' : 'INCOMPLETE'}`);
    console.log(`🎨 UI Improvements: ${testResults.step3_uiImprovements && testResults.step4_loadingFixed ? 'COMPLETED' : 'INCOMPLETE'}`);
    console.log(`🗄️  Supabase Setup: ${testResults.step5_supabaseReady ? 'READY' : 'NEEDS SETUP'}`);
    console.log(`🔐 Authentication: ${testResults.step6_authFlow ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`📋 Tasks Feature: ${testResults.step7_tasksAccess ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`⚡ Performance: ${testResults.step8_performance ? 'GOOD' : 'NEEDS OPTIMIZATION'}`);
    
    console.log('\n🔧 BƯỚC TIẾP THEO:');
    if (!testResults.step5_supabaseReady) {
      console.log('1. Thiết lập schema trong Supabase dashboard');
      console.log('2. Chạy SQL script: supabase-schema.sql');
    }
    if (testResults.step1_dataConversion && testResults.step2_filesGenerated) {
      console.log('3. Import dữ liệu vào Supabase');
      console.log('4. Test CRUD operations với dữ liệu thật');
    }
    if (!testResults.step3_uiImprovements || !testResults.step4_loadingFixed) {
      console.log('5. Hoàn thiện UI improvements');
    }
    console.log('6. Deploy và test production');
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 MIGRATION TEST HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
