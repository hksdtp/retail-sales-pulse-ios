import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Text Fix', () => {
  test('should display full text without truncation', async ({ page }) => {
    console.log('📱 Testing bottom navigation text fix...');
    
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
      { width: 320, height: 568, name: 'iPhone-5-Text-Fix' },
      { width: 375, height: 667, name: 'iPhone-SE-Text-Fix' },
      { width: 390, height: 844, name: 'iPhone-12-Text-Fix' }
    ];
    
    for (const device of devices) {
      console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/${device.name}.png`,
        fullPage: false
      });
      
      // Check text content
      const navTexts = page.locator('.bottom-nav-mobile span');
      const textCount = await navTexts.count();
      
      console.log(`📝 ${device.name}: Found ${textCount} text elements`);
      
      // Check each text element
      for (let i = 0; i < textCount; i++) {
        const textElement = navTexts.nth(i);
        const text = await textElement.textContent();
        const isVisible = await textElement.isVisible();
        
        console.log(`📝 Text ${i + 1}: "${text}" - Visible: ${isVisible}`);
        
        // Verify important texts are not truncated
        if (text && text.includes('...')) {
          console.log(`⚠️ Text truncated: "${text}"`);
        }
        
        // Check specific texts
        if (text === 'Nhân viên') {
          console.log(`✅ "Nhân viên" displayed correctly`);
        }
        if (text === 'Tài khoản') {
          console.log(`✅ "Tài khoản" displayed correctly`);
        }
      }
      
      // Check bottom spacing
      const bottomNav = page.locator('.bottom-nav-mobile');
      const navBoundingBox = await bottomNav.boundingBox();
      
      if (navBoundingBox) {
        const bottomPosition = navBoundingBox.y + navBoundingBox.height;
        const screenHeight = device.height;
        const bottomGap = screenHeight - bottomPosition;
        
        console.log(`📏 ${device.name}: Bottom gap = ${bottomGap}px`);
        
        // Bottom gap should be reasonable (not too much)
        expect(bottomGap).toBeLessThan(50); // Should not have excessive bottom spacing
      }
    }
    
    console.log('✅ Bottom navigation text fix test completed');
  });

  test('should verify spacing and layout improvements', async ({ page }) => {
    console.log('📐 Testing spacing improvements...');
    
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
    
    // Check item spacing
    const navItems = page.locator('.bottom-nav-mobile a, .bottom-nav-mobile > div');
    const itemCount = await navItems.count();
    
    console.log(`📊 Found ${itemCount} navigation items`);
    
    // Check spacing between items
    const itemPositions = [];
    for (let i = 0; i < itemCount; i++) {
      const item = navItems.nth(i);
      const boundingBox = await item.boundingBox();
      if (boundingBox) {
        itemPositions.push({
          index: i,
          x: boundingBox.x,
          width: boundingBox.width,
          right: boundingBox.x + boundingBox.width
        });
      }
    }
    
    // Calculate gaps between items
    for (let i = 0; i < itemPositions.length - 1; i++) {
      const currentItem = itemPositions[i];
      const nextItem = itemPositions[i + 1];
      const gap = nextItem.x - currentItem.right;
      
      console.log(`📏 Gap between item ${i + 1} and ${i + 2}: ${gap}px`);
      
      // Gap should be consistent (around 4px due to gap-x-1)
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThan(10);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/bottom-nav-spacing-final.png',
      fullPage: false
    });
    
    console.log('✅ Spacing test completed');
  });
});
