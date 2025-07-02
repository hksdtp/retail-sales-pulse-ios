import { test, expect } from '@playwright/test';

test.describe('Debug Login Issues', () => {
  test('should debug login form step by step', async ({ page }) => {
    console.log('🔍 Starting detailed login debug...');

    // Step 1: Go to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    // Step 2: Wait for form and take screenshot
    await page.waitForSelector('form', { timeout: 10000 });
    await page.screenshot({ path: 'debug-login-initial.png', fullPage: true });
    console.log('✅ Login form loaded, screenshot taken');

    // Step 3: Debug all select elements
    const allSelects = await page.locator('select').count();
    console.log(`🔍 Total select elements: ${allSelects}`);

    for (let i = 0; i < allSelects; i++) {
      const selectElement = page.locator('select').nth(i);
      const options = await selectElement.locator('option').allTextContents();
      const selectId = await selectElement.getAttribute('id');
      const selectName = await selectElement.getAttribute('name');
      const selectTestId = await selectElement.getAttribute('data-testid');
      
      console.log(`🔍 Select ${i}:`, {
        id: selectId,
        name: selectName,
        testId: selectTestId,
        options: options
      });
    }

    // Step 4: Select location and debug what happens
    console.log('🔄 Selecting location...');
    const locationSelect = page.locator('select').first();
    
    // Get current options before selection
    const beforeOptions = await locationSelect.locator('option').allTextContents();
    console.log('📋 Location options before selection:', beforeOptions);
    
    // Select "Hà Nội" (index 1)
    await locationSelect.selectOption({ index: 1 });
    console.log('✅ Location selected (index 1)');
    
    // Wait and check what changed
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-after-location-select.png', fullPage: true });
    
    // Check selects again after location change
    const allSelectsAfter = await page.locator('select').count();
    console.log(`🔍 Total select elements after location change: ${allSelectsAfter}`);

    for (let i = 0; i < allSelectsAfter; i++) {
      const selectElement = page.locator('select').nth(i);
      const options = await selectElement.locator('option').allTextContents();
      const isVisible = await selectElement.isVisible();
      
      console.log(`🔍 Select ${i} after location change:`, {
        visible: isVisible,
        options: options
      });
    }

    // Step 5: Check for any elements with data-testid="user-selector"
    const userSelectorByTestId = page.locator('[data-testid="user-selector"]');
    const userSelectorExists = await userSelectorByTestId.count();
    console.log(`🔍 Elements with data-testid="user-selector": ${userSelectorExists}`);

    if (userSelectorExists > 0) {
      const isVisible = await userSelectorByTestId.first().isVisible();
      console.log(`🔍 User selector visibility: ${isVisible}`);
    }

    // Step 6: Check console logs for any errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        logs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Wait a bit more to capture logs
    await page.waitForTimeout(2000);
    
    console.log('📋 Browser console logs:');
    logs.forEach(log => console.log(`  ${log}`));

    // Step 7: Check if filteredUsers is empty
    const debugInfo = await page.evaluate(() => {
      // Try to access React component state if possible
      const form = document.querySelector('form');
      if (form) {
        return {
          formExists: true,
          selectCount: document.querySelectorAll('select').length,
          hasUserSelector: !!document.querySelector('[data-testid="user-selector"]'),
          allSelectIds: Array.from(document.querySelectorAll('select')).map(s => s.id || s.name || 'no-id'),
        };
      }
      return { formExists: false };
    });

    console.log('🔍 Debug info from browser:', debugInfo);

    console.log('🎉 Debug completed');
  });

  test('should test manual login with hardcoded values', async ({ page }) => {
    console.log('🧪 Testing manual login...');

    await page.goto('http://localhost:8088/login');
    await page.waitForSelector('form', { timeout: 10000 });

    // Try to login by directly setting form values
    await page.evaluate(() => {
      // Set location to "hanoi"
      const locationSelect = document.querySelector('select');
      if (locationSelect) {
        locationSelect.value = 'hanoi';
        locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(2000);

    // Check if user selector appeared
    const userSelector = page.locator('[data-testid="user-selector"]');
    if (await userSelector.isVisible({ timeout: 3000 })) {
      console.log('✅ User selector appeared');
      await userSelector.selectOption({ index: 1 });
    } else {
      console.log('❌ User selector did not appear');
    }

    // Enter password
    await page.fill('input[type="password"]', '123456');

    // Try to submit
    const submitButton = page.locator('button[type="submit"]');
    const isEnabled = await submitButton.isEnabled();
    console.log(`🔍 Submit button enabled: ${isEnabled}`);

    if (isEnabled) {
      await submitButton.click();
      console.log('✅ Submit button clicked');

      // Wait for result
      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
        console.log('✅ Login successful');
      } catch (e) {
        console.log('❌ Login failed');
      }
    }

    console.log('🎉 Manual login test completed');
  });
});
