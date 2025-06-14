import { chromium } from 'playwright';

async function testMemberTaskFiltering() {
  console.log('🎭 Starting Member Task Filtering Test...');
  console.log('📱 App URL: http://localhost:8089');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console logs for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('selectedMember') || 
        text.includes('Phạm Thị Hương') ||
        text.includes('🎯') ||
        text.includes('👤') ||
        text.includes('📊')) {
      console.log(`🔍 Console: ${text}`);
    }
  });
  
  try {
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8089');
    await page.waitForTimeout(3000);
    
    // Check if login is needed
    const loginButton = page.locator('button:has-text("Đăng nhập"), button[type="submit"]');
    if (await loginButton.isVisible({ timeout: 2000 })) {
      console.log('🔐 Login form detected, filling credentials...');
      
      // Try different login field selectors
      const emailField = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
      const passwordField = page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]').first();
      
      if (await emailField.isVisible({ timeout: 1000 })) {
        await emailField.fill('manh.khong@example.com');
        console.log('✅ Email filled');
      }
      
      if (await passwordField.isVisible({ timeout: 1000 })) {
        await passwordField.fill('password123');
        console.log('✅ Password filled');
      }
      
      await loginButton.click();
      console.log('🔐 Login button clicked');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to Tasks
    console.log('📋 Looking for Tasks navigation...');
    const tasksLink = page.locator('a[href="/tasks"], a:has-text("Công việc"), nav a:has-text("Tasks")').first();
    
    if (await tasksLink.isVisible({ timeout: 2000 })) {
      await tasksLink.click();
      console.log('✅ Clicked Tasks navigation');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ Tasks navigation not found, checking current page...');
    }
    
    // Look for member filter or member tasks section
    console.log('👥 Looking for member filtering options...');
    
    // Try different selectors for member filtering
    const memberSelectors = [
      'select', // Basic select dropdown
      '[role="combobox"]', // Combobox
      'button:has-text("Chọn thành viên")',
      'button:has-text("Tất cả")',
      'button:has-text("Thành viên")',
      '.member-filter',
      '[data-testid="member-filter"]'
    ];
    
    let memberFilter = null;
    for (const selector of memberSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        memberFilter = element;
        console.log(`✅ Found member filter with selector: ${selector}`);
        break;
      }
    }
    
    if (memberFilter) {
      console.log('📝 Opening member filter dropdown...');
      await memberFilter.click();
      await page.waitForTimeout(1000);
      
      // Look for Phạm Thị Hương option
      const huongSelectors = [
        'text="Phạm Thị Hương"',
        'option:has-text("Phạm Thị Hương")',
        'li:has-text("Phạm Thị Hương")',
        '[value*="Hương"]'
      ];
      
      let huongOption = null;
      for (const selector of huongSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          huongOption = element;
          console.log(`✅ Found Phạm Thị Hương option with selector: ${selector}`);
          break;
        }
      }
      
      if (huongOption) {
        console.log('🎯 Selecting Phạm Thị Hương...');
        await huongOption.click();
        await page.waitForTimeout(3000);
        
        // Count tasks displayed
        const taskSelectors = [
          '.task-card',
          '.task-item', 
          '[data-testid="task"]',
          '.task',
          'li:has-text("task")',
          'div:has-text("Phạm Thị Hương")'
        ];
        
        let taskCount = 0;
        for (const selector of taskSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            taskCount = Math.max(taskCount, count);
          }
        }
        
        console.log(`📊 Found ${taskCount} tasks displayed`);
        
        if (taskCount > 0) {
          console.log('✅ SUCCESS: Tasks are displayed for Phạm Thị Hương!');
          
          // Try to get task titles
          const taskTitles = await page.locator('h3, .task-title, .title').allTextContents();
          if (taskTitles.length > 0) {
            console.log('📝 Task titles found:');
            taskTitles.slice(0, 5).forEach((title, index) => {
              if (title.trim()) {
                console.log(`   ${index + 1}. ${title.trim()}`);
              }
            });
          }
        } else {
          console.log('❌ ISSUE: No tasks found for Phạm Thị Hương');
          console.log('💡 Check console logs above for debugging info');
        }
        
      } else {
        console.log('❌ Phạm Thị Hương option not found in dropdown');
        
        // List available options
        const allOptions = await page.locator('option, li, [role="option"]').allTextContents();
        console.log('📋 Available options:', allOptions.filter(opt => opt.trim()));
      }
      
    } else {
      console.log('❌ Member filter dropdown not found');
      console.log('🔍 Current page elements:');
      
      // Debug: show some page elements
      const buttons = await page.locator('button').allTextContents();
      const selects = await page.locator('select').count();
      console.log(`   Buttons: ${buttons.slice(0, 5).join(', ')}`);
      console.log(`   Select elements: ${selects}`);
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'member-filtering-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as member-filtering-test-result.png');
    
    // Wait to see result
    console.log('⏳ Waiting 5 seconds to observe result...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'member-filtering-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as member-filtering-error.png');
  } finally {
    await browser.close();
    console.log('🎭 Test completed');
  }
}

// Check if playwright is available
try {
  testMemberTaskFiltering().catch(console.error);
} catch (error) {
  console.error('❌ Playwright not available:', error.message);
  console.log('💡 Please install playwright: npm install playwright');
}
