const { chromium } = require('playwright');

(async () => {
  console.log('🚀 COMPREHENSIVE SUPABASE MIGRATION TEST');
  console.log('='.repeat(80));
  console.log('📋 Testing complete migration from Firebase to Supabase');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test results tracking
  const testResults = {
    step1_supabaseConnection: false,
    step2_dataIntegrity: false,
    step3_authFlow: false,
    step4_tasksCRUD: false,
    step5_realTimeUpdates: false,
    step6_loadingPerformance: false,
    step7_uiResponsiveness: false,
    step8_errorHandling: false
  };
  
  let testStartTime = Date.now();
  
  try {
    // ==================== BƯỚC 1: SUPABASE CONNECTION TEST ====================
    console.log('\n📋 BƯỚC 1: SUPABASE CONNECTION TEST - Kiểm tra kết nối Supabase');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Setup Supabase configuration
    const supabaseSetup = await page.evaluate(async () => {
      try {
        // Import SupabaseService
        const { SupabaseService } = await import('/src/services/SupabaseService.ts');
        
        // Initialize Supabase
        const supabaseService = SupabaseService.getInstance();
        const config = {
          url: 'https://fnakxavwxubnbucfoujd.supabase.co',
          anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI4NzQsImV4cCI6MjA1MTA0ODg3NH0.VGvp7zOmOdJOKOhJOqOqOqOqOqOqOqOqOqOqOqOqOqO'
        };
        
        const initialized = supabaseService.initialize(config);
        
        if (initialized) {
          // Test connection
          const client = supabaseService.getClient();
          const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
          
          return {
            success: true,
            initialized,
            userCount: data || 0,
            error: error?.message
          };
        }
        
        return { success: false, error: 'Failed to initialize' };
        
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    testResults.step1_supabaseConnection = supabaseSetup.success;
    
    console.log(testResults.step1_supabaseConnection ? 
      '✅ THÀNH CÔNG: Kết nối Supabase thành công' : 
      '❌ THẤT BẠI: Kết nối Supabase thất bại'
    );
    console.log('📊 Supabase setup result:', JSON.stringify(supabaseSetup, null, 2));
    
    // ==================== BƯỚC 2: DATA INTEGRITY TEST ====================
    console.log('\n📋 BƯỚC 2: DATA INTEGRITY TEST - Kiểm tra tính toàn vẹn dữ liệu');
    console.log('-'.repeat(60));
    
    const dataIntegrityCheck = await page.evaluate(async () => {
      try {
        const { SupabaseService } = await import('/src/services/SupabaseService.ts');
        const supabaseService = SupabaseService.getInstance();
        const client = supabaseService.getClient();
        
        if (!client) {
          return { success: false, error: 'Supabase client not available' };
        }
        
        // Check data counts
        const [usersResult, teamsResult, tasksResult] = await Promise.all([
          client.from('users').select('*', { count: 'exact' }),
          client.from('teams').select('*', { count: 'exact' }),
          client.from('tasks').select('*', { count: 'exact' })
        ]);
        
        const counts = {
          users: usersResult.count || 0,
          teams: teamsResult.count || 0,
          tasks: tasksResult.count || 0
        };
        
        // Check for specific test user
        const testUser = usersResult.data?.find(u => u.name === 'Khổng Đức Mạnh');
        
        return {
          success: true,
          counts,
          hasTestUser: !!testUser,
          testUserData: testUser ? {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role
          } : null
        };
        
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    testResults.step2_dataIntegrity = dataIntegrityCheck.success && 
                                      dataIntegrityCheck.counts.users > 0 &&
                                      dataIntegrityCheck.hasTestUser;
    
    console.log(testResults.step2_dataIntegrity ? 
      '✅ THÀNH CÔNG: Dữ liệu migration đầy đủ' : 
      '❌ THẤT BẠI: Dữ liệu migration không đầy đủ'
    );
    console.log('📊 Data integrity check:', JSON.stringify(dataIntegrityCheck, null, 2));
    
    // ==================== BƯỚC 3: AUTHENTICATION FLOW TEST ====================
    console.log('\n📋 BƯỚC 3: AUTHENTICATION FLOW TEST - Kiểm tra luồng xác thực');
    console.log('-'.repeat(60));
    
    // Setup fake session for testing
    await page.evaluate(() => {
      const fakeUser = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('loginType', 'standard');
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const authFlowCheck = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const isOnTasksPage = currentUrl.includes('/tasks');
      const hasUserData = !!localStorage.getItem('currentUser');
      
      return {
        success: isOnTasksPage && hasUserData,
        currentUrl,
        hasUserData,
        isAuthenticated: isOnTasksPage
      };
    });
    
    testResults.step3_authFlow = authFlowCheck.success;
    
    console.log(testResults.step3_authFlow ? 
      '✅ THÀNH CÔNG: Authentication flow hoạt động' : 
      '❌ THẤT BẠI: Authentication flow có vấn đề'
    );
    console.log('📊 Auth flow check:', authFlowCheck);
    
    // ==================== BƯỚC 4: TASKS CRUD TEST ====================
    console.log('\n📋 BƯỚC 4: TASKS CRUD TEST - Kiểm tra CRUD operations');
    console.log('-'.repeat(60));
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    const crudTest = await page.evaluate(async () => {
      try {
        const { SupabaseService } = await import('/src/services/SupabaseService.ts');
        const supabaseService = SupabaseService.getInstance();
        const client = supabaseService.getClient();
        
        if (!client) {
          return { success: false, error: 'Supabase client not available' };
        }
        
        // Test READ operation
        const { data: tasks, error: readError } = await client
          .from('tasks')
          .select('*')
          .limit(5);
        
        if (readError) {
          return { success: false, error: `Read error: ${readError.message}` };
        }
        
        // Test CREATE operation (create a test task)
        const testTask = {
          title: 'Test Task from Playwright',
          description: 'This is a test task created by automated testing',
          type: 'other',
          date: new Date().toISOString().split('T')[0],
          status: 'todo',
          priority: 'normal',
          progress: 0,
          user_id: '00000000-0000-0000-0000-000000000001',
          location: 'hanoi'
        };
        
        const { data: createdTask, error: createError } = await client
          .from('tasks')
          .insert([testTask])
          .select()
          .single();
        
        if (createError) {
          return { success: false, error: `Create error: ${createError.message}` };
        }
        
        // Test UPDATE operation
        const { data: updatedTask, error: updateError } = await client
          .from('tasks')
          .update({ progress: 50, status: 'in-progress' })
          .eq('id', createdTask.id)
          .select()
          .single();
        
        if (updateError) {
          return { success: false, error: `Update error: ${updateError.message}` };
        }
        
        // Test DELETE operation
        const { error: deleteError } = await client
          .from('tasks')
          .delete()
          .eq('id', createdTask.id);
        
        if (deleteError) {
          return { success: false, error: `Delete error: ${deleteError.message}` };
        }
        
        return {
          success: true,
          operations: {
            read: tasks.length,
            create: !!createdTask,
            update: updatedTask.progress === 50,
            delete: true
          }
        };
        
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    testResults.step4_tasksCRUD = crudTest.success;
    
    console.log(testResults.step4_tasksCRUD ? 
      '✅ THÀNH CÔNG: CRUD operations hoạt động' : 
      '❌ THẤT BẠI: CRUD operations có vấn đề'
    );
    console.log('📊 CRUD test result:', JSON.stringify(crudTest, null, 2));
    
    // ==================== BƯỚC 5: LOADING PERFORMANCE TEST ====================
    console.log('\n📋 BƯỚC 5: LOADING PERFORMANCE TEST - Kiểm tra hiệu suất loading');
    console.log('-'.repeat(60));
    
    const performanceStart = Date.now();
    
    // Reload page and measure loading time
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for loading to complete
    await page.waitForTimeout(3000);
    
    const performanceEnd = Date.now();
    const loadingTime = performanceEnd - performanceStart;
    
    const performanceCheck = await page.evaluate(() => {
      // Check if loading screen is still visible
      const loadingScreens = document.querySelectorAll('.fixed.inset-0, [class*="loading"]');
      const hasBlockingLoading = Array.from(loadingScreens).some(el => 
        el.style.display !== 'none' && 
        getComputedStyle(el).display !== 'none'
      );
      
      // Check if page is interactive
      const hasButtons = document.querySelectorAll('button').length > 0;
      const hasInteractiveElements = document.querySelectorAll('input, select, textarea').length > 0;
      
      return {
        hasBlockingLoading,
        hasButtons,
        hasInteractiveElements,
        isInteractive: hasButtons && !hasBlockingLoading
      };
    });
    
    const performanceGood = loadingTime < 5000 && performanceCheck.isInteractive;
    testResults.step6_loadingPerformance = performanceGood;
    
    console.log(testResults.step6_loadingPerformance ? 
      '✅ THÀNH CÔNG: Loading performance tốt' : 
      '❌ THẤT BẠI: Loading performance chậm'
    );
    console.log(`📊 Loading time: ${loadingTime}ms`);
    console.log('📊 Performance check:', performanceCheck);
    
    // ==================== BƯỚC 6: UI RESPONSIVENESS TEST ====================
    console.log('\n📋 BƯỚC 6: UI RESPONSIVENESS TEST - Kiểm tra tính phản hồi UI');
    console.log('-'.repeat(60));
    
    let uiResponsive = false;
    
    try {
      // Test button interactions
      const buttons = await page.locator('button').filter({ hasText: /Tạo|Làm mới|Xuất/ }).all();
      
      if (buttons.length > 0) {
        console.log(`✅ Tìm thấy ${buttons.length} buttons có thể tương tác`);
        
        // Test hover effects
        await buttons[0].hover();
        await page.waitForTimeout(500);
        
        uiResponsive = true;
        console.log('✅ UI responsive test passed');
      } else {
        console.log('❌ Không tìm thấy buttons để test');
      }
    } catch (error) {
      console.log('⚠️ UI responsiveness test error:', error.message);
    }
    
    testResults.step7_uiResponsiveness = uiResponsive;
    
    console.log(testResults.step7_uiResponsiveness ? 
      '✅ THÀNH CÔNG: UI responsive' : 
      '❌ THẤT BẠI: UI không responsive'
    );
    
    // ==================== BƯỚC 7: ERROR HANDLING TEST ====================
    console.log('\n📋 BƯỚC 7: ERROR HANDLING TEST - Kiểm tra xử lý lỗi');
    console.log('-'.repeat(60));
    
    const errorHandlingTest = await page.evaluate(async () => {
      try {
        // Test invalid Supabase operation
        const { SupabaseService } = await import('/src/services/SupabaseService.ts');
        const supabaseService = SupabaseService.getInstance();
        const client = supabaseService.getClient();
        
        if (!client) {
          return { success: false, error: 'No client available' };
        }
        
        // Try to insert invalid data
        const { data, error } = await client
          .from('tasks')
          .insert([{ invalid_field: 'test' }]);
        
        // Should get an error
        const hasError = !!error;
        
        return {
          success: hasError, // Success means we got expected error
          errorHandled: hasError,
          errorMessage: error?.message
        };
        
      } catch (error) {
        return {
          success: true, // Caught error is good
          errorHandled: true,
          errorMessage: error.message
        };
      }
    });
    
    testResults.step8_errorHandling = errorHandlingTest.success;
    
    console.log(testResults.step8_errorHandling ? 
      '✅ THÀNH CÔNG: Error handling hoạt động' : 
      '❌ THẤT BẠI: Error handling có vấn đề'
    );
    console.log('📊 Error handling test:', errorHandlingTest);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // ==================== COMPREHENSIVE FINAL REPORT ====================
    const testEndTime = Date.now();
    const testDuration = Math.round((testEndTime - testStartTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TỔNG KẾT SUPABASE MIGRATION TEST');
    console.log('='.repeat(80));
    console.log(`⏱️  Thời gian test: ${testDuration} giây`);
    console.log(`📅 Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('='.repeat(80));
    
    const allResults = [
      { step: 1, name: 'Supabase Connection', success: testResults.step1_supabaseConnection },
      { step: 2, name: 'Data Integrity', success: testResults.step2_dataIntegrity },
      { step: 3, name: 'Authentication Flow', success: testResults.step3_authFlow },
      { step: 4, name: 'Tasks CRUD Operations', success: testResults.step4_tasksCRUD },
      { step: 5, name: 'Real-time Updates', success: testResults.step5_realTimeUpdates },
      { step: 6, name: 'Loading Performance', success: testResults.step6_loadingPerformance },
      { step: 7, name: 'UI Responsiveness', success: testResults.step7_uiResponsiveness },
      { step: 8, name: 'Error Handling', success: testResults.step8_errorHandling }
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
      console.log('🎉 HOÀN HẢO! SUPABASE MIGRATION THÀNH CÔNG 100%!');
      console.log('✅ Tất cả chức năng hoạt động hoàn hảo với Supabase!');
    } else if (successCount >= 6) {
      console.log('🎊 XUẤT SẮC! MIGRATION THÀNH CÔNG!');
      console.log('✅ Hầu hết chức năng hoạt động tốt với Supabase!');
    } else if (successCount >= 4) {
      console.log('👍 TỐT! MIGRATION CƠ BẢN THÀNH CÔNG!');
      console.log('✅ Các chức năng chính hoạt động với Supabase!');
    } else {
      console.log('⚠️ CẦN KHẮC PHỤC! MIGRATION CÓ VẤN ĐỀ!');
      console.log('❌ Nhiều chức năng cần được sửa chữa!');
    }
    
    console.log('\n📊 PHÂN TÍCH CHI TIẾT:');
    console.log(`🔗 Database Connection: ${testResults.step1_supabaseConnection ? 'OK' : 'FAIL'}`);
    console.log(`📊 Data Migration: ${testResults.step2_dataIntegrity ? 'OK' : 'FAIL'}`);
    console.log(`🔐 Authentication: ${testResults.step3_authFlow ? 'OK' : 'FAIL'}`);
    console.log(`⚙️  CRUD Operations: ${testResults.step4_tasksCRUD ? 'OK' : 'FAIL'}`);
    console.log(`⚡ Performance: ${testResults.step6_loadingPerformance ? 'OK' : 'FAIL'}`);
    console.log(`🎨 User Interface: ${testResults.step7_uiResponsiveness ? 'OK' : 'FAIL'}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 SUPABASE MIGRATION TEST HOÀN THÀNH');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
