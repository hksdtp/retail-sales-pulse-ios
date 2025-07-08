import { test, expect } from '@playwright/test';

test.describe('Debug Data Loading', () => {
  test('Debug Supabase data loading process', async ({ page }) => {
    console.log('🔍 Debugging Supabase data loading...');
    
    // Monitor all console messages
    const consoleLogs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      
      if (msg.type() === 'error') {
        errors.push(text);
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
    
    console.log('📝 Step 1: Navigate to tasks page');
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(8000); // Wait longer for all data loading
    
    console.log('📝 Step 2: Check console logs for data loading');
    
    // Filter relevant logs
    const dataLoadingLogs = consoleLogs.filter(log => 
      log.includes('SupabaseTaskDataProvider') ||
      log.includes('Loading tasks') ||
      log.includes('Loaded') ||
      log.includes('tasks from Supabase') ||
      log.includes('USE_TASK_DATA_DEBUG') ||
      log.includes('TASK_MANAGEMENT_DEBUG') ||
      log.includes('Data sources') ||
      log.includes('regularTaskData') ||
      log.includes('managerTaskData') ||
      log.includes('context.tasks') ||
      log.includes('Supabase')
    );
    
    console.log('\n📋 Data loading logs:');
    dataLoadingLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log('\n🚨 Errors:');
    if (errors.length > 0) {
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors found');
    }
    
    console.log('📝 Step 3: Check data in browser context');
    
    const browserData = await page.evaluate(async () => {
      // Check if SupabaseTaskDataContext is available
      const contextCheck = {
        hasSupabaseContext: false,
        contextData: null,
        supabaseServiceStatus: null,
        directSupabaseTest: null
      };
      
      try {
        // Try to access Supabase service directly
        if (window.SupabaseService) {
          const service = window.SupabaseService.getInstance();
          contextCheck.supabaseServiceStatus = {
            isInitialized: service.isInitialized(),
            hasClient: !!service.client
          };
          
          // Try direct API call
          try {
            const tasks = await service.getTasks();
            contextCheck.directSupabaseTest = {
              success: true,
              taskCount: tasks.length,
              sampleTasks: tasks.slice(0, 2).map(t => ({
                id: t.id,
                title: t.title,
                user_id: t.user_id,
                user_name: t.user_name
              }))
            };
          } catch (apiError) {
            contextCheck.directSupabaseTest = {
              success: false,
              error: apiError.message
            };
          }
        }
      } catch (error) {
        contextCheck.supabaseServiceStatus = { error: error.message };
      }
      
      return contextCheck;
    });
    
    console.log('\n📊 Browser context data:');
    console.log(JSON.stringify(browserData, null, 2));
    
    console.log('📝 Step 4: Check task elements in DOM');
    
    // Check for any task-related elements
    const taskSelectors = [
      '[data-testid="task-item"]',
      '.task-item',
      '.task-card',
      'tr:has(td)',
      '[class*="task"]',
      ':has-text("Complete Task")',
      ':has-text("Lê Khánh Duy")'
    ];
    
    for (const selector of taskSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`🔍 Selector "${selector}": ${elements.length} elements`);
        
        if (elements.length > 0 && elements.length < 10) {
          for (let i = 0; i < elements.length; i++) {
            const text = await elements[i].textContent().catch(() => '');
            console.log(`  ${i + 1}. "${text?.substring(0, 100)}..."`);
          }
        }
      } catch (error) {
        console.log(`❌ Selector "${selector}" failed: ${error}`);
      }
    }
    
    console.log('📝 Step 5: Check empty state messages');
    
    const emptyStateSelectors = [
      ':has-text("Chưa có công việc")',
      ':has-text("No tasks")',
      '.empty-state',
      '[class*="empty"]'
    ];
    
    for (const selector of emptyStateSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`📝 Empty state "${selector}": ${elements.length} elements`);
        
        if (elements.length > 0) {
          for (let i = 0; i < Math.min(elements.length, 3); i++) {
            const text = await elements[i].textContent().catch(() => '');
            console.log(`  ${i + 1}. "${text}"`);
          }
        }
      } catch (error) {
        console.log(`❌ Empty state selector "${selector}" failed: ${error}`);
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'debug-data-loading.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
  });
});
