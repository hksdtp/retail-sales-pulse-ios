import { test, expect } from '@playwright/test';

test.describe('Simple Task UI Debug', () => {
  test('should debug task creation interface step by step', async ({ page }) => {
    console.log('🔍 Starting comprehensive task UI debug...');
    
    // Bước 1: Điều hướng đến trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 1: Homepage loaded');
    await page.screenshot({ 
      path: 'test-results/step1-homepage.png',
      fullPage: true 
    });
    
    // Bước 2: Thực hiện đăng nhập
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      console.log('🔐 Step 2: Performing login...');
      await emailInput.fill('manh.khong@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Đợi đăng nhập hoàn tất
      await page.waitForTimeout(5000);
      
      console.log('✅ Login completed');
      await page.screenshot({ 
        path: 'test-results/step2-after-login.png',
        fullPage: true 
      });
    }
    
    // Bước 3: Phân tích giao diện sau đăng nhập
    const currentUrl = page.url();
    console.log(`📍 Step 3: Current URL after login: ${currentUrl}`);
    
    // Tìm tất cả các menu items
    const menuItems = await page.locator('a, button').all();
    console.log(`📋 Found ${menuItems.length} clickable elements`);
    
    const taskRelatedItems = [];
    
    for (let i = 0; i < Math.min(menuItems.length, 20); i++) { // Chỉ check 20 items đầu
      const item = menuItems[i];
      const text = await item.textContent();
      const isVisible = await item.isVisible();
      
      if (isVisible && text) {
        const lowerText = text.toLowerCase().trim();
        console.log(`Item ${i}: "${text.trim()}" - Visible: ${isVisible}`);
        
        if (lowerText.includes('task') || 
            lowerText.includes('công việc') || 
            lowerText.includes('nhiệm vụ') ||
            lowerText === 'tasks') {
          taskRelatedItems.push({ index: i, text: text.trim(), item });
          console.log(`🎯 Found task-related item: "${text.trim()}"`);
        }
      }
    }
    
    // Bước 4: Thử click vào menu Tasks nếu có
    if (taskRelatedItems.length > 0) {
      console.log(`🖱️ Step 4: Clicking on first task-related item: "${taskRelatedItems[0].text}"`);
      
      await taskRelatedItems[0].item.click();
      await page.waitForTimeout(3000);
      
      console.log('📍 After clicking task menu');
      await page.screenshot({ 
        path: 'test-results/step4-task-menu-clicked.png',
        fullPage: true 
      });
      
      // Tìm button tạo task mới
      const createButtons = await page.locator('button').all();
      console.log(`🔍 Looking for create buttons, found ${createButtons.length} buttons`);
      
      for (let i = 0; i < createButtons.length; i++) {
        const button = createButtons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        
        if (isVisible && text) {
          const lowerText = text.toLowerCase().trim();
          console.log(`Button ${i}: "${text.trim()}" - Visible: ${isVisible}`);
          
          if (lowerText.includes('tạo') || 
              lowerText.includes('create') || 
              lowerText.includes('add') || 
              lowerText.includes('new') ||
              lowerText.includes('+')) {
            
            console.log(`🎯 Found potential create button: "${text.trim()}"`);
            
            // Thử click button này
            console.log(`🖱️ Step 5: Clicking create button: "${text.trim()}"`);
            await button.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: `test-results/step5-clicked-create-${i}.png`,
              fullPage: true 
            });
            
            // Kiểm tra xem có dialog mở không
            const dialogs = await page.locator('[role="dialog"], .modal, [data-modal]').all();
            console.log(`📱 Found ${dialogs.length} dialogs after clicking`);
            
            if (dialogs.length > 0) {
              const dialog = dialogs[0];
              const isDialogVisible = await dialog.isVisible();
              
              if (isDialogVisible) {
                console.log('🎉 SUCCESS! Task creation dialog opened!');
                
                await page.screenshot({ 
                  path: 'test-results/step6-dialog-opened.png',
                  fullPage: true 
                });
                
                // Phân tích dialog chi tiết
                await analyzeTaskCreationDialog(page, dialog);
                
                return; // Kết thúc test thành công
              }
            }
            
            // Nếu không có dialog, thử ESC để reset
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }
      }
    } else {
      console.log('❌ No task-related menu items found');
    }
    
    // Bước 6: Thử tìm bằng cách khác - direct URL
    console.log('🔍 Step 6: Trying direct navigation to task pages...');
    
    const taskUrls = ['/tasks', '/task', '/dashboard/tasks', '/app/tasks'];
    
    for (const url of taskUrls) {
      try {
        console.log(`🧭 Trying URL: ${url}`);
        await page.goto(`http://localhost:8088${url}`);
        await page.waitForTimeout(2000);
        
        const pageTitle = await page.title();
        console.log(`📄 Page title: ${pageTitle}`);
        
        await page.screenshot({ 
          path: `test-results/step6-url-${url.replace('/', '-')}.png`,
          fullPage: true 
        });
        
        // Tìm create button trên trang này
        const createButtons = await page.locator('button:has-text("Tạo"), button:has-text("Create"), button:has-text("Add"), button:has-text("+")').all();
        
        if (createButtons.length > 0) {
          console.log(`✅ Found ${createButtons.length} create buttons on ${url}`);
          
          const firstButton = createButtons[0];
          const buttonText = await firstButton.textContent();
          console.log(`🖱️ Clicking: "${buttonText}"`);
          
          await firstButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: `test-results/step6-clicked-on-${url.replace('/', '-')}.png`,
            fullPage: true 
          });
          
          // Kiểm tra dialog
          const dialog = page.locator('[role="dialog"], .modal').first();
          if (await dialog.isVisible()) {
            console.log(`🎉 SUCCESS! Dialog opened on ${url}`);
            await analyzeTaskCreationDialog(page, dialog);
            return;
          }
        }
        
      } catch (error) {
        console.log(`❌ Error with URL ${url}: ${error.message}`);
      }
    }
    
    console.log('❌ Could not find task creation interface');
  });
});

async function analyzeTaskCreationDialog(page, dialog) {
  console.log('🔬 Analyzing task creation dialog in detail...');
  
  try {
    // 1. Kiểm tra dialog title
    const titleSelectors = ['h1', 'h2', 'h3', '[role="heading"]', '.modal-title', '.dialog-title'];
    let title = '';
    
    for (const selector of titleSelectors) {
      const titleElement = dialog.locator(selector).first();
      if (await titleElement.isVisible()) {
        title = await titleElement.textContent();
        break;
      }
    }
    
    console.log(`📋 Dialog title: "${title}"`);
    
    // 2. Kiểm tra form structure
    const form = dialog.locator('form').first();
    const hasForm = await form.isVisible();
    console.log(`📝 Has form element: ${hasForm}`);
    
    // 3. Đếm các input fields
    const inputs = await dialog.locator('input').count();
    const textareas = await dialog.locator('textarea').count();
    const selects = await dialog.locator('select, [role="combobox"]').count();
    const buttons = await dialog.locator('button').count();
    
    console.log(`📊 Form elements count:`);
    console.log(`  - Inputs: ${inputs}`);
    console.log(`  - Textareas: ${textareas}`);
    console.log(`  - Selects: ${selects}`);
    console.log(`  - Buttons: ${buttons}`);
    
    // 4. Kiểm tra từng input field chi tiết
    const allInputs = await dialog.locator('input').all();
    console.log(`🔍 Analyzing ${allInputs.length} input fields:`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const required = await input.getAttribute('required');
      const isVisible = await input.isVisible();
      const isEnabled = await input.isEnabled();
      
      console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", required="${required !== null}", visible=${isVisible}, enabled=${isEnabled}`);
      
      // Kiểm tra CSS styling
      if (isVisible) {
        const styles = await input.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            width: computed.width,
            height: computed.height
          };
        });
        
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
          console.log(`    ⚠️ CSS Issue: Input ${i} has display/visibility problems`);
        }
      }
    }
    
    // 5. Kiểm tra textarea fields
    const allTextareas = await dialog.locator('textarea').all();
    console.log(`📄 Analyzing ${allTextareas.length} textarea fields:`);
    
    for (let i = 0; i < allTextareas.length; i++) {
      const textarea = allTextareas[i];
      const name = await textarea.getAttribute('name');
      const placeholder = await textarea.getAttribute('placeholder');
      const required = await textarea.getAttribute('required');
      const isVisible = await textarea.isVisible();
      
      console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", required="${required !== null}", visible=${isVisible}`);
    }
    
    // 6. Kiểm tra select/dropdown fields
    const allSelects = await dialog.locator('select, [role="combobox"]').all();
    console.log(`📋 Analyzing ${allSelects.length} select fields:`);
    
    for (let i = 0; i < allSelects.length; i++) {
      const select = allSelects[i];
      const name = await select.getAttribute('name');
      const isVisible = await select.isVisible();
      
      console.log(`  Select ${i}: name="${name}", visible=${isVisible}`);
      
      // Thử click để xem options
      if (isVisible) {
        try {
          await select.click();
          await page.waitForTimeout(500);
          
          const options = await page.locator('option, [role="option"]').count();
          console.log(`    Options available: ${options}`);
          
          // Click outside để đóng dropdown
          await page.keyboard.press('Escape');
        } catch (error) {
          console.log(`    Error checking options: ${error.message}`);
        }
      }
    }
    
    // 7. Kiểm tra buttons
    const allButtons = await dialog.locator('button').all();
    console.log(`🔘 Analyzing ${allButtons.length} buttons:`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const disabled = await button.isDisabled();
      const isVisible = await button.isVisible();
      
      console.log(`  Button ${i}: "${text?.trim()}", type="${type}", disabled=${disabled}, visible=${isVisible}`);
    }
    
    // 8. Kiểm tra validation errors
    const errorSelectors = ['.error', '.invalid', '[role="alert"]', '.text-red', '.text-danger', '.error-message'];
    let totalErrors = 0;
    
    for (const selector of errorSelectors) {
      const errors = await dialog.locator(selector).count();
      totalErrors += errors;
    }
    
    console.log(`⚠️ Validation errors visible: ${totalErrors}`);
    
    // 9. Kiểm tra dialog size và scroll
    const dialogRect = await dialog.boundingBox();
    const dialogScrollHeight = await dialog.evaluate(el => el.scrollHeight);
    const dialogClientHeight = await dialog.evaluate(el => el.clientHeight);
    
    console.log(`📏 Dialog dimensions:`);
    console.log(`  - Bounding box: ${dialogRect?.width}x${dialogRect?.height}`);
    console.log(`  - Scroll height: ${dialogScrollHeight}px`);
    console.log(`  - Client height: ${dialogClientHeight}px`);
    console.log(`  - Has scroll: ${dialogScrollHeight > dialogClientHeight}`);
    
    // 10. Test thử điền form
    console.log('✏️ Testing form filling...');
    
    try {
      // Thử điền title
      const titleInput = dialog.locator('input[name="title"], input[placeholder*="tiêu đề"], input[placeholder*="title"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Task Title');
        console.log('  ✅ Title field filled successfully');
      }
      
      // Thử điền description
      const descInput = dialog.locator('textarea[name="description"], textarea[placeholder*="mô tả"], textarea[placeholder*="description"]').first();
      if (await descInput.isVisible()) {
        await descInput.fill('Test task description');
        console.log('  ✅ Description field filled successfully');
      }
      
      // Chụp ảnh sau khi điền
      await page.screenshot({ 
        path: 'test-results/dialog-filled.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`  ❌ Error filling form: ${error.message}`);
    }
    
    console.log('🔬 Dialog analysis completed');
    
  } catch (error) {
    console.log(`❌ Error during dialog analysis: ${error.message}`);
  }
}
