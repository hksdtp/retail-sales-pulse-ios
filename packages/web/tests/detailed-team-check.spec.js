import { test, expect } from '@playwright/test';

test.describe('Kiểm tra chi tiết Teams và Dropdowns', () => {
  test('Tìm và kiểm tra tất cả dropdowns trong hệ thống', async ({ page }) => {
    console.log('🔍 TÌM VÀ KIỂM TRA TẤT CẢ DROPDOWNS');
    
    // 1. Đi đến trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // 2. Đăng nhập nếu cần
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
    }
    
    // 3. Kiểm tra Dashboard
    console.log('🏠 KIỂM TRA DASHBOARD CHI TIẾT:');
    await page.goto('http://localhost:8088/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Tìm tất cả select elements
    const allSelects = await page.locator('select').all();
    console.log(`📋 Tìm thấy ${allSelects.length} select elements trong Dashboard`);
    
    for (let i = 0; i < allSelects.length; i++) {
      const select = allSelects[i];
      const isVisible = await select.isVisible();
      if (isVisible) {
        const options = await select.locator('option').allTextContents();
        console.log(`Select ${i + 1}:`, options);
      }
    }
    
    // Tìm tất cả combobox elements
    const allComboboxes = await page.locator('[role="combobox"]').all();
    console.log(`📋 Tìm thấy ${allComboboxes.length} combobox elements trong Dashboard`);
    
    for (let i = 0; i < allComboboxes.length; i++) {
      const combobox = allComboboxes[i];
      const isVisible = await combobox.isVisible();
      if (isVisible) {
        await combobox.click();
        await page.waitForTimeout(500);
        const options = await page.locator('[role="option"]').allTextContents();
        console.log(`Combobox ${i + 1}:`, options);
        await page.keyboard.press('Escape');
      }
    }
    
    // 4. Kiểm tra Tasks page
    console.log('\n📋 KIỂM TRA TASKS PAGE CHI TIẾT:');
    
    // Tìm link tasks
    const tasksLinks = await page.locator('a').all();
    let tasksFound = false;
    
    for (const link of tasksLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && (href.includes('tasks') || text?.toLowerCase().includes('task') || text?.toLowerCase().includes('công việc'))) {
        console.log(`🔗 Tìm thấy link tasks: ${text} -> ${href}`);
        await link.click();
        await page.waitForLoadState('networkidle');
        tasksFound = true;
        break;
      }
    }
    
    if (tasksFound) {
      // Tìm dropdowns trong tasks
      const tasksSelects = await page.locator('select').all();
      console.log(`📋 Tìm thấy ${tasksSelects.length} select elements trong Tasks`);
      
      for (let i = 0; i < tasksSelects.length; i++) {
        const select = tasksSelects[i];
        const isVisible = await select.isVisible();
        if (isVisible) {
          const options = await select.locator('option').allTextContents();
          console.log(`Tasks Select ${i + 1}:`, options);
        }
      }
      
      const tasksComboboxes = await page.locator('[role="combobox"]').all();
      console.log(`📋 Tìm thấy ${tasksComboboxes.length} combobox elements trong Tasks`);
      
      for (let i = 0; i < tasksComboboxes.length; i++) {
        const combobox = tasksComboboxes[i];
        const isVisible = await combobox.isVisible();
        if (isVisible) {
          await combobox.click();
          await page.waitForTimeout(500);
          const options = await page.locator('[role="option"]').allTextContents();
          console.log(`Tasks Combobox ${i + 1}:`, options);
          await page.keyboard.press('Escape');
        }
      }
    }
    
    // 5. Kiểm tra Employees page
    console.log('\n👥 KIỂM TRA EMPLOYEES PAGE CHI TIẾT:');
    
    // Tìm link employees
    const employeesLinks = await page.locator('a').all();
    let employeesFound = false;
    
    for (const link of employeesLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && (href.includes('employees') || text?.toLowerCase().includes('employee') || text?.toLowerCase().includes('nhân viên'))) {
        console.log(`🔗 Tìm thấy link employees: ${text} -> ${href}`);
        await link.click();
        await page.waitForLoadState('networkidle');
        employeesFound = true;
        break;
      }
    }
    
    if (employeesFound) {
      // Tìm dropdowns trong employees
      const employeesSelects = await page.locator('select').all();
      console.log(`📋 Tìm thấy ${employeesSelects.length} select elements trong Employees`);
      
      for (let i = 0; i < employeesSelects.length; i++) {
        const select = employeesSelects[i];
        const isVisible = await select.isVisible();
        if (isVisible) {
          const options = await select.locator('option').allTextContents();
          console.log(`Employees Select ${i + 1}:`, options);
          
          // Kiểm tra xem có phải team dropdown không
          const hasTeamOptions = options.some(opt => opt.includes('NHÓM') && opt.includes(' - '));
          if (hasTeamOptions) {
            console.log(`✅ Tìm thấy team dropdown với ${options.filter(opt => opt.includes('NHÓM')).length} teams!`);
            
            // Kiểm tra Phạm Thị Hương
            const hasHuong = options.some(opt => opt.includes('Phạm Thị Hương'));
            console.log(`👩‍💼 Có Phạm Thị Hương: ${hasHuong ? 'CÓ' : 'KHÔNG'}`);
            
            // Kiểm tra Lê Tiến Quân
            const hasQuan = options.some(opt => opt.includes('Lê Tiến Quân'));
            console.log(`👨‍💼 Có Lê Tiến Quân: ${hasQuan ? 'CÓ' : 'KHÔNG'}`);
          }
        }
      }
      
      const employeesComboboxes = await page.locator('[role="combobox"]').all();
      console.log(`📋 Tìm thấy ${employeesComboboxes.length} combobox elements trong Employees`);
      
      for (let i = 0; i < employeesComboboxes.length; i++) {
        const combobox = employeesComboboxes[i];
        const isVisible = await combobox.isVisible();
        if (isVisible) {
          await combobox.click();
          await page.waitForTimeout(500);
          const options = await page.locator('[role="option"]').allTextContents();
          console.log(`Employees Combobox ${i + 1}:`, options);
          
          // Kiểm tra xem có phải team dropdown không
          const hasTeamOptions = options.some(opt => opt.includes('NHÓM') && opt.includes(' - '));
          if (hasTeamOptions) {
            console.log(`✅ Tìm thấy team combobox với ${options.filter(opt => opt.includes('NHÓM')).length} teams!`);
            
            // Kiểm tra Phạm Thị Hương
            const hasHuong = options.some(opt => opt.includes('Phạm Thị Hương'));
            console.log(`👩‍💼 Có Phạm Thị Hương: ${hasHuong ? 'CÓ' : 'KHÔNG'}`);
            
            // Kiểm tra Lê Tiến Quân
            const hasQuan = options.some(opt => opt.includes('Lê Tiến Quân'));
            console.log(`👨‍💼 Có Lê Tiến Quân: ${hasQuan ? 'CÓ' : 'KHÔNG'}`);
          }
          
          await page.keyboard.press('Escape');
        }
      }
    }
    
    // 6. Tìm kiếm trong toàn bộ DOM
    console.log('\n🔍 TÌM KIẾM TRONG TOÀN BỘ DOM:');
    
    // Tìm tất cả text chứa "NHÓM"
    const teamTexts = await page.locator('text=NHÓM').all();
    console.log(`📋 Tìm thấy ${teamTexts.length} elements chứa "NHÓM"`);
    
    for (let i = 0; i < Math.min(teamTexts.length, 10); i++) {
      const text = await teamTexts[i].textContent();
      console.log(`NHÓM ${i + 1}: ${text}`);
    }
    
    // Tìm tất cả text chứa "Phạm Thị Hương"
    const huongTexts = await page.locator('text=Phạm Thị Hương').all();
    console.log(`👩‍💼 Tìm thấy ${huongTexts.length} elements chứa "Phạm Thị Hương"`);
    
    // Tìm tất cả text chứa "Lê Tiến Quân"
    const quanTexts = await page.locator('text=Lê Tiến Quân').all();
    console.log(`👨‍💼 Tìm thấy ${quanTexts.length} elements chứa "Lê Tiến Quân"`);
    
    // 7. Kiểm tra network requests
    console.log('\n🌐 KIỂM TRA NETWORK REQUESTS:');
    
    // Listen for API calls
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/users') || url.includes('/teams')) {
        console.log(`📡 API Call: ${response.status()} ${url}`);
      }
    });
    
    // Refresh để trigger API calls
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('\n✅ HOÀN THÀNH KIỂM TRA CHI TIẾT!');
  });
});
