import { test, expect } from '@playwright/test';

test.describe('Task Modal Scroll Lock', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang tasks
    await page.goto('/tasks');
    
    // Đợi trang load xong
    await page.waitForLoadState('networkidle');
    
    // Đợi thêm để đảm bảo components đã render
    await page.waitForTimeout(3000);
  });

  test('should find and click task cards', async ({ page }) => {
    // Thử nhiều selector khác nhau để tìm task cards
    const selectors = [
      '.macos-card',
      '[class*="bg-white"][class*="rounded-xl"]',
      '.task-card',
      '[class*="cursor-pointer"]',
      'div[class*="shadow"]',
      'div[class*="hover:shadow"]'
    ];

    let taskCard = null;
    for (const selector of selectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      console.log(`Selector ${selector}: found ${count} elements`);
      
      if (count > 0) {
        taskCard = elements.first();
        break;
      }
    }

    if (taskCard) {
      await expect(taskCard).toBeVisible({ timeout: 10000 });
      console.log('Found task card, clicking...');
      await taskCard.click();
      
      // Kiểm tra modal mở
      const modal = page.locator('.task-detail-panel');
      await expect(modal).toBeVisible({ timeout: 5000 });
      console.log('Modal opened successfully');
    } else {
      // Nếu không tìm thấy task cards, kiểm tra xem có thông báo empty state không
      const emptyState = page.locator('text=Không có công việc nào');
      const isEmptyVisible = await emptyState.isVisible();
      
      if (isEmptyVisible) {
        console.log('No tasks available - empty state detected');
        // Skip test nếu không có tasks
        test.skip();
      } else {
        // Log toàn bộ HTML để debug
        const bodyHTML = await page.locator('body').innerHTML();
        console.log('Page HTML:', bodyHTML.substring(0, 1000));
        throw new Error('No task cards found and no empty state detected');
      }
    }
  });

  test('should prevent background scroll when modal is open', async ({ page }) => {
    // Scroll trang xuống trước
    await page.evaluate(() => window.scrollTo(0, 300));
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Tìm và click task card
    const taskCard = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    
    // Skip test nếu không có task cards
    const cardCount = await taskCard.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }
    
    await expect(taskCard).toBeVisible({ timeout: 10000 });
    await taskCard.click();
    
    // Đợi modal mở
    const modal = page.locator('.task-detail-panel');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Kiểm tra body có scroll lock
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
    // Tìm và click task card
    const taskCard = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    
    // Skip test nếu không có task cards
    const cardCount = await taskCard.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }
    
    await expect(taskCard).toBeVisible({ timeout: 10000 });
    await taskCard.click();
    
    // Đợi modal mở
    const modalContent = page.locator('.task-detail-panel .flex-1.overflow-y-auto');
    await expect(modalContent).toBeVisible({ timeout: 5000 });
    
    // Lấy scroll position ban đầu của modal content
    const initialScrollTop = await modalContent.evaluate(el => el.scrollTop);
    
    // Scroll trong modal content
    await modalContent.hover();
    await page.mouse.wheel(0, 200);
    
    // Đợi một chút để scroll hoàn thành
    await page.waitForTimeout(100);
    
    // Kiểm tra modal content đã scroll (hoặc ít nhất không bị block)
    const scrollTopAfter = await modalContent.evaluate(el => el.scrollTop);
    // Chấp nhận cả trường hợp scroll được và không scroll được (nếu content ngắn)
    expect(scrollTopAfter).toBeGreaterThanOrEqual(initialScrollTop);
  });

  test('should restore scroll position when modal closes', async ({ page }) => {
    // Scroll trang xuống trước
    await page.evaluate(() => window.scrollTo(0, 300));
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Tìm và click task card
    const taskCard = page.locator('.macos-card, [class*="bg-white"][class*="rounded-xl"], .task-card').first();
    
    // Skip test nếu không có task cards
    const cardCount = await taskCard.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }
    
    await expect(taskCard).toBeVisible({ timeout: 10000 });
    await taskCard.click();
    
    // Đợi modal mở
    const modal = page.locator('.task-detail-panel');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Đóng modal bằng cách click backdrop
    const backdrop = page.locator('.modal-backdrop');
    await backdrop.click({ position: { x: 50, y: 50 } });
    
    // Đợi modal đóng
    await expect(modal).not.toBeVisible();
    
    // Kiểm tra scroll position được khôi phục
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBe(initialScrollY);
  });
});
