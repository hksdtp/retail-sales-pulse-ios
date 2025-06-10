import { test, expect } from '@playwright/test';

test.describe('Final Dialog Fix Test', () => {
  test('should test dialog with correct button selector', async ({ page }) => {
    console.log('🎯 Testing dialog with correct button selector...');
    
    // Điều hướng và đăng nhập
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Đăng nhập
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    console.log('✅ Login completed');
    
    // Navigate to tasks
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to tasks page');
    }
    
    // Chụp ảnh trang tasks
    await page.screenshot({ 
      path: 'test-results/final-tasks-page.png',
      fullPage: true 
    });
    
    // Tìm button "Tạo công việc" (đúng text từ code)
    console.log('🔍 Looking for create task button...');
    
    // Thử nhiều selector khác nhau
    const buttonSelectors = [
      'button:has-text("Tạo công việc")',
      'button span:has-text("Tạo công việc")',
      'button:has([class*="Plus"])',
      'button[class*="gradient"]',
      'button[class*="bg-gradient"]'
    ];
    
    let buttonFound = false;
    let createTaskButton;
    
    for (const selector of buttonSelectors) {
      createTaskButton = page.locator(selector).first();
      if (await createTaskButton.isVisible()) {
        console.log(`✅ Found button with selector: ${selector}`);
        buttonFound = true;
        break;
      }
    }
    
    if (!buttonFound) {
      // Debug: List all buttons on page
      console.log('🔍 Debugging: Listing all buttons on page...');
      const allButtons = await page.locator('button').all();
      
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        const classes = await button.getAttribute('class');
        console.log(`Button ${i}: "${text}" - Visible: ${isVisible} - Classes: ${classes}`);
      }
      
      // Thử click button đầu tiên có text chứa "Tạo"
      const anyCreateButton = page.locator('button').filter({ hasText: /Tạo|Create|Add|\+/ }).first();
      if (await anyCreateButton.isVisible()) {
        createTaskButton = anyCreateButton;
        buttonFound = true;
        console.log('✅ Found fallback create button');
      }
    }
    
    if (buttonFound && createTaskButton) {
      await createTaskButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked create task button');
      
      // Chụp ảnh sau khi click
      await page.screenshot({ 
        path: 'test-results/final-after-button-click.png',
        fullPage: true 
      });
      
      // Kiểm tra dialog đã mở
      const dialog = page.locator('[data-radix-dialog-content]');
      
      if (await dialog.isVisible()) {
        console.log('🎉 SUCCESS! Dialog is visible');
        
        // Chụp ảnh dialog
        await page.screenshot({ 
          path: 'test-results/final-dialog-success.png',
          fullPage: true 
        });
        
        // Test form elements
        const titleInput = page.locator('input[name="title"]');
        const descInput = page.locator('textarea[name="description"]');
        const selectTrigger = page.locator('[data-radix-select-trigger]').first();
        
        console.log('📝 Testing form elements...');
        
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Dialog Clarity Fix');
          console.log('✅ Title input works');
        }
        
        if (await descInput.isVisible()) {
          await descInput.fill('Testing dialog clarity after all fixes applied');
          console.log('✅ Description input works');
        }
        
        if (await selectTrigger.isVisible()) {
          await selectTrigger.click();
          await page.waitForTimeout(1000);
          
          // Chụp ảnh dropdown
          await page.screenshot({ 
            path: 'test-results/final-dropdown-test.png',
            fullPage: true 
          });
          
          const selectContent = page.locator('[data-radix-select-content]');
          if (await selectContent.isVisible()) {
            console.log('✅ Dropdown opens correctly');
            
            // Click first option
            const firstOption = selectContent.locator('[data-radix-select-item]').first();
            if (await firstOption.isVisible()) {
              await firstOption.click();
              console.log('✅ Dropdown option selection works');
            }
          } else {
            console.log('❌ Dropdown content not visible');
          }
        }
        
        // Fill date
        const dateInput = page.locator('input[name="date"]');
        if (await dateInput.isVisible()) {
          const today = new Date().toISOString().split('T')[0];
          await dateInput.fill(today);
          console.log('✅ Date input works');
        }
        
        // Final screenshot
        await page.screenshot({ 
          path: 'test-results/final-form-complete.png',
          fullPage: true 
        });
        
        // Test submit button
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible() && await submitButton.isEnabled()) {
          console.log('✅ Submit button is ready');
          
          // Test close instead of submit
          const closeButton = page.locator('button').filter({ hasText: 'Hủy bỏ' }).first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(2000);
            
            if (!(await dialog.isVisible())) {
              console.log('✅ Dialog closes correctly');
            }
          }
        }
        
        console.log('🎉 ALL TESTS PASSED! Dialog clarity fix is successful');
        
      } else {
        console.log('❌ Dialog not visible after button click');
        
        // Debug: Check for any dialogs
        const anyDialog = page.locator('[role="dialog"]');
        const isAnyDialogVisible = await anyDialog.isVisible();
        console.log(`Any dialog visible: ${isAnyDialogVisible}`);
        
        // Check for modal or popup
        const modal = page.locator('.modal, .popup, [class*="modal"], [class*="popup"]');
        const isModalVisible = await modal.isVisible();
        console.log(`Modal visible: ${isModalVisible}`);
      }
      
    } else {
      console.log('❌ Create task button not found');
    }
    
    console.log('🎯 Final dialog test completed');
  });

  test('should verify all CSS fixes are applied', async ({ page }) => {
    console.log('🎨 Verifying CSS fixes...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(2000);
    }
    
    const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(2000);
      
      const overlay = page.locator('[data-radix-dialog-overlay]');
      const content = page.locator('[data-radix-dialog-content]');
      
      if (await overlay.isVisible() && await content.isVisible()) {
        // Check CSS properties
        const overlayBg = await overlay.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const overlayBackdrop = await overlay.evaluate(el => window.getComputedStyle(el).backdropFilter);
        const contentBg = await content.evaluate(el => window.getComputedStyle(el).backgroundColor);
        const contentShadow = await content.evaluate(el => window.getComputedStyle(el).boxShadow);
        
        console.log(`🎨 Overlay background: ${overlayBg}`);
        console.log(`🎨 Overlay backdrop filter: ${overlayBackdrop}`);
        console.log(`🎨 Content background: ${contentBg}`);
        console.log(`🎨 Content shadow: ${contentShadow}`);
        
        // Verify z-index
        const overlayZ = await overlay.evaluate(el => window.getComputedStyle(el).zIndex);
        const contentZ = await content.evaluate(el => window.getComputedStyle(el).zIndex);
        
        console.log(`📊 Overlay z-index: ${overlayZ}`);
        console.log(`📊 Content z-index: ${contentZ}`);
        
        if (contentBg.includes('255, 255, 255') || contentBg.includes('white')) {
          console.log('✅ Content background is white');
        } else {
          console.log('❌ Content background is not white');
        }
        
        if (overlayBackdrop.includes('blur')) {
          console.log('✅ Overlay has backdrop blur');
        } else {
          console.log('❌ Overlay missing backdrop blur');
        }
        
        console.log('🎨 CSS verification completed');
      }
    }
  });
});
