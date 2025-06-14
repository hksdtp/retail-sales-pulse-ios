import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Fix', () => {
  test('should not overlap content on mobile', async ({ page }) => {
    console.log('📱 Testing bottom navigation overlap fix...');
    
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
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Take screenshot before scrolling
    await page.screenshot({ 
      path: 'test-results/bottom-nav-fix-before-scroll.png',
      fullPage: true 
    });
    console.log('✅ Before scroll screenshot saved');
    
    // Check if bottom navigation exists and has correct height
    const bottomNav = page.locator('.bottom-nav-mobile');
    await expect(bottomNav).toBeVisible();
    
    const navBoundingBox = await bottomNav.boundingBox();
    console.log(`📏 Bottom nav height: ${navBoundingBox?.height}px`);
    
    // Scroll to bottom to test content visibility
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    // Take screenshot after scrolling to bottom
    await page.screenshot({ 
      path: 'test-results/bottom-nav-fix-after-scroll.png',
      fullPage: true 
    });
    console.log('✅ After scroll screenshot saved');
    
    // Check if content is not hidden behind bottom nav
    const mainContent = page.locator('main > div');
    const mainBoundingBox = await mainContent.boundingBox();
    
    // Ensure main content has enough bottom padding
    const computedStyle = await page.evaluate(() => {
      const mainDiv = document.querySelector('main > div');
      return window.getComputedStyle(mainDiv).paddingBottom;
    });
    
    console.log(`📏 Main content padding-bottom: ${computedStyle}`);
    
    // Test different screen sizes
    const screenSizes = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 360, height: 800, name: 'Android' }
    ];
    
    for (const size of screenSizes) {
      console.log(`📱 Testing ${size.name} (${size.width}x${size.height})`);
      
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(500);
      
      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(500);
      
      // Check if bottom nav is still visible and positioned correctly
      const navBox = await bottomNav.boundingBox();
      expect(navBox?.y).toBeGreaterThan(size.height - 100); // Should be near bottom
      
      // Take screenshot for each size
      await page.screenshot({ 
        path: `test-results/bottom-nav-fix-${size.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ Bottom navigation fix test completed');
  });

  test('should test content accessibility with bottom nav', async ({ page }) => {
    console.log('📱 Testing content accessibility...');
    
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
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Test if all filter elements are accessible
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();
    
    // Scroll to search input and test interaction
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('Test search');
    await page.waitForTimeout(500);
    
    // Test location dropdown
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    await locationSelect.scrollIntoViewIfNeeded();
    await locationSelect.click();
    await page.waitForTimeout(500);
    
    // Check if dropdown is not hidden behind bottom nav
    const dropdown = page.locator('[role="listbox"]');
    if (await dropdown.isVisible()) {
      const dropdownBox = await dropdown.boundingBox();
      const bottomNavBox = await page.locator('.bottom-nav-mobile').boundingBox();
      
      // Ensure dropdown doesn't overlap with bottom nav
      expect(dropdownBox?.y + dropdownBox?.height).toBeLessThan(bottomNavBox?.y);
    }
    
    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test scrolling to bottom and ensure content is accessible
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/bottom-nav-content-accessibility.png',
      fullPage: true 
    });
    
    console.log('✅ Content accessibility test completed');
  });
});
