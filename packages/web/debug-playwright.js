import { chromium } from 'playwright';

async function debugWebapp() {
  console.log('🚀 Starting Playwright debug session...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for debugging
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console logs from the page
  page.on('console', msg => {
    console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  try {
    console.log('📱 Navigating to webapp...');
    await page.goto('http://localhost:8088');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-initial.png' });
    console.log('📸 Screenshot saved: debug-initial.png');
    
    // Try to bypass login by setting localStorage
    console.log('🔑 Bypassing login...');
    await page.evaluate(() => {
      // Set user data in localStorage
      const userData = {
        id: 'user_001',
        name: 'Khổng Đức Mạnh',
        email: 'khong.duc.manh@company.com',
        role: 'retail_director',
        department_type: 'retail',
        team_id: 'team_001',
        location: 'Hà Nội',
        isAuthenticated: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      console.log('✅ User data set in localStorage:', userData);
    });
    
    // Reload page to apply login bypass
    console.log('🔄 Reloading page...');
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Take screenshot after login bypass
    await page.screenshot({ path: 'debug-after-login.png' });
    console.log('📸 Screenshot saved: debug-after-login.png');
    
    // Try to navigate to tasks menu
    console.log('📋 Looking for tasks menu...');
    
    // Wait for navigation or menu to appear
    await page.waitForTimeout(2000);
    
    // Look for task menu elements
    const taskMenuSelectors = [
      'text=Công việc',
      'text=Tasks',
      'text=Việc tôi làm',
      '[data-testid="task-menu"]',
      '.task-menu',
      '#task-menu'
    ];
    
    let taskMenuFound = false;
    for (const selector of taskMenuSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found task menu with selector: ${selector}`);
          await element.click();
          taskMenuFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Selector not found: ${selector}`);
      }
    }
    
    if (!taskMenuFound) {
      console.log('🔍 Task menu not found, taking screenshot of current page...');
      await page.screenshot({ path: 'debug-no-task-menu.png' });
      
      // Get page content for debugging
      const pageContent = await page.content();
      console.log('📄 Page title:', await page.title());
      console.log('📄 Current URL:', page.url());
      
      // Look for any menu items
      const menuItems = await page.locator('nav, .menu, .sidebar, [role="navigation"]').all();
      console.log(`🔍 Found ${menuItems.length} potential menu containers`);
      
      for (let i = 0; i < menuItems.length; i++) {
        const text = await menuItems[i].textContent();
        console.log(`Menu ${i}: ${text?.substring(0, 100)}...`);
      }
    }
    
    // Wait a bit more and take final screenshot
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'debug-final.png' });
    console.log('📸 Final screenshot saved: debug-final.png');
    
    // Get console logs from the page
    console.log('📊 Getting page console logs...');
    await page.evaluate(() => {
      console.log('=== PAGE DEBUG INFO ===');
      console.log('Current user from localStorage:', localStorage.getItem('currentUser'));
      console.log('Authentication status:', localStorage.getItem('isAuthenticated'));
      console.log('Available localStorage keys:', Object.keys(localStorage));
      console.log('Window location:', window.location.href);
      console.log('Document title:', document.title);
      console.log('======================');
    });
    
    console.log('✅ Debug session completed. Check the screenshots and console logs.');
    
  } catch (error) {
    console.error('❌ Error during debug session:', error);
    await page.screenshot({ path: 'debug-error.png' });
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser will stay open for manual inspection...');
  console.log('Press Ctrl+C to close when done.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

debugWebapp().catch(console.error);
