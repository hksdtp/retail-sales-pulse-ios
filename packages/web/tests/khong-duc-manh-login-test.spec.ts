import { test, expect } from '@playwright/test';

test.describe('Khổng Đức Mạnh Login and Task Menu Test', () => {
  test('Login as Khổng Đức Mạnh and test task menu functionality', async ({ page }) => {
    console.log('🧪 Testing Khổng Đức Mạnh login and task menu...');
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug-01-initial-load.png', fullPage: true });
    
    // Check current URL and page state
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // We know from previous test that the page shows login form with:
    // - Button 1: "Khổng Đức MạnhTrưởng phòng kinh doanh"
    // - Button 2: "Đăng Nhập"
    // - Input: password field
    
    // Step 1: Click on Khổng Đức Mạnh button to select user
    console.log('📝 Step 1: Selecting Khổng Đức Mạnh...');
    const khongDucManhButton = page.locator('button:has-text("Khổng Đức Mạnh")');
    await expect(khongDucManhButton).toBeVisible();
    await khongDucManhButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after user selection
    await page.screenshot({ path: 'debug-02-user-selected.png', fullPage: true });
    
    // Step 2: Enter password
    console.log('📝 Step 2: Entering password...');
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Haininh1');
    await page.waitForTimeout(500);
    
    // Take screenshot after password entry
    await page.screenshot({ path: 'debug-03-password-entered.png', fullPage: true });
    
    // Step 3: Click login button
    console.log('📝 Step 3: Clicking login button...');
    const loginButton = page.locator('button:has-text("Đăng Nhập")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();
    
    // Wait for login to complete and page to load
    await page.waitForTimeout(5000);
    
    // Take screenshot after login
    await page.screenshot({ path: 'debug-04-after-login.png', fullPage: true });
    
    // Check if we're redirected to dashboard
    const newUrl = page.url();
    console.log('URL after login:', newUrl);
    
    // Step 4: Check for task menu tabs
    console.log('📝 Step 4: Checking task menu tabs...');
    
    // Look for task menu buttons
    const taskMenuButtons = await page.locator('button:has-text("Của tôi"), button:has-text("Của nhóm"), button:has-text("Thành viên"), button:has-text("Chung")').all();
    console.log(`Found ${taskMenuButtons.length} task menu buttons`);
    
    if (taskMenuButtons.length > 0) {
      console.log('✅ Task menu is visible after login');
      
      // Check specifically for "Thành viên" tab (should be visible for Khổng Đức Mạnh)
      const memberTab = page.locator('button:has-text("Thành viên")');
      const isMemberTabVisible = await memberTab.isVisible();
      console.log(`"Thành viên" tab visible: ${isMemberTabVisible}`);
      
      if (isMemberTabVisible) {
        console.log('✅ "Thành viên" tab is correctly visible for Khổng Đức Mạnh');
      } else {
        console.log('❌ "Thành viên" tab is NOT visible - this is an issue');
      }
      
      // Test each tab
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
        await page.waitForTimeout(3000); // Wait longer for data to load
        
        // Take screenshot of this tab
        await page.screenshot({ path: `debug-05-tab-${tabName.replace(/\s+/g, '-')}.png`, fullPage: true });
        
        // Count tasks in this tab
        const taskItems = await page.locator('[data-testid="task-item"], .task-item, .task-card, [class*="task"], tr:has(td), li:has-text("công việc")').all();
        console.log(`Tasks found in "${tabName}": ${taskItems.length}`);
        
        // Look for task content more broadly
        const pageContent = await page.locator('body').textContent();
        const hasTaskKeywords = pageContent?.includes('công việc') || 
                               pageContent?.includes('task') || 
                               pageContent?.includes('Không có') ||
                               pageContent?.includes('Loading') ||
                               pageContent?.includes('Đang tải');
        
        console.log(`Tab "${tabName}" has task-related content: ${hasTaskKeywords}`);
        
        // Check for loading states
        const loadingElement = await page.locator('[data-testid="loading"], .loading, .spinner, :has-text("Đang tải")').first();
        const isLoading = await loadingElement.isVisible().catch(() => false);
        console.log(`Loading state: ${isLoading}`);
        
        // Check for error messages
        const errorElement = await page.locator('[data-testid="error"], .error, .alert-error, :has-text("lỗi")').first();
        const hasError = await errorElement.isVisible().catch(() => false);
        console.log(`Error state: ${hasError}`);
        
        if (hasError) {
          const errorText = await errorElement.textContent();
          console.log(`Error message: ${errorText}`);
        }
        
        // Look for specific task elements or empty state messages
        const emptyStateElements = await page.locator(':has-text("Không có công việc"), :has-text("No tasks"), :has-text("Chưa có")').all();
        console.log(`Empty state messages: ${emptyStateElements.length}`);
        
        if (emptyStateElements.length > 0) {
          for (let i = 0; i < emptyStateElements.length; i++) {
            const emptyText = await emptyStateElements[i].textContent();
            console.log(`Empty state ${i + 1}: "${emptyText}"`);
          }
        }
      }
      
      // Step 5: Test task interactions in "Của tôi" tab
      console.log('\n📝 Step 5: Testing task interactions...');
      
      // Go to "Của tôi" tab
      const myTasksTab = page.locator('button:has-text("Của tôi")');
      await myTasksTab.click();
      await page.waitForTimeout(3000);
      
      // Look for any task elements
      const allTaskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr, li, div').all();
      console.log(`Total elements found: ${allTaskElements.length}`);
      
      // Look for task-like elements (containing task-related text)
      const taskLikeElements = [];
      for (let i = 0; i < Math.min(allTaskElements.length, 50); i++) {
        const elementText = await allTaskElements[i].textContent();
        if (elementText && (
          elementText.includes('công việc') ||
          elementText.includes('task') ||
          elementText.includes('Sửa') ||
          elementText.includes('Xóa') ||
          elementText.includes('Edit') ||
          elementText.includes('Delete')
        )) {
          taskLikeElements.push(allTaskElements[i]);
          console.log(`Task-like element ${taskLikeElements.length}: "${elementText?.substring(0, 100)}..."`);
        }
      }
      
      console.log(`Found ${taskLikeElements.length} task-like elements`);
      
      if (taskLikeElements.length > 0) {
        // Test interaction with first task-like element
        const firstTask = taskLikeElements[0];
        
        // Try to hover over it
        await firstTask.hover();
        await page.waitForTimeout(1000);
        
        // Look for action buttons that might appear
        const actionButtons = await page.locator('button:has-text("Sửa"), button:has-text("Xóa"), button:has-text("Edit"), button:has-text("Delete"), button:has-text("⋮"), button:has-text("...")').all();
        console.log(`Action buttons found after hover: ${actionButtons.length}`);
        
        // Try clicking on the task element
        await firstTask.click();
        await page.waitForTimeout(1000);
        
        // Check if a modal or detail panel opened
        const modal = await page.locator('[data-testid="task-modal"], .modal, .dialog, [role="dialog"]').first();
        const isModalVisible = await modal.isVisible().catch(() => false);
        console.log(`Task detail modal opened: ${isModalVisible}`);
        
        if (isModalVisible) {
          // Look for edit/delete buttons in modal
          const modalActionButtons = await modal.locator('button:has-text("Sửa"), button:has-text("Xóa"), button:has-text("Edit"), button:has-text("Delete")').all();
          console.log(`Modal action buttons: ${modalActionButtons.length}`);
          
          // Take screenshot of modal
          await page.screenshot({ path: 'debug-06-task-modal.png', fullPage: true });
          
          // Close modal
          const closeButton = await modal.locator('button:has-text("×"), button:has-text("Close"), [data-testid="close-button"]').first();
          if (await closeButton.isVisible().catch(() => false)) {
            await closeButton.click();
          } else {
            // Try pressing Escape
            await page.keyboard.press('Escape');
          }
        }
      } else {
        console.log('❌ No task elements found to test interactions');
      }
      
    } else {
      console.log('❌ No task menu found after login - login might have failed');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'debug-07-final-state.png', fullPage: true });
    
    console.log('\n✅ Test completed. Check screenshots for detailed analysis.');
  });

  test('Check console logs and network requests during login', async ({ page }) => {
    console.log('🧪 Monitoring console and network during login...');
    
    const consoleLogs: string[] = [];
    const networkRequests: any[] = [];
    const networkResponses: any[] = [];
    
    // Monitor console
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Monitor network
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Perform login
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(2000);
    
    // Select user and login
    const khongDucManhButton = page.locator('button:has-text("Khổng Đức Mạnh")');
    if (await khongDucManhButton.isVisible()) {
      await khongDucManhButton.click();
      await page.waitForTimeout(500);
      
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Haininh1');
        await page.waitForTimeout(500);
        
        const loginButton = page.locator('button:has-text("Đăng Nhập")');
        if (await loginButton.isVisible()) {
          await loginButton.click();
          await page.waitForTimeout(5000);
        }
      }
    }
    
    // Report findings
    console.log(`\n📋 Console logs (last 20):`);
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log(`\n📡 Network requests: ${networkRequests.length}`);
    const failedResponses = networkResponses.filter(r => r.status >= 400);
    console.log(`❌ Failed requests: ${failedResponses.length}`);
    
    failedResponses.forEach(response => {
      console.log(`❌ ${response.status} ${response.url}`);
    });
    
    const apiRequests = networkRequests.filter(r => 
      r.url.includes('/api/') || 
      r.url.includes('/tasks') || 
      r.url.includes('supabase') ||
      r.url.includes('/auth') ||
      r.url.includes('/login')
    );
    console.log(`🔗 API/Auth requests: ${apiRequests.length}`);
    
    apiRequests.forEach(request => {
      console.log(`🔗 ${request.method} ${request.url}`);
    });
  });
});
