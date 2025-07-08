import { test, expect } from '@playwright/test';

test.describe('Debug View Level', () => {
  test('Debug viewLevel and selectedView state changes', async ({ page }) => {
    console.log('🔍 Debugging viewLevel and selectedView...');
    
    // Capture view level logs
    const viewLevelLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('ViewLevel changed') || 
          text.includes('Setting up team view') || 
          text.includes('Setting up non-team view') ||
          text.includes('Task filtering called') ||
          text.includes('selectedView:') ||
          text.includes('viewLevel:')) {
        viewLevelLogs.push(text);
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
    
    console.log('📝 Step 2: Check initial state (personal tab)');
    
    // Check initial state
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    const isPersonalActive = await personalTab.getAttribute('class');
    console.log(`👤 Personal tab active: ${isPersonalActive?.includes('blue') ? 'YES' : 'NO'}`);
    
    console.log('📝 Step 3: Click team tab and capture logs');
    
    // Clear logs before clicking team tab
    viewLevelLogs.length = 0;
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    const isTeamActive = await teamTab.getAttribute('class');
    console.log(`👥 Team tab active: ${isTeamActive?.includes('blue') ? 'YES' : 'NO'}`);
    
    console.log('📝 Step 4: Check team cards visibility');
    
    const team1Card = await page.locator(':has-text("NHÓM 1")').first();
    const team2Card = await page.locator(':has-text("NHÓM 2")').first();
    const hasTeam1 = await team1Card.isVisible();
    const hasTeam2 = await team2Card.isVisible();
    
    console.log(`👥 Team 1 card visible: ${hasTeam1}`);
    console.log(`👥 Team 2 card visible: ${hasTeam2}`);
    
    console.log('📝 Step 5: Try clicking team 1');
    
    if (hasTeam1) {
      // Clear logs before clicking team
      viewLevelLogs.length = 0;
      
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks: ${team1Tasks.length}`);
    }
    
    console.log('📝 Step 6: Analyze view level logs');
    
    // Categorize logs
    const viewLevelChangeLogs = viewLevelLogs.filter(log => 
      log.includes('ViewLevel changed')
    );
    
    const teamSetupLogs = viewLevelLogs.filter(log => 
      log.includes('Setting up team view') ||
      log.includes('Setting up non-team view')
    );
    
    const filteringLogs = viewLevelLogs.filter(log => 
      log.includes('Task filtering called')
    );
    
    console.log('\n📊 VIEW LEVEL ANALYSIS:');
    console.log(`  Total view level logs: ${viewLevelLogs.length}`);
    console.log(`  ViewLevel change logs: ${viewLevelChangeLogs.length}`);
    console.log(`  Team setup logs: ${teamSetupLogs.length}`);
    console.log(`  Filtering logs: ${filteringLogs.length}`);
    
    if (viewLevelChangeLogs.length > 0) {
      console.log('\n🔄 VIEW LEVEL CHANGE LOGS:');
      viewLevelChangeLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (teamSetupLogs.length > 0) {
      console.log('\n👥 TEAM SETUP LOGS:');
      teamSetupLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (filteringLogs.length > 0) {
      console.log('\n🔍 FILTERING LOGS:');
      filteringLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Show all view level logs
    console.log('\n⏰ ALL VIEW LEVEL LOGS:');
    viewLevelLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-view-level.png', fullPage: true });
    
    console.log('\n✅ View level debug completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Personal tab initially active: ${isPersonalActive?.includes('blue') ? 'YES' : 'NO'}`);
    console.log(`  Team tab active after click: ${isTeamActive?.includes('blue') ? 'YES' : 'NO'}`);
    console.log(`  Team cards visible: ${hasTeam1 && hasTeam2 ? 'YES' : 'NO'}`);
    console.log(`  ViewLevel change detected: ${viewLevelChangeLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Team setup triggered: ${teamSetupLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Filtering logic called: ${filteringLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (viewLevelLogs.length === 0) {
      console.log('\n🚨 CRITICAL: No view level logs - state management not working!');
    } else if (filteringLogs.length === 0) {
      console.log('\n🚨 ISSUE: ViewLevel changes but filtering not called!');
    } else {
      console.log('\n✅ ViewLevel and filtering logs found');
    }
  });
});
