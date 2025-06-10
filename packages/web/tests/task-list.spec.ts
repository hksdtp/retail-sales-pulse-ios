import { test, expect } from '@playwright/test';

test.describe('Task List', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang tasks
    await page.goto('/tasks');
    
    // Đợi trang load xong
    await page.waitForLoadState('networkidle');
  });

  test('should display task list', async ({ page }) => {
    // Kiểm tra có task list hiển thị
    const taskList = page.locator('.space-y-6');
    await expect(taskList).toBeVisible();
  });

  test('should display task cards with correct information', async ({ page }) => {
    // Kiểm tra task cards
    const taskCards = page.locator('.bg-white.rounded-xl');
    await expect(taskCards.first()).toBeVisible();
    
    // Kiểm tra mỗi card có đầy đủ thông tin
    const firstCard = taskCards.first();
    
    // Kiểm tra có tiêu đề
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();
    
    // Kiểm tra có mô tả
    const description = firstCard.locator('.text-sm.text-gray-600');
    await expect(description).toBeVisible();
    
    // Kiểm tra có thông tin ngày
    const dateInfo = firstCard.locator('svg + span').first();
    await expect(dateInfo).toBeVisible();
    
    // Kiểm tra có thông tin người làm (không phải "Không xác định")
    const userInfo = firstCard.locator('.flex.items-center.text-gray-600').last().locator('span');
    const userText = await userInfo.textContent();
    expect(userText).not.toBe('Không xác định');
    expect(userText).not.toBe('Chưa xác định');
  });

  test('should display task progress correctly', async ({ page }) => {
    // Kiểm tra progress bar
    const firstCard = page.locator('.bg-white.rounded-xl').first();
    const progressSection = firstCard.locator('.bg-gray-50.rounded-lg.p-3').last();
    
    await expect(progressSection).toBeVisible();
    
    // Kiểm tra có text "Tiến độ:"
    await expect(progressSection.locator('text=Tiến độ:')).toBeVisible();
    
    // Kiểm tra có phần trăm
    const percentage = progressSection.locator('.text-sm.font-bold.text-blue-600');
    await expect(percentage).toBeVisible();
    
    const percentageText = await percentage.textContent();
    expect(percentageText).toMatch(/\d+%/);
  });

  test('should have hover effects on task cards', async ({ page }) => {
    const firstCard = page.locator('.bg-white.rounded-xl').first();
    
    // Hover vào card
    await firstCard.hover();
    
    // Kiểm tra có transform scale
    const transform = await firstCard.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Transform không phải 'none' khi hover
    expect(transform).not.toBe('none');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    const taskCards = page.locator('.bg-white.rounded-xl');
    await expect(taskCards.first()).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(taskCards.first()).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(taskCards.first()).toBeVisible();
  });

  test('should display task groups with statistics', async ({ page }) => {
    // Kiểm tra task group header
    const groupHeader = page.locator('.flex.flex-col.sm\\:flex-row').first();
    await expect(groupHeader).toBeVisible();
    
    // Kiểm tra có tiêu đề nhóm
    const groupTitle = groupHeader.locator('h3');
    await expect(groupTitle).toBeVisible();
    
    // Kiểm tra có thống kê (Hoàn thành, Đang làm, Còn lại)
    await expect(groupHeader.locator('text=Hoàn thành:')).toBeVisible();
    await expect(groupHeader.locator('text=Đang làm:')).toBeVisible();
    await expect(groupHeader.locator('text=Còn lại:')).toBeVisible();
    
    // Kiểm tra có progress bar
    const progressBar = groupHeader.locator('.w-24.h-2.bg-gray-200');
    await expect(progressBar).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Nếu không có tasks, kiểm tra empty state
    const taskCards = page.locator('.bg-white.rounded-xl');
    const cardCount = await taskCards.count();
    
    if (cardCount === 0) {
      // Kiểm tra empty state message
      const emptyState = page.locator('text=Không có công việc nào');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should display task type badges correctly', async ({ page }) => {
    const firstCard = page.locator('.bg-white.rounded-xl').first();
    
    // Kiểm tra có badge loại công việc
    const typeBadge = firstCard.locator('.mb-2.flex.items-center.justify-between').first().locator('span').first();
    await expect(typeBadge).toBeVisible();
    
    // Badge phải có màu sắc (background color)
    const backgroundColor = await typeBadge.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
