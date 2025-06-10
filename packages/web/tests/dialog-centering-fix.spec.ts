import { test, expect } from '@playwright/test';

test.describe('Dialog Centering Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
  });

  test('Dialog should be perfectly centered - detailed check', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Try to find task creation buttons
    const buttons = [
      'button:has-text("Tạo công việc")',
      'button:has-text("Giao công việc")',
      'button:has-text("Thêm công việc")',
      '[data-testid="create-task"]',
      '.task-create-button'
    ];
    
    let buttonFound = false;
    for (const buttonSelector of buttons) {
      const button = page.locator(buttonSelector).first();
      if (await button.isVisible()) {
        console.log(`Found button: ${buttonSelector}`);
        await button.click();
        buttonFound = true;
        break;
      }
    }
    
    if (!buttonFound) {
      console.log('No task creation button found, skipping test');
      return;
    }
    
    // Wait for dialog to appear
    await page.waitForSelector('[data-radix-dialog-content]', { timeout: 10000 });
    
    const dialog = page.locator('[data-radix-dialog-content]');
    await expect(dialog).toBeVisible();
    
    // Get viewport and dialog dimensions
    const viewportSize = page.viewportSize()!;
    const dialogBox = await dialog.boundingBox();
    
    console.log('Viewport:', viewportSize);
    console.log('Dialog box:', dialogBox);
    
    if (dialogBox) {
      // Calculate centers
      const viewportCenterX = viewportSize.width / 2;
      const viewportCenterY = viewportSize.height / 2;
      const dialogCenterX = dialogBox.x + dialogBox.width / 2;
      const dialogCenterY = dialogBox.y + dialogBox.height / 2;
      
      console.log('Viewport center:', { x: viewportCenterX, y: viewportCenterY });
      console.log('Dialog center:', { x: dialogCenterX, y: dialogCenterY });
      
      // Check horizontal centering (allow 10px tolerance)
      const horizontalDiff = Math.abs(dialogCenterX - viewportCenterX);
      console.log('Horizontal difference:', horizontalDiff);
      expect(horizontalDiff).toBeLessThan(10);
      
      // Check vertical centering (allow 20px tolerance for header/footer)
      const verticalDiff = Math.abs(dialogCenterY - viewportCenterY);
      console.log('Vertical difference:', verticalDiff);
      expect(verticalDiff).toBeLessThan(20);
      
      // Ensure dialog is not at edges
      expect(dialogBox.x).toBeGreaterThan(10);
      expect(dialogBox.y).toBeGreaterThan(10);
      expect(dialogBox.x + dialogBox.width).toBeLessThan(viewportSize.width - 10);
      expect(dialogBox.y + dialogBox.height).toBeLessThan(viewportSize.height - 10);
    }
    
    // Check CSS properties
    const computedStyle = await dialog.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        left: style.left,
        top: style.top,
        transform: style.transform,
        zIndex: style.zIndex,
      };
    });
    
    console.log('Computed style:', computedStyle);
    
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.left).toBe('50%');
    expect(computedStyle.top).toBe('50%');
    expect(computedStyle.transform).toContain('translate(-50%, -50%)');
    expect(parseInt(computedStyle.zIndex)).toBeGreaterThanOrEqual(10000);
  });

  test('Dialog overlay should cover full screen', async ({ page }) => {
    const buttons = [
      'button:has-text("Tạo công việc")',
      'button:has-text("Giao công việc")',
      'button:has-text("Thêm công việc")'
    ];
    
    for (const buttonSelector of buttons) {
      const button = page.locator(buttonSelector).first();
      if (await button.isVisible()) {
        await button.click();
        break;
      }
    }
    
    await page.waitForSelector('[data-radix-dialog-overlay]', { timeout: 5000 });
    
    const overlay = page.locator('[data-radix-dialog-overlay]');
    const overlayBox = await overlay.boundingBox();
    const viewportSize = page.viewportSize()!;
    
    if (overlayBox) {
      expect(overlayBox.x).toBe(0);
      expect(overlayBox.y).toBe(0);
      expect(overlayBox.width).toBe(viewportSize.width);
      expect(overlayBox.height).toBe(viewportSize.height);
    }
    
    const overlayStyle = await overlay.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        top: style.top,
        left: style.left,
        width: style.width,
        height: style.height,
        zIndex: style.zIndex,
      };
    });
    
    expect(overlayStyle.position).toBe('fixed');
    expect(overlayStyle.top).toBe('0px');
    expect(overlayStyle.left).toBe('0px');
    expect(parseInt(overlayStyle.zIndex)).toBeGreaterThanOrEqual(9998);
  });

  test('Dialog should maintain centering on window resize', async ({ page }) => {
    const buttons = [
      'button:has-text("Tạo công việc")',
      'button:has-text("Giao công việc")'
    ];
    
    for (const buttonSelector of buttons) {
      const button = page.locator(buttonSelector).first();
      if (await button.isVisible()) {
        await button.click();
        break;
      }
    }
    
    await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
    const dialog = page.locator('[data-radix-dialog-content]');
    
    // Test different viewport sizes
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(500); // Allow for resize
      
      const dialogBox = await dialog.boundingBox();
      if (dialogBox) {
        const centerX = dialogBox.x + dialogBox.width / 2;
        const centerY = dialogBox.y + dialogBox.height / 2;
        const viewportCenterX = size.width / 2;
        const viewportCenterY = size.height / 2;
        
        const horizontalDiff = Math.abs(centerX - viewportCenterX);
        const verticalDiff = Math.abs(centerY - viewportCenterY);
        
        console.log(`Viewport ${size.width}x${size.height}: H-diff=${horizontalDiff}, V-diff=${verticalDiff}`);
        
        expect(horizontalDiff).toBeLessThan(15);
        expect(verticalDiff).toBeLessThan(25);
      }
    }
  });

  test('Dialog should not be affected by page scroll', async ({ page }) => {
    // Add some content to make page scrollable
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      div.style.background = 'linear-gradient(red, blue)';
      document.body.appendChild(div);
    });
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    
    const buttons = [
      'button:has-text("Tạo công việc")',
      'button:has-text("Giao công việc")'
    ];
    
    for (const buttonSelector of buttons) {
      const button = page.locator(buttonSelector).first();
      if (await button.isVisible()) {
        await button.click();
        break;
      }
    }
    
    await page.waitForSelector('[data-radix-dialog-content]', { timeout: 5000 });
    const dialog = page.locator('[data-radix-dialog-content]');
    
    const dialogBox = await dialog.boundingBox();
    const viewportSize = page.viewportSize()!;
    
    if (dialogBox) {
      const centerX = dialogBox.x + dialogBox.width / 2;
      const centerY = dialogBox.y + dialogBox.height / 2;
      const viewportCenterX = viewportSize.width / 2;
      const viewportCenterY = viewportSize.height / 2;
      
      // Dialog should still be centered relative to viewport, not page
      expect(Math.abs(centerX - viewportCenterX)).toBeLessThan(10);
      expect(Math.abs(centerY - viewportCenterY)).toBeLessThan(20);
    }
  });
});
