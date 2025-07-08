import { test, expect } from '@playwright/test';

test.describe('Debug Data Sources', () => {
  test('Debug what data sources are available for team filtering', async ({ page }) => {
    console.log('🔍 Debugging data sources for team filtering...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
    });
    
    console.log('📝 Step 1: Setup Director user');
    
    // Setup Director user
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
    await page.waitForTimeout(5000); // Wait longer for data to load
    
    console.log('📝 Step 2: Go to team tab and check data sources');
    
    // Go to team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Click on Team 1 and analyze logs');
    
    // Clear logs before team selection
    consoleLogs.length = 0;
    
    // Click on Team 1
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    const hasTeam1Card = await team1Card.isVisible();
    console.log(`👥 Team 1 card visible: ${hasTeam1Card}`);
    
    if (hasTeam1Card) {
      await team1Card.click();
      await page.waitForTimeout(5000); // Wait longer for filtering
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks displayed: ${team1Tasks.length}`);
    }
    
    console.log('📝 Step 4: Analyze data source logs');
    
    // Check for data source logs
    const dataSourceLogs = consoleLogs.filter(log => 
      log.includes('Team view') ||
      log.includes('data source') ||
      log.includes('managerTasks') ||
      log.includes('regularTasks') ||
      log.includes('allManagerTasks') ||
      log.includes('allRegularTasks') ||
      log.includes('Using data source')
    );
    
    if (dataSourceLogs.length > 0) {
      console.log('\n📊 Data Source Logs:');
      dataSourceLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    } else {
      console.log('\n❌ No data source logs found');
    }
    
    // Check for team filtering logs
    const teamFilterLogs = consoleLogs.filter(log => 
      log.includes('team_id=') ||
      log.includes('selectedTeam=') ||
      log.includes('isFromSelectedTeam=') ||
      log.includes('Task "')
    );
    
    if (teamFilterLogs.length > 0) {
      console.log('\n👥 Team Filter Logs:');
      teamFilterLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 300)}`);
      });
    } else {
      console.log('\n❌ No team filter logs found');
    }
    
    // Check for task loading logs
    const taskLoadingLogs = consoleLogs.filter(log => 
      log.includes('tasks from') ||
      log.includes('Loaded') ||
      log.includes('tasks loaded') ||
      log.includes('Supabase')
    );
    
    if (taskLoadingLogs.length > 0) {
      console.log('\n📋 Task Loading Logs:');
      taskLoadingLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    } else {
      console.log('\n❌ No task loading logs found');
    }
    
    // Check for user context logs
    const userContextLogs = consoleLogs.filter(log => 
      log.includes('currentUser') ||
      log.includes('effectiveUser') ||
      log.includes('Getting team tasks for user')
    );
    
    if (userContextLogs.length > 0) {
      console.log('\n👤 User Context Logs:');
      userContextLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    console.log('📝 Step 5: Check personal tab for comparison');
    
    // Go to personal tab to see if data loads there
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Personal tasks (Director): ${personalTasks.length}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-data-sources.png', fullPage: true });
    
    console.log('\n✅ Data sources debugging completed');
    
    // Summary
    console.log('\n📋 DATA SOURCES SUMMARY:');
    console.log(`  Team 1 card visible: ${hasTeam1Card}`);
    console.log(`  Team 1 tasks displayed: ${hasTeam1Card ? team1Tasks.length : 'N/A'}`);
    console.log(`  Personal tasks (Director): ${personalTasks.length}`);
    console.log(`  Data source logs: ${dataSourceLogs.length}`);
    console.log(`  Team filter logs: ${teamFilterLogs.length}`);
    console.log(`  Task loading logs: ${taskLoadingLogs.length}`);
    
    if (dataSourceLogs.length === 0 && teamFilterLogs.length === 0) {
      console.log('\n🚨 ISSUE: No data source or filtering logs - logic not running');
    } else if (dataSourceLogs.length > 0 && teamFilterLogs.length === 0) {
      console.log('\n🚨 ISSUE: Data sources available but filtering not working');
    } else {
      console.log('\n✅ Data sources and filtering logs found');
    }
  });
});
