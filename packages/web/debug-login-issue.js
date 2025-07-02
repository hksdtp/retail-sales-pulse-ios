import { chromium } from 'playwright';

async function debugLoginIssue() {
  console.log('🔍 Debugging login issue...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console logs from the page
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('MockAuth')) {
      console.log('🔍 [PAGE LOG]:', msg.text());
    }
    if (msg.type() === 'error') {
      console.log('❌ [PAGE ERROR]:', msg.text());
    }
  });
  
  try {
    console.log('📍 Navigating to app...');
    await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
    
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'debug-initial.png', fullPage: true });
    
    // Wait for page to load completely
    await page.waitForTimeout(3000);
    
    // Check if we're on login page
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    console.log('🔍 Is login page?', isLoginPage);
    
    if (isLoginPage) {
      // Select location
      console.log('🌍 Selecting location...');
      const locationSelect = page.locator('select').first();
      if (await locationSelect.isVisible()) {
        await locationSelect.selectOption('hanoi');
        await page.waitForTimeout(1000);
      }
      
      // Select user
      console.log('👤 Selecting user...');
      const userSelect = page.locator('[data-testid="user-selector"]');
      if (await userSelect.isVisible()) {
        await userSelect.selectOption({ label: 'Phạm Thị Hương' });
        await page.waitForTimeout(1000);
        console.log('✅ Selected Phạm Thị Hương');
      }
      
      // Try with stored password first
      console.log('🔑 Testing with stored password: 123123');
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('123123');
      
      const loginButton = page.locator('button:has-text("Đăng nhập")');
      await loginButton.click();
      
      console.log('⏳ Waiting for login response...');
      await page.waitForTimeout(5000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log('🔍 Current URL after login:', currentUrl);
      
      // Take screenshot after login attempt
      await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
      
      // Check if still on login page
      const stillOnLogin = await page.locator('input[type="password"]').isVisible();
      if (stillOnLogin) {
        console.log('❌ Still on login page - login failed');
        
        // Try with default password
        console.log('🔑 Testing with default password: 123456');
        await passwordInput.fill('123456');
        await loginButton.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'debug-default-password.png', fullPage: true });
        
        // Check for password change modal
        const passwordModal = await page.locator('.password-change-modal, [data-testid="password-change-modal"]').isVisible();
        if (passwordModal) {
          console.log('✅ Password change modal appeared');
          await page.screenshot({ path: 'debug-password-modal.png', fullPage: true });
        }
      } else {
        console.log('✅ Login successful!');
      }
    }
    
    // Execute debug commands in browser console
    console.log('🔧 Running debug commands...');

    const debugResults = await page.evaluate(() => {
      const results = {};

      // Check stored passwords
      if (window.debugAllStoredPasswords) {
        results.storedPasswords = window.debugAllStoredPasswords();
      }

      // Restore stored password for Phạm Thị Hương
      if (window.restoreStoredPassword) {
        console.log('🔧 Restoring stored password...');
        results.restoreResult = window.restoreStoredPassword('pham_thi_huong_id', '123123');
      }

      // Check stored passwords again after restore
      if (window.debugAllStoredPasswords) {
        results.storedPasswordsAfterRestore = window.debugAllStoredPasswords();
      }

      // Check auth state
      if (window.debugAuthState) {
        results.authState = window.debugAuthState();
      }

      return results;
    });

    console.log('🔍 Debug results:', JSON.stringify(debugResults, null, 2));

    // Now try login again with restored password
    if (debugResults.restoreResult) {
      console.log('✅ Password restored, trying login again...');

      // Select location
      console.log('🌍 Selecting location...');
      const locationSelect = page.locator('select').first();
      if (await locationSelect.isVisible()) {
        await locationSelect.selectOption('hanoi');
        await page.waitForTimeout(1000);
      }

      // Select user
      console.log('👤 Selecting user...');
      const userSelect = page.locator('[data-testid="user-selector"]');
      if (await userSelect.isVisible()) {
        await userSelect.selectOption({ label: 'Phạm Thị Hương' });
        await page.waitForTimeout(1000);
        console.log('✅ Selected Phạm Thị Hương');
      }

      // Enter password
      console.log('🔑 Entering restored password: 123123');
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('123123');

      const loginButton = page.locator('button:has-text("Đăng nhập")');
      await loginButton.click();

      console.log('⏳ Waiting for login response...');
      await page.waitForTimeout(5000);

      // Check result
      const currentUrl = page.url();
      console.log('🔍 Current URL after restored password login:', currentUrl);

      const stillOnLogin = await page.locator('input[type="password"]').isVisible();
      if (!stillOnLogin) {
        console.log('🎉 SUCCESS! Login with restored password worked!');
        await page.screenshot({ path: 'login-success-restored.png', fullPage: true });
      } else {
        console.log('❌ Login still failed even with restored password');
        await page.screenshot({ path: 'login-failed-restored.png', fullPage: true });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  } finally {
    console.log('🎭 Keeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close when done');
    
    // Keep browser open for manual inspection
    await new Promise(() => {}); // Wait indefinitely
  }
}

debugLoginIssue().catch(console.error);
