import { test, expect } from '@playwright/test';

test.describe('Debug UI Tasks Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8089/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(8000);
  });

  test('should debug why tasks are not showing in UI', async ({ page }) => {
    console.log('🔍 Debugging UI tasks display...');
    
    // Step 1: Clear all data first
    console.log('🧹 Step 1: Clear all existing data');
    await page.evaluate(() => {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('plan') || key.includes('task')) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ Cleared all plans and tasks');
    });
    
    // Step 2: Create a plan for today
    console.log('📝 Step 2: Create plan for today');
    const planResult = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      const testPlan = {
        id: `plan_debug_ui_${Date.now()}`,
        userId: userId,
        title: 'Debug UI Test Plan',
        description: 'Plan để debug UI display',
        type: 'client_new',
        status: 'pending',
        priority: 'urgent',
        startDate: todayString,
        endDate: todayString,
        startTime: '09:00',
        endTime: '10:00',
        location: 'Debug Location',
        notes: 'Debug UI test',
        participants: ['Debug User'],
        creator: 'Khổng Đức Mạnh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(planKey, JSON.stringify([testPlan]));
      console.log('✅ Created debug plan:', testPlan.title);
      return testPlan;
    });
    
    // Step 3: Trigger auto-sync
    console.log('🔄 Step 3: Trigger auto-sync');
    const syncResult = await page.evaluate(() => {
      if (typeof (window as any).testAutoSync === 'function') {
        console.log('🧪 Triggering auto-sync...');
        return (window as any).testAutoSync('1');
      }
      return Promise.resolve(-1);
    });
    
    console.log('Auto-sync result:', syncResult);
    
    // Step 4: Wait and check storage
    await page.waitForTimeout(3000);
    
    const storageCheck = await page.evaluate(() => {
      const userId = '1';
      const userTasksKey = `user_tasks_${userId}`;
      const rawTasksKey = 'rawTasks';
      const filteredTasksKey = 'filteredTasks';
      
      const userTasks = JSON.parse(localStorage.getItem(userTasksKey) || '[]');
      const rawTasks = JSON.parse(localStorage.getItem(rawTasksKey) || '[]');
      const filteredTasks = JSON.parse(localStorage.getItem(filteredTasksKey) || '[]');
      
      return {
        userTasks: {
          count: userTasks.length,
          titles: userTasks.map(t => t.title)
        },
        rawTasks: {
          count: rawTasks.length,
          titles: rawTasks.map(t => t.title)
        },
        filteredTasks: {
          count: filteredTasks.length,
          titles: filteredTasks.map(t => t.title)
        }
      };
    });
    
    console.log('Storage check:', storageCheck);
    
    // Step 5: Check UI elements
    console.log('🖥️ Step 5: Check UI elements');
    
    // Check for task containers
    const taskContainers = await page.locator('[data-testid="task-item"], .task-item, .task-card, .task-list-item, .task-row, .task-container').count();
    console.log('Task containers found:', taskContainers);
    
    // Check for specific task
    const debugTaskVisible = await page.locator('text=Debug UI Test Plan').isVisible({ timeout: 5000 });
    console.log('Debug task visible:', debugTaskVisible);
    
    // Check for empty state messages
    const emptyMessages = await page.locator('text=Không có công việc, text=No tasks, text=Chưa có công việc').count();
    console.log('Empty state messages:', emptyMessages);
    
    // Step 6: Check component states
    console.log('🔍 Step 6: Check component states');
    
    const componentStates = await page.evaluate(() => {
      // Check if TaskDataProvider is working
      const taskDataContext = (window as any).taskDataContext;
      
      // Check if useTaskData hook is working
      const useTaskDataState = (window as any).useTaskDataState;
      
      // Check if TaskManagementView is working
      const taskManagementState = (window as any).taskManagementState;
      
      return {
        taskDataContext: taskDataContext ? 'available' : 'not available',
        useTaskDataState: useTaskDataState ? 'available' : 'not available',
        taskManagementState: taskManagementState ? 'available' : 'not available',
        windowKeys: Object.keys(window).filter(key => key.includes('task') || key.includes('Task'))
      };
    });
    
    console.log('Component states:', componentStates);
    
    // Step 7: Force refresh and check again
    console.log('🔄 Step 7: Force refresh');
    
    const refreshButton = page.locator('button[title="Làm mới dữ liệu"]');
    const refreshButtonVisible = await refreshButton.isVisible({ timeout: 3000 });
    console.log('Refresh button visible:', refreshButtonVisible);
    
    if (refreshButtonVisible) {
      await refreshButton.click();
      await page.waitForTimeout(3000);
      
      const tasksAfterRefresh = await page.locator('[data-testid="task-item"], .task-item, .task-card, .task-list-item, .task-row').count();
      console.log('Tasks after refresh:', tasksAfterRefresh);
      
      const debugTaskAfterRefresh = await page.locator('text=Debug UI Test Plan').isVisible({ timeout: 5000 });
      console.log('Debug task after refresh:', debugTaskAfterRefresh);
    }
    
    // Step 8: Check console errors
    console.log('❌ Step 8: Check for console errors');
    
    const consoleErrors = await page.evaluate(() => {
      // This is a placeholder - we'll check manually in browser console
      return {
        note: 'Check browser console for errors',
        hasErrors: 'Check manually'
      };
    });
    
    // Step 9: Check network requests
    console.log('🌐 Step 9: Check network activity');
    
    // Reload page to see network requests
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Step 10: Final diagnosis
    console.log('\n🎯 UI DEBUG DIAGNOSIS:');
    console.log('======================');
    console.log('✅ Plan created:', planResult.title);
    console.log('✅ Auto-sync executed:', syncResult !== -1);
    console.log('✅ User tasks count:', storageCheck.userTasks.count);
    console.log('✅ Raw tasks count:', storageCheck.rawTasks.count);
    console.log('✅ Filtered tasks count:', storageCheck.filteredTasks.count);
    console.log('✅ Task containers in UI:', taskContainers);
    console.log('✅ Debug task visible:', debugTaskVisible);
    console.log('✅ Empty state messages:', emptyMessages);
    console.log('✅ Refresh button available:', refreshButtonVisible);
    
    // Identify the issue
    if (storageCheck.userTasks.count > 0 && storageCheck.rawTasks.count === 0) {
      console.log('\n🔍 ISSUE IDENTIFIED:');
      console.log('- Auto-sync creates tasks in user_tasks_1 ✅');
      console.log('- Tasks are NOT merged into rawTasks ❌');
      console.log('- UI reads from rawTasks/filteredTasks ❌');
      console.log('- TaskDataProvider merge logic not working ❌');
    } else if (storageCheck.rawTasks.count > 0 && taskContainers === 0) {
      console.log('\n🔍 ISSUE IDENTIFIED:');
      console.log('- Tasks exist in storage ✅');
      console.log('- UI components not rendering tasks ❌');
      console.log('- Component state management issue ❌');
    } else if (storageCheck.userTasks.count === 0) {
      console.log('\n🔍 ISSUE IDENTIFIED:');
      console.log('- Auto-sync not creating tasks ❌');
      console.log('- Auto-sync service issue ❌');
    }
    
    // Test assertions
    expect(storageCheck.userTasks.count).toBeGreaterThan(0);
  });

  test('should test manual task creation in UI', async ({ page }) => {
    console.log('🛠️ Testing manual task creation...');
    
    // Try to create a task manually through UI
    const createButton = page.locator('button:has-text("Tạo công việc")');
    const createButtonVisible = await createButton.isVisible({ timeout: 5000 });
    console.log('Create task button visible:', createButtonVisible);
    
    if (createButtonVisible) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Check if form opens
      const formVisible = await page.locator('[data-testid="task-form"], .task-form, form').isVisible({ timeout: 5000 });
      console.log('Task form visible:', formVisible);
      
      if (formVisible) {
        // Fill form
        await page.fill('input[name="title"], input[placeholder*="tiêu đề"], input[placeholder*="title"]', 'Manual UI Test Task');
        await page.waitForTimeout(1000);
        
        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Tạo"), button:has-text("Lưu")');
        const submitButtonVisible = await submitButton.isVisible({ timeout: 3000 });
        console.log('Submit button visible:', submitButtonVisible);
        
        if (submitButtonVisible) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Check if task appears
          const manualTaskVisible = await page.locator('text=Manual UI Test Task').isVisible({ timeout: 5000 });
          console.log('Manual task visible after creation:', manualTaskVisible);
        }
      }
    }
    
    expect(createButtonVisible).toBe(true);
  });
});
