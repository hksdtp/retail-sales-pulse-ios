import { test, expect } from '@playwright/test';

test.describe('Debug Login Simple', () => {
  test('Debug login button state step by step', async ({ page }) => {
    console.log('🧪 Simple debug test...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'debug-simple-01-initial.png', fullPage: true });
    
    console.log('📝 Step 1: Check initial state...');
    
    // Check if Khổng Đức Mạnh option exists
    const khongDucManhOption = page.locator('text="Khổng Đức Mạnh"');
    const isKhongDucManhVisible = await khongDucManhOption.isVisible();
    console.log(`Khổng Đức Mạnh option visible: ${isKhongDucManhVisible}`);
    
    if (isKhongDucManhVisible) {
      // Click on Khổng Đức Mạnh
      await khongDucManhOption.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot after selection
      await page.screenshot({ path: 'debug-simple-02-after-selection.png', fullPage: true });
      
      console.log('📝 Step 2: Check after selection...');
      
      // Check if password field is visible
      const passwordInput = page.locator('input[type="password"]');
      const isPasswordVisible = await passwordInput.isVisible();
      console.log(`Password input visible: ${isPasswordVisible}`);
      
      if (isPasswordVisible) {
        // Enter password
        await passwordInput.fill('Haininh1');
        await page.waitForTimeout(2000);
        
        // Take screenshot after password
        await page.screenshot({ path: 'debug-simple-03-after-password.png', fullPage: true });
        
        console.log('📝 Step 3: Check login button state...');
        
        // Check login button
        const loginButton = page.locator('button:has-text("Đăng Nhập")');
        const isLoginButtonVisible = await loginButton.isVisible();
        const isLoginButtonEnabled = await loginButton.isEnabled();
        
        console.log(`Login button visible: ${isLoginButtonVisible}`);
        console.log(`Login button enabled: ${isLoginButtonEnabled}`);
        
        if (isLoginButtonVisible) {
          const buttonHTML = await loginButton.innerHTML();
          const buttonDisabled = await loginButton.getAttribute('disabled');
          console.log(`Login button disabled attribute: ${buttonDisabled}`);
          console.log(`Login button HTML: ${buttonHTML.substring(0, 200)}...`);
        }
        
        // Check form state via JavaScript
        const formState = await page.evaluate(() => {
          const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
          const userSelector = document.querySelector('select[data-testid="user-selector"]') as HTMLSelectElement;
          
          return {
            passwordValue: passwordInput?.value || 'not found',
            passwordLength: passwordInput?.value?.length || 0,
            userSelectorValue: userSelector?.value || 'not found',
            userSelectorVisible: userSelector ? 'visible' : 'not found',
            allSelectElements: document.querySelectorAll('select').length,
            allInputElements: document.querySelectorAll('input').length
          };
        });
        
        console.log('Form state:', formState);
        
        // Try to force enable and click
        if (!isLoginButtonEnabled) {
          console.log('📝 Step 4: Trying to force enable button...');
          
          try {
            await page.evaluate(() => {
              const button = document.querySelector('button[data-testid="login-submit-button"]') as HTMLButtonElement;
              if (button) {
                button.disabled = false;
                button.removeAttribute('disabled');
                console.log('Button force enabled');
              }
            });
            
            await page.waitForTimeout(1000);
            
            // Try to click
            await loginButton.click({ force: true });
            await page.waitForTimeout(3000);
            
            // Check result
            const newUrl = page.url();
            console.log(`URL after force click: ${newUrl}`);
            
            // Take final screenshot
            await page.screenshot({ path: 'debug-simple-04-after-force-click.png', fullPage: true });
            
          } catch (error) {
            console.log(`Force click failed: ${error.message}`);
          }
        }
      }
    }
    
    // Print console logs
    console.log('\n📋 Console logs:');
    consoleLogs.slice(-30).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log('\n✅ Simple debug completed.');
  });
});
