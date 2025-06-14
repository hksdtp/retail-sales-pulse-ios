import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Container Check', () => {
  test('should check container sizes and layout', async ({ page }) => {
    console.log('📱 Checking bottom navigation container...');
    
    // Navigate to the app
    await page.goto('http://localhost:8090');
    
    // Wait for login and navigate to dashboard
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('div[style*="100vw"]', { timeout: 10000 });
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check bottom navigation container
    const bottomNav = await page.locator('div[style*="100vw"]').first();
    const navItems = await bottomNav.locator('a');
    
    // Get container dimensions
    const bottomNavBox = await bottomNav.boundingBox();

    console.log(`📊 Bottom nav container: ${bottomNavBox?.width}px × ${bottomNavBox?.height}px`);
    
    // Check each navigation item
    const itemCount = await navItems.count();
    console.log(`📊 Navigation items count: ${itemCount}`);
    
    for (let i = 0; i < itemCount; i++) {
      const item = navItems.nth(i);
      const itemBox = await item.boundingBox();
      const itemText = await item.locator('span').textContent();
      
      console.log(`📏 Item ${i + 1}: "${itemText}" - container: ${itemBox?.width}px × ${itemBox?.height}px`);
    }
    
    // Check if items are evenly distributed
    const expectedItemWidth = bottomNavBox?.width ? bottomNavBox.width / itemCount : 0;
    console.log(`📐 Expected item width: ${expectedItemWidth}px`);

    // Verify layout
    expect(itemCount).toBe(5);
    expect(bottomNavBox?.height).toBeGreaterThan(80);
    expect(bottomNavBox?.width).toBeGreaterThan(300);
    
    console.log('✅ Container check completed');
  });
});
