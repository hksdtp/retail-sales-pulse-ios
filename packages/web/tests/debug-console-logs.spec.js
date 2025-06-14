import { test, expect } from '@playwright/test';

test.describe('Debug Console Logs', () => {
  test('Kiểm tra console logs từ component', async ({ page }) => {
    console.log('🔍 KIỂM TRA CONSOLE LOGS TỪ COMPONENT');
    
    // Listen for console logs
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('EmployeeSearchFilters Debug')) {
        consoleLogs.push(msg.text());
        console.log('📋 Frontend Log:', msg.text());
      }
    });
    
    // 1. Đi đến trang
    await page.goto('http://localhost:8089');
    await page.waitForLoadState('networkidle');
    
    // 2. Đăng nhập nếu cần
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
    }
    
    // 3. Đi đến employees page
    await page.goto('http://localhost:8089/employees');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Đợi component render
    
    // 4. Kiểm tra console logs
    console.log(`📋 Tổng console logs: ${consoleLogs.length}`);
    
    if (consoleLogs.length > 0) {
      consoleLogs.forEach((log, index) => {
        console.log(`Log ${index + 1}: ${log}`);
      });
    } else {
      console.log('❌ Không có console logs từ component');
    }
    
    // 5. Force refresh để trigger lại
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log(`📋 Sau refresh - Tổng console logs: ${consoleLogs.length}`);
    
    // 6. Kiểm tra dropdown
    const teamDropdown = page.locator('[role="combobox"]:has-text("nhóm")').first();
    if (await teamDropdown.isVisible()) {
      await teamDropdown.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('[role="option"]').allTextContents();
      console.log('📋 Dropdown options:', options);
      
      await page.keyboard.press('Escape');
    }
    
    console.log('✅ HOÀN THÀNH DEBUG CONSOLE LOGS');
  });
});
