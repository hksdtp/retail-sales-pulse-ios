const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TEST MENU CÔNG VIỆC - BYPASS LOGIN');
  console.log('='.repeat(80));
  console.log('📋 Test sẽ bypass login và trực tiếp test menu Công việc');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  try {
    // ==================== BƯỚC 1: BYPASS LOGIN ====================
    console.log('\n📋 BƯỚC 1: BYPASS LOGIN - Thiết lập session giả');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Set up fake session
    const sessionSetup = await page.evaluate(() => {
      // Set fake user data
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
    });
    
    console.log('✅ Đã thiết lập session giả:', sessionSetup.user.name);
    
    // ==================== BƯỚC 2: NAVIGATE TO TASKS ====================
    console.log('\n📋 BƯỚC 2: NAVIGATE TO TASKS - Điều hướng đến trang tasks');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/tasks', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ Đã điều hướng đến /tasks');
    
    // ==================== BƯỚC 3: WAIT FOR LOADING ====================
    console.log('\n📋 BƯỚC 3: WAIT FOR LOADING - Chờ loading hoàn thành');
    console.log('-'.repeat(60));
    
    console.log('⏳ Đang chờ trang load hoàn thành...');
    
    // Chờ loading screen biến mất (tối đa 30 giây)
    try {
      await page.waitForSelector('.absolute.inset-0.backdrop-blur-sm', { 
        state: 'detached', 
        timeout: 30000 
      });
      console.log('✅ Loading screen đã biến mất');
    } catch (error) {
      console.log('⚠️ Loading screen vẫn còn, tiếp tục test...');
    }
    
    // Chờ thêm để đảm bảo data đã load
    await page.waitForTimeout(5000);
    
    // ==================== BƯỚC 4: ANALYZE PAGE CONTENT ====================
    console.log('\n📋 BƯỚC 4: ANALYZE PAGE CONTENT - Phân tích nội dung trang');
    console.log('-'.repeat(60));
    
    const pageAnalysis = await page.evaluate(() => {
      // Get all elements info
      const allButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        disabled: btn.disabled
      })).filter(btn => btn.text);
      
      const allInputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        className: input.className
      }));
      
      const allSelects = Array.from(document.querySelectorAll('select')).map(select => ({
        options: Array.from(select.options).map(opt => opt.text),
        className: select.className
      }));
      
      // Check for task-related elements
      const taskElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('task') || text.includes('công việc') || 
               className.includes('task') || className.includes('work');
      }).map(el => ({
        tagName: el.tagName,
        text: el.textContent?.substring(0, 100),
        className: el.className
      }));
      
      // Get page structure
      const hasTable = !!document.querySelector('table');
      const hasGrid = !!document.querySelector('.grid, [style*="grid"]');
      const hasList = !!document.querySelector('ul, ol, .list');
      
      // Check for loading states
      const loadingElements = document.querySelectorAll('.loading, .spinner, [class*="loading"]').length;
      const loadingText = document.body.innerText.includes('Đang') || 
                         document.body.innerText.includes('Loading') ||
                         document.body.innerText.includes('khởi tạo');
      
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 1000),
        allButtons: allButtons.slice(0, 10), // Limit to first 10
        allInputs,
        allSelects,
        taskElements: taskElements.slice(0, 5), // Limit to first 5
        hasTable,
        hasGrid,
        hasList,
        loadingElements,
        loadingText,
        totalElements: {
          buttons: allButtons.length,
          inputs: allInputs.length,
          selects: allSelects.length,
          taskElements: taskElements.length
        }
      };
    });
    
    console.log('📊 Page Analysis:');
    console.log(`   - URL: ${pageAnalysis.url}`);
    console.log(`   - Title: ${pageAnalysis.title}`);
    console.log(`   - Loading: ${pageAnalysis.loadingText ? 'YES' : 'NO'}`);
    console.log(`   - Elements: ${pageAnalysis.totalElements.buttons} buttons, ${pageAnalysis.totalElements.inputs} inputs, ${pageAnalysis.totalElements.selects} selects`);
    console.log(`   - Task elements: ${pageAnalysis.totalElements.taskElements}`);
    console.log(`   - Structure: Table=${pageAnalysis.hasTable}, Grid=${pageAnalysis.hasGrid}, List=${pageAnalysis.hasList}`);
    
    // ==================== BƯỚC 5: TEST SPECIFIC FEATURES ====================
    console.log('\n📋 BƯỚC 5: TEST SPECIFIC FEATURES - Test các tính năng cụ thể');
    console.log('-'.repeat(60));
    
    let testResults = {
      createTask: false,
      taskList: false,
      filters: false,
      search: false,
      taskInteraction: false
    };
    
    // Test 1: Create Task Button
    try {
      const createButtons = pageAnalysis.allButtons.filter(btn => 
        btn.text.includes('Tạo') || btn.text.includes('Create') || btn.text.includes('Add')
      );
      
      if (createButtons.length > 0) {
        console.log(`✅ Tìm thấy ${createButtons.length} nút tạo: ${createButtons.map(b => b.text).join(', ')}`);
        
        // Try to click create button
        const createButton = page.locator('button').filter({ hasText: /Tạo|Create|Add/ }).first();
        if (await createButton.count() > 0) {
          await createButton.click({ timeout: 5000 });
          await page.waitForTimeout(2000);
          
          // Check if modal opened
          const modalCheck = await page.evaluate(() => {
            return {
              hasModal: !!document.querySelector('.modal, .dialog, [role="dialog"]'),
              hasForm: !!document.querySelector('form'),
              hasOverlay: !!document.querySelector('.overlay, .backdrop')
            };
          });
          
          testResults.createTask = modalCheck.hasModal || modalCheck.hasForm;
          
          if (testResults.createTask) {
            console.log('✅ Create task modal opened');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Create task test error:', error.message);
    }
    
    // Test 2: Task List
    testResults.taskList = pageAnalysis.hasTable || pageAnalysis.hasGrid || pageAnalysis.hasList || 
                          pageAnalysis.taskElements.length > 0;
    
    // Test 3: Filters
    testResults.filters = pageAnalysis.allSelects.length > 0 || 
                         pageAnalysis.allButtons.some(btn => 
                           btn.text.includes('Lọc') || btn.text.includes('Filter')
                         );
    
    // Test 4: Search
    testResults.search = pageAnalysis.allInputs.some(input => 
      input.placeholder?.toLowerCase().includes('tìm') || 
      input.placeholder?.toLowerCase().includes('search') ||
      input.type === 'search'
    );
    
    // Test 5: Task Interaction
    try {
      if (pageAnalysis.taskElements.length > 0) {
        // Try to click on a task element
        const taskElement = page.locator('*').filter({ hasText: /task|công việc/i }).first();
        if (await taskElement.count() > 0) {
          await taskElement.click({ timeout: 3000 });
          await page.waitForTimeout(1000);
          
          const interactionCheck = await page.evaluate(() => {
            return {
              hasModal: !!document.querySelector('.modal, .dialog, [role="dialog"]'),
              urlChanged: window.location.href !== 'http://localhost:8088/tasks'
            };
          });
          
          testResults.taskInteraction = interactionCheck.hasModal || interactionCheck.urlChanged;
          
          if (testResults.taskInteraction) {
            console.log('✅ Task interaction detected');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Task interaction test error:', error.message);
    }
    
    // ==================== FINAL RESULTS ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 KẾT QUẢ TEST MENU CÔNG VIỆC');
    console.log('='.repeat(80));
    
    const results = [
      { name: 'Page Access', success: !pageAnalysis.loadingText },
      { name: 'Create Task', success: testResults.createTask },
      { name: 'Task List', success: testResults.taskList },
      { name: 'Filters', success: testResults.filters },
      { name: 'Search', success: testResults.search },
      { name: 'Task Interaction', success: testResults.taskInteraction }
    ];
    
    let successCount = 0;
    results.forEach((result, index) => {
      const status = result.success ? '✅ HOẠT ĐỘNG' : '❌ KHÔNG HOẠT ĐỘNG';
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${result.name.padEnd(20, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 TỔNG KẾT: ${successCount}/${results.length} tính năng hoạt động (${Math.round(successCount/results.length*100)}%)`);
    
    if (successCount >= 5) {
      console.log('🎉 XUẤT SẮC! Menu Công việc hoạt động rất tốt!');
    } else if (successCount >= 3) {
      console.log('👍 TỐT! Các tính năng chính hoạt động!');
    } else {
      console.log('⚠️ CẦN CẢI THIỆN! Nhiều tính năng chưa hoạt động!');
    }
    
    // Show detailed page content for debugging
    console.log('\n📋 DETAILED PAGE CONTENT (for debugging):');
    console.log('Buttons found:', JSON.stringify(pageAnalysis.allButtons, null, 2));
    console.log('Body text preview:', pageAnalysis.bodyText);
    
    console.log('='.repeat(80));
    
    // Đợi 20 giây để quan sát
    console.log('\n⏳ Đợi 20 giây để quan sát kết quả...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await browser.close();
    console.log('\n🏁 TEST HOÀN THÀNH');
  }
})();
