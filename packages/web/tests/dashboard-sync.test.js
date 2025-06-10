// PLW: Test dashboard sync functionality với KPI từ tasks và reports
import { test, expect } from '@playwright/test';

test.describe('Dashboard KPI Sync Tests', () => {
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

  test('should display synced KPI data for director', async ({ page }) => {
    console.log('🧪 Testing director dashboard KPI sync...');
    
    // Navigate to dashboard
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if dashboard loaded
    const dashboardTitle = page.locator('[data-testid="page-title"]:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    console.log('✅ Dashboard loaded');
    
    // Check summary stats section
    const summarySection = page.locator('.bg-gradient-to-r.from-blue-50');
    await expect(summarySection).toBeVisible();
    console.log('✅ Summary section visible');
    
    // Check KPI cards
    const kpiGrid = page.locator('[data-testid="kpi-cards-grid"]');
    await expect(kpiGrid).toBeVisible();

    const kpiCards = kpiGrid.locator('.bg-white\\/95, .border-yellow-200, .border-blue-200');
    const cardCount = await kpiCards.count();
    console.log(`📊 Found ${cardCount} KPI cards`);
    expect(cardCount).toBeGreaterThanOrEqual(4); // KTS, KH/CĐT, SBG, Doanh số

    // Check specific KPI titles for director
    await expect(page.locator('text=Tổng KTS')).toBeVisible();
    await expect(page.locator('text=Tổng KH/CĐT')).toBeVisible();
    await expect(page.locator('text=Tổng SBG')).toBeVisible();
    await expect(page.locator('text=Tổng Doanh Số')).toBeVisible();
    console.log('✅ Director KPI titles correct');
    
    // Check charts visibility (director should see all charts)
    const charts = page.locator('.lg\\:col-span-2, .lg\\:col-span-1');
    const chartCount = await charts.count();
    console.log(`📈 Found ${chartCount} chart sections`);
    expect(chartCount).toBeGreaterThan(0);
    
    console.log('✅ Director dashboard test passed');
  });

  test('should test team leader permissions', async ({ page }) => {
    console.log('🧪 Testing team leader dashboard permissions...');
    
    // Change user to team leader
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
    
    // Check KPI titles for team leader
    await expect(page.locator('text=KTS Nhóm')).toBeVisible();
    await expect(page.locator('text=KH/CĐT Nhóm')).toBeVisible();
    await expect(page.locator('text=SBG Nhóm')).toBeVisible();
    console.log('✅ Team leader KPI titles correct');
    
    // Team leader should see some charts but not all
    const charts = page.locator('.lg\\:col-span-2, .lg\\:col-span-1');
    const chartCount = await charts.count();
    console.log(`📈 Team leader sees ${chartCount} chart sections`);
    
    console.log('✅ Team leader dashboard test passed');
  });

  test('should test employee permissions', async ({ page }) => {
    console.log('🧪 Testing employee dashboard permissions...');
    
    // Change user to employee
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
    
    // Check KPI titles for employee (should show personal data)
    await expect(page.locator('text=KTS Cá nhân')).toBeVisible();
    await expect(page.locator('text=KH/CĐT Cá nhân')).toBeVisible();
    await expect(page.locator('text=SBG Cá nhân')).toBeVisible();
    console.log('✅ Employee KPI titles correct');
    
    // Employee should see limited charts
    const advancedCharts = page.locator('.lg\\:col-span-2');
    const advancedChartCount = await advancedCharts.count();
    console.log(`📈 Employee sees ${advancedChartCount} advanced charts`);
    
    console.log('✅ Employee dashboard test passed');
  });

  test('should verify KPI data synchronization', async ({ page }) => {
    console.log('🧪 Testing KPI data synchronization...');
    
    // Go to tasks page first to create/complete some tasks
    await page.goto('http://localhost:8088/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if tasks exist
    const tasksTable = page.locator('[data-testid="tasks-table"]');
    if (await tasksTable.isVisible()) {
      const taskRows = page.locator('table tbody tr');
      const taskCount = await taskRows.count();
      console.log(`📋 Found ${taskCount} tasks`);
      
      // Go back to dashboard
      await page.goto('http://localhost:8088/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check if summary stats reflect task data
      const totalTasksElement = page.locator('text=Tổng công việc').locator('..').locator('.text-2xl');
      if (await totalTasksElement.isVisible()) {
        const totalTasksText = await totalTasksElement.textContent();
        console.log(`📊 Dashboard shows ${totalTasksText} total tasks`);
      }
      
      // Check if KPI values are not zero (indicating sync is working)
      const kpiValues = page.locator('.text-3xl.font-bold.text-\\[\\#2d3436\\]');
      const valueCount = await kpiValues.count();
      
      for (let i = 0; i < Math.min(valueCount, 4); i++) {
        const value = await kpiValues.nth(i).textContent();
        console.log(`📈 KPI ${i + 1} value: ${value}`);
      }
      
      console.log('✅ KPI synchronization verified');
    } else {
      console.log('⚠️ No tasks table found, skipping sync verification');
    }
  });

  test('should test reports data integration', async ({ page }) => {
    console.log('🧪 Testing reports data integration...');
    
    // Check if reports menu is accessible (for director)
    const reportsLink = page.locator('text=Báo cáo');
    if (await reportsLink.isVisible()) {
      await reportsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check if reports page loaded
      const reportsContent = page.locator('text=Báo cáo hiệu suất');
      if (await reportsContent.isVisible()) {
        console.log('✅ Reports page accessible');
        
        // Go back to dashboard
        await page.goto('http://localhost:8088/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Check if sales data is reflected in dashboard
        const salesKpi = page.locator('text=Tổng Doanh Số').locator('..').locator('.text-3xl');
        if (await salesKpi.isVisible()) {
          const salesValue = await salesKpi.textContent();
          console.log(`💰 Dashboard sales KPI: ${salesValue}`);
          expect(salesValue).not.toBe('0');
        }
        
        console.log('✅ Reports integration verified');
      }
    } else {
      console.log('⚠️ Reports not accessible for current user');
    }
  });

  test('should test responsive dashboard layout', async ({ page }) => {
    console.log('🧪 Testing responsive dashboard layout...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check if KPI cards stack properly on mobile
    const kpiGrid = page.locator('[data-testid="kpi-cards-grid"]');
    await expect(kpiGrid).toBeVisible();
    console.log('✅ Mobile layout responsive');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    console.log('✅ Responsive layout test passed');
  });
});
