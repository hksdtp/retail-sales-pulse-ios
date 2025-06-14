import { test, expect } from '@playwright/test';

test.describe('Force Refresh và kiểm tra Teams', () => {
  test('Force refresh và kiểm tra teams dropdown', async ({ page }) => {
    console.log('🔄 FORCE REFRESH VÀ KIỂM TRA TEAMS');
    
    // 1. Clear cache và cookies
    await page.context().clearCookies();
    await page.context().clearPermissions();
    
    // 2. Đi đến trang với cache disabled
    await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
    
    // 3. Hard refresh
    await page.reload({ waitUntil: 'networkidle' });
    
    // 4. Đăng nhập
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
    }
    
    // 5. Đi đến employees page và force refresh
    await page.goto('http://localhost:8088/employees', { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    
    // 6. Đợi API calls hoàn thành
    await page.waitForTimeout(2000);
    
    // 7. Tìm team dropdown và click
    console.log('🔍 Tìm team dropdown...');
    
    // Thử nhiều cách tìm dropdown
    const selectors = [
      'select:has(option:text("Tất cả nhóm"))',
      '[role="combobox"]:has-text("nhóm")',
      'button:has-text("Tất cả nhóm")',
      '[data-testid*="team"]',
      '.team-select',
      'select:nth-of-type(3)',
      '[role="combobox"]:nth-of-type(3)'
    ];
    
    let teamDropdown = null;
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Tìm thấy dropdown với selector: ${selector}`);
        teamDropdown = element;
        break;
      }
    }
    
    if (teamDropdown) {
      // Click dropdown
      await teamDropdown.click();
      await page.waitForTimeout(1000);
      
      // Lấy tất cả options
      const options = await page.locator('option, [role="option"]').allTextContents();
      console.log('📋 Team dropdown options:', options);
      
      // Kiểm tra chi tiết
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      console.log(`✅ Teams với leaders: ${teamOptions.length}`);
      
      teamOptions.forEach((opt, index) => {
        console.log(`   ${index + 1}. ${opt}`);
      });
      
      // Kiểm tra cụ thể
      const hasHuongTeam4 = options.some(opt => opt.includes('NHÓM 4') && opt.includes('Phạm Thị Hương'));
      const hasQuan = options.some(opt => opt.includes('Lê Tiến Quân'));
      
      console.log(`👩‍💼 NHÓM 4 - Phạm Thị Hương: ${hasHuongTeam4 ? '✅ CÓ' : '❌ THIẾU'}`);
      console.log(`👨‍💼 Lê Tiến Quân: ${hasQuan ? '❌ VẪN CÒN' : '✅ ĐÃ XÓA'}`);
      
      // Kiểm tra tất cả expected teams
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
        const found = options.some(opt => opt.includes(expected));
        if (found) {
          correctCount++;
          console.log(`✅ ${expected}: CÓ`);
        } else {
          console.log(`❌ ${expected}: THIẾU`);
        }
      });
      
      console.log(`\n📊 Kết quả: ${correctCount}/${expectedTeams.length} teams đúng`);
      
      if (correctCount === expectedTeams.length && !hasQuan && hasHuongTeam4) {
        console.log('🎉 HOÀN HẢO! TẤT CẢ TEAMS ĐÃ ĐÚNG!');
      } else {
        console.log('⚠️ Vẫn còn vấn đề cần khắc phục');
        
        // Debug thêm
        console.log('\n🔍 DEBUG THÔNG TIN:');
        console.log('Tất cả options:', options);
        
        // Kiểm tra API response
        await page.route('**/users', route => {
          console.log('📡 API Users được gọi');
          route.continue();
        });
        
        await page.route('**/teams', route => {
          console.log('📡 API Teams được gọi');
          route.continue();
        });
        
        // Refresh lại để trigger API
        await page.reload({ waitUntil: 'networkidle' });
      }
      
      await page.keyboard.press('Escape');
    } else {
      console.log('❌ Không tìm thấy team dropdown');
      
      // Debug: Screenshot và DOM
      await page.screenshot({ path: 'debug-no-dropdown.png' });
      
      // Tìm tất cả elements có text "nhóm"
      const nhomElements = await page.locator('text=nhóm').all();
      console.log(`🔍 Tìm thấy ${nhomElements.length} elements chứa "nhóm"`);
      
      for (let i = 0; i < Math.min(nhomElements.length, 5); i++) {
        const text = await nhomElements[i].textContent();
        const tagName = await nhomElements[i].evaluate(el => el.tagName);
        console.log(`   ${i + 1}. <${tagName}>: ${text}`);
      }
    }
    
    console.log('\n✅ HOÀN THÀNH FORCE REFRESH CHECK!');
  });
});
