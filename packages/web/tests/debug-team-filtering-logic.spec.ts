import { test, expect } from '@playwright/test';

test.describe('Debug Team Filtering Logic', () => {
  test('Debug why team 1 tasks appear in team 2', async ({ page }) => {
    console.log('🔍 Debugging team filtering logic...');
    
    // Capture team filtering logs
    const teamFilterLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('team_id=') || 
          text.includes('selectedTeam=') || 
          text.includes('isFromSelectedTeam=') ||
          text.includes('Team view') ||
          text.includes('checking against selected team')) {
        teamFilterLogs.push(text);
      }
    });
    
    console.log('📝 Step 1: Setup Director (Khổng Đức Mạnh)');
    
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
    
    console.log('📝 Step 3: Test Team 1 (should have Lê Khánh Duy tasks)');
    
    // Clear logs before team 1 test
    teamFilterLogs.length = 0;
    
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    await team1Card.click();
    await page.waitForTimeout(3000);
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    console.log(`👥 Team 1 tasks: ${team1Tasks.length}`);
    
    // Log team 1 tasks
    if (team1Tasks.length > 0) {
      console.log('📋 Team 1 tasks:');
      for (let i = 0; i < Math.min(team1Tasks.length, 3); i++) {
        const taskTitle = await team1Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    // Analyze team 1 logs
    const team1FilterLogs = teamFilterLogs.filter(log => 
      log.includes('selectedTeam=1') || log.includes('NHÓM 1')
    );
    
    console.log('\n👥 TEAM 1 FILTER LOGS:');
    team1FilterLogs.slice(0, 10).forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
    });
    
    console.log('📝 Step 4: Go back and test Team 2 (should NOT have Lê Khánh Duy tasks)');
    
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
    
    // Clear logs before team 2 test
    teamFilterLogs.length = 0;
    
    const team2Card = await page.locator(':has-text("NHÓM 2 - THẢO")').first();
    await team2Card.click();
    await page.waitForTimeout(3000);
    
    const team2Tasks = await page.locator('tr:has(td)').all();
    console.log(`👥 Team 2 tasks: ${team2Tasks.length}`);
    
    // Log team 2 tasks
    if (team2Tasks.length > 0) {
      console.log('📋 Team 2 tasks:');
      for (let i = 0; i < Math.min(team2Tasks.length, 5); i++) {
        const taskTitle = await team2Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    // Check if Lê Khánh Duy tasks appear in team 2
    const hasKhanhDuyTasksInTeam2 = await page.locator('tr:has-text("Team Fix Test")').first().isVisible();
    console.log(`🚨 Lê Khánh Duy tasks in Team 2: ${hasKhanhDuyTasksInTeam2} (SHOULD BE FALSE)`);
    
    // Analyze team 2 logs
    const team2FilterLogs = teamFilterLogs.filter(log => 
      log.includes('selectedTeam=2') || log.includes('NHÓM 2')
    );
    
    console.log('\n👥 TEAM 2 FILTER LOGS:');
    team2FilterLogs.slice(0, 15).forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
    });
    
    // Look for specific filtering logic
    const filteringDetailLogs = teamFilterLogs.filter(log => 
      log.includes('Team Fix Test') || 
      log.includes('Lê Khánh Duy') ||
      log.includes('user_khanh_duy')
    );
    
    if (filteringDetailLogs.length > 0) {
      console.log('\n🔍 DETAILED FILTERING LOGS FOR LÊ KHÁNH DUY TASKS:');
      filteringDetailLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 400)}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-team-filtering-logic.png', fullPage: true });
    
    console.log('\n✅ Team filtering logic debug completed');
    
    // Final analysis
    console.log('\n🎯 TEAM FILTERING ANALYSIS:');
    console.log(`  Team 1 tasks: ${team1Tasks.length}`);
    console.log(`  Team 2 tasks: ${team2Tasks.length}`);
    console.log(`  Lê Khánh Duy tasks in Team 2: ${hasKhanhDuyTasksInTeam2}`);
    console.log(`  Team 1 filter logs: ${team1FilterLogs.length}`);
    console.log(`  Team 2 filter logs: ${team2FilterLogs.length}`);
    console.log(`  Detailed filter logs: ${filteringDetailLogs.length}`);
    
    if (hasKhanhDuyTasksInTeam2) {
      console.log('\n🚨 CONFIRMED ISSUE: Team filtering logic is broken!');
      console.log('   → Tasks from Team 1 appearing in Team 2');
      console.log('   → Need to fix team filtering logic');
    } else {
      console.log('\n✅ Team filtering working correctly');
    }
    
    if (filteringDetailLogs.length === 0) {
      console.log('\n⚠️ No detailed filtering logs found - may need to add more logging');
    }
  });
});
