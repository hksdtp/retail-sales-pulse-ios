# Test info

- Name: retail sales app homepage test
- Location: /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/example.spec.ts:16:1

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:8088/", waiting until "load"

    at /Users/nihdev/Sale bán lẻ/retail-sales-pulse-ios/packages/web/tests/example.spec.ts:18:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('basic playwright setup test', async ({ page }) => {
   4 |   // Test cơ bản để kiểm tra Playwright hoạt động
   5 |   await page.goto('https://example.com');
   6 |
   7 |   // Kiểm tra title
   8 |   await expect(page).toHaveTitle(/Example Domain/);
   9 |
  10 |   // Kiểm tra có heading
  11 |   const heading = page.locator('h1');
  12 |   await expect(heading).toBeVisible();
  13 |   await expect(heading).toHaveText('Example Domain');
  14 | });
  15 |
  16 | test('retail sales app homepage test', async ({ page }) => {
  17 |   // Test ứng dụng retail sales của chúng ta
> 18 |   await page.goto('http://localhost:8088/');
     |              ^ Error: page.goto: Target page, context or browser has been closed
  19 |
  20 |   // Kiểm tra trang load thành công
  21 |   await expect(page).toHaveURL(/localhost:8088/);
  22 |
  23 |   // Chờ một chút để trang load hoàn toàn
  24 |   await page.waitForTimeout(2000);
  25 |
  26 |   // Kiểm tra trang có load thành công
  27 |   await expect(page).not.toHaveTitle(/Error/);
  28 | });
  29 |
```