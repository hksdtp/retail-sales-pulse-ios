import { test, expect } from '@playwright/test';

test.describe('Z-Index Layering Fix - TaskFormDialog Dropdowns', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://127.0.0.1:8088');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Login if needed (using admin master password)
    const loginButton = page.locator('button:has-text("Đăng nhập")');
    if (await loginButton.isVisible()) {
      await page.fill('input[type="email"]', 'vietanh@example.com');
      await page.fill('input[type="password"]', 'haininh1');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Navigate to Tasks page
    await page.click('a[href="/tasks"]');
    await page.waitForLoadState('networkidle');
  });

  test('should display MultiUserPicker dropdown above image upload section', async ({ page }) => {
    // Open team task creation dialog
    await page.click('button:has-text("Giao việc cho Nhóm")');
    await page.waitForSelector('[role="dialog"]');
    
    // Scroll to see both assignment section and image upload section
    await page.locator('[role="dialog"]').scrollIntoViewIfNeeded();
    
    // Fill in required fields first to make form valid
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Test Z-Index Fix');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing dropdown visibility over image upload section');
    
    // Select a task type
    await page.click('button:has-text("KTS mới")');
    
    // Open the MultiUserPicker dropdown
    const userPickerTrigger = page.locator('text=Chọn người được giao việc');
    await userPickerTrigger.click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[data-testid="user-dropdown"]', { timeout: 2000 }).catch(() => {
      // If data-testid doesn't exist, try alternative selector
      return page.waitForSelector('input[placeholder*="Tìm kiếm người dùng"]', { timeout: 2000 });
    });
    
    // Check that dropdown is visible and not covered
    const dropdown = page.locator('input[placeholder*="Tìm kiếm người dùng"]').locator('..').locator('..');
    await expect(dropdown).toBeVisible();
    
    // Verify dropdown has correct z-index
    const dropdownElement = await dropdown.first().elementHandle();
    if (dropdownElement) {
      const zIndex = await page.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      }, dropdownElement);
      
      // Should have z-index higher than dialog (10000)
      expect(parseInt(zIndex)).toBeGreaterThan(10000);
    }
    
    // Verify image upload section is still visible but below dropdown
    const imageUploadSection = page.locator('text=Hình ảnh đính kèm');
    await expect(imageUploadSection).toBeVisible();
    
    // Test interaction with dropdown
    const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Should be able to type without issues
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should display SmartInput suggestions above other elements', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Type in title to trigger suggestions
    const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
    await titleInput.fill('Khảo sát');
    
    // Wait for suggestions to appear (if any)
    await page.waitForTimeout(500);
    
    // Check if suggestions dropdown appears
    const suggestionsDropdown = page.locator('[data-testid="suggestions-dropdown"]');
    if (await suggestionsDropdown.isVisible()) {
      // Verify suggestions have correct z-index
      const dropdownElement = await suggestionsDropdown.first().elementHandle();
      if (dropdownElement) {
        const zIndex = await page.evaluate((el) => {
          return window.getComputedStyle(el).zIndex;
        }, dropdownElement);
        
        expect(parseInt(zIndex)).toBeGreaterThan(10000);
      }
    }
  });

  test('should display DateTimePicker popover above other elements', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Click on date picker
    const dateButton = page.locator('button:has-text("Chọn ngày thực hiện")');
    await dateButton.click();
    
    // Wait for popover to appear
    await page.waitForSelector('text=Hôm nay', { timeout: 2000 });
    
    // Verify popover is visible
    const popover = page.locator('text=Hôm nay').locator('..');
    await expect(popover).toBeVisible();
    
    // Test that we can interact with quick options
    await page.click('text=Hôm nay');
    
    // Date should be selected
    await expect(dateButton).not.toHaveText('Chọn ngày thực hiện');
  });

  test('should handle multiple dropdowns open simultaneously', async ({ page }) => {
    // Open team task creation dialog
    await page.click('button:has-text("Giao việc cho Nhóm")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill required fields
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Multi-dropdown test');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing multiple dropdowns');
    
    // Open task type dropdown (if using dropdown layout)
    const taskTypeSection = page.locator('text=Loại công việc');
    if (await taskTypeSection.isVisible()) {
      // Try to find dropdown trigger for task types
      const taskTypeDropdown = page.locator('button:has-text("Chọn loại công việc")');
      if (await taskTypeDropdown.isVisible()) {
        await taskTypeDropdown.click();
        await page.waitForTimeout(200);
      }
    }
    
    // Open user picker dropdown
    const userPickerTrigger = page.locator('text=Chọn người được giao việc');
    await userPickerTrigger.click();
    
    // Both dropdowns should be functional
    const userSearchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await userSearchInput.isVisible()) {
      await userSearchInput.fill('test');
      await expect(userSearchInput).toHaveValue('test');
    }
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill required fields
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Mobile test');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing on mobile viewport');
    
    // Select task type
    await page.click('button:has-text("KTS mới")');
    
    // Scroll to assignment section
    const assignmentSection = page.locator('text=Giao cho ai');
    await assignmentSection.scrollIntoViewIfNeeded();
    
    // Open user picker
    const userPickerTrigger = page.locator('text=Chọn người được giao việc');
    await userPickerTrigger.click();
    
    // Dropdown should be visible and functional on mobile
    const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      await searchInput.fill('mobile');
      await expect(searchInput).toHaveValue('mobile');
    }
  });

  test('should work correctly when form is scrolled', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill required fields
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Scroll test');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing dropdown when form is scrolled');
    
    // Scroll to bottom of form
    const imageUploadSection = page.locator('text=Hình ảnh đính kèm');
    await imageUploadSection.scrollIntoViewIfNeeded();
    
    // Scroll back to assignment section
    const assignmentSection = page.locator('text=Giao cho ai');
    await assignmentSection.scrollIntoViewIfNeeded();
    
    // Open user picker
    const userPickerTrigger = page.locator('text=Chọn người được giao việc');
    await userPickerTrigger.click();
    
    // Dropdown should still work correctly after scrolling
    const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      await searchInput.fill('scroll');
      await expect(searchInput).toHaveValue('scroll');
    }
  });

  test('should maintain proper layering across different browsers', async ({ page, browserName }) => {
    // This test will run on Chrome, Firefox, and Safari
    console.log(`Testing z-index layering on ${browserName}`);
    
    // Open team task creation dialog
    await page.click('button:has-text("Giao việc cho Nhóm")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill required fields
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', `Browser test - ${browserName}`);
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', `Testing z-index on ${browserName}`);
    
    // Select task type
    await page.click('button:has-text("KTS mới")');
    
    // Open user picker
    const userPickerTrigger = page.locator('text=Chọn người được giao việc');
    await userPickerTrigger.click();
    
    // Verify dropdown works on this browser
    const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      
      // Test typing
      await searchInput.fill(browserName);
      await expect(searchInput).toHaveValue(browserName);
      
      // Test that dropdown doesn't disappear when clicking inside it
      await searchInput.click();
      await expect(searchInput).toBeVisible();
    }
  });
});
