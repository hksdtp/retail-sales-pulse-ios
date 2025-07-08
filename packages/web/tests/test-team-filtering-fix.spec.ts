import { test, expect } from '@playwright/test';

test.describe('Test Team Filtering Fix', () => {
  test('Test team filtering after adding team_id to task creation', async ({ page }) => {
    console.log('🔍 Testing team filtering fix...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
    });
    
    console.log('📝 Step 1: Create task as Lê Khánh Duy (Team 1)');
    
    // Setup user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1', // Team 1 - Việt Anh
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Nhân viên',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Create a unique task
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Team Fix Test - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Test task with team_id fix');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(1000);
    
    // Clear logs before submission
    consoleLogs.length = 0;
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(5000);
    
    // Check if task was created
    const successLogs = consoleLogs.filter(log => 
      log.includes('Task added successfully')
    );
    
    console.log(`✅ Task creation: ${successLogs.length > 0 ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('📝 Step 2: Switch to Director and test team filtering');
    
    // Switch to Director
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
    
    console.log('📝 Step 3: Test Team 1 (should have the task)');
    
    // Check team 1
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    await team1Card.click();
    await page.waitForTimeout(3000);
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    const hasOurTaskInTeam1 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
    console.log(`👥 Team 1 tasks: ${team1Tasks.length}`);
    console.log(`👥 Our task in Team 1: ${hasOurTaskInTeam1} (SHOULD BE TRUE)`);
    
    // Log team 1 tasks
    if (team1Tasks.length > 0) {
      console.log('📋 Team 1 tasks:');
      for (let i = 0; i < Math.min(team1Tasks.length, 5); i++) {
        const taskTitle = await team1Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    // Go back to team selection
    const backButton = await page.locator('button:has-text("← Quay lại")').first();
    const hasBackButton = await backButton.isVisible();
    
    if (hasBackButton) {
      await backButton.click();
      await page.waitForTimeout(2000);
    } else {
      await teamTab.click();
      await page.waitForTimeout(2000);
    }
    
    console.log('📝 Step 4: Test Team 2 (should NOT have the task)');
    
    // Check team 2
    const team2Card = await page.locator(':has-text("NHÓM 2 - THẢO")').first();
    await team2Card.click();
    await page.waitForTimeout(3000);
    
    const team2Tasks = await page.locator('tr:has(td)').all();
    const hasOurTaskInTeam2 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
    console.log(`👥 Team 2 tasks: ${team2Tasks.length}`);
    console.log(`👥 Our task in Team 2: ${hasOurTaskInTeam2} (SHOULD BE FALSE)`);
    
    // Log team 2 tasks
    if (team2Tasks.length > 0) {
      console.log('📋 Team 2 tasks:');
      for (let i = 0; i < Math.min(team2Tasks.length, 3); i++) {
        const taskTitle = await team2Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 5: Analyze team filtering logs');
    
    // Check for team filtering logs
    const teamFilterLogs = consoleLogs.filter(log => 
      log.includes('checking against selected team') ||
      log.includes('team_id=') ||
      log.includes('selectedTeam=') ||
      log.includes('isFromSelectedTeam=')
    );
    
    if (teamFilterLogs.length > 0) {
      console.log('\n👥 Team Filter Logs:');
      teamFilterLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
      });
    } else {
      console.log('\n❌ No team filter logs found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-team-filtering-fix.png', fullPage: true });
    
    console.log('\n✅ Team filtering test completed');
    
    // Summary
    console.log('\n📋 TEAM FILTERING SUMMARY:');
    console.log(`  Task created: ${successLogs.length > 0}`);
    console.log(`  Team 1 tasks: ${team1Tasks.length}`);
    console.log(`  Team 2 tasks: ${team2Tasks.length}`);
    console.log(`  Task in Team 1: ${hasOurTaskInTeam1} (should be TRUE)`);
    console.log(`  Task in Team 2: ${hasOurTaskInTeam2} (should be FALSE)`);
    
    if (hasOurTaskInTeam1 && !hasOurTaskInTeam2) {
      console.log('\n🎉 SUCCESS: Team filtering works correctly!');
    } else if (!hasOurTaskInTeam1 && !hasOurTaskInTeam2) {
      console.log('\n🚨 ISSUE: Task not appearing in any team');
    } else if (hasOurTaskInTeam1 && hasOurTaskInTeam2) {
      console.log('\n🚨 ISSUE: Task appearing in multiple teams');
    } else {
      console.log('\n🚨 ISSUE: Task appearing in wrong team only');
    }
  });
});
