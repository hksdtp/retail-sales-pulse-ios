import { test, expect } from '@playwright/test';

test.describe('Simple Button Test', () => {
  test('Check if login button gets enabled after password entry', async ({ page }) => {
    console.log('🧪 Simple button enable test...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Select Khổng Đức Mạnh...');
    
    // Click on Khổng Đức Mạnh option
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    await khongDucManhOption.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 2: Enter password...');
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 3: Check button state...');
    
    // Check login button state
    const loginButton = page.locator('button:has-text("Đăng Nhập")');
    const isEnabled = await loginButton.isEnabled();
    const isVisible = await loginButton.isVisible();
    
    console.log(`Login button visible: ${isVisible}`);
    console.log(`Login button enabled: ${isEnabled}`);
    
    if (isEnabled) {
      console.log('✅ Login button is enabled - trying to click...');
      
      try {
        await loginButton.click();
        await page.waitForTimeout(5000);
        
        const newUrl = page.url();
        console.log(`URL after click: ${newUrl}`);
        
        if (!newUrl.includes('/login')) {
          console.log('✅ Successfully navigated away from login page!');
        } else {
          console.log('❌ Still on login page after click');
        }
        
      } catch (error) {
        console.log(`❌ Click failed: ${error.message}`);
      }
    } else {
      console.log('❌ Login button is disabled');
      
      // Check form state
      const formState = await page.evaluate(() => {
        const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
        const loginButton = document.querySelector('button[data-testid="login-submit-button"]') as HTMLButtonElement;
        
        return {
          passwordValue: passwordInput?.value || 'not found',
          passwordLength: passwordInput?.value?.length || 0,
          buttonDisabled: loginButton?.disabled || false,
          buttonClasses: loginButton?.className || 'not found'
        };
      });
      
      console.log('Form state:', formState);
    }
    
    // Print recent console logs
    console.log('\n📋 Recent console logs:');
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'simple-button-test.png', fullPage: true });
    
    console.log('✅ Simple button test completed.');
  });
});
