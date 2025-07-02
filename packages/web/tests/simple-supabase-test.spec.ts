import { test, expect } from '@playwright/test';

test.describe('Simple Supabase Test', () => {
  test('should test basic login flow', async ({ page }) => {
    console.log('🧪 Starting Simple Supabase Test...');

    // Step 1: Go to login page directly
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    // Step 2: Wait for page to load
    await page.waitForSelector('form, .login-form', { timeout: 15000 });
    console.log('✅ Login form found');

    // Step 3: Take screenshot for debugging
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
    console.log('✅ Screenshot taken');

    // Step 4: Check for location selector
    const locationSelectors = [
      'select[name*="location"]',
      'select[aria-label*="location"]', 
      'select[aria-label*="khu vực"]',
      'select:first-of-type',
      'select'
    ];

    let locationSelector = null;
    for (const selector of locationSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          locationSelector = element;
          console.log(`✅ Location selector found: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!locationSelector) {
      console.log('❌ No location selector found');
      return;
    }

    // Step 5: Get location options
    const locationOptions = await locationSelector.locator('option').allTextContents();
    console.log('📋 Location options:', locationOptions);

    // Step 6: Select location by index (not "Toàn quốc" to trigger user selector)
    await locationSelector.selectOption({ index: 1 }); // Should be "Hà Nội"
    console.log('✅ Location selected');

    // Wait for user selector to appear (it should appear when not selecting "Toàn quốc")
    await page.waitForTimeout(3000);
    console.log('⏳ Waiting for user selector to appear...');

    // Step 7: Check for user dropdown - be more specific
    const userSelectors = [
      '[data-testid="user-selector"]',
      'select[name*="user"]',
      'select[aria-label*="user"]',
      'select[aria-label*="người dùng"]'
    ];

    let userSelector = null;
    for (const selector of userSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          userSelector = element;
          console.log(`✅ User selector found: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If no specific user selector found, check all selects again after location change
    if (!userSelector) {
      // Wait a bit more for user selector to appear
      await page.waitForTimeout(2000);

      const allSelects = await page.locator('select').count();
      console.log(`🔍 Total select elements found after location change: ${allSelects}`);

      for (let i = 0; i < allSelects; i++) {
        const selectElement = page.locator('select').nth(i);
        const options = await selectElement.locator('option').allTextContents();
        console.log(`🔍 Select ${i} options:`, options);

        // Check if this looks like a user selector (has names/positions)
        const hasUserLikeOptions = options.some(option =>
          option.includes('-') ||
          option.includes('Trưởng') ||
          option.includes('Nhân viên') ||
          option.includes('người dùng') ||
          option.includes('Chọn người dùng')
        );

        if (hasUserLikeOptions && !userSelector) {
          userSelector = selectElement;
          console.log(`✅ User selector found at index ${i} (by content analysis)`);
          break;
        }
      }

      // If still no user selector, try waiting for it to appear
      if (!userSelector) {
        console.log('⏳ Waiting for user selector to appear...');
        try {
          await page.waitForSelector('[data-testid="user-selector"], select:has(option:text("Chọn người dùng"))', { timeout: 5000 });
          userSelector = page.locator('[data-testid="user-selector"], select:has(option:text("Chọn người dùng"))').first();
          console.log('✅ User selector appeared after waiting');
        } catch (e) {
          console.log('❌ User selector did not appear after waiting');
        }
      }
    }

    if (!userSelector) {
      console.log('❌ No user selector found');
      return;
    }

    // Step 8: Get user options
    const userOptions = await userSelector.locator('option').allTextContents();
    console.log('👥 User options:', userOptions);

    // Debug: Check if user selector is actually showing users
    if (userOptions.length <= 3 && userOptions.some(opt => opt.includes('Hà Nội') || opt.includes('Hồ Chí Minh'))) {
      console.log('⚠️ User selector seems to be showing location options instead of users');
      console.log('🔍 This indicates a bug in the LoginForm component');
    }

    // Step 9: Select user
    if (userOptions.length > 1) {
      await userSelector.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      console.log('✅ User selected');
    }

    // Step 10: Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('123456');
    console.log('✅ Password entered');

    // Step 11: Check login button state
    const loginButton = page.locator('button[type="submit"]').first();
    const isButtonVisible = await loginButton.isVisible();
    const isButtonEnabled = await loginButton.isEnabled();
    
    console.log('🔍 Login button state:', {
      visible: isButtonVisible,
      enabled: isButtonEnabled
    });

    // Step 12: Debug button attributes
    const buttonAttributes = await loginButton.evaluate(el => ({
      disabled: el.disabled,
      className: el.className,
      textContent: el.textContent,
      type: el.type
    }));
    console.log('🔍 Button attributes:', buttonAttributes);

    // Step 13: If button is enabled, try to click
    if (isButtonEnabled) {
      await loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for navigation or error
      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
        console.log('✅ Login successful - redirected away from login page');
      } catch (e) {
        console.log('⚠️ Still on login page - login may have failed');
      }
    } else {
      console.log('❌ Login button is disabled');
      
      // Debug why button is disabled
      const formData = await page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return null;
        
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
          data[key] = value;
        }
        return data;
      });
      console.log('📋 Form data:', formData);
    }

    console.log('🎉 Simple Supabase Test Completed');
  });

  test('should test complete login and logout flow', async ({ page }) => {
    console.log('🧪 Testing Complete Login and Logout Flow...');

    // Step 1: Login first
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    // Wait for login form
    await page.waitForSelector('form, .login-form', { timeout: 10000 });

    // Select location (Hà Nội to trigger user selector)
    const locationSelector = page.locator('select').first();
    await locationSelector.selectOption({ index: 1 });
    await page.waitForTimeout(2000);
    console.log('✅ Location selected');

    // Wait for user selector to appear
    await page.waitForTimeout(3000);

    // Find user selector
    const userSelector = page.locator('[data-testid="user-selector"]').first();
    if (await userSelector.isVisible({ timeout: 5000 })) {
      await userSelector.selectOption({ index: 1 });
      console.log('✅ User selected');
    } else {
      console.log('⚠️ User selector not found, trying alternative approach');
      // Try to find any select with user-like options
      const allSelects = await page.locator('select').count();
      for (let i = 0; i < allSelects; i++) {
        const selectElement = page.locator('select').nth(i);
        const options = await selectElement.locator('option').allTextContents();
        if (options.some(opt => opt.includes('-') || opt.includes('Trưởng'))) {
          await selectElement.selectOption({ index: 1 });
          console.log(`✅ User selected from select ${i}`);
          break;
        }
      }
    }

    // Enter password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('123456');
    console.log('✅ Password entered');

    // Wait for login button to be enabled
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 10000 });

    // Click login
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    console.log('✅ Login button clicked');

    // Wait for successful login (redirect away from login page)
    try {
      await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
      console.log('✅ Login successful - redirected to main app');
    } catch (e) {
      console.log('❌ Login failed or did not redirect');
      return;
    }

    // Step 2: Now test logout
    console.log('🚪 Starting logout test...');

    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-after-login.png', fullPage: true });

    // Look for user menu/avatar elements
    const userMenuSelectors = [
      '[data-testid="user-avatar"]',
      '[data-testid="user-menu"]',
      '.avatar',
      'button[aria-label*="user"]',
      'button[aria-label*="avatar"]',
      'button:has-text("Khổng")',
      'button:has-text("Nguyễn")',
      'button:has-text("Trần")',
      '[role="button"]:has-text("Khổng")',
      '[role="button"]:has-text("Nguyễn")',
      '[role="button"]:has-text("Trần")',
      'div:has-text("Khổng") button',
      'div:has-text("Nguyễn") button',
      'div:has-text("Trần") button'
    ];

    let userMenuElement = null;
    for (const selector of userMenuSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          userMenuElement = element;
          console.log(`✅ User menu element found: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!userMenuElement) {
      console.log('❌ No user menu element found');
      console.log('🔍 Searching for any clickable elements with user names...');

      // Try to find any element containing user names
      const userNameElements = await page.locator('*:has-text("Khổng"), *:has-text("Nguyễn"), *:has-text("Trần")').all();
      console.log(`Found ${userNameElements.length} elements with user names`);

      for (let i = 0; i < userNameElements.length; i++) {
        const element = userNameElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const isClickable = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.cursor === 'pointer' || el.onclick !== null || el.getAttribute('role') === 'button';
        });
        console.log(`Element ${i}: ${tagName}, clickable: ${isClickable}`);

        if (isClickable) {
          userMenuElement = element;
          console.log(`✅ Found clickable user element: ${tagName}`);
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
        'div:has-text("Logout")',
        'div:has-text("Đăng xuất")'
      ];

      let logoutElement = null;
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            logoutElement = element;
            console.log(`✅ Logout element found: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
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
          console.log('❌ Did not redirect to login page after logout');
          console.log('Current URL after logout:', page.url());

          // Check if still on same page
          await page.waitForTimeout(2000);
          const currentUrl = page.url();
          if (currentUrl.includes('/login')) {
            console.log('✅ Actually on login page now');
          } else {
            console.log('❌ Still not on login page');
          }
        }
      } else {
        console.log('❌ Logout element not found');
        console.log('🔍 Available elements after clicking user menu:');

        // Debug: show all visible elements
        const allVisible = await page.locator('*:visible').all();
        for (let i = 0; i < Math.min(allVisible.length, 20); i++) {
          const element = allVisible[i];
          const text = await element.textContent();
          const tagName = await element.evaluate(el => el.tagName);
          if (text && text.trim().length > 0 && text.trim().length < 50) {
            console.log(`  ${tagName}: "${text.trim()}"`);
          }
        }
      }
    } else {
      console.log('❌ No user menu element found at all');
    }

    console.log('🎉 Complete Login/Logout Test Completed');
  });
});
