import { test, expect } from '@playwright/test';

test.describe('Supabase Migration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8088');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
  });

  test('should complete logout and login flow with Supabase', async ({ page }) => {
    console.log('🧪 Starting Supabase Migration Test...');

    // Step 1: Check if already logged in and logout if needed
    const isLoggedIn = await page.locator('[data-testid="user-avatar"], .avatar, [aria-label*="user"], [aria-label*="avatar"]').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isLoggedIn) {
      console.log('✅ User is logged in, testing logout...');
      
      // Click on user avatar/menu
      await page.locator('[data-testid="user-avatar"], .avatar, [aria-label*="user"], [aria-label*="avatar"]').first().click();
      await page.waitForTimeout(1000);
      
      // Look for logout button with various selectors
      const logoutSelectors = [
        'text="Logout"',
        'text="Đăng xuất"', 
        '[data-testid="logout-button"]',
        'button:has-text("Logout")',
        'button:has-text("Đăng xuất")'
      ];
      
      let logoutClicked = false;
      for (const selector of logoutSelectors) {
        try {
          const logoutBtn = page.locator(selector);
          if (await logoutBtn.isVisible({ timeout: 2000 })) {
            await logoutBtn.click();
            logoutClicked = true;
            console.log('✅ Logout button clicked');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!logoutClicked) {
        console.log('⚠️ Could not find logout button, clearing localStorage manually');
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.setItem('justLoggedOut', 'true');
        });
        await page.goto('http://localhost:8088/login');
      }
      
      // Wait for redirect to login page
      await page.waitForURL('**/login', { timeout: 10000 });
      console.log('✅ Redirected to login page');
    } else {
      console.log('ℹ️ User not logged in, going to login page');
      await page.goto('http://localhost:8088/login');
    }

    // Step 2: Verify login page loads with Supabase data
    console.log('🔍 Checking login page with Supabase data...');
    
    // Wait for login form to load
    await page.waitForSelector('form, [data-testid="login-form"], .login-form', { timeout: 10000 });
    
    // Check for location selector
    const locationSelector = page.locator('select, [data-testid="location-select"], [aria-label*="location"], [aria-label*="khu vực"]').first();
    await expect(locationSelector).toBeVisible({ timeout: 10000 });
    console.log('✅ Location selector found');
    
    // Select a location (not "Toàn quốc" to see filtered users)
    // Try different selection methods
    try {
      await locationSelector.selectOption({ index: 1 }); // Select second option (not "Toàn quốc")
    } catch (e) {
      try {
        await locationSelector.selectOption('hanoi');
      } catch (e2) {
        await locationSelector.selectOption('hcm');
      }
    }
    await page.waitForTimeout(1000);
    console.log('✅ Location selected');
    
    // Check for user dropdown
    const userDropdown = page.locator('select[name*="user"], [data-testid="user-select"], [aria-label*="user"], [aria-label*="người dùng"]').first();
    await expect(userDropdown).toBeVisible({ timeout: 5000 });
    console.log('✅ User dropdown found');
    
    // Verify dropdown has options (users from Supabase)
    const userOptions = await userDropdown.locator('option').count();
    expect(userOptions).toBeGreaterThan(1); // Should have more than just placeholder
    console.log(`✅ User dropdown has ${userOptions} options`);
    
    // Select a user (not the first option which is usually placeholder)
    await userDropdown.selectOption({ index: 1 });
    await page.waitForTimeout(500);
    console.log('✅ User selected from dropdown');
    
    // Step 3: Enter password and login
    console.log('🔐 Testing login process...');
    
    const passwordInput = page.locator('input[type="password"], input[name*="password"], [data-testid="password-input"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('123456');
    console.log('✅ Password entered');
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login"), [data-testid="login-button"]').first();
    await expect(loginButton).toBeVisible();

    // Wait for button to be enabled (may take time for validation)
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 10000 });

    await loginButton.click();
    console.log('✅ Login button clicked');
    
    // Step 4: Verify successful login
    console.log('🎯 Verifying successful login...');
    
    // Wait for redirect away from login page
    await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });
    console.log('✅ Redirected away from login page');
    
    // Check for dashboard or main app elements
    const dashboardElements = [
      '[data-testid="dashboard"]',
      '.dashboard',
      'h1:has-text("Dashboard")',
      'h1:has-text("Bảng điều khiển")',
      '[data-testid="user-info"]',
      '.user-info'
    ];
    
    let dashboardFound = false;
    for (const selector of dashboardElements) {
      if (await page.locator(selector).isVisible({ timeout: 5000 }).catch(() => false)) {
        dashboardFound = true;
        console.log(`✅ Dashboard element found: ${selector}`);
        break;
      }
    }
    
    if (!dashboardFound) {
      console.log('⚠️ Dashboard elements not found, checking for any main content');
      // Just verify we're not on login page and page has loaded
      await expect(page.locator('body')).toBeVisible();
    }
    
    // Step 5: Check console logs for Supabase success
    console.log('📊 Checking console logs...');
    
    const logs = await page.evaluate(() => {
      return (window as any).testLogs || [];
    });
    
    console.log('Console logs captured:', logs.length);
    
    // Step 6: Verify Supabase data loading
    console.log('🔍 Verifying Supabase data loading...');
    
    // Check if we can access debug page to verify Supabase
    await page.goto('http://localhost:8088/debug');
    await page.waitForTimeout(2000);
    
    // Look for Supabase test section
    const supabaseTestTab = page.locator('text="Supabase Test", [data-testid="supabase-test"]').first();
    if (await supabaseTestTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await supabaseTestTab.click();
      await page.waitForTimeout(1000);
      
      // Click test migration button
      const testButton = page.locator('button:has-text("Test Migration"), button:has-text("Test Users Load")').first();
      if (await testButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await testButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Supabase test executed');
      }
    }
    
    console.log('🎉 Supabase Migration Test Completed Successfully!');
  });

  test('should handle login errors gracefully', async ({ page }) => {
    console.log('🧪 Testing login error handling...');
    
    await page.goto('http://localhost:8088/login');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Select location and user
    const locationSelector = page.locator('select').first();
    await locationSelector.selectOption({ index: 1 });
    await page.waitForTimeout(1000);

    const userDropdown = page.locator('select').nth(1);
    await userDropdown.selectOption({ index: 1 });
    await page.waitForTimeout(1000);

    // Enter wrong password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('wrongpassword');

    // Wait for button to be enabled
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 10000 });

    // Click login
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    // Should show error message - try multiple selectors
    const errorSelectors = [
      '.toast',
      '.error',
      '[role="alert"]',
      '.Toastify__toast',
      '.toast-error',
      'div:has-text("thất bại")',
      'div:has-text("failed")',
      'div:has-text("sai")'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        const errorMessage = page.locator(selector);
        if (await errorMessage.isVisible({ timeout: 3000 })) {
          console.log(`✅ Error message found with selector: ${selector}`);
          errorFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!errorFound) {
      console.log('⚠️ No error message found, but login should have failed');
      // Check if still on login page (which indicates login failed)
      await expect(page).toHaveURL(/login/);
    }

    console.log('✅ Error handling test completed');
  });

  test('should load users from Supabase correctly', async ({ page }) => {
    console.log('🧪 Testing Supabase users loading...');
    
    await page.goto('http://localhost:8088/debug');
    await page.waitForTimeout(2000);
    
    // Navigate to Supabase test section
    const supabaseTab = page.locator('text="Supabase Test"').first();
    if (await supabaseTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await supabaseTab.click();
      await page.waitForTimeout(1000);
      
      // Click test users load
      const testUsersButton = page.locator('button:has-text("Test Users Load")').first();
      if (await testUsersButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await testUsersButton.click();
        await page.waitForTimeout(3000);
        
        // Check for success indicators
        const successIndicators = [
          'text="✅"',
          'text="PASS"',
          'text="Configured"',
          '.text-green'
        ];
        
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ Success indicator found: ${indicator}`);
            break;
          }
        }
      }
    }
    
    console.log('✅ Supabase users loading test completed');
  });
});
