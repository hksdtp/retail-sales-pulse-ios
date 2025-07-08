import { test, expect } from '@playwright/test';

test.describe('Debug Team Data Source', () => {
  test('Debug team view data source and loading', async ({ page }) => {
    console.log('🔍 Debugging team view data source...');
    
    // Capture data source logs
    const dataSourceLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Team view') || 
          text.includes('data source') || 
          text.includes('managerTasks') || 
          text.includes('regularTasks') ||
          text.includes('allManagerTasks') ||
          text.includes('allRegularTasks') ||
          text.includes('sourceData') ||
          text.includes('Using data source')) {
        dataSourceLogs.push(text);
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
    
    console.log('📝 Step 2: Check personal tab first (baseline)');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Director personal tasks: ${personalTasks.length}`);
    
    console.log('📝 Step 3: Go to team tab and capture data source logs');
    
    // Clear logs before team tab
    dataSourceLogs.length = 0;
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(5000); // Wait longer for data loading
    
    console.log('📝 Step 4: Check if team cards are visible');
    
    const team1Card = await page.locator(':has-text("NHÓM 1")').first();
    const team2Card = await page.locator(':has-text("NHÓM 2")').first();
    const hasTeam1 = await team1Card.isVisible();
    const hasTeam2 = await team2Card.isVisible();
    
    console.log(`👥 Team 1 card visible: ${hasTeam1}`);
    console.log(`👥 Team 2 card visible: ${hasTeam2}`);
    
    console.log('📝 Step 5: Try clicking team 1 and capture more logs');
    
    if (hasTeam1) {
      // Clear logs before clicking
      dataSourceLogs.length = 0;
      
      await team1Card.click();
      await page.waitForTimeout(5000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks after click: ${team1Tasks.length}`);
    }
    
    console.log('📝 Step 6: Analyze data source logs');
    
    // Categorize logs
    const teamViewLogs = dataSourceLogs.filter(log => 
      log.includes('Team view - Getting team tasks')
    );
    
    const dataSourceSelectionLogs = dataSourceLogs.filter(log => 
      log.includes('Using data source:') ||
      log.includes('Available data sources')
    );
    
    const taskCountLogs = dataSourceLogs.filter(log => 
      log.includes('managerTasks:') ||
      log.includes('regularTasks:') ||
      log.includes('with') && log.includes('tasks')
    );
    
    console.log('\n📊 DATA SOURCE ANALYSIS:');
    console.log(`  Total data source logs: ${dataSourceLogs.length}`);
    console.log(`  Team view logs: ${teamViewLogs.length}`);
    console.log(`  Data source selection logs: ${dataSourceSelectionLogs.length}`);
    console.log(`  Task count logs: ${taskCountLogs.length}`);
    
    if (teamViewLogs.length > 0) {
      console.log('\n👥 TEAM VIEW LOGS:');
      teamViewLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    if (dataSourceSelectionLogs.length > 0) {
      console.log('\n📊 DATA SOURCE SELECTION LOGS:');
      dataSourceSelectionLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    }
    
    if (taskCountLogs.length > 0) {
      console.log('\n📋 TASK COUNT LOGS:');
      taskCountLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Show all data source logs
    console.log('\n⏰ ALL DATA SOURCE LOGS:');
    dataSourceLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-team-data-source.png', fullPage: true });
    
    console.log('\n✅ Team data source debug completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Director personal tasks: ${personalTasks.length}`);
    console.log(`  Team cards visible: ${hasTeam1 && hasTeam2 ? 'YES' : 'NO'}`);
    console.log(`  Team view logs: ${teamViewLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Data source logs: ${dataSourceSelectionLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (dataSourceLogs.length === 0) {
      console.log('\n🚨 CRITICAL: No data source logs - team view logic not running!');
    } else if (taskCountLogs.length === 0) {
      console.log('\n🚨 ISSUE: No task count logs - data sources empty!');
    } else {
      console.log('\n✅ Data source logs found - need to analyze content');
    }
  });
});
