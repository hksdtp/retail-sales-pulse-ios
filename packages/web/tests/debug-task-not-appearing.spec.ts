import { test, expect } from '@playwright/test';

test.describe('Debug Task Not Appearing', () => {
  test('Debug why created tasks do not appear with full console monitoring', async ({ page }) => {
    console.log('🔍 Debugging task not appearing with full console monitoring...');
    
    // Monitor ALL console messages
    const allConsoleMessages: string[] = [];
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];
    const debugMessages: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      allConsoleMessages.push(text);
      
      if (msg.type() === 'error') {
        errorMessages.push(text);
      } else if (msg.type() === 'warning') {
        warningMessages.push(text);
      } else if (text.includes('DEBUG') || text.includes('🔍')) {
        debugMessages.push(text);
      }
    });
    
    // Setup user exactly as in real scenario
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
    await page.waitForTimeout(5000); // Wait longer for initial load
    
    console.log('📝 Step 1: Monitor initial console activity');
    console.log(`📊 Initial console messages: ${allConsoleMessages.length}`);
    
    // Clear messages to focus on task creation
    const initialMessageCount = allConsoleMessages.length;
    allConsoleMessages.length = 0;
    errorMessages.length = 0;
    warningMessages.length = 0;
    debugMessages.length = 0;
    
    console.log('📝 Step 2: Ensure we are on personal tab');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(3000);
    
    // Count current tasks BEFORE creation
    const tasksBefore = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks before creation: ${tasksBefore.length}`);
    
    // Take screenshot before
    await page.screenshot({ path: 'before-task-creation.png', fullPage: true });
    
    console.log('📝 Step 3: Create task with detailed monitoring');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Real Test Task - ${Date.now()}`;
    console.log(`📝 Creating task with title: "${uniqueTaskTitle}"`);
    
    // Fill form step by step with monitoring
    const titleInput = await page.locator('#task-title').first();
    await titleInput.fill(uniqueTaskTitle);
    console.log('✅ Title filled');
    
    const descTextarea = await page.locator('#task-description').first();
    await descTextarea.fill('Real test task to debug visibility issue');
    console.log('✅ Description filled');
    
    // Select task type
    const taskTypeButton = await page.locator('button:has-text("Khác")').first();
    await taskTypeButton.click();
    console.log('✅ Task type selected');
    
    // Select visibility
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    await personalButton.click();
    console.log('✅ Visibility selected');
    
    await page.waitForTimeout(1000);
    
    // Clear messages before submission
    const preSubmissionCount = allConsoleMessages.length;
    allConsoleMessages.length = 0;
    
    console.log('📝 Step 4: Submit task and monitor closely');
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    
    // Wait and monitor for 10 seconds
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      console.log(`⏱️  Second ${i + 1}: ${allConsoleMessages.length} new messages`);
      
      // Check for success indicators
      const successMessages = allConsoleMessages.filter(msg => 
        msg.includes('Task added successfully') || 
        msg.includes('✅ Task added')
      );
      
      if (successMessages.length > 0) {
        console.log(`✅ Success detected at second ${i + 1}`);
        break;
      }
    }
    
    console.log('📝 Step 5: Check task visibility immediately after creation');
    
    // Check if dialog closed
    const dialog = await page.locator('[role="dialog"]').first();
    const dialogOpen = await dialog.isVisible();
    console.log(`📋 Dialog still open: ${dialogOpen}`);
    
    if (dialogOpen) {
      // Try to close dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Ensure we're on personal tab
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    // Count tasks AFTER creation
    const tasksAfter = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after creation: ${tasksAfter.length}`);
    console.log(`📈 Task count difference: ${tasksAfter.length - tasksBefore.length}`);
    
    // Look for our specific task
    const ourTask = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTask = await ourTask.isVisible();
    console.log(`🎯 Our task "${uniqueTaskTitle}" visible: ${hasOurTask}`);
    
    // Take screenshot after
    await page.screenshot({ path: 'after-task-creation.png', fullPage: true });
    
    console.log('📝 Step 6: Analyze console messages');
    
    console.log(`📊 Total console messages during creation: ${allConsoleMessages.length}`);
    console.log(`🚨 Error messages: ${errorMessages.length}`);
    console.log(`⚠️  Warning messages: ${warningMessages.length}`);
    console.log(`🔍 Debug messages: ${debugMessages.length}`);
    
    // Show first 10 error messages
    if (errorMessages.length > 0) {
      console.log('\n🚨 First 10 Error Messages:');
      errorMessages.slice(0, 10).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 150)}...`);
      });
    }
    
    // Show task-related messages
    const taskMessages = allConsoleMessages.filter(msg => 
      msg.includes('task') || 
      msg.includes('Task') || 
      msg.includes('adding') || 
      msg.includes('Adding') ||
      msg.includes('Supabase') ||
      msg.includes('personal')
    );
    
    if (taskMessages.length > 0) {
      console.log('\n📋 Task-related Messages (first 20):');
      taskMessages.slice(0, 20).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 200)}`);
      });
    }
    
    // Check for infinite loops or excessive re-renders
    const renderMessages = allConsoleMessages.filter(msg => 
      msg.includes('render') || 
      msg.includes('useEffect') || 
      msg.includes('useState') ||
      msg.includes('DEBUG')
    );
    
    if (renderMessages.length > 50) {
      console.log(`\n🔄 Possible infinite re-render detected: ${renderMessages.length} render-related messages`);
      console.log('First 5 render messages:');
      renderMessages.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 150)}`);
      });
    }
    
    console.log('📝 Step 7: Try manual refresh and recheck');
    
    // Refresh page and check again
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Go to personal tab again
    const personalTabAfterRefresh = await page.locator('button:has-text("Của tôi")').first();
    await personalTabAfterRefresh.click();
    await page.waitForTimeout(3000);
    
    // Check for our task after refresh
    const ourTaskAfterRefresh = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTaskAfterRefresh = await ourTaskAfterRefresh.isVisible();
    console.log(`🎯 Our task after refresh: ${hasOurTaskAfterRefresh}`);
    
    const tasksAfterRefresh = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after refresh: ${tasksAfterRefresh.length}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'after-refresh.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
    
    // Final summary
    console.log('\n📋 SUMMARY:');
    console.log(`  Task created successfully: ${allConsoleMessages.some(msg => msg.includes('Task added successfully'))}`);
    console.log(`  Task visible immediately: ${hasOurTask}`);
    console.log(`  Task visible after refresh: ${hasOurTaskAfterRefresh}`);
    console.log(`  Console message count: ${allConsoleMessages.length}`);
    console.log(`  Error count: ${errorMessages.length}`);
    console.log(`  Task count before: ${tasksBefore.length}`);
    console.log(`  Task count after: ${tasksAfter.length}`);
    console.log(`  Task count after refresh: ${tasksAfterRefresh.length}`);
    
    if (!hasOurTask && !hasOurTaskAfterRefresh) {
      console.log('\n🚨 ISSUE CONFIRMED: Task not appearing in UI');
    } else if (!hasOurTask && hasOurTaskAfterRefresh) {
      console.log('\n⚠️  TIMING ISSUE: Task appears only after refresh');
    } else {
      console.log('\n✅ NO ISSUE: Task appears correctly');
    }
  });
});
