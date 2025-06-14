import { test, expect } from '@playwright/test';

test.describe('Mobile vs Desktop Comparison', () => {
  test('should capture before/after mobile optimization comparison', async ({ page }) => {
    console.log('📱 Creating mobile vs desktop comparison screenshots...');
    
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
    
    // Desktop view
    console.log('🖥️ Capturing desktop view...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/comparison-desktop-1920x1080.png',
      fullPage: true 
    });
    console.log('✅ Desktop screenshot saved');
    
    // Tablet view
    console.log('📱 Capturing tablet view...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/comparison-tablet-768x1024.png',
      fullPage: true 
    });
    console.log('✅ Tablet screenshot saved');
    
    // Mobile view - iPhone SE
    console.log('📱 Capturing iPhone SE view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/comparison-mobile-375x667.png',
      fullPage: true 
    });
    console.log('✅ Mobile iPhone SE screenshot saved');
    
    // Test filter functionality on mobile
    console.log('🔍 Testing filters on mobile...');
    
    // Search test
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('Lương Việt Anh');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/mobile-search-active.png',
        fullPage: true 
      });
      console.log('✅ Mobile search active screenshot saved');
    }
    
    // Location filter test
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    if (await locationSelect.isVisible()) {
      await locationSelect.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/mobile-location-dropdown-open.png',
        fullPage: true 
      });
      console.log('✅ Mobile location dropdown screenshot saved');
      
      // Select Hà Nội
      const hanoiOption = page.locator('div[role="option"]:has-text("Hà Nội")');
      if (await hanoiOption.isVisible()) {
        await hanoiOption.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Role filter test
    const roleSelect = page.locator('button').filter({ hasText: 'Vai trò' }).first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      await page.waitForTimeout(1000);
      
      const teamLeaderOption = page.locator('div[role="option"]:has-text("Trưởng nhóm")');
      if (await teamLeaderOption.isVisible()) {
        await teamLeaderOption.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Team filter test
    const teamSelect = page.locator('button').filter({ hasText: 'Nhóm' }).first();
    if (await teamSelect.isVisible()) {
      await teamSelect.click();
      await page.waitForTimeout(1000);
      
      const firstTeamOption = page.locator('div[role="option"]').filter({ hasText: 'NHÓM' }).first();
      if (await firstTeamOption.isVisible()) {
        await firstTeamOption.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Final screenshot with all filters applied
    await page.screenshot({ 
      path: 'test-results/mobile-all-filters-applied.png',
      fullPage: true 
    });
    console.log('✅ Mobile all filters applied screenshot saved');
    
    // Test different orientations
    console.log('📱 Testing landscape orientation...');
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-landscape-orientation.png',
      fullPage: true 
    });
    console.log('✅ Mobile landscape screenshot saved');
    
    // Test very small screen
    console.log('📱 Testing very small screen (320px)...');
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-very-small-320x568.png',
      fullPage: true 
    });
    console.log('✅ Very small mobile screenshot saved');
    
    console.log('🎉 All comparison screenshots completed!');
    
    // Summary of captured screenshots
    console.log(`
📊 SCREENSHOT SUMMARY:
✅ Desktop (1920x1080) - Full layout
✅ Tablet (768x1024) - Medium responsive
✅ iPhone SE (375x667) - Mobile optimized
✅ Mobile with search active
✅ Mobile with location dropdown
✅ Mobile with all filters applied
✅ Mobile landscape (667x375)
✅ Very small mobile (320x568)
    `);
  });
});
