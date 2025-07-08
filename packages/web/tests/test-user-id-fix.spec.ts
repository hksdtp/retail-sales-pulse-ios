import { test, expect } from '@playwright/test';

test.describe('Test User ID Fix', () => {
  test('Test user ID mapping fix for Lê Khánh Duy', async ({ page }) => {
    console.log('🔍 Testing user ID mapping fix...');
    
    // Monitor console for user ID logs
    const userIdLogs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('currentUserId') || text.includes('user_id') || text.includes('isCreatedByCurrentUser')) {
        userIdLogs.push(text);
      }
    });
    
    console.log('📝 Step 1: Setup Lê Khánh Duy with correct email');
    
    // Setup user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy', // Use correct ID
        name: 'Lê Khánh Duy',
        email: 'khanhduy.le@example.com', // Use the email that was causing fallback
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
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Check personal tasks');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const personalTasks = await page.locator('tr:has(td)').all();
    console.log(`👤 Personal tasks count: ${personalTasks.length}`);
    
    // Log first few tasks
    if (personalTasks.length > 0) {
      console.log('📋 Personal tasks:');
      for (let i = 0; i < Math.min(personalTasks.length, 5); i++) {
        const taskTitle = await personalTasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 3: Analyze user ID logs');
    
    // Check for user ID matching
    const userIdMatchLogs = userIdLogs.filter(log => 
      log.includes('currentUserId=user_khanh_duy') ||
      log.includes('isCreatedByCurrentUser=true')
    );
    
    const fallbackIdLogs = userIdLogs.filter(log => 
      log.includes('fallback_') ||
      log.includes('currentUserId=fallback')
    );
    
    console.log('\n📊 USER ID ANALYSIS:');
    console.log(`  User ID match logs: ${userIdMatchLogs.length}`);
    console.log(`  Fallback ID logs: ${fallbackIdLogs.length}`);
    
    if (userIdMatchLogs.length > 0) {
      console.log('\n✅ USER ID MATCH LOGS:');
      userIdMatchLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    if (fallbackIdLogs.length > 0) {
      console.log('\n🚨 FALLBACK ID LOGS:');
      fallbackIdLogs.slice(0, 3).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Show recent user ID logs
    console.log('\n⏰ RECENT USER ID LOGS:');
    userIdLogs.slice(-10).forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'test-user-id-fix.png', fullPage: true });
    
    console.log('\n✅ User ID fix test completed');
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log(`  Personal tasks working: ${personalTasks.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  User ID matches: ${userIdMatchLogs.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  Fallback ID used: ${fallbackIdLogs.length > 0 ? 'YES' : 'NO'}`);
    
    if (personalTasks.length > 0 && userIdMatchLogs.length > 0 && fallbackIdLogs.length === 0) {
      console.log('\n🎉 SUCCESS: User ID fix working perfectly!');
    } else if (personalTasks.length > 0 && fallbackIdLogs.length === 0) {
      console.log('\n✅ PARTIAL SUCCESS: Tasks working, need to verify user ID matching');
    } else if (fallbackIdLogs.length > 0) {
      console.log('\n🚨 ISSUE: Still using fallback ID');
    } else {
      console.log('\n🚨 ISSUE: Personal tasks not working');
    }
  });
});
