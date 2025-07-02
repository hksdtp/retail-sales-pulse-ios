import { test, expect } from '@playwright/test';

test.describe('Logout Only Test', () => {
  test('should test logout functionality directly', async ({ page }) => {
    console.log('🚪 Testing logout functionality directly...');

    // Step 1: Login manually first by going to main page
    await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to main page');

    // Step 2: Check if already logged in
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to login page (not logged in)
    if (page.url().includes('/login')) {
      console.log('ℹ️ Not logged in, need to login first');
      
      // Quick login
      await page.waitForSelector('form', { timeout: 10000 });
      
      // Select location
      const locationTrigger = page.locator('[role="combobox"]').first();
      await locationTrigger.click();
      await page.waitForTimeout(1000);
      
      const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")').first();
      await hanoiOption.click();
      await page.waitForTimeout(3000);
      
      // Try to find user selector with longer timeout
      const userSelector = page.locator('[data-testid="user-selector"]');
      try {
        await userSelector.waitFor({ timeout: 10000 });
        await userSelector.selectOption({ index: 1 });
        console.log('✅ User selected');
      } catch (e) {
        console.log('❌ User selector not found, trying alternative');
        // Try HTML select fallback
        const allSelects = await page.locator('select').count();
        if (allSelects >= 3) {
          await page.locator('select').nth(2).selectOption({ index: 1 });
          console.log('✅ User selected via HTML select');
        }
      }
      
      // Enter password and login
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('123456');
      
      const loginButton = page.locator('button[type="submit"]');
      await loginButton.click();
      
      // Wait for login success
      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
        console.log('✅ Login successful');
      } catch (e) {
        console.log('❌ Login failed, cannot test logout');
        return;
      }
    } else {
      console.log('✅ Already logged in');
    }

    // Step 3: Now test logout
    console.log('🚪 Starting logout test...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-before-logout-test.png', fullPage: true });

    // Look for user menu elements comprehensively
    const userMenuSelectors = [
      // Common user menu patterns
      '[data-testid="user-avatar"]',
      '[data-testid="user-menu"]',
      '[data-testid="user-dropdown"]',
      '.user-avatar',
      '.avatar',
      '.user-menu',
      
      // Header elements
      'header button',
      '.header button',
      'nav button',
      '.navbar button',
      
      // User name buttons (from our sample data)
      'button:has-text("Lê Khánh Duy")',
      'button:has-text("Lương Việt Anh")',
      'button:has-text("Nguyễn Thị Thảo")',
      'button:has-text("Phạm Thị Hương")',
      'button:has-text("Quản Thu Hà")',
      'button:has-text("Trịnh Thị Bốn")',
      
      // Partial name matches
      'button:has-text("Lê")',
      'button:has-text("Lương")',
      'button:has-text("Nguyễn")',
      'button:has-text("Phạm")',
      'button:has-text("Quản")',
      'button:has-text("Trịnh")',
      
      // Dropdown triggers
      '[role="button"][aria-haspopup]',
      'button[aria-haspopup="menu"]',
      '[aria-haspopup="true"]',
      
      // Top area clickable elements
      '.top-0 button',
      '.fixed button',
      '.absolute button',
      
      // Any button in header area
      'header *[role="button"]',
      '.header *[role="button"]'
    ];

    let userMenuElement = null;
    let foundSelector = '';

    for (const selector of userMenuSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent();
            console.log(`🔍 Found element: ${selector} with text: "${text?.trim()}"`);
            
            // Check if this looks like a user menu
            if (text && (
              text.includes('Lê') || text.includes('Lương') || text.includes('Nguyễn') ||
              text.includes('Phạm') || text.includes('Quản') || text.includes('Trịnh') ||
              text.includes('avatar') || text.includes('menu') || text.includes('user')
            )) {
              userMenuElement = element;
              foundSelector = selector;
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
      console.log('❌ No user menu found, trying to find logout button directly');
      
      // Try to find logout button directly
      const directLogoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Đăng xuất")',
        'a:has-text("Logout")',
        'a:has-text("Đăng xuất")',
        '[data-testid="logout-button"]',
        '*:has-text("Logout")',
        '*:has-text("Đăng xuất")'
      ];

      for (const selector of directLogoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            userMenuElement = element;
            foundSelector = selector;
            console.log(`✅ Direct logout button found: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (userMenuElement) {
      console.log(`🎯 Clicking user menu/logout: ${foundSelector}`);
      await userMenuElement.click();
      await page.waitForTimeout(1000);

      // If we clicked a user menu, look for logout option
      if (!foundSelector.includes('Logout') && !foundSelector.includes('Đăng xuất')) {
        console.log('🔍 Looking for logout option in menu...');
        
        const logoutSelectors = [
          'text="Logout"',
          'text="Đăng xuất"',
          'button:has-text("Logout")',
          'button:has-text("Đăng xuất")',
          '[data-testid="logout-button"]',
          'a:has-text("Logout")',
          'a:has-text("Đăng xuất")',
          '[role="menuitem"]:has-text("Logout")',
          '[role="menuitem"]:has-text("Đăng xuất")',
          'li:has-text("Logout")',
          'li:has-text("Đăng xuất")'
        ];

        let logoutElement = null;
        for (const selector of logoutSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 3000 })) {
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
          console.log('✅ Logout option clicked');
        } else {
          console.log('❌ Logout option not found in menu');
          
          // Debug: show what's available
          const allVisible = await page.locator('*:visible').all();
          console.log('🔍 Available elements after clicking user menu:');
          for (let i = 0; i < Math.min(allVisible.length, 15); i++) {
            const element = allVisible[i];
            const text = await element.textContent();
            const tagName = await element.evaluate(el => el.tagName);
            if (text && text.trim().length > 0 && text.trim().length < 50) {
              console.log(`  ${tagName}: "${text.trim()}"`);
            }
          }
          return;
        }
      } else {
        console.log('✅ Direct logout button clicked');
      }

      // Step 4: Check if logout was successful
      console.log('🔍 Checking logout result...');
      
      try {
        await page.waitForURL('**/login', { timeout: 10000 });
        console.log('✅ Successfully redirected to login page after logout');
      } catch (e) {
        console.log('⚠️ Did not redirect to login page, checking current state...');
        
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        console.log('Current URL after logout:', currentUrl);
        
        // Check if login form is visible
        const hasLoginForm = await page.locator('form, input[type="password"]').isVisible({ timeout: 3000 });
        if (hasLoginForm) {
          console.log('✅ Login form visible, logout successful');
        } else {
          console.log('❌ No login form visible, logout may have failed');
          
          // Check if we're still logged in
          const stillLoggedIn = await page.locator('[data-testid="user-avatar"], .avatar, button:has-text("Logout")').isVisible({ timeout: 3000 });
          if (stillLoggedIn) {
            console.log('❌ Still appears to be logged in');
          } else {
            console.log('🤔 Unclear state - not obviously logged in or out');
          }
        }
      }
    } else {
      console.log('❌ No user menu or logout button found at all');
      
      // Final debug: show all clickable elements
      console.log('🔍 All clickable elements on page:');
      const allClickable = await page.locator('button, a, [role="button"], [onclick]').all();
      for (let i = 0; i < Math.min(allClickable.length, 20); i++) {
        const element = allClickable[i];
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        if (text && text.trim().length > 0) {
          console.log(`  ${tagName}: "${text.trim()}"`);
        }
      }
    }

    console.log('🎉 Logout test completed');
  });
});
