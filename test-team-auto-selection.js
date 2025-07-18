import { chromium } from 'playwright';

async function testTeamAutoSelection() {
  console.log('🧪 Bắt đầu test logic auto-selection team cho non-director users...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // Chậm lại để quan sát
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Truy cập trang web
    console.log('📱 Truy cập http://localhost:8088...');
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // 2. Test với Nguyễn Mạnh Linh (member)
    console.log('👤 Test với Nguyễn Mạnh Linh (member)...');
    
    // Kiểm tra xem có form login không
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      console.log('🔐 Đăng nhập với Nguyễn Mạnh Linh...');
      
      // Nhập email
      await page.fill('input[type="email"]', 'linh@company.com');
      await page.waitForTimeout(1000);
      
      // Nhập password
      await page.fill('input[type="password"]', '123456');
      await page.waitForTimeout(1000);
      
      // Click đăng nhập
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 3. Vào menu "Công việc"
    console.log('📋 Vào menu "Công việc"...');
    const taskMenu = page.locator('text=Công việc').first();
    if (await taskMenu.isVisible()) {
      await taskMenu.click();
      await page.waitForTimeout(3000);
    }
    
    // 4. Kiểm tra xem có hiển thị team selector không
    console.log('🔍 Kiểm tra team selector...');
    const teamSelector = page.locator('text=Chọn nhóm');
    const teamCards = page.locator('[data-testid="team-cards"]');
    
    const hasteamSelector = await teamSelector.isVisible();
    const hasTeamCards = await teamCards.isVisible();
    
    console.log(`📊 Kết quả kiểm tra:`);
    console.log(`  - Team selector visible: ${hasteamSelector}`);
    console.log(`  - Team cards visible: ${hasTeamCards}`);
    
    // 5. Kiểm tra xem có hiển thị tasks của team không
    const taskList = page.locator('[data-testid="task-list"]');
    const teamTasks = page.locator('text=Công việc của nhóm');
    
    const hasTaskList = await taskList.isVisible();
    const hasTeamTasks = await teamTasks.isVisible();
    
    console.log(`  - Task list visible: ${hasTaskList}`);
    console.log(`  - Team tasks header visible: ${hasTeamTasks}`);
    
    // 6. Chụp screenshot
    await page.screenshot({ path: 'test-team-auto-selection-member.png', fullPage: true });
    console.log('📸 Screenshot saved: test-team-auto-selection-member.png');
    
    // 7. Test với director (nếu có thể)
    console.log('🔄 Đăng xuất để test với director...');
    const logoutButton = page.locator('text=Đăng xuất');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      
      // Đăng nhập với Khổng Đức Mạnh
      console.log('👑 Đăng nhập với Khổng Đức Mạnh (director)...');
      await page.fill('input[type="email"]', 'manh@company.com');
      await page.waitForTimeout(1000);
      await page.fill('input[type="password"]', '123456');
      await page.waitForTimeout(1000);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Vào menu "Công việc"
      const taskMenuDirector = page.locator('text=Công việc').first();
      if (await taskMenuDirector.isVisible()) {
        await taskMenuDirector.click();
        await page.waitForTimeout(3000);
      }
      
      // Kiểm tra director có thấy team selector không
      const directorTeamSelector = await page.locator('text=Chọn nhóm').isVisible();
      const directorTeamCards = await page.locator('[data-testid="team-cards"]').isVisible();
      
      console.log(`📊 Kết quả kiểm tra Director:`);
      console.log(`  - Team selector visible: ${directorTeamSelector}`);
      console.log(`  - Team cards visible: ${directorTeamCards}`);
      
      await page.screenshot({ path: 'test-team-auto-selection-director.png', fullPage: true });
      console.log('📸 Screenshot saved: test-team-auto-selection-director.png');
    }
    
    console.log('✅ Test hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
    await page.screenshot({ path: 'test-team-auto-selection-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Chạy test
testTeamAutoSelection().catch(console.error);
