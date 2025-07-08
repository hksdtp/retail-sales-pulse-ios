// Manual test để verify team navigation fix
import { chromium } from 'playwright';

async function testTeamNavigation() {
  console.log('🚀 Bắt đầu test team navigation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Bước 1: Đăng nhập
    console.log('📝 Bước 1: Đăng nhập với Khổng Đức Mạnh');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Chọn địa điểm
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(1000);
    
    // Chọn user
    await page.selectOption('select >> nth=1', { label: 'Khổng Đức Mạnh' });
    await page.waitForTimeout(1000);
    
    // Nhập password
    await page.fill('input[type="password"]', 'Haininh1');
    
    // Click đăng nhập
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    // Bước 2: Vào tab Công việc
    console.log('📝 Bước 2: Vào tab Công việc');
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(2000);
    
    // Bước 3: Vào tab Của nhóm
    console.log('📝 Bước 3: Vào tab Của nhóm');
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(3000);
    
    // Bước 4: Test chọn các nhóm khác nhau
    console.log('📝 Bước 4: Test chọn các nhóm');
    
    const teams = [
      'NHÓM 2 - THẢO',
      'NHÓM 3', 
      'NHÓM 4',
      'NHÓM 1 - VIỆT ANH'
    ];
    
    for (const teamName of teams) {
      console.log(`🎯 Test nhóm: ${teamName}`);
      
      // Tìm và click team card
      const teamCard = page.locator('.cursor-pointer').filter({ hasText: teamName });
      const exists = await teamCard.count() > 0;
      
      if (exists) {
        await teamCard.click();
        console.log(`✅ Đã click vào ${teamName}`);
        
        // Đợi 4 giây để xem có bị auto-redirect không
        await page.waitForTimeout(4000);
        
        // Kiểm tra header hiện tại
        const header = await page.locator('h3').filter({ hasText: 'NHÓM' }).textContent();
        console.log(`📋 Header hiện tại: ${header}`);
        
        if (header && header.includes(teamName)) {
          console.log(`✅ SUCCESS: Đúng nhóm ${teamName}`);
        } else {
          console.log(`❌ BUG: Chọn ${teamName} nhưng hiển thị ${header}`);
        }
        
        // Quay lại danh sách nhóm
        const backButton = page.locator('button:has-text("Quay lại")');
        if (await backButton.count() > 0) {
          await backButton.click();
          await page.waitForTimeout(2000);
        }
      } else {
        console.log(`❌ Không tìm thấy nhóm: ${teamName}`);
      }
    }
    
    console.log('✅ Test hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi trong test:', error);
  } finally {
    await browser.close();
  }
}

// Chạy test
testTeamNavigation();
