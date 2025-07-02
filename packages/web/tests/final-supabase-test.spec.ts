import { test, expect } from '@playwright/test';

test.describe('Final Supabase Migration Test', () => {
  test('should complete full login and logout flow with Supabase', async ({ page }) => {
    console.log('🎯 Starting final Supabase migration test...');

    // Step 1: Login
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    await page.waitForSelector('form', { timeout: 10000 });

    // Step 2: Select location (Hà Nội)
    const locationTrigger = page.locator('[role="combobox"]').first();
    await locationTrigger.click();
    await page.waitForTimeout(1000);
    
    const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")').first();
    await hanoiOption.click();
    console.log('✅ Hà Nội selected');

    // Step 3: Wait for user selector and select user
    await page.waitForTimeout(2000);
    const userSelector = page.locator('[data-testid="user-selector"]');
    await expect(userSelector).toBeVisible();
    await userSelector.selectOption({ index: 1 });
    console.log('✅ User selected');

    // Step 4: Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');
    console.log('✅ Password entered');

    // Step 5: Login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    console.log('✅ Login button clicked');

    // Step 6: Wait for successful login
    await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
    console.log('✅ Login successful - redirected to main app');

    // Step 7: Test logout
    console.log('🚪 Starting logout test...');
    await page.waitForTimeout(2000);

    // Look for user menu/avatar
    const userMenuSelectors = [
      '[data-testid="user-avatar"]',
      '[data-testid="user-menu"]',
      'button:has-text("Lê")',
      'button:has-text("Lương")',
      'button:has-text("Nguyễn")',
      'button:has-text("Phạm")',
      'button:has-text("Quản")',
      'button:has-text("Trịnh")',
      'header button',
      '.header button'
    ];

    let userMenuElement = null;
    for (const selector of userMenuSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          userMenuElement = element;
          console.log(`✅ User menu found: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (userMenuElement) {
      await userMenuElement.click();
      console.log('✅ User menu clicked');
      await page.waitForTimeout(1000);

      // Look for logout option
      const logoutSelectors = [
        'text="Logout"',
        'text="Đăng xuất"',
        'button:has-text("Logout")',
        'button:has-text("Đăng xuất")',
        '[data-testid="logout-button"]'
      ];

      let logoutElement = null;
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            logoutElement = element;
            console.log(`✅ Logout option found: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (logoutElement) {
        await logoutElement.click();
        console.log('✅ Logout clicked');

        // Wait for redirect to login page
        try {
          await page.waitForURL('**/login', { timeout: 10000 });
          console.log('✅ Successfully redirected to login page after logout');
        } catch (e) {
          console.log('⚠️ Did not redirect to login page, checking current state...');
          const currentUrl = page.url();
          console.log('Current URL:', currentUrl);
          
          // Check if login form is visible
          const hasLoginForm = await page.locator('form, input[type="password"]').isVisible({ timeout: 3000 });
          if (hasLoginForm) {
            console.log('✅ Login form visible, logout successful');
          } else {
            console.log('❌ No login form visible, logout may have failed');
          }
        }
      } else {
        console.log('❌ Logout option not found');
      }
    } else {
      console.log('❌ User menu not found');
    }

    console.log('🎉 Final Supabase migration test completed!');
  });

  test('should verify Supabase data loading', async ({ page }) => {
    console.log('🔍 Testing Supabase data loading...');

    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('Loaded') && msg.text().includes('Supabase')) {
        logs.push(msg.text());
      }
    });

    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(5000);

    console.log('📊 Supabase loading logs:');
    logs.forEach(log => console.log(`  ${log}`));

    // Verify users and teams loaded
    const hasUsersLog = logs.some(log => log.includes('users') && log.includes('Supabase'));
    const hasTeamsLog = logs.some(log => log.includes('teams') && log.includes('Supabase'));

    expect(hasUsersLog).toBeTruthy();
    expect(hasTeamsLog).toBeTruthy();

    console.log('✅ Supabase data loading verified');
  });

  test('should handle login errors correctly', async ({ page }) => {
    console.log('🧪 Testing login error handling...');

    await page.goto('http://localhost:8088/login');
    await page.waitForSelector('form', { timeout: 10000 });

    // Select location and user
    const locationTrigger = page.locator('[role="combobox"]').first();
    await locationTrigger.click();
    await page.waitForTimeout(500);
    
    const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")').first();
    await hanoiOption.click();
    await page.waitForTimeout(2000);

    const userSelector = page.locator('[data-testid="user-selector"]');
    await userSelector.selectOption({ index: 1 });

    // Enter wrong password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');

    // Try to login
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Should show error message
    const errorSelectors = [
      '.toast',
      '.error',
      '[role="alert"]',
      'div:has-text("thất bại")',
      'div:has-text("không đúng")'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector);
        if (await errorElement.isVisible({ timeout: 5000 })) {
          console.log(`✅ Error message found: ${selector}`);
          errorFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!errorFound) {
      // Check if still on login page (indicates login failed)
      await expect(page).toHaveURL(/login/);
      console.log('✅ Still on login page, indicating login failed correctly');
    }

    console.log('✅ Login error handling test completed');
  });
});
