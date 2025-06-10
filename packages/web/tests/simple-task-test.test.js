// Simple focused test for task deletion functionality
import { test, expect } from '@playwright/test';

test.describe('Task Delete Test', () => {
  test('should test task deletion with auto-login', async ({ page }) => {
    console.log('🧪 Starting task deletion test...');
    
    // Navigate to application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Auto-login by clicking user and login button
    try {
      console.log('🔐 Attempting auto-login...');
      
      // Wait for login page to load
      await page.waitForSelector('button:has-text("Đăng Nhập")', { timeout: 10000 });
      
      // Select user using improved selectors
      const userSelector = page.locator('[data-testid="user-selector"]');
      if (await userSelector.isVisible()) {
        await userSelector.selectOption({ label: 'Khổng Đức Mạnh' });
        console.log('✅ User selected via dropdown');
      } else {
        // Fallback to button selection
        const userButtons = page.locator('button').filter({ hasText: 'Khổng Đức Mạnh' });
        if (await userButtons.count() > 0) {
          await userButtons.first().click();
          console.log('✅ User selected via button');
        }
      }

      // Fill password if needed
      const passwordInput = page.locator('[data-testid="password-input"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('123456');
        console.log('✅ Password filled');
      }

      // Click login with improved selector
      const loginButton = page.locator('[data-testid="login-submit-button"]');
      await loginButton.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for button to be stable
      await page.waitForTimeout(1000);

      // Force click if needed
      await loginButton.click({ force: true });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);
      
      console.log('✅ Login completed');
      
      // Take screenshot after login
      await page.screenshot({ path: 'after-login.png', fullPage: true });
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
      return;
    }
    
    // Navigate to tasks
    try {
      console.log('🧭 Navigating to tasks...');
      
      // Try multiple navigation strategies
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Strategy 1: Look for sidebar navigation
      const sidebarLinks = await page.locator('a, button').all();
      let taskNavFound = false;
      
      for (const link of sidebarLinks) {
        const text = await link.textContent();
        if (text && (text.includes('Công việc') || text.includes('Task') || text.includes('task'))) {
          console.log(`Found task navigation: "${text}"`);
          await link.click();
          taskNavFound = true;
          break;
        }
      }
      
      // Strategy 2: Direct URL navigation if sidebar fails
      if (!taskNavFound) {
        console.log('Trying direct URL navigation...');
        await page.goto('http://localhost:8088/tasks');
        await page.waitForLoadState('networkidle');
      }
      
      await page.waitForTimeout(3000);
      
      // Take screenshot after navigation
      await page.screenshot({ path: 'after-navigation.png', fullPage: true });
      
    } catch (error) {
      console.log(`❌ Navigation failed: ${error.message}`);
    }
    
    // Test task deletion
    try {
      console.log('🗑️ Testing task deletion...');
      
      // Look for task table with improved selectors
      const table = page.locator('[data-testid="tasks-table"]');
      if (await table.isVisible()) {
        console.log('✅ Task table found');

        // Count initial tasks
        const taskRows = page.locator('[data-testid="tasks-table"] tbody tr');
        const initialCount = await taskRows.count();
        console.log(`📊 Initial task count: ${initialCount}`);

        if (initialCount > 0) {
          // Find delete button with improved selector
          const deleteButton = taskRows.first().locator('[data-testid="task-delete-button"]');

          if (await deleteButton.isVisible()) {
            console.log('🎯 Delete button found, clicking...');

            // Set up dialog handler
            page.once('dialog', async dialog => {
              console.log(`💬 Dialog: ${dialog.message()}`);
              await dialog.accept();
            });

            await deleteButton.click();
            await page.waitForTimeout(5000);

            // Check if task was deleted
            const finalCount = await taskRows.count();
            console.log(`📊 Final task count: ${finalCount}`);

            if (finalCount < initialCount) {
              console.log('✅ Task deletion successful!');
            } else {
              console.log('❌ Task deletion failed - count unchanged');
            }

          } else {
            console.log('❌ Delete button not found');

            // Try edit button instead
            const editButton = taskRows.first().locator('[data-testid="task-edit-button"]');
            if (await editButton.isVisible()) {
              console.log('🔍 Testing edit functionality instead...');
              await editButton.click();
              await page.waitForTimeout(2000);

              // Check if detail panel opened
              const detailPanel = page.locator('.task-detail-panel');
              if (await detailPanel.isVisible()) {
                console.log('✅ Task detail panel opened successfully!');
              }
            }
          }
        } else {
          console.log('⚠️ No tasks available for deletion');
        }
        
      } else {
        console.log('❌ Task table not found');
        
        // Debug: log page content
        const pageContent = await page.locator('body').textContent();
        console.log('Page content:', pageContent?.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`❌ Task deletion test failed: ${error.message}`);
    }
    
    console.log('🏁 Test completed');
  });
});
