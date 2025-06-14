import { test, expect } from '@playwright/test';

test.describe('Mobile Visual Testing', () => {
  test('should capture mobile screenshots of employees page', async ({ page }) => {
    console.log('📱 Starting mobile visual testing...');
    
    // Navigate to page first, then set up auth
    await page.goto('http://localhost:8088/employees');
    
    // Setup authentication after page load
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
    
    // Reload to apply auth
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 Testing iPhone SE (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-iphone-se-initial.png',
      fullPage: true 
    });
    console.log('✅ iPhone SE initial screenshot saved');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Lương');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/mobile-iphone-se-search.png',
        fullPage: true 
      });
      console.log('✅ iPhone SE search screenshot saved');
    }
    
    // Test location filter
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    if (await locationSelect.isVisible()) {
      await locationSelect.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/mobile-iphone-se-location-dropdown.png',
        fullPage: true 
      });
      console.log('✅ iPhone SE location dropdown screenshot saved');
      
      const hanoiOption = page.locator('div[role="option"]:has-text("Hà Nội")');
      if (await hanoiOption.isVisible()) {
        await hanoiOption.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'test-results/mobile-iphone-se-location-selected.png',
          fullPage: true 
        });
        console.log('✅ iPhone SE location selected screenshot saved');
      }
    }
    
    console.log('📱 Testing iPhone 12 (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-iphone-12.png',
      fullPage: true 
    });
    console.log('✅ iPhone 12 screenshot saved');
    
    console.log('📱 Testing Galaxy S20 (360x800)...');
    await page.setViewportSize({ width: 360, height: 800 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-galaxy-s20.png',
      fullPage: true 
    });
    console.log('✅ Galaxy S20 screenshot saved');
    
    console.log('📱 Testing iPad Mini (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-ipad-mini.png',
      fullPage: true 
    });
    console.log('✅ iPad Mini screenshot saved');
    
    // Test filter interactions on tablet
    const roleSelect = page.locator('button').filter({ hasText: 'Vai trò' }).first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      await page.waitForTimeout(500);
      
      const teamLeaderOption = page.locator('div[role="option"]:has-text("Trưởng nhóm")');
      if (await teamLeaderOption.isVisible()) {
        await teamLeaderOption.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'test-results/mobile-ipad-mini-filters.png',
          fullPage: true 
        });
        console.log('✅ iPad Mini with filters screenshot saved');
      }
    }
    
    console.log('📱 Testing landscape mode (667x375)...');
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/mobile-landscape.png',
      fullPage: true 
    });
    console.log('✅ Landscape mode screenshot saved');
    
    console.log('🎉 All mobile screenshots captured successfully!');
  });

  test('should test mobile interactions and responsiveness', async ({ page }) => {
    console.log('📱 Testing mobile interactions...');
    
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
    
    // Test touch interactions
    console.log('🔍 Testing search input touch...');
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.tap();
    await searchInput.fill('Nguyễn');
    await page.waitForTimeout(1000);
    
    // Test dropdown touch interactions
    console.log('📍 Testing location dropdown touch...');
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    await locationSelect.tap();
    await page.waitForTimeout(1000);
    
    // Check if dropdown is properly positioned
    const dropdown = page.locator('[role="listbox"]');
    if (await dropdown.isVisible()) {
      const boundingBox = await dropdown.boundingBox();
      console.log(`📏 Dropdown position: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}`);
      
      // Ensure dropdown doesn't overflow screen
      expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(375);
    }
    
    await page.screenshot({ 
      path: 'test-results/mobile-interactions-test.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile interactions test completed');
  });
});
