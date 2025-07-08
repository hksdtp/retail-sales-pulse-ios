// Test để verify team filtering fix
import { chromium } from 'playwright';

async function testTeamFilteringFix() {
  console.log('🚀 Test team filtering fix...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  const page = await browser.newPage();
  
  try {
    // Đăng nhập
    console.log('📝 Đăng nhập...');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Chọn Hà Nội
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(1000);
    
    // Chọn Khổng Đức Mạnh (ID = 1)
    await page.selectOption('select >> nth=1', '1');
    await page.waitForTimeout(1000);
    
    // Nhập password
    await page.fill('input[type="password"]', 'Haininh1');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    // Vào Công việc
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(2000);
    
    // Vào Của nhóm
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(3000);
    
    console.log('📝 Test chọn NHÓM 2 - THẢO...');
    
    // Chọn NHÓM 2 - THẢO
    const team2Card = page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 2 - THẢO' });
    if (await team2Card.count() > 0) {
      await team2Card.click();
      await page.waitForTimeout(2000);
      
      // Kiểm tra header
      const header = await page.locator('h3').filter({ hasText: 'NHÓM' }).textContent();
      console.log(`📋 Header: ${header}`);
      
      // Đếm tasks
      const taskCount = await page.locator('tr:has(td)').count();
      console.log(`📊 Số tasks: ${taskCount}`);
      
      if (header?.includes('NHÓM 2 - THẢO')) {
        console.log('✅ SUCCESS: Header đúng NHÓM 2 - THẢO');
      } else {
        console.log('❌ FAIL: Header không đúng');
      }
      
      // Quay lại và test nhóm khác
      await page.click('button:has-text("Quay lại")');
      await page.waitForTimeout(2000);
      
      console.log('📝 Test chọn NHÓM 3...');
      
      // Chọn NHÓM 3
      const team3Card = page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 3' });
      if (await team3Card.count() > 0) {
        await team3Card.click();
        await page.waitForTimeout(2000);
        
        const header3 = await page.locator('h3').filter({ hasText: 'NHÓM' }).textContent();
        console.log(`📋 Header: ${header3}`);
        
        if (header3?.includes('NHÓM 3')) {
          console.log('✅ SUCCESS: Header đúng NHÓM 3');
        } else {
          console.log('❌ FAIL: Header không đúng');
        }
      }
    }
    
    await page.screenshot({ path: 'test-team-filtering-fix.png', fullPage: true });
    console.log('✅ Test hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await browser.close();
  }
}

testTeamFilteringFix();
