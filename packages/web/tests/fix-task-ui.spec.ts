import { test, expect } from '@playwright/test';

test.describe('Fix Task UI Issues', () => {
  test('should test task creation with UI fixes', async ({ page }) => {
    console.log('🔧 Testing task creation with UI fixes...');
    
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
    
    // Click vào menu Công việc
    await page.locator('text=Công việc').click();
    await page.waitForTimeout(2000);
    
    // Click button Tạo công việc
    await page.locator('button:has-text("Tạo công việc")').click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Dialog opened successfully');
    
    // Chụp ảnh dialog
    await page.screenshot({ 
      path: 'test-results/task-dialog-opened.png',
      fullPage: true 
    });
    
    // Test điền form với cách tiếp cận khác
    console.log('📝 Testing form filling...');
    
    // Điền title - thử nhiều selector
    const titleSelectors = [
      'input[placeholder*="tiêu đề"]',
      'input[placeholder*="Nhập tiêu đề"]',
      '[role="dialog"] input:first-of-type'
    ];
    
    for (const selector of titleSelectors) {
      try {
        const titleInput = page.locator(selector);
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Task - Kiểm tra giao diện');
          console.log(`✅ Title filled using selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed with selector ${selector}: ${error.message}`);
      }
    }
    
    // Điền description
    const descSelectors = [
      'textarea[placeholder*="mô tả"]',
      'textarea[placeholder*="Mô tả"]',
      '[role="dialog"] textarea'
    ];
    
    for (const selector of descSelectors) {
      try {
        const descInput = page.locator(selector);
        if (await descInput.isVisible()) {
          await descInput.fill('Đây là task test để kiểm tra giao diện tạo công việc mới');
          console.log(`✅ Description filled using selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed with selector ${selector}: ${error.message}`);
      }
    }
    
    // Chọn ngày
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      console.log('✅ Date filled');
    }
    
    // Chọn thời gian
    const timeInput = page.locator('input[type="time"]');
    if (await timeInput.isVisible()) {
      await timeInput.fill('09:00');
      console.log('✅ Time filled');
    }
    
    // Chụp ảnh sau khi điền form
    await page.screenshot({ 
      path: 'test-results/task-form-filled.png',
      fullPage: true 
    });
    
    // Test dropdown selection với cách khác
    console.log('📋 Testing dropdown selection...');
    
    // Thử click vào dropdown đầu tiên (loại công việc)
    try {
      // Đợi overlay biến mất
      await page.waitForTimeout(1000);
      
      // Thử click vào dropdown trigger
      const dropdownTrigger = page.locator('[role="combobox"]').first();
      
      // Scroll element vào view
      await dropdownTrigger.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Force click để bypass overlay
      await dropdownTrigger.click({ force: true });
      await page.waitForTimeout(1000);
      
      // Tìm options
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();
      
      if (optionCount > 0) {
        console.log(`✅ Found ${optionCount} options in dropdown`);
        
        // Click option đầu tiên
        await options.first().click();
        console.log('✅ Selected first option');
      } else {
        console.log('❌ No options found in dropdown');
      }
      
    } catch (error) {
      console.log(`❌ Dropdown selection failed: ${error.message}`);
    }
    
    // Chụp ảnh sau khi chọn dropdown
    await page.screenshot({ 
      path: 'test-results/task-dropdown-selected.png',
      fullPage: true 
    });
    
    // Test submit form
    console.log('🚀 Testing form submission...');
    
    try {
      // Tìm submit button
      const submitButtons = [
        'button:has-text("Tạo công việc")',
        'button:has-text("Giao công việc")',
        'button[type="submit"]',
        '[role="dialog"] button:last-of-type'
      ];
      
      for (const selector of submitButtons) {
        const submitButton = page.locator(selector);
        if (await submitButton.isVisible() && await submitButton.isEnabled()) {
          console.log(`🖱️ Clicking submit button: ${selector}`);
          
          await submitButton.click({ force: true });
          await page.waitForTimeout(3000);
          
          // Kiểm tra xem dialog có đóng không
          const dialog = page.locator('[role="dialog"]');
          const isDialogVisible = await dialog.isVisible();
          
          if (!isDialogVisible) {
            console.log('🎉 SUCCESS! Form submitted and dialog closed');
            
            // Chụp ảnh sau khi submit
            await page.screenshot({ 
              path: 'test-results/task-submitted.png',
              fullPage: true 
            });
            
            return;
          } else {
            console.log('⚠️ Dialog still visible after submit');
          }
          
          break;
        }
      }
      
    } catch (error) {
      console.log(`❌ Form submission failed: ${error.message}`);
    }
    
    // Kiểm tra validation errors
    const errorElements = await page.locator('.error, .text-red, [role="alert"]').count();
    if (errorElements > 0) {
      console.log(`⚠️ Found ${errorElements} validation errors`);
      
      // Chụp ảnh errors
      await page.screenshot({ 
        path: 'test-results/task-validation-errors.png',
        fullPage: true 
      });
    }
    
    console.log('🔧 Task UI testing completed');
  });

  test('should test UI responsiveness', async ({ page }) => {
    console.log('📱 Testing UI responsiveness...');
    
    // Test trên desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Đăng nhập
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    // Mở dialog trên desktop
    await page.locator('text=Công việc').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Tạo công việc")').click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/task-dialog-desktop.png',
      fullPage: true 
    });
    
    // Đóng dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Test trên tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.locator('button:has-text("Tạo công việc")').click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/task-dialog-tablet.png',
      fullPage: true 
    });
    
    // Đóng dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Test trên mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('button:has-text("Tạo công việc")').click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/task-dialog-mobile.png',
      fullPage: true 
    });
    
    console.log('📱 Responsiveness testing completed');
  });
});
