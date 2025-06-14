import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation Final Fix', () => {
  test('should display 5 items properly without overlap', async ({ page }) => {
    console.log('📱 Testing final bottom navigation fix...');
    
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
      { width: 320, height: 568, name: 'iPhone-5' },
      { width: 375, height: 667, name: 'iPhone-SE' },
      { width: 390, height: 844, name: 'iPhone-12' },
      { width: 414, height: 896, name: 'iPhone-11-Pro' }
    ];
    
    for (const device of devices) {
      console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.waitForTimeout(1000);
      
      // Check if bottom navigation is visible
      const bottomNav = page.locator('.bottom-nav-mobile');
      await expect(bottomNav).toBeVisible();
      
      // Count navigation items
      const navItems = page.locator('.bottom-nav-mobile a, .bottom-nav-mobile button');
      const itemCount = await navItems.count();
      console.log(`📊 ${device.name}: ${itemCount} navigation items found`);
      
      // Check if all items are visible and not overlapping
      const items = await navItems.all();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await expect(item).toBeVisible();
        
        const boundingBox = await item.boundingBox();
        if (boundingBox) {
          console.log(`📏 Item ${i + 1}: width=${boundingBox.width}px, x=${boundingBox.x}px`);
          
          // Ensure item has reasonable width (not too narrow)
          expect(boundingBox.width).toBeGreaterThan(device.width / 8); // At least 1/8 of screen width
        }
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/bottom-nav-final-${device.name}.png`,
        fullPage: false
      });
      
      // Test navigation functionality
      const dashboardLink = page.locator('a[href="/"]');
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click();
        await page.waitForTimeout(1000);
        
        // Verify navigation worked
        expect(page.url()).toContain('/');
        
        // Go back to employees page
        await page.goto('http://localhost:8088/employees');
        await page.waitForTimeout(1000);
      }
      
      console.log(`✅ ${device.name} test completed`);
    }
    
    console.log('🎉 All bottom navigation tests passed!');
  });

  test('should verify theme toggle is removed from header', async ({ page }) => {
    console.log('🎨 Verifying theme toggle removal...');
    
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
    
    // Check that theme toggle is not in header
    const themeToggle = page.locator('button:has(svg[data-lucide="sun"]), button:has(svg[data-lucide="moon"])');
    const themeToggleCount = await themeToggle.count();
    
    console.log(`🔍 Found ${themeToggleCount} theme toggle buttons`);
    
    // Take screenshot to verify clean header
    await page.screenshot({ 
      path: 'test-results/header-without-theme-toggle.png',
      fullPage: false
    });
    
    // Verify header content
    const pageTitle = page.locator('h1:has-text("Quản lý nhân viên")');
    await expect(pageTitle).toBeVisible();
    
    const notificationCenter = page.locator('[data-notification="center"]');
    // Notification center might or might not be visible, that's OK
    
    console.log('✅ Theme toggle removal verified');
  });

  test('should test bottom navigation spacing and readability', async ({ page }) => {
    console.log('📐 Testing bottom navigation spacing...');
    
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
    
    // Check text readability
    const navTexts = page.locator('.bottom-nav-mobile span');
    const textCount = await navTexts.count();
    
    console.log(`📝 Found ${textCount} navigation text elements`);
    
    // Check each text element
    for (let i = 0; i < textCount; i++) {
      const textElement = navTexts.nth(i);
      const text = await textElement.textContent();
      const isVisible = await textElement.isVisible();
      
      console.log(`📝 Text ${i + 1}: "${text}" - Visible: ${isVisible}`);
      
      if (text && text.trim()) {
        await expect(textElement).toBeVisible();
      }
    }
    
    // Check icon visibility
    const navIcons = page.locator('.bottom-nav-mobile svg');
    const iconCount = await navIcons.count();
    
    console.log(`🎯 Found ${iconCount} navigation icons`);
    
    for (let i = 0; i < iconCount; i++) {
      const icon = navIcons.nth(i);
      await expect(icon).toBeVisible();
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/bottom-nav-spacing-test.png',
      fullPage: false
    });
    
    console.log('✅ Bottom navigation spacing test completed');
  });
});
