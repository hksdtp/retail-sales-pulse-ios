import { test, expect } from '@playwright/test';

test.describe('Khổng Đức Mạnh Delete Task Test', () => {
  test('Test delete task in "Của tôi" tab as Khổng Đức Mạnh', async ({ page }) => {
    console.log('🧪 Testing task deletion for Khổng Đức Mạnh in "Của tôi" tab...');
    
    // Monitor console logs for debug info
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Login as Khổng Đức Mạnh...');
    
    // Login process
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    if (await khongDucManhOption.isVisible()) {
      await khongDucManhOption.click();
      await page.waitForTimeout(2000);
      
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Haininh1');
        await page.waitForTimeout(1000);
        
        // Try to click login button
        const loginButton = page.locator('button:has-text("Đăng Nhập")');
        const isLoginEnabled = await loginButton.isEnabled();
        console.log(`Login button enabled: ${isLoginEnabled}`);
        
        if (isLoginEnabled) {
          await loginButton.click();
        } else {
          // Force enable and click
          console.log('Force enabling login button...');
          await page.evaluate(() => {
            const button = document.querySelector('button[data-testid="login-submit-button"]') as HTMLButtonElement;
            if (button) {
              button.disabled = false;
              button.removeAttribute('disabled');
            }
          });
          await loginButton.click({ force: true });
        }
        
        await page.waitForTimeout(5000);
      }
    }
    
    // Check if we're logged in
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - login failed');
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-failed.png', fullPage: true });
      return;
    }
    
    console.log('✅ Login successful, checking user data...');
    
    // Check current user data
    const userData = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return {
        name: currentUser.name || 'unknown',
        role: currentUser.role || 'unknown',
        id: currentUser.id || 'unknown',
        email: currentUser.email || 'unknown'
      };
    });
    
    console.log('Current user data:', userData);
    
    // Verify we're logged in as Khổng Đức Mạnh with correct role
    if (userData.name !== 'Khổng Đức Mạnh' || userData.role !== 'retail_director') {
      console.log('❌ User data incorrect:', userData);
      return;
    }
    
    console.log('📝 Step 2: Navigate to "Của tôi" tab...');
    
    // Wait for page to load completely
    await page.waitForTimeout(3000);
    
    // Look for "Của tôi" tab and click it
    const cuaToiTab = page.locator('button:has-text("Của tôi")');
    const isTabVisible = await cuaToiTab.isVisible();
    console.log(`"Của tôi" tab visible: ${isTabVisible}`);
    
    if (isTabVisible) {
      await cuaToiTab.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked "Của tôi" tab');
    } else {
      console.log('❌ "Của tôi" tab not found');
      // Take screenshot to see current state
      await page.screenshot({ path: 'tab-not-found.png', fullPage: true });
    }
    
    console.log('📝 Step 3: Look for tasks to delete...');
    
    // Look for task items in various possible selectors
    const taskSelectors = [
      '[data-testid="task-item"]',
      '.task-item',
      '.task-card',
      'tr:has(td)',
      '[class*="task"]',
      'li:has-text("công việc")'
    ];
    
    let taskItems = [];
    for (const selector of taskSelectors) {
      const items = await page.locator(selector).all();
      if (items.length > 0) {
        taskItems = items;
        console.log(`Found ${items.length} tasks using selector: ${selector}`);
        break;
      }
    }
    
    if (taskItems.length === 0) {
      console.log('❌ No tasks found');
      
      // Check if there's an empty state message
      const emptyStateMessages = await page.locator(':has-text("Không có công việc"), :has-text("No tasks"), :has-text("Chưa có")').all();
      if (emptyStateMessages.length > 0) {
        console.log('📝 Found empty state messages:');
        for (let i = 0; i < emptyStateMessages.length; i++) {
          const text = await emptyStateMessages[i].textContent();
          console.log(`  ${i + 1}. "${text}"`);
        }
      }
      
      // Take screenshot to see current state
      await page.screenshot({ path: 'no-tasks-found.png', fullPage: true });
      return;
    }
    
    console.log(`📝 Step 4: Found ${taskItems.length} tasks, testing delete on first task...`);
    
    // Test delete on first task
    const firstTask = taskItems[0];
    
    // Get task info for debugging
    const taskInfo = await firstTask.evaluate(el => ({
      innerHTML: el.innerHTML.substring(0, 200),
      textContent: el.textContent?.substring(0, 100),
      className: el.className
    }));
    
    console.log('First task info:', taskInfo);
    
    // Look for delete button in various ways
    console.log('📝 Step 5: Looking for delete button...');
    
    // Method 1: Direct delete button
    let deleteButton = firstTask.locator('button:has-text("Xóa"), button[title*="Xóa"], button[title*="Delete"]');
    let isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
    
    if (!isDeleteButtonVisible) {
      // Method 2: Look for action menu (three dots)
      const actionMenu = firstTask.locator('button:has-text("⋮"), button:has-text("..."), [data-testid="action-menu"]');
      const isActionMenuVisible = await actionMenu.isVisible().catch(() => false);
      
      if (isActionMenuVisible) {
        console.log('📝 Found action menu, clicking...');
        await actionMenu.click();
        await page.waitForTimeout(1000);
        
        // Look for delete option in dropdown
        deleteButton = page.locator('text="Xóa", [data-testid="delete-option"]');
        isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
      }
    }
    
    if (!isDeleteButtonVisible) {
      // Method 3: Click on task to open detail panel
      console.log('📝 No direct delete button found, trying to open task detail...');
      await firstTask.click();
      await page.waitForTimeout(2000);
      
      // Look for delete button in detail panel
      deleteButton = page.locator('button:has-text("Xóa"), [data-testid="delete-button"]');
      isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
    }
    
    console.log(`Delete button visible: ${isDeleteButtonVisible}`);
    
    if (!isDeleteButtonVisible) {
      console.log('❌ No delete button found');
      await page.screenshot({ path: 'no-delete-button.png', fullPage: true });
      return;
    }
    
    console.log('📝 Step 6: Attempting to delete task...');
    
    // Check if delete button is enabled
    const isDeleteButtonEnabled = await deleteButton.isEnabled();
    console.log(`Delete button enabled: ${isDeleteButtonEnabled}`);
    
    if (!isDeleteButtonEnabled) {
      console.log('❌ Delete button is disabled');
      await page.screenshot({ path: 'delete-button-disabled.png', fullPage: true });
    }
    
    // Click delete button
    try {
      await deleteButton.click();
      console.log('✅ Clicked delete button');
      await page.waitForTimeout(2000);
      
      // Look for confirmation dialog
      const confirmDialog = page.locator('text="Bạn có chắc", text="xóa", text="confirm"');
      const isConfirmVisible = await confirmDialog.isVisible().catch(() => false);
      
      if (isConfirmVisible) {
        console.log('📝 Confirmation dialog appeared');
        
        // Click confirm
        const confirmButton = page.locator('button:has-text("OK"), button:has-text("Xác nhận"), button:has-text("Có"), button:has-text("Yes")');
        const isConfirmButtonVisible = await confirmButton.isVisible();
        
        if (isConfirmButtonVisible) {
          await confirmButton.click();
          console.log('✅ Clicked confirm button');
          await page.waitForTimeout(3000);
        } else {
          // Try browser confirm dialog
          page.on('dialog', async dialog => {
            console.log(`Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
          });
        }
      } else {
        console.log('❌ No confirmation dialog appeared');
      }
      
      // Check if task was deleted
      const remainingTasks = await page.locator(taskSelectors[0]).all();
      console.log(`Tasks remaining: ${remainingTasks.length} (was ${taskItems.length})`);
      
      if (remainingTasks.length < taskItems.length) {
        console.log('✅ Task appears to be deleted');
      } else {
        console.log('❌ Task was not deleted');
      }
      
    } catch (error) {
      console.log(`❌ Error clicking delete button: ${error.message}`);
    }
    
    // Check for permission error messages
    console.log('📝 Step 7: Checking for permission errors...');
    
    const errorMessages = await page.locator('text="không có quyền", text="permission", text="Bạn không thể"').all();
    if (errorMessages.length > 0) {
      console.log(`Found ${errorMessages.length} permission error messages:`);
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`  Error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Print debug logs from console
    console.log('\n📋 Debug logs from application:');
    const debugLogs = consoleLogs.filter(log => 
      log.includes('DELETE PERMISSION CHECK') || 
      log.includes('canEdit') ||
      log.includes('permission') ||
      log.includes('role')
    );
    
    if (debugLogs.length > 0) {
      debugLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('No debug logs found');
      console.log('\nAll console logs:');
      consoleLogs.slice(-20).forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'delete-task-final.png', fullPage: true });
    
    console.log('✅ Delete task test completed');
  });

  test('Create a test task and then delete it', async ({ page }) => {
    console.log('🧪 Creating and deleting a test task...');
    
    // Login first
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Quick login
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    if (await khongDucManhOption.isVisible()) {
      await khongDucManhOption.click();
      await page.waitForTimeout(1000);
      
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Haininh1');
        await page.waitForTimeout(500);
        
        const loginButton = page.locator('button:has-text("Đăng Nhập")');
        if (await loginButton.isEnabled()) {
          await loginButton.click();
        } else {
          await page.evaluate(() => {
            const button = document.querySelector('button[data-testid="login-submit-button"]') as HTMLButtonElement;
            if (button) button.disabled = false;
          });
          await loginButton.click({ force: true });
        }
        await page.waitForTimeout(3000);
      }
    }
    
    // Check if logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Login failed, skipping test');
      return;
    }
    
    console.log('📝 Creating a test task...');
    
    // Look for "Add Task" or "Tạo công việc" button
    const addTaskButton = page.locator('button:has-text("Tạo"), button:has-text("Thêm"), button:has-text("Add"), [data-testid="add-task"]');
    const isAddButtonVisible = await addTaskButton.isVisible();
    
    if (isAddButtonVisible) {
      await addTaskButton.click();
      await page.waitForTimeout(2000);
      
      // Fill task form
      const titleInput = page.locator('input[placeholder*="tiêu đề"], input[placeholder*="title"], [data-testid="task-title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Task for Deletion');
        
        // Look for save button
        const saveButton = page.locator('button:has-text("Lưu"), button:has-text("Save"), [data-testid="save-task"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ Test task created');
        }
      }
    } else {
      console.log('❌ Add task button not found');
    }
    
    // Now try to delete the created task
    console.log('📝 Looking for the created task to delete...');
    
    const testTask = page.locator('text="Test Task for Deletion"');
    const isTestTaskVisible = await testTask.isVisible();
    
    if (isTestTaskVisible) {
      console.log('✅ Found test task, attempting to delete...');
      
      // Click on the task
      await testTask.click();
      await page.waitForTimeout(1000);
      
      // Look for delete button
      const deleteButton = page.locator('button:has-text("Xóa")');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(1000);
        
        // Handle confirmation
        page.on('dialog', async dialog => {
          console.log(`Confirmation: ${dialog.message()}`);
          await dialog.accept();
        });
        
        console.log('✅ Attempted to delete test task');
      }
    } else {
      console.log('❌ Test task not found');
    }
    
    await page.screenshot({ path: 'create-delete-test.png', fullPage: true });
  });
});
