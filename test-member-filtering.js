const { chromium } = require('playwright');

async function testMemberTaskFiltering() {
  console.log('🎭 Starting Playwright test for member task filtering...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    if (msg.text().includes('Phạm Thị Hương') || 
        msg.text().includes('selectedMember') ||
        msg.text().includes('Member tasks') ||
        msg.text().includes('🎯') ||
        msg.text().includes('👤') ||
        msg.text().includes('📊')) {
      console.log(`🔍 Console: ${msg.text()}`);
    }
  });
  
  try {
    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(2000);
    
    // Check if login is needed
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      console.log('🔐 Logging in as Khổng Đức Mạnh...');
      
      // Fill login form
      await page.fill('input[type="email"]', 'manh.khong@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to Tasks
    console.log('📋 Navigating to Tasks...');
    await page.click('a[href="/tasks"]');
    await page.waitForTimeout(2000);
    
    // Look for Member Tasks option
    console.log('👥 Looking for Member Tasks option...');
    
    // Try different selectors for member tasks
    const memberTasksSelectors = [
      'text="Công việc của thành viên"',
      'text="Thành viên"',
      'button:has-text("Thành viên")',
      '[data-testid="member-tasks"]',
      '.member-tasks-button'
    ];
    
    let memberTasksButton = null;
    for (const selector of memberTasksSelectors) {
      try {
        memberTasksButton = page.locator(selector).first();
        if (await memberTasksButton.isVisible({ timeout: 1000 })) {
          console.log(`✅ Found member tasks button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (memberTasksButton && await memberTasksButton.isVisible()) {
      console.log('🎯 Clicking Member Tasks...');
      await memberTasksButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ Member Tasks button not found, checking current page...');
    }
    
    // Look for member filter dropdown
    console.log('🔍 Looking for member filter dropdown...');
    
    const dropdownSelectors = [
      'select',
      '[role="combobox"]',
      '.member-filter',
      'button:has-text("Chọn thành viên")',
      'button:has-text("Tất cả")'
    ];
    
    let dropdown = null;
    for (const selector of dropdownSelectors) {
      try {
        dropdown = page.locator(selector).first();
        if (await dropdown.isVisible({ timeout: 1000 })) {
          console.log(`✅ Found dropdown with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (dropdown && await dropdown.isVisible()) {
      console.log('📝 Opening member dropdown...');
      await dropdown.click();
      await page.waitForTimeout(1000);
      
      // Look for Phạm Thị Hương option
      console.log('👤 Looking for Phạm Thị Hương option...');
      
      const huongSelectors = [
        'text="Phạm Thị Hương"',
        'option:has-text("Phạm Thị Hương")',
        '[value*="Hương"]',
        'li:has-text("Phạm Thị Hương")'
      ];
      
      let huongOption = null;
      for (const selector of huongSelectors) {
        try {
          huongOption = page.locator(selector).first();
          if (await huongOption.isVisible({ timeout: 1000 })) {
            console.log(`✅ Found Phạm Thị Hương option with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (huongOption && await huongOption.isVisible()) {
        console.log('🎯 Selecting Phạm Thị Hương...');
        await huongOption.click();
        await page.waitForTimeout(3000);
        
        // Check for tasks
        console.log('📋 Checking for tasks...');
        const tasks = await page.locator('.task-card, .task-item, [data-testid="task"]').count();
        console.log(`📊 Found ${tasks} tasks displayed`);
        
        if (tasks > 0) {
          console.log('✅ Tasks are displayed for Phạm Thị Hương!');
          
          // Get task titles
          const taskTitles = await page.locator('.task-card h3, .task-item h3, .task-title').allTextContents();
          console.log('📝 Task titles:', taskTitles);
          
        } else {
          console.log('❌ No tasks found for Phạm Thị Hương');
        }
        
      } else {
        console.log('❌ Phạm Thị Hương option not found in dropdown');
        
        // List all available options
        const allOptions = await page.locator('option, li').allTextContents();
        console.log('📋 Available options:', allOptions);
      }
      
    } else {
      console.log('❌ Member filter dropdown not found');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'member-filtering-test.png', fullPage: true });
    console.log('📸 Screenshot saved as member-filtering-test.png');
    
    // Wait a bit to see the result
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🎭 Test completed');
  }
}

// Run the test
testMemberTaskFiltering().catch(console.error);
