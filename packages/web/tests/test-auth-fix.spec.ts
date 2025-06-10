import { test, expect } from '@playwright/test';

test.describe('Test Authentication Fix', () => {
  test('should test login with correct password', async ({ page }) => {
    console.log('🔐 Testing login with correct password...');
    
    // Listen for console logs
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Điều hướng đến trang login
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Đăng nhập với password đúng
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      console.log('📧 Filling email: manh.khong@example.com');
      await emailInput.fill('manh.khong@example.com');
      
      console.log('🔑 Filling password: password123');
      await passwordInput.fill('password123');
      
      console.log('🖱️ Clicking login button...');
      await loginButton.click();
      
      // Đợi authentication process
      await page.waitForTimeout(5000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`📍 Current URL after login: ${currentUrl}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/auth-fix-after-login.png',
        fullPage: true 
      });
      
      // Check if redirected to dashboard/home
      if (currentUrl === 'http://localhost:8088/' || currentUrl.includes('/dashboard')) {
        console.log('🎉 SUCCESS! Login successful and redirected to home/dashboard');
        
        // Now navigate to tasks
        console.log('🧭 Navigating to tasks page...');
        await page.goto('http://localhost:8088/tasks');
        await page.waitForTimeout(3000);
        
        const tasksUrl = page.url();
        console.log(`📍 Tasks page URL: ${tasksUrl}`);
        
        if (tasksUrl.includes('/tasks')) {
          console.log('✅ Successfully navigated to tasks page');
          
          // Take screenshot of tasks page
          await page.screenshot({ 
            path: 'test-results/auth-fix-tasks-page.png',
            fullPage: true 
          });
          
          // Look for create task button
          const createButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
          const buttonVisible = await createButton.isVisible();
          
          console.log(`🔍 Create task button visible: ${buttonVisible}`);
          
          if (buttonVisible) {
            console.log('🎯 Attempting to click create task button...');
            await createButton.click();
            await page.waitForTimeout(3000);
            
            // Check for dialog
            const dialog = page.locator('[data-radix-dialog-content]');
            const dialogVisible = await dialog.isVisible();
            
            console.log(`📋 Dialog visible: ${dialogVisible}`);
            
            if (dialogVisible) {
              console.log('🎉 COMPLETE SUCCESS! Dialog opened successfully');
              
              // Take final screenshot
              await page.screenshot({ 
                path: 'test-results/auth-fix-dialog-success.png',
                fullPage: true 
              });
              
              // Test form interaction
              const titleInput = page.locator('input[name="title"]');
              if (await titleInput.isVisible()) {
                await titleInput.fill('Test Task - Authentication Fixed');
                console.log('✅ Form interaction works');
              }
              
            } else {
              console.log('❌ Dialog not visible after button click');
            }
            
          } else {
            console.log('❌ Create task button not found');
            
            // Debug: List all buttons
            const allButtons = await page.evaluate(() => {
              return Array.from(document.querySelectorAll('button')).map(btn => ({
                text: btn.textContent?.trim(),
                classes: btn.className,
                visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
              }));
            });
            
            console.log('🔍 All buttons on page:', allButtons);
          }
          
        } else {
          console.log('❌ Failed to navigate to tasks page');
        }
        
      } else {
        console.log('❌ Login failed - still on login page');
        
        // Check for error messages
        const errorElements = await page.locator('[role="alert"], .error, .toast').all();
        for (const error of errorElements) {
          const errorText = await error.textContent();
          if (errorText) {
            console.log(`❌ Error message: ${errorText}`);
          }
        }
      }
      
    } else {
      console.log('❌ Login form not found');
    }
    
    console.log('🔐 Authentication test completed');
  });

  test('should test direct tasks navigation after login', async ({ page }) => {
    console.log('🎯 Testing direct tasks navigation...');
    
    // Go directly to tasks page (should redirect to login)
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login') || currentUrl === 'http://localhost:8088/') {
      console.log('🔄 Redirected to login as expected');
      
      // Perform login
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('manh.khong@example.com');
        await page.locator('input[type="password"]').fill('password123');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(5000);
        
        // Check if redirected back to tasks
        const finalUrl = page.url();
        console.log(`📍 Final URL: ${finalUrl}`);
        
        if (finalUrl.includes('/tasks')) {
          console.log('✅ Successfully redirected to tasks after login');
        } else {
          console.log('❌ Not redirected to tasks after login');
          
          // Try manual navigation
          await page.goto('http://localhost:8088/tasks');
          await page.waitForTimeout(2000);
          
          const manualUrl = page.url();
          console.log(`📍 Manual navigation URL: ${manualUrl}`);
        }
      }
    } else {
      console.log('✅ Already authenticated, on tasks page');
    }
    
    console.log('🎯 Direct navigation test completed');
  });
});
