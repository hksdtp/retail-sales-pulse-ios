import { test, expect } from '@playwright/test';

test.describe('Test Team Filtering Fixed', () => {
  test('Test team filtering after fixing logic', async ({ page }) => {
    console.log('🔍 Testing team filtering after logic fix...');
    
    // Capture team filtering logs
    const teamFilterLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('task_team_id=') || 
          text.includes('selected_team_id=') || 
          text.includes('directMatch=') ||
          text.includes('userMatch=') ||
          text.includes('isFromSelectedTeam=')) {
        teamFilterLogs.push(text);
      }
    });
    
    console.log('📝 Step 1: Create a test task as Lê Khánh Duy');
    
    // Setup Lê Khánh Duy first to create a task
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanhduy.le@example.com',
        role: 'sales_staff',
        team_id: '1',
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
    
    // Create a unique test task
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Team Filter Fix Test - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Test task for team filtering fix');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(1000);
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(3000);
    
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
    await page.waitForTimeout(5000);
    
    // Go to team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Test Team 1 (should have the task)');
    
    // Clear logs before team 1 test
    teamFilterLogs.length = 0;
    
    // Try to find team 1 card with different selectors
    let team1Card = await page.locator(':has-text("NHÓM 1")').first();
    let hasTeam1Card = await team1Card.isVisible();
    
    if (!hasTeam1Card) {
      team1Card = await page.locator(':has-text("Việt Anh")').first();
      hasTeam1Card = await team1Card.isVisible();
    }
    
    if (!hasTeam1Card) {
      team1Card = await page.locator('div').filter({ hasText: /nhóm.*1/i }).first();
      hasTeam1Card = await team1Card.isVisible();
    }
    
    console.log(`👥 Team 1 card found: ${hasTeam1Card}`);
    
    let team1Tasks = 0;
    let hasOurTaskInTeam1 = false;
    
    if (hasTeam1Card) {
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1TaskElements = await page.locator('tr:has(td)').all();
      team1Tasks = team1TaskElements.length;
      hasOurTaskInTeam1 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      
      console.log(`👥 Team 1 tasks: ${team1Tasks}`);
      console.log(`👥 Our task in Team 1: ${hasOurTaskInTeam1} (SHOULD BE TRUE)`);
      
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
    }
    
    console.log('📝 Step 4: Test Team 2 (should NOT have the task)');
    
    // Clear logs before team 2 test
    teamFilterLogs.length = 0;
    
    // Try to find team 2 card
    let team2Card = await page.locator(':has-text("NHÓM 2")').first();
    let hasTeam2Card = await team2Card.isVisible();
    
    if (!hasTeam2Card) {
      team2Card = await page.locator(':has-text("Thảo")').first();
      hasTeam2Card = await team2Card.isVisible();
    }
    
    console.log(`👥 Team 2 card found: ${hasTeam2Card}`);
    
    let team2Tasks = 0;
    let hasOurTaskInTeam2 = false;
    
    if (hasTeam2Card) {
      await team2Card.click();
      await page.waitForTimeout(3000);
      
      const team2TaskElements = await page.locator('tr:has(td)').all();
      team2Tasks = team2TaskElements.length;
      hasOurTaskInTeam2 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      
      console.log(`👥 Team 2 tasks: ${team2Tasks}`);
      console.log(`👥 Our task in Team 2: ${hasOurTaskInTeam2} (SHOULD BE FALSE)`);
    }
    
    console.log('📝 Step 5: Analyze filtering logs');
    
    // Analyze team filtering logs
    const team1FilterLogs = teamFilterLogs.filter(log => 
      log.includes('selected_team_id="1"')
    );
    
    const team2FilterLogs = teamFilterLogs.filter(log => 
      log.includes('selected_team_id="2"')
    );
    
    const ourTaskLogs = teamFilterLogs.filter(log => 
      log.includes(uniqueTaskTitle)
    );
    
    console.log('\n📊 FILTERING ANALYSIS:');
    console.log(`  Team 1 filter logs: ${team1FilterLogs.length}`);
    console.log(`  Team 2 filter logs: ${team2FilterLogs.length}`);
    console.log(`  Our task filter logs: ${ourTaskLogs.length}`);
    
    if (ourTaskLogs.length > 0) {
      console.log('\n🔍 OUR TASK FILTERING LOGS:');
      ourTaskLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 400)}`);
      });
    }
    
    // Show recent team filter logs
    console.log('\n⏰ RECENT TEAM FILTER LOGS:');
    teamFilterLogs.slice(-10).forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'test-team-filtering-fixed.png', fullPage: true });
    
    console.log('\n✅ Team filtering fix test completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 found: ${hasTeam1Card}`);
    console.log(`  Team 2 found: ${hasTeam2Card}`);
    console.log(`  Team 1 tasks: ${team1Tasks}`);
    console.log(`  Team 2 tasks: ${team2Tasks}`);
    console.log(`  Task in Team 1: ${hasOurTaskInTeam1} (should be TRUE)`);
    console.log(`  Task in Team 2: ${hasOurTaskInTeam2} (should be FALSE)`);
    
    if (hasOurTaskInTeam1 && !hasOurTaskInTeam2) {
      console.log('\n🎉 SUCCESS: Team filtering fix working perfectly!');
    } else if (!hasOurTaskInTeam1 && !hasOurTaskInTeam2) {
      console.log('\n🚨 ISSUE: Task not appearing in any team');
    } else if (hasOurTaskInTeam1 && hasOurTaskInTeam2) {
      console.log('\n🚨 ISSUE: Task appearing in both teams (still broken)');
    } else {
      console.log('\n🚨 ISSUE: Task appearing in wrong team only');
    }
  });
});
