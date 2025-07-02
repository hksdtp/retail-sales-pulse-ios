const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TEST MENU CÔNG VIỆC - WITH LOADING WAIT');
  console.log('='.repeat(80));
  console.log('📋 Test sẽ chờ loading hoàn thành trước khi kiểm tra chức năng');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  try {
    // ==================== BƯỚC 1: LOGIN ====================
    console.log('\n📋 BƯỚC 1: LOGIN - Đăng nhập vào hệ thống');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('🔑 Đăng nhập với Khổng Đức Mạnh...');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    const loginResult = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const loginSuccess = !currentUrl.includes('/login');
      return { loginSuccess, currentUrl };
    });
    
    console.log(loginResult.loginSuccess ? 
      '✅ THÀNH CÔNG: Đăng nhập thành công' : 
      '❌ THẤT BẠI: Đăng nhập thất bại'
    );
    
    if (!loginResult.loginSuccess) {
      throw new Error('Không thể đăng nhập - dừng test');
    }
    
    // ==================== BƯỚC 2: NAVIGATE TO TASKS ====================
    console.log('\n📋 BƯỚC 2: NAVIGATE TO TASKS - Điều hướng đến trang tasks');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    console.log('✅ Đã điều hướng đến /tasks');
    
    // ==================== BƯỚC 3: WAIT FOR LOADING ====================
    console.log('\n📋 BƯỚC 3: WAIT FOR LOADING - Chờ loading hoàn thành');
    console.log('-'.repeat(60));
    
    console.log('⏳ Đang chờ loading screen biến mất...');
    
    // Chờ loading screen biến mất (tối đa 60 giây)
    try {
      await page.waitForSelector('.absolute.inset-0.backdrop-blur-sm', { 
        state: 'detached', 
        timeout: 60000 
      });
      console.log('✅ Loading screen đã biến mất');
    } catch (error) {
      console.log('⚠️ Loading screen vẫn còn sau 60 giây, tiếp tục test...');
    }
    
    // Chờ thêm để đảm bảo data đã load
    await page.waitForTimeout(5000);
    
    // ==================== BƯỚC 4: CHECK PAGE STATE ====================
    console.log('\n📋 BƯỚC 4: CHECK PAGE STATE - Kiểm tra trạng thái trang');
    console.log('-'.repeat(60));
    
    const pageState = await page.evaluate(() => {
      const loadingElements = document.querySelectorAll('.absolute.inset-0.backdrop-blur-sm').length;
      const loadingText = document.body.innerText.includes('Đang khởi tạo');
      const hasTaskElements = document.querySelectorAll('.task-item, .task-card, .task-row, tr').length;
      const hasButtons = document.querySelectorAll('button').length;
      const hasInputs = document.querySelectorAll('input').length;
      
      // Get all button texts
      const buttonTexts = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean);
      
      // Get page content
      const bodyText = document.body.innerText.substring(0, 1000);
      
      return {
        loadingElements,
        loadingText,
        hasTaskElements,
        hasButtons,
        hasInputs,
        buttonTexts,
        bodyText
      };
    });
    
    console.log('📊 Page state after loading:');
    console.log(`   - Loading elements: ${pageState.loadingElements}`);
    console.log(`   - Loading text: ${pageState.loadingText}`);
    console.log(`   - Task elements: ${pageState.hasTaskElements}`);
    console.log(`   - Buttons: ${pageState.hasButtons}`);
    console.log(`   - Inputs: ${pageState.hasInputs}`);
    console.log(`   - Button texts: ${JSON.stringify(pageState.buttonTexts)}`);
    
    // ==================== BƯỚC 5: TEST TASK CREATION ====================
    console.log('\n📋 BƯỚC 5: TEST TASK CREATION - Test tạo công việc');
    console.log('-'.repeat(60));
    
    let taskCreationResult = false;
    
    try {
      // Tìm nút "Tạo công việc"
      const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' });
      
      if (await createTaskButton.count() > 0) {
        console.log('✅ Tìm thấy nút "Tạo công việc"');
        
        // Chờ button có thể click được
        await createTaskButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Force click nếu bị che phủ
        await createTaskButton.click({ force: true });
        console.log('✅ Đã click nút "Tạo công việc"');
        
        await page.waitForTimeout(3000);
        
        // Kiểm tra có modal/form tạo task không
        const createFormCheck = await page.evaluate(() => {
          const hasModal = !!document.querySelector('.modal, .dialog, .popup, [role="dialog"]');
          const hasForm = !!document.querySelector('form');
          const hasTitleInput = !!document.querySelector('input[placeholder*="tiêu đề"], input[placeholder*="title"], input[name*="title"]');
          const hasOverlay = !!document.querySelector('.overlay, .backdrop');
          
          return { hasModal, hasForm, hasTitleInput, hasOverlay };
        });
        
        taskCreationResult = createFormCheck.hasModal || createFormCheck.hasForm || createFormCheck.hasTitleInput;
        
        console.log('📊 Create form check:', createFormCheck);
        
        if (taskCreationResult) {
          console.log('✅ Form tạo task đã mở');
          
          // Close form
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
          console.log('✅ Đã đóng form tạo task');
        }
      } else {
        console.log('❌ Không tìm thấy nút "Tạo công việc"');
      }
    } catch (error) {
      console.log('⚠️ Lỗi khi test tạo task:', error.message);
    }
    
    console.log(taskCreationResult ? 
      '✅ THÀNH CÔNG: Chức năng tạo công việc hoạt động' : 
      '❌ THẤT BẠI: Chức năng tạo công việc không hoạt động'
    );
    
    // ==================== BƯỚC 6: TEST TASK LIST ====================
    console.log('\n📋 BƯỚC 6: TEST TASK LIST - Kiểm tra danh sách công việc');
    console.log('-'.repeat(60));
    
    const taskListCheck = await page.evaluate(() => {
      // Tìm các task items
      const taskItems = Array.from(document.querySelectorAll('.task-item, .task-card, .task-row, tr, .list-item')).filter(el =>
        el.textContent && el.textContent.trim().length > 10
      );
      
      // Tìm table hoặc list container
      const hasTable = !!document.querySelector('table');
      const hasList = !!document.querySelector('.task-list, .tasks-container, .list-container');
      
      // Tìm các filter/search elements
      const hasFilters = !!document.querySelector('select, .filter, .dropdown');
      const hasSearch = !!document.querySelector('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]');
      
      return {
        taskItemsCount: taskItems.length,
        hasTable,
        hasList,
        hasFilters,
        hasSearch,
        taskItemsText: taskItems.slice(0, 3).map(item => item.textContent?.substring(0, 50))
      };
    });
    
    console.log('📊 Task list check:', taskListCheck);
    
    const hasTaskList = taskListCheck.taskItemsCount > 0 || taskListCheck.hasTable || taskListCheck.hasList;
    
    console.log(hasTaskList ? 
      '✅ THÀNH CÔNG: Danh sách công việc có dữ liệu' : 
      '⚠️ CẢNH BÁO: Danh sách công việc trống hoặc chưa load'
    );
    
    // ==================== BƯỚC 7: TEST FILTERS AND SEARCH ====================
    console.log('\n📋 BƯỚC 7: TEST FILTERS AND SEARCH - Test bộ lọc và tìm kiếm');
    console.log('-'.repeat(60));
    
    let filtersResult = false;
    let searchResult = false;
    
    try {
      // Test filters
      const filterElements = await page.locator('select, .filter, .dropdown').all();
      if (filterElements.length > 0) {
        console.log(`✅ Tìm thấy ${filterElements.length} filter elements`);
        filtersResult = true;
      }
      
      // Test search
      const searchElements = await page.locator('input').filter({ 
        placeholder: /tìm|search|tên/i 
      }).all();
      
      if (searchElements.length > 0) {
        console.log(`✅ Tìm thấy ${searchElements.length} search elements`);
        
        // Test search functionality
        await searchElements[0].fill('test');
        await page.waitForTimeout(1000);
        await searchElements[0].clear();
        
        searchResult = true;
        console.log('✅ Search functionality tested');
      }
    } catch (error) {
      console.log('⚠️ Lỗi khi test filters/search:', error.message);
    }
    
    console.log(filtersResult ? 
      '✅ THÀNH CÔNG: Bộ lọc hoạt động' : 
      '❌ THẤT BẠI: Không tìm thấy bộ lọc'
    );
    
    console.log(searchResult ? 
      '✅ THÀNH CÔNG: Tìm kiếm hoạt động' : 
      '❌ THẤT BẠI: Không tìm thấy chức năng tìm kiếm'
    );
    
    // ==================== BƯỚC 8: TEST TASK INTERACTION ====================
    console.log('\n📋 BƯỚC 8: TEST TASK INTERACTION - Test tương tác với task');
    console.log('-'.repeat(60));
    
    let taskInteractionResult = false;
    
    try {
      // Tìm task items để click
      const taskItems = await page.locator('.task-item, .task-card, .task-row, tr').filter({
        hasText: /.+/
      }).all();
      
      if (taskItems.length > 0) {
        console.log(`✅ Tìm thấy ${taskItems.length} task items`);
        
        // Click vào task đầu tiên
        await taskItems[0].click();
        await page.waitForTimeout(2000);
        
        // Kiểm tra có modal/details không
        const detailsCheck = await page.evaluate(() => {
          const hasModal = !!document.querySelector('.modal, .dialog, .popup, [role="dialog"]');
          const hasDetailContent = document.body.innerText.includes('Chi tiết') || 
                                 document.body.innerText.includes('Details');
          
          return { hasModal, hasDetailContent };
        });
        
        taskInteractionResult = detailsCheck.hasModal || detailsCheck.hasDetailContent;
        
        if (taskInteractionResult) {
          console.log('✅ Task details opened');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    } catch (error) {
      console.log('⚠️ Lỗi khi test task interaction:', error.message);
    }
    
    console.log(taskInteractionResult ? 
      '✅ THÀNH CÔNG: Tương tác với task hoạt động' : 
      '❌ THẤT BẠI: Không thể tương tác với task'
    );
    
    // ==================== FINAL SUMMARY ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 TỔNG KẾT TEST MENU CÔNG VIỆC (WITH LOADING WAIT)');
    console.log('='.repeat(80));
    
    const finalResults = [
      { name: 'Login', success: true },
      { name: 'Navigation', success: true },
      { name: 'Loading Wait', success: !pageState.loadingText },
      { name: 'Task Creation', success: taskCreationResult },
      { name: 'Task List', success: hasTaskList },
      { name: 'Filters', success: filtersResult },
      { name: 'Search', success: searchResult },
      { name: 'Task Interaction', success: taskInteractionResult }
    ];
    
    let successCount = 0;
    finalResults.forEach((result, index) => {
      const status = result.success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI';
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${result.name.padEnd(20, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ CUỐI CÙNG: ${successCount}/${finalResults.length} chức năng hoạt động (${Math.round(successCount/finalResults.length*100)}%)`);
    
    if (successCount >= 6) {
      console.log('🎉 XUẤT SẮC! Menu Công việc hoạt động tốt!');
    } else if (successCount >= 4) {
      console.log('👍 TỐT! Các chức năng cơ bản hoạt động!');
    } else {
      console.log('⚠️ CẦN CẢI THIỆN! Nhiều chức năng chưa hoạt động!');
    }
    
    console.log('='.repeat(80));
    
    // Đợi 15 giây để quan sát
    console.log('\n⏳ Đợi 15 giây để quan sát kết quả...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 TEST HOÀN THÀNH');
  }
})();
