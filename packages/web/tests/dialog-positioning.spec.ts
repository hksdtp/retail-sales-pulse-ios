import { test, expect } from '@playwright/test';

test.describe('Dialog Positioning Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:4173/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Task creation dialog should be centered on screen', async ({ page }) => {
    // Try to find and click a button that opens the task creation dialog
    // This might need to be adjusted based on your actual UI
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Giao công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      // Wait for dialog to appear
      await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
      
      // Get dialog element
      const dialog = page.locator('[data-radix-dialog-content]');
      await expect(dialog).toBeVisible();
      
      // Check if dialog is centered
      const dialogBox = await dialog.boundingBox();
      const viewportSize = page.viewportSize();
      
      if (dialogBox && viewportSize) {
        const dialogCenterX = dialogBox.x + dialogBox.width / 2;
        const dialogCenterY = dialogBox.y + dialogBox.height / 2;
        const viewportCenterX = viewportSize.width / 2;
        const viewportCenterY = viewportSize.height / 2;
        
        // Allow some tolerance for centering (within 50px)
        expect(Math.abs(dialogCenterX - viewportCenterX)).toBeLessThan(50);
        expect(Math.abs(dialogCenterY - viewportCenterY)).toBeLessThan(50);
      }
      
      // Check if dialog has proper styling
      await expect(dialog).toHaveCSS('position', 'fixed');
      await expect(dialog).toHaveCSS('z-index', '10000');
      
      // Check if overlay exists and covers full screen
      const overlay = page.locator('[data-radix-dialog-overlay]');
      await expect(overlay).toBeVisible();
      await expect(overlay).toHaveCSS('position', 'fixed');
      
      // Close dialog
      const closeButton = dialog.locator('[data-radix-dialog-close]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
      
      await expect(dialog).not.toBeVisible();
    }
  });

  test('Dialog should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Try to open dialog
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Giao công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
      
      const dialog = page.locator('[data-radix-dialog-content]');
      await expect(dialog).toBeVisible();
      
      // Check mobile responsive styling
      const dialogBox = await dialog.boundingBox();
      if (dialogBox) {
        // Dialog should not exceed 95% of viewport width
        expect(dialogBox.width).toBeLessThanOrEqual(375 * 0.95);
        
        // Dialog should be properly positioned
        expect(dialogBox.x).toBeGreaterThanOrEqual(0);
        expect(dialogBox.y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('Dialog content should be scrollable when content is long', async ({ page }) => {
    // Set smaller viewport to force scrolling
    await page.setViewportSize({ width: 1024, height: 600 });
    
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Giao công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
      
      const dialog = page.locator('[data-radix-dialog-content]');
      await expect(dialog).toBeVisible();
      
      // Check if dialog has overflow-y-auto
      await expect(dialog).toHaveCSS('overflow-y', 'auto');
      
      // Check max-height constraint
      const dialogBox = await dialog.boundingBox();
      if (dialogBox) {
        // Dialog height should not exceed 85% of viewport height
        expect(dialogBox.height).toBeLessThanOrEqual(600 * 0.85);
      }
    }
  });

  test('Dialog should prevent body scroll when open', async ({ page }) => {
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Giao công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      // Check initial body overflow
      const initialBodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      await createTaskButton.click();
      await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
      
      // Check if body overflow is hidden when dialog is open
      const bodyOverflowWhenDialogOpen = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      expect(bodyOverflowWhenDialogOpen).toBe('hidden');
      
      // Close dialog
      await page.keyboard.press('Escape');
      await page.waitForSelector('[data-radix-dialog-content]', { state: 'hidden' });
      
      // Check if body overflow is restored
      const finalBodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      expect(finalBodyOverflow).toBe(initialBodyOverflow);
    }
  });

  test('Dialog form fields should be properly styled and functional', async ({ page }) => {
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Giao công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
      
      const dialog = page.locator('[data-radix-dialog-content]');
      
      // Check if title input exists and is styled properly
      const titleInput = dialog.locator('input[name="title"]');
      if (await titleInput.isVisible()) {
        await expect(titleInput).toHaveCSS('border-radius', '8px');
        await expect(titleInput).toHaveCSS('height', '44px');
        
        // Test input functionality
        await titleInput.fill('Test Task Title');
        await expect(titleInput).toHaveValue('Test Task Title');
      }
      
      // Check if description textarea exists
      const descriptionTextarea = dialog.locator('textarea[name="description"]');
      if (await descriptionTextarea.isVisible()) {
        await expect(descriptionTextarea).toHaveCSS('border-radius', '8px');
        await expect(descriptionTextarea).toHaveCSS('resize', 'none');
        
        // Test textarea functionality
        await descriptionTextarea.fill('Test task description');
        await expect(descriptionTextarea).toHaveValue('Test task description');
      }
      
      // Check if select elements are properly styled
      const selectTriggers = dialog.locator('[data-radix-select-trigger]');
      const selectCount = await selectTriggers.count();
      
      for (let i = 0; i < selectCount; i++) {
        const select = selectTriggers.nth(i);
        if (await select.isVisible()) {
          await expect(select).toHaveCSS('border-radius', '8px');
          await expect(select).toHaveCSS('height', '44px');
        }
      }
    }
  });
});
