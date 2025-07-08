import { test, expect } from '@playwright/test';

test.describe('Debug Remaining Issues', () => {
  test('Debug team filtering and member view issues', async ({ page }) => {
    console.log('🔍 Debugging team filtering and member view...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
    });
    
    console.log('📝 Step 1: Setup Lê Khánh Duy and create a task');
    
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
    
    const uniqueTaskTitle = `Team Filter Test - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Test task for team filtering');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(1000);
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(5000);
    
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
    
    // Check team 1 (should have Lê Khánh Duy's task)
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    const hasTeam1Card = await team1Card.isVisible();
    console.log(`👥 Team 1 card visible: ${hasTeam1Card}`);
    
    if (hasTeam1Card) {
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      const hasOurTaskInTeam1 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`👥 Team 1 tasks: ${team1Tasks.length}`);
      console.log(`👥 Our task in Team 1: ${hasOurTaskInTeam1} (SHOULD BE TRUE)`);
      
      // Go back to team selection
      const backButton = await page.locator('button:has-text("← Quay lại")').first();
      const hasBackButton = await backButton.isVisible();
      
      if (hasBackButton) {
        await backButton.click();
        await page.waitForTimeout(2000);
      } else {
        // Alternative: click team tab again
        await teamTab.click();
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('📝 Step 4: Test Team 2 (should NOT have the task)');
    
    // Check team 2 (should NOT have Lê Khánh Duy's task)
    const team2Card = await page.locator(':has-text("NHÓM 2 - THẢO")').first();
    const hasTeam2Card = await team2Card.isVisible();
    console.log(`👥 Team 2 card visible: ${hasTeam2Card}`);
    
    if (hasTeam2Card) {
      await team2Card.click();
      await page.waitForTimeout(3000);
      
      const team2Tasks = await page.locator('tr:has(td)').all();
      const hasOurTaskInTeam2 = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`👥 Team 2 tasks: ${team2Tasks.length}`);
      console.log(`👥 Our task in Team 2: ${hasOurTaskInTeam2} (SHOULD BE FALSE)`);
      
      if (hasOurTaskInTeam2) {
        console.log('🚨 ISSUE 3 CONFIRMED: Task appears in wrong team');
      } else {
        console.log('✅ ISSUE 3 FIXED: Task filtering by team works correctly');
      }
      
      // Go back to team selection
      const backButton2 = await page.locator('button:has-text("← Quay lại")').first();
      const hasBackButton2 = await backButton2.isVisible();
      
      if (hasBackButton2) {
        await backButton2.click();
        await page.waitForTimeout(2000);
      }
    }
    
    console.log('📝 Step 5: Test Member view');
    
    // Go to member tab
    const memberTab = await page.locator('button:has-text("Thành viên")').first();
    const hasMemberTab = await memberTab.isVisible();
    console.log(`📋 Member tab visible: ${hasMemberTab}`);
    
    if (hasMemberTab) {
      await memberTab.click();
      await page.waitForTimeout(5000); // Wait longer for member view to load
      
      const memberTasks = await page.locator('tr:has(td)').all();
      console.log(`📋 Member view tasks: ${memberTasks.length}`);
      
      const hasOurTaskInMember = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`📋 Our task in member view: ${hasOurTaskInMember}`);
      
      if (memberTasks.length === 0) {
        console.log('🚨 ISSUE 4 CONFIRMED: Member view is empty');
      } else {
        console.log('✅ ISSUE 4 FIXED: Member view shows tasks');
        
        // Log first few tasks
        console.log('📋 Member view tasks:');
        for (let i = 0; i < Math.min(memberTasks.length, 5); i++) {
          const taskTitle = await memberTasks[i].locator('td').first().textContent();
          console.log(`  ${i + 1}. "${taskTitle}"`);
        }
      }
    }
    
    console.log('📝 Step 6: Analyze team filtering logs');
    
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
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Check for member view logs
    const memberViewLogs = consoleLogs.filter(log => 
      log.includes('Member view') ||
      log.includes('retail department') ||
      log.includes('member tasks') ||
      log.includes('Final member tasks count')
    );
    
    if (memberViewLogs.length > 0) {
      console.log('\n📋 Member View Logs:');
      memberViewLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-remaining-issues.png', fullPage: true });
    
    console.log('\n✅ Remaining issues debugging completed');
    
    // Summary
    console.log('\n📋 ISSUES SUMMARY:');
    console.log(`  3. Team filtering: ${hasTeam1Card && hasTeam2Card ? 'TESTED' : 'PARTIAL'}`);
    console.log(`     - Task in correct team (Team 1): ${hasTeam1Card ? 'checked' : 'not checked'}`);
    console.log(`     - Task in wrong team (Team 2): ${hasTeam2Card ? 'checked' : 'not checked'}`);
    console.log(`  4. Member view: ${hasMemberTab ? (memberTasks.length > 0 ? 'WORKING' : 'EMPTY') : 'NOT VISIBLE'}`);
  });
});
