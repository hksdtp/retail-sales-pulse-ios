import { chromium } from 'playwright';

async function testLoginAndPasswordChange() {
  console.log('🎭 Starting Playwright test for login and password change...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:8088');
    await page.goto('http://localhost:8088');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the login page
    await page.screenshot({ path: 'login-page.png' });
    console.log('📸 Screenshot saved: login-page.png');
    
    // Look for location selector
    console.log('🔍 Looking for location selector...');
    const locationSelector = await page.locator('[data-testid="location-selector"], select, .location-selector').first();
    if (await locationSelector.isVisible()) {
      console.log('✅ Found location selector');
      await locationSelector.selectOption('hanoi');
      await page.waitForTimeout(1000);
    }
    
    // Look for user selector/dropdown
    console.log('🔍 Looking for user selector...');
    const userSelectors = [
      'select[name="user"]',
      '[data-testid="user-selector"]',
      '.user-selector',
      'select:has(option[value*="pham_thi_huong"])',
      'select:has(option:text("Phạm Thị Hương"))'
    ];
    
    let userSelector = null;
    for (const selector of userSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          userSelector = element;
          console.log(`✅ Found user selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (userSelector) {
      // Try to select Phạm Thị Hương
      try {
        await userSelector.selectOption({ label: 'Phạm Thị Hương' });
        console.log('✅ Selected user: Phạm Thị Hương');
      } catch (e) {
        console.log('⚠️ Could not select by label, trying by value...');
        await userSelector.selectOption({ value: 'pham_thi_huong_id' });
      }
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ Could not find user selector');
    }
    
    // Look for password input
    console.log('🔍 Looking for password input...');
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '[data-testid="password-input"]',
      '.password-input'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          passwordInput = element;
          console.log(`✅ Found password input: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (passwordInput) {
      // Try login with new password first
      console.log('🔑 Trying login with new password: 123123');
      await passwordInput.fill('123123');
      await page.waitForTimeout(500);
      
      // Look for login button
      const loginButton = await page.locator('button:has-text("Đăng nhập"), button:has-text("Login"), [data-testid="login-button"]').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        console.log('✅ Clicked login button');
        await page.waitForTimeout(3000);
        
        // Check if login was successful
        const currentUrl = page.url();
        if (currentUrl !== 'http://localhost:8088/' && !currentUrl.includes('login')) {
          console.log('✅ Login successful with new password!');
          await page.screenshot({ path: 'login-success.png' });
          console.log('📸 Screenshot saved: login-success.png');
        } else {
          console.log('❌ Login failed with new password, trying default password...');
          
          // Try with default password
          await passwordInput.fill('123456');
          await loginButton.click();
          await page.waitForTimeout(3000);
          
          // Check for password change modal
          const passwordChangeModal = await page.locator('.password-change-modal, [data-testid="password-change-modal"]').first();
          if (await passwordChangeModal.isVisible()) {
            console.log('✅ Password change modal appeared');
            await page.screenshot({ path: 'password-change-modal.png' });
            
            // Fill new password
            const newPasswordInput = await page.locator('input[placeholder*="mật khẩu mới"], input[name="newPassword"]').first();
            if (await newPasswordInput.isVisible()) {
              await newPasswordInput.fill('123123');
              console.log('✅ Filled new password');
              
              // Click confirm button
              const confirmButton = await page.locator('button:has-text("Xác nhận"), button:has-text("Confirm")').first();
              if (await confirmButton.isVisible()) {
                await confirmButton.click();
                console.log('✅ Clicked confirm password change');
                await page.waitForTimeout(3000);
                
                await page.screenshot({ path: 'password-changed.png' });
                console.log('📸 Screenshot saved: password-changed.png');
              }
            }
          }
        }
      }
    } else {
      console.log('❌ Could not find password input');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'final-state.png' });
    console.log('📸 Final screenshot saved: final-state.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
    console.log('🎭 Browser closed');
  }
}

// Run the test
testLoginAndPasswordChange().catch(console.error);
