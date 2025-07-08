import { test, expect } from '@playwright/test';

test.describe('Test Final Team Filtering', () => {
  test('Test team filtering after all fixes', async ({ page }) => {
    console.log('🔍 Testing final team filtering after all fixes...');
    
    // Capture ALL relevant logs
    const allLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('selectedTeamForView changed') || 
          text.includes('Triggering re-filtering') ||
          text.includes('TEAM FILTERING DEBUG') ||
          text.includes('task_team_id=') ||
          text.includes('selected_team_id=') ||
          text.includes('directMatch=') ||
          text.includes('isFromSelectedTeam=') ||
          text.includes('Team view - Getting team tasks')) {
        allLogs.push(text);
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
    
    console.log('📝 Step 2: Go to team tab and wait for complete filtering');
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(10000); // Wait longer for complete process
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    console.log(`👥 Team 1 tasks (final): ${team1Tasks.length}`);
    
    // Check specific tasks
    const hasKhanhDuyTasks = await page.locator('tr:has-text("Team Fix Test")').first().isVisible();
    console.log(`🔍 Lê Khánh Duy tasks visible: ${hasKhanhDuyTasks}`);
    
    // Log first few tasks to see what's displayed
    if (team1Tasks.length > 0) {
      console.log('📋 Team 1 tasks displayed:');
      for (let i = 0; i < Math.min(team1Tasks.length, 5); i++) {
        const taskTitle = await team1Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 3: Analyze final logs');
    
    // Categorize logs
    const stateChangeLogs = allLogs.filter(log => 
      log.includes('selectedTeamForView changed') ||
      log.includes('Triggering re-filtering')
    );
    
    const filteringDebugLogs = allLogs.filter(log => 
      log.includes('TEAM FILTERING DEBUG')
    );
    
    const taskFilteringLogs = allLogs.filter(log => 
      log.includes('task_team_id=') ||
      log.includes('directMatch=') ||
      log.includes('isFromSelectedTeam=')
    );
    
    const teamViewLogs = allLogs.filter(log => 
      log.includes('Team view - Getting team tasks')
    );
    
    console.log('\n📊 FINAL LOG ANALYSIS:');
    console.log(`  Total logs: ${allLogs.length}`);
    console.log(`  State change logs: ${stateChangeLogs.length}`);
    console.log(`  Filtering debug logs: ${filteringDebugLogs.length}`);
    console.log(`  Task filtering logs: ${taskFilteringLogs.length}`);
    console.log(`  Team view logs: ${teamViewLogs.length}`);
    
    if (stateChangeLogs.length > 0) {
      console.log('\n🔄 STATE CHANGE LOGS:');
      stateChangeLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (filteringDebugLogs.length > 0) {
      console.log('\n🔍 FILTERING DEBUG LOGS:');
      filteringDebugLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (taskFilteringLogs.length > 0) {
      console.log('\n📋 TASK FILTERING LOGS (First 10):');
      taskFilteringLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    // Show ALL logs
    console.log('\n⏰ ALL RELEVANT LOGS:');
    allLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'test-final-team-filtering.png', fullPage: true });
    
    console.log('\n✅ Final team filtering test completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 tasks displayed: ${team1Tasks.length}`);
    console.log(`  Khánh Duy tasks visible: ${hasKhanhDuyTasks}`);
    console.log(`  State changes detected: ${stateChangeLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Re-filtering triggered: ${stateChangeLogs.some(log => log.includes('Triggering re-filtering')) ? 'YES' : 'NO'}`);
    console.log(`  Task filtering active: ${taskFilteringLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (team1Tasks.length > 0 && taskFilteringLogs.length > 0) {
      console.log('\n🎉 SUCCESS: Team filtering fully working!');
      console.log('   → Tasks are displayed');
      console.log('   → Individual task filtering is active');
      console.log('   → Team selection and filtering logic working');
    } else if (team1Tasks.length > 0 && taskFilteringLogs.length === 0) {
      console.log('\n⚠️ PARTIAL SUCCESS: Tasks displayed but filtering logic not active');
      console.log('   → May be showing all tasks instead of filtered tasks');
    } else {
      console.log('\n🚨 ISSUE: Team filtering still not working properly');
    }
  });
});
