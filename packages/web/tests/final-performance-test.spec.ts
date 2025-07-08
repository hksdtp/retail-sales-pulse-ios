import { test, expect } from '@playwright/test';

test.describe('Final Performance Test', () => {
  test('Final test of task creation performance after all optimizations', async ({ page }) => {
    console.log('🔍 Final performance test after all optimizations...');
    
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
    
    console.log('📝 Step 1: Clear console and go to personal tab');
    
    // Clear initial messages
    allConsoleMessages.length = 0;
    errorMessages.length = 0;
    
    const personalTab = await page.locator('button:has-text("Của tôi")').first();
    await personalTab.click();
    await page.waitForTimeout(2000);
    
    const tasksBefore = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks before creation: ${tasksBefore.length}`);
    
    console.log('📝 Step 2: Create task with minimal monitoring');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    const uniqueTaskTitle = `Final Test - ${Date.now()}`;
    console.log(`📝 Creating task: "${uniqueTaskTitle}"`);
    
    // Fill form quickly
    await page.locator('#task-title').fill(uniqueTaskTitle);
    await page.locator('#task-description').fill('Final performance test');
    await page.locator('button:has-text("Công việc khác")').first().click();
    await page.locator('button:has-text("Cá nhân")').first().click();
    
    await page.waitForTimeout(500);
    
    // Clear messages before submission
    allConsoleMessages.length = 0;
    
    console.log('📝 Step 3: Submit and measure performance');
    
    const startTime = Date.now();
    
    await page.locator('button:has-text("Lưu")').click();
    
    // Wait for success with timeout
    let taskCreated = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      
      const successMessages = allConsoleMessages.filter(msg => 
        msg.includes('Task added successfully')
      );
      
      if (successMessages.length > 0) {
        taskCreated = true;
        console.log(`✅ Task created in ${(Date.now() - startTime) / 1000}s`);
        break;
      }
    }
    
    console.log('📝 Step 4: Check task visibility');
    
    // Ensure we're on personal tab
    await personalTab.click();
    await page.waitForTimeout(1000);
    
    const tasksAfter = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after creation: ${tasksAfter.length}`);
    
    // Look for our task
    const ourTask = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTask = await ourTask.isVisible();
    console.log(`🎯 Our task visible: ${hasOurTask}`);
    
    console.log('📝 Step 5: Performance analysis');
    
    const totalMessages = allConsoleMessages.length;
    const debugMessages = allConsoleMessages.filter(msg => 
      msg.includes('🔍') || 
      msg.includes('DEBUG') ||
      msg.includes('USE_TASK_DATA_DEBUG') ||
      msg.includes('TASK_MANAGEMENT_DEBUG')
    ).length;
    
    console.log(`📊 Console messages during creation: ${totalMessages}`);
    console.log(`🔍 Debug messages: ${debugMessages}`);
    console.log(`🚨 Error messages: ${errorMessages.length}`);
    
    // Performance scoring
    let performanceScore = 0;
    
    if (totalMessages < 50) {
      performanceScore += 40;
      console.log('✅ Excellent: Console messages < 50');
    } else if (totalMessages < 100) {
      performanceScore += 30;
      console.log('✅ Good: Console messages < 100');
    } else if (totalMessages < 200) {
      performanceScore += 20;
      console.log('⚠️  Fair: Console messages < 200');
    } else {
      performanceScore += 10;
      console.log('❌ Poor: Too many console messages');
    }
    
    if (debugMessages < 5) {
      performanceScore += 30;
      console.log('✅ Excellent: Debug messages < 5');
    } else if (debugMessages < 10) {
      performanceScore += 20;
      console.log('✅ Good: Debug messages < 10');
    } else {
      performanceScore += 10;
      console.log('⚠️  Fair: Too many debug messages');
    }
    
    if (errorMessages.length === 0) {
      performanceScore += 20;
      console.log('✅ Perfect: No errors');
    }
    
    if (taskCreated && hasOurTask) {
      performanceScore += 10;
      console.log('✅ Perfect: Task creation works');
    }
    
    console.log('📝 Step 6: Test user experience');
    
    // Test refresh and check again
    await page.reload();
    await page.waitForTimeout(3000);
    
    await page.locator('button:has-text("Của tôi")').click();
    await page.waitForTimeout(2000);
    
    const ourTaskAfterRefresh = await page.locator(`tr:has-text("${uniqueTaskTitle}")`).first();
    const hasOurTaskAfterRefresh = await ourTaskAfterRefresh.isVisible();
    console.log(`🎯 Task visible after refresh: ${hasOurTaskAfterRefresh}`);
    
    if (hasOurTaskAfterRefresh) {
      performanceScore += 10;
      console.log('✅ Perfect: Task persists after refresh');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'final-performance-test.png', fullPage: true });
    
    console.log('\n✅ Final performance test completed');
    
    // Final summary
    console.log('\n🏆 FINAL PERFORMANCE SCORE:');
    console.log(`📊 Score: ${performanceScore}/100`);
    console.log('\nBreakdown:');
    console.log(`  Console messages: ${totalMessages}`);
    console.log(`  Debug messages: ${debugMessages}`);
    console.log(`  Error messages: ${errorMessages.length}`);
    console.log(`  Task created: ${taskCreated}`);
    console.log(`  Task visible: ${hasOurTask}`);
    console.log(`  Task persists: ${hasOurTaskAfterRefresh}`);
    
    if (performanceScore >= 90) {
      console.log('\n🎉 EXCELLENT PERFORMANCE! Ready for production.');
    } else if (performanceScore >= 70) {
      console.log('\n✅ GOOD PERFORMANCE! Minor optimizations possible.');
    } else if (performanceScore >= 50) {
      console.log('\n⚠️  FAIR PERFORMANCE! More optimization needed.');
    } else {
      console.log('\n❌ POOR PERFORMANCE! Significant optimization required.');
    }
    
    // Show remaining issues if any
    if (debugMessages > 0) {
      console.log('\n🔍 Remaining debug messages:');
      allConsoleMessages.filter(msg => 
        msg.includes('🔍') || msg.includes('DEBUG')
      ).slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 100)}...`);
      });
    }
    
    if (errorMessages.length > 0) {
      console.log('\n🚨 Error messages:');
      errorMessages.slice(0, 3).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.substring(0, 100)}...`);
      });
    }
  });
});
