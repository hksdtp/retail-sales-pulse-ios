import { test, expect } from '@playwright/test';

test.describe('Task UI After Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Thực hiện đăng nhập
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      console.log('🔐 Performing login...');
      await emailInput.fill('manh.khong@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Đợi đăng nhập hoàn tất
      await page.waitForTimeout(5000);
      
      // Chụp ảnh sau khi đăng nhập
      await page.screenshot({ 
        path: 'test-results/after-login.png',
        fullPage: true 
      });
    }
  });

  test('should find task creation UI after login', async ({ page }) => {
    console.log('🔍 Searching for task creation UI after login...');
    
    // Kiểm tra URL hiện tại
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Tìm tất cả các button sau khi đăng nhập
    const allButtons = await page.locator('button').all();
    console.log(`📊 Found ${allButtons.length} buttons after login`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const classes = await button.getAttribute('class');
      console.log(`Button ${i}: "${text}" - Visible: ${isVisible} - Classes: ${classes}`);
    }
    
    // Tìm navigation menu
    const navItems = await page.locator('nav a, nav button, [role="navigation"] a, [role="navigation"] button').all();
    console.log(`📋 Found ${navItems.length} navigation items`);
    
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      const isVisible = await item.isVisible();
      console.log(`Nav ${i}: "${text}" - href: ${href} - Visible: ${isVisible}`);
    }
    
    // Tìm sidebar menu
    const sidebarItems = await page.locator('aside a, aside button, .sidebar a, .sidebar button').all();
    console.log(`📂 Found ${sidebarItems.length} sidebar items`);
    
    for (let i = 0; i < sidebarItems.length; i++) {
      const item = sidebarItems[i];
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      const isVisible = await item.isVisible();
      console.log(`Sidebar ${i}: "${text}" - href: ${href} - Visible: ${isVisible}`);
    }
    
    // Tìm các link có chứa từ khóa task
    const taskLinks = await page.locator('a:has-text("task"), a:has-text("Task"), a:has-text("công việc"), a:has-text("Công việc")').all();
    console.log(`🔗 Found ${taskLinks.length} task-related links`);
    
    for (let i = 0; i < taskLinks.length; i++) {
      const link = taskLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const isVisible = await link.isVisible();
      console.log(`Task Link ${i}: "${text}" - href: ${href} - Visible: ${isVisible}`);
    }
  });

  test('should navigate to tasks page and find create button', async ({ page }) => {
    console.log('🧭 Navigating to tasks page...');
    
    // Thử navigate đến tasks page bằng nhiều cách
    const taskUrls = [
      '/tasks',
      '/task',
      '/cong-viec',
      '/dashboard/tasks',
      '/app/tasks'
    ];
    
    for (const url of taskUrls) {
      try {
        console.log(`🔍 Trying URL: ${url}`);
        await page.goto(`http://localhost:8088${url}`);
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log(`📍 Navigated to: ${currentUrl}`);
        
        // Chụp ảnh trang hiện tại
        await page.screenshot({ 
          path: `test-results/page-${url.replace('/', '-')}.png`,
          fullPage: true 
        });
        
        // Tìm button tạo task trên trang này
        const createButtons = await page.locator('button:has-text("Tạo"), button:has-text("Create"), button:has-text("Add"), button:has-text("New"), button:has-text("+")').all();
        
        if (createButtons.length > 0) {
          console.log(`✅ Found ${createButtons.length} potential create buttons on ${url}`);
          
          for (let i = 0; i < createButtons.length; i++) {
            const button = createButtons[i];
            const text = await button.textContent();
            const isVisible = await button.isVisible();
            console.log(`  Create Button ${i}: "${text}" - Visible: ${isVisible}`);
          }
          
          // Thử click button đầu tiên
          if (await createButtons[0].isVisible()) {
            console.log(`🖱️ Clicking first create button...`);
            await createButtons[0].click();
            await page.waitForTimeout(2000);
            
            // Kiểm tra xem có dialog nào mở không
            const dialog = page.locator('[role="dialog"], .modal, [data-modal]');
            const isDialogVisible = await dialog.isVisible();
            
            if (isDialogVisible) {
              console.log(`🎉 SUCCESS! Dialog opened on ${url}`);
              
              // Chụp ảnh dialog
              await page.screenshot({ 
                path: `test-results/dialog-opened-${url.replace('/', '-')}.png`,
                fullPage: true 
              });
              
              // Phân tích dialog
              await analyzeTaskDialog(page, dialog);

              return; // Thoát khỏi loop nếu tìm thấy
            } else {
              console.log(`❌ No dialog opened on ${url}`);
            }
          }
        } else {
          console.log(`❌ No create buttons found on ${url}`);
        }
        
      } catch (error) {
        console.log(`❌ Error navigating to ${url}: ${error.message}`);
      }
    }
    
    console.log('❌ Could not find task creation UI on any page');
  });

  test('should check main dashboard for task creation', async ({ page }) => {
    console.log('🏠 Checking main dashboard for task creation...');
    
    // Đảm bảo ở trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Tìm tất cả các element có thể click
    const clickableElements = await page.locator('button, a, [role="button"], [onclick]').all();
    console.log(`🖱️ Found ${clickableElements.length} clickable elements`);
    
    const potentialTaskElements = [];
    
    for (let i = 0; i < clickableElements.length; i++) {
      const element = clickableElements[i];
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      
      if (isVisible && text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('task') || 
            lowerText.includes('công việc') || 
            lowerText.includes('tạo') || 
            lowerText.includes('create') || 
            lowerText.includes('add') || 
            lowerText.includes('new') ||
            lowerText.includes('+')) {
          
          potentialTaskElements.push({
            index: i,
            text: text.trim(),
            element
          });
          
          console.log(`🎯 Potential task element ${i}: "${text.trim()}"`);
        }
      }
    }
    
    console.log(`📊 Found ${potentialTaskElements.length} potential task-related elements`);
    
    // Thử click từng element
    for (const item of potentialTaskElements) {
      try {
        console.log(`🖱️ Testing click on: "${item.text}"`);
        
        await item.element.click();
        await page.waitForTimeout(1500);
        
        // Kiểm tra xem có thay đổi gì không
        const currentUrl = page.url();
        const dialogs = await page.locator('[role="dialog"], .modal').count();
        
        console.log(`  - URL after click: ${currentUrl}`);
        console.log(`  - Dialogs visible: ${dialogs}`);
        
        if (dialogs > 0) {
          console.log(`🎉 Dialog opened by clicking: "${item.text}"`);
          
          await page.screenshot({ 
            path: `test-results/dialog-from-${item.index}.png`,
            fullPage: true 
          });
          
          // Phân tích dialog
          const dialog = page.locator('[role="dialog"], .modal').first();
          await analyzeTaskDialog(page, dialog);
          
          // Đóng dialog để test tiếp
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
      } catch (error) {
        console.log(`❌ Error clicking "${item.text}": ${error.message}`);
      }
    }
  });

  test('should analyze CSS and UI issues', async ({ page }) => {
    console.log('🎨 Analyzing CSS and UI issues...');
    await analyzeCSSIssues(page);
  });

});

async function analyzeTaskDialog(page, dialog) {
    console.log('🔬 Analyzing task creation dialog...');
    
    try {
      // Kiểm tra title
      const title = await dialog.locator('h1, h2, h3, [role="heading"]').first().textContent();
      console.log(`📋 Dialog title: "${title}"`);
      
      // Kiểm tra form fields
      const inputs = await dialog.locator('input').count();
      const textareas = await dialog.locator('textarea').count();
      const selects = await dialog.locator('select, [role="combobox"]').count();
      const buttons = await dialog.locator('button').count();
      
      console.log(`📝 Form elements: ${inputs} inputs, ${textareas} textareas, ${selects} selects, ${buttons} buttons`);
      
      // Kiểm tra validation errors
      const errors = await dialog.locator('.error, .invalid, [role="alert"]').count();
      console.log(`⚠️ Validation errors visible: ${errors}`);
      
      // Kiểm tra required fields
      const requiredFields = await dialog.locator('[required], [aria-required="true"]').count();
      console.log(`⭐ Required fields: ${requiredFields}`);
      
      // Kiểm tra CSS issues
      const formContainer = dialog.locator('form').first();
      if (await formContainer.isVisible()) {
        const styles = await formContainer.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            overflow: computed.overflow,
            maxHeight: computed.maxHeight,
            height: computed.height,
            width: computed.width
          };
        });
        
        console.log('🎨 Form styles:', styles);
        
        // Kiểm tra xem có element nào bị ẩn không
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
          console.log('🚨 ISSUE: Form container has display/visibility issues!');
        }
      }
      
      // Kiểm tra scroll issues
      const dialogHeight = await dialog.evaluate(el => el.scrollHeight);
      const dialogClientHeight = await dialog.evaluate(el => el.clientHeight);
      
      if (dialogHeight > dialogClientHeight) {
        console.log(`📏 Dialog has scroll: ${dialogHeight}px content in ${dialogClientHeight}px container`);
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing dialog: ${error.message}`);
    }
}

async function analyzeCSSIssues(page) {
    console.log('🎨 Checking for CSS and layout issues...');
    
    // Kiểm tra console errors liên quan đến CSS
    const cssErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('css')) {
        cssErrors.push(msg.text());
        console.log(`🎨 CSS Error: ${msg.text()}`);
      }
    });
    
    // Reload để catch CSS errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Kiểm tra các element có vấn đề về layout
    const hiddenElements = await page.locator('[style*="display: none"], [style*="visibility: hidden"]').count();
    console.log(`👻 Hidden elements found: ${hiddenElements}`);
    
    // Kiểm tra overflow issues
    const overflowElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        if (computed.overflow === 'hidden' && el.scrollHeight > el.clientHeight) {
          issues.push({
            index,
            tagName: el.tagName,
            className: el.className,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight
          });
        }
      });
      
      return issues;
    });
    
    console.log(`📏 Elements with overflow issues: ${overflowElements.length}`);
    overflowElements.forEach((issue, i) => {
      console.log(`  ${i}: ${issue.tagName}.${issue.className} - ${issue.scrollHeight}px in ${issue.clientHeight}px`);
    });
    
    console.log(`📊 CSS Analysis Summary: ${cssErrors.length} CSS errors, ${hiddenElements} hidden elements, ${overflowElements.length} overflow issues`);
}
