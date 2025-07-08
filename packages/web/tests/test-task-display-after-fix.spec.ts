import { test, expect } from '@playwright/test';

test.describe('Test Task Display After Fix', () => {
  test('Check if created task displays in UI', async ({ page }) => {
    console.log('🔍 Testing task display after filter fix...');
    
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
    await page.waitForTimeout(5000); // Wait longer for data loading
    
    console.log('📝 Step 1: Check current user');
    
    const currentUser = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return {
        id: user.id,
        name: user.name,
        role: user.role
      };
    });
    console.log(`👤 Current user: ${JSON.stringify(currentUser)}`);
    
    console.log('📝 Step 2: Check all tabs for tasks');
    
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Testing tab: ${tabName}`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isVisible = await tab.isVisible().catch(() => false);
      
      if (isVisible) {
        await tab.click();
        await page.waitForTimeout(2000);
        
        // Check for tasks
        const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
        console.log(`📊 Tasks in "${tabName}" tab: ${taskElements.length}`);
        
        // Look for specific task
        const specificTask = await page.locator('text="Complete Task - Lê Khánh Duy"').first();
        const hasSpecificTask = await specificTask.isVisible().catch(() => false);
        console.log(`🎯 "Complete Task - Lê Khánh Duy" visible: ${hasSpecificTask}`);
        
        // Check for any task with Lê Khánh Duy
        const anyKhanhDuyTask = await page.locator(':has-text("Lê Khánh Duy")').all();
        console.log(`👤 Elements containing "Lê Khánh Duy": ${anyKhanhDuyTask.length}`);
        
        // Check for empty state
        const emptyState = await page.locator(':has-text("Chưa có công việc"), :has-text("No tasks"), .empty-state').first();
        const hasEmptyState = await emptyState.isVisible().catch(() => false);
        console.log(`📝 Empty state visible: ${hasEmptyState}`);
        
        if (hasSpecificTask) {
          console.log(`🎉 SUCCESS: Task found in "${tabName}" tab!`);
          break;
        }
      } else {
        console.log(`❌ Tab "${tabName}" not visible`);
      }
    }
    
    console.log('📝 Step 3: Force refresh and check again');
    
    // Try refresh button
    const refreshButton = await page.locator('button:has-text("Làm mới"), button:has-text("Tải lại")').first();
    const hasRefreshButton = await refreshButton.isVisible().catch(() => false);
    
    if (hasRefreshButton) {
      console.log('🔄 Clicking refresh button...');
      await refreshButton.click();
      await page.waitForTimeout(3000);
      
      // Check again after refresh
      const taskElementsAfterRefresh = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
      console.log(`📊 Tasks after refresh: ${taskElementsAfterRefresh.length}`);
      
      const specificTaskAfterRefresh = await page.locator('text="Complete Task - Lê Khánh Duy"').first();
      const hasSpecificTaskAfterRefresh = await specificTaskAfterRefresh.isVisible().catch(() => false);
      console.log(`🎯 "Complete Task - Lê Khánh Duy" visible after refresh: ${hasSpecificTaskAfterRefresh}`);
    } else {
      console.log('❌ Refresh button not found');
    }
    
    console.log('📝 Step 4: Check browser console for debug info');
    
    // Get console logs
    const consoleLogs = await page.evaluate(() => {
      // Trigger a manual data refresh
      if (window.location.reload) {
        console.log('🔄 Manual page reload triggered');
      }
      return 'Console check completed';
    });
    
    // Take screenshot
    await page.screenshot({ path: 'task-display-after-fix.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
