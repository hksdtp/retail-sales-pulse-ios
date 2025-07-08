import { test, expect } from '@playwright/test';

test.describe('Test Team Filtering Logic', () => {
  test('Test team filtering logic with auto-select', async ({ page }) => {
    console.log('🔍 Testing team filtering logic...');
    
    // Capture filtering logs
    const filteringLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('task_team_id=') || 
          text.includes('selected_team_id=') ||
          text.includes('directMatch=') ||
          text.includes('isFromSelectedTeam=') ||
          text.includes('Auto-selecting Team') ||
          text.includes('handleTeamSelect called')) {
        filteringLogs.push(text);
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
    await page.waitForTimeout(5000); // Wait for auto-select
    
    const team1Tasks = await page.locator('tr:has(td)').all();
    console.log(`👥 Team 1 tasks (auto-selected): ${team1Tasks.length}`);
    
    // Check if Lê Khánh Duy tasks appear
    const hasKhanhDuyTasks = await page.locator('tr:has-text("Team Fix Test")').first().isVisible();
    console.log(`🔍 Lê Khánh Duy tasks visible: ${hasKhanhDuyTasks}`);
    
    // Log first few tasks
    if (team1Tasks.length > 0) {
      console.log('📋 Team 1 tasks:');
      for (let i = 0; i < Math.min(team1Tasks.length, 5); i++) {
        const taskTitle = await team1Tasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 3: Analyze filtering logs');
    
    // Categorize logs
    const autoSelectLogs = filteringLogs.filter(log => 
      log.includes('Auto-selecting Team') ||
      log.includes('handleTeamSelect called')
    );
    
    const taskFilteringLogs = filteringLogs.filter(log => 
      log.includes('task_team_id=') &&
      log.includes('selected_team_id=')
    );
    
    const khanhDuyTaskLogs = filteringLogs.filter(log => 
      log.includes('Team Fix Test') ||
      log.includes('user_khanh_duy')
    );
    
    console.log('\n📊 FILTERING ANALYSIS:');
    console.log(`  Total filtering logs: ${filteringLogs.length}`);
    console.log(`  Auto-select logs: ${autoSelectLogs.length}`);
    console.log(`  Task filtering logs: ${taskFilteringLogs.length}`);
    console.log(`  Khánh Duy task logs: ${khanhDuyTaskLogs.length}`);
    
    if (autoSelectLogs.length > 0) {
      console.log('\n🔧 AUTO-SELECT LOGS:');
      autoSelectLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (taskFilteringLogs.length > 0) {
      console.log('\n🔍 TASK FILTERING LOGS (First 10):');
      taskFilteringLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    if (khanhDuyTaskLogs.length > 0) {
      console.log('\n👤 KHÁNH DUY TASK LOGS:');
      khanhDuyTaskLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    // Check for team 1 vs team 2 filtering
    const team1FilterLogs = filteringLogs.filter(log => 
      log.includes('selected_team_id="1"')
    );
    
    const team2FilterLogs = filteringLogs.filter(log => 
      log.includes('selected_team_id="2"')
    );
    
    console.log('\n🎯 TEAM SPECIFIC FILTERING:');
    console.log(`  Team 1 filter logs: ${team1FilterLogs.length}`);
    console.log(`  Team 2 filter logs: ${team2FilterLogs.length}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-team-filtering-logic.png', fullPage: true });
    
    console.log('\n✅ Team filtering logic test completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 tasks displayed: ${team1Tasks.length}`);
    console.log(`  Khánh Duy tasks visible: ${hasKhanhDuyTasks}`);
    console.log(`  Auto-select working: ${autoSelectLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Filtering logic active: ${taskFilteringLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (team1Tasks.length > 0 && hasKhanhDuyTasks && taskFilteringLogs.length > 0) {
      console.log('\n✅ SUCCESS: Team filtering logic working!');
      console.log('   → Tasks are being filtered by team');
      console.log('   → Lê Khánh Duy tasks appear in Team 1 (correct)');
    } else if (team1Tasks.length > 0 && !hasKhanhDuyTasks) {
      console.log('\n⚠️ PARTIAL: Team filtering working but Khánh Duy tasks not visible');
    } else if (team1Tasks.length === 0) {
      console.log('\n🚨 ISSUE: No tasks displayed in Team 1');
    } else {
      console.log('\n🔍 NEED MORE ANALYSIS: Mixed results');
    }
  });
});
