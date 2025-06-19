# Test info

- Name: Task List >> should display task progress correctly
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/task-list.spec.ts:45:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/nih/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Task List', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Điều hướng đến trang tasks
   6 |     await page.goto('/tasks');
   7 |     
   8 |     // Đợi trang load xong
   9 |     await page.waitForLoadState('networkidle');
   10 |   });
   11 |
   12 |   test('should display task list', async ({ page }) => {
   13 |     // Kiểm tra có task list hiển thị
   14 |     const taskList = page.locator('.space-y-6');
   15 |     await expect(taskList).toBeVisible();
   16 |   });
   17 |
   18 |   test('should display task cards with correct information', async ({ page }) => {
   19 |     // Kiểm tra task cards
   20 |     const taskCards = page.locator('.bg-white.rounded-xl');
   21 |     await expect(taskCards.first()).toBeVisible();
   22 |     
   23 |     // Kiểm tra mỗi card có đầy đủ thông tin
   24 |     const firstCard = taskCards.first();
   25 |     
   26 |     // Kiểm tra có tiêu đề
   27 |     const title = firstCard.locator('h3');
   28 |     await expect(title).toBeVisible();
   29 |     
   30 |     // Kiểm tra có mô tả
   31 |     const description = firstCard.locator('.text-sm.text-gray-600');
   32 |     await expect(description).toBeVisible();
   33 |     
   34 |     // Kiểm tra có thông tin ngày
   35 |     const dateInfo = firstCard.locator('svg + span').first();
   36 |     await expect(dateInfo).toBeVisible();
   37 |     
   38 |     // Kiểm tra có thông tin người làm (không phải "Không xác định")
   39 |     const userInfo = firstCard.locator('.flex.items-center.text-gray-600').last().locator('span');
   40 |     const userText = await userInfo.textContent();
   41 |     expect(userText).not.toBe('Không xác định');
   42 |     expect(userText).not.toBe('Chưa xác định');
   43 |   });
   44 |
>  45 |   test('should display task progress correctly', async ({ page }) => {
      |   ^ Error: browserType.launch: Executable doesn't exist at /Users/nih/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   46 |     // Kiểm tra progress bar
   47 |     const firstCard = page.locator('.bg-white.rounded-xl').first();
   48 |     const progressSection = firstCard.locator('.bg-gray-50.rounded-lg.p-3').last();
   49 |     
   50 |     await expect(progressSection).toBeVisible();
   51 |     
   52 |     // Kiểm tra có text "Tiến độ:"
   53 |     await expect(progressSection.locator('text=Tiến độ:')).toBeVisible();
   54 |     
   55 |     // Kiểm tra có phần trăm
   56 |     const percentage = progressSection.locator('.text-sm.font-bold.text-blue-600');
   57 |     await expect(percentage).toBeVisible();
   58 |     
   59 |     const percentageText = await percentage.textContent();
   60 |     expect(percentageText).toMatch(/\d+%/);
   61 |   });
   62 |
   63 |   test('should have hover effects on task cards', async ({ page }) => {
   64 |     const firstCard = page.locator('.bg-white.rounded-xl').first();
   65 |     
   66 |     // Hover vào card
   67 |     await firstCard.hover();
   68 |     
   69 |     // Kiểm tra có transform scale
   70 |     const transform = await firstCard.evaluate(el => 
   71 |       window.getComputedStyle(el).transform
   72 |     );
   73 |     
   74 |     // Transform không phải 'none' khi hover
   75 |     expect(transform).not.toBe('none');
   76 |   });
   77 |
   78 |   test('should be responsive on different screen sizes', async ({ page }) => {
   79 |     // Test desktop
   80 |     await page.setViewportSize({ width: 1920, height: 1080 });
   81 |     const taskCards = page.locator('.bg-white.rounded-xl');
   82 |     await expect(taskCards.first()).toBeVisible();
   83 |     
   84 |     // Test tablet
   85 |     await page.setViewportSize({ width: 768, height: 1024 });
   86 |     await expect(taskCards.first()).toBeVisible();
   87 |     
   88 |     // Test mobile
   89 |     await page.setViewportSize({ width: 375, height: 667 });
   90 |     await expect(taskCards.first()).toBeVisible();
   91 |   });
   92 |
   93 |   test('should display task groups with statistics', async ({ page }) => {
   94 |     // Kiểm tra task group header
   95 |     const groupHeader = page.locator('.flex.flex-col.sm\\:flex-row').first();
   96 |     await expect(groupHeader).toBeVisible();
   97 |     
   98 |     // Kiểm tra có tiêu đề nhóm
   99 |     const groupTitle = groupHeader.locator('h3');
  100 |     await expect(groupTitle).toBeVisible();
  101 |     
  102 |     // Kiểm tra có thống kê (Hoàn thành, Đang làm, Còn lại)
  103 |     await expect(groupHeader.locator('text=Hoàn thành:')).toBeVisible();
  104 |     await expect(groupHeader.locator('text=Đang làm:')).toBeVisible();
  105 |     await expect(groupHeader.locator('text=Còn lại:')).toBeVisible();
  106 |     
  107 |     // Kiểm tra có progress bar
  108 |     const progressBar = groupHeader.locator('.w-24.h-2.bg-gray-200');
  109 |     await expect(progressBar).toBeVisible();
  110 |   });
  111 |
  112 |   test('should handle empty state', async ({ page }) => {
  113 |     // Nếu không có tasks, kiểm tra empty state
  114 |     const taskCards = page.locator('.bg-white.rounded-xl');
  115 |     const cardCount = await taskCards.count();
  116 |     
  117 |     if (cardCount === 0) {
  118 |       // Kiểm tra empty state message
  119 |       const emptyState = page.locator('text=Không có công việc nào');
  120 |       await expect(emptyState).toBeVisible();
  121 |     }
  122 |   });
  123 |
  124 |   test('should display task type badges correctly', async ({ page }) => {
  125 |     const firstCard = page.locator('.bg-white.rounded-xl').first();
  126 |     
  127 |     // Kiểm tra có badge loại công việc
  128 |     const typeBadge = firstCard.locator('.mb-2.flex.items-center.justify-between').first().locator('span').first();
  129 |     await expect(typeBadge).toBeVisible();
  130 |     
  131 |     // Badge phải có màu sắc (background color)
  132 |     const backgroundColor = await typeBadge.evaluate(el => 
  133 |       window.getComputedStyle(el).backgroundColor
  134 |     );
  135 |     expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  136 |   });
  137 | });
  138 |
```