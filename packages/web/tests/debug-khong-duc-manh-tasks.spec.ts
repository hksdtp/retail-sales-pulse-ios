import { test, expect } from '@playwright/test';

test.describe('Debug Khổng Đức Mạnh Task Menu Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Wait for app to load
    await page.waitForTimeout(2000);
  });

  test('Debug Khổng Đức Mạnh - Task visibility and interaction issues', async ({ page }) => {
    console.log('🧪 Testing Khổng Đức Mạnh task menu issues...');
    
    // Step 1: Login as Khổng Đức Mạnh
    console.log('📝 Step 1: Attempting login...');
    
    // Wait for login form to appear
    await page.waitForSelector('input[type="email"], input[placeholder*="email"], input[name="email"]', { timeout: 10000 });
    
    // Try different selectors for email input
    const emailInput = await page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    await emailInput.fill('manh.khong@example.com');
    
    // Try different selectors for password input
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]').first();
    await passwordInput.fill('Haininh1');
    
    // Try different selectors for submit button
    const submitButton = await page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first();
    await submitButton.click();
    
    console.log('✅ Login attempt completed');
    
    // Step 2: Wait for dashboard to load
    console.log('📝 Step 2: Waiting for dashboard...');
    await page.waitForTimeout(3000);
    
    // Check if we're logged in successfully
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
    
    // Step 3: Check task menu tabs visibility
    console.log('📝 Step 3: Checking task menu tabs...');
    
    // Look for task view buttons
    const taskButtons = await page.locator('button:has-text("Của tôi"), button:has-text("Của nhóm"), button:has-text("Thành viên"), button:has-text("Chung")').all();
    console.log(`Found ${taskButtons.length} task menu buttons`);
    
    for (let i = 0; i < taskButtons.length; i++) {
      const buttonText = await taskButtons[i].textContent();
      console.log(`Button ${i + 1}: ${buttonText}`);
    }
    
    // Check if "Thành viên" tab is visible (should be for Khổng Đức Mạnh)
    const memberTab = page.locator('button:has-text("Thành viên")');
    const isMemberTabVisible = await memberTab.isVisible();
    console.log(`"Thành viên" tab visible: ${isMemberTabVisible}`);
    
    if (isMemberTabVisible) {
      console.log('✅ "Thành viên" tab is correctly visible for Khổng Đức Mạnh');
    } else {
      console.log('❌ "Thành viên" tab is NOT visible - this is an issue');
    }
    
    // Step 4: Test each tab and count tasks
    console.log('📝 Step 4: Testing each tab...');
    
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Testing tab: ${tabName}`);
      
      const tabButton = page.locator(`button:has-text("${tabName}")`);
      const isTabVisible = await tabButton.isVisible();
      
      if (!isTabVisible) {
        console.log(`❌ Tab "${tabName}" is not visible`);
        continue;
      }
      
      // Click the tab
      await tabButton.click();
      await page.waitForTimeout(2000);
      
      // Count tasks in this tab
      const taskItems = await page.locator('[data-testid="task-item"], .task-item, .task-card, [class*="task"]').all();
      console.log(`Tasks found in "${tabName}": ${taskItems.length}`);
      
      // If no tasks found, try alternative selectors
      if (taskItems.length === 0) {
        const alternativeTaskItems = await page.locator('div:has-text("Công việc"), div:has-text("Task"), tr, li').all();
        console.log(`Alternative task elements found: ${alternativeTaskItems.length}`);
      }
      
      // Check for loading states or error messages
      const loadingElement = await page.locator('[data-testid="loading"], .loading, .spinner').first();
      const isLoading = await loadingElement.isVisible().catch(() => false);
      console.log(`Loading state: ${isLoading}`);
      
      const errorElement = await page.locator('[data-testid="error"], .error, .alert-error').first();
      const hasError = await errorElement.isVisible().catch(() => false);
      console.log(`Error state: ${hasError}`);
      
      if (hasError) {
        const errorText = await errorElement.textContent();
        console.log(`Error message: ${errorText}`);
      }
      
      // Take screenshot of this tab
      await page.screenshot({ path: `debug-tab-${tabName.replace(/\s+/g, '-')}.png`, fullPage: true });
    }
    
    // Step 5: Test task interaction (edit/delete) in "Của tôi" tab
    console.log('\n📝 Step 5: Testing task interactions...');
    
    // Go to "Của tôi" tab
    const myTasksTab = page.locator('button:has-text("Của tôi")');
    await myTasksTab.click();
    await page.waitForTimeout(2000);
    
    // Look for tasks and their action buttons
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card').all();
    
    if (taskElements.length > 0) {
      console.log(`Found ${taskElements.length} tasks to test interactions`);
      
      // Test first task
      const firstTask = taskElements[0];
      
      // Look for edit button
      const editButtons = await firstTask.locator('button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-button"], .edit-button').all();
      console.log(`Edit buttons found: ${editButtons.length}`);
      
      // Look for delete button
      const deleteButtons = await firstTask.locator('button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-button"], .delete-button').all();
      console.log(`Delete buttons found: ${deleteButtons.length}`);
      
      // Look for more actions menu
      const moreButtons = await firstTask.locator('button:has-text("⋮"), button:has-text("..."), [data-testid="more-actions"], .more-actions').all();
      console.log(`More actions buttons found: ${moreButtons.length}`);
      
      // Try to hover over task to see if actions appear
      await firstTask.hover();
      await page.waitForTimeout(1000);
      
      // Check again after hover
      const editButtonsAfterHover = await firstTask.locator('button:has-text("Sửa"), button:has-text("Edit"), [data-testid="edit-button"], .edit-button').all();
      const deleteButtonsAfterHover = await firstTask.locator('button:has-text("Xóa"), button:has-text("Delete"), [data-testid="delete-button"], .delete-button').all();
      
      console.log(`Edit buttons after hover: ${editButtonsAfterHover.length}`);
      console.log(`Delete buttons after hover: ${deleteButtonsAfterHover.length}`);
      
      // Try clicking on the task itself
      await firstTask.click();
      await page.waitForTimeout(1000);
      
      // Check if a modal or detail panel opened
      const modal = await page.locator('[data-testid="task-modal"], .modal, .dialog').first();
      const isModalVisible = await modal.isVisible().catch(() => false);
      console.log(`Task detail modal opened: ${isModalVisible}`);
      
      if (isModalVisible) {
        // Look for edit/delete buttons in modal
        const modalEditButtons = await modal.locator('button:has-text("Sửa"), button:has-text("Edit")').all();
        const modalDeleteButtons = await modal.locator('button:has-text("Xóa"), button:has-text("Delete")').all();
        
        console.log(`Modal edit buttons: ${modalEditButtons.length}`);
        console.log(`Modal delete buttons: ${modalDeleteButtons.length}`);
        
        // Test if edit button works
        if (modalEditButtons.length > 0) {
          console.log('🧪 Testing edit button...');
          await modalEditButtons[0].click();
          await page.waitForTimeout(1000);
          
          // Check if edit form appeared
          const editForm = await page.locator('[data-testid="edit-form"], .edit-form, form').first();
          const isEditFormVisible = await editForm.isVisible().catch(() => false);
          console.log(`Edit form opened: ${isEditFormVisible}`);
        }
        
        // Close modal if open
        const closeButton = await modal.locator('button:has-text("×"), button:has-text("Close"), [data-testid="close-button"]').first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
        }
      }
      
    } else {
      console.log('❌ No tasks found to test interactions');
    }
    
    // Step 6: Check console logs for errors
    console.log('\n📝 Step 6: Checking for JavaScript errors...');
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    // Step 7: Check network requests
    console.log('\n📝 Step 7: Checking network requests...');
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Failed Request: ${response.url()} - Status: ${response.status()}`);
      }
    });
    
    // Refresh the page to trigger network requests
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Final screenshot
    await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
    
    console.log('\n✅ Debug test completed. Check screenshots and logs for issues.');
  });

  test('Debug API calls and data loading', async ({ page }) => {
    console.log('🧪 Testing API calls and data loading...');
    
    // Intercept API calls
    const apiCalls = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('/tasks') || request.url().includes('/users')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('/tasks') || response.url().includes('/users')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Login and navigate
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(2000);
    
    // Try to login
    try {
      const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first();
      await emailInput.fill('manh.khong@example.com');
      
      const passwordInput = await page.locator('input[type="password"]').first();
      await passwordInput.fill('Haininh1');
      
      const submitButton = await page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      await page.waitForTimeout(5000);
      
      console.log(`\n📊 Total API calls made: ${apiCalls.length}`);
      apiCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.method} ${call.url} at ${call.timestamp}`);
      });
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
    }
  });
});
