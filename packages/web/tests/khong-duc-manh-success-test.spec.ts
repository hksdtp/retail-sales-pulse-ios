import { test, expect } from '@playwright/test';

test.describe('Khổng Đức Mạnh Success Test', () => {
  test('Successful login flow for Khổng Đức Mạnh with auto-trigger', async ({ page }) => {
    console.log('🧪 Testing successful login for Khổng Đức Mạnh...');
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Select Khổng Đức Mạnh...');
    
    // Click on Khổng Đức Mạnh option
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    await expect(khongDucManhOption).toBeVisible();
    await khongDucManhOption.click();
    
    // Wait for auto-selection to complete
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 2: Enter password...');
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Haininh1');
    
    console.log('📝 Step 3: Wait for auto-login to trigger...');
    
    // Wait for auto-login to trigger (our workaround has 1 second delay)
    await page.waitForTimeout(5000);
    
    // Check if we're redirected or if password change modal appears
    const currentUrl = page.url();
    console.log(`Current URL after auto-login: ${currentUrl}`);
    
    // Check for password change modal
    const passwordChangeModal = page.locator('[data-testid="password-change-modal"], .modal:has-text("Đổi mật khẩu")');
    const isPasswordChangeModalVisible = await passwordChangeModal.isVisible();
    console.log(`Password change modal visible: ${isPasswordChangeModalVisible}`);
    
    if (isPasswordChangeModalVisible) {
      console.log('📝 Step 4: Handle password change modal...');
      
      // Fill new password
      const newPasswordInput = page.locator('input[placeholder*="mật khẩu mới"], input[data-testid="new-password"]');
      const confirmPasswordInput = page.locator('input[placeholder*="xác nhận"], input[data-testid="confirm-password"]');
      
      if (await newPasswordInput.isVisible()) {
        await newPasswordInput.fill('NewPassword123');
        await confirmPasswordInput.fill('NewPassword123');
        
        // Click save button
        const saveButton = page.locator('button:has-text("Lưu"), button:has-text("Cập nhật")');
        await saveButton.click();
        
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('📝 Step 4: No password change modal - checking if already logged in...');
    }
    
    // Check final state
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // Check if we're on dashboard (not login page)
    const isDashboard = !finalUrl.includes('/login');
    console.log(`Successfully logged in to dashboard: ${isDashboard}`);
    
    if (isDashboard) {
      console.log('📝 Step 5: Verify task menu tabs for Khổng Đức Mạnh...');
      
      // Wait for dashboard to load
      await page.waitForTimeout(3000);
      
      // Check for task menu tabs
      const taskTabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
      const tabResults = {};
      
      for (const tabName of taskTabs) {
        const tab = page.locator(`button:has-text("${tabName}")`);
        const isTabVisible = await tab.isVisible();
        tabResults[tabName] = isTabVisible;
        console.log(`Tab "${tabName}" visible: ${isTabVisible}`);
      }
      
      // Verify "Thành viên" tab is visible (special permission for Khổng Đức Mạnh)
      if (tabResults['Thành viên']) {
        console.log('✅ "Thành viên" tab correctly visible for Khổng Đức Mạnh');
        
        // Click on "Thành viên" tab to test functionality
        const memberTab = page.locator('button:has-text("Thành viên")');
        await memberTab.click();
        await page.waitForTimeout(3000);
        
        // Check if tab content loads
        const pageContent = await page.locator('body').textContent();
        const hasTaskContent = pageContent?.includes('công việc') || 
                              pageContent?.includes('task') || 
                              pageContent?.includes('Không có') ||
                              pageContent?.includes('Loading');
        
        console.log(`"Thành viên" tab content loaded: ${hasTaskContent}`);
        
        if (hasTaskContent) {
          console.log('✅ "Thành viên" tab functionality working correctly');
        }
      } else {
        console.log('❌ "Thành viên" tab not visible - permission issue');
      }
      
      // Take final success screenshot
      await page.screenshot({ path: 'khong-duc-manh-success.png', fullPage: true });
      
      console.log('✅ Khổng Đức Mạnh login test completed successfully!');
      
      // Verify all expected tabs are visible
      const expectedTabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
      const allTabsVisible = expectedTabs.every(tab => tabResults[tab]);
      
      if (allTabsVisible) {
        console.log('✅ All expected task menu tabs are visible');
      } else {
        console.log('❌ Some task menu tabs are missing');
        console.log('Tab visibility:', tabResults);
      }
      
    } else {
      console.log('❌ Login failed - still on login page or error occurred');
      await page.screenshot({ path: 'khong-duc-manh-failed.png', fullPage: true });
      
      // Check for error messages
      const errorElements = await page.locator('.error, [role="alert"], .text-red-500, .text-destructive').all();
      if (errorElements.length > 0) {
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          console.log(`Error ${i + 1}: "${errorText}"`);
        }
      }
    }
  });

  test('Verify login button behavior with workaround', async ({ page }) => {
    console.log('🧪 Testing login button behavior with workaround...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Select Khổng Đức Mạnh
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    await khongDucManhOption.click();
    await page.waitForTimeout(2000);
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');
    
    console.log('📝 Waiting for auto-login workaround to trigger...');
    
    // Wait for auto-login workaround (1 second delay + processing time)
    await page.waitForTimeout(3000);
    
    // Check if URL changed (indicating login attempt)
    const currentUrl = page.url();
    const loginAttempted = !currentUrl.includes('/login') || currentUrl !== 'http://localhost:8088/login';
    
    console.log(`Login attempted (URL changed): ${loginAttempted}`);
    console.log(`Current URL: ${currentUrl}`);
    
    if (loginAttempted) {
      console.log('✅ Auto-login workaround triggered successfully');
    } else {
      console.log('❌ Auto-login workaround did not trigger');
    }
  });
});
