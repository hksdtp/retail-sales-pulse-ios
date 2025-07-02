import { test, expect } from '@playwright/test';

test.describe('Login and Password Change Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:8088');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Debug login form elements and flow', async ({ page }) => {
    console.log('🧪 Starting login form debug...');

    // Step 1: Check if page loaded correctly
    const title = await page.title();
    console.log('Page title:', title);

    // Step 2: Check all select elements
    const selects = await page.locator('select').all();
    console.log('Number of select elements:', selects.length);

    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const isVisible = await select.isVisible();
      const isEnabled = await select.isEnabled();
      const ariaHidden = await select.getAttribute('aria-hidden');
      const tabIndex = await select.getAttribute('tabindex');
      
      console.log(`Select ${i}:`, {
        visible: isVisible,
        enabled: isEnabled,
        ariaHidden,
        tabIndex
      });

      if (isVisible && isEnabled) {
        const options = await select.locator('option').allTextContents();
        console.log(`Select ${i} options:`, options);
      }
    }

    // Step 3: Try to select location using visible select
    console.log('📍 Attempting to select location...');
    
    // Find the visible location select
    const locationSelect = page.locator('select').first();
    const isLocationVisible = await locationSelect.isVisible();
    console.log('Location select visible:', isLocationVisible);

    if (isLocationVisible) {
      const locationOptions = await locationSelect.locator('option').allTextContents();
      console.log('Location options:', locationOptions);

      // Try to select "Hà Nội"
      try {
        await locationSelect.selectOption('Hà Nội');
        console.log('✅ Successfully selected Hà Nội');
        await page.waitForTimeout(2000);

        // Check if team select appeared
        const teamSelects = await page.locator('select').all();
        console.log('Team selects after location selection:', teamSelects.length);

        if (teamSelects.length > 1) {
          const teamSelect = teamSelects[1];
          const isTeamVisible = await teamSelect.isVisible();
          console.log('Team select visible:', isTeamVisible);

          if (isTeamVisible) {
            const teamOptions = await teamSelect.locator('option').allTextContents();
            console.log('Team options:', teamOptions);

            // Try to select first team
            const firstTeamOption = teamOptions.find(opt => opt.includes('NHÓM'));
            if (firstTeamOption) {
              await teamSelect.selectOption(firstTeamOption);
              console.log('✅ Successfully selected team:', firstTeamOption);
              await page.waitForTimeout(2000);

              // Check if user select appeared
              const userSelects = await page.locator('select').all();
              if (userSelects.length > 2) {
                const userSelect = userSelects[2];
                const isUserVisible = await userSelect.isVisible();
                console.log('User select visible:', isUserVisible);

                if (isUserVisible) {
                  const userOptions = await userSelect.locator('option').allTextContents();
                  console.log('User options:', userOptions);

                  // Select first user
                  const firstUser = userOptions.find(opt => opt && opt !== 'Chọn người dùng');
                  if (firstUser) {
                    await userSelect.selectOption(firstUser);
                    console.log('✅ Successfully selected user:', firstUser);
                    await page.waitForTimeout(1000);

                    // Step 4: Test login with default password
                    console.log('🔐 Testing login with default password...');
                    const passwordInput = page.locator('input[type="password"]');
                    await passwordInput.fill('123456');

                    const loginButton = page.locator('button[type="submit"]');
                    const isLoginEnabled = await loginButton.isEnabled();
                    console.log('Login button enabled:', isLoginEnabled);

                    if (isLoginEnabled) {
                      await loginButton.click();
                      console.log('🚀 Login button clicked');

                      // Wait for login to process
                      await page.waitForTimeout(5000);

                      // Check for password change modal
                      const modal = page.locator('[data-testid="change-password-modal"], [data-testid="global-password-change-modal-wrapper"]');
                      const isModalVisible = await modal.isVisible().catch(() => false);
                      console.log('Password change modal visible:', isModalVisible);

                      if (isModalVisible) {
                        console.log('✅ Modal appeared - testing modal functionality...');
                        
                        // Check modal content
                        const modalContent = await page.locator('[data-testid="change-password-modal-content"]').textContent();
                        console.log('Modal content preview:', modalContent?.substring(0, 100));

                        // Test password fields
                        const newPasswordInput = page.locator('input[placeholder*="mật khẩu mới"], input[placeholder*="Nhập mật khẩu mới"]').first();
                        const confirmPasswordInput = page.locator('input[placeholder*="Nhập lại"], input[placeholder*="Xác nhận"]').first();
                        
                        const newPasswordVisible = await newPasswordInput.isVisible().catch(() => false);
                        const confirmPasswordVisible = await confirmPasswordInput.isVisible().catch(() => false);
                        
                        console.log('Password inputs visible:', {
                          newPassword: newPasswordVisible,
                          confirmPassword: confirmPasswordVisible
                        });

                        if (newPasswordVisible && confirmPasswordVisible) {
                          await newPasswordInput.fill('newpassword123');
                          await confirmPasswordInput.fill('newpassword123');
                          await page.waitForTimeout(1000);

                          // Check submit button
                          const submitButton = page.locator('button:has-text("Đổi mật khẩu")');
                          const isSubmitEnabled = await submitButton.isEnabled().catch(() => false);
                          console.log('Submit button enabled:', isSubmitEnabled);

                          if (isSubmitEnabled) {
                            console.log('🔄 Testing password change submission...');
                            await submitButton.click();
                            await page.waitForTimeout(3000);

                            // Check if modal closed
                            const isModalStillVisible = await modal.isVisible().catch(() => false);
                            console.log('Modal still visible after submit:', isModalStillVisible);

                            // Check current URL
                            const currentUrl = page.url();
                            console.log('Current URL after password change:', currentUrl);
                          }
                        }
                      } else {
                        console.log('❌ Modal did not appear');
                        
                        // Debug current state
                        const currentUrl = page.url();
                        console.log('Current URL:', currentUrl);

                        // Check for any error messages
                        const errorMessages = await page.locator('.text-red-500, .text-red-600, .text-red-800, [class*="error"]').allTextContents();
                        console.log('Error messages:', errorMessages);

                        // Check console logs
                        const logs = await page.evaluate(() => {
                          return (window as any).consoleLogs || [];
                        });
                        console.log('Console logs:', logs.slice(-5)); // Last 5 logs
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ Error selecting location:', error);
      }
    }
  });

  test('Debug wrong password flow', async ({ page }) => {
    console.log('🧪 Testing wrong password flow...');

    // Quick login attempt with wrong password
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Hà Nội');
    await page.waitForTimeout(1000);

    const teamSelect = page.locator('select').nth(1);
    const teamOptions = await teamSelect.locator('option').allTextContents();
    const firstTeam = teamOptions.find(opt => opt.includes('NHÓM'));
    if (firstTeam) {
      await teamSelect.selectOption(firstTeam);
      await page.waitForTimeout(1000);

      const userSelect = page.locator('select').nth(2);
      const userOptions = await userSelect.locator('option').allTextContents();
      const firstUser = userOptions.find(opt => opt && opt !== 'Chọn người dùng');
      if (firstUser) {
        await userSelect.selectOption(firstUser);
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
          password: currentPassword,
          passwordCleared: currentPassword === ''
        });

        // Check for error messages
        const errorMessages = await page.locator('.text-red-500, .text-red-600, .text-red-800, [class*="error"]').allTextContents();
        console.log('Error messages:', errorMessages);
      }
    }
  });
});
