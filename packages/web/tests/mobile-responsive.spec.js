import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test authentication
    await page.evaluate(() => {
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
  });

  test('should display employees page properly on mobile', async ({ page }) => {
    console.log('📱 Testing mobile responsive design for employees page...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to employees page
    await page.goto('http://localhost:8088/employees');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of mobile view
    await page.screenshot({ 
      path: 'test-results/employees-mobile-before.png',
      fullPage: true 
    });
    
    // Check if page header is responsive
    const pageHeader = page.locator('h1:has-text("Quản lý nhân viên")');
    await expect(pageHeader).toBeVisible();
    
    // Check if filters are stacked properly on mobile
    const filtersCard = page.locator('.card').first();
    await expect(filtersCard).toBeVisible();
    
    // Check if search input is full width on mobile
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();
    
    // Check if select dropdowns are properly sized
    const locationSelect = page.locator('button:has-text("Địa điểm")').first();
    await expect(locationSelect).toBeVisible();
    
    // Test dropdown interaction on mobile
    await locationSelect.click();
    await page.waitForTimeout(500);
    
    const hanoiOption = page.locator('div[role="option"]:has-text("Hà Nội")');
    await expect(hanoiOption).toBeVisible();
    await hanoiOption.click();
    
    // Check if results count is visible
    const resultsCount = page.locator('text=/\\d+ \\/ \\d+ nhân viên/');
    await expect(resultsCount).toBeVisible();
    
    // Take screenshot after interaction
    await page.screenshot({ 
      path: 'test-results/employees-mobile-after.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile employees page test passed');
  });

  test('should handle different mobile screen sizes', async ({ page }) => {
    console.log('📱 Testing different mobile screen sizes...');
    
    const screenSizes = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 412, height: 915, name: 'Android Large' }
    ];
    
    for (const size of screenSizes) {
      console.log(`📱 Testing ${size.name} (${size.width}x${size.height})`);
      
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('http://localhost:8088/employees');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check if content fits properly
      const body = page.locator('body');
      const boundingBox = await body.boundingBox();
      
      // Ensure no horizontal overflow
      expect(boundingBox.width).toBeLessThanOrEqual(size.width);
      
      // Check if key elements are visible
      await expect(page.locator('h1:has-text("Quản lý nhân viên")')).toBeVisible();
      await expect(page.locator('input[placeholder*="Tìm kiếm"]')).toBeVisible();
      
      // Take screenshot for each size
      await page.screenshot({ 
        path: `test-results/employees-${size.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ Multiple screen sizes test passed');
  });

  test('should test filter interactions on mobile', async ({ page }) => {
    console.log('📱 Testing filter interactions on mobile...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:8088/employees');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('Lương');
    await page.waitForTimeout(1000);
    
    // Check if filter tags appear
    const filterTag = page.locator('span:has-text("Tìm kiếm:")');
    await expect(filterTag).toBeVisible();
    
    // Test location filter
    const locationSelect = page.locator('button').filter({ hasText: 'Địa điểm' }).first();
    await locationSelect.click();
    await page.waitForTimeout(500);
    
    const hanoiOption = page.locator('div[role="option"]:has-text("Hà Nội")');
    await hanoiOption.click();
    await page.waitForTimeout(1000);
    
    // Test role filter
    const roleSelect = page.locator('button').filter({ hasText: 'Vai trò' }).first();
    await roleSelect.click();
    await page.waitForTimeout(500);
    
    const teamLeaderOption = page.locator('div[role="option"]:has-text("Trưởng nhóm")');
    await teamLeaderOption.click();
    await page.waitForTimeout(1000);
    
    // Test team filter
    const teamSelect = page.locator('button').filter({ hasText: 'Nhóm' }).first();
    await teamSelect.click();
    await page.waitForTimeout(500);
    
    // Select first team option
    const firstTeamOption = page.locator('div[role="option"]').filter({ hasText: 'NHÓM' }).first();
    if (await firstTeamOption.isVisible()) {
      await firstTeamOption.click();
      await page.waitForTimeout(1000);
    }
    
    // Check if multiple filter tags are visible and properly wrapped
    const filterTags = page.locator('span[class*="bg-"]').filter({ hasText: /Tìm kiếm:|Hà Nội|Trưởng nhóm|NHÓM/ });
    const tagCount = await filterTags.count();
    expect(tagCount).toBeGreaterThan(0);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/employees-mobile-filters.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile filter interactions test passed');
  });

  test('should test button responsiveness', async ({ page }) => {
    console.log('📱 Testing button responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:8088/employees');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if header buttons are responsive
    const exportButton = page.locator('button:has-text("Xuất")');
    await expect(exportButton).toBeVisible();
    
    const addButton = page.locator('button:has-text("Thêm")');
    await expect(addButton).toBeVisible();
    
    // Test button clicks
    await exportButton.click();
    await page.waitForTimeout(500);
    
    // Take screenshot of button interactions
    await page.screenshot({ 
      path: 'test-results/employees-mobile-buttons.png',
      fullPage: true 
    });
    
    console.log('✅ Button responsiveness test passed');
  });
});
