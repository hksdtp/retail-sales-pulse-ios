# Test info

- Name: Dashboard Fix Tests >> should display dashboard without white screen
- Location: /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/dashboard-fix.test.js:31:3

# Error details

```
Error: expect.toBeVisible: Error: strict mode violation: locator('.p-4, .p-6') resolved to 11 elements:
    1) <div data-lov-name="div" data-component-line="145" data-component-name="div" data-component-file="Sidebar.tsx" data-lov-id="src/components/layout/Sidebar.tsx:145:8" data-component-path="src/components/layout/Sidebar.tsx" class="flex items-center justify-between p-4 border-b border-gray-200 min-h-[72px]" data-component-content="%7B%22className%22%3A%22flex%20items-center%20justify-between%20p-4%20border-b%20border-gray-200%20min-h-%5B72px%5D%22%7D">…</div> aka locator('div').filter({ hasText: /^Phòng Kinh Doanh$/ }).first()
    2) <nav data-lov-name="nav" data-component-line="188" data-component-name="nav" class="flex-1 p-4 space-y-2" data-component-file="Sidebar.tsx" data-lov-id="src/components/layout/Sidebar.tsx:188:8" data-component-path="src/components/layout/Sidebar.tsx" data-component-content="%7B%22className%22%3A%22flex-1%20p-4%20space-y-2%22%7D">…</nav> aka getByText('DashboardDashboardCông việcCô')
    3) <div data-lov-name="div" data-component-line="228" data-component-name="div" data-component-file="Sidebar.tsx" class="p-4 border-t border-gray-200 relative" data-lov-id="src/components/layout/Sidebar.tsx:228:8" data-component-path="src/components/layout/Sidebar.tsx" data-component-content="%7B%22className%22%3A%22p-4%20border-t%20border-gray-200%20relative%22%7D">…</div> aka locator('div').filter({ hasText: /^KĐKhổng Đức Mạnhmanh@company\.comKhổng Đức Mạnh$/ })
    4) <div data-lov-name="div" data-component-line="37" data-component-name="div" data-component-file="AppLayout.tsx" class="flex-1 overflow-y-auto p-4 md:p-6" data-lov-id="src/components/layout/AppLayout.tsx:37:8" data-component-path="src/components/layout/AppLayout.tsx" data-component-content="%7B%22className%22%3A%22flex-1%20overflow-y-auto%20p-4%20md%3Ap-6%22%7D">…</div> aka locator('div').filter({ hasText: 'DashboardTổng quan về hiệu suất kinh doanh cá nhân của bạn - Toàn phòng ban📊 B' }).nth(3)
    5) <div data-lov-name="div" data-component-line="93" data-component-name="div" class="p-4 md:p-6 space-y-8" data-component-file="KpiDashboard.tsx" data-lov-id="src/components/dashboard/KpiDashboard.tsx:93:4" data-component-path="src/components/dashboard/KpiDashboard.tsx" data-component-content="%7B%22className%22%3A%22p-4%20md%3Ap-6%20space-y-8%22%7D">…</div> aka getByText('Tổng công việc0Hoàn thành0Tỷ lệ hoàn thành0%Doanh số7.2 tỷ VNDTổng KTS0Trước:')
    6) <div data-component-line="95" data-lov-name="motion.div" data-component-name="motion.div" data-component-file="KpiDashboard.tsx" data-lov-id="src/components/dashboard/KpiDashboard.tsx:95:6" data-component-path="src/components/dashboard/KpiDashboard.tsx" class="bg-gradient-to-br from-slate-50/80 via-white/90 to-blue-50/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg shadow-black/5 p-6" data-component-content="%7B%22className%22%3A%22bg-gradient-to-br%20from-slate-50%2F80%20via-w…>…</div> aka locator('div').filter({ hasText: /^Tổng công việc0Hoàn thành0Tỷ lệ hoàn thành0%Doanh số7\.2 tỷ VND$/ }).first()
    7) <div data-component-line="73" data-lov-name="CardContent" data-component-file="KpiCard.tsx" data-component-name="CardContent" class="md:p-6 md:pt-0 p-6 relative" data-lov-id="src/components/dashboard/KpiCard.tsx:73:6" data-component-path="src/components/dashboard/KpiCard.tsx" data-component-content="%7B%22className%22%3A%22p-6%20relative%22%7D">…</div> aka getByTestId('kpi-cards-grid').locator('div').filter({ hasText: 'Tổng KTS0Trước: 00%vs kế hoạch' }).nth(2)
    8) <div data-component-line="73" data-lov-name="CardContent" data-component-file="KpiCard.tsx" data-component-name="CardContent" class="md:p-6 md:pt-0 p-6 relative" data-lov-id="src/components/dashboard/KpiCard.tsx:73:6" data-component-path="src/components/dashboard/KpiCard.tsx" data-component-content="%7B%22className%22%3A%22p-6%20relative%22%7D">…</div> aka getByTestId('kpi-cards-grid').locator('div').filter({ hasText: 'Tổng KH/CĐT0Trước: 00%vs kế' }).nth(2)
    9) <div data-component-line="73" data-lov-name="CardContent" data-component-file="KpiCard.tsx" data-component-name="CardContent" class="md:p-6 md:pt-0 p-6 relative" data-lov-id="src/components/dashboard/KpiCard.tsx:73:6" data-component-path="src/components/dashboard/KpiCard.tsx" data-component-content="%7B%22className%22%3A%22p-6%20relative%22%7D">…</div> aka getByTestId('kpi-cards-grid').locator('div').filter({ hasText: 'Tổng SBG0Trước: 00%vs kế hoạch' }).nth(2)
    10) <div data-component-line="73" data-lov-name="CardContent" data-component-file="KpiCard.tsx" data-component-name="CardContent" class="md:p-6 md:pt-0 p-6 relative" data-lov-id="src/components/dashboard/KpiCard.tsx:73:6" data-component-path="src/components/dashboard/KpiCard.tsx" data-component-content="%7B%22className%22%3A%22p-6%20relative%22%7D">…</div> aka getByTestId('kpi-cards-grid').locator('div').filter({ hasText: 'Tổng Doanh Số7.2 tỷ VNDTrước' }).nth(2)
    ...

Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.p-4, .p-6')

    at /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/dashboard-fix.test.js:49:36
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- img "Logo"
- text: Phòng Kinh Doanh
- button "Mở rộng sidebar":
  - img
- navigation:
  - link "Dashboard Dashboard":
    - /url: /
    - img
    - text: Dashboard Dashboard
  - link "Công việc Công việc":
    - /url: /tasks
    - img
    - text: Công việc Công việc
  - link "Kế hoạch Kế hoạch":
    - /url: /calendar
    - img
    - text: Kế hoạch Kế hoạch
  - link "Nhân viên Nhân viên":
    - /url: /employees
    - img
    - text: Nhân viên Nhân viên
- button "KĐ Khổng Đức Mạnh manh@company.com Khổng Đức Mạnh":
  - text: KĐ
  - paragraph: Khổng Đức Mạnh
  - paragraph: manh@company.com
  - text: Khổng Đức Mạnh
- main:
  - heading "Dashboard" [level=1]
  - paragraph: Tổng quan về hiệu suất kinh doanh cá nhân của bạn - Toàn phòng ban
  - button "📊 Báo cáo chi tiết"
  - button "📤 Xuất báo cáo"
  - img
  - text: Tổng công việc 0
  - img
  - text: Hoàn thành 0
  - img
  - text: Tỷ lệ hoàn thành 0%
  - img
  - text: "Doanh số 7.2 tỷ VND Tổng KTS 0 Trước: 0"
  - img
  - text: 0% vs kế hoạch
  - img
  - text: "Mới: 0 | Cũ: 0 Tổng KH/CĐT 0 Trước: 0"
  - img
  - text: 0% vs kế hoạch
  - img
  - text: "Mới: 0 | Cũ: 0 Tổng SBG 0 Trước: 0"
  - img
  - text: 0% vs kế hoạch
  - img
  - text: "Mới: 0 | Cũ: 0 Tổng Doanh Số 7.2 tỷ VND Trước: 6.1 tỷ VND"
  - img
  - text: 17.6% vs kế hoạch
  - img
  - heading "Doanh thu" [level=3]
  - group:
    - radio "Tuần"
    - radio "Tháng" [checked]
    - radio "Quý"
  - img: 0 7000000000 14000000000 21000000000 28000000000
  - list:
    - listitem:
      - img
      - text: Doanh thu
    - listitem:
      - img
      - text: Mục tiêu
  - heading "Tỷ lệ chuyển đổi" [level=3]
  - text: Báo giá → Đơn hàng 35% KH tiềm năng → KH thực tế 42% KTS tiềm năng → Dự án 28%
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
   1 | // PLW: Test dashboard fix - kiểm tra giao diện không còn trắng xóa
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('Dashboard Fix Tests', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // Navigate và auto-login
   7 |     await page.goto('http://localhost:8088');
   8 |     await page.waitForLoadState('networkidle');
   9 |     
   10 |     // Setup test auth
   11 |     await page.evaluate(() => {
   12 |       const testUser = {
   13 |         id: 'test-user-001',
   14 |         name: 'Khổng Đức Mạnh',
   15 |         email: 'manh@company.com',
   16 |         role: 'director',
   17 |         team: 'Phòng Kinh Doanh',
   18 |         location: 'Hà Nội',
   19 |         password_changed: true,
   20 |       };
   21 |       localStorage.setItem('currentUser', JSON.stringify(testUser));
   22 |       localStorage.setItem('authToken', 'test-auth-token');
   23 |       localStorage.setItem('isAuthenticated', 'true');
   24 |     });
   25 |     
   26 |     await page.reload();
   27 |     await page.waitForLoadState('networkidle');
   28 |     await page.waitForTimeout(3000);
   29 |   });
   30 |
   31 |   test('should display dashboard without white screen', async ({ page }) => {
   32 |     console.log('🧪 Testing dashboard displays correctly...');
   33 |     
   34 |     // Navigate to dashboard
   35 |     await page.goto('http://localhost:8088/');
   36 |     await page.waitForLoadState('networkidle');
   37 |     await page.waitForTimeout(3000);
   38 |     
   39 |     // Take screenshot for debugging
   40 |     await page.screenshot({ path: 'test-results/dashboard-fix-check.png', fullPage: true });
   41 |     
   42 |     // Check if page title exists
   43 |     const pageTitle = page.locator('[data-testid="page-title"]');
   44 |     await expect(pageTitle).toBeVisible({ timeout: 10000 });
   45 |     console.log('✅ Page title visible');
   46 |     
   47 |     // Check if dashboard content is visible (not white screen)
   48 |     const dashboardContent = page.locator('.p-4, .p-6');
>  49 |     await expect(dashboardContent).toBeVisible();
      |                                    ^ Error: expect.toBeVisible: Error: strict mode violation: locator('.p-4, .p-6') resolved to 11 elements:
   50 |     console.log('✅ Dashboard content visible');
   51 |     
   52 |     // Check if at least some content is rendered
   53 |     const bodyContent = await page.locator('body').textContent();
   54 |     expect(bodyContent).toContain('Dashboard');
   55 |     console.log('✅ Dashboard text found in body');
   56 |     
   57 |     // Check if KPI cards or fallback content is visible
   58 |     const kpiSection = page.locator('[data-testid="kpi-cards-grid"], .bg-gradient-to-r');
   59 |     await expect(kpiSection).toBeVisible();
   60 |     console.log('✅ KPI section or fallback visible');
   61 |     
   62 |     console.log('✅ Dashboard fix test passed - no white screen');
   63 |   });
   64 |
   65 |   test('should handle loading state properly', async ({ page }) => {
   66 |     console.log('🧪 Testing loading state handling...');
   67 |     
   68 |     // Navigate to dashboard
   69 |     await page.goto('http://localhost:8088/');
   70 |     
   71 |     // Check for loading indicators or content
   72 |     await page.waitForFunction(() => {
   73 |       const body = document.body.textContent || '';
   74 |       return body.includes('Dashboard') || 
   75 |              body.includes('Đang tải') || 
   76 |              document.querySelector('.animate-pulse') !== null;
   77 |     }, { timeout: 10000 });
   78 |     
   79 |     console.log('✅ Loading state handled properly');
   80 |   });
   81 |
   82 |   test('should display fallback content when no data', async ({ page }) => {
   83 |     console.log('🧪 Testing fallback content display...');
   84 |     
   85 |     // Clear any existing data
   86 |     await page.evaluate(() => {
   87 |       localStorage.removeItem('tasks');
   88 |       localStorage.removeItem('reports');
   89 |     });
   90 |     
   91 |     await page.goto('http://localhost:8088/');
   92 |     await page.waitForLoadState('networkidle');
   93 |     await page.waitForTimeout(3000);
   94 |     
   95 |     // Should show some content even without data
   96 |     const content = await page.locator('body').textContent();
   97 |     expect(content).toContain('Dashboard');
   98 |     
   99 |     // Check for either KPI cards or empty state
  100 |     const hasKpiCards = await page.locator('[data-testid="kpi-cards-grid"]').isVisible().catch(() => false);
  101 |     const hasEmptyState = await page.locator('text=Chưa có dữ liệu').isVisible().catch(() => false);
  102 |     const hasFallbackCards = await page.locator('.bg-white\\/95').count() > 0;
  103 |     
  104 |     expect(hasKpiCards || hasEmptyState || hasFallbackCards).toBe(true);
  105 |     console.log('✅ Fallback content displayed properly');
  106 |   });
  107 |
  108 |   test('should display error-free console', async ({ page }) => {
  109 |     console.log('🧪 Testing for console errors...');
  110 |     
  111 |     const consoleErrors = [];
  112 |     page.on('console', msg => {
  113 |       if (msg.type() === 'error') {
  114 |         consoleErrors.push(msg.text());
  115 |       }
  116 |     });
  117 |     
  118 |     await page.goto('http://localhost:8088/');
  119 |     await page.waitForLoadState('networkidle');
  120 |     await page.waitForTimeout(3000);
  121 |     
  122 |     // Filter out known non-critical errors
  123 |     const criticalErrors = consoleErrors.filter(error => 
  124 |       !error.includes('favicon') && 
  125 |       !error.includes('404') &&
  126 |       !error.includes('net::ERR_')
  127 |     );
  128 |     
  129 |     console.log('Console errors found:', criticalErrors);
  130 |     
  131 |     // Should have minimal critical errors
  132 |     expect(criticalErrors.length).toBeLessThan(3);
  133 |     console.log('✅ Console errors within acceptable range');
  134 |   });
  135 |
  136 |   test('should be responsive on different screen sizes', async ({ page }) => {
  137 |     console.log('🧪 Testing responsive design...');
  138 |     
  139 |     await page.goto('http://localhost:8088/');
  140 |     await page.waitForLoadState('networkidle');
  141 |     
  142 |     // Test mobile
  143 |     await page.setViewportSize({ width: 375, height: 667 });
  144 |     await page.waitForTimeout(1000);
  145 |     
  146 |     let content = await page.locator('body').textContent();
  147 |     expect(content).toContain('Dashboard');
  148 |     console.log('✅ Mobile view working');
  149 |     
```