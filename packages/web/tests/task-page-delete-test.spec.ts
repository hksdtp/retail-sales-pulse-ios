import { test, expect } from '@playwright/test';

test.describe('Task Page Delete Test', () => {
  test('Navigate to /tasks and test delete functionality for Khổng Đức Mạnh', async ({ page }) => {
    console.log('🧪 Testing delete functionality on /tasks page...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Inject Khổng Đức Mạnh user data...');
    
    // Inject user data directly into localStorage
    await page.evaluate(() => {
      const khongDucManhUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '0',
        location: 'all',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Trưởng phòng kinh doanh',
        status: 'active',
        password_changed: true
      };
      
      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(khongDucManhUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create sample tasks with proper structure
      const sampleTasks = [
        {
          id: 'task_delete_test_1',
          title: 'Task Test Delete 1 - Của Khổng Đức Mạnh',
          description: 'Test task for deletion by director',
          user_id: 'user_manh',
          assignedTo: 'user_manh',
          status: 'todo',
          priority: 'high',
          type: 'personal',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'personal'
        },
        {
          id: 'task_delete_test_2',
          title: 'Task Test Delete 2 - Của Lương Việt Anh',
          description: 'Test task created by team leader',
          user_id: 'user_viet_anh',
          assignedTo: 'user_viet_anh',
          status: 'in-progress',
          priority: 'medium',
          type: 'team',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'team'
        },
        {
          id: 'task_delete_test_3',
          title: 'Task Test Delete 3 - Của Lê Khánh Duy',
          description: 'Test task created by employee',
          user_id: 'user_khanh_duy',
          assignedTo: 'user_khanh_duy',
          status: 'completed',
          priority: 'low',
          type: 'personal',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'personal'
        }
      ];
      
      localStorage.setItem('tasks', JSON.stringify(sampleTasks));
      
      console.log('✅ Injected user data and test tasks for deletion');
    });
    
    console.log('📝 Step 2: Navigate to /tasks page...');
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    // Verify we're on tasks page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/tasks')) {
      console.log('❌ Failed to navigate to /tasks page');
      return;
    }
    
    console.log('📝 Step 3: Check for task tabs...');
    
    // Look for task tabs
    const taskTabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    const tabResults = {};
    
    for (const tabName of taskTabs) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isTabVisible = await tab.isVisible();
      tabResults[tabName] = isTabVisible;
      console.log(`Tab "${tabName}" visible: ${isTabVisible}`);
    }
    
    // Verify "Thành viên" tab is visible for Khổng Đức Mạnh
    if (tabResults['Thành viên']) {
      console.log('✅ "Thành viên" tab correctly visible for Khổng Đức Mạnh');
    } else {
      console.log('❌ "Thành viên" tab not visible - permission issue');
    }
    
    console.log('📝 Step 4: Test "Của tôi" tab...');
    
    // Click on "Của tôi" tab
    const cuaToiTab = page.locator('button:has-text("Của tôi")');
    if (await cuaToiTab.isVisible()) {
      await cuaToiTab.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked "Của tôi" tab');
    } else {
      console.log('❌ "Của tôi" tab not found');
    }
    
    console.log('📝 Step 5: Look for tasks in "Của tôi" tab...');
    
    // Look for task items
    const taskSelectors = [
      '[data-testid="task-item"]',
      '.task-item',
      '.task-card',
      'tr:has(td)',
      '[class*="task"]',
      'div:has-text("Task Test Delete")'
    ];
    
    let foundTasks = [];
    for (const selector of taskSelectors) {
      const tasks = await page.locator(selector).all();
      if (tasks.length > 0) {
        console.log(`Found ${tasks.length} tasks using selector: ${selector}`);
        foundTasks = tasks;
        break;
      }
    }
    
    if (foundTasks.length === 0) {
      console.log('❌ No tasks found in "Của tôi" tab');
      
      // Check if there's an empty state message
      const emptyStateMessages = await page.locator(':has-text("Không có công việc"), :has-text("No tasks"), :has-text("Chưa có")').all();
      if (emptyStateMessages.length > 0) {
        console.log('📝 Found empty state messages:');
        for (let i = 0; i < emptyStateMessages.length; i++) {
          const text = await emptyStateMessages[i].textContent();
          console.log(`  ${i + 1}. "${text}"`);
        }
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'no-tasks-in-cua-toi.png', fullPage: true });
      return;
    }
    
    console.log(`📝 Step 6: Found ${foundTasks.length} tasks, testing delete on first task...`);
    
    // Test delete on first task
    const firstTask = foundTasks[0];
    
    // Get task info
    const taskInfo = await firstTask.evaluate(el => ({
      textContent: el.textContent?.substring(0, 100),
      innerHTML: el.innerHTML.substring(0, 200),
      className: el.className
    }));
    
    console.log('First task info:', taskInfo);
    
    console.log('📝 Step 7: Look for delete button...');
    
    // Method 1: Look for direct delete button
    let deleteButton = firstTask.locator('button:has-text("Xóa"), button[title*="Xóa"], button[title*="Delete"]');
    let isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
    
    if (!isDeleteButtonVisible) {
      // Method 2: Look for action menu (three dots)
      const actionMenu = firstTask.locator('button:has-text("⋮"), button:has-text("..."), [data-testid="action-menu"], button[title*="menu"]');
      const isActionMenuVisible = await actionMenu.isVisible().catch(() => false);
      
      if (isActionMenuVisible) {
        console.log('📝 Found action menu, clicking...');
        await actionMenu.click();
        await page.waitForTimeout(1000);
        
        // Look for delete option in dropdown
        deleteButton = page.locator('text="Xóa", [data-testid="delete-option"], button:has-text("Xóa")');
        isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
      }
    }
    
    if (!isDeleteButtonVisible) {
      // Method 3: Click on task to open detail panel
      console.log('📝 No direct delete button, trying to open task detail...');
      await firstTask.click();
      await page.waitForTimeout(2000);
      
      // Look for delete button in detail panel
      deleteButton = page.locator('button:has-text("Xóa"), [data-testid="delete-button"]');
      isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
    }
    
    console.log(`Delete button visible: ${isDeleteButtonVisible}`);
    
    if (!isDeleteButtonVisible) {
      console.log('❌ No delete button found');
      await page.screenshot({ path: 'no-delete-button-found.png', fullPage: true });
      return;
    }
    
    console.log('📝 Step 8: Test delete permission...');
    
    // Check if delete button is enabled
    const isDeleteButtonEnabled = await deleteButton.isEnabled();
    console.log(`Delete button enabled: ${isDeleteButtonEnabled}`);
    
    if (!isDeleteButtonEnabled) {
      console.log('❌ Delete button is disabled');
      await page.screenshot({ path: 'delete-button-disabled.png', fullPage: true });
    }
    
    // Setup dialog handler BEFORE clicking delete button
    let confirmationHandled = false;
    let dialogMessage = '';

    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      console.log(`📝 Browser dialog appeared: "${dialogMessage}"`);
      await dialog.accept();
      confirmationHandled = true;
      console.log('✅ Accepted browser confirmation dialog');
    });

    // Click delete button
    try {
      console.log('📝 Clicking delete button...');
      await deleteButton.click();

      // Wait for dialog to appear and be handled
      await page.waitForTimeout(2000);

      if (confirmationHandled) {
        console.log(`✅ Confirmation dialog handled: "${dialogMessage}"`);
      } else {
        console.log('❌ No confirmation dialog appeared');

        // Try to look for modal confirmation as fallback
        const confirmModal = page.locator('text="Bạn có chắc", text="xóa", text="confirm"');
        const isConfirmModalVisible = await confirmModal.isVisible().catch(() => false);

        if (isConfirmModalVisible) {
          console.log('📝 Found modal confirmation instead');

          const confirmButton = page.locator('button:has-text("OK"), button:has-text("Xác nhận"), button:has-text("Có"), button:has-text("Yes")');
          const isConfirmButtonVisible = await confirmButton.isVisible();

          if (isConfirmButtonVisible) {
            await confirmButton.click();
            console.log('✅ Clicked confirm button in modal');
            confirmationHandled = true;
          }
        }
      }
      
      if (confirmationHandled) {
        console.log('✅ Confirmation handled, waiting for deletion...');
        await page.waitForTimeout(3000);
        
        // Check if task was deleted
        const remainingTasks = await page.locator(taskSelectors[0]).all();
        console.log(`Tasks remaining: ${remainingTasks.length} (was ${foundTasks.length})`);
        
        if (remainingTasks.length < foundTasks.length) {
          console.log('✅ Task appears to be deleted successfully');
        } else {
          console.log('❌ Task was not deleted');
        }
      } else {
        console.log('❌ No confirmation dialog appeared');
      }
      
    } catch (error) {
      console.log(`❌ Error during delete process: ${error.message}`);
    }
    
    console.log('📝 Step 9: Check for permission errors...');
    
    // Check for permission error messages
    const errorMessages = await page.locator('text="không có quyền", text="permission", text="Bạn không thể"').all();
    if (errorMessages.length > 0) {
      console.log(`Found ${errorMessages.length} permission error messages:`);
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`  Error ${i + 1}: "${errorText}"`);
      }
    } else {
      console.log('✅ No permission error messages found');
    }
    
    console.log('📝 Step 10: Check debug logs...');
    
    // Print debug logs from console
    const debugLogs = consoleLogs.filter(log => 
      log.includes('DELETE PERMISSION CHECK') || 
      log.includes('canEdit') ||
      log.includes('permission') ||
      log.includes('role') ||
      log.includes('TaskManagementView')
    );
    
    if (debugLogs.length > 0) {
      console.log('\n📋 Debug logs:');
      debugLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('No specific debug logs found');
      console.log('\nRecent console logs:');
      consoleLogs.slice(-20).forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'task-delete-test-final.png', fullPage: true });
    
    console.log('✅ Task delete test completed');
  });

  test('Test all task tabs for Khổng Đức Mạnh', async ({ page }) => {
    console.log('🧪 Testing all task tabs for Khổng Đức Mạnh...');
    
    // Setup user data
    await page.goto('http://localhost:8088');
    await page.evaluate(() => {
      const khongDucManhUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        role: 'retail_director'
      };
      localStorage.setItem('currentUser', JSON.stringify(khongDucManhUser));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Test each tab
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    
    for (const tabName of tabs) {
      console.log(`\n📝 Testing tab: ${tabName}`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isTabVisible = await tab.isVisible();
      
      if (!isTabVisible) {
        console.log(`❌ Tab "${tabName}" not visible`);
        continue;
      }
      
      // Click the tab
      await tab.click();
      await page.waitForTimeout(2000);
      
      // Check for tasks or empty state
      const taskItems = await page.locator('[data-testid="task-item"], .task-item, tr:has(td)').all();
      console.log(`Tasks found in "${tabName}": ${taskItems.length}`);
      
      // Check for loading or empty states
      const loadingElement = await page.locator('[data-testid="loading"], .loading, .spinner').first();
      const isLoading = await loadingElement.isVisible().catch(() => false);
      
      const emptyStateElement = await page.locator(':has-text("Không có công việc"), :has-text("No tasks")').first();
      const hasEmptyState = await emptyStateElement.isVisible().catch(() => false);
      
      console.log(`Loading: ${isLoading}, Empty state: ${hasEmptyState}`);
      
      if (taskItems.length > 0) {
        // Test delete on first task in this tab
        const firstTask = taskItems[0];
        const deleteButton = firstTask.locator('button:has-text("Xóa")');
        const hasDeleteButton = await deleteButton.isVisible().catch(() => false);
        console.log(`Delete button available: ${hasDeleteButton}`);
      }
    }
    
    await page.screenshot({ path: 'all-tabs-test.png', fullPage: true });
    console.log('✅ All tabs test completed');
  });
});
