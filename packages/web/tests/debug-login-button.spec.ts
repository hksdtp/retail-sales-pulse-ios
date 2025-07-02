import { test, expect } from '@playwright/test';

test.describe('Debug Login Button', () => {
  test('should debug why login button is disabled', async ({ page }) => {
    console.log('🔍 Debugging login button state...');

    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('form', { timeout: 10000 });

    // Step 1: Check initial state
    const loginButton = page.locator('button[type="submit"]');
    let isEnabled = await loginButton.isEnabled();
    console.log(`🔍 Initial login button state: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);

    // Step 2: Select location
    console.log('🔄 Selecting location...');
    const locationTrigger = page.locator('[role="combobox"]').first();
    await locationTrigger.click();
    await page.waitForTimeout(1000);
    
    const hanoiOption = page.locator('[role="option"]:has-text("Hà Nội")').first();
    await hanoiOption.click();
    await page.waitForTimeout(2000);

    isEnabled = await loginButton.isEnabled();
    console.log(`🔍 After location selection: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);

    // Step 3: Check if user selector appeared
    const userSelector = page.locator('[data-testid="user-selector"]');
    const userSelectorExists = await userSelector.count();
    console.log(`🔍 User selector count: ${userSelectorExists}`);

    if (userSelectorExists > 0) {
      const isVisible = await userSelector.first().isVisible();
      console.log(`🔍 User selector visible: ${isVisible}`);

      if (isVisible) {
        console.log('🔄 Selecting user...');
        await userSelector.selectOption({ index: 1 });
        await page.waitForTimeout(1000);

        isEnabled = await loginButton.isEnabled();
        console.log(`🔍 After user selection: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
      }
    } else {
      console.log('❌ User selector not found');
    }

    // Step 4: Enter password
    console.log('🔄 Entering password...');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');
    await page.waitForTimeout(1000);

    isEnabled = await loginButton.isEnabled();
    console.log(`🔍 After password entry: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);

    // Step 5: Debug form state
    const formState = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { error: 'No form found' };

      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      const button = form.querySelector('button[type="submit"]');
      
      return {
        formData: data,
        buttonDisabled: button ? button.disabled : 'no button',
        buttonText: button ? button.textContent : 'no button',
        formValid: form.checkValidity ? form.checkValidity() : 'unknown'
      };
    });

    console.log('🔍 Form state:', JSON.stringify(formState, null, 2));

    // Step 6: Check React component state if possible
    const reactState = await page.evaluate(() => {
      // Try to access React component state
      const form = document.querySelector('form');
      if (form && form._reactInternalFiber) {
        return 'React fiber found but cannot access state safely';
      }
      return 'No React fiber access';
    });

    console.log('🔍 React state:', reactState);

    // Step 7: Force enable button and try to click
    if (!isEnabled) {
      console.log('🔧 Force enabling button...');
      await page.evaluate(() => {
        const button = document.querySelector('button[type="submit"]');
        if (button) {
          button.disabled = false;
        }
      });

      await page.waitForTimeout(500);
      await loginButton.click();
      console.log('✅ Forced button click');

      // Check result
      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
        console.log('✅ Login successful after force enable');
      } catch (e) {
        console.log('❌ Login still failed after force enable');
      }
    } else {
      console.log('✅ Button is enabled, clicking normally...');
      await loginButton.click();

      try {
        await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
        console.log('✅ Login successful');
      } catch (e) {
        console.log('❌ Login failed despite enabled button');
      }
    }

    console.log('🎉 Login button debug completed');
  });

  test('should test manual form submission', async ({ page }) => {
    console.log('🔧 Testing manual form submission...');

    await page.goto('http://localhost:8088/login');
    await page.waitForSelector('form', { timeout: 10000 });

    // Manually set form values
    await page.evaluate(() => {
      // Set location
      const locationSelect = document.querySelector('select');
      if (locationSelect) {
        locationSelect.value = 'hanoi';
        locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(3000);

    // Set user if selector exists
    await page.evaluate(() => {
      const userSelect = document.querySelector('[data-testid="user-selector"]');
      if (userSelect) {
        userSelect.value = userSelect.options[1]?.value || '';
        userSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Set password
    await page.fill('input[type="password"]', '123456');

    // Submit form directly
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });

    console.log('✅ Manual form submission attempted');

    try {
      await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
      console.log('✅ Manual submission successful');
    } catch (e) {
      console.log('❌ Manual submission failed');
    }

    console.log('🎉 Manual form submission test completed');
  });
});
