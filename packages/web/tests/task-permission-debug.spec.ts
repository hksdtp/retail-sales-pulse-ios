import { test, expect } from '@playwright/test';

test.describe('Task Permission Debug', () => {
  test('Debug task delete permission for Khổng Đức Mạnh', async ({ page }) => {
    console.log('🧪 Testing task delete permission for Khổng Đức Mạnh...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate and login as Khổng Đức Mạnh
    await page.goto('http://localhost:8088');
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
        if (await loginButton.isEnabled()) {
          await loginButton.click();
          await page.waitForTimeout(5000);
        } else {
          // Force enable and click
          await page.evaluate(() => {
            const button = document.querySelector('button[data-testid="login-submit-button"]') as HTMLButtonElement;
            if (button) {
              button.disabled = false;
              button.removeAttribute('disabled');
            }
          });
          await loginButton.click({ force: true });
          await page.waitForTimeout(5000);
        }
      }
    }
    
    // Check if we're logged in
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - login failed');
      return;
    }
    
    console.log('📝 Step 2: Check user data and permissions...');
    
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
    
    // Navigate to task management
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Look for tasks and delete buttons...');
    
    // Look for task items
    const taskItems = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
    console.log(`Found ${taskItems.length} task items`);
    
    if (taskItems.length > 0) {
      console.log('📝 Step 4: Check delete button permissions...');
      
      // Check first task
      const firstTask = taskItems[0];
      
      // Look for delete button
      const deleteButton = firstTask.locator('button:has-text("Xóa"), button[title*="Xóa"], button:has([data-testid="delete-icon"])');
      const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
      
      console.log(`Delete button visible: ${isDeleteButtonVisible}`);
      
      if (isDeleteButtonVisible) {
        const isDeleteButtonEnabled = await deleteButton.isEnabled();
        console.log(`Delete button enabled: ${isDeleteButtonEnabled}`);
        
        if (isDeleteButtonEnabled) {
          console.log('📝 Step 5: Try to click delete button...');
          
          try {
            await deleteButton.click();
            await page.waitForTimeout(2000);
            
            // Check for confirmation dialog
            const confirmDialog = page.locator('text="Bạn có chắc", text="xóa"');
            const isConfirmVisible = await confirmDialog.isVisible().catch(() => false);
            
            if (isConfirmVisible) {
              console.log('✅ Delete confirmation dialog appeared');
              
              // Click confirm
              const confirmButton = page.locator('button:has-text("OK"), button:has-text("Xác nhận"), button:has-text("Có")');
              if (await confirmButton.isVisible()) {
                await confirmButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ Clicked confirm delete');
              }
            } else {
              console.log('❌ No confirmation dialog appeared');
            }
            
          } catch (error) {
            console.log(`❌ Error clicking delete button: ${error.message}`);
          }
        } else {
          console.log('❌ Delete button is disabled');
        }
      } else {
        console.log('❌ Delete button not found');
        
        // Look for action menu
        const actionMenu = firstTask.locator('button:has-text("⋮"), button:has-text("..."), [data-testid="action-menu"]');
        const isActionMenuVisible = await actionMenu.isVisible().catch(() => false);
        
        if (isActionMenuVisible) {
          console.log('📝 Found action menu, clicking...');
          await actionMenu.click();
          await page.waitForTimeout(1000);
          
          // Look for delete option in menu
          const deleteOption = page.locator('text="Xóa", [data-testid="delete-option"]');
          const isDeleteOptionVisible = await deleteOption.isVisible().catch(() => false);
          console.log(`Delete option in menu visible: ${isDeleteOptionVisible}`);
        }
      }
      
      // Check task data
      const taskData = await page.evaluate(() => {
        // Try to find task data in DOM or global variables
        const taskElements = document.querySelectorAll('[data-testid="task-item"], .task-item, .task-card');
        if (taskElements.length > 0) {
          const firstTaskElement = taskElements[0];
          return {
            innerHTML: firstTaskElement.innerHTML.substring(0, 200),
            textContent: firstTaskElement.textContent?.substring(0, 100)
          };
        }
        return { innerHTML: 'not found', textContent: 'not found' };
      });
      
      console.log('First task data:', taskData);
      
    } else {
      console.log('❌ No tasks found');
    }
    
    // Check for permission error messages
    const errorMessages = await page.locator('text="không có quyền", text="permission", text="Bạn không thể"').all();
    if (errorMessages.length > 0) {
      console.log(`Found ${errorMessages.length} permission error messages`);
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`Error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Print recent console logs
    console.log('\n📋 Recent console logs:');
    consoleLogs.slice(-30).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'task-permission-debug.png', fullPage: true });
    
    console.log('✅ Task permission debug completed.');
  });
});
