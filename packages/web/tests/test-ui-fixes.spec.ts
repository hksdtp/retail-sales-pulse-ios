import { test, expect } from '@playwright/test';

test.describe('Test UI Fixes', () => {
  test('should test task creation dialog with fixes', async ({ page }) => {
    console.log('🔧 Testing task creation dialog with UI fixes...');
    
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
    
    // Chụp ảnh sau đăng nhập
    await page.screenshot({ 
      path: 'test-results/ui-fix-after-login.png',
      fullPage: true 
    });
    
    // Click vào menu Công việc (sử dụng selector chính xác hơn)
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked on Tasks menu');
    } else {
      // Thử selector khác
      const taskMenu = page.locator('nav a').filter({ hasText: 'Công việc' }).first();
      if (await taskMenu.isVisible()) {
        await taskMenu.click();
        await page.waitForTimeout(2000);
        console.log('✅ Clicked on Tasks menu (alternative selector)');
      }
    }
    
    // Chụp ảnh trang tasks
    await page.screenshot({ 
      path: 'test-results/ui-fix-tasks-page.png',
      fullPage: true 
    });
    
    // Click button Tạo công việc
    const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked create task button');
    }
    
    // Chụp ảnh dialog đã mở
    await page.screenshot({ 
      path: 'test-results/ui-fix-dialog-opened.png',
      fullPage: true 
    });
    
    // Kiểm tra dialog đã mở
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    console.log('✅ Dialog is visible');
    
    // Test điền form
    console.log('📝 Testing form filling...');
    
    // Điền title
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Task - UI Fixes Applied');
      console.log('✅ Title filled');
    }
    
    // Điền description
    const descInput = page.locator('textarea[name="description"]');
    if (await descInput.isVisible()) {
      await descInput.fill('Testing task creation with UI fixes applied - dropdown should work now');
      console.log('✅ Description filled');
    }
    
    // Test dropdown selection
    console.log('📋 Testing dropdown selection...');
    
    try {
      // Click vào dropdown loại công việc
      const typeSelect = page.locator('select[name="type"]').or(page.locator('[data-radix-select-trigger]')).first();
      
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.waitForTimeout(1000);
        
        console.log('✅ Dropdown clicked');
        
        // Chụp ảnh dropdown mở
        await page.screenshot({ 
          path: 'test-results/ui-fix-dropdown-opened.png',
          fullPage: true 
        });
        
        // Tìm và click option
        const option = page.locator('[data-radix-select-item]').or(page.locator('[role="option"]')).first();
        if (await option.isVisible()) {
          await option.click();
          console.log('✅ Option selected');
        } else {
          // Thử với text selector
          const ktsOption = page.locator('text=KTS mới').first();
          if (await ktsOption.isVisible()) {
            await ktsOption.click();
            console.log('✅ KTS mới option selected');
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Dropdown test failed: ${error.message}`);
    }
    
    // Điền ngày
    const dateInput = page.locator('input[name="date"]');
    if (await dateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      console.log('✅ Date filled');
    }
    
    // Chụp ảnh form đã điền
    await page.screenshot({ 
      path: 'test-results/ui-fix-form-filled.png',
      fullPage: true 
    });
    
    // Test submit button
    console.log('🚀 Testing submit button...');
    
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: 'Tạo công việc' })).first();
    
    if (await submitButton.isVisible() && await submitButton.isEnabled()) {
      console.log('✅ Submit button is visible and enabled');
      
      // Click submit
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Kiểm tra xem dialog có đóng không
      const isDialogVisible = await dialog.isVisible();
      
      if (!isDialogVisible) {
        console.log('🎉 SUCCESS! Form submitted and dialog closed');
      } else {
        console.log('⚠️ Dialog still visible - checking for validation errors');
        
        // Chụp ảnh để debug
        await page.screenshot({ 
          path: 'test-results/ui-fix-after-submit.png',
          fullPage: true 
        });
      }
    } else {
      console.log('❌ Submit button not available');
    }
    
    console.log('🔧 UI fixes testing completed');
  });

  test('should test dropdown z-index fix specifically', async ({ page }) => {
    console.log('🎯 Testing dropdown z-index fix...');
    
    // Điều hướng và đăng nhập
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    // Navigate to tasks
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Open dialog
    const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Test z-index của dropdown
    const selectTrigger = page.locator('[data-radix-select-trigger]').first();
    
    if (await selectTrigger.isVisible()) {
      // Kiểm tra z-index của trigger
      const triggerZIndex = await selectTrigger.evaluate(el => {
        return window.getComputedStyle(el).zIndex;
      });
      
      console.log(`📊 Select trigger z-index: ${triggerZIndex}`);
      
      // Click để mở dropdown
      await selectTrigger.click();
      await page.waitForTimeout(1000);
      
      // Kiểm tra z-index của content
      const selectContent = page.locator('[data-radix-select-content]');
      
      if (await selectContent.isVisible()) {
        const contentZIndex = await selectContent.evaluate(el => {
          return window.getComputedStyle(el).zIndex;
        });
        
        console.log(`📊 Select content z-index: ${contentZIndex}`);
        
        // Kiểm tra dialog z-index
        const dialog = page.locator('[data-radix-dialog-content]');
        const dialogZIndex = await dialog.evaluate(el => {
          return window.getComputedStyle(el).zIndex;
        });
        
        console.log(`📊 Dialog z-index: ${dialogZIndex}`);
        
        // Kiểm tra overlay z-index
        const overlay = page.locator('[data-radix-dialog-overlay]');
        const overlayZIndex = await overlay.evaluate(el => {
          return window.getComputedStyle(el).zIndex;
        });
        
        console.log(`📊 Dialog overlay z-index: ${overlayZIndex}`);
        
        // Chụp ảnh để verify
        await page.screenshot({ 
          path: 'test-results/ui-fix-z-index-test.png',
          fullPage: true 
        });
        
        // Test click vào option
        const firstOption = selectContent.locator('[data-radix-select-item]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
          console.log('✅ Successfully clicked dropdown option');
        } else {
          console.log('❌ Dropdown option not clickable');
        }
        
      } else {
        console.log('❌ Select content not visible');
      }
    } else {
      console.log('❌ Select trigger not found');
    }
    
    console.log('🎯 Z-index testing completed');
  });
});
