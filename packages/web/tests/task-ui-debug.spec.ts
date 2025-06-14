import { test, expect } from '@playwright/test';

test.describe('Task UI Debug Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang chủ
    await page.goto('http://localhost:8088');
    
    // Đợi trang load hoàn toàn
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should debug task creation UI elements', async ({ page }) => {
    console.log('🔍 Starting UI debug for task creation...');
    
    // Chụp ảnh trang chủ trước
    await page.screenshot({ 
      path: 'test-results/debug-homepage.png',
      fullPage: true 
    });
    
    // Tìm tất cả các button có thể là nút tạo task
    const allButtons = await page.locator('button').all();
    console.log(`📊 Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`Button ${i}: "${text}" - Visible: ${isVisible}`);
    }
    
    // Tìm các text có chứa từ khóa liên quan đến task
    const taskKeywords = ['task', 'công việc', 'tạo', 'thêm', 'add', 'create', 'new'];

    for (const keyword of taskKeywords) {
      const elements = await page.locator(`text="${keyword}"`).or(page.locator(`:text("${keyword}")`)).all();
      if (elements.length > 0) {
        console.log(`🔍 Found ${elements.length} elements containing "${keyword}"`);
        for (let i = 0; i < elements.length; i++) {
          const text = await elements[i].textContent();
          const isVisible = await elements[i].isVisible();
          console.log(`  - "${text}" - Visible: ${isVisible}`);
        }
      }
    }
    
    // Kiểm tra navigation menu
    const navItems = await page.locator('nav a, nav button').all();
    console.log(`📋 Found ${navItems.length} navigation items`);
    
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      const isVisible = await item.isVisible();
      console.log(`Nav ${i}: "${text}" - href: ${href} - Visible: ${isVisible}`);
    }
  });

  test('should check for task creation dialog accessibility', async ({ page }) => {
    console.log('♿ Checking accessibility for task creation...');
    
    // Tìm và click vào menu Tasks nếu có
    const tasksMenu = page.locator('text=Tasks').or(page.locator('text=Công việc')).first();
    
    if (await tasksMenu.isVisible()) {
      console.log('✅ Found Tasks menu, clicking...');
      await tasksMenu.click();
      await page.waitForTimeout(1000);
      
      // Chụp ảnh sau khi click Tasks menu
      await page.screenshot({ 
        path: 'test-results/debug-tasks-menu.png',
        fullPage: true 
      });
    }
    
    // Tìm tất cả các element có role="dialog"
    const dialogs = await page.locator('[role="dialog"]').all();
    console.log(`📱 Found ${dialogs.length} dialog elements`);
    
    // Tìm tất cả các modal/popup
    const modals = await page.locator('.modal, [data-modal], [data-testid*="modal"]').all();
    console.log(`🪟 Found ${modals.length} modal elements`);
    
    // Kiểm tra các form elements
    const forms = await page.locator('form').all();
    console.log(`📝 Found ${forms.length} form elements`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const isVisible = await form.isVisible();
      const inputs = await form.locator('input, textarea, select').count();
      console.log(`Form ${i}: Visible: ${isVisible}, Inputs: ${inputs}`);
    }
  });

  test('should test all possible ways to open task creation', async ({ page }) => {
    console.log('🚪 Testing all ways to open task creation...');
    
    // Danh sách các selector có thể cho nút tạo task
    const possibleSelectors = [
      'button:has-text("Tạo công việc mới")',
      'button:has-text("Tạo task")',
      'button:has-text("Thêm công việc")',
      'button:has-text("Add Task")',
      'button:has-text("Create Task")',
      'button:has-text("New Task")',
      'button:has-text("+")',
      '[data-testid="create-task"]',
      '[data-testid="add-task"]',
      '[data-testid="new-task"]',
      '[aria-label*="tạo"]',
      '[aria-label*="thêm"]',
      '[aria-label*="create"]',
      '[aria-label*="add"]',
      'button[title*="tạo"]',
      'button[title*="thêm"]',
      '.create-task-btn',
      '.add-task-btn',
      '.new-task-btn',
      'button.btn-primary',
      'button.btn-success',
      'a[href*="create"]',
      'a[href*="new"]',
      'a[href*="add"]'
    ];
    
    const foundButtons = [];
    
    for (const selector of possibleSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const isVisible = await element.isVisible();
            const text = await element.textContent();
            const tagName = await element.evaluate(el => el.tagName);
            
            if (isVisible) {
              foundButtons.push({
                selector,
                text: text?.trim(),
                tagName,
                index: i
              });
              console.log(`✅ Found: ${selector} - "${text?.trim()}" (${tagName})`);
            }
          }
        }
      } catch (error) {
        // Ignore invalid selectors
      }
    }
    
    console.log(`📊 Total found ${foundButtons.length} potential create task buttons`);
    
    // Thử click từng button để xem cái nào mở dialog
    for (const button of foundButtons.slice(0, 5)) { // Chỉ test 5 button đầu
      try {
        console.log(`🖱️ Testing click on: ${button.selector} - "${button.text}"`);
        
        const element = page.locator(button.selector).nth(button.index || 0);
        await element.click();
        await page.waitForTimeout(1000);
        
        // Kiểm tra xem có dialog nào mở không
        const dialog = page.locator('[role="dialog"]');
        const isDialogVisible = await dialog.isVisible();
        
        if (isDialogVisible) {
          console.log(`🎉 SUCCESS! Dialog opened with: ${button.selector}`);
          
          // Chụp ảnh dialog
          await page.screenshot({ 
            path: `test-results/debug-dialog-${Date.now()}.png`,
            fullPage: true 
          });
          
          // Đóng dialog để test button tiếp theo
          const closeButton = page.locator('[aria-label="Close"], button:has-text("Hủy"), button:has-text("Cancel"), [data-testid="close"]');
          if (await closeButton.first().isVisible()) {
            await closeButton.first().click();
            await page.waitForTimeout(500);
          } else {
            // Thử ESC key
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        } else {
          console.log(`❌ No dialog opened with: ${button.selector}`);
        }
        
      } catch (error) {
        console.log(`❌ Error clicking ${button.selector}: ${error.message}`);
      }
    }
  });

  test('should analyze task form structure when found', async ({ page }) => {
    console.log('🔬 Analyzing task form structure...');
    
    // Thử mở dialog bằng cách click vào các element có thể
    const createButtons = [
      'button:has-text("Tạo")',
      'button:has-text("+")',
      '[data-testid*="create"]',
      'button.btn-primary'
    ];
    
    let dialogOpened = false;
    
    for (const selector of createButtons) {
      if (dialogOpened) break;
      
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          
          const dialog = page.locator('[role="dialog"]');
          if (await dialog.isVisible()) {
            dialogOpened = true;
            console.log(`✅ Dialog opened with selector: ${selector}`);
            break;
          }
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (dialogOpened) {
      // Phân tích cấu trúc form
      const dialog = page.locator('[role="dialog"]');
      
      // Kiểm tra title
      const title = await dialog.locator('h1, h2, h3, [role="heading"]').first().textContent();
      console.log(`📋 Dialog title: "${title}"`);
      
      // Kiểm tra các input fields
      const inputs = await dialog.locator('input').all();
      console.log(`📝 Found ${inputs.length} input fields:`);
      
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        const required = await input.getAttribute('required');
        const isVisible = await input.isVisible();
        
        console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", required="${required}", visible=${isVisible}`);
      }
      
      // Kiểm tra textarea
      const textareas = await dialog.locator('textarea').all();
      console.log(`📄 Found ${textareas.length} textarea fields:`);
      
      for (let i = 0; i < textareas.length; i++) {
        const textarea = textareas[i];
        const placeholder = await textarea.getAttribute('placeholder');
        const name = await textarea.getAttribute('name');
        const isVisible = await textarea.isVisible();
        
        console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", visible=${isVisible}`);
      }
      
      // Kiểm tra select/dropdown
      const selects = await dialog.locator('select, [role="combobox"]').all();
      console.log(`📋 Found ${selects.length} select/dropdown fields:`);
      
      for (let i = 0; i < selects.length; i++) {
        const select = selects[i];
        const name = await select.getAttribute('name');
        const isVisible = await select.isVisible();
        
        console.log(`  Select ${i}: name="${name}", visible=${isVisible}`);
      }
      
      // Kiểm tra buttons
      const buttons = await dialog.locator('button').all();
      console.log(`🔘 Found ${buttons.length} buttons in dialog:`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await button.textContent();
        const type = await button.getAttribute('type');
        const disabled = await button.getAttribute('disabled');
        const isVisible = await button.isVisible();
        
        console.log(`  Button ${i}: "${text}", type="${type}", disabled="${disabled}", visible=${isVisible}`);
      }
      
      // Chụp ảnh chi tiết form
      await page.screenshot({ 
        path: 'test-results/debug-form-analysis.png',
        fullPage: true 
      });
      
      // Kiểm tra CSS styling issues
      const formContainer = dialog.locator('form, .form-container').first();
      if (await formContainer.isVisible()) {
        const styles = await formContainer.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            overflow: computed.overflow,
            maxHeight: computed.maxHeight,
            height: computed.height
          };
        });
        
        console.log('🎨 Form container styles:', styles);
      }
      
    } else {
      console.log('❌ Could not open any dialog for analysis');
      
      // Chụp ảnh trang hiện tại để debug
      await page.screenshot({ 
        path: 'test-results/debug-no-dialog.png',
        fullPage: true 
      });
    }
  });

  test('should check for JavaScript errors', async ({ page }) => {
    console.log('🐛 Checking for JavaScript errors...');
    
    const errors = [];
    const warnings = [];
    
    // Lắng nghe console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });
    
    // Lắng nghe page errors
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    // Reload trang để catch errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Thử tương tác với UI để trigger errors
    try {
      const buttons = await page.locator('button').all();
      if (buttons.length > 0) {
        await buttons[0].click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log(`🔍 Interaction error: ${error.message}`);
    }
    
    console.log(`📊 Summary: ${errors.length} errors, ${warnings.length} warnings found`);
    
    if (errors.length > 0) {
      console.log('🚨 JavaScript Errors Found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ JavaScript Warnings Found:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
  });
});
