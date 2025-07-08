import { test, expect } from '@playwright/test';

test.describe('Simple Task Display Test', () => {
  test('Test localStorage tasks loading and display', async ({ page }) => {
    console.log('🔍 Testing localStorage tasks loading...');
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    
    // Setup user and tasks in localStorage
    await page.evaluate(() => {
      // Clear existing data
      localStorage.clear();
      
      // Set up user
      const user = {
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
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create test tasks
      const tasks = [
        {
          id: 'task_1',
          title: 'Test Task 1 - Personal',
          description: 'Personal task for testing',
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
          id: 'task_2',
          title: 'Test Task 2 - Department',
          description: 'Department task for testing',
          user_id: 'user_manh',
          user_name: 'Khổng Đức Mạnh',
          assignedTo: 'all',
          created_by: 'user_manh',
          status: 'in-progress',
          priority: 'normal',
          type: 'client_new',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility: 'department',
          isShared: true,
          department_wide: true
        }
      ];
      
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      console.log('✅ Setup complete:', {
        user: user.name,
        tasksCount: tasks.length,
        tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status }))
      });
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Check if tasks are displayed
    console.log('📝 Checking for task elements...');
    
    // Look for task elements with various selectors
    const taskSelectors = [
      '[data-testid="task-item"]',
      '.task-item',
      '.task-card',
      'tr:has(td)',
      '[class*="task"]',
      'tbody tr'
    ];
    
    let foundTasks = 0;
    for (const selector of taskSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        foundTasks += elements.length;
      }
    }
    
    console.log(`📊 Total task elements found: ${foundTasks}`);
    
    // Check for empty state
    const emptyStateElements = await page.locator(':has-text("Chưa có công việc"), :has-text("No tasks")').all();
    console.log(`📝 Empty state elements: ${emptyStateElements.length}`);
    
    // Check localStorage data
    const storageData = await page.evaluate(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return {
        tasksInStorage: tasks.length,
        userRole: user.role,
        userName: user.name
      };
    });
    
    console.log('📦 Storage data:', storageData);
    
    // Check console logs for debug info
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('📦') || text.includes('📊') || text.includes('🌐') || text.includes('TaskManagementView')) {
        consoleLogs.push(text);
      }
    });
    
    // Wait a bit more for logs
    await page.waitForTimeout(3000);
    
    console.log('\n📋 Relevant console logs:');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'simple-task-display-test.png', fullPage: true });
    
    // Test tabs
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Testing tab: ${tabName}`);
      
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isVisible = await tab.isVisible();
      
      if (isVisible) {
        await tab.click();
        await page.waitForTimeout(2000);
        
        // Count tasks in this tab
        let tabTaskCount = 0;
        for (const selector of taskSelectors) {
          const elements = await page.locator(selector).all();
          tabTaskCount += elements.length;
        }
        
        console.log(`📊 Tasks in "${tabName}" tab: ${tabTaskCount}`);
      } else {
        console.log(`❌ Tab "${tabName}" not visible`);
      }
    }
    
    console.log('\n✅ Test completed');
  });
});
