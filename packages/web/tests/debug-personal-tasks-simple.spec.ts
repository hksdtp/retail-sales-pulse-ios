import { test, expect } from '@playwright/test';

test.describe('Debug Personal Tasks Simple', () => {
  test('Debug why Lê Khánh Duy cannot see personal tasks', async ({ page }) => {
    console.log('🔍 Debugging personal tasks for Lê Khánh Duy...');
    
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
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const currentTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Current personal tasks: ${currentTasks.length}`);
    
    // Log current task details
    if (currentTasks.length > 0) {
      console.log('📋 Current personal tasks:');
      for (let i = 0; i < Math.min(currentTasks.length, 5); i++) {
        const taskTitle = await currentTasks[i].locator('td').first().textContent();
        console.log(`  ${i + 1}. "${taskTitle}"`);
      }
    } else {
      console.log('❌ No personal tasks found');
    }
    
    console.log('📝 Step 2: Create a new task');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Personal Debug - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    // Fill form
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Debug personal task visibility');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(1000);
    
    // Clear logs before submission
    consoleLogs.length = 0;
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 3: Check if task was created');
    
    const successLogs = consoleLogs.filter(log => 
      log.includes('Task added successfully')
    );
    
    if (successLogs.length > 0) {
      console.log('✅ Task creation confirmed');
    } else {
      console.log('❌ No task creation confirmation');
    }
    
    console.log('📝 Step 4: Check personal tasks after creation');
    
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    const tasksAfter = await page.locator('tr:has(td)').all();
    console.log(`📊 Personal tasks after creation: ${tasksAfter.length}`);
    console.log(`📈 Task count difference: ${tasksAfter.length - currentTasks.length}`);
    
    // Look for our specific task
    const ourTask = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTask = await ourTask.isVisible();
    console.log(`🎯 Our task visible in personal: ${hasOurTask}`);
    
    console.log('📝 Step 5: Check task in other tabs');
    
    // Check team tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    await teamTab.click();
    await page.waitForTimeout(2000);
    
    // Click on team 1
    const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
    const hasTeam1Card = await team1Card.isVisible();
    
    if (hasTeam1Card) {
      await team1Card.click();
      await page.waitForTimeout(2000);
      
      const ourTaskInTeam = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
      const hasOurTaskInTeam = await ourTaskInTeam.isVisible();
      console.log(`🎯 Our task visible in team: ${hasOurTaskInTeam}`);
      
      const teamTasks = await page.locator('tr:has(td)').all();
      console.log(`📊 Team tasks: ${teamTasks.length}`);
    }
    
    console.log('📝 Step 6: Switch to Director and check');
    
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
    await page.waitForTimeout(3000);
    
    // Check personal tab as Director
    const directorPersonalTab = await page.locator('button:has-text("Của tôi")').first();
    await directorPersonalTab.click();
    await page.waitForTimeout(2000);
    
    const directorPersonalTasks = await page.locator('tr:has(td)').all();
    const hasOurTaskInDirectorPersonal = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
    console.log(`👑 Director personal tasks: ${directorPersonalTasks.length}`);
    console.log(`👑 Our task visible to Director in personal: ${hasOurTaskInDirectorPersonal}`);
    
    // Check member tab as Director
    const memberTab = await page.locator('button:has-text("Thành viên")').first();
    const hasMemberTab = await memberTab.isVisible();
    
    if (hasMemberTab) {
      await memberTab.click();
      await page.waitForTimeout(2000);
      
      const memberTasks = await page.locator('tr:has(td)').all();
      const hasOurTaskInMember = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first().isVisible();
      console.log(`📋 Member view tasks: ${memberTasks.length}`);
      console.log(`📋 Our task visible in member view: ${hasOurTaskInMember}`);
    }
    
    console.log('📝 Step 7: Analyze filtering logs');
    
    // Check for personal task filtering logs
    const personalFilterLogs = consoleLogs.filter(log => 
      log.includes('Personal view') ||
      log.includes('personal tasks') ||
      log.includes('created by user') ||
      log.includes('isCreatedByCurrentUser') ||
      log.includes(uniqueTaskTitle)
    );
    
    if (personalFilterLogs.length > 0) {
      console.log('\n📋 Personal Task Filter Logs:');
      personalFilterLogs.slice(0, 10).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 250)}`);
      });
    } else {
      console.log('\n❌ No personal task filter logs found');
    }
    
    // Check for user context logs
    const userContextLogs = consoleLogs.filter(log => 
      log.includes('user_khanh_duy') ||
      log.includes('Lê Khánh Duy') ||
      log.includes('currentUser') ||
      log.includes('effectiveUser')
    );
    
    if (userContextLogs.length > 0) {
      console.log('\n👤 User Context Logs:');
      userContextLogs.slice(0, 5).forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.substring(0, 200)}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-personal-tasks-simple.png', fullPage: true });
    
    console.log('\n✅ Personal tasks debugging completed');
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`  Task created: ${successLogs.length > 0}`);
    console.log(`  Visible in personal (Lê Khánh Duy): ${hasOurTask}`);
    console.log(`  Visible in team: ${hasTeam1Card ? 'checked' : 'not checked'}`);
    console.log(`  Visible to Director personal: ${hasOurTaskInDirectorPersonal}`);
    console.log(`  Visible in member view: ${hasMemberTab ? 'checked' : 'not available'}`);
    console.log(`  Personal task count change: ${tasksAfter.length - currentTasks.length}`);
    
    if (!hasOurTask && hasOurTaskInDirectorPersonal) {
      console.log('\n🚨 ISSUE CONFIRMED: Task visible to Director but not to creator');
      console.log('💡 Possible causes:');
      console.log('  1. Personal task filtering logic is wrong');
      console.log('  2. User ID mismatch between creation and filtering');
      console.log('  3. Task ownership not set correctly');
    } else if (hasOurTask) {
      console.log('\n✅ NO ISSUE: Personal tasks working correctly');
    } else {
      console.log('\n❌ UNKNOWN ISSUE: Task not visible anywhere');
    }
  });
});
