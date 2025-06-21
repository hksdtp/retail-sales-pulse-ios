# Test info

- Name: Session Persistence Bug Investigation >> Bug 2: Phạm Thị Hương cannot see her own tasks
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/session-persistence-bug.spec.ts:72:3

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

    at /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/session-persistence-bug.spec.ts:85:16
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- main:
  - heading "📅 Lịch Kế hoạch" [level=1]
  - paragraph: Quản lý và theo dõi kế hoạch công việc hàng ngày
  - button:
    - img
  - button "Debug Sync":
    - img
    - text: Debug Sync
  - button "Tạo kế hoạch":
    - img
    - text: Tạo kế hoạch
  - button:
    - img
  - heading "Tháng 6 2025" [level=2]
  - button:
    - img
  - button "Hôm nay"
  - text: T2 T3 T4 T5 T6 T7 CN
  - button "25"
  - button "26"
  - button "27"
  - button "28"
  - button "29"
  - button "30"
  - button "1"
  - button "2"
  - button "3"
  - button "4"
  - button "5"
  - button "6"
  - button "7"
  - button "8"
  - button "9"
  - button "10"
  - button "11"
  - button "12"
  - button "13"
  - button "14"
  - button "15"
  - button "16"
  - button "17"
  - button "18"
  - button "19"
  - button "20"
  - button "21"
  - button "22"
  - button "23"
  - button "24"
  - button "25"
  - button "26"
  - button "27"
  - button "28"
  - button "29"
  - button "30"
  - button "1"
  - button "2"
  - button "3"
  - button "4"
  - button "5"
  - button "6"
  - button "Tạo kế hoạch":
    - img
    - text: Tạo kế hoạch
  - text: 0 kế hoạch trong tháng
  - img
  - textbox "Tìm kiếm kế hoạch..."
  - combobox:
    - option "Tất cả trạng thái" [selected]
    - option "Đang chờ"
    - option "Đang thực hiện"
    - option "Đã hoàn thành"
    - option "Đã hủy"
  - heading "📋 Kế hoạch tháng Tháng 6 2025" [level=3]
  - img
  - paragraph: Không có kế hoạch nào trong tháng này
  - paragraph: Tạo kế hoạch mới để bắt đầu
- link "Dashboard":
  - /url: /
  - img
  - text: Dashboard
- link "Công việc":
  - /url: /tasks
  - img
  - text: Công việc
- link "Kế hoạch":
  - /url: /calendar
  - img
  - text: Kế hoạch
- link "Khách hàng":
  - /url: /customers
  - img
  - text: Khách hàng
- link "Tài khoản":
  - /url: /account
  - img
  - text: Tài khoản
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Session Persistence Bug Investigation', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Clear localStorage before each test
   6 |     await page.goto('http://localhost:8088');
   7 |     await page.evaluate(() => {
   8 |       localStorage.clear();
   9 |     });
   10 |     await page.reload();
   11 |   });
   12 |
   13 |   test('Bug 1: Refresh page reverts to Khổng Đức Mạnh instead of logged in user', async ({ page }) => {
   14 |     console.log('🔍 Testing session persistence bug...');
   15 |     
   16 |     // Navigate to login page
   17 |     await page.goto('http://localhost:8088');
   18 |     await page.waitForLoadState('networkidle');
   19 |
   20 |     // Login as Phạm Thị Hương
   21 |     console.log('📝 Logging in as Phạm Thị Hương...');
   22 |     await page.fill('input[type="email"]', 'huong.pham@example.com');
   23 |     await page.fill('input[type="password"]', 'haininh1');
   24 |     await page.click('button[type="submit"]');
   25 |
   26 |     // Wait for login success
   27 |     await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });
   28 |     
   29 |     // Check logged in user
   30 |     const loggedInUser = await page.textContent('[data-testid="user-name"], .user-name, h1, h2');
   31 |     console.log('✅ Logged in user:', loggedInUser);
   32 |     
   33 |     // Verify it's Phạm Thị Hương
   34 |     expect(loggedInUser).toContain('Phạm Thị Hương');
   35 |
   36 |     // Check localStorage after login
   37 |     const userAfterLogin = await page.evaluate(() => {
   38 |       const user = localStorage.getItem('currentUser');
   39 |       return user ? JSON.parse(user) : null;
   40 |     });
   41 |     console.log('💾 User in localStorage after login:', userAfterLogin?.name);
   42 |     expect(userAfterLogin?.name).toBe('Phạm Thị Hương');
   43 |
   44 |     // Refresh the page
   45 |     console.log('🔄 Refreshing page...');
   46 |     await page.reload();
   47 |     await page.waitForLoadState('networkidle');
   48 |     await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });
   49 |
   50 |     // Check user after refresh
   51 |     const userAfterRefresh = await page.textContent('[data-testid="user-name"], .user-name, h1, h2');
   52 |     console.log('🔍 User after refresh:', userAfterRefresh);
   53 |
   54 |     // Check localStorage after refresh
   55 |     const userInStorageAfterRefresh = await page.evaluate(() => {
   56 |       const user = localStorage.getItem('currentUser');
   57 |       return user ? JSON.parse(user) : null;
   58 |     });
   59 |     console.log('💾 User in localStorage after refresh:', userInStorageAfterRefresh?.name);
   60 |
   61 |     // BUG: This should still be Phạm Thị Hương, not Khổng Đức Mạnh
   62 |     if (userAfterRefresh?.includes('Khổng Đức Mạnh')) {
   63 |       console.log('❌ BUG CONFIRMED: User reverted to Khổng Đức Mạnh after refresh!');
   64 |       console.log('Expected: Phạm Thị Hương');
   65 |       console.log('Actual:', userAfterRefresh);
   66 |     }
   67 |
   68 |     // This test will fail to document the bug
   69 |     expect(userAfterRefresh).toContain('Phạm Thị Hương');
   70 |   });
   71 |
   72 |   test('Bug 2: Phạm Thị Hương cannot see her own tasks', async ({ page }) => {
   73 |     console.log('🔍 Testing Phạm Thị Hương task visibility...');
   74 |     
   75 |     // Clear localStorage and force API mode
   76 |     await page.evaluate(() => {
   77 |       localStorage.clear();
   78 |       localStorage.removeItem('firebaseConfig');
   79 |       localStorage.removeItem('firebase_initialized');
   80 |     });
   81 |     await page.reload();
   82 |
   83 |     // Login as Phạm Thị Hương
   84 |     console.log('📝 Logging in as Phạm Thị Hương...');
>  85 |     await page.fill('input[type="email"]', 'huong.pham@example.com');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
   86 |     await page.fill('input[type="password"]', 'haininh1');
   87 |     await page.click('button[type="submit"]');
   88 |
   89 |     // Wait for login success
   90 |     await page.waitForSelector('[data-testid="user-name"], .user-name, h1, h2', { timeout: 10000 });
   91 |     
   92 |     // Navigate to Tasks page
   93 |     console.log('📋 Navigating to Tasks page...');
   94 |     await page.click('a[href*="tasks"], button:has-text("Công việc"), nav a:has-text("Tasks")');
   95 |     await page.waitForLoadState('networkidle');
   96 |
   97 |     // Wait for tasks to load
   98 |     await page.waitForTimeout(3000);
   99 |
  100 |     // Check for task elements
  101 |     const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card').count();
  102 |     console.log('📊 Number of task elements found:', taskElements);
  103 |
  104 |     // Check for specific tasks that Phạm Thị Hương should see
  105 |     const expectedTasks = [
  106 |       'Khảo sát khách hàng mới - Team 5',
  107 |       'Báo cáo doanh số tuần - Team 5'
  108 |     ];
  109 |
  110 |     let visibleTasks = [];
  111 |     for (const taskTitle of expectedTasks) {
  112 |       const taskVisible = await page.locator(`text="${taskTitle}"`).count() > 0;
  113 |       if (taskVisible) {
  114 |         visibleTasks.push(taskTitle);
  115 |         console.log('✅ Found task:', taskTitle);
  116 |       } else {
  117 |         console.log('❌ Missing task:', taskTitle);
  118 |       }
  119 |     }
  120 |
  121 |     // Check for tasks she should NOT see
  122 |     const forbiddenTasks = [
  123 |       'Công việc của team 1 - Không được xem bởi team 5'
  124 |     ];
  125 |
  126 |     let forbiddenVisible = [];
  127 |     for (const taskTitle of forbiddenTasks) {
  128 |       const taskVisible = await page.locator(`text="${taskTitle}"`).count() > 0;
  129 |       if (taskVisible) {
  130 |         forbiddenVisible.push(taskTitle);
  131 |         console.log('❌ BUG: Should not see task:', taskTitle);
  132 |       }
  133 |     }
  134 |
  135 |     // Get all visible task text for debugging
  136 |     const allTaskText = await page.evaluate(() => {
  137 |       const taskElements = document.querySelectorAll('[data-testid="task-item"], .task-item, .task-card, .task-title');
  138 |       return Array.from(taskElements).map(el => el.textContent?.trim()).filter(Boolean);
  139 |     });
  140 |     console.log('📋 All visible tasks:', allTaskText);
  141 |
  142 |     // Verify Phạm Thị Hương can see her tasks
  143 |     expect(visibleTasks.length).toBeGreaterThan(0);
  144 |     expect(forbiddenVisible.length).toBe(0);
  145 |   });
  146 |
  147 |   test('Debug: Check API data and user permissions', async ({ page }) => {
  148 |     console.log('🔍 Debugging API data and permissions...');
  149 |
  150 |     // Check API endpoints
  151 |     const apiChecks = [
  152 |       'http://localhost:3003/users',
  153 |       'http://localhost:3003/teams', 
  154 |       'http://localhost:3003/tasks'
  155 |     ];
  156 |
  157 |     for (const url of apiChecks) {
  158 |       const response = await page.request.get(url);
  159 |       const data = await response.json();
  160 |       console.log(`📊 ${url}:`, data.data?.length || 0, 'items');
  161 |       
  162 |       if (url.includes('users')) {
  163 |         const huongUser = data.data?.find(u => u.name.includes('Phạm Thị Hương'));
  164 |         console.log('👤 Phạm Thị Hương in API:', huongUser ? 'Found' : 'Missing');
  165 |         if (huongUser) {
  166 |           console.log('   - ID:', huongUser.id);
  167 |           console.log('   - Role:', huongUser.role);
  168 |           console.log('   - Team ID:', huongUser.team_id);
  169 |         }
  170 |       }
  171 |       
  172 |       if (url.includes('teams')) {
  173 |         const team5 = data.data?.find(t => t.id === '5');
  174 |         console.log('🏢 Team 5 in API:', team5 ? 'Found' : 'Missing');
  175 |         if (team5) {
  176 |           console.log('   - Leader ID:', team5.leader_id);
  177 |           console.log('   - Name:', team5.name);
  178 |         }
  179 |       }
  180 |       
  181 |       if (url.includes('tasks')) {
  182 |         const team5Tasks = data.data?.filter(t => t.teamId === '5') || [];
  183 |         const otherTasks = data.data?.filter(t => t.teamId !== '5') || [];
  184 |         console.log('📋 Team 5 tasks:', team5Tasks.length);
  185 |         console.log('📋 Other team tasks:', otherTasks.length);
```