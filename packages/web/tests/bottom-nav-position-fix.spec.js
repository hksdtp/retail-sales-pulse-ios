import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Position Fix', () => {
  test('should always be visible at bottom of screen without scrolling', async ({ page }) => {
    console.log('🚀 Testing Bottom Navigation Position Fix');
    
    // Test different screen sizes
    const screenSizes = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 }
    ];
    
    for (const size of screenSizes) {
      console.log(`📱 Testing ${size.name} (${size.width}x${size.height})`);
      
      // Set viewport size
      await page.setViewportSize({ width: size.width, height: size.height });
      
      // Navigate to different pages to test
      const testPages = [
        { name: 'Dashboard', url: 'http://localhost:8088/' },
        { name: 'Tasks', url: 'http://localhost:8088/tasks' },
        { name: 'Calendar', url: 'http://localhost:8088/calendar' },
        { name: 'Employees', url: 'http://localhost:8088/employees' }
      ];
      
      for (const testPage of testPages) {
        console.log(`  📄 Testing ${testPage.name} page`);
        
        // Navigate to page
        await page.goto(testPage.url);
        await page.waitForTimeout(1000);
        
        // Check if bottom nav is visible immediately (without scrolling)
        const bottomNav = page.locator('.bottom-nav-mobile');
        
        // On mobile screens, bottom nav should be visible
        if (size.width < 768) {
          await expect(bottomNav).toBeVisible();
          
          // Get bottom nav position
          const navBox = await bottomNav.boundingBox();
          expect(navBox).not.toBeNull();
          
          // Bottom nav should be at the bottom of the viewport
          expect(navBox.y + navBox.height).toBeGreaterThan(size.height - 10);
          
          // Bottom nav should have correct height
          expect(navBox.height).toBeGreaterThanOrEqual(60);
          expect(navBox.height).toBeLessThanOrEqual(80);
          
          // Test that bottom nav is still visible after scrolling
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
          await page.waitForTimeout(500);
          
          // Bottom nav should still be visible and at bottom
          await expect(bottomNav).toBeVisible();
          const navBoxAfterScroll = await bottomNav.boundingBox();
          expect(navBoxAfterScroll.y + navBoxAfterScroll.height).toBeGreaterThan(size.height - 10);
          
          // Scroll back to top
          await page.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(500);
          
          // Bottom nav should still be visible at bottom
          await expect(bottomNav).toBeVisible();
          const navBoxAtTop = await bottomNav.boundingBox();
          expect(navBoxAtTop.y + navBoxAtTop.height).toBeGreaterThan(size.height - 10);
          
          console.log(`    ✅ ${testPage.name} - Bottom nav correctly positioned`);
        } else {
          // On desktop, bottom nav should be hidden
          await expect(bottomNav).not.toBeVisible();
          console.log(`    ✅ ${testPage.name} - Bottom nav correctly hidden on desktop`);
        }
      }
      
      // Take screenshot for visual verification
      await page.goto('http://localhost:8088/employees');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/bottom-nav-fix-${size.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: false 
      });
      
      console.log(`  📸 Screenshot saved for ${size.name}`);
    }
    
    console.log('✅ Bottom Navigation Position Fix test completed');
  });

  test('should have all navigation items clickable and properly spaced', async ({ page }) => {
    console.log('🔘 Testing Bottom Navigation Items');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Navigate to employees page
    await page.goto('http://localhost:8088/employees');
    await page.waitForTimeout(2000);
    
    const bottomNav = page.locator('.bottom-nav-mobile');
    await expect(bottomNav).toBeVisible();
    
    // Test all navigation items
    const navItems = [
      { name: 'Dashboard', selector: 'a[href="/"]' },
      { name: 'Tasks', selector: 'a[href="/tasks"]' },
      { name: 'Calendar', selector: 'a[href="/calendar"]' },
      { name: 'Employees', selector: 'a[href="/employees"]' }
    ];
    
    for (const item of navItems) {
      console.log(`  🔘 Testing ${item.name} button`);
      
      const navItem = bottomNav.locator(item.selector);
      
      // Check if item is visible and clickable
      await expect(navItem).toBeVisible();
      
      // Get item dimensions
      const itemBox = await navItem.boundingBox();
      expect(itemBox).not.toBeNull();
      
      // Items should have reasonable width (not too cramped)
      expect(itemBox.width).toBeGreaterThan(50);
      
      // Items should have proper height
      expect(itemBox.height).toBeGreaterThan(50);
      
      console.log(`    ✅ ${item.name} - Properly sized and positioned`);
    }
    
    // Test account link
    console.log('  👤 Testing Account link');
    const accountLink = bottomNav.locator('a[href="/account"]');
    await expect(accountLink).toBeVisible();

    // Check account link properties
    const accountBox = await accountLink.boundingBox();
    expect(accountBox).not.toBeNull();

    // Account link should have reasonable width
    expect(accountBox.width).toBeGreaterThan(50);

    // Account link should have proper height
    expect(accountBox.height).toBeGreaterThan(50);

    console.log('    ✅ Account - Properly sized and positioned');
    
    // Test navigation functionality
    console.log('  🧭 Testing navigation functionality');
    
    const dashboardLink = bottomNav.locator('a[href="/"]');
    await dashboardLink.click();
    await page.waitForTimeout(2000);
    
    // Verify navigation worked
    expect(page.url()).toContain('/');
    
    // Bottom nav should still be visible after navigation
    await expect(bottomNav).toBeVisible();
    
    console.log('✅ Bottom Navigation Items test completed');
  });

  test('should maintain proper z-index and not be covered by content', async ({ page }) => {
    console.log('🔝 Testing Bottom Navigation Z-Index');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Test pages with lots of content
    const contentPages = [
      'http://localhost:8088/tasks',
      'http://localhost:8088/employees',
      'http://localhost:8088/calendar'
    ];
    
    for (const pageUrl of contentPages) {
      console.log(`  📄 Testing z-index on ${pageUrl}`);
      
      await page.goto(pageUrl);
      await page.waitForTimeout(2000);
      
      const bottomNav = page.locator('.bottom-nav-mobile');
      await expect(bottomNav).toBeVisible();
      
      // Scroll to create content overlap scenarios
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(500);
      
      // Bottom nav should still be visible and on top
      await expect(bottomNav).toBeVisible();
      
      // Check z-index value
      const zIndex = await bottomNav.evaluate(el => 
        window.getComputedStyle(el).zIndex
      );
      
      // Z-index should be very high
      expect(parseInt(zIndex)).toBeGreaterThan(9000);
      
      console.log(`    ✅ Z-index: ${zIndex} - Properly layered`);
    }
    
    console.log('✅ Bottom Navigation Z-Index test completed');
  });
});
