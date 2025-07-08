import { test, expect } from '@playwright/test';

test.describe('Capture Console Debug', () => {
  test('Capture and analyze all console debug messages', async ({ page }) => {
    console.log('🔍 Capturing all console debug messages...');
    
    // Capture ALL console messages with detailed info
    const allMessages: Array<{
      type: string;
      text: string;
      timestamp: number;
      location?: string;
    }> = [];
    
    page.on('console', msg => {
      const timestamp = Date.now();
      const text = msg.text();
      const type = msg.type();
      const location = msg.location();
      
      allMessages.push({
        type,
        text,
        timestamp,
        location: location ? `${location.url}:${location.lineNumber}` : undefined
      });
    });
    
    // Also capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(`PAGE ERROR: ${error.message}`);
    });
    
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
    
    console.log('📝 Step 1: Navigate to tasks page and capture initial logs');
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Go to personal tab');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Personal tasks count: ${personalTasks.length}`);
    
    console.log('📝 Step 3: Switch to Director');
    
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
    
    console.log('📝 Step 4: Test team tab');
    
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    const hasTeam1 = await team1Card.isVisible();
    
    if (hasTeam1) {
      await team1Card.click();
      await page.waitForTimeout(3000);
      
      const team1Tasks = await page.locator('tr:has(td)').all();
      console.log(`👥 Team 1 tasks count: ${team1Tasks.length}`);
    }
    
    console.log('📝 Step 5: Analyze console messages');
    
    // Categorize messages
    const errorMessages = allMessages.filter(m => m.type === 'error');
    const warningMessages = allMessages.filter(m => m.type === 'warning');
    const logMessages = allMessages.filter(m => m.type === 'log');
    const debugMessages = allMessages.filter(m => 
      m.text.includes('🔍') || 
      m.text.includes('DEBUG') || 
      m.text.includes('debug')
    );
    const taskMessages = allMessages.filter(m => 
      m.text.includes('task') || 
      m.text.includes('Task') ||
      m.text.includes('personal') ||
      m.text.includes('team')
    );
    const supabaseMessages = allMessages.filter(m => 
      m.text.includes('Supabase') || 
      m.text.includes('supabase') ||
      m.text.includes('Loading') ||
      m.text.includes('Loaded')
    );
    const autoSyncMessages = allMessages.filter(m => 
      m.text.includes('auto-sync') || 
      m.text.includes('Auto-sync') ||
      m.text.includes('event listeners') ||
      m.text.includes('refreshing due to')
    );
    
    console.log('\n📊 CONSOLE MESSAGE SUMMARY:');
    console.log(`  Total messages: ${allMessages.length}`);
    console.log(`  Errors: ${errorMessages.length}`);
    console.log(`  Warnings: ${warningMessages.length}`);
    console.log(`  Logs: ${logMessages.length}`);
    console.log(`  Debug messages: ${debugMessages.length}`);
    console.log(`  Task-related: ${taskMessages.length}`);
    console.log(`  Supabase-related: ${supabaseMessages.length}`);
    console.log(`  Auto-sync related: ${autoSyncMessages.length}`);
    console.log(`  Page errors: ${pageErrors.length}`);
    
    // Show errors first
    if (errorMessages.length > 0) {
      console.log('\n🚨 ERROR MESSAGES:');
      errorMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
        if (msg.location) console.log(`      Location: ${msg.location}`);
      });
    }
    
    // Show warnings
    if (warningMessages.length > 0) {
      console.log('\n⚠️ WARNING MESSAGES:');
      warningMessages.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show debug messages
    if (debugMessages.length > 0) {
      console.log('\n🔍 DEBUG MESSAGES:');
      debugMessages.slice(0, 15).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 250)}`);
      });
    }
    
    // Show task-related messages
    if (taskMessages.length > 0) {
      console.log('\n📋 TASK-RELATED MESSAGES:');
      taskMessages.slice(0, 20).forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show Supabase messages
    if (supabaseMessages.length > 0) {
      console.log('\n📊 SUPABASE MESSAGES:');
      supabaseMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show auto-sync messages
    if (autoSyncMessages.length > 0) {
      console.log('\n📡 AUTO-SYNC MESSAGES:');
      autoSyncMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show page errors
    if (pageErrors.length > 0) {
      console.log('\n💥 PAGE ERRORS:');
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Look for specific patterns
    const infiniteLoopIndicators = allMessages.filter(m => 
      m.text.includes('Force refresh triggered') ||
      m.text.includes('refreshing due to auto-sync') ||
      m.text.includes('setRefreshTrigger')
    );
    
    const dataLoadingIndicators = allMessages.filter(m => 
      m.text.includes('Loading tasks') ||
      m.text.includes('Loaded') ||
      m.text.includes('tasks from') ||
      m.text.includes('refreshTasks')
    );
    
    const filteringIndicators = allMessages.filter(m => 
      m.text.includes('Personal view') ||
      m.text.includes('Team view') ||
      m.text.includes('filtering') ||
      m.text.includes('isFromSelectedTeam')
    );
    
    console.log('\n🔍 PATTERN ANALYSIS:');
    console.log(`  Infinite loop indicators: ${infiniteLoopIndicators.length}`);
    console.log(`  Data loading indicators: ${dataLoadingIndicators.length}`);
    console.log(`  Filtering indicators: ${filteringIndicators.length}`);
    
    if (infiniteLoopIndicators.length > 0) {
      console.log('\n🔄 INFINITE LOOP INDICATORS:');
      infiniteLoopIndicators.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 150)}`);
      });
    }
    
    if (dataLoadingIndicators.length > 0) {
      console.log('\n📊 DATA LOADING INDICATORS:');
      dataLoadingIndicators.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 150)}`);
      });
    }
    
    if (filteringIndicators.length > 0) {
      console.log('\n🔍 FILTERING INDICATORS:');
      filteringIndicators.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 150)}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'console-debug-capture.png', fullPage: true });
    
    console.log('\n✅ Console debug capture completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    if (errorMessages.length === 0 && pageErrors.length === 0) {
      console.log('✅ No errors detected');
    } else {
      console.log(`🚨 ${errorMessages.length + pageErrors.length} errors detected`);
    }
    
    if (infiniteLoopIndicators.length === 0) {
      console.log('✅ No infinite loop detected');
    } else {
      console.log(`🔄 ${infiniteLoopIndicators.length} infinite loop indicators`);
    }
    
    if (dataLoadingIndicators.length > 0) {
      console.log('✅ Data loading activity detected');
    } else {
      console.log('🚨 No data loading activity detected');
    }
    
    if (personalTasks.length > 0) {
      console.log('✅ Personal tasks are loading');
    } else {
      console.log('🚨 Personal tasks not loading');
    }
  });
});
