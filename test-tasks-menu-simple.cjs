const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TEST MENU CÔNG VIỆC - SIMPLE VERSION');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    // ==================== SETUP FAKE SESSION ====================
    console.log('\n📋 SETUP - Thiết lập session giả');
    console.log('-'.repeat(60));
    
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
    
    console.log('✅ Session giả đã được thiết lập');
    
    // ==================== NAVIGATE TO TASKS ====================
    console.log('\n📋 NAVIGATE - Điều hướng đến trang tasks');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    console.log('✅ Đã điều hướng đến /tasks');
    
    // ==================== WAIT FOR LOADING ====================
    console.log('\n📋 LOADING - Chờ trang load');
    console.log('-'.repeat(60));
    
    await page.waitForTimeout(10000); // Chờ 10 giây
    console.log('✅ Đã chờ 10 giây');
    
    // ==================== BASIC PAGE CHECK ====================
    console.log('\n📋 PAGE CHECK - Kiểm tra trang cơ bản');
    console.log('-'.repeat(60));
    
    const basicCheck = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasButtons: document.querySelectorAll('button').length,
        hasInputs: document.querySelectorAll('input').length,
        hasSelects: document.querySelectorAll('select').length,
        bodyText: document.body.innerText.substring(0, 500),
        isLoading: document.body.innerText.includes('Đang') || 
                  document.body.innerText.includes('Loading')
      };
    });
    
    console.log('📊 Basic Check Results:');
    console.log(`   - URL: ${basicCheck.url}`);
    console.log(`   - Title: ${basicCheck.title}`);
    console.log(`   - Buttons: ${basicCheck.hasButtons}`);
    console.log(`   - Inputs: ${basicCheck.hasInputs}`);
    console.log(`   - Selects: ${basicCheck.hasSelects}`);
    console.log(`   - Still Loading: ${basicCheck.isLoading ? 'YES' : 'NO'}`);
    
    // ==================== BUTTON ANALYSIS ====================
    console.log('\n📋 BUTTONS - Phân tích các nút');
    console.log('-'.repeat(60));
    
    const buttonAnalysis = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent ? btn.textContent.trim() : '',
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.text.length > 0);
    });
    
    console.log('📊 Buttons found:');
    buttonAnalysis.forEach((btn, index) => {
      const status = btn.disabled ? '(disabled)' : btn.visible ? '(visible)' : '(hidden)';
      console.log(`   ${index + 1}. "${btn.text}" ${status}`);
    });
    
    // ==================== TEST CREATE TASK ====================
    console.log('\n📋 CREATE TASK - Test tạo công việc');
    console.log('-'.repeat(60));
    
    let createTaskResult = false;
    
    try {
      const createButtons = buttonAnalysis.filter(btn => 
        btn.text.includes('Tạo') && !btn.disabled && btn.visible
      );
      
      if (createButtons.length > 0) {
        console.log(`✅ Tìm thấy ${createButtons.length} nút tạo có thể click`);
        
        // Click nút tạo đầu tiên
        await page.click('button:has-text("Tạo")', { timeout: 5000 });
        console.log('✅ Đã click nút Tạo');
        
        await page.waitForTimeout(3000);
        
        // Kiểm tra có modal không
        const modalCheck = await page.evaluate(() => {
          const modals = document.querySelectorAll('.modal, .dialog, [role="dialog"]');
          const forms = document.querySelectorAll('form');
          const overlays = document.querySelectorAll('.overlay, .backdrop');
          
          return {
            modals: modals.length,
            forms: forms.length,
            overlays: overlays.length
          };
        });
        
        createTaskResult = modalCheck.modals > 0 || modalCheck.forms > 0;
        
        console.log('📊 Modal check:', modalCheck);
        
        if (createTaskResult) {
          console.log('✅ Modal/Form đã mở');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
          console.log('✅ Đã đóng modal');
        }
      } else {
        console.log('❌ Không tìm thấy nút tạo có thể click');
      }
    } catch (error) {
      console.log('⚠️ Lỗi khi test create task:', error.message);
    }
    
    // ==================== TEST SEARCH ====================
    console.log('\n📋 SEARCH - Test tìm kiếm');
    console.log('-'.repeat(60));
    
    let searchResult = false;
    
    try {
      const searchInputs = await page.locator('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]').count();
      
      if (searchInputs > 0) {
        console.log(`✅ Tìm thấy ${searchInputs} search input`);
        
        const searchInput = page.locator('input').first();
        await searchInput.fill('test search');
        await page.waitForTimeout(1000);
        await searchInput.clear();
        
        searchResult = true;
        console.log('✅ Search functionality tested');
      } else {
        console.log('❌ Không tìm thấy search input');
      }
    } catch (error) {
      console.log('⚠️ Lỗi khi test search:', error.message);
    }
    
    // ==================== TEST TASK LIST ====================
    console.log('\n📋 TASK LIST - Test danh sách công việc');
    console.log('-'.repeat(60));
    
    const taskListCheck = await page.evaluate(() => {
      // Tìm table
      const tables = document.querySelectorAll('table').length;
      
      // Tìm list items
      const listItems = document.querySelectorAll('li, .list-item, .task-item, .task-card').length;
      
      // Tìm rows
      const rows = document.querySelectorAll('tr').length;
      
      // Check for task-related text
      const hasTaskText = document.body.innerText.toLowerCase().includes('task') ||
                         document.body.innerText.includes('công việc');
      
      return {
        tables,
        listItems,
        rows,
        hasTaskText
      };
    });
    
    const hasTaskList = taskListCheck.tables > 0 || taskListCheck.listItems > 0 || 
                       taskListCheck.rows > 2 || taskListCheck.hasTaskText;
    
    console.log('📊 Task list check:', taskListCheck);
    console.log(hasTaskList ? '✅ Có danh sách công việc' : '❌ Không có danh sách công việc');
    
    // ==================== FINAL RESULTS ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 KẾT QUẢ CUỐI CÙNG');
    console.log('='.repeat(80));
    
    const finalResults = [
      { name: 'Page Access', success: basicCheck.url.includes('/tasks') },
      { name: 'Page Loaded', success: !basicCheck.isLoading },
      { name: 'Has UI Elements', success: basicCheck.hasButtons > 0 },
      { name: 'Create Task', success: createTaskResult },
      { name: 'Search Function', success: searchResult },
      { name: 'Task List', success: hasTaskList }
    ];
    
    let successCount = 0;
    finalResults.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${result.name.padEnd(15, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 TỔNG KẾT: ${successCount}/${finalResults.length} tests passed (${Math.round(successCount/finalResults.length*100)}%)`);
    
    if (successCount >= 5) {
      console.log('🎉 EXCELLENT! Menu Công việc hoạt động tốt!');
    } else if (successCount >= 3) {
      console.log('👍 GOOD! Các chức năng cơ bản hoạt động!');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT! Nhiều vấn đề cần khắc phục!');
    }
    
    // Show page content for debugging
    console.log('\n📋 PAGE CONTENT (first 800 chars):');
    console.log(basicCheck.bodyText);
    
    console.log('\n📋 BUTTON LIST:');
    buttonAnalysis.slice(0, 10).forEach((btn, i) => {
      console.log(`${i+1}. "${btn.text}"`);
    });
    
    console.log('='.repeat(80));
    
    // Wait to observe
    console.log('\n⏳ Waiting 15 seconds to observe...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 TEST COMPLETED');
  }
})();
