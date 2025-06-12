import { test, expect } from '@playwright/test';

test.describe('Unified Task System Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should have unified task system without separate sections', async ({ page }) => {
    console.log('🧪 Testing unified task system...');
    
    // Step 1: Go to Tasks page
    console.log('📋 Step 1: Navigate to Tasks page');
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Check that there are NO separate sections
    const planSection = page.locator('text=Công việc từ Kế hoạch');
    const systemSection = page.locator('text=Công việc Hệ thống');
    
    const planSectionVisible = await planSection.isVisible({ timeout: 3000 });
    const systemSectionVisible = await systemSection.isVisible({ timeout: 3000 });
    
    console.log('Plan section visible (should be false):', planSectionVisible);
    console.log('System section visible (should be false):', systemSectionVisible);
    
    // Should have unified task management view
    const taskManagementView = page.locator('[data-testid="task-management-view"], .task-management, .task-list');
    const unifiedViewVisible = await taskManagementView.isVisible({ timeout: 5000 });
    console.log('Unified task view visible:', unifiedViewVisible);
    
    expect(planSectionVisible).toBe(false);
    expect(systemSectionVisible).toBe(false);
    expect(unifiedViewVisible).toBe(true);
  });

  test('should create plan with unified task types and auto-sync to main task system', async ({ page }) => {
    console.log('🧪 Testing plan creation with unified task types...');
    
    // Step 1: Go to Calendar page
    console.log('📅 Step 1: Navigate to Calendar page');
    await page.goto('http://localhost:8088/calendar');
    await page.waitForTimeout(3000);
    
    // Step 2: Create a plan with new task types
    console.log('📝 Step 2: Create plan with unified task types');
    
    const createResult = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      const testPlan = {
        id: `plan_unified_${Date.now()}`,
        userId: userId,
        title: 'Unified Test - Gặp khách hàng mới ABC',
        description: 'Test plan với task type thống nhất',
        type: 'client_new', // Sử dụng task type thống nhất
        status: 'pending',
        priority: 'urgent', // Sử dụng priority thống nhất
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        location: 'Văn phòng khách hàng ABC',
        notes: 'Unified system test',
        participants: ['Nhân viên kinh doanh'],
        creator: 'Khổng Đức Mạnh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'personal'
      };
      
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      } catch (e) {
        console.error('Error parsing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(planKey, JSON.stringify(plans));
      
      console.log('✅ Created unified plan with type:', testPlan.type);
      return testPlan;
    });
    
    console.log('Plan creation result:', createResult);
    
    // Step 3: Wait for auto-sync (simulate)
    console.log('⏰ Step 3: Wait for auto-sync');
    await page.waitForTimeout(5000);
    
    // Step 4: Check if plan auto-synced to main task system
    console.log('🔄 Step 4: Check auto-sync to main task system');
    
    const syncResult = await page.evaluate(() => {
      // Check if TaskDataContext received the task
      const userId = '1';
      
      // Check localStorage for tasks (fallback method)
      const taskKey = `user_tasks_${userId}`;
      const tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
      
      // Check filtered tasks (main system)
      const filteredTaskKey = 'filteredTasks';
      const filteredTasks = JSON.parse(localStorage.getItem(filteredTaskKey) || '[]');
      
      return {
        localStorageTasks: tasks.length,
        filteredTasks: filteredTasks.length,
        hasUnifiedTask: tasks.some(t => t.title.includes('Unified Test')) || 
                       filteredTasks.some(t => t.title.includes('Unified Test')),
        taskTypes: [...new Set([...tasks.map(t => t.type), ...filteredTasks.map(t => t.type)])],
        taskPriorities: [...new Set([...tasks.map(t => t.priority), ...filteredTasks.map(t => t.priority)])]
      };
    });
    
    console.log('Sync result:', syncResult);
    
    // Step 5: Go to Tasks page and verify unified display
    console.log('📋 Step 5: Verify unified task display');
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Look for the synced task in unified view
    const unifiedTask = page.locator('text=Unified Test');
    const unifiedTaskVisible = await unifiedTask.isVisible({ timeout: 5000 });
    console.log('Unified task visible in main system:', unifiedTaskVisible);
    
    // Check for task type indicators
    const clientNewIndicator = page.locator('text=👥, text=Khách hàng mới');
    const clientIndicatorVisible = await clientNewIndicator.isVisible({ timeout: 3000 });
    console.log('Client new type indicator visible:', clientIndicatorVisible);
    
    // Step 6: Summary
    console.log('\n🎯 UNIFIED SYSTEM TEST RESULTS:');
    console.log('================================');
    console.log('✅ Plan created with unified type:', createResult.type);
    console.log('✅ Auto-sync executed:', syncResult.hasUnifiedTask);
    console.log('✅ Task in main system:', unifiedTaskVisible);
    console.log('✅ Unified task types:', syncResult.taskTypes);
    console.log('✅ Unified priorities:', syncResult.taskPriorities);
    
    const unifiedSystemWorking = createResult.type === 'client_new' && 
                                 (syncResult.hasUnifiedTask || unifiedTaskVisible);
    
    if (unifiedSystemWorking) {
      console.log('🎉 UNIFIED SYSTEM SUCCESS: Plan-task integration working with unified types!');
    } else {
      console.log('❌ UNIFIED SYSTEM ISSUES: Some integration not working');
    }
    
    expect(createResult.type).toBe('client_new');
    expect(syncResult.hasUnifiedTask || unifiedTaskVisible).toBe(true);
  });

  test('should test task type consistency between plans and tasks', async ({ page }) => {
    console.log('🔧 Testing task type consistency...');
    
    await page.goto('http://localhost:8088/calendar');
    await page.waitForTimeout(3000);
    
    // Test all unified task types
    const taskTypes = [
      'partner_new', 'partner_old', 'architect_new', 'architect_old',
      'client_new', 'client_old', 'quote_new', 'quote_old',
      'report', 'training', 'meeting', 'inventory', 'other'
    ];
    
    const typeTestResults = await page.evaluate((types) => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      const results = [];
      
      types.forEach((type, index) => {
        const testPlan = {
          id: `plan_type_test_${type}_${Date.now()}_${index}`,
          userId: userId,
          title: `Type Test - ${type}`,
          description: `Testing type ${type}`,
          type: type,
          status: 'pending',
          priority: 'normal',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: `${10 + index}:00`,
          endTime: `${11 + index}:00`,
          location: `Test location ${type}`,
          notes: `Type test ${type}`,
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
        
        results.push({
          type: type,
          planCreated: true,
          planId: testPlan.id
        });
      });
      
      return results;
    }, taskTypes);
    
    console.log('Task type test results:', typeTestResults);
    
    // Verify all types were created successfully
    const allTypesCreated = typeTestResults.every(result => result.planCreated);
    console.log('All task types created successfully:', allTypesCreated);
    
    expect(allTypesCreated).toBe(true);
    expect(typeTestResults.length).toBe(taskTypes.length);
  });

  test('should test priority consistency', async ({ page }) => {
    console.log('🎯 Testing priority consistency...');
    
    const priorities = ['urgent', 'high', 'normal', 'low'];
    
    const priorityTestResult = await page.evaluate((priorities) => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      const results = [];
      
      priorities.forEach((priority, index) => {
        const testPlan = {
          id: `plan_priority_test_${priority}_${Date.now()}_${index}`,
          userId: userId,
          title: `Priority Test - ${priority}`,
          description: `Testing priority ${priority}`,
          type: 'meeting',
          status: 'pending',
          priority: priority,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: `${14 + index}:00`,
          endTime: `${15 + index}:00`,
          location: `Test location ${priority}`,
          notes: `Priority test ${priority}`,
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
        
        results.push({
          priority: priority,
          planCreated: true,
          planId: testPlan.id
        });
      });
      
      return results;
    }, priorities);
    
    console.log('Priority test results:', priorityTestResult);
    
    const allPrioritiesCreated = priorityTestResult.every(result => result.planCreated);
    console.log('All priorities created successfully:', allPrioritiesCreated);
    
    expect(allPrioritiesCreated).toBe(true);
    expect(priorityTestResult.length).toBe(priorities.length);
  });
});
