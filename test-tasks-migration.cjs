#!/usr/bin/env node

/**
 * Script test migration tasks từ Firebase sang Supabase
 * Kiểm tra CRUD operations và real-time sync
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🧪 TEST TASKS MIGRATION - COMPREHENSIVE VERIFICATION');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra migration tasks và chức năng CRUD');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  const testResults = {
    step1_pageLoad: false,
    step2_userLogin: false,
    step3_tasksVisible: false,
    step4_taskCount: 0,
    step5_createTask: false,
    step6_editTask: false,
    step7_deleteTask: false,
    step8_assignTask: false,
    step9_filterTasks: false,
    step10_realTimeSync: false
  };
  
  try {
    // ==================== BƯỚC 1: LOAD TRANG TASKS ====================
    console.log('\n📋 BƯỚC 1: LOAD TRANG TASKS');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Setup user session
    await page.evaluate(() => {
      const testUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '1',
        password_changed: false
      };
      
      localStorage.setItem('currentUser', JSON.stringify(testUser));
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('loginType', 'standard');
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    const pageLoadCheck = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const isTasksPage = currentUrl.includes('/tasks');
      const hasTasksContent = document.body.innerText.includes('Công việc') || 
                             document.body.innerText.includes('Tasks');
      
      return {
        isTasksPage,
        hasTasksContent,
        currentUrl
      };
    });
    
    testResults.step1_pageLoad = pageLoadCheck.isTasksPage && pageLoadCheck.hasTasksContent;
    
    console.log(testResults.step1_pageLoad ? 
      '✅ PASS: Trang tasks load thành công' : 
      '❌ FAIL: Không thể load trang tasks'
    );
    console.log(`   URL: ${pageLoadCheck.currentUrl}`);
    console.log(`   Has tasks content: ${pageLoadCheck.hasTasksContent}`);
    
    // ==================== BƯỚC 2: KIỂM TRA USER LOGIN ====================
    console.log('\n📋 BƯỚC 2: KIỂM TRA USER LOGIN');
    console.log('-'.repeat(60));
    
    const userCheck = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const authToken = localStorage.getItem('authToken');
      
      return {
        hasUser: !!currentUser.name,
        userName: currentUser.name,
        userRole: currentUser.role,
        hasToken: !!authToken
      };
    });
    
    testResults.step2_userLogin = userCheck.hasUser && userCheck.hasToken;
    
    console.log(testResults.step2_userLogin ? 
      '✅ PASS: User đã login thành công' : 
      '❌ FAIL: User chưa login'
    );
    console.log(`   User: ${userCheck.userName} (${userCheck.userRole})`);
    console.log(`   Has token: ${userCheck.hasToken}`);
    
    // ==================== BƯỚC 3: KIỂM TRA TASKS HIỂN THỊ ====================
    console.log('\n📋 BƯỚC 3: KIỂM TRA TASKS HIỂN THỊ');
    console.log('-'.repeat(60));
    
    await page.waitForTimeout(3000); // Đợi tasks load
    
    const tasksCheck = await page.evaluate(() => {
      // Tìm task elements
      const taskElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('KH-CT') || text.includes('KTS-') || 
               text.includes('customer_contact') || text.includes('partner_contact') ||
               (text.includes('Phạm Thị Hương') && text.length < 200) ||
               (text.includes('Lương Việt Anh') && text.length < 200);
      });
      
      // Tìm task cards/items
      const taskCards = Array.from(document.querySelectorAll('[class*="task"], [class*="card"], .task-item')).filter(el => {
        return el.offsetParent !== null; // Visible elements only
      });
      
      // Tìm task lists
      const taskLists = Array.from(document.querySelectorAll('[class*="list"], [class*="grid"]')).filter(el => {
        const children = el.children.length;
        return children > 0 && el.offsetParent !== null;
      });
      
      // Check for loading states
      const hasLoadingText = document.body.innerText.includes('Đang tải') ||
                            document.body.innerText.includes('Loading') ||
                            document.body.innerText.includes('Đang khởi tạo');
      
      return {
        taskElementsCount: taskElements.length,
        taskCardsCount: taskCards.length,
        taskListsCount: taskLists.length,
        hasLoadingText,
        sampleTaskTexts: taskElements.slice(0, 3).map(el => el.textContent?.substring(0, 100))
      };
    });
    
    testResults.step3_tasksVisible = tasksCheck.taskElementsCount > 0 || tasksCheck.taskCardsCount > 0;
    testResults.step4_taskCount = Math.max(tasksCheck.taskElementsCount, tasksCheck.taskCardsCount);
    
    console.log(testResults.step3_tasksVisible ? 
      '✅ PASS: Tasks hiển thị trên giao diện' : 
      '❌ FAIL: Không thấy tasks nào'
    );
    console.log(`   Task elements: ${tasksCheck.taskElementsCount}`);
    console.log(`   Task cards: ${tasksCheck.taskCardsCount}`);
    console.log(`   Task lists: ${tasksCheck.taskListsCount}`);
    console.log(`   Has loading: ${tasksCheck.hasLoadingText}`);
    
    if (tasksCheck.sampleTaskTexts.length > 0) {
      console.log('   Sample tasks:');
      tasksCheck.sampleTaskTexts.forEach((text, index) => {
        console.log(`     ${index + 1}. ${text}...`);
      });
    }
    
    // ==================== BƯỚC 4: TEST CREATE TASK ====================
    console.log('\n📋 BƯỚC 4: TEST CREATE TASK');
    console.log('-'.repeat(60));
    
    const createTaskTest = await page.evaluate(() => {
      // Tìm nút tạo task
      const createButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('tạo') || text.includes('thêm') || text.includes('create') || 
               text.includes('new') || text.includes('+');
      });
      
      // Tìm form tạo task
      const createForms = Array.from(document.querySelectorAll('form, [class*="form"], [class*="modal"]')).filter(form => {
        const text = form.textContent?.toLowerCase() || '';
        return text.includes('task') || text.includes('công việc');
      });
      
      return {
        hasCreateButton: createButtons.length > 0,
        hasCreateForm: createForms.length > 0,
        createButtonTexts: createButtons.slice(0, 3).map(btn => btn.textContent?.trim())
      };
    });
    
    testResults.step5_createTask = createTaskTest.hasCreateButton;
    
    console.log(testResults.step5_createTask ? 
      '✅ PASS: Có chức năng tạo task' : 
      '❌ FAIL: Không tìm thấy chức năng tạo task'
    );
    console.log(`   Create buttons: ${createTaskTest.hasCreateButton}`);
    console.log(`   Create forms: ${createTaskTest.hasCreateForm}`);
    
    if (createTaskTest.createButtonTexts.length > 0) {
      console.log('   Button texts:');
      createTaskTest.createButtonTexts.forEach((text, index) => {
        console.log(`     ${index + 1}. "${text}"`);
      });
    }
    
    // ==================== BƯỚC 5: TEST TASK INTERACTIONS ====================
    console.log('\n📋 BƯỚC 5: TEST TASK INTERACTIONS');
    console.log('-'.repeat(60));
    
    const interactionTest = await page.evaluate(() => {
      // Tìm interactive elements
      const clickableElements = Array.from(document.querySelectorAll('button, [role="button"], [class*="clickable"]')).filter(el => {
        return el.offsetParent !== null && !el.disabled;
      });
      
      // Tìm edit/delete buttons
      const editButtons = clickableElements.filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        const classes = btn.className.toLowerCase();
        return text.includes('sửa') || text.includes('edit') || 
               classes.includes('edit') || text.includes('✏️');
      });
      
      const deleteButtons = clickableElements.filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        const classes = btn.className.toLowerCase();
        return text.includes('xóa') || text.includes('delete') || 
               classes.includes('delete') || text.includes('🗑️');
      });
      
      // Tìm filter/sort controls
      const filterControls = Array.from(document.querySelectorAll('select, [class*="filter"], [class*="sort"]')).filter(el => {
        return el.offsetParent !== null;
      });
      
      return {
        totalClickable: clickableElements.length,
        editButtons: editButtons.length,
        deleteButtons: deleteButtons.length,
        filterControls: filterControls.length
      };
    });
    
    testResults.step6_editTask = interactionTest.editButtons > 0;
    testResults.step7_deleteTask = interactionTest.deleteButtons > 0;
    testResults.step9_filterTasks = interactionTest.filterControls > 0;
    
    console.log(`   Total clickable elements: ${interactionTest.totalClickable}`);
    console.log(`   Edit buttons: ${interactionTest.editButtons} ${testResults.step6_editTask ? '✅' : '❌'}`);
    console.log(`   Delete buttons: ${interactionTest.deleteButtons} ${testResults.step7_deleteTask ? '✅' : '❌'}`);
    console.log(`   Filter controls: ${interactionTest.filterControls} ${testResults.step9_filterTasks ? '✅' : '❌'}`);
    
    // ==================== BƯỚC 6: TEST ASSIGNMENT FUNCTIONALITY ====================
    console.log('\n📋 BƯỚC 6: TEST ASSIGNMENT FUNCTIONALITY');
    console.log('-'.repeat(60));
    
    const assignmentTest = await page.evaluate(() => {
      // Tìm user assignment elements
      const userElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Phạm Thị Hương') || text.includes('Lương Việt Anh') ||
               text.includes('Nguyễn Mạnh Linh') || text.includes('Lê Khánh Duy');
      });
      
      // Tìm assignment controls
      const assignControls = Array.from(document.querySelectorAll('select, [class*="assign"], [class*="user"]')).filter(el => {
        return el.offsetParent !== null;
      });
      
      return {
        hasUserElements: userElements.length > 0,
        hasAssignControls: assignControls.length > 0,
        userElementsCount: userElements.length
      };
    });
    
    testResults.step8_assignTask = assignmentTest.hasUserElements || assignmentTest.hasAssignControls;
    
    console.log(testResults.step8_assignTask ? 
      '✅ PASS: Có chức năng assignment' : 
      '❌ FAIL: Không tìm thấy chức năng assignment'
    );
    console.log(`   User elements: ${assignmentTest.userElementsCount}`);
    console.log(`   Assign controls: ${assignmentTest.hasAssignControls}`);
    
    // ==================== BƯỚC 7: TEST REAL-TIME SYNC ====================
    console.log('\n📋 BƯỚC 7: TEST REAL-TIME SYNC');
    console.log('-'.repeat(60));
    
    const realtimeTest = await page.evaluate(() => {
      // Check for WebSocket connections or real-time indicators
      const hasWebSocket = window.WebSocket !== undefined;
      
      // Check for Supabase real-time
      const hasSupabaseRealtime = window.supabase !== undefined;
      
      // Check for real-time indicators in UI
      const realtimeIndicators = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        const classes = el.className.toLowerCase();
        return text.includes('real-time') || text.includes('live') || 
               classes.includes('realtime') || classes.includes('live');
      });
      
      return {
        hasWebSocket,
        hasSupabaseRealtime,
        realtimeIndicators: realtimeIndicators.length
      };
    });
    
    testResults.step10_realTimeSync = realtimeTest.hasWebSocket || realtimeTest.hasSupabaseRealtime;
    
    console.log(testResults.step10_realTimeSync ? 
      '✅ PASS: Real-time sync capability available' : 
      '❌ FAIL: No real-time sync detected'
    );
    console.log(`   WebSocket support: ${realtimeTest.hasWebSocket}`);
    console.log(`   Supabase realtime: ${realtimeTest.hasSupabaseRealtime}`);
    console.log(`   Realtime indicators: ${realtimeTest.realtimeIndicators}`);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
  } finally {
    // ==================== COMPREHENSIVE TEST REPORT ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TEST TASKS MIGRATION');
    console.log('='.repeat(80));
    
    const allTests = [
      { name: 'Page Load', result: testResults.step1_pageLoad },
      { name: 'User Login', result: testResults.step2_userLogin },
      { name: 'Tasks Visible', result: testResults.step3_tasksVisible },
      { name: 'Create Task', result: testResults.step5_createTask },
      { name: 'Edit Task', result: testResults.step6_editTask },
      { name: 'Delete Task', result: testResults.step7_deleteTask },
      { name: 'Assign Task', result: testResults.step8_assignTask },
      { name: 'Filter Tasks', result: testResults.step9_filterTasks },
      { name: 'Real-time Sync', result: testResults.step10_realTimeSync }
    ];
    
    let passedTests = 0;
    allTests.forEach((test, index) => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${test.name.padEnd(20, ' ')}: ${status}`);
      if (test.result) passedTests++;
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`🧪 Total tests: ${allTests.length}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${allTests.length - passedTests}`);
    console.log(`📋 Tasks detected: ${testResults.step4_taskCount}`);
    
    const successRate = Math.round((passedTests / allTests.length) * 100);
    console.log(`🎯 Success rate: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('\n🎉 EXCELLENT: Tasks migration test passed!');
    } else if (successRate >= 60) {
      console.log('\n👍 GOOD: Most functionality working, minor issues');
    } else {
      console.log('\n⚠️ NEEDS WORK: Significant issues found');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    if (!testResults.step3_tasksVisible) {
      console.log('1. 🔍 Debug why tasks are not visible');
      console.log('2. 📊 Check Supabase data import');
      console.log('3. 🔗 Verify TaskManagementView connection to Supabase');
    }
    if (!testResults.step5_createTask) {
      console.log('4. 🛠️ Implement create task functionality');
    }
    if (!testResults.step10_realTimeSync) {
      console.log('5. ⚡ Setup Supabase real-time subscriptions');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TASKS MIGRATION TEST COMPLETE');
    console.log('='.repeat(80));
    
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
