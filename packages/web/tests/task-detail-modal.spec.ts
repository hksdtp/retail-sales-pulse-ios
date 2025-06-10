import { test, expect } from '@playwright/test';

test.describe('Task Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang tasks
    await page.goto('/tasks');
    
    // Đợi trang load xong
    await page.waitForLoadState('networkidle');
  });

  test('should display task cards', async ({ page }) => {
    // Kiểm tra có task cards hiển thị
    const taskCards = page.locator('.bg-white.rounded-xl').first();
    await expect(taskCards).toBeVisible();
  });

  test('should open task detail modal when clicking task card', async ({ page }) => {
    // Click vào task card đầu tiên
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();
    
    // Kiểm tra modal có mở
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible();
  });

  test('should display correct task information', async ({ page }) => {
    // Click vào task card đầu tiên
    const firstTaskCard = page.locator('.bg-white.rounded-xl').first();
    await firstTaskCard.click();
    
    // Kiểm tra các thông tin trong modal
    const modal = page.locator('.fixed.z-50').filter({ hasText: 'Chi tiết công việc' });
    await expect(modal).toBeVisible();
    
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
    const backdrop = page.locator('.fixed.inset-0.bg-black');
    await expect(backdrop).toBeVisible();
    
    const opacity = await backdrop.evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    
    // Opacity phải là 0.2 (20%)
    expect(parseFloat(opacity)).toBeLessThanOrEqual(0.3);
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
