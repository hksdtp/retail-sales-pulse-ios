import { test, expect } from '@playwright/test';

test.describe('Debug All Logs', () => {
  test('Capture ALL console logs to debug tab click', async ({ page }) => {
    console.log('🔍 Capturing ALL console logs...');
    
    // Capture ALL console messages
    const allLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      allLogs.push(`[${msg.type()}] ${text}`);
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
    
    console.log('📝 Step 2: Clear logs and click team tab');
    
    // Clear logs before clicking
    allLogs.length = 0;
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Analyze ALL logs');
    
    // Filter relevant logs
    const tabClickLogs = allLogs.filter(log => 
      log.includes('Tab clicked') ||
      log.includes('onViewLevelChange') ||
      log.includes('ViewLevel changed') ||
      log.includes('Setting up')
    );
    
    const taskFilteringLogs = allLogs.filter(log => 
      log.includes('Task filtering called') ||
      log.includes('Team view') ||
      log.includes('selectedView:')
    );
    
    const errorLogs = allLogs.filter(log => 
      log.includes('[error]') ||
      log.includes('Error') ||
      log.includes('error')
    );
    
    console.log('\n📊 ALL LOGS ANALYSIS:');
    console.log(`  Total logs: ${allLogs.length}`);
    console.log(`  Tab click logs: ${tabClickLogs.length}`);
    console.log(`  Task filtering logs: ${taskFilteringLogs.length}`);
    console.log(`  Error logs: ${errorLogs.length}`);
    
    if (tabClickLogs.length > 0) {
      console.log('\n🔄 TAB CLICK LOGS:');
      tabClickLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (taskFilteringLogs.length > 0) {
      console.log('\n🔍 TASK FILTERING LOGS:');
      taskFilteringLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    if (errorLogs.length > 0) {
      console.log('\n🚨 ERROR LOGS:');
      errorLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Show recent logs
    console.log('\n⏰ RECENT LOGS (Last 20):');
    allLogs.slice(-20).forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-all-logs.png', fullPage: true });
    
    console.log('\n✅ All logs debug completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Total logs captured: ${allLogs.length}`);
    console.log(`  Tab click detected: ${tabClickLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Task filtering called: ${taskFilteringLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Errors present: ${errorLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (allLogs.length === 0) {
      console.log('\n🚨 CRITICAL: No logs captured at all!');
    } else if (tabClickLogs.length === 0) {
      console.log('\n🚨 ISSUE: Tab click not detected in logs!');
    } else {
      console.log('\n✅ Tab click logs found');
    }
  });
});
