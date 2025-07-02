import { chromium } from 'playwright';

async function resetAllPasswords() {
  console.log('🔄 Starting password reset process...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to login page
    console.log('🌐 Navigating to login page...');
    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(5000); // Wait for page to load
    
    // Execute reset function in browser console
    console.log('🔄 Executing password reset...');
    const resetResult = await page.evaluate(() => {
      // Check if function exists
      if (typeof window.resetAllPasswordsToDefault !== 'function') {
        return { error: 'Reset function not available' };
      }
      
      // Check current stored passwords before reset
      const beforeReset = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_password_')) {
          beforeReset.push(key);
        }
      }
      
      // Execute reset
      const result = window.resetAllPasswordsToDefault();
      
      // Check after reset
      const afterReset = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_password_')) {
          afterReset.push(key);
        }
      }
      
      return {
        ...result,
        beforeReset: beforeReset.length,
        afterReset: afterReset.length
      };
    });
    
    console.log('✅ Reset result:', JSON.stringify(resetResult, null, 2));
    
    if (resetResult.error) {
      console.error('❌ Reset failed:', resetResult.error);
      return;
    }
    
    // Test login with default password
    console.log('🧪 Testing login with default password...');
    
    // Select location
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(1000);
    
    // Select user (Phạm Thị Hương)
    const userSelector = page.locator('[data-testid="user-selector"]');
    if (await userSelector.isVisible()) {
      await userSelector.selectOption({ label: 'Phạm Thị Hương' });
      await page.waitForTimeout(1000);
    }
    
    // Enter default password
    await page.fill('input[type="password"]', '123456');
    
    // Click login
    await page.click('button:has-text("Đăng nhập")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check if login was successful
    const currentUrl = page.url();
    const isOnDashboard = !currentUrl.includes('/login');
    
    console.log('🔍 Test result:');
    console.log('  Current URL:', currentUrl);
    console.log('  Login successful:', isOnDashboard);
    
    if (isOnDashboard) {
      console.log('🎉 SUCCESS! Default password login works!');
      await page.screenshot({ path: 'password-reset-success.png', fullPage: true });
    } else {
      console.log('❌ FAILED! Default password login did not work');
      await page.screenshot({ path: 'password-reset-failed.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Error during reset process:', error);
  } finally {
    await browser.close();
  }
}

// Run the reset
resetAllPasswords().catch(console.error);
