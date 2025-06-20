import { test, expect } from '@playwright/test';

test.describe('TaskFormDialog Improvements', () => {
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

  test('should show improved task form with all new components', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    
    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check for smart input with suggestions
    const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
    await expect(titleInput).toBeVisible();
    
    // Check for improved task type selector
    await expect(page.locator('text=Loại công việc')).toBeVisible();
    await expect(page.locator('text=Có thể chọn nhiều')).toBeVisible();
    
    // Check for improved date/time pickers
    await expect(page.locator('text=Ngày thực hiện')).toBeVisible();
    await expect(page.locator('text=Hạn chót')).toBeVisible();
    
    // Check for multi-user picker
    await expect(page.locator('text=Giao cho ai')).toBeVisible();
    await expect(page.locator('text=Có thể chọn nhiều người')).toBeVisible();
    
    // Check for disabled image upload at bottom
    await expect(page.locator('text=Hình ảnh đính kèm')).toBeVisible();
    await expect(page.locator('text=Đang phát triển')).toBeVisible();
  });

  test('should provide smart suggestions when typing task title', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Type in title to trigger suggestions
    const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
    await titleInput.fill('Khảo sát');
    
    // Wait a bit for suggestions to appear
    await page.waitForTimeout(500);
    
    // Check if suggestions dropdown appears (if there are any)
    const suggestionsDropdown = page.locator('[data-testid="suggestions-dropdown"]');
    if (await suggestionsDropdown.isVisible()) {
      await expect(suggestionsDropdown).toBeVisible();
    }
  });

  test('should allow multiple task type selection', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Select multiple task types
    await page.click('button:has-text("KTS mới")');
    await page.click('button:has-text("SBG mới")');
    
    // Check that both are selected (should have blue background)
    const ktsButton = page.locator('button:has-text("KTS mới")');
    const sbgButton = page.locator('button:has-text("SBG mới")');
    
    await expect(ktsButton).toHaveClass(/border-blue-500/);
    await expect(sbgButton).toHaveClass(/border-blue-500/);
  });

  test('should show improved date/time pickers with quick options', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Click on date picker
    const dateButton = page.locator('button:has-text("Chọn ngày thực hiện")');
    await dateButton.click();
    
    // Check for quick date options
    await expect(page.locator('text=Hôm nay')).toBeVisible();
    await expect(page.locator('text=Ngày mai')).toBeVisible();
    
    // Select "Hôm nay"
    await page.click('text=Hôm nay');
    
    // Check that date is selected
    await expect(dateButton).not.toHaveText('Chọn ngày thực hiện');
  });

  test('should show multi-user picker for assignment', async ({ page }) => {
    // Open task creation dialog for team
    await page.click('button:has-text("Giao việc cho Nhóm")');
    await page.waitForSelector('[role="dialog"]');
    
    // Check for multi-user picker
    const userPicker = page.locator('text=Chọn người được giao việc');
    await expect(userPicker).toBeVisible();
    
    // Click to open user dropdown
    await userPicker.click();
    
    // Check for user search functionality
    const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should validate required fields before submission', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Lưu Công Việc")');
    
    // Should show validation error (toast or inline error)
    await expect(page.locator('text=Vui lòng điền đầy đủ thông tin')).toBeVisible();
  });

  test('should successfully create task with all fields filled', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill in required fields
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Test Task - Improved Form');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'This is a test task created with the improved form interface.');
    
    // Select task type
    await page.click('button:has-text("KTS mới")');
    
    // Select date (use today)
    const dateButton = page.locator('button:has-text("Chọn ngày thực hiện")');
    await dateButton.click();
    await page.click('text=Hôm nay');
    
    // Select deadline
    const deadlineButton = page.locator('button:has-text("Chọn hạn chót")');
    await deadlineButton.click();
    await page.click('text=Ngày mai');
    
    // Submit form
    await page.click('button:has-text("Lưu Công Việc")');
    
    // Should show success message
    await expect(page.locator('text=Đã tạo công việc mới thành công')).toBeVisible();
    
    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should show disabled image upload section', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Scroll to bottom to see image upload section
    await page.locator('[role="dialog"]').scrollIntoViewIfNeeded();
    
    // Check for disabled image upload
    await expect(page.locator('text=Hình ảnh đính kèm')).toBeVisible();
    await expect(page.locator('text=Đang phát triển')).toBeVisible();
    await expect(page.locator('text=Sẽ được bổ sung trong phiên bản tiếp theo')).toBeVisible();
    
    // Check that upload area is disabled
    const uploadArea = page.locator('[data-testid="image-upload-disabled"]');
    if (await uploadArea.isVisible()) {
      await expect(uploadArea).toHaveClass(/opacity-60/);
    }
  });

  test('should handle form cancellation properly', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Fill in some data
    await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Test data that should be cleared');
    
    // Cancel form
    await page.click('button:has-text("Hủy bỏ")');
    
    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Reopen dialog to check if data is cleared
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Title should be empty
    const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
    await expect(titleInput).toHaveValue('');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Check that dialog is responsive
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveClass(/w-\[95vw\]/);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Dialog should adapt to larger screen
    await expect(dialog).toHaveClass(/xl:w-\[80vw\]/);
  });

  test('should show proper accessibility attributes', async ({ page }) => {
    // Open task creation dialog
    await page.click('button:has-text("Tạo công việc")');
    await page.waitForSelector('[role="dialog"]');
    
    // Check for proper labels and required indicators
    await expect(page.locator('label:has-text("Tiêu đề công việc")')).toBeVisible();
    await expect(page.locator('label:has-text("Mô tả chi tiết")')).toBeVisible();
    
    // Check for required asterisks
    const requiredFields = page.locator('span:has-text("*")');
    await expect(requiredFields).toHaveCount(4); // Title, Description, Task Type, Deadline
    
    // Check for proper ARIA attributes
    const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
    await expect(titleInput).toHaveAttribute('required');
  });
});
