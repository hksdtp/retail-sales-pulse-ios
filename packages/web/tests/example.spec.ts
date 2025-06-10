import { test, expect } from '@playwright/test';

test('basic playwright setup test', async ({ page }) => {
  // Test cơ bản để kiểm tra Playwright hoạt động
  await page.goto('https://example.com');

  // Kiểm tra title
  await expect(page).toHaveTitle(/Example Domain/);

  // Kiểm tra có heading
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Example Domain');
});

test('retail sales app homepage test', async ({ page }) => {
  // Test ứng dụng retail sales của chúng ta
  await page.goto('http://localhost:8088/');

  // Kiểm tra trang load thành công
  await expect(page).toHaveURL(/localhost:8088/);

  // Chờ một chút để trang load hoàn toàn
  await page.waitForTimeout(2000);

  // Kiểm tra trang có load thành công
  await expect(page).not.toHaveTitle(/Error/);
});
