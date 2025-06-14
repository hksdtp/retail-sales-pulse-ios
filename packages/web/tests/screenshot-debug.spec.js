import { test, expect } from '@playwright/test';

test.describe('Screenshot Debug Console Logs', () => {
  test('Chụp màn hình và debug console logs', async ({ page }) => {
    console.log('📸 CHỤP MÀN HÌNH VÀ DEBUG CONSOLE LOGS');
    
    // Bắt console logs
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log(`📋 Console: ${text}`);
    });

    // Đi đến trang Employees
    console.log('🏠 Đi đến trang Employees...');
    await page.goto('http://localhost:8088/employees');
    
    // Chờ trang load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Chụp màn hình toàn trang
    console.log('📸 Chụp màn hình toàn trang...');
    await page.screenshot({ 
      path: 'packages/web/tests/screenshots/employees-full-page.png',
      fullPage: true 
    });
    
    // Mở Developer Tools (F12)
    console.log('🔧 Mở Developer Tools...');
    await page.keyboard.press('F12');
    await page.waitForTimeout(1000);
    
    // Chụp màn hình với Developer Tools
    console.log('📸 Chụp màn hình với Developer Tools...');
    await page.screenshot({ 
      path: 'packages/web/tests/screenshots/employees-with-devtools.png',
      fullPage: true 
    });
    
    // Refresh trang để trigger logs
    console.log('🔄 Refresh trang để trigger logs...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Chụp màn hình sau refresh
    console.log('📸 Chụp màn hình sau refresh...');
    await page.screenshot({ 
      path: 'packages/web/tests/screenshots/employees-after-refresh.png',
      fullPage: true 
    });
    
    // Tìm team dropdown
    console.log('🔍 Tìm team dropdown...');
    const teamDropdown = page.locator('[role="combobox"]:has-text("nhóm")').first();
    
    if (await teamDropdown.isVisible()) {
      console.log('✅ Tìm thấy team dropdown');
      
      // Highlight dropdown
      await teamDropdown.highlight();
      await page.waitForTimeout(500);
      
      // Chụp màn hình dropdown
      console.log('📸 Chụp màn hình dropdown...');
      await page.screenshot({ 
        path: 'packages/web/tests/screenshots/team-dropdown-highlighted.png',
        fullPage: true 
      });
      
      // Click dropdown để xem options
      console.log('👆 Click dropdown để xem options...');
      await teamDropdown.click();
      await page.waitForTimeout(1000);
      
      // Chụp màn hình dropdown mở
      console.log('📸 Chụp màn hình dropdown mở...');
      await page.screenshot({ 
        path: 'packages/web/tests/screenshots/team-dropdown-open.png',
        fullPage: true 
      });
      
      // Lấy options
      const options = await page.locator('[role="option"]').allTextContents();
      console.log('📋 Team dropdown options:', options);
      
    } else {
      console.log('❌ Không tìm thấy team dropdown');
    }
    
    // In tất cả console logs
    console.log('\n📊 TẤT CẢ CONSOLE LOGS:');
    console.log('='.repeat(50));
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Tìm debug logs cụ thể
    const debugLogs = consoleLogs.filter(log => 
      log.includes('EmployeeSearchFilters Debug') || 
      log.includes('getTeamsWithLeaderNames')
    );
    
    console.log('\n🔍 DEBUG LOGS CỤ THỂ:');
    console.log('='.repeat(50));
    debugLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log('\n✅ HOÀN THÀNH CHỤP MÀN HÌNH VÀ DEBUG!');
  });
});
