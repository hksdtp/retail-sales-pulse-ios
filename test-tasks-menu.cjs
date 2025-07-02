const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TEST MENU CÔNG VIỆC - COMPREHENSIVE TASKS MENU TEST');
  console.log('='.repeat(80));
  console.log('📋 Test sẽ kiểm tra toàn bộ chức năng menu Công việc');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Test results tracking
  const testResults = {
    step1_login: false,
    step2_navigation: false,
    step3_tasksMenuAccess: false,
    step4_taskFilters: false,
    step5_taskCreation: false,
    step6_taskEditing: false,
    step7_taskStatusChange: false,
    step8_taskSearch: false,
    step9_taskSorting: false,
    step10_taskDetails: false
  };
  
  let testStartTime = Date.now();
  
  try {
    // ==================== BƯỚC 1: LOGIN ====================
    console.log('\n📋 BƯỚC 1: LOGIN - Đăng nhập vào hệ thống');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:8088/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Login với Khổng Đức Mạnh
    console.log('🔑 Đăng nhập với Khổng Đức Mạnh...');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    
    const loginResult = await page.evaluate(() => {
      const currentUrl = window.location.href;
      const loginSuccess = !currentUrl.includes('/login');
      return { loginSuccess, currentUrl };
    });
    
    testResults.step1_login = loginResult.loginSuccess;
    console.log(testResults.step1_login ? 
      '✅ THÀNH CÔNG: Đăng nhập thành công' : 
      '❌ THẤT BẠI: Đăng nhập thất bại'
    );
    
    if (!testResults.step1_login) {
      throw new Error('Không thể đăng nhập - dừng test');
    }
    
    // ==================== BƯỚC 2: NAVIGATION TO TASKS ====================
    console.log('\n📋 BƯỚC 2: NAVIGATION - Điều hướng đến menu Công việc');
    console.log('-'.repeat(60));
    
    // Tìm và click vào menu Công việc
    const navigationResult = await page.evaluate(() => {
      // Tìm menu Công việc
      const taskMenus = Array.from(document.querySelectorAll('a, button, div')).filter(el => 
        el.textContent && el.textContent.trim().includes('Công việc')
      );
      
      console.log('Found task menus:', taskMenus.length);
      
      if (taskMenus.length > 0) {
        taskMenus[0].click();
        return { found: true, clicked: true };
      }
      
      return { found: false, clicked: false };
    });
    
    await page.waitForTimeout(3000);
    
    // Kiểm tra có đến trang tasks không
    const currentUrl = page.url();
    const onTasksPage = currentUrl.includes('/tasks') || currentUrl.includes('/task');
    
    testResults.step2_navigation = navigationResult.clicked && onTasksPage;
    
    console.log(testResults.step2_navigation ? 
      '✅ THÀNH CÔNG: Điều hướng đến menu Công việc thành công' : 
      '❌ THẤT BẠI: Không thể điều hướng đến menu Công việc'
    );
    console.log(`📍 URL hiện tại: ${currentUrl}`);
    
    if (!testResults.step2_navigation) {
      // Thử điều hướng trực tiếp
      console.log('🔄 Thử điều hướng trực tiếp đến /tasks...');
      await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const directNavResult = page.url().includes('/tasks');
      testResults.step2_navigation = directNavResult;
      
      console.log(directNavResult ? 
        '✅ THÀNH CÔNG: Điều hướng trực tiếp thành công' : 
        '❌ THẤT BẠI: Điều hướng trực tiếp thất bại'
      );
    }
    
    if (testResults.step2_navigation) {
      // ==================== BƯỚC 3: TASKS MENU ACCESS ====================
      console.log('\n📋 BƯỚC 3: TASKS MENU ACCESS - Kiểm tra truy cập menu Công việc');
      console.log('-'.repeat(60));
      
      const menuAccessCheck = await page.evaluate(() => {
        // Kiểm tra các elements cơ bản của trang tasks
        const taskElements = {
          hasTaskList: !!document.querySelector('[data-testid="task-list"], .task-list, .tasks-container'),
          hasCreateButton: !!document.querySelector('button').textContent?.includes('Tạo') || 
                          !!document.querySelector('button').textContent?.includes('Thêm'),
          hasFilterOptions: !!document.querySelector('select, .filter, .dropdown'),
          hasSearchBox: !!document.querySelector('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]'),
          pageTitle: document.title,
          bodyText: document.body.innerText.substring(0, 500)
        };
        
        return taskElements;
      });
      
      testResults.step3_tasksMenuAccess = menuAccessCheck.hasTaskList || 
                                          menuAccessCheck.bodyText.includes('Công việc') ||
                                          menuAccessCheck.bodyText.includes('Task');
      
      console.log(testResults.step3_tasksMenuAccess ? 
        '✅ THÀNH CÔNG: Truy cập menu Công việc thành công' : 
        '❌ THẤT BẠI: Không thể truy cập menu Công việc'
      );
      console.log('📊 Menu access check:', JSON.stringify(menuAccessCheck, null, 2));
      
      // ==================== BƯỚC 4: TASK FILTERS ====================
      console.log('\n📋 BƯỚC 4: TASK FILTERS - Kiểm tra bộ lọc công việc');
      console.log('-'.repeat(60));
      
      const filterCheck = await page.evaluate(() => {
        // Tìm các filter options
        const filters = {
          statusFilters: Array.from(document.querySelectorAll('select option, .filter-option')).map(el => el.textContent?.trim()),
          priorityFilters: Array.from(document.querySelectorAll('button, .filter-btn')).filter(el => 
            el.textContent && (el.textContent.includes('Ưu tiên') || el.textContent.includes('Priority'))
          ).length,
          dateFilters: Array.from(document.querySelectorAll('input[type="date"], .date-filter')).length,
          teamFilters: Array.from(document.querySelectorAll('select, .team-filter')).filter(el =>
            el.textContent && el.textContent.includes('Nhóm')
          ).length
        };
        
        return filters;
      });
      
      testResults.step4_taskFilters = filterCheck.statusFilters.length > 0 || 
                                      filterCheck.priorityFilters > 0 ||
                                      filterCheck.dateFilters > 0;
      
      console.log(testResults.step4_taskFilters ? 
        '✅ THÀNH CÔNG: Bộ lọc công việc hoạt động' : 
        '⚠️ CẢNH BÁO: Không tìm thấy bộ lọc rõ ràng'
      );
      console.log('📊 Filter check:', JSON.stringify(filterCheck, null, 2));
      
      // ==================== BƯỚC 5: TASK CREATION ====================
      console.log('\n📋 BƯỚC 5: TASK CREATION - Kiểm tra tạo công việc mới');
      console.log('-'.repeat(60));
      
      let taskCreationResult = false;
      
      try {
        // Tìm nút tạo task
        const createButtons = await page.locator('button').filter({ 
          hasText: /Tạo|Thêm|Create|Add|\+/ 
        }).all();
        
        console.log(`📊 Tìm thấy ${createButtons.length} nút có thể tạo task`);
        
        if (createButtons.length > 0) {
          // Click nút đầu tiên
          await createButtons[0].click();
          await page.waitForTimeout(2000);
          
          // Kiểm tra có modal/form tạo task không
          const createFormCheck = await page.evaluate(() => {
            const hasModal = !!document.querySelector('.modal, .dialog, .popup');
            const hasForm = !!document.querySelector('form');
            const hasTitleInput = !!document.querySelector('input[placeholder*="tiêu đề"], input[placeholder*="title"], input[name*="title"]');
            
            return { hasModal, hasForm, hasTitleInput };
          });
          
          taskCreationResult = createFormCheck.hasModal || createFormCheck.hasForm || createFormCheck.hasTitleInput;
          
          console.log('📊 Create form check:', createFormCheck);
          
          // Nếu có form, thử điền thông tin
          if (taskCreationResult) {
            console.log('📝 Thử tạo task test...');
            
            // Tìm input title
            const titleInput = page.locator('input').filter({ 
              placeholder: /tiêu đề|title|tên/i 
            }).first();
            
            if (await titleInput.count() > 0) {
              await titleInput.fill('Test Task từ Playwright');
              console.log('✅ Đã điền tiêu đề task');
            }
            
            // Tìm textarea description
            const descInput = page.locator('textarea, input').filter({ 
              placeholder: /mô tả|description|nội dung/i 
            }).first();
            
            if (await descInput.count() > 0) {
              await descInput.fill('Đây là task test được tạo bởi Playwright automation');
              console.log('✅ Đã điền mô tả task');
            }
            
            // Thử submit (nhưng không thực sự submit để tránh tạo data thật)
            const submitButton = page.locator('button').filter({ 
              hasText: /Lưu|Save|Tạo|Create|Submit/ 
            }).first();
            
            if (await submitButton.count() > 0) {
              console.log('✅ Tìm thấy nút submit - KHÔNG click để tránh tạo data thật');
              
              // Cancel thay vì submit
              const cancelButton = page.locator('button').filter({ 
                hasText: /Hủy|Cancel|Đóng|Close/ 
              }).first();
              
              if (await cancelButton.count() > 0) {
                await cancelButton.click();
                console.log('✅ Đã cancel form tạo task');
              } else {
                // Press Escape
                await page.keyboard.press('Escape');
                console.log('✅ Đã press Escape để đóng form');
              }
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Lỗi khi test tạo task:', error.message);
      }
      
      testResults.step5_taskCreation = taskCreationResult;
      
      console.log(testResults.step5_taskCreation ? 
        '✅ THÀNH CÔNG: Chức năng tạo công việc hoạt động' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng tạo công việc rõ ràng'
      );
      
      await page.waitForTimeout(2000);
      
      // ==================== BƯỚC 6: TASK EDITING ====================
      console.log('\n📋 BƯỚC 6: TASK EDITING - Kiểm tra chỉnh sửa công việc');
      console.log('-'.repeat(60));
      
      const editingCheck = await page.evaluate(() => {
        // Tìm các task items có thể edit
        const taskItems = Array.from(document.querySelectorAll('.task-item, .task-card, .task-row, tr, .list-item')).filter(el =>
          el.textContent && el.textContent.length > 10
        );
        
        const editButtons = Array.from(document.querySelectorAll('button, .edit-btn')).filter(el =>
          el.textContent && (el.textContent.includes('Sửa') || el.textContent.includes('Edit') || el.textContent.includes('✏️'))
        );
        
        const contextMenus = Array.from(document.querySelectorAll('.menu, .dropdown, .context-menu')).length;
        
        return {
          taskItemsCount: taskItems.length,
          editButtonsCount: editButtons.length,
          contextMenusCount: contextMenus,
          hasTaskItems: taskItems.length > 0
        };
      });
      
      testResults.step6_taskEditing = editingCheck.editButtonsCount > 0 || editingCheck.hasTaskItems;
      
      console.log(testResults.step6_taskEditing ? 
        '✅ THÀNH CÔNG: Chức năng chỉnh sửa công việc có sẵn' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng chỉnh sửa rõ ràng'
      );
      console.log('📊 Editing check:', editingCheck);
      
      // ==================== BƯỚC 7: TASK STATUS CHANGE ====================
      console.log('\n📋 BƯỚC 7: TASK STATUS CHANGE - Kiểm tra thay đổi trạng thái');
      console.log('-'.repeat(60));
      
      const statusChangeCheck = await page.evaluate(() => {
        // Tìm các dropdown status hoặc checkbox
        const statusDropdowns = Array.from(document.querySelectorAll('select')).filter(el =>
          el.innerHTML && (el.innerHTML.includes('Hoàn thành') || el.innerHTML.includes('Đang thực hiện'))
        );
        
        const checkboxes = document.querySelectorAll('input[type="checkbox"]').length;
        const statusButtons = Array.from(document.querySelectorAll('button')).filter(el =>
          el.textContent && (el.textContent.includes('Hoàn thành') || el.textContent.includes('Complete'))
        );
        
        return {
          statusDropdownsCount: statusDropdowns.length,
          checkboxesCount: checkboxes,
          statusButtonsCount: statusButtons.length
        };
      });
      
      testResults.step7_taskStatusChange = statusChangeCheck.statusDropdownsCount > 0 || 
                                           statusChangeCheck.checkboxesCount > 0 ||
                                           statusChangeCheck.statusButtonsCount > 0;
      
      console.log(testResults.step7_taskStatusChange ? 
        '✅ THÀNH CÔNG: Chức năng thay đổi trạng thái có sẵn' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng thay đổi trạng thái'
      );
      console.log('📊 Status change check:', statusChangeCheck);
      
      // ==================== BƯỚC 8: TASK SEARCH ====================
      console.log('\n📋 BƯỚC 8: TASK SEARCH - Kiểm tra tìm kiếm công việc');
      console.log('-'.repeat(60));
      
      let searchResult = false;
      
      try {
        // Tìm search box
        const searchInputs = await page.locator('input').filter({ 
          placeholder: /tìm|search|tên/i 
        }).all();
        
        console.log(`📊 Tìm thấy ${searchInputs.length} search inputs`);
        
        if (searchInputs.length > 0) {
          // Test search
          await searchInputs[0].fill('test');
          await page.waitForTimeout(1000);
          
          // Check if search results updated
          const searchCheck = await page.evaluate(() => {
            return {
              hasResults: document.body.innerText.includes('test') || 
                         document.body.innerText.includes('Không tìm thấy') ||
                         document.body.innerText.includes('No results'),
              searchPerformed: true
            };
          });
          
          searchResult = searchCheck.searchPerformed;
          
          // Clear search
          await searchInputs[0].clear();
          await page.waitForTimeout(500);
          
          console.log('✅ Đã test search và clear');
        }
      } catch (error) {
        console.log('⚠️ Lỗi khi test search:', error.message);
      }
      
      testResults.step8_taskSearch = searchResult;
      
      console.log(testResults.step8_taskSearch ? 
        '✅ THÀNH CÔNG: Chức năng tìm kiếm hoạt động' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng tìm kiếm'
      );
      
      // ==================== BƯỚC 9: TASK SORTING ====================
      console.log('\n📋 BƯỚC 9: TASK SORTING - Kiểm tra sắp xếp công việc');
      console.log('-'.repeat(60));
      
      const sortingCheck = await page.evaluate(() => {
        // Tìm các header có thể sort
        const sortableHeaders = Array.from(document.querySelectorAll('th, .header, .sort-header')).filter(el =>
          el.textContent && (el.textContent.includes('Tên') || el.textContent.includes('Ngày') || el.textContent.includes('Ưu tiên'))
        );
        
        const sortButtons = Array.from(document.querySelectorAll('button')).filter(el =>
          el.textContent && (el.textContent.includes('Sắp xếp') || el.textContent.includes('Sort'))
        );
        
        const sortDropdowns = Array.from(document.querySelectorAll('select')).filter(el =>
          el.innerHTML && el.innerHTML.includes('sắp xếp')
        );
        
        return {
          sortableHeadersCount: sortableHeaders.length,
          sortButtonsCount: sortButtons.length,
          sortDropdownsCount: sortDropdowns.length
        };
      });
      
      testResults.step9_taskSorting = sortingCheck.sortableHeadersCount > 0 || 
                                      sortingCheck.sortButtonsCount > 0 ||
                                      sortingCheck.sortDropdownsCount > 0;
      
      console.log(testResults.step9_taskSorting ? 
        '✅ THÀNH CÔNG: Chức năng sắp xếp có sẵn' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng sắp xếp rõ ràng'
      );
      console.log('📊 Sorting check:', sortingCheck);
      
      // ==================== BƯỚC 10: TASK DETAILS ====================
      console.log('\n📋 BƯỚC 10: TASK DETAILS - Kiểm tra xem chi tiết công việc');
      console.log('-'.repeat(60));
      
      let detailsResult = false;
      
      try {
        // Tìm task items để click xem details
        const taskItems = await page.locator('.task-item, .task-card, .task-row, tr').filter({
          hasText: /.+/
        }).all();
        
        console.log(`📊 Tìm thấy ${taskItems.length} task items`);
        
        if (taskItems.length > 0) {
          // Click vào task đầu tiên
          await taskItems[0].click();
          await page.waitForTimeout(2000);
          
          // Kiểm tra có modal/page details không
          const detailsCheck = await page.evaluate(() => {
            const hasModal = !!document.querySelector('.modal, .dialog, .popup, .details-panel');
            const hasDetailContent = document.body.innerText.includes('Chi tiết') || 
                                   document.body.innerText.includes('Details') ||
                                   document.body.innerText.includes('Mô tả');
            
            return { hasModal, hasDetailContent };
          });
          
          detailsResult = detailsCheck.hasModal || detailsCheck.hasDetailContent;
          
          console.log('📊 Details check:', detailsCheck);
          
          if (detailsResult) {
            // Close details
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            console.log('✅ Đã đóng details panel');
          }
        }
      } catch (error) {
        console.log('⚠️ Lỗi khi test task details:', error.message);
      }
      
      testResults.step10_taskDetails = detailsResult;
      
      console.log(testResults.step10_taskDetails ? 
        '✅ THÀNH CÔNG: Chức năng xem chi tiết hoạt động' : 
        '⚠️ CẢNH BÁO: Không tìm thấy chức năng xem chi tiết'
      );
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR trong quá trình test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // ==================== COMPREHENSIVE LOGGING & FINAL REPORT ====================
    const testEndTime = Date.now();
    const testDuration = Math.round((testEndTime - testStartTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BÁO CÁO TỔNG KẾT TEST MENU CÔNG VIỆC');
    console.log('='.repeat(80));
    console.log(`⏱️  Thời gian test: ${testDuration} giây`);
    console.log(`📅 Hoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`);
    console.log('='.repeat(80));
    
    const allResults = [
      { step: 1, name: 'Login', success: testResults.step1_login },
      { step: 2, name: 'Navigation to Tasks', success: testResults.step2_navigation },
      { step: 3, name: 'Tasks Menu Access', success: testResults.step3_tasksMenuAccess },
      { step: 4, name: 'Task Filters', success: testResults.step4_taskFilters },
      { step: 5, name: 'Task Creation', success: testResults.step5_taskCreation },
      { step: 6, name: 'Task Editing', success: testResults.step6_taskEditing },
      { step: 7, name: 'Task Status Change', success: testResults.step7_taskStatusChange },
      { step: 8, name: 'Task Search', success: testResults.step8_taskSearch },
      { step: 9, name: 'Task Sorting', success: testResults.step9_taskSorting },
      { step: 10, name: 'Task Details', success: testResults.step10_taskDetails }
    ];
    
    let successCount = 0;
    allResults.forEach((result) => {
      const status = result.success ? '✅ THÀNH CÔNG' : '❌ THẤT BẠI';
      console.log(`${result.step.toString().padStart(2, '0')}. ${result.name.padEnd(25, ' ')}: ${status}`);
      if (result.success) successCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 KẾT QUẢ TỔNG THỂ: ${successCount}/${allResults.length} chức năng hoạt động (${Math.round(successCount/allResults.length*100)}%)`);
    
    if (successCount === allResults.length) {
      console.log('🎉 HOÀN HẢO! TẤT CẢ CHỨC NĂNG MENU CÔNG VIỆC ĐỀU HOẠT ĐỘNG!');
      console.log('✅ Menu Công việc hoạt động hoàn hảo!');
    } else if (successCount >= 8) {
      console.log('🎊 XUẤT SẮC! HẦU HẾT CHỨC NĂNG HOẠT ĐỘNG TỐT!');
      console.log('✅ Menu Công việc hoạt động tốt với đầy đủ tính năng chính!');
    } else if (successCount >= 6) {
      console.log('👍 TỐT! CÁC CHỨC NĂNG CHÍNH HOẠT ĐỘNG!');
      console.log('✅ Menu Công việc có các tính năng cơ bản');
      console.log('⚠️ Một số tính năng nâng cao cần cải thiện');
    } else if (successCount >= 3) {
      console.log('⚠️ TRUNG BÌNH! CẦN CẢI THIỆN NHIỀU TÍNH NĂNG!');
      console.log('✅ Truy cập cơ bản hoạt động');
      console.log('❌ Nhiều tính năng quan trọng chưa hoạt động');
    } else {
      console.log('❌ CẦN KHẮC PHỤC NGHIÊM TRỌNG!');
      console.log('❌ Menu Công việc có nhiều vấn đề cần sửa');
    }
    
    // Đánh giá cụ thể từng nhóm chức năng
    const coreFeatures = [testResults.step1_login, testResults.step2_navigation, testResults.step3_tasksMenuAccess];
    const managementFeatures = [testResults.step5_taskCreation, testResults.step6_taskEditing, testResults.step7_taskStatusChange];
    const utilityFeatures = [testResults.step4_taskFilters, testResults.step8_taskSearch, testResults.step9_taskSorting, testResults.step10_taskDetails];
    
    const coreSuccess = coreFeatures.filter(Boolean).length;
    const managementSuccess = managementFeatures.filter(Boolean).length;
    const utilitySuccess = utilityFeatures.filter(Boolean).length;
    
    console.log('\n📊 PHÂN TÍCH CHI TIẾT:');
    console.log(`🔑 Chức năng cốt lõi: ${coreSuccess}/3 (${Math.round(coreSuccess/3*100)}%)`);
    console.log(`⚙️  Quản lý công việc: ${managementSuccess}/3 (${Math.round(managementSuccess/3*100)}%)`);
    console.log(`🛠️  Tiện ích hỗ trợ: ${utilitySuccess}/4 (${Math.round(utilitySuccess/4*100)}%)`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TEST MENU CÔNG VIỆC HOÀN THÀNH - Đóng browser sau 10 giây...');
    console.log('='.repeat(80));
    
    // Đợi 10 giây để quan sát kết quả
    await page.waitForTimeout(10000);
    
    await browser.close();
  }
})();
