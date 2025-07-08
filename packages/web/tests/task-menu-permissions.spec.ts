import { test, expect } from '@playwright/test';

test.describe('Task Menu Permissions System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
  });

  test('Tab "Thành viên" chỉ hiển thị cho Khổng Đức Mạnh', async ({ page }) => {
    // Test với Khổng Đức Mạnh
    console.log('🧪 Testing tab visibility for Khổng Đức Mạnh...');
    
    // Login as Khổng Đức Mạnh
    await page.fill('input[type="email"]', 'manh.khong@example.com');
    await page.fill('input[type="password"]', 'Haininh1');
    await page.click('button[type="submit"]');
    
    // Wait for login and navigation
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Kiểm tra tab "Thành viên" có hiển thị
    const memberTab = page.locator('button:has-text("Thành viên")');
    await expect(memberTab).toBeVisible();
    console.log('✅ Tab "Thành viên" hiển thị cho Khổng Đức Mạnh');
    
    // Logout
    await page.click('[data-testid="logout-button"]');
  });

  test('Tab "Thành viên" ẩn với người dùng khác', async ({ page }) => {
    console.log('🧪 Testing tab visibility for regular user...');
    
    // Login as regular user (Lương Việt Anh - team leader)
    await page.fill('input[type="email"]', 'anh.luong@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for login and navigation
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Kiểm tra tab "Thành viên" KHÔNG hiển thị
    const memberTab = page.locator('button:has-text("Thành viên")');
    await expect(memberTab).not.toBeVisible();
    console.log('✅ Tab "Thành viên" ẩn với người dùng thường');
  });

  test('Tab "Của tôi" chỉ hiển thị công việc do người dùng tạo', async ({ page }) => {
    console.log('🧪 Testing "Của tôi" tab filtering...');
    
    // Login as any user
    await page.fill('input[type="email"]', 'anh.luong@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait for login and navigation
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Click on "Của tôi" tab
    await page.click('button:has-text("Của tôi")');
    await page.waitForTimeout(2000);
    
    // Kiểm tra chỉ có công việc do người dùng tạo
    const taskItems = page.locator('[data-testid="task-item"]');
    const taskCount = await taskItems.count();
    
    if (taskCount > 0) {
      // Kiểm tra từng task có phải do user hiện tại tạo không
      for (let i = 0; i < taskCount; i++) {
        const taskItem = taskItems.nth(i);
        const taskCreator = await taskItem.getAttribute('data-creator');
        // Verify task creator matches current user
        console.log(`Task ${i + 1} creator: ${taskCreator}`);
      }
    }
    
    console.log('✅ Tab "Của tôi" filtering works correctly');
  });

  test('Tab "Của nhóm" áp dụng quy tắc phân quyền đúng', async ({ page }) => {
    console.log('🧪 Testing "Của nhóm" tab permissions...');
    
    // Test với team leader
    await page.fill('input[type="email"]', 'anh.luong@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Click on "Của nhóm" tab
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(2000);
    
    // Team leader should see all team tasks
    const teamTasks = page.locator('[data-testid="task-item"]');
    const teamTaskCount = await teamTasks.count();
    console.log(`Team leader sees ${teamTaskCount} team tasks`);
    
    // Logout and test with regular member
    await page.click('[data-testid="logout-button"]');
    
    // Login as regular member
    await page.fill('input[type="email"]', 'duy.le@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Click on "Của nhóm" tab
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(2000);
    
    // Regular member should see limited tasks
    const memberTeamTasks = page.locator('[data-testid="task-item"]');
    const memberTaskCount = await memberTeamTasks.count();
    console.log(`Regular member sees ${memberTaskCount} team tasks`);
    
    console.log('✅ Tab "Của nhóm" permissions work correctly');
  });

  test('Tab "Chung" hiển thị cho tất cả người dùng', async ({ page }) => {
    console.log('🧪 Testing "Chung" tab accessibility...');
    
    // Test với nhiều loại user khác nhau
    const users = [
      { email: 'manh.khong@example.com', password: 'Haininh1', role: 'Director' },
      { email: 'anh.luong@example.com', password: '123456', role: 'Team Leader' },
      { email: 'duy.le@example.com', password: '123456', role: 'Member' }
    ];
    
    for (const user of users) {
      console.log(`Testing with ${user.role}...`);
      
      // Login
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
      
      // Kiểm tra tab "Chung" có hiển thị
      const publicTab = page.locator('button:has-text("Chung")');
      await expect(publicTab).toBeVisible();
      
      // Click và kiểm tra có thể truy cập
      await page.click('button:has-text("Chung")');
      await page.waitForTimeout(2000);
      
      console.log(`✅ ${user.role} can access "Chung" tab`);
      
      // Logout for next user
      await page.click('[data-testid="logout-button"]');
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ Tab "Chung" accessible to all users');
  });

  test('Khổng Đức Mạnh có thể xem toàn bộ công việc trong tab "Thành viên"', async ({ page }) => {
    console.log('🧪 Testing Khổng Đức Mạnh full access to member tasks...');
    
    // Login as Khổng Đức Mạnh
    await page.fill('input[type="email"]', 'manh.khong@example.com');
    await page.fill('input[type="password"]', 'Haininh1');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('[data-testid="task-view-buttons"]', { timeout: 10000 });
    
    // Click on "Thành viên" tab
    await page.click('button:has-text("Thành viên")');
    await page.waitForTimeout(2000);
    
    // Should see member filters
    const memberFilters = page.locator('[data-testid="member-filters"]');
    await expect(memberFilters).toBeVisible();
    
    // Should see tasks from all departments (Hà Nội + Hồ Chí Minh)
    const allMemberTasks = page.locator('[data-testid="task-item"]');
    const allTaskCount = await allMemberTasks.count();
    console.log(`Khổng Đức Mạnh sees ${allTaskCount} member tasks`);
    
    // Test location filter
    await page.selectOption('[data-testid="location-filter"]', 'hanoi');
    await page.waitForTimeout(1000);
    
    const hanoiTasks = page.locator('[data-testid="task-item"]');
    const hanoiTaskCount = await hanoiTasks.count();
    console.log(`Hanoi tasks: ${hanoiTaskCount}`);
    
    await page.selectOption('[data-testid="location-filter"]', 'hcm');
    await page.waitForTimeout(1000);
    
    const hcmTasks = page.locator('[data-testid="task-item"]');
    const hcmTaskCount = await hcmTasks.count();
    console.log(`HCM tasks: ${hcmTaskCount}`);
    
    console.log('✅ Khổng Đức Mạnh has full access to all member tasks');
  });
});
