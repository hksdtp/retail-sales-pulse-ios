import { test, expect } from '@playwright/test';

test.describe('Simple Console Debug', () => {
  test('Capture console logs for personal tasks only', async ({ page }) => {
    console.log('🔍 Capturing console logs for personal tasks...');
    
    // Capture ALL console messages
    const allMessages: Array<{
      type: string;
      text: string;
      timestamp: number;
    }> = [];
    
    page.on('console', msg => {
      allMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });
    
    // Capture page errors
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
    
    console.log('📝 Step 1: Navigate to tasks page');
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Go to personal tab');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Personal tasks count: ${personalTasks.length}`);
    
    console.log('📝 Step 3: Analyze console messages');
    
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
      m.text.includes('Personal')
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
      m.text.includes('event listeners')
    );
    
    const infiniteLoopMessages = allMessages.filter(m => 
      m.text.includes('Force refresh triggered') ||
      m.text.includes('refreshing due to auto-sync') ||
      m.text.includes('setRefreshTrigger')
    );
    
    const dataLoadingMessages = allMessages.filter(m => 
      m.text.includes('Loading tasks') ||
      m.text.includes('Loaded') ||
      m.text.includes('tasks from') ||
      m.text.includes('refreshTasks')
    );
    
    const filteringMessages = allMessages.filter(m => 
      m.text.includes('Personal view') ||
      m.text.includes('filtering') ||
      m.text.includes('created by user') ||
      m.text.includes('isCreatedByCurrentUser')
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
    console.log(`  Infinite loop indicators: ${infiniteLoopMessages.length}`);
    console.log(`  Data loading indicators: ${dataLoadingMessages.length}`);
    console.log(`  Filtering indicators: ${filteringMessages.length}`);
    console.log(`  Page errors: ${pageErrors.length}`);
    
    // Show errors first (most important)
    if (errorMessages.length > 0) {
      console.log('\n🚨 ERROR MESSAGES:');
      errorMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 300)}`);
      });
    }
    
    // Show page errors
    if (pageErrors.length > 0) {
      console.log('\n💥 PAGE ERRORS:');
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // Show warnings
    if (warningMessages.length > 0) {
      console.log('\n⚠️ WARNING MESSAGES:');
      warningMessages.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show auto-sync messages (important for debugging)
    if (autoSyncMessages.length > 0) {
      console.log('\n📡 AUTO-SYNC MESSAGES:');
      autoSyncMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show infinite loop indicators
    if (infiniteLoopMessages.length > 0) {
      console.log('\n🔄 INFINITE LOOP INDICATORS:');
      infiniteLoopMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show data loading messages
    if (dataLoadingMessages.length > 0) {
      console.log('\n📊 DATA LOADING MESSAGES:');
      dataLoadingMessages.slice(0, 15).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show filtering messages
    if (filteringMessages.length > 0) {
      console.log('\n🔍 FILTERING MESSAGES:');
      filteringMessages.slice(0, 15).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 250)}`);
      });
    }
    
    // Show task-related messages
    if (taskMessages.length > 0) {
      console.log('\n📋 TASK-RELATED MESSAGES:');
      taskMessages.slice(0, 20).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show Supabase messages
    if (supabaseMessages.length > 0) {
      console.log('\n📊 SUPABASE MESSAGES:');
      supabaseMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 200)}`);
      });
    }
    
    // Show debug messages
    if (debugMessages.length > 0) {
      console.log('\n🔍 DEBUG MESSAGES:');
      debugMessages.slice(0, 20).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.text.substring(0, 250)}`);
      });
    }
    
    // Show recent messages (last 20)
    console.log('\n⏰ RECENT MESSAGES (Last 20):');
    allMessages.slice(-20).forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.type}] ${msg.text.substring(0, 200)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'simple-console-debug.png', fullPage: true });
    
    console.log('\n✅ Console debug analysis completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Personal tasks working: ${personalTasks.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Errors present: ${errorMessages.length > 0 || pageErrors.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Infinite loops: ${infiniteLoopMessages.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Data loading active: ${dataLoadingMessages.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Filtering active: ${filteringMessages.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Auto-sync disabled: ${autoSyncMessages.some(m => m.text.includes('DISABLED')) ? 'YES' : 'NO'}`);
  });
});
