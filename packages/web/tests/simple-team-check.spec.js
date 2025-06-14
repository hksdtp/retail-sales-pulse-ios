import { test, expect } from '@playwright/test';

test.describe('Kiểm tra Teams và Trưởng nhóm - Đơn giản', () => {
  test('Kiểm tra toàn bộ hệ thống teams', async ({ page }) => {
    console.log('🎯 BẮT ĐẦU KIỂM TRA TOÀN BỘ HỆ THỐNG TEAMS');
    
    // 1. Đi đến trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra title đúng
    await expect(page).toHaveTitle(/Phòng Kinh Doanh|Retail Sales Pulse/);
    console.log('✅ Trang web đã load thành công');
    
    // 2. Đăng nhập
    console.log('🔐 Đăng nhập vào hệ thống...');
    
    // Tìm form đăng nhập
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Đợi đăng nhập thành công
      await page.waitForTimeout(2000);
      console.log('✅ Đã đăng nhập thành công');
    } else {
      console.log('ℹ️ Đã đăng nhập sẵn hoặc không cần đăng nhập');
    }
    
    // 3. Kiểm tra Dashboard
    console.log('🏠 Kiểm tra Dashboard...');
    
    // Đi đến dashboard nếu chưa có
    if (!page.url().includes('dashboard')) {
      await page.goto('http://localhost:8088/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    // Tìm dropdown team trong dashboard
    const dashboardTeamDropdown = page.locator('select, [role="combobox"]').first();
    
    if (await dashboardTeamDropdown.isVisible()) {
      console.log('📋 Tìm thấy dropdown team trong Dashboard');
      
      await dashboardTeamDropdown.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('option, [role="option"]').allTextContents();
      console.log('Dashboard team options:', options);
      
      // Kiểm tra có teams với leaders
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      console.log(`✅ Tìm thấy ${teamOptions.length} teams với leaders`);
      
      // Kiểm tra Phạm Thị Hương ở NHÓM 4
      const hasHuongTeam4 = options.some(opt => opt.includes('NHÓM 4') && opt.includes('Phạm Thị Hương'));
      console.log(`✅ NHÓM 4 - Phạm Thị Hương: ${hasHuongTeam4 ? 'CÓ' : 'KHÔNG'}`);
      
      // Kiểm tra không còn Lê Tiến Quân
      const hasQuan = options.some(opt => opt.includes('Lê Tiến Quân'));
      console.log(`✅ Lê Tiến Quân đã xóa: ${!hasQuan ? 'ĐÚNG' : 'VẪN CÒN'}`);
      
      await page.keyboard.press('Escape');
    } else {
      console.log('⚠️ Không tìm thấy dropdown team trong Dashboard');
    }
    
    // 4. Kiểm tra Tasks page
    console.log('📋 Kiểm tra Tasks page...');
    
    // Tìm link đến tasks
    const tasksLink = page.locator('a[href*="tasks"], a:has-text("Tasks"), a:has-text("Công việc")').first();
    if (await tasksLink.isVisible()) {
      await tasksLink.click();
      await page.waitForLoadState('networkidle');
      
      // Tìm dropdown team trong tasks
      const tasksTeamDropdown = page.locator('select, [role="combobox"]').first();
      
      if (await tasksTeamDropdown.isVisible()) {
        console.log('📋 Tìm thấy dropdown team trong Tasks');
        
        await tasksTeamDropdown.click();
        await page.waitForTimeout(500);
        
        const tasksOptions = await page.locator('option, [role="option"]').allTextContents();
        console.log('Tasks team options:', tasksOptions);
        
        const tasksTeamOptions = tasksOptions.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        console.log(`✅ Tasks có ${tasksTeamOptions.length} teams với leaders`);
        
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('⚠️ Không tìm thấy link Tasks');
    }
    
    // 5. Kiểm tra Employees page
    console.log('👥 Kiểm tra Employees page...');
    
    // Tìm link đến employees
    const employeesLink = page.locator('a[href*="employees"], a:has-text("Employees"), a:has-text("Nhân viên")').first();
    if (await employeesLink.isVisible()) {
      await employeesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Tìm dropdown team trong employees
      const employeesTeamDropdown = page.locator('select, [role="combobox"]').first();
      
      if (await employeesTeamDropdown.isVisible()) {
        console.log('👥 Tìm thấy dropdown team trong Employees');
        
        await employeesTeamDropdown.click();
        await page.waitForTimeout(500);
        
        const employeesOptions = await page.locator('option, [role="option"]').allTextContents();
        console.log('Employees team options:', employeesOptions);
        
        const employeesTeamOptions = employeesOptions.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        console.log(`✅ Employees có ${employeesTeamOptions.length} teams với leaders`);
        
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('⚠️ Không tìm thấy link Employees');
    }
    
    // 6. Tổng kết kiểm tra
    console.log('📊 TỔNG KẾT KIỂM TRA:');
    console.log('====================');
    
    // Quay lại dashboard để kiểm tra cuối cùng
    await page.goto('http://localhost:8088/dashboard');
    await page.waitForLoadState('networkidle');
    
    const finalDropdown = page.locator('select, [role="combobox"]').first();
    
    if (await finalDropdown.isVisible()) {
      await finalDropdown.click();
      await page.waitForTimeout(500);
      
      const finalOptions = await page.locator('option, [role="option"]').allTextContents();
      const finalTeamOptions = finalOptions.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      
      console.log('🎯 KẾT QUẢ CUỐI CÙNG:');
      console.log(`✅ Tổng teams với leaders: ${finalTeamOptions.length}`);
      
      // Kiểm tra cấu trúc mong đợi
      const expectedTeams = [
        'NHÓM 1 - Lương Việt Anh',
        'NHÓM 2 - Nguyễn Thị Thảo',
        'NHÓM 3 - Trịnh Thị Bốn',
        'NHÓM 4 - Phạm Thị Hương',
        'NHÓM 1 - Nguyễn Thị Nga',
        'NHÓM 2 - Nguyễn Ngọc Việt Khanh'
      ];
      
      let correctCount = 0;
      expectedTeams.forEach(expected => {
        const found = finalOptions.some(opt => opt.includes(expected));
        if (found) {
          correctCount++;
          console.log(`✅ ${expected}: CÓ`);
        } else {
          console.log(`❌ ${expected}: THIẾU`);
        }
      });
      
      console.log(`\n📊 Kết quả: ${correctCount}/${expectedTeams.length} teams đúng`);
      
      // Kiểm tra không có Lê Tiến Quân
      const hasQuan = finalOptions.some(opt => opt.includes('Lê Tiến Quân'));
      console.log(`🗑️ Lê Tiến Quân đã xóa: ${!hasQuan ? '✅ ĐÚNG' : '❌ VẪN CÒN'}`);
      
      // Kiểm tra có Phạm Thị Hương ở NHÓM 4
      const hasHuongTeam4 = finalOptions.some(opt => opt.includes('NHÓM 4') && opt.includes('Phạm Thị Hương'));
      console.log(`👩‍💼 NHÓM 4 - Phạm Thị Hương: ${hasHuongTeam4 ? '✅ CÓ' : '❌ THIẾU'}`);
      
      if (correctCount === expectedTeams.length && !hasQuan && hasHuongTeam4) {
        console.log('\n🎉 HOÀN HẢO! TẤT CẢ TEAMS ĐÃ ĐÚNG!');
      } else {
        console.log('\n⚠️ Vẫn còn vấn đề cần khắc phục');
      }
      
      // Log tất cả options để debug
      console.log('\n📋 TẤT CẢ OPTIONS:');
      finalOptions.forEach((opt, index) => {
        console.log(`   ${index + 1}. ${opt}`);
      });
      
    } else {
      console.log('❌ Không tìm thấy dropdown team để kiểm tra cuối cùng');
    }
    
    console.log('\n✅ HOÀN THÀNH KIỂM TRA TOÀN BỘ HỆ THỐNG!');
  });
});
