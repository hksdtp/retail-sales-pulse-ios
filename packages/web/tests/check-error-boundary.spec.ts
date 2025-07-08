import { test, expect } from '@playwright/test';

test.describe('Check Error Boundary', () => {
  test('Check if TaskManagementView is crashing and caught by ErrorBoundary', async ({ page }) => {
    console.log('🔍 Checking for ErrorBoundary errors...');
    
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    
    // Setup user data
    await page.evaluate(() => {
      localStorage.clear();
      
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
      
      const tasks = [
        {
          id: 'task_1',
          title: 'Test Task 1',
          description: 'Test task',
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
        }
      ];
      
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Check for ErrorBoundary error display
    const errorBoundaryElement = await page.locator('.bg-red-50, .text-red-700, :has-text("Đã xảy ra lỗi")').first();
    const hasErrorBoundary = await errorBoundaryElement.isVisible().catch(() => false);
    
    console.log(`🚨 ErrorBoundary visible: ${hasErrorBoundary}`);
    
    if (hasErrorBoundary) {
      const errorText = await errorBoundaryElement.textContent();
      console.log('🚨 ErrorBoundary content:', errorText);
      
      // Look for error stack trace
      const stackTrace = await page.locator('pre').textContent().catch(() => 'No stack trace');
      console.log('📋 Stack trace:', stackTrace);
    }
    
    // Check for TaskManagementView element
    const taskManagementView = await page.locator('[data-testid="task-management-view"], .task-management-view').first();
    const hasTaskManagementView = await taskManagementView.isVisible().catch(() => false);
    
    console.log(`📋 TaskManagementView visible: ${hasTaskManagementView}`);
    
    // Check for any visible content in the main area
    const mainContent = await page.locator('main, .main-content, [role="main"]').first();
    const mainContentText = await mainContent.textContent().catch(() => 'No main content');
    
    console.log('📄 Main content preview:', mainContentText?.substring(0, 200) + '...');
    
    // Check for specific TaskManagementView elements
    const tabs = await page.locator('button:has-text("Của tôi"), button:has-text("Của nhóm"), button:has-text("Thành viên"), button:has-text("Chung")').all();
    console.log(`🔍 Found ${tabs.length} tab buttons`);
    
    // Check for UnifiedTaskFilter
    const filterButton = await page.locator('button:has-text("Bộ lọc")').first();
    const hasFilterButton = await filterButton.isVisible().catch(() => false);
    console.log(`🔍 UnifiedTaskFilter button visible: ${hasFilterButton}`);
    
    // Check for search input
    const searchInput = await page.locator('input[placeholder*="Tìm kiếm"]').first();
    const hasSearchInput = await searchInput.isVisible().catch(() => false);
    console.log(`🔍 Search input visible: ${hasSearchInput}`);
    
    // Log all console errors
    console.log('\n🚨 Console errors:');
    if (errors.length > 0) {
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'error-boundary-check.png', fullPage: true });
    
    console.log('\n📋 Summary:');
    console.log(`- ErrorBoundary visible: ${hasErrorBoundary}`);
    console.log(`- TaskManagementView visible: ${hasTaskManagementView}`);
    console.log(`- Filter button visible: ${hasFilterButton}`);
    console.log(`- Search input visible: ${hasSearchInput}`);
    console.log(`- Tab buttons found: ${tabs.length}`);
    console.log(`- Console errors: ${errors.length}`);
  });

  test('Check page structure and components', async ({ page }) => {
    console.log('🔍 Checking page structure...');
    
    await page.goto('http://localhost:8088');
    
    // Setup user
    await page.evaluate(() => {
      localStorage.clear();
      const user = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        role: 'retail_director'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Check page structure
    const pageTitle = await page.locator('h1, .page-title, [data-testid="page-title"]').first().textContent().catch(() => 'No title');
    console.log('📄 Page title:', pageTitle);
    
    // Check for AppLayout
    const appLayout = await page.locator('.app-layout, [data-testid="app-layout"]').first();
    const hasAppLayout = await appLayout.isVisible().catch(() => false);
    console.log(`🏗️ AppLayout visible: ${hasAppLayout}`);
    
    // Check for PageHeader
    const pageHeader = await page.locator('.page-header, [data-testid="page-header"]').first();
    const hasPageHeader = await pageHeader.isVisible().catch(() => false);
    console.log(`📋 PageHeader visible: ${hasPageHeader}`);
    
    // Check for main content area
    const mainArea = await page.locator('main, .main, .content').first();
    const hasMainArea = await mainArea.isVisible().catch(() => false);
    console.log(`📄 Main area visible: ${hasMainArea}`);
    
    // Get all visible text on page
    const bodyText = await page.locator('body').textContent();
    const hasTaskRelatedText = bodyText?.includes('công việc') || bodyText?.includes('task') || false;
    console.log(`📝 Has task-related text: ${hasTaskRelatedText}`);
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, .spinner, [data-testid="loading"]').all();
    console.log(`⏳ Loading elements found: ${loadingElements.length}`);
    
    console.log('\n📄 Page text preview:');
    console.log(bodyText?.substring(0, 500) + '...');
  });
});
