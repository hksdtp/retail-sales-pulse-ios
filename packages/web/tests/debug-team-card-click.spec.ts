import { test, expect } from '@playwright/test';

test.describe('Debug Team Card Click', () => {
  test('Debug team card click and filtering logic', async ({ page }) => {
    console.log('🔍 Debugging team card click and filtering...');
    
    // Capture team-related logs
    const teamLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('handleTeamSelect') || 
          text.includes('Selected team') || 
          text.includes('task_team_id=') ||
          text.includes('selected_team_id=') ||
          text.includes('directMatch=') ||
          text.includes('isFromSelectedTeam=') ||
          text.includes('Team view - Getting team tasks')) {
        teamLogs.push(text);
      }
    });
    
    console.log('📝 Step 1: Setup Director');
    
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
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
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Go to team tab');
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Click Team 1 and capture logs');
    
    // Clear logs before clicking team 1
    teamLogs.length = 0;
    
    // Try different selectors for team 1
    let team1Card = await page.locator(':has-text("NHÓM 1")').first();
    let hasTeam1 = await team1Card.isVisible();
    
    if (!hasTeam1) {
      team1Card = await page.locator(':has-text("Việt Anh")').first();
      hasTeam1 = await team1Card.isVisible();
    }
    
    if (!hasTeam1) {
      team1Card = await page.locator('div').filter({ hasText: /nhóm.*1/i }).first();
      hasTeam1 = await team1Card.isVisible();
    }
    
    console.log(`👥 Team 1 card found: ${hasTeam1}`);
    
    let team1Tasks = 0;
    
    if (hasTeam1) {
      await team1Card.click();
      await page.waitForTimeout(5000); // Wait longer for filtering
      
      const team1TaskElements = await page.locator('tr:has(td)').all();
      team1Tasks = team1TaskElements.length;
      console.log(`👥 Team 1 tasks after click: ${team1Tasks}`);
      
      // Log first few tasks
      if (team1Tasks > 0) {
        console.log('📋 Team 1 tasks:');
        for (let i = 0; i < Math.min(team1Tasks, 3); i++) {
          const taskTitle = await team1TaskElements[i].locator('td').first().textContent();
          console.log(`  ${i + 1}. "${taskTitle}"`);
        }
      }
    }
    
    console.log('📝 Step 4: Go back and click Team 2');
    
    // Go back to team cards
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
    
    // Clear logs before clicking team 2
    teamLogs.length = 0;
    
    // Try different selectors for team 2
    let team2Card = await page.locator(':has-text("NHÓM 2")').first();
    let hasTeam2 = await team2Card.isVisible();
    
    if (!hasTeam2) {
      team2Card = await page.locator(':has-text("Thảo")').first();
      hasTeam2 = await team2Card.isVisible();
    }
    
    console.log(`👥 Team 2 card found: ${hasTeam2}`);
    
    let team2Tasks = 0;
    
    if (hasTeam2) {
      await team2Card.click();
      await page.waitForTimeout(5000);
      
      const team2TaskElements = await page.locator('tr:has(td)').all();
      team2Tasks = team2TaskElements.length;
      console.log(`👥 Team 2 tasks after click: ${team2Tasks}`);
      
      // Check if Lê Khánh Duy tasks appear in team 2
      const hasKhanhDuyTasks = await page.locator('tr:has-text("Team Fix Test")').first().isVisible();
      console.log(`🚨 Lê Khánh Duy tasks in Team 2: ${hasKhanhDuyTasks} (SHOULD BE FALSE)`);
      
      // Log first few tasks
      if (team2Tasks > 0) {
        console.log('📋 Team 2 tasks:');
        for (let i = 0; i < Math.min(team2Tasks, 3); i++) {
          const taskTitle = await team2TaskElements[i].locator('td').first().textContent();
          console.log(`  ${i + 1}. "${taskTitle}"`);
        }
      }
    }
    
    console.log('📝 Step 5: Analyze team logs');
    
    // Categorize logs
    const teamSelectLogs = teamLogs.filter(log => 
      log.includes('handleTeamSelect') ||
      log.includes('Selected team')
    );
    
    const filteringLogs = teamLogs.filter(log => 
      log.includes('task_team_id=') ||
      log.includes('directMatch=') ||
      log.includes('isFromSelectedTeam=')
    );
    
    const teamViewLogs = teamLogs.filter(log => 
      log.includes('Team view - Getting team tasks')
    );
    
    console.log('\n📊 TEAM LOGS ANALYSIS:');
    console.log(`  Total team logs: ${teamLogs.length}`);
    console.log(`  Team select logs: ${teamSelectLogs.length}`);
    console.log(`  Filtering logs: ${filteringLogs.length}`);
    console.log(`  Team view logs: ${teamViewLogs.length}`);
    
    if (teamSelectLogs.length > 0) {
      console.log('\n🎯 TEAM SELECT LOGS:');
      teamSelectLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (filteringLogs.length > 0) {
      console.log('\n🔍 FILTERING LOGS:');
      filteringLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    if (teamViewLogs.length > 0) {
      console.log('\n👥 TEAM VIEW LOGS:');
      teamViewLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Show all team logs
    console.log('\n⏰ ALL TEAM LOGS:');
    teamLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-team-card-click.png', fullPage: true });
    
    console.log('\n✅ Team card click debug completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 found: ${hasTeam1}`);
    console.log(`  Team 2 found: ${hasTeam2}`);
    console.log(`  Team 1 tasks: ${team1Tasks}`);
    console.log(`  Team 2 tasks: ${team2Tasks}`);
    console.log(`  Team select detected: ${teamSelectLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Filtering logic called: ${filteringLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (teamSelectLogs.length === 0) {
      console.log('\n🚨 CRITICAL: Team card click not detected!');
    } else if (filteringLogs.length === 0) {
      console.log('\n🚨 ISSUE: Team selected but filtering not working!');
    } else if (team1Tasks > 0 && team2Tasks > 0 && team1Tasks === team2Tasks) {
      console.log('\n🚨 CONFIRMED: Same tasks appearing in both teams (filtering broken)!');
    } else {
      console.log('\n✅ Team filtering may be working');
    }
  });
});
