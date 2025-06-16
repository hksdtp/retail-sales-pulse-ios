import { test, expect } from '@playwright/test';

test.describe('Task Form Dialog - Giao diện tạo công việc mới', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8088');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Kiểm tra dialog mở và đóng', async ({ page }) => {
    // Tìm và click nút tạo công việc mới
    const createTaskButton = page.locator('button:has-text("Tạo công việc")').first();
    await expect(createTaskButton).toBeVisible();
    await createTaskButton.click();

    // Kiểm tra dialog xuất hiện
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();

    // Kiểm tra tiêu đề dialog
    await expect(page.locator('text=Tạo công việc mới')).toBeVisible();

    // Đóng dialog bằng nút Hủy bỏ
    await page.locator('button:has-text("Hủy bỏ")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('Kiểm tra kích thước dialog responsive', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();

    // Kiểm tra dialog sử dụng đúng kích thước
    const dialogBox = await dialog.boundingBox();
    const viewport = page.viewportSize();
    
    if (viewport) {
      // Dialog phải sử dụng ít nhất 85% chiều rộng màn hình
      expect(dialogBox?.width).toBeGreaterThan(viewport.width * 0.85);
      
      // Dialog phải sử dụng ít nhất 80% chiều cao màn hình
      expect(dialogBox?.height).toBeGreaterThan(viewport.height * 0.80);
    }
  });

  test('Kiểm tra tất cả các trường bắt buộc', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Kiểm tra các trường bắt buộc có dấu *
    await expect(page.locator('label:has-text("Tiêu đề công việc *")')).toBeVisible();
    await expect(page.locator('label:has-text("Mô tả chi tiết *")')).toBeVisible();
    await expect(page.locator('label:has-text("Loại công việc *")')).toBeVisible();
    await expect(page.locator('label:has-text("Ngày thực hiện *")')).toBeVisible();
    await expect(page.locator('label:has-text("Hạn chót *")')).toBeVisible();
    await expect(page.locator('label:has-text("Phạm vi chia sẻ *")')).toBeVisible();
  });

  test('Kiểm tra layout 3 cột cho thời gian', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Kiểm tra 3 trường thời gian nằm trên cùng một hàng (desktop)
    const dateField = page.locator('label:has-text("Ngày thực hiện")').locator('..');
    const deadlineField = page.locator('label:has-text("Hạn chót")').locator('..');
    const timeField = page.locator('label:has-text("Thời gian")').locator('..');
    
    await expect(dateField).toBeVisible();
    await expect(deadlineField).toBeVisible();
    await expect(timeField).toBeVisible();
    
    // Kiểm tra chúng có cùng vị trí Y (nằm trên cùng hàng)
    const dateBox = await dateField.boundingBox();
    const deadlineBox = await deadlineField.boundingBox();
    const timeBox = await timeField.boundingBox();
    
    if (dateBox && deadlineBox && timeBox) {
      // Cho phép sai lệch 50px
      expect(Math.abs(dateBox.y - deadlineBox.y)).toBeLessThan(50);
      expect(Math.abs(deadlineBox.y - timeBox.y)).toBeLessThan(50);
    }
  });

  test('Kiểm tra layout 2 cột cho Assignment và Visibility', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Kiểm tra phần Phạm vi chia sẻ
    const visibilityField = page.locator('label:has-text("Phạm vi chia sẻ")').locator('..');
    await expect(visibilityField).toBeVisible();
    
    // Kiểm tra các nút visibility
    await expect(page.locator('button:has-text("Cá nhân")')).toBeVisible();
    await expect(page.locator('button:has-text("Nhóm")')).toBeVisible();
    await expect(page.locator('button:has-text("Chung")')).toBeVisible();
  });

  test('Kiểm tra chức năng nhập liệu cơ bản', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Nhập tiêu đề
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Test Task Title');
    await expect(titleInput).toHaveValue('Test Task Title');
    
    // Nhập mô tả
    const descInput = page.locator('textarea[name="description"]');
    await descInput.fill('Test task description');
    await expect(descInput).toHaveValue('Test task description');
    
    // Chọn loại công việc
    await page.locator('button:has-text("Công việc khác")').click();
    await expect(page.locator('button:has-text("Công việc khác")')).toHaveClass(/border-blue-500/);
  });

  test('Kiểm tra date picker hoạt động', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Click vào date picker cho ngày thực hiện
    await page.locator('button:has-text("Chọn ngày thực hiện")').click();
    
    // Kiểm tra calendar xuất hiện
    const calendar = page.locator('[role="dialog"]:has([role="grid"])');
    await expect(calendar).toBeVisible();
    
    // Click vào một ngày
    await page.locator('[role="gridcell"]:not([aria-disabled="true"])').first().click();
    
    // Kiểm tra calendar đóng
    await expect(calendar).not.toBeVisible();
  });

  test('Kiểm tra validation form', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Thử submit form trống
    const submitButton = page.locator('button:has-text("Tạo công việc")').last();
    
    // Nút submit phải bị disable khi form trống
    await expect(submitButton).toBeDisabled();
    
    // Điền một số trường
    await page.locator('input[name="title"]').fill('Test');
    await page.locator('textarea[name="description"]').fill('Test desc');
    
    // Nút vẫn phải disable vì thiếu các trường bắt buộc khác
    await expect(submitButton).toBeDisabled();
  });

  test('Kiểm tra dark theme', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();
    
    // Kiểm tra dialog có class dark theme
    await expect(dialog).toHaveAttribute('data-theme-aware', 'true');
  });

  test('Kiểm tra responsive trên mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();
    
    // Trên mobile, các trường phải stack vertically
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThan(400); // Mobile width
  });

  test('Kiểm tra scroll behavior', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Kiểm tra scroll container
    const scrollContainer = page.locator('.custom-scrollbar');
    await expect(scrollContainer).toBeVisible();
    
    // Scroll xuống cuối form
    await scrollContainer.evaluate(el => el.scrollTop = el.scrollHeight);
    
    // Kiểm tra có thể thấy nút submit
    await expect(page.locator('button:has-text("Tạo công việc")').last()).toBeVisible();
  });

  test('Kiểm tra accessibility', async ({ page }) => {
    // Mở dialog
    await page.locator('button:has-text("Tạo công việc")').first().click();
    
    // Kiểm tra dialog có đúng ARIA attributes
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toHaveAttribute('role', 'dialog');
    
    // Kiểm tra focus management
    await expect(page.locator('input[name="title"]')).toBeFocused();
    
    // Kiểm tra labels có for attributes
    const titleLabel = page.locator('label:has-text("Tiêu đề công việc")');
    await expect(titleLabel).toBeVisible();
  });
});
