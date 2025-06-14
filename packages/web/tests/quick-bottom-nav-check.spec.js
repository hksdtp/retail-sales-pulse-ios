import { test, expect } from '@playwright/test';

test.describe('Quick Bottom Nav Check', () => {
  test('should capture current bottom navigation state', async ({ page }) => {
    console.log('📱 Quick bottom navigation check...');
    
    // Navigate and setup auth
    await page.goto('http://localhost:8088/employees');
    
    await page.addInitScript(() => {
      const testUser = {
        id: '1',
        name: 'Khổng Đức Mạnh',
        email: 'manh@company.com',
        role: 'retail_director',
        team: 'Phòng Kinh Doanh',
        location: 'Hà Nội',
        password_changed: true,
      };
      localStorage.setItem('currentUser', JSON.stringify(testUser));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/bottom-nav-current-state.png',
      fullPage: false
    });
    
    // Count items
    const navItems = page.locator('.bottom-nav-mobile a, .bottom-nav-mobile button');
    const itemCount = await navItems.count();
    console.log(`📊 Navigation items: ${itemCount}`);
    
    // Check each item
    for (let i = 0; i < itemCount; i++) {
      const item = navItems.nth(i);
      const boundingBox = await item.boundingBox();
      const text = await item.textContent();
      
      if (boundingBox) {
        console.log(`📏 Item ${i + 1}: "${text?.trim()}" - width=${boundingBox.width}px`);
      }
    }
    
    // Test very small screen
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/bottom-nav-320px.png',
      fullPage: false
    });
    
    console.log('✅ Quick check completed');
  });
});
