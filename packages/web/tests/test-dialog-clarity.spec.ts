import { test, expect } from '@playwright/test';

test.describe('Test Dialog Clarity Fix', () => {
  test('should test dialog visibility and clarity', async ({ page }) => {
    console.log('🔍 Testing dialog clarity and visibility...');
    
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
    
    // Chụp ảnh trước khi mở dialog
    await page.screenshot({ 
      path: 'test-results/clarity-before-dialog.png',
      fullPage: true 
    });
    
    // Open dialog
    const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked create task button');
    }
    
    // Chụp ảnh sau khi mở dialog
    await page.screenshot({ 
      path: 'test-results/clarity-dialog-opened.png',
      fullPage: true 
    });
    
    // Kiểm tra dialog visibility
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();
    console.log('✅ Dialog is visible');
    
    // Kiểm tra overlay
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
    console.log('✅ Overlay is visible');
    
    // Test form elements visibility
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();
    console.log('✅ Title input is visible');
    
    const descInput = page.locator('textarea[name="description"]');
    await expect(descInput).toBeVisible();
    console.log('✅ Description input is visible');
    
    // Test select dropdown
    const selectTrigger = page.locator('[data-radix-select-trigger]').first();
    await expect(selectTrigger).toBeVisible();
    console.log('✅ Select trigger is visible');
    
    // Test form interaction
    console.log('📝 Testing form interaction...');
    
    // Fill title
    await titleInput.fill('Test Dialog Clarity');
    console.log('✅ Title filled');
    
    // Fill description
    await descInput.fill('Testing dialog clarity after fixes');
    console.log('✅ Description filled');
    
    // Test dropdown click
    await selectTrigger.click();
    await page.waitForTimeout(1000);
    
    // Chụp ảnh dropdown mở
    await page.screenshot({ 
      path: 'test-results/clarity-dropdown-opened.png',
      fullPage: true 
    });
    
    // Check if dropdown content is visible
    const selectContent = page.locator('[data-radix-select-content]');
    if (await selectContent.isVisible()) {
      console.log('✅ Dropdown content is visible');
      
      // Click first option
      const firstOption = selectContent.locator('[data-radix-select-item]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        console.log('✅ Selected dropdown option');
      }
    } else {
      console.log('❌ Dropdown content not visible');
    }
    
    // Fill date
    const dateInput = page.locator('input[name="date"]');
    if (await dateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      console.log('✅ Date filled');
    }
    
    // Chụp ảnh form hoàn chỉnh
    await page.screenshot({ 
      path: 'test-results/clarity-form-complete.png',
      fullPage: true 
    });
    
    // Test submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    console.log('✅ Submit button is visible and enabled');
    
    // Test close dialog
    const closeButton = page.locator('[data-radix-dialog-close]').or(page.locator('button').filter({ hasText: 'Hủy bỏ' })).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(2000);
      
      // Verify dialog closed
      const isDialogVisible = await dialog.isVisible();
      if (!isDialogVisible) {
        console.log('✅ Dialog closed successfully');
      } else {
        console.log('❌ Dialog still visible after close');
      }
    }
    
    console.log('🔍 Dialog clarity testing completed');
  });

  test('should test CSS z-index layers', async ({ page }) => {
    console.log('📊 Testing CSS z-index layers...');
    
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
    }
    
    // Check z-index values
    const overlay = page.locator('[data-radix-dialog-overlay]');
    const content = page.locator('[data-radix-dialog-content]');
    
    if (await overlay.isVisible() && await content.isVisible()) {
      const overlayZIndex = await overlay.evaluate(el => window.getComputedStyle(el).zIndex);
      const contentZIndex = await content.evaluate(el => window.getComputedStyle(el).zIndex);
      
      console.log(`📊 Overlay z-index: ${overlayZIndex}`);
      console.log(`📊 Content z-index: ${contentZIndex}`);
      
      // Check background colors
      const overlayBg = await overlay.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const contentBg = await content.evaluate(el => window.getComputedStyle(el).backgroundColor);
      
      console.log(`🎨 Overlay background: ${overlayBg}`);
      console.log(`🎨 Content background: ${contentBg}`);
      
      // Test select dropdown z-index
      const selectTrigger = page.locator('[data-radix-select-trigger]').first();
      if (await selectTrigger.isVisible()) {
        await selectTrigger.click();
        await page.waitForTimeout(1000);
        
        const selectContent = page.locator('[data-radix-select-content]');
        if (await selectContent.isVisible()) {
          const selectZIndex = await selectContent.evaluate(el => window.getComputedStyle(el).zIndex);
          console.log(`📊 Select dropdown z-index: ${selectZIndex}`);
          
          // Verify z-index hierarchy
          const overlayZ = parseInt(overlayZIndex);
          const contentZ = parseInt(contentZIndex);
          const selectZ = parseInt(selectZIndex);
          
          if (selectZ > contentZ && contentZ > overlayZ) {
            console.log('✅ Z-index hierarchy is correct');
          } else {
            console.log('❌ Z-index hierarchy needs adjustment');
          }
        }
      }
    }
    
    console.log('📊 Z-index testing completed');
  });
});
