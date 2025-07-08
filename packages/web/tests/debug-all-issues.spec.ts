import { test, expect } from '@playwright/test';

test.describe('Debug All Issues', () => {
  test('Debug all 4 reported issues comprehensively', async ({ page }) => {
    console.log('🔍 Debugging all 4 reported issues...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      
      if (msg.type() === 'error') {
        errorMessages.push(text);
      }
    });
    
    console.log('📝 ISSUE 1: Test password change logic');
    
    // Setup user with changed password
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      // Set a changed password for Lê Khánh Duy
      localStorage.setItem('user_password_user_khanh_duy', 'newpassword123');
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1',
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Nhân viên',
        status: 'active',
        password_changed: true // Mark as password changed
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    // Test logout and login with new password
    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(2000);
    
    // Try login with old password (should fail)
    const locationSelect = await page.locator('select').first();
    await locationSelect.selectOption('hanoi');
    
    const userSelect = await page.locator('select').nth(1);
    await userSelect.selectOption('user_khanh_duy');
    
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill('123456'); // Old password
    
    const loginButton = await page.locator('button:has-text("Đăng nhập")').first();
    await loginButton.click();
    await page.waitForTimeout(2000);
    
    // Check if login failed
    const errorToast = await page.locator(':has-text("Mật khẩu không đúng")').first();
    const hasErrorToast = await errorToast.isVisible();
    console.log(`🔐 ISSUE 1 - Old password rejected: ${hasErrorToast}`);
    
    // Try login with new password (should succeed)
    await passwordInput.fill('newpassword123'); // New password
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    const isOnTasksPage = page.url().includes('/tasks');
    console.log(`🔐 ISSUE 1 - New password accepted: ${isOnTasksPage}`);
    
    if (!isOnTasksPage) {
      console.log('❌ ISSUE 1 FAILED: Password change logic not working');
      return;
    }
    
    console.log('📝 ISSUE 2: Test personal tasks visibility');
    
    // Ensure we're on personal tab
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    // Count personal tasks
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 ISSUE 2 - Personal tasks count: ${personalTasks.length}`);
    
    // Create a new task to test
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Debug Task - ${Date.now()}`;
    
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Debug task for issue testing');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(1000);
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(5000);
    
    // Check if task appears in personal tab
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    const ourTask = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTaskInPersonal = await ourTask.isVisible();
    console.log(`👤 ISSUE 2 - Our task visible in personal: ${hasOurTaskInPersonal}`);
    
    const personalTasksAfter = await page.locator('tr:has(td)').all();
    console.log(`👤 ISSUE 2 - Personal tasks after creation: ${personalTasksAfter.length}`);
    
    console.log('📝 ISSUE 3: Test team filtering logic');
    
    // Switch to Director user
    await page.evaluate(() => {
      const director = {
        id: 'user_khong_duc_manh',
        name: 'Khổng Đức Mạnh',
        email: 'khong.duc.manh@example.com',
        role: 'retail_director',
        team_id: 'director',
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Trưởng phòng kinh doanh',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(director));
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Go to team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(2000);
    
    // Check team 1 (should have Lê Khánh Duy's task)
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    await team1Card.click();
    await page.waitForTimeout(2000);
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    const hasOurTaskInTeam1 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
    console.log(`👥 ISSUE 3 - Our task in Team 1: ${hasOurTaskInTeam1} (${team1Tasks.length} total)`);
    
    // Go back to team selection
    const backButton = await page.locator('button:has-text("← Quay lại")').first();
    const hasBackButton = await backButton.isVisible();
    
    if (hasBackButton) {
      await backButton.click();
      await page.waitForTimeout(2000);
      
      // Check team 2 (should NOT have Lê Khánh Duy's task)
      const team2Card = await page.locator(':has-text("NHÓM 2 - THẢO")').first();
      await team2Card.click();
      await page.waitForTimeout(2000);
      
      const team2Tasks = await page.locator('tr:has(td)').all();
      const hasOurTaskInTeam2 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`👥 ISSUE 3 - Our task in Team 2: ${hasOurTaskInTeam2} (${team2Tasks.length} total) - Should be FALSE`);
      
      if (hasOurTaskInTeam2) {
        console.log('❌ ISSUE 3 FAILED: Task appears in wrong team');
      } else {
        console.log('✅ ISSUE 3 PASSED: Task filtering by team works');
      }
    }
    
    console.log('📝 ISSUE 4: Test member view');
    
    // Go to member tab
    const memberTab = await page.locator('button:has-text("Thành viên")').first();
    const hasMemberTab = await memberTab.isVisible();
    console.log(`📋 ISSUE 4 - Member tab visible: ${hasMemberTab}`);
    
    if (hasMemberTab) {
      await memberTab.click();
      await page.waitForTimeout(3000);
      
      const memberTasks = await page.locator('tr:has(td)').all();
      console.log(`📋 ISSUE 4 - Member view tasks: ${memberTasks.length}`);
      
      const hasOurTaskInMember = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`📋 ISSUE 4 - Our task in member view: ${hasOurTaskInMember}`);
      
      if (memberTasks.length === 0) {
        console.log('❌ ISSUE 4 FAILED: Member view is empty');
      } else {
        console.log('✅ ISSUE 4 PASSED: Member view shows tasks');
      }
    }
    
    console.log('📝 Analyzing console logs for debugging');
    
    // Check for relevant logs
    const personalTaskLogs = consoleLogs.filter(log => 
      log.includes('Personal view') ||
      log.includes('personal tasks') ||
      log.includes('created by user') ||
      log.includes('isCreatedByCurrentUser')
    );
    
    if (personalTaskLogs.length > 0) {
      console.log('\n📋 Personal Task Logs:');
      personalTaskLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    const teamFilterLogs = consoleLogs.filter(log => 
      log.includes('team filtering') ||
      log.includes('team_id') ||
      log.includes('Team view')
    );
    
    if (teamFilterLogs.length > 0) {
      console.log('\n👥 Team Filter Logs:');
      teamFilterLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-all-issues.png', fullPage: true });
    
    console.log('\n✅ All issues debugging completed');
    
    // Summary
    console.log('\n📋 ISSUES SUMMARY:');
    console.log(`  1. Password change logic: ${hasErrorToast && isOnTasksPage ? 'WORKING' : 'BROKEN'}`);
    console.log(`  2. Personal tasks visibility: ${hasOurTaskInPersonal ? 'WORKING' : 'BROKEN'}`);
    console.log(`  3. Team filtering logic: ${hasOurTaskInTeam1 && !hasOurTaskInTeam2 ? 'WORKING' : 'BROKEN'}`);
    console.log(`  4. Member view: ${hasMemberTab && memberTasks.length > 0 ? 'WORKING' : 'BROKEN'}`);
  });
});
