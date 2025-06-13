import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Check', () => {
  const pages = [
    { path: '/', name: 'Tasks Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/calendar', name: 'Calendar' },
    { path: '/plans', name: 'Plans' },
    { path: '/reports', name: 'Reports' },
    { path: '/employees', name: 'Employees' },
  ];

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 10000 });
  });

  for (const pageInfo of pages) {
    test(`Theme toggle works on ${pageInfo.name}`, async ({ page }) => {
      // Navigate to the page
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // Check if theme toggle button exists
      const themeToggle = page.locator('button[title*="Chuyển sang chế độ"]');
      await expect(themeToggle).toBeVisible();

      // Get initial theme
      const htmlElement = page.locator('html');
      const initialClasses = await htmlElement.getAttribute('class');
      const isDarkInitially = initialClasses?.includes('dark') || false;

      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      // Check if theme changed
      const newClasses = await htmlElement.getAttribute('class');
      const isDarkAfterClick = newClasses?.includes('dark') || false;

      // Verify theme actually changed
      expect(isDarkAfterClick).toBe(!isDarkInitially);

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `test-results/theme-${pageInfo.name.toLowerCase().replace(' ', '-')}-${isDarkAfterClick ? 'dark' : 'light'}.png`,
        fullPage: true 
      });

      // Click again to toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Verify it toggles back
      const finalClasses = await htmlElement.getAttribute('class');
      const isDarkFinal = finalClasses?.includes('dark') || false;
      expect(isDarkFinal).toBe(isDarkInitially);

      console.log(`✅ ${pageInfo.name}: Theme toggle working correctly`);
    });
  }

  test('Theme persists across page navigation', async ({ page }) => {
    // Start on dashboard
    await page.goto('/dashboard');
    
    // Toggle to dark mode
    const themeToggle = page.locator('button[title*="Chuyển sang chế độ"]');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify dark mode
    let htmlClasses = await page.locator('html').getAttribute('class');
    expect(htmlClasses).toContain('dark');

    // Navigate to different pages and check theme persists
    for (const pageInfo of pages.slice(0, 3)) { // Test first 3 pages
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      htmlClasses = await page.locator('html').getAttribute('class');
      expect(htmlClasses).toContain('dark');
      console.log(`✅ ${pageInfo.name}: Dark theme persisted`);
    }

    // Toggle back to light mode
    await page.goto('/dashboard');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Verify light mode persists
    for (const pageInfo of pages.slice(0, 3)) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      htmlClasses = await page.locator('html').getAttribute('class');
      expect(htmlClasses).not.toContain('dark');
      console.log(`✅ ${pageInfo.name}: Light theme persisted`);
    }
  });

  test('Theme toggle accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    const themeToggle = page.locator('button[title*="Chuyển sang chế độ"]');
    
    // Check accessibility attributes
    await expect(themeToggle).toHaveAttribute('title');
    
    // Check keyboard navigation
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();
    
    // Test keyboard activation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Verify theme changed via keyboard
    const htmlClasses = await page.locator('html').getAttribute('class');
    expect(htmlClasses).toContain('dark');
    
    console.log('✅ Theme toggle is keyboard accessible');
  });
});
