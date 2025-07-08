import { test, expect } from '@playwright/test';

test.describe('Debug Task Display Issues', () => {
  test('Debug why no tasks are showing in TaskManagementView', async ({ page }) => {
    console.log('🔍 Starting comprehensive task display debug...');
    
    // Monitor all console logs
    const consoleLogs: string[] = [];
    const networkRequests: any[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        errors.push(`Network error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Setup user data and navigate to tasks...');
    
    // Inject user data directly
    await page.evaluate(() => {
      const khongDucManhUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '0',
        location: 'all',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Trưởng phòng kinh doanh',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(khongDucManhUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create some test tasks
      const testTasks = [
        {
          id: 'debug_task_1',
          title: 'Debug Task 1 - Test Display',
          description: 'Test task to debug display issues',
          user_id: 'user_manh',
          user_name: 'Khổng Đức Mạnh',
          assignedTo: 'user_manh',
          created_by: 'user_manh',
          status: 'todo',
          priority: 'high',
          type: 'other',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'personal'
        },
        {
          id: 'debug_task_2',
          title: 'Debug Task 2 - Team Task',
          description: 'Test team task',
          user_id: 'user_viet_anh',
          user_name: 'Lương Việt Anh',
          assignedTo: 'user_viet_anh',
          created_by: 'user_viet_anh',
          status: 'in-progress',
          priority: 'normal',
          type: 'client_new',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'team'
        },
        {
          id: 'debug_task_3',
          title: 'Debug Task 3 - Department Task',
          description: 'Test department-wide task',
          user_id: 'user_manh',
          user_name: 'Khổng Đức Mạnh',
          assignedTo: 'all',
          created_by: 'user_manh',
          status: 'completed',
          priority: 'low',
          type: 'other',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'department',
          isShared: true,
          department_wide: true
        }
      ];
      
      localStorage.setItem('tasks', JSON.stringify(testTasks));
      console.log('✅ Injected test user and tasks data');
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Check current user and data loading...');
    
    // Check user data and localStorage
    const debugInfo = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      return {
        currentUser,
        tasksInStorage: tasks.length,
        isAuthenticated,
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          user_id: t.user_id,
          user_name: t.user_name,
          status: t.status,
          visibility: t.visibility
        }))
      };
    });
    
    console.log('Current user:', debugInfo.currentUser);
    console.log('Tasks in localStorage:', debugInfo.tasksInStorage);
    console.log('Is authenticated:', debugInfo.isAuthenticated);
    console.log('Task details:', debugInfo.tasks);
    
    console.log('📝 Step 3: Check TaskManagementView component state...');
    
    // Wait for component to load and check for task elements
    await page.waitForTimeout(3000);
    
    // Look for task elements
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
    console.log(`Found ${taskElements.length} task elements in DOM`);
    
    // Check for empty state messages
    const emptyStateElements = await page.locator(':has-text("Chưa có công việc"), :has-text("No tasks"), :has-text("Không có")').all();
    console.log(`Found ${emptyStateElements.length} empty state messages`);
    
    if (emptyStateElements.length > 0) {
      for (let i = 0; i < emptyStateElements.length; i++) {
        const text = await emptyStateElements[i].textContent();
        console.log(`Empty state ${i + 1}: "${text}"`);
      }
    }
    
    console.log('📝 Step 4: Test each tab...');
    
    // Test each tab
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Testing tab: ${tabName}`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isTabVisible = await tab.isVisible();
      
      if (!isTabVisible) {
        console.log(`❌ Tab "${tabName}" not visible`);
        continue;
      }
      
      await tab.click();
      await page.waitForTimeout(2000);
      
      // Check for tasks in this tab
      const tabTasks = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
      console.log(`Tasks in "${tabName}" tab: ${tabTasks.length}`);
      
      // Check for loading states
      const loadingElement = await page.locator('[data-testid="loading"], .loading, .spinner').first();
      const isLoading = await loadingElement.isVisible().catch(() => false);
      console.log(`Loading state: ${isLoading}`);
      
      // Check for empty states
      const emptyState = await page.locator(':has-text("Chưa có công việc"), :has-text("No tasks")').first();
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      console.log(`Empty state: ${hasEmptyState}`);
    }
    
    console.log('📝 Step 5: Check filter state...');
    
    // Check filter state
    const filterState = await page.evaluate(() => {
      // Try to access component state through window object or DOM
      const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
      return {
        searchValue: searchInput?.value || 'not found',
        hasFilterButton: !!document.querySelector('button:has-text("Bộ lọc")'),
        hasActiveFilters: !!document.querySelector('.bg-blue-100')
      };
    });
    
    console.log('Filter state:', filterState);
    
    console.log('📝 Step 6: Analyze console logs...');
    
    // Filter and analyze console logs
    const taskManagementLogs = consoleLogs.filter(log => 
      log.includes('TaskManagementView') ||
      log.includes('🔍') ||
      log.includes('👤') ||
      log.includes('👥') ||
      log.includes('🏢') ||
      log.includes('getTasksForView') ||
      log.includes('filterTasks') ||
      log.includes('Final') ||
      log.includes('tasks')
    );
    
    console.log('\n📋 TaskManagementView Debug Logs:');
    if (taskManagementLogs.length > 0) {
      taskManagementLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('❌ No TaskManagementView debug logs found');
    }
    
    console.log('\n🚨 Errors found:');
    if (errors.length > 0) {
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors found');
    }
    
    console.log('\n🌐 Network Requests:');
    const relevantRequests = networkRequests.filter(req => 
      req.url.includes('tasks') || 
      req.url.includes('api') ||
      req.url.includes('supabase')
    );
    
    if (relevantRequests.length > 0) {
      relevantRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.method} ${req.url}`);
      });
    } else {
      console.log('No task-related network requests found');
    }
    
    console.log('\n📋 Recent Console Logs (last 20):');
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'debug-task-display.png', fullPage: true });
    
    console.log('\n✅ Debug analysis completed. Check logs above for issues.');
  });

  test('Test data sources and hooks', async ({ page }) => {
    console.log('🔍 Testing data sources and hooks...');
    
    await page.goto('http://localhost:8088');
    await page.evaluate(() => {
      const khongDucManhUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        role: 'retail_director'
      };
      localStorage.setItem('currentUser', JSON.stringify(khongDucManhUser));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Check for hook-related logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    await page.waitForTimeout(5000);
    
    const hookLogs = consoleLogs.filter(log => 
      log.includes('useTaskData') ||
      log.includes('useManagerTaskData') ||
      log.includes('hook') ||
      log.includes('data source') ||
      log.includes('regularTasks') ||
      log.includes('managerTasks')
    );
    
    console.log('\n📋 Hook and Data Source Logs:');
    hookLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
  });
});
