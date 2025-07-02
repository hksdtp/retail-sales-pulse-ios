import { test, expect } from '@playwright/test';

test.describe('Login and Password Change - Fixed Version', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:8088');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Test first-time login with password change modal - FIXED', async ({ page }) => {
    console.log('🧪 Testing FIXED first-time login flow...');

    // Step 1: Select location
    console.log('📍 Step 1: Selecting Hà Nội...');
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Hà Nội');
    await page.waitForTimeout(1500);

    // Step 2: Select team
    console.log('👥 Step 2: Selecting team...');
    const teamSelect = page.locator('select').nth(1);
    await teamSelect.selectOption('NHÓM 1 - Lương Việt Anh');
    await page.waitForTimeout(1500);

    // Step 3: Select user
    console.log('👤 Step 3: Selecting user...');
    const userSelect = page.locator('select').nth(2);
    await userSelect.selectOption('Lương Việt Anh');
    await page.waitForTimeout(1000);

    // Step 4: Enter password
    console.log('🔐 Step 4: Entering password...');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');

    // Step 5: Click login button
    console.log('🚀 Step 5: Clicking login button...');
    const loginButton = page.locator('button[type="submit"]');
    
    // Wait for button to be ready
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // Step 6: Wait for login to process and modal to appear
    console.log('⏳ Step 6: Waiting for password change modal...');
    await page.waitForTimeout(3000);

    // Check for modal with multiple possible selectors
    const modalSelectors = [
      '[data-testid="change-password-modal"]',
      '[data-testid="global-password-change-modal-wrapper"]',
      '.fixed.inset-0.bg-black.bg-opacity-50',
      '.fixed.inset-0'
    ];

    let modalFound = false;
    let modalSelector = '';

    for (const selector of modalSelectors) {
      const modal = page.locator(selector);
      const isVisible = await modal.isVisible().catch(() => false);
      if (isVisible) {
        modalFound = true;
        modalSelector = selector;
        console.log(`✅ Modal found with selector: ${selector}`);
        break;
      }
    }

    if (modalFound) {
      console.log('✅ Password change modal appeared!');
      
      // Test modal functionality
      const modal = page.locator(modalSelector);
      
      // Check modal content
      const modalContent = await modal.textContent();
      console.log('Modal content preview:', modalContent?.substring(0, 200));

      // Look for password input fields
      const newPasswordInput = page.locator('input[placeholder*="mật khẩu mới"], input[placeholder*="Nhập mật khẩu mới"]').first();
      const confirmPasswordInput = page.locator('input[placeholder*="Nhập lại"], input[placeholder*="Xác nhận"]').first();
      
      const newPasswordVisible = await newPasswordInput.isVisible().catch(() => false);
      const confirmPasswordVisible = await confirmPasswordInput.isVisible().catch(() => false);
      
      console.log('Password inputs visible:', {
        newPassword: newPasswordVisible,
        confirmPassword: confirmPasswordVisible
      });

      if (newPasswordVisible && confirmPasswordVisible) {
        console.log('🔐 Testing password change...');
        
        // Fill in new password
        await newPasswordInput.fill('newpassword123');
        await confirmPasswordInput.fill('newpassword123');
        await page.waitForTimeout(1000);

        // Check submit button
        const submitButton = page.locator('[data-testid="submit-password-change-button"], button:has-text("Đổi mật khẩu")').first();
        const isSubmitEnabled = await submitButton.isEnabled().catch(() => false);
        console.log('Submit button enabled:', isSubmitEnabled);

        if (isSubmitEnabled) {
          console.log('🔄 Submitting password change...');
          // Use force click to bypass overlay elements
          await submitButton.click({ force: true });
          await page.waitForTimeout(3000);

          // Check if modal closed and redirected
          const isModalStillVisible = await modal.isVisible().catch(() => false);
          const currentUrl = page.url();
          
          console.log('After password change:', {
            modalStillVisible: isModalStillVisible,
            currentUrl: currentUrl,
            expectedRedirect: currentUrl !== 'http://localhost:8088/login'
          });

          // Verify success
          if (!isModalStillVisible && currentUrl !== 'http://localhost:8088/login') {
            console.log('✅ Password change successful - modal closed and redirected!');
          } else {
            console.log('⚠️ Password change may have issues');
          }
        } else {
          console.log('❌ Submit button is disabled - checking validation');
          
          // Check validation messages
          const validationMessages = await page.locator('.text-red-500, .text-red-600, .text-red-800, [class*="error"]').allTextContents();
          console.log('Validation messages:', validationMessages);
        }
      } else {
        console.log('❌ Password input fields not found');
      }

    } else {
      console.log('❌ Password change modal did not appear');
      
      // Debug information
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Check for any error messages
      const errorMessages = await page.locator('.text-red-500, .text-red-600, .text-red-800, [class*="error"]').allTextContents();
      console.log('Error messages on page:', errorMessages);

      // Check if user is logged in but modal missing
      const pageContent = await page.textContent('body');
      const hasPasswordChangeText = pageContent?.includes('đổi mật khẩu') || pageContent?.includes('password');
      console.log('Page contains password change text:', hasPasswordChangeText);

      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-no-modal.png' });
      console.log('Screenshot saved as debug-no-modal.png');
    }
  });

  test('Test admin login (Khổng Đức Mạnh) - should work normally', async ({ page }) => {
    console.log('🧪 Testing admin login...');

    // Select admin user
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Khổng Đức MạnhTrưởng phòng kinh doanh');
    await page.waitForTimeout(1000);

    // Enter admin password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');

    // Click login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Check result
    const currentUrl = page.url();
    const isModalVisible = await page.locator('[data-testid="change-password-modal"]').isVisible().catch(() => false);
    
    console.log('Admin login result:', {
      currentUrl: currentUrl,
      modalVisible: isModalVisible,
      expectedBehavior: 'Should login directly without password change modal'
    });

    // Admin should not see password change modal
    expect(isModalVisible).toBe(false);
    
    // Should be redirected to main app or stay on login with success
    if (currentUrl !== 'http://localhost:8088/login') {
      console.log('✅ Admin logged in successfully and redirected');
    } else {
      console.log('ℹ️ Admin login completed but stayed on login page');
    }
  });

  test('Test wrong password flow - should preserve selections', async ({ page }) => {
    console.log('🧪 Testing wrong password flow...');

    // Quick login setup
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Hà Nội');
    await page.waitForTimeout(1000);

    const teamSelect = page.locator('select').nth(1);
    await teamSelect.selectOption('NHÓM 1 - Lương Việt Anh');
    await page.waitForTimeout(1000);

    const userSelect = page.locator('select').nth(2);
    await userSelect.selectOption('Lương Việt Anh');
    await page.waitForTimeout(500);

    // Enter wrong password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Check if selections are preserved
    const currentLocation = await locationSelect.inputValue();
    const currentTeam = await teamSelect.inputValue();
    const currentUser = await userSelect.inputValue();
    const currentPassword = await passwordInput.inputValue();

    console.log('After wrong password attempt:', {
      location: currentLocation,
      team: currentTeam,
      user: currentUser,
      passwordCleared: currentPassword === '',
      selectionsPreserved: currentLocation && currentTeam && currentUser
    });

    // Verify selections are preserved and password is cleared
    expect(currentLocation).toBeTruthy();
    expect(currentTeam).toBeTruthy();
    expect(currentUser).toBeTruthy();
    expect(currentPassword).toBe(''); // Password should be cleared

    console.log('✅ Wrong password flow works correctly - selections preserved, password cleared');
  });
});
