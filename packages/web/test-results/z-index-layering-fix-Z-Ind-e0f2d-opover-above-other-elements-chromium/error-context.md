# Test info

- Name: Z-Index Layering Fix - TaskFormDialog Dropdowns >> should display DateTimePicker popover above other elements
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/z-index-layering-fix.spec.ts:105:3

# Error details

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
=========================== logs ===========================
  "commit" event fired
  "domcontentloaded" event fired
  "load" event fired
============================================================
    at /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/z-index-layering-fix.spec.ts:9:16
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
  - link "Khách hàng Khách hàng":
    - /url: /customers
    - img
    - text: Khách hàng Khách hàng
  - link "Báo cáo Báo cáo":
    - /url: /reports
    - img
    - text: Báo cáo Báo cáo
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
  - paragraph: Tổng quan về hiệu suất kinh doanh phòng Kinh doanh bán lẻ - Toàn phòng ban
  - button "Làm mới":
    - img
    - text: Làm mới
  - button:
    - img
  - button "Báo cáo chi tiết":
    - img
    - text: Báo cáo chi tiết
  - button "export button":
    - img
    - text: Xuất báo cáo
  - img "chart bar fill": 📊
  - text: Tổng công việc 64
  - img "chart line uptrend xyaxis": 📈
  - text: Hoàn thành 46
  - img "person 2 fill": 👥
  - text: Tỷ lệ hoàn thành 71.9%
  - img "dollarsign circle fill": 💰
  - text: "Doanh số 10.2 tỷ VND Tổng KTS 6 Trước: 5"
  - img "arrow up": ↑
  - text: 15.2% vs kế hoạch
  - img
  - text: "Mới: | Cũ: Tổng Đối tác 4 Trước: 3"
  - img "arrow up": ↑
  - text: 12.3% vs kế hoạch
  - img
  - text: "Mới: | Cũ: Tổng Khách hàng 12 Trước: 10"
  - img "arrow up": ↑
  - text: 18.7% vs kế hoạch
  - img
  - text: "Mới: | Cũ: Tổng Báo giá 9 Trước: 7"
  - img "arrow up": ↑
  - text: 22.1% vs kế hoạch
  - img
  - text: "Mới: | Cũ: Tổng Công việc khác 7 Trước: 6"
  - img "arrow up": ↑
  - text: 8.5% vs kế hoạch
  - img
  - text: "Mới: | Cũ: Tổng Doanh Số 10.2 tỷ VND Trước: 8.7 tỷ VND"
  - img "arrow up": ↑
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
  - heading "Nhân viên xuất sắc" [level=3]
  - text: NTN
  - paragraph: Nguyễn Thị Nga
  - paragraph: Trưởng nhóm
  - paragraph: 2580.5tr
  - paragraph: 35 đơn
  - paragraph: 145% mục tiêu
  - text: NNV
  - paragraph: Nguyễn Ngọc Việt Khanh
  - paragraph: Trưởng nhóm
  - paragraph: 1859.1tr
  - paragraph: 25 đơn
  - paragraph: 110% mục tiêu
  - text: PTH
  - paragraph: Phạm Thị Hương
  - paragraph: Trưởng nhóm
  - paragraph: 1308.4tr
  - paragraph: 28 đơn
  - paragraph: 120% mục tiêu
  - heading "Phân bố theo vùng" [level=3]
  - img:
    - img
    - img
    - text: 51% 49%
  - list:
    - listitem:
      - img
      - text: Hà Nội
    - listitem:
      - img
      - text: TP.HCM
  - heading "Tỷ lệ chuyển đổi" [level=3]
  - text: "Báo giá → Đơn hàng 84% Tỷ lệ chuyển đổi: 84% KH tiềm năng → KH thực tế 26% Hiệu quả chuyển đổi: 26% KTS tiềm năng → Dự án 68% Tỷ lệ thành công: 68%"
- region "Notifications (F8)":
  - list
- region "Notifications alt+T"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Z-Index Layering Fix - TaskFormDialog Dropdowns', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the app
   6 |     await page.goto('http://127.0.0.1:8088');
   7 |     
   8 |     // Wait for app to load
>  9 |     await page.waitForLoadState('networkidle');
     |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
   10 |     
   11 |     // Login if needed (using admin master password)
   12 |     const loginButton = page.locator('button:has-text("Đăng nhập")');
   13 |     if (await loginButton.isVisible()) {
   14 |       await page.fill('input[type="email"]', 'vietanh@example.com');
   15 |       await page.fill('input[type="password"]', 'haininh1');
   16 |       await loginButton.click();
   17 |       await page.waitForLoadState('networkidle');
   18 |     }
   19 |     
   20 |     // Navigate to Tasks page
   21 |     await page.click('a[href="/tasks"]');
   22 |     await page.waitForLoadState('networkidle');
   23 |   });
   24 |
   25 |   test('should display MultiUserPicker dropdown above image upload section', async ({ page }) => {
   26 |     // Open team task creation dialog
   27 |     await page.click('button:has-text("Giao việc cho Nhóm")');
   28 |     await page.waitForSelector('[role="dialog"]');
   29 |     
   30 |     // Scroll to see both assignment section and image upload section
   31 |     await page.locator('[role="dialog"]').scrollIntoViewIfNeeded();
   32 |     
   33 |     // Fill in required fields first to make form valid
   34 |     await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Test Z-Index Fix');
   35 |     await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing dropdown visibility over image upload section');
   36 |     
   37 |     // Select a task type
   38 |     await page.click('button:has-text("KTS mới")');
   39 |     
   40 |     // Open the MultiUserPicker dropdown
   41 |     const userPickerTrigger = page.locator('text=Chọn người được giao việc');
   42 |     await userPickerTrigger.click();
   43 |     
   44 |     // Wait for dropdown to appear
   45 |     await page.waitForSelector('[data-testid="user-dropdown"]', { timeout: 2000 }).catch(() => {
   46 |       // If data-testid doesn't exist, try alternative selector
   47 |       return page.waitForSelector('input[placeholder*="Tìm kiếm người dùng"]', { timeout: 2000 });
   48 |     });
   49 |     
   50 |     // Check that dropdown is visible and not covered
   51 |     const dropdown = page.locator('input[placeholder*="Tìm kiếm người dùng"]').locator('..').locator('..');
   52 |     await expect(dropdown).toBeVisible();
   53 |     
   54 |     // Verify dropdown has correct z-index
   55 |     const dropdownElement = await dropdown.first().elementHandle();
   56 |     if (dropdownElement) {
   57 |       const zIndex = await page.evaluate((el) => {
   58 |         return window.getComputedStyle(el).zIndex;
   59 |       }, dropdownElement);
   60 |       
   61 |       // Should have z-index higher than dialog (10000)
   62 |       expect(parseInt(zIndex)).toBeGreaterThan(10000);
   63 |     }
   64 |     
   65 |     // Verify image upload section is still visible but below dropdown
   66 |     const imageUploadSection = page.locator('text=Hình ảnh đính kèm');
   67 |     await expect(imageUploadSection).toBeVisible();
   68 |     
   69 |     // Test interaction with dropdown
   70 |     const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
   71 |     if (await searchInput.isVisible()) {
   72 |       await searchInput.fill('test');
   73 |       // Should be able to type without issues
   74 |       await expect(searchInput).toHaveValue('test');
   75 |     }
   76 |   });
   77 |
   78 |   test('should display SmartInput suggestions above other elements', async ({ page }) => {
   79 |     // Open task creation dialog
   80 |     await page.click('button:has-text("Tạo công việc")');
   81 |     await page.waitForSelector('[role="dialog"]');
   82 |     
   83 |     // Type in title to trigger suggestions
   84 |     const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
   85 |     await titleInput.fill('Khảo sát');
   86 |     
   87 |     // Wait for suggestions to appear (if any)
   88 |     await page.waitForTimeout(500);
   89 |     
   90 |     // Check if suggestions dropdown appears
   91 |     const suggestionsDropdown = page.locator('[data-testid="suggestions-dropdown"]');
   92 |     if (await suggestionsDropdown.isVisible()) {
   93 |       // Verify suggestions have correct z-index
   94 |       const dropdownElement = await suggestionsDropdown.first().elementHandle();
   95 |       if (dropdownElement) {
   96 |         const zIndex = await page.evaluate((el) => {
   97 |           return window.getComputedStyle(el).zIndex;
   98 |         }, dropdownElement);
   99 |         
  100 |         expect(parseInt(zIndex)).toBeGreaterThan(10000);
  101 |       }
  102 |     }
  103 |   });
  104 |
  105 |   test('should display DateTimePicker popover above other elements', async ({ page }) => {
  106 |     // Open task creation dialog
  107 |     await page.click('button:has-text("Tạo công việc")');
  108 |     await page.waitForSelector('[role="dialog"]');
  109 |     
```