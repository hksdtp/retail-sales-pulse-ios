# Test info

- Name: Authenticated User Tests >> should test manual logout by clearing localStorage
- Location: /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/authenticated-user.spec.ts:149:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
    at /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/authenticated-user.spec.ts:186:23
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
- img "ICT Logo"
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
  - link "Thiết kế rèm AI Thiết kế rèm AI":
    - /url: /curtain-design
    - img
    - text: Thiết kế rèm AI Thiết kế rèm AI
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
  - text: Tổng công việc 2
  - img
  - text: Hoàn thành 0
  - img
  - text: Tỷ lệ hoàn thành 0%
  - img
  - text: "Doanh số 10.2 tỷ VND Tổng KTS 0 Trước: 0"
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
  - text: "Mới: 0 | Cũ: 0 Tổng Doanh Số 10.2 tỷ VND Trước: 8.7 tỷ VND"
  - img
  - text: 17.6% vs kế hoạch
  - img
  - heading "Doanh thu" [level=3]
  - group:
    - radio "Tuần"
    - radio "Tháng" [checked]
    - radio "Quý"
  - img: 0 1500000000 3000000000 4500000000 6000000000
  - list:
    - listitem:
      - img
      - text: Doanh thu
    - listitem:
      - img
      - text: Mục tiêu
  - heading "Tỷ lệ chuyển đổi" [level=3]
  - text: Báo giá → Đơn hàng 0% Chưa có dữ liệu KH tiềm năng → KH thực tế 0% Chưa có dữ liệu KTS tiềm năng → Dự án 0% Chưa có dữ liệu
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
   86 |
   87 |   test('should test logout functionality', async ({ page }) => {
   88 |     console.log('🧪 Testing logout functionality...');
   89 |     
   90 |     // Tìm user menu hoặc logout button
   91 |     const userMenuSelectors = [
   92 |       'button:has-text("Khổng Đức Mạnh")',
   93 |       '[data-testid="user-menu"]',
   94 |       '.user-menu',
   95 |       'button:has-text("KĐ")', // Avatar initials
   96 |       '[class*="avatar"]',
   97 |       '[class*="user"]'
   98 |     ];
   99 |     
  100 |     let userMenuFound = false;
  101 |     
  102 |     for (const selector of userMenuSelectors) {
  103 |       const element = page.locator(selector).first();
  104 |       if (await element.isVisible({ timeout: 2000 })) {
  105 |         console.log(`🎯 Found user menu: ${selector}`);
  106 |         await element.click();
  107 |         await page.waitForTimeout(1000);
  108 |         userMenuFound = true;
  109 |         break;
  110 |       }
  111 |     }
  112 |     
  113 |     if (userMenuFound) {
  114 |       // Tìm logout option trong menu
  115 |       const logoutSelectors = [
  116 |         'button:has-text("Đăng xuất")',
  117 |         'button:has-text("Logout")',
  118 |         'a:has-text("Đăng xuất")',
  119 |         '[data-testid="logout"]'
  120 |       ];
  121 |       
  122 |       for (const selector of logoutSelectors) {
  123 |         const logoutElement = page.locator(selector).first();
  124 |         if (await logoutElement.isVisible({ timeout: 2000 })) {
  125 |           console.log(`🚪 Found logout: ${selector}`);
  126 |           await logoutElement.click();
  127 |           await page.waitForTimeout(2000);
  128 |           
  129 |           // Kiểm tra đã logout
  130 |           const authState = await page.evaluate(() => {
  131 |             return localStorage.getItem('isAuthenticated') === 'true';
  132 |           });
  133 |           
  134 |           if (!authState) {
  135 |             console.log('✅ Logout successful');
  136 |           } else {
  137 |             console.log('⚠️ Still authenticated after logout');
  138 |           }
  139 |           break;
  140 |         }
  141 |       }
  142 |     } else {
  143 |       console.log('⚠️ User menu not found - may not have logout functionality');
  144 |     }
  145 |     
  146 |     expect(true).toBe(true); // Always pass for now
  147 |   });
  148 |
  149 |   test('should test manual logout by clearing localStorage', async ({ page }) => {
  150 |     console.log('🧪 Testing manual logout...');
  151 |     
  152 |     // Verify currently authenticated
  153 |     let authState = await page.evaluate(() => {
  154 |       return localStorage.getItem('isAuthenticated') === 'true';
  155 |     });
  156 |     expect(authState).toBe(true);
  157 |     
  158 |     // Clear auth data
  159 |     await page.evaluate(() => {
  160 |       localStorage.removeItem('currentUser');
  161 |       localStorage.removeItem('authToken');
  162 |       localStorage.removeItem('isAuthenticated');
  163 |     });
  164 |     
  165 |     // Reload page
  166 |     await page.reload();
  167 |     await page.waitForLoadState('networkidle');
  168 |     await page.waitForTimeout(2000);
  169 |     
  170 |     // Check if redirected to login or shows login form
  171 |     authState = await page.evaluate(() => {
  172 |       return localStorage.getItem('isAuthenticated') === 'true';
  173 |     });
  174 |     
  175 |     console.log('🔐 Auth state after manual logout:', authState);
  176 |     
  177 |     // Check page content
  178 |     const bodyText = await page.locator('body').textContent();
  179 |     const hasLoginElements = bodyText?.includes('đăng nhập') || 
  180 |                            bodyText?.includes('Đăng nhập') ||
  181 |                            bodyText?.includes('login');
  182 |     
  183 |     console.log('🔍 Has login elements:', hasLoginElements);
  184 |     console.log('📄 Page title after logout:', await page.title());
  185 |     
> 186 |     expect(authState).toBe(false);
      |                       ^ Error: expect(received).toBe(expected) // Object.is equality
  187 |     console.log('✅ Manual logout successful');
  188 |   });
  189 | });
  190 |
```