import { test, expect } from '@playwright/test';

test.describe('Session Persistence Bug Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8088');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('Bug 1: Refresh page reverts to Khổng Đức Mạnh instead of logged in user', async ({ page }) => {
    console.log('🔍 Testing session persistence bug...');
    
    // Navigate to login page
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');

    // Login as Phạm Thị Hương
    console.log('📝 Logging in as Phạm Thị Hương...');
    await page.fill('input[type="email"]', 'huong.pham@example.com');
    await page.fill('input[type="password"]', 'haininh1');
    await page.click('button[type="submit"]');

    // Wait for login success
    await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });
    
    // Check logged in user
    const loggedInUser = await page.textContent('[data-testid="user-name"], .user-name, h1, h2');
    console.log('✅ Logged in user:', loggedInUser);
    
    // Verify it's Phạm Thị Hương
    expect(loggedInUser).toContain('Phạm Thị Hương');

    // Check localStorage after login
    const userAfterLogin = await page.evaluate(() => {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    });
    console.log('💾 User in localStorage after login:', userAfterLogin?.name);
    expect(userAfterLogin?.name).toBe('Phạm Thị Hương');

    // Refresh the page
    console.log('🔄 Refreshing page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });

    // Check user after refresh
    const userAfterRefresh = await page.textContent('[data-testid="user-name"], .user-name, h1, h2');
    console.log('🔍 User after refresh:', userAfterRefresh);

    // Check localStorage after refresh
    const userInStorageAfterRefresh = await page.evaluate(() => {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    });
    console.log('💾 User in localStorage after refresh:', userInStorageAfterRefresh?.name);

    // BUG: This should still be Phạm Thị Hương, not Khổng Đức Mạnh
    if (userAfterRefresh?.includes('Khổng Đức Mạnh')) {
      console.log('❌ BUG CONFIRMED: User reverted to Khổng Đức Mạnh after refresh!');
      console.log('Expected: Phạm Thị Hương');
      console.log('Actual:', userAfterRefresh);
    }

    // This test will fail to document the bug
    expect(userAfterRefresh).toContain('Phạm Thị Hương');
  });

  test('Bug 2: Phạm Thị Hương cannot see her own tasks', async ({ page }) => {
    console.log('🔍 Testing Phạm Thị Hương task visibility...');
    
    // Clear localStorage and force API mode
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.removeItem('firebaseConfig');
      localStorage.removeItem('firebase_initialized');
    });
    await page.reload();

    // Login as Phạm Thị Hương
    console.log('📝 Logging in as Phạm Thị Hương...');
    await page.fill('input[type="email"]', 'huong.pham@example.com');
    await page.fill('input[type="password"]', 'haininh1');
    await page.click('button[type="submit"]');

    // Wait for login success
    await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });
    
    // Navigate to Tasks page
    console.log('📋 Navigating to Tasks page...');
    await page.click('a[href*="tasks"], button:has-text("Công việc"), nav a:has-text("Tasks")');
    await page.waitForLoadState('networkidle');

    // Wait for tasks to load
    await page.waitForTimeout(3000);

    // Check for task elements
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card').count();
    console.log('📊 Number of task elements found:', taskElements);

    // Check for specific tasks that Phạm Thị Hương should see
    const expectedTasks = [
      'Khảo sát khách hàng mới - Team 5',
      'Báo cáo doanh số tuần - Team 5'
    ];

    let visibleTasks = [];
    for (const taskTitle of expectedTasks) {
      const taskVisible = await page.locator(`text="${taskTitle}"`).count() > 0;
      if (taskVisible) {
        visibleTasks.push(taskTitle);
        console.log('✅ Found task:', taskTitle);
      } else {
        console.log('❌ Missing task:', taskTitle);
      }
    }

    // Check for tasks she should NOT see
    const forbiddenTasks = [
      'Công việc của team 1 - Không được xem bởi team 5'
    ];

    let forbiddenVisible = [];
    for (const taskTitle of forbiddenTasks) {
      const taskVisible = await page.locator(`text="${taskTitle}"`).count() > 0;
      if (taskVisible) {
        forbiddenVisible.push(taskTitle);
        console.log('❌ BUG: Should not see task:', taskTitle);
      }
    }

    // Get all visible task text for debugging
    const allTaskText = await page.evaluate(() => {
      const taskElements = document.querySelectorAll('[data-testid="task-item"], .task-item, .task-card, .task-title');
      return Array.from(taskElements).map(el => el.textContent?.trim()).filter(Boolean);
    });
    console.log('📋 All visible tasks:', allTaskText);

    // Verify Phạm Thị Hương can see her tasks
    expect(visibleTasks.length).toBeGreaterThan(0);
    expect(forbiddenVisible.length).toBe(0);
  });

  test('Debug: Check API data and user permissions', async ({ page }) => {
    console.log('🔍 Debugging API data and permissions...');

    // Check API endpoints
    const apiChecks = [
      'http://localhost:3003/users',
      'http://localhost:3003/teams', 
      'http://localhost:3003/tasks'
    ];

    for (const url of apiChecks) {
      const response = await page.request.get(url);
      const data = await response.json();
      console.log(`📊 ${url}:`, data.data?.length || 0, 'items');
      
      if (url.includes('users')) {
        const huongUser = data.data?.find(u => u.name.includes('Phạm Thị Hương'));
        console.log('👤 Phạm Thị Hương in API:', huongUser ? 'Found' : 'Missing');
        if (huongUser) {
          console.log('   - ID:', huongUser.id);
          console.log('   - Role:', huongUser.role);
          console.log('   - Team ID:', huongUser.team_id);
        }
      }
      
      if (url.includes('teams')) {
        const team5 = data.data?.find(t => t.id === '5');
        console.log('🏢 Team 5 in API:', team5 ? 'Found' : 'Missing');
        if (team5) {
          console.log('   - Leader ID:', team5.leader_id);
          console.log('   - Name:', team5.name);
        }
      }
      
      if (url.includes('tasks')) {
        const team5Tasks = data.data?.filter(t => t.teamId === '5') || [];
        const otherTasks = data.data?.filter(t => t.teamId !== '5') || [];
        console.log('📋 Team 5 tasks:', team5Tasks.length);
        console.log('📋 Other team tasks:', otherTasks.length);
        
        team5Tasks.forEach(task => {
          console.log('   ✅ Team 5 task:', task.title);
        });
        
        otherTasks.forEach(task => {
          console.log('   ❌ Other task:', task.title, '(Team:', task.teamId + ')');
        });
      }
    }

    // Test login API directly
    const loginResponse = await page.request.post('http://localhost:3003/auth/login', {
      data: {
        email: 'huong.pham@example.com',
        password: 'haininh1'
      }
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 API Login test:', loginData.success ? 'Success' : 'Failed');
    if (loginData.success) {
      console.log('   - User:', loginData.data.user.name);
      console.log('   - Login Type:', loginData.data.loginType);
    }
  });
});
