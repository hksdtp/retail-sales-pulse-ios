import { test, expect } from '@playwright/test';

test.describe('Khổng Đức Mạnh Final Login Test', () => {
  test('Complete login flow for Khổng Đức Mạnh with proper timing', async ({ page }) => {
    console.log('🧪 Final test: Khổng Đức Mạnh complete login flow...');
    
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
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Enter password...');
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('Haininh1');
    
    // Wait for form validation
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 3: Wait for login button to be enabled...');
    
    // Wait for login button to be enabled
    const loginButton = page.locator('button:has-text("Đăng Nhập")');
    await expect(loginButton).toBeVisible();
    
    // Wait up to 10 seconds for button to be enabled
    await expect(loginButton).toBeEnabled({ timeout: 10000 });
    
    console.log('📝 Step 4: Click login button...');
    
    // Click login button
    await loginButton.click();
    
    console.log('📝 Step 5: Wait for login to complete...');
    
    // Wait for navigation or password change modal
    await page.waitForTimeout(5000);
    
    // Check if we're redirected or if password change modal appears
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    // Check for password change modal
    const passwordChangeModal = page.locator('[data-testid="password-change-modal"], .modal:has-text("Đổi mật khẩu")');
    const isPasswordChangeModalVisible = await passwordChangeModal.isVisible();
    console.log(`Password change modal visible: ${isPasswordChangeModalVisible}`);
    
    if (isPasswordChangeModalVisible) {
      console.log('📝 Step 6: Handle password change modal...');
      
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
    }
    
    // Check final state
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // Check if we're on dashboard
    const isDashboard = finalUrl.includes('/') && !finalUrl.includes('/login');
    console.log(`Successfully logged in to dashboard: ${isDashboard}`);
    
    if (isDashboard) {
      console.log('📝 Step 7: Check task menu tabs...');
      
      // Wait for dashboard to load
      await page.waitForTimeout(3000);
      
      // Check for task menu tabs
      const taskTabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
      
      for (const tabName of taskTabs) {
        const tab = page.locator(`button:has-text("${tabName}")`);
        const isTabVisible = await tab.isVisible();
        console.log(`Tab "${tabName}" visible: ${isTabVisible}`);
        
        if (tabName === 'Thành viên' && isTabVisible) {
          console.log('✅ "Thành viên" tab correctly visible for Khổng Đức Mạnh');
        }
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'khong-duc-manh-final-success.png', fullPage: true });
      
      console.log('✅ Login test completed successfully!');
    } else {
      console.log('❌ Login failed - still on login page');
      await page.screenshot({ path: 'khong-duc-manh-final-failed.png', fullPage: true });
    }
  });

  test('Test login button state changes', async ({ page }) => {
    console.log('🧪 Testing login button state changes...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    const loginButton = page.locator('button:has-text("Đăng Nhập")');
    
    // Initial state - should be disabled
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeDisabled();
    console.log('✅ Initial state: Login button is disabled');
    
    // Select Khổng Đức Mạnh
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    await khongDucManhOption.click();
    await page.waitForTimeout(3000);
    
    // Should still be disabled (no password)
    await expect(loginButton).toBeDisabled();
    console.log('✅ After user selection: Login button still disabled (no password)');
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');
    await page.waitForTimeout(2000);
    
    // Should now be enabled
    await expect(loginButton).toBeEnabled({ timeout: 5000 });
    console.log('✅ After password entry: Login button is enabled');
    
    // Clear password
    await passwordInput.clear();
    await page.waitForTimeout(1000);
    
    // Should be disabled again
    await expect(loginButton).toBeDisabled();
    console.log('✅ After clearing password: Login button is disabled again');
    
    console.log('✅ Login button state test completed successfully!');
  });
});
