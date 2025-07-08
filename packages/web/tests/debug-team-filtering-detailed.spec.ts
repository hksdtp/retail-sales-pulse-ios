import { test, expect } from '@playwright/test';

test.describe('Debug Team Filtering Detailed', () => {
  test('Debug team filtering with expanded log capture', async ({ page }) => {
    console.log('🔍 Debugging team filtering with expanded logs...');
    
    // Capture ALL team-related logs
    const allLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Team view') || 
          text.includes('TEAM FILTERING') ||
          text.includes('selectedTeamForView') ||
          text.includes('task_team_id') ||
          text.includes('selected_team_id') ||
          text.includes('directMatch') ||
          text.includes('isFromSelectedTeam') ||
          text.includes('Auto-selecting') ||
          text.includes('handleTeamSelect')) {
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
    
    console.log('📝 Step 2: Go to team tab and wait for auto-select');
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(8000); // Wait longer for auto-select and filtering
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    console.log(`👥 Team 1 tasks (auto-selected): ${team1Tasks.length}`);
    
    console.log('📝 Step 3: Analyze ALL logs');
    
    // Categorize logs
    const teamViewLogs = allLogs.filter(log => 
      log.includes('Team view - Getting team tasks')
    );
    
    const filteringDebugLogs = allLogs.filter(log => 
      log.includes('TEAM FILTERING DEBUG')
    );
    
    const autoSelectLogs = allLogs.filter(log => 
      log.includes('Auto-selecting') ||
      log.includes('handleTeamSelect called')
    );
    
    const taskFilteringLogs = allLogs.filter(log => 
      log.includes('task_team_id=') ||
      log.includes('directMatch=')
    );
    
    console.log('\n📊 DETAILED LOG ANALYSIS:');
    console.log(`  Total logs: ${allLogs.length}`);
    console.log(`  Team view logs: ${teamViewLogs.length}`);
    console.log(`  Filtering debug logs: ${filteringDebugLogs.length}`);
    console.log(`  Auto-select logs: ${autoSelectLogs.length}`);
    console.log(`  Task filtering logs: ${taskFilteringLogs.length}`);
    
    if (teamViewLogs.length > 0) {
      console.log('\n👥 TEAM VIEW LOGS:');
      teamViewLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (filteringDebugLogs.length > 0) {
      console.log('\n🔍 FILTERING DEBUG LOGS:');
      filteringDebugLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (autoSelectLogs.length > 0) {
      console.log('\n🔧 AUTO-SELECT LOGS:');
      autoSelectLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (taskFilteringLogs.length > 0) {
      console.log('\n📋 TASK FILTERING LOGS:');
      taskFilteringLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    // Show ALL logs
    console.log('\n⏰ ALL TEAM LOGS:');
    allLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-team-filtering-detailed.png', fullPage: true });
    
    console.log('\n✅ Detailed team filtering debug completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 tasks displayed: ${team1Tasks.length}`);
    console.log(`  Team view called: ${teamViewLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Filtering debug active: ${filteringDebugLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Auto-select working: ${autoSelectLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Task filtering active: ${taskFilteringLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (team1Tasks.length > 0 && teamViewLogs.length > 0 && taskFilteringLogs.length > 0) {
      console.log('\n✅ SUCCESS: Team filtering fully working!');
    } else if (team1Tasks.length > 0 && teamViewLogs.length > 0 && taskFilteringLogs.length === 0) {
      console.log('\n🚨 ISSUE: Team view called but individual task filtering not working!');
    } else if (team1Tasks.length > 0 && teamViewLogs.length === 0) {
      console.log('\n🚨 CRITICAL: Tasks displayed but team view logic not called!');
    } else {
      console.log('\n🔍 MIXED RESULTS: Need further investigation');
    }
  });
});
