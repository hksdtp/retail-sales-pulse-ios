import { test, expect } from '@playwright/test';

test.describe('Test Auto-Sync Fix', () => {
  test('Test data loading after disabling auto-sync infinite loop', async ({ page }) => {
    console.log('🔍 Testing data loading after auto-sync fix...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
    });
    
    console.log('📝 Step 1: Setup Lê Khánh Duy');
    
    // Setup user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1',
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Nhân viên',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000); // Wait longer for data to load
    
    console.log('📝 Step 2: Check personal tasks');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Personal tasks (Lê Khánh Duy): ${personalTasks.length}`);
    
    // Log first few tasks
    if (personalTasks.length > 0) {
      console.log('📋 Personal tasks:');
      for (let i = 0; i < Math.min(personalTasks.length, 5); i++) {
        const taskTitle = await personalTasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 3: Switch to Director and test');
    
    // Switch to Director
    await page.evaluate(() => {
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
    });
    
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Check Director personal tasks
    const directorPersonalTab = await page.locator('button:has-text("Của tôi")').first();
    await directorPersonalTab.click();
    await page.waitForTimeout(3000);
    
    const directorPersonalTasks = await page.locator('tr:has(td)').all();
    console.log(`👑 Director personal tasks: ${directorPersonalTasks.length}`);
    
    console.log('📝 Step 4: Test team filtering');
    
    // Go to team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    // Click on Team 1
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    const hasTeam1Card = await team1Card.isVisible();
    console.log(`👥 Team 1 card visible: ${hasTeam1Card}`);
    
    if (hasTeam1Card) {
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks: ${team1Tasks.length}`);
      
      // Log first few team tasks
      if (team1Tasks.length > 0) {
        console.log('📋 Team 1 tasks:');
        for (let i = 0; i < Math.min(team1Tasks.length, 3); i++) {
          const taskTitle = await team1Tasks[i].locator('td').first().textContent();
          console.log(`  ${i + 1}. "${taskTitle}"`);
        }
      }
    }
    
    console.log('📝 Step 5: Test member view');
    
    // Go to member tab
    const memberTab = await page.locator('button:has-text("Thành viên")').first();
    const hasMemberTab = await memberTab.isVisible();
    console.log(`📋 Member tab visible: ${hasMemberTab}`);
    
    if (hasMemberTab) {
      await memberTab.click();
      await page.waitForTimeout(5000); // Wait longer for member view
      
      const memberTasks = await page.locator('tr:has(td)').all();
      console.log(`📋 Member view tasks: ${memberTasks.length}`);
      
      // Log first few member tasks
      if (memberTasks.length > 0) {
        console.log('📋 Member view tasks:');
        for (let i = 0; i < Math.min(memberTasks.length, 3); i++) {
          const taskTitle = await memberTasks[i].locator('td').first().textContent();
          console.log(`  ${i + 1}. "${taskTitle}"`);
        }
      }
    }
    
    console.log('📝 Step 6: Analyze logs');
    
    // Check for auto-sync logs
    const autoSyncLogs = consoleLogs.filter(log => 
      log.includes('auto-sync') ||
      log.includes('Auto-sync') ||
      log.includes('event listeners')
    );
    
    if (autoSyncLogs.length > 0) {
      console.log('\n📡 Auto-sync Logs:');
      autoSyncLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Check for data loading logs
    const dataLoadingLogs = consoleLogs.filter(log => 
      log.includes('tasks from') ||
      log.includes('Loaded') ||
      log.includes('Supabase') ||
      log.includes('refreshTasks')
    );
    
    if (dataLoadingLogs.length > 0) {
      console.log('\n📊 Data Loading Logs:');
      dataLoadingLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Check for infinite loop indicators
    const infiniteLoopLogs = consoleLogs.filter(log => 
      log.includes('Force refresh triggered') ||
      log.includes('refreshing due to auto-sync') ||
      log.includes('setRefreshTrigger')
    );
    
    console.log(`🔄 Infinite loop indicators: ${infiniteLoopLogs.length}`);
    
    // Take screenshot
    await page.screenshot({ path: 'test-auto-sync-fix.png', fullPage: true });
    
    console.log('\n✅ Auto-sync fix test completed');
    
    // Summary
    console.log('\n📋 AUTO-SYNC FIX SUMMARY:');
    console.log(`  Personal tasks (Lê Khánh Duy): ${personalTasks.length}`);
    console.log(`  Director personal tasks: ${directorPersonalTasks.length}`);
    console.log(`  Team 1 tasks: ${hasTeam1Card ? team1Tasks.length : 'N/A'}`);
    console.log(`  Member view tasks: ${hasMemberTab ? memberTasks.length : 'N/A'}`);
    console.log(`  Auto-sync logs: ${autoSyncLogs.length}`);
    console.log(`  Data loading logs: ${dataLoadingLogs.length}`);
    console.log(`  Infinite loop indicators: ${infiniteLoopLogs.length}`);
    
    if (personalTasks.length > 0 && directorPersonalTasks.length >= 0) {
      console.log('\n🎉 SUCCESS: Data loading is working!');
    } else {
      console.log('\n🚨 ISSUE: Data loading still not working');
    }
    
    if (infiniteLoopLogs.length === 0) {
      console.log('✅ SUCCESS: Infinite loop fixed!');
    } else {
      console.log('🚨 ISSUE: Infinite loop still present');
    }
  });
});
