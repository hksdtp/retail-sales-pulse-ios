import { test, expect } from '@playwright/test';

test.describe('Console Debug Test', () => {
  test('should capture console logs during login', async ({ page }) => {
    console.log('🔍 Starting console debug test...');

    const logs = [];
    
    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      logs.push(`[${msg.type()}] ${text}`);
      console.log(`Browser: [${msg.type()}] ${text}`);
    });

    // Go to login page
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    console.log('✅ Navigated to login page');

    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Click location selector (Radix UI)
    console.log('🔄 Looking for location trigger...');
    const locationTrigger = page.locator('[role="combobox"], button:has-text("Chọn khu vực"), [data-testid="location-trigger"]').first();

    if (await locationTrigger.isVisible({ timeout: 5000 })) {
      console.log('✅ Location trigger found, clicking...');
      await locationTrigger.click();
      await page.waitForTimeout(1000);

      // Look for dropdown options
      console.log('🔍 Looking for dropdown options...');
      const allOptions = await page.locator('[role="option"]').count();
      console.log(`🔍 Found ${allOptions} options`);

      // List all available options
      for (let i = 0; i < allOptions; i++) {
        const option = page.locator('[role="option"]').nth(i);
        const text = await option.textContent();
        console.log(`  Option ${i}: "${text}"`);
      }

      // Select "Hà Nội"
      const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")').first();
      if (await hanoiOption.isVisible({ timeout: 3000 })) {
        console.log('✅ Hà Nội option found, clicking...');
        await hanoiOption.click();
        console.log('✅ Hà Nội selected via Radix UI');
      } else {
        console.log('❌ Hà Nội option not found, trying alternative');
        // Try clicking second option
        if (allOptions > 1) {
          await page.locator('[role="option"]').nth(1).click();
          console.log('✅ Selected second option');
        }
      }
    } else {
      console.log('❌ Location trigger not found');
    }

    // Wait for any state changes
    await page.waitForTimeout(5000);

    // Check for debug logs
    const debugLogs = logs.filter(log => log.includes('LoginForm Debug'));
    console.log(`🔍 Found ${debugLogs.length} debug logs`);
    
    debugLogs.forEach(log => {
      console.log(`📋 ${log}`);
    });

    // Check current DOM state
    const allSelects = await page.locator('select').count();
    console.log(`🔍 Total select elements: ${allSelects}`);

    for (let i = 0; i < allSelects; i++) {
      const selectElement = page.locator('select').nth(i);
      const options = await selectElement.locator('option').allTextContents();
      const testId = await selectElement.getAttribute('data-testid');
      console.log(`🔍 Select ${i} (testId: ${testId}):`, options);
    }

    // Check for user selector specifically
    const userSelector = page.locator('[data-testid="user-selector"]');
    const userSelectorExists = await userSelector.count();
    console.log(`🔍 User selector count: ${userSelectorExists}`);

    if (userSelectorExists > 0) {
      const isVisible = await userSelector.first().isVisible();
      console.log(`🔍 User selector visible: ${isVisible}`);
    }

    console.log('🎉 Console debug test completed');
  });
});
