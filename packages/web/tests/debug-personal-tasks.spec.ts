import { test, expect } from '@playwright/test';

test.describe('Debug Personal Tasks', () => {
  test('Debug why created tasks do not appear in personal tab', async ({ page }) => {
    console.log('🔍 Debugging personal tasks visibility...');
    
    // Monitor console for relevant logs
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
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
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Check current personal tasks');
    
    // Make sure we're on "Của tôi" tab
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    // Count current tasks
    const currentTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Current personal tasks: ${currentTasks.length}`);
    
    // Log task details if any
    if (currentTasks.length > 0) {
      console.log('📋 Current personal tasks:');
      for (let i = 0; i < Math.min(currentTasks.length, 3); i++) {
        const taskTitle = await currentTasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 2: Create a new task');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const taskTitle = 'Debug Personal Task - ' + Date.now();
    
    // Fill form
    const titleInput = await page.locator('#task-title').first();
    await titleInput.fill(taskTitle);
    
    const descTextarea = await page.locator('#task-description').first();
    await descTextarea.fill('Debug task to check personal visibility');
    
    // Select task type
    const taskTypeButton = await page.locator('button:has-text("Khác")').first();
    await taskTypeButton.click();
    
    // Select visibility
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    await personalButton.click();
    
    await page.waitForTimeout(1000);
    
    // Clear logs to focus on creation
    consoleLogs.length = 0;
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 3: Check if task was created successfully');
    
    // Check for success indicators
    const successLogs = consoleLogs.filter(log => 
      log.includes('Task added successfully') ||
      log.includes('✅ Task added')
    );
    
    if (successLogs.length > 0) {
      console.log('✅ Task creation confirmed:');
      successLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('❌ No task creation success logs found');
    }
    
    console.log('📝 Step 4: Check personal tasks after creation');
    
    // Make sure we're still on personal tab
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    // Count tasks again
    const newTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Personal tasks after creation: ${newTasks.length}`);
    console.log(`📈 Tasks added: ${newTasks.length - currentTasks.length}`);
    
    // Look for our specific task
    const ourTask = await page.locator(`tr:has-text("${taskTitle}")`).first();
    const hasOurTask = await ourTask.isVisible();
    console.log(`🎯 Our task "${taskTitle}" visible: ${hasOurTask}`);
    
    if (!hasOurTask && newTasks.length > currentTasks.length) {
      console.log('📋 New tasks found but not our specific task:');
      for (let i = currentTasks.length; i < newTasks.length; i++) {
        const taskTitle = await newTasks[i].locator('td').first().textContent();
        console.log(`  New: "${taskTitle}"`);
      }
    }
    
    console.log('📝 Step 5: Check task filtering logs');
    
    // Look for filtering logs
    const filterLogs = consoleLogs.filter(log => 
      log.includes('personal tasks') ||
      log.includes('Personal view') ||
      log.includes('created by user') ||
      log.includes('user_id') ||
      log.includes('currentUser')
    );
    
    if (filterLogs.length > 0) {
      console.log('\n📋 Task filtering logs:');
      filterLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    console.log('📝 Step 6: Check user context');
    
    // Get current user from localStorage
    const currentUserData = await page.evaluate(() => {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    });
    
    console.log('👤 Current user data:');
    console.log(`  ID: ${currentUserData?.id}`);
    console.log(`  Name: ${currentUserData?.name}`);
    console.log(`  Role: ${currentUserData?.role}`);
    
    console.log('📝 Step 7: Check all tabs for our task');
    
    // Check team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(2000);
    
    const teamTasksWithOurs = await page.locator(`tr:has-text("${taskTitle}")`).first();
    const hasOurTaskInTeam = await teamTasksWithOurs.isVisible();
    console.log(`🎯 Our task in team tab: ${hasOurTaskInTeam}`);
    
    // Check if there are any tasks in team tab
    const teamTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Team tab tasks: ${teamTasks.length}`);
    
    // Go back to personal tab
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 8: Check database directly');
    
    // Check Supabase logs
    const supabaseLogs = consoleLogs.filter(log => 
      log.includes('Supabase') ||
      log.includes('tasks from') ||
      log.includes('Loaded') ||
      log.includes('Adding new task')
    );
    
    if (supabaseLogs.length > 0) {
      console.log('\n📋 Supabase logs:');
      supabaseLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-personal-tasks.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
    
    // Summary
    if (hasOurTask) {
      console.log('🎉 SUCCESS: Task is visible in personal tab');
    } else if (successLogs.length > 0) {
      console.log('🚨 ISSUE: Task created but not visible in personal tab');
      console.log('💡 Possible causes:');
      console.log('  1. User ID mismatch between creation and filtering');
      console.log('  2. Task filtering logic issue');
      console.log('  3. Data refresh problem');
    } else {
      console.log('❌ FAILED: Task creation failed');
    }
  });
});
