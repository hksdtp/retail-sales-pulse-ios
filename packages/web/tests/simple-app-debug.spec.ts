import { test, expect } from '@playwright/test';

test.describe('Simple App Debug', () => {
  test('Check what actually loads on the page', async ({ page }) => {
    console.log('🧪 Checking what loads on the page...');
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot to see what's actually there
    await page.screenshot({ path: 'debug-page-load.png', fullPage: true });
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if we're already logged in or on a different page
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains login form:', bodyText?.includes('email') || bodyText?.includes('đăng nhập'));
    console.log('Page contains task menu:', bodyText?.includes('Của tôi') || bodyText?.includes('task'));
    console.log('Page contains user name:', bodyText?.includes('Khổng Đức Mạnh'));
    
    // Look for any visible elements
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`Button ${i + 1}: "${buttonText}"`);
    }
    
    // Look for any inputs
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} inputs on page`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const inputType = await allInputs[i].getAttribute('type');
      const inputPlaceholder = await allInputs[i].getAttribute('placeholder');
      console.log(`Input ${i + 1}: type="${inputType}", placeholder="${inputPlaceholder}"`);
    }
    
    // Check for task-related elements
    const taskElements = await page.locator('[class*="task"], [data-testid*="task"], div:has-text("Của tôi"), div:has-text("Của nhóm")').all();
    console.log(`Found ${taskElements.length} task-related elements`);
    
    // Check for any error messages
    const errorElements = await page.locator('[class*="error"], .alert, [role="alert"]').all();
    console.log(`Found ${errorElements.length} error elements`);
    
    if (errorElements.length > 0) {
      for (let i = 0; i < errorElements.length; i++) {
        const errorText = await errorElements[i].textContent();
        console.log(`Error ${i + 1}: "${errorText}"`);
      }
    }
    
    // Check console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Reload to capture console logs
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log('\n📋 Console logs:');
    consoleLogs.slice(-10).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Final screenshot
    await page.screenshot({ path: 'debug-final-page.png', fullPage: true });
  });

  test('Try to interact with the app without login', async ({ page }) => {
    console.log('🧪 Testing app interaction without explicit login...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(5000);
    
    // Look for task menu buttons
    const taskMenuButtons = await page.locator('button:has-text("Của tôi"), button:has-text("Của nhóm"), button:has-text("Thành viên"), button:has-text("Chung")').all();
    console.log(`Found ${taskMenuButtons.length} task menu buttons`);
    
    if (taskMenuButtons.length > 0) {
      console.log('✅ Task menu is visible - user might be auto-logged in');
      
      // Test each tab
      for (let i = 0; i < taskMenuButtons.length; i++) {
        const buttonText = await taskMenuButtons[i].textContent();
        console.log(`\n🔍 Testing tab: ${buttonText}`);
        
        await taskMenuButtons[i].click();
        await page.waitForTimeout(2000);
        
        // Count tasks or content
        const content = await page.locator('body').textContent();
        const hasTaskContent = content?.includes('công việc') || content?.includes('task') || content?.includes('Không có');
        console.log(`Tab "${buttonText}" has content: ${hasTaskContent}`);
        
        // Look for task items
        const taskItems = await page.locator('[class*="task"], .task-item, tr, li').all();
        console.log(`Found ${taskItems.length} potential task items`);
        
        // Take screenshot of this tab
        await page.screenshot({ path: `debug-tab-${buttonText?.replace(/\s+/g, '-')}.png` });
      }
    } else {
      console.log('❌ No task menu buttons found - might need to login first');
      
      // Look for login elements
      const loginElements = await page.locator('input[type="email"], input[type="password"], button:has-text("đăng nhập"), button:has-text("login")').all();
      console.log(`Found ${loginElements.length} login-related elements`);
    }
  });

  test('Check network requests and API status', async ({ page }) => {
    console.log('🧪 Monitoring network requests...');
    
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    });
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(5000);
    
    console.log(`\n📡 Total requests: ${requests.length}`);
    console.log(`📡 Total responses: ${responses.length}`);
    
    // Check for failed requests
    const failedResponses = responses.filter(r => r.status >= 400);
    console.log(`❌ Failed requests: ${failedResponses.length}`);
    
    failedResponses.forEach(response => {
      console.log(`❌ ${response.status} ${response.url}`);
    });
    
    // Check for API endpoints
    const apiRequests = requests.filter(r => r.url.includes('/api/') || r.url.includes('/tasks') || r.url.includes('supabase'));
    console.log(`🔗 API requests: ${apiRequests.length}`);
    
    apiRequests.forEach(request => {
      console.log(`🔗 ${request.method} ${request.url}`);
    });
    
    // Check Supabase connectivity
    const supabaseRequests = responses.filter(r => r.url.includes('supabase.co'));
    console.log(`✅ Supabase requests: ${supabaseRequests.length}`);
    
    supabaseRequests.forEach(response => {
      console.log(`✅ ${response.status} ${response.url}`);
    });
  });
});
