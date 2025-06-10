import { test, expect } from '@playwright/test';

test.describe('Notification Center', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang chính
    await page.goto('/');
    
    // Đợi trang load xong
    await page.waitForLoadState('networkidle');
  });

  test('should display notification bell', async ({ page }) => {
    // Kiểm tra notification bell có hiển thị
    const notificationBell = page.locator('button:has(svg)').filter({ hasText: /bell/i }).first();
    await expect(notificationBell).toBeVisible();
  });

  test('should open notification panel when clicking bell', async ({ page }) => {
    // Click vào notification bell
    const notificationBell = page.locator('button').filter({ has: page.locator('svg') }).first();
    await notificationBell.click();
    
    // Kiểm tra notification panel có mở
    const notificationPanel = page.locator('[data-notification="center"]');
    await expect(notificationPanel).toBeVisible();
  });

  test('should close notification panel when clicking outside', async ({ page }) => {
    // Mở notification panel
    const notificationBell = page.locator('button').filter({ has: page.locator('svg') }).first();
    await notificationBell.click();
    
    // Đợi panel mở
    const notificationPanel = page.locator('[data-notification="center"]');
    await expect(notificationPanel).toBeVisible();
    
    // Click outside để đóng
    await page.click('body', { position: { x: 100, y: 100 } });
    
    // Kiểm tra panel đã đóng
    await expect(notificationPanel).not.toBeVisible();
  });

  test('should have correct z-index for notification panel', async ({ page }) => {
    // Mở notification panel
    const notificationBell = page.locator('button').filter({ has: page.locator('svg') }).first();
    await notificationBell.click();
    
    // Kiểm tra z-index
    const notificationPanel = page.locator('[data-notification="center"]');
    await expect(notificationPanel).toBeVisible();
    
    const zIndex = await notificationPanel.evaluate(el => 
      window.getComputedStyle(el).zIndex
    );
    
    // Z-index phải là một số lớn
    expect(parseInt(zIndex)).toBeGreaterThan(999999);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mở notification panel
    const notificationBell = page.locator('button').filter({ has: page.locator('svg') }).first();
    await notificationBell.click();
    
    // Kiểm tra panel responsive
    const notificationPanel = page.locator('[data-notification="center"]');
    await expect(notificationPanel).toBeVisible();
    
    // Kiểm tra width trên mobile
    const boundingBox = await notificationPanel.boundingBox();
    expect(boundingBox?.width).toBeLessThan(375); // Phải nhỏ hơn viewport width
  });
});
