import { chromium } from 'playwright';

async function testTeamLogic() {
  console.log('🧪 Test logic team auto-selection...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Truy cập trang web
    console.log('📱 Truy cập http://localhost:8088...');
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(5000);
    
    // Chụp screenshot trang chủ
    await page.screenshot({ path: 'test-homepage.png', fullPage: true });
    console.log('📸 Screenshot trang chủ: test-homepage.png');
    
    // Tìm và click vào menu "Công việc"
    console.log('🔍 Tìm menu "Công việc"...');
    
    // Thử nhiều selector khác nhau
    const selectors = [
      'text=Công việc',
      '[href*="tasks"]',
      'a:has-text("Công việc")',
      'nav a:has-text("Công việc")',
      '.nav-link:has-text("Công việc")'
    ];
    
    let taskMenuFound = false;
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Tìm thấy menu "Công việc" với selector: ${selector}`);
          await element.click();
          taskMenuFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Không tìm thấy với selector: ${selector}`);
      }
    }
    
    if (!taskMenuFound) {
      console.log('🔍 Liệt kê tất cả links có sẵn...');
      const links = await page.locator('a').all();
      for (let i = 0; i < Math.min(links.length, 10); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        console.log(`  Link ${i}: "${text}" -> ${href}`);
      }
    }
    
    await page.waitForTimeout(3000);
    
    // Chụp screenshot sau khi click
    await page.screenshot({ path: 'test-after-click.png', fullPage: true });
    console.log('📸 Screenshot sau khi click: test-after-click.png');
    
    // Kiểm tra các elements liên quan đến team
    console.log('🔍 Kiểm tra elements team...');
    
    const teamElements = [
      'text=Chọn nhóm',
      'text=Tất cả nhóm', 
      'text=Của nhóm',
      '[data-testid="team-selector"]',
      '.team-selector',
      '.team-cards'
    ];
    
    for (const selector of teamElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 1000 });
        console.log(`  ${selector}: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
      } catch (e) {
        console.log(`  ${selector}: ❌ Not found`);
      }
    }
    
    // Kiểm tra console logs
    console.log('📋 Kiểm tra console logs...');
    page.on('console', msg => {
      if (msg.text().includes('team') || msg.text().includes('Team') || msg.text().includes('director')) {
        console.log(`🔍 Console: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(5000);
    
    console.log('✅ Test hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testTeamLogic().catch(console.error);
