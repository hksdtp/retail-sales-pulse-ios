# Test info

- Name: TaskFormDialog Improvements >> should show multi-user picker for assignment
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/task-form-improvements.spec.ts:109:3

# Error details

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:8088/", waiting until "load"

    at /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/task-form-improvements.spec.ts:6:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('TaskFormDialog Improvements', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the app
>  6 |     await page.goto('http://127.0.0.1:8088');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
   7 |     
   8 |     // Wait for app to load
   9 |     await page.waitForLoadState('networkidle');
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
   25 |   test('should show improved task form with all new components', async ({ page }) => {
   26 |     // Open task creation dialog
   27 |     await page.click('button:has-text("Tạo công việc")');
   28 |     
   29 |     // Wait for dialog to appear
   30 |     await expect(page.locator('[role="dialog"]')).toBeVisible();
   31 |     
   32 |     // Check for smart input with suggestions
   33 |     const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
   34 |     await expect(titleInput).toBeVisible();
   35 |     
   36 |     // Check for improved task type selector
   37 |     await expect(page.locator('text=Loại công việc')).toBeVisible();
   38 |     await expect(page.locator('text=Có thể chọn nhiều')).toBeVisible();
   39 |     
   40 |     // Check for improved date/time pickers
   41 |     await expect(page.locator('text=Ngày thực hiện')).toBeVisible();
   42 |     await expect(page.locator('text=Hạn chót')).toBeVisible();
   43 |     
   44 |     // Check for multi-user picker
   45 |     await expect(page.locator('text=Giao cho ai')).toBeVisible();
   46 |     await expect(page.locator('text=Có thể chọn nhiều người')).toBeVisible();
   47 |     
   48 |     // Check for disabled image upload at bottom
   49 |     await expect(page.locator('text=Hình ảnh đính kèm')).toBeVisible();
   50 |     await expect(page.locator('text=Đang phát triển')).toBeVisible();
   51 |   });
   52 |
   53 |   test('should provide smart suggestions when typing task title', async ({ page }) => {
   54 |     // Open task creation dialog
   55 |     await page.click('button:has-text("Tạo công việc")');
   56 |     await page.waitForSelector('[role="dialog"]');
   57 |     
   58 |     // Type in title to trigger suggestions
   59 |     const titleInput = page.locator('input[placeholder*="Nhập tiêu đề công việc"]');
   60 |     await titleInput.fill('Khảo sát');
   61 |     
   62 |     // Wait a bit for suggestions to appear
   63 |     await page.waitForTimeout(500);
   64 |     
   65 |     // Check if suggestions dropdown appears (if there are any)
   66 |     const suggestionsDropdown = page.locator('[data-testid="suggestions-dropdown"]');
   67 |     if (await suggestionsDropdown.isVisible()) {
   68 |       await expect(suggestionsDropdown).toBeVisible();
   69 |     }
   70 |   });
   71 |
   72 |   test('should allow multiple task type selection', async ({ page }) => {
   73 |     // Open task creation dialog
   74 |     await page.click('button:has-text("Tạo công việc")');
   75 |     await page.waitForSelector('[role="dialog"]');
   76 |     
   77 |     // Select multiple task types
   78 |     await page.click('button:has-text("KTS mới")');
   79 |     await page.click('button:has-text("SBG mới")');
   80 |     
   81 |     // Check that both are selected (should have blue background)
   82 |     const ktsButton = page.locator('button:has-text("KTS mới")');
   83 |     const sbgButton = page.locator('button:has-text("SBG mới")');
   84 |     
   85 |     await expect(ktsButton).toHaveClass(/border-blue-500/);
   86 |     await expect(sbgButton).toHaveClass(/border-blue-500/);
   87 |   });
   88 |
   89 |   test('should show improved date/time pickers with quick options', async ({ page }) => {
   90 |     // Open task creation dialog
   91 |     await page.click('button:has-text("Tạo công việc")');
   92 |     await page.waitForSelector('[role="dialog"]');
   93 |     
   94 |     // Click on date picker
   95 |     const dateButton = page.locator('button:has-text("Chọn ngày thực hiện")');
   96 |     await dateButton.click();
   97 |     
   98 |     // Check for quick date options
   99 |     await expect(page.locator('text=Hôm nay')).toBeVisible();
  100 |     await expect(page.locator('text=Ngày mai')).toBeVisible();
  101 |     
  102 |     // Select "Hôm nay"
  103 |     await page.click('text=Hôm nay');
  104 |     
  105 |     // Check that date is selected
  106 |     await expect(dateButton).not.toHaveText('Chọn ngày thực hiện');
```