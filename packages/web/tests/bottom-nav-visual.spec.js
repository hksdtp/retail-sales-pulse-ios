import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Visual Test', () => {
  test('should capture bottom navigation fix screenshots', async ({ page }) => {
    console.log('📱 Capturing bottom navigation fix screenshots...');
    
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
    
    // Test different mobile sizes
    const devices = [
      { width: 375, height: 667, name: 'iPhone-SE' },
      { width: 390, height: 844, name: 'iPhone-12' },
      { width: 414, height: 896, name: 'iPhone-11-Pro' },
      { width: 360, height: 800, name: 'Android-Standard' }
    ];
    
    for (const device of devices) {
      console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(1000);
      
      // Screenshot at top of page
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/bottom-nav-${device.name}-top.png`,
        fullPage: false // Only visible area
      });
      
      // Screenshot at middle of page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/bottom-nav-${device.name}-middle.png`,
        fullPage: false
      });
      
      // Screenshot at bottom of page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/bottom-nav-${device.name}-bottom.png`,
        fullPage: false
      });
      
      // Full page screenshot
      await page.screenshot({ 
        path: `test-results/bottom-nav-${device.name}-fullpage.png`,
        fullPage: true
      });
      
      console.log(`✅ ${device.name} screenshots completed`);
    }
    
    // Test filter interactions with bottom nav
    console.log('🔍 Testing filter interactions...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Test search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('Lương Việt Anh');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/bottom-nav-search-interaction.png',
      fullPage: false
    });
    
    // Test dropdown interaction
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    await locationSelect.scrollIntoViewIfNeeded();
    await locationSelect.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/bottom-nav-dropdown-interaction.png',
      fullPage: false
    });
    
    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Test bottom navigation buttons
    console.log('🔘 Testing bottom navigation buttons...');
    
    const bottomNav = page.locator('.bottom-nav-mobile');
    await expect(bottomNav).toBeVisible();
    
    // Scroll to bottom to ensure bottom nav is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/bottom-nav-buttons-visible.png',
      fullPage: false
    });
    
    // Test navigation button clicks
    const dashboardBtn = page.locator('button:has-text("Dashboard")');
    if (await dashboardBtn.isVisible()) {
      await dashboardBtn.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/bottom-nav-dashboard-clicked.png',
        fullPage: false
      });
    }
    
    console.log('🎉 All bottom navigation screenshots completed!');
    
    // Summary
    console.log(`
📊 SCREENSHOT SUMMARY:
✅ 4 devices tested (iPhone SE, iPhone 12, iPhone 11 Pro, Android)
✅ 3 scroll positions per device (top, middle, bottom)
✅ 1 full page screenshot per device
✅ Filter interaction screenshots
✅ Bottom navigation button tests
✅ Total: 20+ screenshots captured
    `);
  });
});
