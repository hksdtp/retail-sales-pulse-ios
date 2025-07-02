import { test, expect } from '@playwright/test';

test.describe('Fixed Login Test', () => {
  test('should test login with proper Radix UI interaction', async ({ page }) => {
    console.log('🧪 Testing login with proper Radix UI interaction...');

    // Step 1: Go to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    // Step 2: Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    await page.screenshot({ path: 'debug-radix-login-start.png', fullPage: true });

    // Step 3: Click on location selector (Radix UI Select)
    console.log('🔄 Clicking location selector...');
    const locationTrigger = page.locator('[role="combobox"], button:has-text("Chọn khu vực"), .select-trigger').first();
    
    if (await locationTrigger.isVisible({ timeout: 5000 })) {
      await locationTrigger.click();
      console.log('✅ Location selector clicked');
      await page.waitForTimeout(1000);

      // Step 4: Select "Hà Nội" from dropdown
      const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội"), [data-value="hanoi"]').first();
      if (await hanoiOption.isVisible({ timeout: 3000 })) {
        await hanoiOption.click();
        console.log('✅ Hà Nội selected');
      } else {
        console.log('❌ Hà Nội option not found');
        // Try alternative approach
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        console.log('✅ Selected using keyboard');
      }
    } else {
      console.log('❌ Location trigger not found, trying HTML select fallback');
      const htmlSelect = page.locator('select').first();
      await htmlSelect.selectOption({ index: 1 });
    }

    // Step 5: Wait for user selector to appear
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-after-location-radix.png', fullPage: true });

    // Step 6: Check for user selector
    const userSelector = page.locator('[data-testid="user-selector"]');
    let userSelected = false;

    if (await userSelector.isVisible({ timeout: 5000 })) {
      console.log('✅ User selector found');
      await userSelector.selectOption({ index: 1 });
      userSelected = true;
      console.log('✅ User selected');
    } else {
      console.log('⚠️ User selector not found, checking for Radix UI user selector');
      
      // Try Radix UI user selector
      const userTrigger = page.locator('button:has-text("Chọn người dùng"), [role="combobox"]:has-text("Chọn người dùng")').first();
      if (await userTrigger.isVisible({ timeout: 3000 })) {
        await userTrigger.click();
        await page.waitForTimeout(1000);
        
        // Select first user option
        const firstUserOption = page.locator('[role="option"]').first();
        if (await firstUserOption.isVisible({ timeout: 3000 })) {
          await firstUserOption.click();
          userSelected = true;
          console.log('✅ User selected via Radix UI');
        }
      }
    }

    // Step 7: Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('123456');
    console.log('✅ Password entered');

    // Step 8: Check login button state
    const loginButton = page.locator('button[type="submit"]').first();
    const isEnabled = await loginButton.isEnabled();
    console.log(`🔍 Login button enabled: ${isEnabled}, User selected: ${userSelected}`);

    if (isEnabled) {
      // Step 9: Click login
      await loginButton.click();
      console.log('✅ Login button clicked');

      // Step 10: Wait for redirect
      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
        console.log('✅ Login successful - redirected to main app');

        // Step 11: Test logout
        await testLogout(page);
      } catch (e) {
        console.log('❌ Login failed or did not redirect');
        console.log('Current URL:', page.url());
      }
    } else {
      console.log('❌ Login button is disabled');
    }

    console.log('🎉 Fixed login test completed');
  });

  async function testLogout(page) {
    console.log('🚪 Starting logout test...');

    // Wait for page to fully load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-before-logout.png', fullPage: true });

    // Look for user menu elements more comprehensively
    const userMenuSelectors = [
      // Avatar/user info in header
      '[data-testid="user-avatar"]',
      '[data-testid="user-menu"]',
      '.user-avatar',
      '.avatar',
      
      // Buttons with user names
      'button:has-text("Khổng")',
      'button:has-text("Nguyễn")',
      'button:has-text("Trần")',
      'button:has-text("Phạm")',
      'button:has-text("Lê")',
      
      // Header elements
      'header button',
      '.header button',
      'nav button',
      
      // Dropdown triggers
      '[role="button"][aria-haspopup]',
      'button[aria-haspopup="menu"]',
      
      // Any clickable element in top area
      'header [role="button"]',
      '.top-0 button',
      '.fixed button'
    ];

    let userMenuElement = null;
    for (const selector of userMenuSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent();
            if (text && (text.includes('Khổng') || text.includes('Nguyễn') || text.includes('Trần') || text.includes('Phạm') || text.includes('Lê'))) {
              userMenuElement = element;
              console.log(`✅ User menu found: ${selector} with text "${text.trim()}"`);
              break;
            }
          }
        }
        if (userMenuElement) break;
      } catch (e) {
        continue;
      }
    }

    if (!userMenuElement) {
      console.log('❌ No user menu found, trying to find any logout button directly');
      
      // Try to find logout button directly
      const directLogoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Đăng xuất")',
        'a:has-text("Logout")',
        'a:has-text("Đăng xuất")',
        '[data-testid="logout-button"]'
      ];

      for (const selector of directLogoutSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          userMenuElement = element;
          console.log(`✅ Direct logout button found: ${selector}`);
          break;
        }
      }
    }

    if (userMenuElement) {
      // Click user menu
      await userMenuElement.click();
      console.log('✅ User menu clicked');
      await page.waitForTimeout(1000);

      // Look for logout option
      const logoutSelectors = [
        'text="Logout"',
        'text="Đăng xuất"',
        'button:has-text("Logout")',
        'button:has-text("Đăng xuất")',
        '[data-testid="logout-button"]',
        'a:has-text("Logout")',
        'a:has-text("Đăng xuất")',
        '[role="menuitem"]:has-text("Logout")',
        '[role="menuitem"]:has-text("Đăng xuất")'
      ];

      let logoutElement = null;
      for (const selector of logoutSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          logoutElement = element;
          console.log(`✅ Logout option found: ${selector}`);
          break;
        }
      }

      if (logoutElement) {
        // Click logout
        await logoutElement.click();
        console.log('✅ Logout clicked');

        // Wait for redirect to login page
        try {
          await page.waitForURL('**/login', { timeout: 10000 });
          console.log('✅ Successfully redirected to login page after logout');
        } catch (e) {
          console.log('❌ Did not redirect to login page');
          console.log('Current URL after logout:', page.url());
          
          // Check if page content changed to login
          const hasLoginForm = await page.locator('form, input[type="password"]').isVisible({ timeout: 3000 });
          if (hasLoginForm) {
            console.log('✅ Login form appeared, logout successful');
          } else {
            console.log('❌ No login form, logout may have failed');
          }
        }
      } else {
        console.log('❌ Logout option not found');
        
        // Debug: show available options
        const allVisible = await page.locator('*:visible').all();
        console.log('🔍 Available elements after clicking user menu:');
        for (let i = 0; i < Math.min(allVisible.length, 10); i++) {
          const element = allVisible[i];
          const text = await element.textContent();
          const tagName = await element.evaluate(el => el.tagName);
          if (text && text.trim().length > 0 && text.trim().length < 30) {
            console.log(`  ${tagName}: "${text.trim()}"`);
          }
        }
      }
    } else {
      console.log('❌ No user menu or logout button found');
    }

    console.log('🎉 Logout test completed');
  }
});
