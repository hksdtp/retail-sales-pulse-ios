import { test, expect } from '@playwright/test';

test.describe('Test Team Card Click Fixed', () => {
  test('Test team card click with debug logs', async ({ page }) => {
    console.log('🔍 Testing team card click with debug logs...');
    
    // Capture ALL team-related logs
    const teamLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('TeamCardsView') || 
          text.includes('handleTeamClick') || 
          text.includes('handleTeamSelect') ||
          text.includes('Selected team') ||
          text.includes('onTeamSelect')) {
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
    
    console.log('📝 Step 3: Check team cards and click Team 1');
    
    // Clear logs before clicking
    teamLogs.length = 0;
    
    // Look for team 1 card with more specific selector
    const team1Card = await page.locator('div').filter({ hasText: 'NHÓM 1 - VIỆT ANH' }).first();
    const hasTeam1 = await team1Card.isVisible();
    console.log(`👥 Team 1 card visible: ${hasTeam1}`);
    
    if (hasTeam1) {
      console.log('📝 Clicking Team 1 card...');
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks after click: ${team1Tasks.length}`);
    }
    
    console.log('📝 Step 4: Analyze team click logs');
    
    // Categorize logs
    const teamCardClickLogs = teamLogs.filter(log => 
      log.includes('TeamCardsView handleTeamClick') ||
      log.includes('onTeamSelect function available') ||
      log.includes('onTeamSelect called successfully')
    );
    
    const teamSelectLogs = teamLogs.filter(log => 
      log.includes('handleTeamSelect called') ||
      log.includes('Selected team set')
    );
    
    console.log('\n📊 TEAM CLICK ANALYSIS:');
    console.log(`  Total team logs: ${teamLogs.length}`);
    console.log(`  Team card click logs: ${teamCardClickLogs.length}`);
    console.log(`  Team select logs: ${teamSelectLogs.length}`);
    
    if (teamCardClickLogs.length > 0) {
      console.log('\n🎯 TEAM CARD CLICK LOGS:');
      teamCardClickLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (teamSelectLogs.length > 0) {
      console.log('\n🎯 TEAM SELECT LOGS:');
      teamSelectLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Show all team logs
    console.log('\n⏰ ALL TEAM LOGS:');
    teamLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'test-team-card-click-fixed.png', fullPage: true });
    
    console.log('\n✅ Team card click test completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Team 1 card visible: ${hasTeam1}`);
    console.log(`  Team card click detected: ${teamCardClickLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Team select handler called: ${teamSelectLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (!hasTeam1) {
      console.log('\n🚨 ISSUE: Team 1 card not found!');
    } else if (teamCardClickLogs.length === 0) {
      console.log('\n🚨 CRITICAL: Team card click not working!');
    } else if (teamSelectLogs.length === 0) {
      console.log('\n🚨 ISSUE: Team card click works but handler not called!');
    } else {
      console.log('\n✅ Team card click working correctly!');
    }
  });
});
