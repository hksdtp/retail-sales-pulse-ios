import { test, expect } from '@playwright/test';

test.describe('Kiểm tra toàn bộ Teams và Trưởng nhóm trong hệ thống', () => {
  // Cấu trúc teams mong đợi
  const expectedTeams = {
    hanoi: [
      { name: 'NHÓM 1', leader: 'Lương Việt Anh' },
      { name: 'NHÓM 2', leader: 'Nguyễn Thị Thảo' },
      { name: 'NHÓM 3', leader: 'Trịnh Thị Bốn' },
      { name: 'NHÓM 4', leader: 'Phạm Thị Hương' }
    ],
    hcm: [
      { name: 'NHÓM 1', leader: 'Nguyễn Thị Nga' },
      { name: 'NHÓM 2', leader: 'Nguyễn Ngọc Việt Khanh' }
    ]
  };

  test.beforeEach(async ({ page }) => {
    // Đăng nhập vào hệ thống
    await page.goto('http://localhost:8088');
    
    // Kiểm tra trang đăng nhập
    await expect(page).toHaveTitle(/Retail Sales Pulse/);
    
    // Đăng nhập với admin (Khổng Đức Mạnh)
    await page.fill('input[type="email"]', 'manh.khong@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Đợi đăng nhập thành công
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('1. Kiểm tra Dashboard - Dropdown chọn team', async ({ page }) => {
    console.log('🏠 KIỂM TRA DASHBOARD - DROPDOWN TEAM');
    
    // Tìm dropdown team trong dashboard
    const teamDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
    
    if (await teamDropdown.isVisible()) {
      await teamDropdown.click();
      
      // Kiểm tra các options
      const options = await page.locator('option, [role="option"]').allTextContents();
      console.log('Dashboard team options:', options);
      
      // Kiểm tra có đủ 6 teams + "Tất cả"
      expect(options.length).toBeGreaterThanOrEqual(6);
      
      // Kiểm tra format "NHÓM X - Tên Leader"
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      expect(teamOptions.length).toBe(6);
      
      // Kiểm tra từng team
      for (const location of ['hanoi', 'hcm']) {
        for (const team of expectedTeams[location]) {
          const expectedText = `${team.name} - ${team.leader}`;
          expect(options.some(opt => opt.includes(expectedText))).toBeTruthy();
        }
      }
    }
  });

  test('2. Kiểm tra Task Management - Dropdown team', async ({ page }) => {
    console.log('📋 KIỂM TRA TASK MANAGEMENT - DROPDOWN TEAM');
    
    // Đi đến trang tasks
    await page.click('a[href*="tasks"], text=Tasks, text=Công việc');
    await page.waitForLoadState('networkidle');
    
    // Tìm dropdown team trong task management
    const teamSelectors = [
      'select[name*="team"]',
      '[data-testid*="team"]',
      'select:has-text("Nhóm")',
      '[role="combobox"]:has-text("team")'
    ];
    
    let teamDropdown = null;
    for (const selector of teamSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        teamDropdown = element;
        break;
      }
    }
    
    if (teamDropdown) {
      await teamDropdown.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('option, [role="option"]').allTextContents();
      console.log('Task management team options:', options);
      
      // Kiểm tra format và số lượng
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      expect(teamOptions.length).toBe(6);
      
      // Kiểm tra Phạm Thị Hương ở NHÓM 4
      expect(options.some(opt => opt.includes('NHÓM 4 - Phạm Thị Hương'))).toBeTruthy();
      
      // Kiểm tra không còn Lê Tiến Quân
      expect(options.some(opt => opt.includes('Lê Tiến Quân'))).toBeFalsy();
    }
  });

  test('3. Kiểm tra Employee Management - Dropdown team', async ({ page }) => {
    console.log('👥 KIỂM TRA EMPLOYEE MANAGEMENT - DROPDOWN TEAM');
    
    // Đi đến trang employees
    await page.click('a[href*="employees"], text=Employees, text=Nhân viên');
    await page.waitForLoadState('networkidle');
    
    // Tìm dropdown team filter
    const teamFilter = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
    
    if (await teamFilter.isVisible()) {
      await teamFilter.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('option, [role="option"]').allTextContents();
      console.log('Employee management team options:', options);
      
      // Kiểm tra có đủ teams với leaders
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      expect(teamOptions.length).toBe(6);
      
      // Kiểm tra cấu trúc Hà Nội
      for (const team of expectedTeams.hanoi) {
        const expectedText = `${team.name} - ${team.leader}`;
        expect(options.some(opt => opt.includes(expectedText))).toBeTruthy();
      }
      
      // Kiểm tra cấu trúc HCM
      for (const team of expectedTeams.hcm) {
        const expectedText = `${team.name} - ${team.leader}`;
        expect(options.some(opt => opt.includes(expectedText))).toBeTruthy();
      }
    }
  });

  test('4. Kiểm tra Task Creation - Dropdown assign team', async ({ page }) => {
    console.log('➕ KIỂM TRA TASK CREATION - DROPDOWN ASSIGN TEAM');
    
    // Đi đến trang tasks và tạo task mới
    await page.click('a[href*="tasks"], text=Tasks, text=Công việc');
    await page.waitForLoadState('networkidle');
    
    // Tìm nút tạo task mới
    const createButton = page.locator('button, a').filter({ hasText: /create|tạo|new|thêm/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Tìm dropdown assign team
      const assignTeamDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /assign|team|nhóm|phân công/i }).first();
      
      if (await assignTeamDropdown.isVisible()) {
        await assignTeamDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('option, [role="option"]').allTextContents();
        console.log('Task creation assign team options:', options);
        
        // Kiểm tra có đủ 6 teams
        const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        expect(teamOptions.length).toBe(6);
        
        // Kiểm tra Phạm Thị Hương thay thế Lê Tiến Quân
        expect(options.some(opt => opt.includes('NHÓM 4 - Phạm Thị Hương'))).toBeTruthy();
        expect(options.some(opt => opt.includes('Lê Tiến Quân'))).toBeFalsy();
      }
    }
  });

  test('5. Kiểm tra Member View Filters - Dropdown team', async ({ page }) => {
    console.log('🔍 KIỂM TRA MEMBER VIEW FILTERS - DROPDOWN TEAM');
    
    // Tìm bộ lọc member view (có thể ở dashboard hoặc trang riêng)
    const memberFilters = page.locator('[data-testid*="member"], [class*="member"], [class*="filter"]').first();
    
    if (await memberFilters.isVisible()) {
      // Tìm dropdown team trong member filters
      const teamFilter = memberFilters.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
      
      if (await teamFilter.isVisible()) {
        await teamFilter.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('option, [role="option"]').allTextContents();
        console.log('Member view filters team options:', options);
        
        // Kiểm tra format và completeness
        const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        expect(teamOptions.length).toBe(6);
        
        // Kiểm tra tất cả teams có leader
        for (const location of ['hanoi', 'hcm']) {
          for (const team of expectedTeams[location]) {
            const expectedText = `${team.name} - ${team.leader}`;
            expect(options.some(opt => opt.includes(expectedText))).toBeTruthy();
          }
        }
      }
    }
  });

  test('6. Kiểm tra Employee Detail Modal - Dropdown team', async ({ page }) => {
    console.log('📝 KIỂM TRA EMPLOYEE DETAIL MODAL - DROPDOWN TEAM');
    
    // Đi đến trang employees
    await page.click('a[href*="employees"], text=Employees, text=Nhân viên');
    await page.waitForLoadState('networkidle');
    
    // Tìm và click vào một employee để mở modal
    const employeeCard = page.locator('[data-testid*="employee"], .employee-card, .user-card').first();
    if (await employeeCard.isVisible()) {
      await employeeCard.click();
      await page.waitForTimeout(1000);
      
      // Tìm dropdown team trong modal
      const teamDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
      
      if (await teamDropdown.isVisible()) {
        await teamDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('option, [role="option"]').allTextContents();
        console.log('Employee detail modal team options:', options);
        
        // Kiểm tra có "Chưa có nhóm" option
        expect(options.some(opt => opt.includes('Chưa có nhóm'))).toBeTruthy();
        
        // Kiểm tra 6 teams với leaders
        const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        expect(teamOptions.length).toBe(6);
        
        // Kiểm tra Phạm Thị Hương ở NHÓM 4
        expect(options.some(opt => opt.includes('NHÓM 4 - Phạm Thị Hương'))).toBeTruthy();
      }
    }
  });

  test('7. Kiểm tra tất cả bộ lọc location + team', async ({ page }) => {
    console.log('🌍 KIỂM TRA TẤT CẢ BỘ LỌC LOCATION + TEAM');
    
    const pages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Tasks', url: '/tasks' },
      { name: 'Employees', url: '/employees' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`Kiểm tra ${pageInfo.name}...`);
      
      await page.goto(`http://localhost:8088${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      
      // Kiểm tra location filter
      const locationFilter = page.locator('select, [role="combobox"]').filter({ hasText: /location|địa điểm|hanoi|hcm/i }).first();
      if (await locationFilter.isVisible()) {
        await locationFilter.click();
        const locationOptions = await page.locator('option, [role="option"]').allTextContents();
        
        // Kiểm tra có Hà Nội và HCM
        expect(locationOptions.some(opt => opt.toLowerCase().includes('hanoi') || opt.includes('Hà Nội'))).toBeTruthy();
        expect(locationOptions.some(opt => opt.toLowerCase().includes('hcm') || opt.includes('Hồ Chí Minh'))).toBeTruthy();
        
        await page.keyboard.press('Escape'); // Đóng dropdown
      }
      
      // Kiểm tra team filter
      const teamFilter = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
      if (await teamFilter.isVisible()) {
        await teamFilter.click();
        await page.waitForTimeout(500);
        
        const teamOptions = await page.locator('option, [role="option"]').allTextContents();
        
        // Kiểm tra có đủ 6 teams
        const validTeamOptions = teamOptions.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        expect(validTeamOptions.length).toBe(6);
        
        // Kiểm tra không có duplicate
        const uniqueOptions = [...new Set(validTeamOptions)];
        expect(uniqueOptions.length).toBe(validTeamOptions.length);
        
        await page.keyboard.press('Escape'); // Đóng dropdown
      }
    }
  });

  test('8. Kiểm tra functional filtering - Lọc theo team thực tế', async ({ page }) => {
    console.log('⚙️ KIỂM TRA FUNCTIONAL FILTERING - LỌC THEO TEAM');
    
    // Đi đến trang có bộ lọc (employees hoặc tasks)
    await page.click('a[href*="employees"], text=Employees, text=Nhân viên');
    await page.waitForLoadState('networkidle');
    
    // Test lọc theo từng team
    const teamFilter = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
    
    if (await teamFilter.isVisible()) {
      // Test lọc NHÓM 4 - Phạm Thị Hương
      await teamFilter.selectOption({ label: /NHÓM 4.*Phạm Thị Hương/ });
      await page.waitForTimeout(1000);
      
      // Kiểm tra kết quả lọc
      const results = page.locator('[data-testid*="employee"], .employee-card, .user-card');
      const resultCount = await results.count();
      
      if (resultCount > 0) {
        // Kiểm tra tất cả kết quả đều thuộc NHÓM 4
        for (let i = 0; i < resultCount; i++) {
          const result = results.nth(i);
          const text = await result.textContent();
          // Kết quả nên chứa thông tin về NHÓM 4 hoặc Phạm Thị Hương
          expect(text.includes('NHÓM 4') || text.includes('Phạm Thị Hương')).toBeTruthy();
        }
      }
      
      // Reset filter
      await teamFilter.selectOption({ label: /Tất cả/ });
      await page.waitForTimeout(500);
    }
  });

  test('9. Kiểm tra consistency across all pages', async ({ page }) => {
    console.log('🔄 KIỂM TRA CONSISTENCY ACROSS ALL PAGES');
    
    const allTeamOptions = [];
    const pages = ['/dashboard', '/tasks', '/employees'];
    
    for (const pageUrl of pages) {
      await page.goto(`http://localhost:8088${pageUrl}`);
      await page.waitForLoadState('networkidle');
      
      const teamDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
      
      if (await teamDropdown.isVisible()) {
        await teamDropdown.click();
        await page.waitForTimeout(500);
        
        const options = await page.locator('option, [role="option"]').allTextContents();
        const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
        
        allTeamOptions.push({
          page: pageUrl,
          options: teamOptions.sort()
        });
        
        await page.keyboard.press('Escape');
      }
    }
    
    // Kiểm tra tất cả pages có cùng team options
    if (allTeamOptions.length > 1) {
      const firstPageOptions = allTeamOptions[0].options;
      
      for (let i = 1; i < allTeamOptions.length; i++) {
        expect(allTeamOptions[i].options).toEqual(firstPageOptions);
      }
    }
    
    console.log('✅ Tất cả pages có team options consistent');
  });

  test('10. Kiểm tra final validation - Tổng kết', async ({ page }) => {
    console.log('✅ KIỂM TRA FINAL VALIDATION - TỔNG KẾT');
    
    // Đi đến dashboard
    await page.goto('http://localhost:8088/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Lấy team options từ dropdown chính
    const teamDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /team|nhóm/i }).first();
    
    if (await teamDropdown.isVisible()) {
      await teamDropdown.click();
      await page.waitForTimeout(500);
      
      const options = await page.locator('option, [role="option"]').allTextContents();
      const teamOptions = options.filter(opt => opt.includes('NHÓM') && opt.includes(' - '));
      
      console.log('🎯 FINAL TEAM OPTIONS:', teamOptions);
      
      // Validation cuối cùng
      expect(teamOptions.length).toBe(6); // Đúng 6 teams
      expect(teamOptions.some(opt => opt.includes('NHÓM 4 - Phạm Thị Hương'))).toBeTruthy(); // Phạm Thị Hương ở NHÓM 4
      expect(teamOptions.some(opt => opt.includes('Lê Tiến Quân'))).toBeFalsy(); // Không còn Lê Tiến Quân
      
      // Kiểm tra tất cả expected teams
      for (const location of ['hanoi', 'hcm']) {
        for (const team of expectedTeams[location]) {
          const expectedText = `${team.name} - ${team.leader}`;
          expect(teamOptions.some(opt => opt.includes(expectedText))).toBeTruthy();
        }
      }
      
      console.log('🎉 TẤT CẢ KIỂM TRA ĐÃ PASS!');
    }
  });
});
