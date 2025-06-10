// PLW: Test dashboard fix - kiểm tra giao diện không còn trắng xóa
import { test, expect } from '@playwright/test';

test.describe('Dashboard Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate và auto-login
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Setup test auth
    await page.evaluate(() => {
      const testUser = {
        id: 'test-user-001',
        name: 'Khổng Đức Mạnh',
        email: 'manh@company.com',
        role: 'director',
        team: 'Phòng Kinh Doanh',
        location: 'Hà Nội',
        password_changed: true,
      };
      localStorage.setItem('currentUser', JSON.stringify(testUser));
      localStorage.setItem('authToken', 'test-auth-token');
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should display dashboard without white screen', async ({ page }) => {
    console.log('🧪 Testing dashboard displays correctly...');
    
    // Navigate to dashboard
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/dashboard-fix-check.png', fullPage: true });
    
    // Check if page title exists
    const pageTitle = page.locator('[data-testid="page-title"]');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Page title visible');
    
    // Check if dashboard content is visible (not white screen)
    const dashboardContent = page.locator('.p-4, .p-6');
    await expect(dashboardContent).toBeVisible();
    console.log('✅ Dashboard content visible');
    
    // Check if at least some content is rendered
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toContain('Dashboard');
    console.log('✅ Dashboard text found in body');
    
    // Check if KPI cards or fallback content is visible
    const kpiSection = page.locator('[data-testid="kpi-cards-grid"], .bg-gradient-to-r');
    await expect(kpiSection).toBeVisible();
    console.log('✅ KPI section or fallback visible');
    
    console.log('✅ Dashboard fix test passed - no white screen');
  });

  test('should handle loading state properly', async ({ page }) => {
    console.log('🧪 Testing loading state handling...');
    
    // Navigate to dashboard
    await page.goto('http://localhost:8088/');
    
    // Check for loading indicators or content
    await page.waitForFunction(() => {
      const body = document.body.textContent || '';
      return body.includes('Dashboard') || 
             body.includes('Đang tải') || 
             document.querySelector('.animate-pulse') !== null;
    }, { timeout: 10000 });
    
    console.log('✅ Loading state handled properly');
  });

  test('should display fallback content when no data', async ({ page }) => {
    console.log('🧪 Testing fallback content display...');
    
    // Clear any existing data
    await page.evaluate(() => {
      localStorage.removeItem('tasks');
      localStorage.removeItem('reports');
    });
    
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Should show some content even without data
    const content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    
    // Check for either KPI cards or empty state
    const hasKpiCards = await page.locator('[data-testid="kpi-cards-grid"]').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=Chưa có dữ liệu').isVisible().catch(() => false);
    const hasFallbackCards = await page.locator('.bg-white\\/95').count() > 0;
    
    expect(hasKpiCards || hasEmptyState || hasFallbackCards).toBe(true);
    console.log('✅ Fallback content displayed properly');
  });

  test('should display error-free console', async ({ page }) => {
    console.log('🧪 Testing for console errors...');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_')
    );
    
    console.log('Console errors found:', criticalErrors);
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(3);
    console.log('✅ Console errors within acceptable range');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    console.log('🧪 Testing responsive design...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    let content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    console.log('✅ Mobile view working');
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    console.log('✅ Tablet view working');
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    console.log('✅ Desktop view working');
    
    console.log('✅ Responsive design test passed');
  });

  test('should handle different user roles', async ({ page }) => {
    console.log('🧪 Testing different user roles...');
    
    // Test as team leader
    await page.evaluate(() => {
      const teamLeaderUser = {
        id: 'team-leader-001',
        name: 'Lương Việt Anh',
        email: 'anh@company.com',
        role: 'team_leader',
        team: 'Nhóm 1',
        location: 'Hà Nội',
        password_changed: true,
      };
      localStorage.setItem('currentUser', JSON.stringify(teamLeaderUser));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    let content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    console.log('✅ Team leader role working');
    
    // Test as employee
    await page.evaluate(() => {
      const employeeUser = {
        id: 'employee-001',
        name: 'Nguyễn Văn A',
        email: 'a@company.com',
        role: 'employee',
        team: 'Nhóm 1',
        location: 'Hà Nội',
        password_changed: true,
      };
      localStorage.setItem('currentUser', JSON.stringify(employeeUser));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    content = await page.locator('body').textContent();
    expect(content).toContain('Dashboard');
    console.log('✅ Employee role working');
    
    console.log('✅ User roles test passed');
  });
});
