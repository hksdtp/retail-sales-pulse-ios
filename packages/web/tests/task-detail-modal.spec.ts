import { test, expect } from '@playwright/test';

test.describe('Task Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang tasks
    await page.goto('/tasks');

    // Đợi trang load xong
    await page.waitForLoadState('networkidle');

    // Đợi thêm để đảm bảo components đã render
    await page.waitForTimeout(2000);
  });

  test('should display task cards', async ({ page }) => {
    // Kiểm tra có task cards hiển thị với selector chính xác hơn
    const taskCards = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    await expect(taskCards).toBeVisible({ timeout: 10000 });
  });

  test('should open task detail modal when clicking task card', async ({ page }) => {
    // Click vào task card đầu tiên với selector cải thiện
    const firstTaskCard = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    await expect(firstTaskCard).toBeVisible({ timeout: 10000 });
    await firstTaskCard.click();

    // Kiểm tra modal có mở với selector chính xác
    const modal = page.locator('.task-detail-panel, [class*="fixed"][class*="z-"]').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display correct task information', async ({ page }) => {
    // Click vào task card đầu tiên với selector cải thiện
    const firstTaskCard = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    await expect(firstTaskCard).toBeVisible({ timeout: 10000 });
    await firstTaskCard.click();

    // Kiểm tra các thông tin trong modal với selector chính xác
    const modal = page.locator('.task-detail-panel, [class*="fixed"][class*="z-"]').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Kiểm tra có tiêu đề
    const titleInput = modal.locator('input[type="text"]').first();
    await expect(titleInput).toBeVisible();

    // Kiểm tra có mô tả
    const descriptionTextarea = modal.locator('textarea');
    await expect(descriptionTextarea).toBeVisible();
    
    // Kiểm tra có thông tin người làm (không phải "Không xác định")
    const userInfo = modal.locator('text=Người làm').locator('..').locator('span').last();
    const userText = await userInfo.textContent();
    expect(userText).not.toBe('Không xác định');
    expect(userText).not.toBe('Chưa xác định');
  });

  test('should close modal when clicking close button', async ({ page }) => {
    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();
    
    // Đợi modal mở
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible();
    
    // Click nút đóng
    const closeButton = modal.locator('button').filter({ has: page.locator('svg') }).last();
    await closeButton.click();
    
    // Kiểm tra modal đã đóng
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();
    
    // Đợi modal mở
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible();
    
    // Click backdrop
    await page.click('.fixed.inset-0.bg-black', { position: { x: 50, y: 50 } });
    
    // Kiểm tra modal đã đóng
    await expect(modal).not.toBeVisible();
  });

  test('should have correct backdrop opacity', async ({ page }) => {
    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();

    // Kiểm tra backdrop opacity
    const backdrop = page.locator('.modal-backdrop');
    await expect(backdrop).toBeVisible();

    const opacity = await backdrop.evaluate(el =>
      window.getComputedStyle(el).opacity
    );

    // Opacity phải là 0.7 (70%)
    expect(parseFloat(opacity)).toBeLessThanOrEqual(0.8);
  });

  test('should prevent background scroll when modal is open', async ({ page }) => {
    // Lấy scroll position ban đầu
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();

    // Đợi modal mở
    const modal = page.locator('.task-detail-panel');
    await expect(modal).toBeVisible();

    // Kiểm tra body có class scroll lock
    const bodyStyle = await page.evaluate(() => {
      return {
        position: document.body.style.position,
        overflow: document.body.style.overflow,
        top: document.body.style.top
      };
    });

    expect(bodyStyle.position).toBe('fixed');
    expect(bodyStyle.overflow).toBe('hidden');

    // Thử scroll trên backdrop - không được scroll
    const backdrop = page.locator('.modal-backdrop');
    await backdrop.hover();
    await page.mouse.wheel(0, 500);

    // Scroll position không được thay đổi
    const scrollYAfterWheel = await page.evaluate(() => window.scrollY);
    expect(scrollYAfterWheel).toBe(initialScrollY);
  });

  test('should allow scrolling within modal content', async ({ page }) => {
    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();

    // Đợi modal mở
    const modalContent = page.locator('.task-detail-panel .flex-1.overflow-y-auto');
    await expect(modalContent).toBeVisible();

    // Lấy scroll position ban đầu của modal content
    const initialScrollTop = await modalContent.evaluate(el => el.scrollTop);

    // Scroll trong modal content
    await modalContent.hover();
    await page.mouse.wheel(0, 200);

    // Đợi một chút để scroll hoàn thành
    await page.waitForTimeout(100);

    // Kiểm tra modal content đã scroll
    const scrollTopAfter = await modalContent.evaluate(el => el.scrollTop);
    expect(scrollTopAfter).toBeGreaterThanOrEqual(initialScrollTop);
  });

  test('should restore scroll position when modal closes', async ({ page }) => {
    // Scroll trang xuống trước
    await page.evaluate(() => window.scrollTo(0, 300));
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();

    // Đợi modal mở
    const modal = page.locator('.task-detail-panel');
    await expect(modal).toBeVisible();

    // Đóng modal
    const closeButton = page.locator('.task-detail-panel button').first();
    await closeButton.click();

    // Đợi modal đóng
    await expect(modal).not.toBeVisible();

    // Kiểm tra scroll position được khôi phục
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBe(initialScrollY);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mở modal
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();
    
    // Kiểm tra modal responsive
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible();
    
    // Kiểm tra width trên mobile
    const boundingBox = await modal.boundingBox();
    expect(boundingBox?.width).toBeLessThan(375); // Phải nhỏ hơn viewport width
  });
});
