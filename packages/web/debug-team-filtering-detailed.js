// Debug team filtering logic chi tiết
import { chromium } from 'playwright';

async function debugTeamFiltering() {
  console.log('🔍 Bắt đầu debug team filtering...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Team view') || text.includes('TEAM FILTERING') || text.includes('selectedTeamForView') || text.includes('Task "')) {
      consoleLogs.push(`[${new Date().toISOString()}] ${text}`);
      console.log(`🔍 ${text}`);
    }
  });
  
  try {
    // Đăng nhập
    console.log('📝 Đăng nhập với Khổng Đức Mạnh');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Chọn địa điểm và user
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(1000);
    
    // Tìm option Khổng Đức Mạnh
    const userOptions = await page.locator('select >> nth=1 option').allTextContents();
    console.log('📋 Available users:', userOptions);
    
    // Chọn bằng value thay vì label
    await page.selectOption('select >> nth=1', '1'); // Khổng Đức Mạnh có ID = 1
    await page.waitForTimeout(1000);
    
    // Nhập password và đăng nhập
    await page.fill('input[type="password"]', 'Haininh1');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    // Vào tab Công việc
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(2000);
    
    // Vào tab Của nhóm
    console.log('📝 Vào tab Của nhóm');
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(3000);
    
    // Test chọn NHÓM 2 - THẢO
    console.log('🎯 Test chọn NHÓM 2 - THẢO');
    const team2Card = page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 2 - THẢO' });
    
    if (await team2Card.count() > 0) {
      await team2Card.click();
      console.log('✅ Đã click NHÓM 2 - THẢO');
      
      // Đợi và capture logs
      await page.waitForTimeout(3000);
      
      // Kiểm tra header
      const header = await page.locator('h3').filter({ hasText: 'NHÓM' }).textContent();
      console.log(`📋 Header hiện tại: ${header}`);
      
      // Đếm số tasks hiển thị
      const taskRows = await page.locator('tr:has(td)').count();
      console.log(`📊 Số tasks hiển thị: ${taskRows}`);
      
      // Lấy thông tin một vài tasks đầu tiên
      if (taskRows > 0) {
        for (let i = 0; i < Math.min(5, taskRows); i++) {
          const taskTitle = await page.locator('tr:has(td)').nth(i).locator('td').first().textContent();
          console.log(`📋 Task ${i + 1}: ${taskTitle}`);
        }
      }
      
      // Kiểm tra console logs về filtering
      console.log('\n🔍 Console logs về team filtering:');
      const teamFilteringLogs = consoleLogs.filter(log => 
        log.includes('selectedTeamForView') || 
        log.includes('TEAM FILTERING') ||
        log.includes('Task "') ||
        log.includes('team_id')
      );
      teamFilteringLogs.forEach(log => console.log(`   ${log}`));
      
    } else {
      console.log('❌ Không tìm thấy NHÓM 2 - THẢO');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-team-filtering-detailed.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await browser.close();
  }
}

debugTeamFiltering();
