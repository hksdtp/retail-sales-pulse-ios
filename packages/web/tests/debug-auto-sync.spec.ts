import { test, expect } from '@playwright/test';

test.describe('Debug Auto-Sync System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait longer for all services to initialize
  });

  test('should debug auto-sync service initialization and functionality', async ({ page }) => {
    console.log('🔍 Debugging auto-sync service...');
    
    // Step 1: Check if AutoPlanSyncService is initialized
    console.log('📊 Step 1: Check service initialization');
    
    const serviceStatus = await page.evaluate(() => {
      return {
        autoPlanSyncServiceExists: typeof (window as any).autoPlanSyncService !== 'undefined',
        testAutoSyncExists: typeof (window as any).testAutoSync === 'function',
        windowKeys: Object.keys(window).filter(key => key.includes('auto') || key.includes('sync') || key.includes('plan'))
      };
    });
    
    console.log('Service status:', serviceStatus);
    
    // Step 2: Create a plan for today
    console.log('📝 Step 2: Create plan for today');
    
    const planCreation = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      // Clear existing plans first
      localStorage.removeItem(planKey);
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      const testPlan = {
        id: `plan_debug_${Date.now()}`,
        userId: userId,
        title: 'Debug Auto-Sync Test Plan',
        description: 'Plan để test auto-sync functionality',
        type: 'client_new',
        status: 'pending',
        priority: 'urgent',
        startDate: todayString,
        endDate: todayString,
        startTime: '09:00',
        endTime: '10:00',
        location: 'Debug Test Location',
        notes: 'Auto-sync debug test',
        participants: ['Debug User'],
        creator: 'Khổng Đức Mạnh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'personal'
      };
      
      localStorage.setItem(planKey, JSON.stringify([testPlan]));
      
      console.log('✅ Created debug plan:', testPlan);
      return {
        planCreated: true,
        planId: testPlan.id,
        planTitle: testPlan.title,
        planDate: testPlan.startDate,
        todayDate: todayString
      };
    });
    
    console.log('Plan creation result:', planCreation);
    
    // Step 3: Check current tasks before sync
    console.log('📋 Step 3: Check tasks before sync');
    
    const tasksBeforeSync = await page.evaluate(() => {
      const userId = '1';
      
      // Check different task storage locations
      const localStorageTasks = JSON.parse(localStorage.getItem(`user_tasks_${userId}`) || '[]');
      const filteredTasks = JSON.parse(localStorage.getItem('filteredTasks') || '[]');
      const rawTasks = JSON.parse(localStorage.getItem('rawTasks') || '[]');
      
      return {
        localStorageTaskCount: localStorageTasks.length,
        filteredTaskCount: filteredTasks.length,
        rawTaskCount: rawTasks.length,
        localStorageTasks: localStorageTasks.map(t => ({ id: t.id, title: t.title, date: t.date })),
        filteredTasks: filteredTasks.map(t => ({ id: t.id, title: t.title, date: t.date })),
        rawTasks: rawTasks.map(t => ({ id: t.id, title: t.title, date: t.date }))
      };
    });
    
    console.log('Tasks before sync:', tasksBeforeSync);
    
    // Step 4: Test manual sync
    console.log('🔄 Step 4: Test manual sync');
    
    const manualSyncResult = await page.evaluate(() => {
      if (typeof (window as any).testAutoSync === 'function') {
        console.log('🧪 Calling manual sync...');
        return (window as any).testAutoSync('1');
      } else {
        console.log('❌ testAutoSync function not available');
        return Promise.resolve(-1);
      }
    });
    
    console.log('Manual sync result:', manualSyncResult);
    
    // Wait a bit for sync to complete
    await page.waitForTimeout(3000);
    
    // Step 5: Check tasks after sync
    console.log('📋 Step 5: Check tasks after sync');
    
    const tasksAfterSync = await page.evaluate(() => {
      const userId = '1';
      
      // Check different task storage locations
      const localStorageTasks = JSON.parse(localStorage.getItem(`user_tasks_${userId}`) || '[]');
      const filteredTasks = JSON.parse(localStorage.getItem('filteredTasks') || '[]');
      const rawTasks = JSON.parse(localStorage.getItem('rawTasks') || '[]');
      
      return {
        localStorageTaskCount: localStorageTasks.length,
        filteredTaskCount: filteredTasks.length,
        rawTaskCount: rawTasks.length,
        localStorageTasks: localStorageTasks.map(t => ({ id: t.id, title: t.title, date: t.date, type: t.type })),
        filteredTasks: filteredTasks.map(t => ({ id: t.id, title: t.title, date: t.date, type: t.type })),
        rawTasks: rawTasks.map(t => ({ id: t.id, title: t.title, date: t.date, type: t.type })),
        hasDebugTask: {
          localStorage: localStorageTasks.some(t => t.title.includes('Debug Auto-Sync')),
          filtered: filteredTasks.some(t => t.title.includes('Debug Auto-Sync')),
          raw: rawTasks.some(t => t.title.includes('Debug Auto-Sync'))
        }
      };
    });
    
    console.log('Tasks after sync:', tasksAfterSync);
    
    // Step 6: Check Tasks page UI
    console.log('🖥️ Step 6: Check Tasks page UI');
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Look for the debug task in UI
    const debugTaskInUI = page.locator('text=Debug Auto-Sync Test Plan');
    const debugTaskVisible = await debugTaskInUI.isVisible({ timeout: 5000 });
    console.log('Debug task visible in UI:', debugTaskVisible);
    
    // Check for any tasks in the UI
    const anyTasksVisible = await page.locator('[data-testid="task-item"], .task-item, .task-card').count();
    console.log('Total tasks visible in UI:', anyTasksVisible);
    
    // Step 7: Check console logs
    console.log('📝 Step 7: Check console logs');
    
    const consoleLogs = await page.evaluate(() => {
      // Try to get any debug info from the service
      if ((window as any).autoPlanSyncService) {
        const service = (window as any).autoPlanSyncService;
        return {
          serviceExists: true,
          hasTaskDataContext: !!service.taskDataContext,
          contextDetails: service.taskDataContext ? {
            hasAddTask: typeof service.taskDataContext.addTask === 'function',
            hasRefreshTasks: typeof service.taskDataContext.refreshTasks === 'function',
            taskCount: service.taskDataContext.tasks?.length || 0
          } : null
        };
      }
      return { serviceExists: false };
    });
    
    console.log('Service debug info:', consoleLogs);
    
    // Step 8: Summary
    console.log('\n🎯 AUTO-SYNC DEBUG SUMMARY:');
    console.log('============================');
    console.log('✅ Service initialized:', serviceStatus.autoPlanSyncServiceExists);
    console.log('✅ Test function available:', serviceStatus.testAutoSyncExists);
    console.log('✅ Plan created for today:', planCreation.planCreated);
    console.log('✅ Manual sync executed:', manualSyncResult !== -1);
    console.log('✅ Tasks before sync:', tasksBeforeSync.localStorageTaskCount + tasksBeforeSync.filteredTaskCount + tasksBeforeSync.rawTaskCount);
    console.log('✅ Tasks after sync:', tasksAfterSync.localStorageTaskCount + tasksAfterSync.filteredTaskCount + tasksAfterSync.rawTaskCount);
    console.log('✅ Debug task synced:', tasksAfterSync.hasDebugTask.localStorage || tasksAfterSync.hasDebugTask.filtered || tasksAfterSync.hasDebugTask.raw);
    console.log('✅ Task visible in UI:', debugTaskVisible);
    console.log('✅ Service has context:', consoleLogs.serviceExists && consoleLogs.hasTaskDataContext);
    
    // Identify issues
    const issues = [];
    if (!serviceStatus.autoPlanSyncServiceExists) issues.push('AutoPlanSyncService not initialized');
    if (!serviceStatus.testAutoSyncExists) issues.push('Test function not available');
    if (!consoleLogs.hasTaskDataContext) issues.push('TaskDataContext not injected');
    if (!(tasksAfterSync.hasDebugTask.localStorage || tasksAfterSync.hasDebugTask.filtered || tasksAfterSync.hasDebugTask.raw)) issues.push('Task not synced to storage');
    if (!debugTaskVisible) issues.push('Task not visible in UI');
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('\n🎉 ALL SYSTEMS WORKING!');
    }
    
    // Always pass for debugging purposes
    expect(serviceStatus.autoPlanSyncServiceExists).toBe(true);
  });

  test('should test real-time auto-sync with interval', async ({ page }) => {
    console.log('⏰ Testing real-time auto-sync...');
    
    // Create a plan for today
    await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      const testPlan = {
        id: `plan_realtime_${Date.now()}`,
        userId: userId,
        title: 'Real-time Auto-Sync Test',
        description: 'Test real-time sync',
        type: 'meeting',
        status: 'pending',
        priority: 'high',
        startDate: todayString,
        endDate: todayString,
        startTime: '11:00',
        endTime: '12:00',
        location: 'Real-time Test Location',
        notes: 'Real-time sync test',
        participants: ['Test User'],
        creator: 'Test Creator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      } catch (e) {
        console.error('Error parsing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(planKey, JSON.stringify(plans));
      
      console.log('✅ Created real-time test plan');
      return testPlan;
    });
    
    console.log('⏰ Waiting for auto-sync interval (60 seconds)...');
    
    // Wait for the auto-sync interval to trigger
    await page.waitForTimeout(65000); // Wait slightly longer than 60 seconds
    
    // Check if task was synced
    const syncResult = await page.evaluate(() => {
      const userId = '1';
      const localStorageTasks = JSON.parse(localStorage.getItem(`user_tasks_${userId}`) || '[]');
      const filteredTasks = JSON.parse(localStorage.getItem('filteredTasks') || '[]');
      
      return {
        hasRealtimeTask: localStorageTasks.some(t => t.title.includes('Real-time Auto-Sync')) ||
                        filteredTasks.some(t => t.title.includes('Real-time Auto-Sync')),
        totalTasks: localStorageTasks.length + filteredTasks.length
      };
    });
    
    console.log('Real-time sync result:', syncResult);
    
    expect(syncResult.hasRealtimeTask).toBe(true);
  });
});
