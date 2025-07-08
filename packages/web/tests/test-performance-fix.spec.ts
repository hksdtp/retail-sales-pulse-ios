import { test, expect } from '@playwright/test';

test.describe('Test Performance Fix', () => {
  test('Test task creation after performance optimization', async ({ page }) => {
    console.log('🔍 Testing task creation after performance optimization...');
    
    // Monitor console messages
    const allConsoleMessages: string[] = [];
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      allConsoleMessages.push(text);
      
      if (msg.type() === 'error') {
        errorMessages.push(text);
      }
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
    
    console.log('📝 Step 1: Check initial console activity');
    const initialMessageCount = allConsoleMessages.length;
    console.log(`📊 Initial console messages: ${initialMessageCount}`);
    
    // Clear messages to focus on task creation
    allConsoleMessages.length = 0;
    errorMessages.length = 0;
    
    console.log('📝 Step 2: Go to personal tab and count tasks');
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    const tasksBefore = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks before creation: ${tasksBefore.length}`);
    
    console.log('📝 Step 3: Create task with performance monitoring');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Performance Test - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    // Fill form
    const titleInput = await page.locator('#task-title').first();
    await titleInput.fill(uniqueTaskTitle);
    
    const descTextarea = await page.locator('#task-description').first();
    await descTextarea.fill('Performance test task after optimization');
    
    const taskTypeButton = await page.locator('button:has-text("Khác")').first();
    await taskTypeButton.click();
    
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    await personalButton.click();
    
    await page.waitForTimeout(1000);
    
    // Clear messages before submission
    const preSubmissionCount = allConsoleMessages.length;
    allConsoleMessages.length = 0;
    
    console.log('📝 Step 4: Submit and monitor performance');
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    await saveButton.click();
    
    // Monitor for 5 seconds
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      console.log(`⏱️  Second ${i + 1}: ${allConsoleMessages.length} messages`);
      
      // Check for success
      const successMessages = allConsoleMessages.filter(msg => 
        msg.includes('Task added successfully')
      );
      
      if (successMessages.length > 0) {
        console.log(`✅ Success detected at second ${i + 1}`);
        break;
      }
    }
    
    console.log('📝 Step 5: Check task visibility');
    
    // Ensure we're on personal tab
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    const tasksAfter = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after creation: ${tasksAfter.length}`);
    console.log(`📈 Task count difference: ${tasksAfter.length - tasksBefore.length}`);
    
    // Look for our task
    const ourTask = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTask = await ourTask.isVisible();
    console.log(`🎯 Our task visible: ${hasOurTask}`);
    
    console.log('📝 Step 6: Performance analysis');
    
    console.log(`📊 Console messages during creation: ${allConsoleMessages.length}`);
    console.log(`🚨 Error messages: ${errorMessages.length}`);
    
    // Check for debug message reduction
    const debugMessages = allConsoleMessages.filter(msg => 
      msg.includes('🔍') || 
      msg.includes('DEBUG') ||
      msg.includes('USE_TASK_DATA_DEBUG') ||
      msg.includes('TASK_MANAGEMENT_DEBUG')
    );
    
    console.log(`🔍 Debug messages: ${debugMessages.length}`);
    
    if (debugMessages.length > 50) {
      console.log('⚠️  Still too many debug messages');
      console.log('First 5 debug messages:');
      debugMessages.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ Debug messages reduced successfully');
    }
    
    // Check for success indicators
    const successMessages = allConsoleMessages.filter(msg => 
      msg.includes('Task added successfully')
    );
    
    if (successMessages.length > 0) {
      console.log('✅ Task creation successful');
      successMessages.forEach(msg => console.log(`  ${msg}`));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'performance-test.png', fullPage: true });
    
    console.log('\n✅ Performance test completed');
    
    // Summary
    console.log('\n📋 PERFORMANCE SUMMARY:');
    console.log(`  Console messages: ${allConsoleMessages.length} (should be < 100)`);
    console.log(`  Debug messages: ${debugMessages.length} (should be < 10)`);
    console.log(`  Error messages: ${errorMessages.length} (should be 0)`);
    console.log(`  Task created: ${successMessages.length > 0}`);
    console.log(`  Task visible: ${hasOurTask}`);
    console.log(`  Task count increased: ${tasksAfter.length > tasksBefore.length}`);
    
    if (allConsoleMessages.length < 100 && debugMessages.length < 10 && hasOurTask) {
      console.log('\n🎉 PERFORMANCE OPTIMIZATION SUCCESSFUL!');
    } else if (hasOurTask) {
      console.log('\n⚠️  TASK WORKS BUT PERFORMANCE NEEDS MORE OPTIMIZATION');
    } else {
      console.log('\n🚨 TASK CREATION STILL NOT WORKING');
    }
  });
});
