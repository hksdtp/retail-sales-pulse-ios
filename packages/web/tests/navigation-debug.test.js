// Debug test to understand navigation structure
import { test, expect } from '@playwright/test';

test.describe('Navigation Debug', () => {
  test('should debug navigation structure', async ({ page }) => {
    console.log('🔍 Starting navigation debug...');
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Auto login
    await page.evaluate(() => {
      const userData = {
        id: 'user-001',
        name: 'Khổng Đức Mạnh',
        email: 'manh@company.com',
        role: 'director',
        team: 'Phòng Kinh Doanh',
        location: 'Hà Nội'
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    // Log all visible text on page
    const allText = await page.locator('body').textContent();
    console.log('📄 Page content:', allText?.substring(0, 500));
    
    // Find all navigation elements
    const navElements = await page.locator('nav, [role="navigation"], .sidebar, .menu').all();
    console.log(`🧭 Found ${navElements.length} navigation elements`);
    
    // Find all links
    const links = await page.locator('a').all();
    console.log(`🔗 Found ${links.length} links`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      console.log(`Link ${i}: "${text}" -> ${href}`);
    }
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const title = await buttons[i].getAttribute('title');
      console.log(`Button ${i}: "${text}" (title: ${title})`);
    }
    
    // Look for task-related elements
    const taskElements = await page.locator('*:has-text("task"), *:has-text("Task"), *:has-text("công việc"), *:has-text("Công việc")').all();
    console.log(`📋 Found ${taskElements.length} task-related elements`);
    
    for (let i = 0; i < Math.min(taskElements.length, 5); i++) {
      const text = await taskElements[i].textContent();
      const tagName = await taskElements[i].evaluate(el => el.tagName);
      console.log(`Task element ${i}: <${tagName}> "${text?.substring(0, 50)}"`);
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);
    
    // Try to find and click task navigation
    try {
      const taskNav = page.locator('text=Công việc').first();
      if (await taskNav.isVisible()) {
        console.log('✅ Found "Công việc" navigation');
        await taskNav.click();
        await page.waitForTimeout(2000);
        
        const newUrl = page.url();
        console.log(`🌐 New URL after click: ${newUrl}`);
        
        // Take screenshot after navigation
        await page.screenshot({ path: 'debug-after-nav.png', fullPage: true });
      } else {
        console.log('❌ "Công việc" navigation not visible');
      }
    } catch (error) {
      console.log(`❌ Error clicking navigation: ${error.message}`);
    }
    
    console.log('🔍 Navigation debug completed');
  });
});
