import { test, expect } from '@playwright/test';

test.describe('Debug Current Page', () => {
  test('should analyze current page structure', async ({ page }) => {
    console.log('🔍 Analyzing current page structure...');
    
    // Đi đến trang chủ
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Lấy title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Lấy URL hiện tại
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);
    
    // Kiểm tra có form đăng nhập không
    const forms = await page.locator('form').count();
    console.log(`📝 Number of forms: ${forms}`);
    
    // Kiểm tra có input password không
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log(`🔐 Number of password inputs: ${passwordInputs}`);
    
    // Kiểm tra có text "đăng nhập" không
    const loginTexts = await page.locator('text=đăng nhập, text=login, text=Đăng nhập').count();
    console.log(`🔑 Login text elements: ${loginTexts}`);
    
    // Kiểm tra có dashboard content không
    const dashboardElements = await page.locator('text=Dashboard, text=Tổng quan, text=KPI').count();
    console.log(`📊 Dashboard elements: ${dashboardElements}`);
    
    // Lấy tất cả text trên trang
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 Page contains "đăng nhập": ${bodyText?.includes('đăng nhập') || bodyText?.includes('Đăng nhập')}`);
    console.log(`📝 Page contains "Dashboard": ${bodyText?.includes('Dashboard')}`);
    console.log(`📝 Page contains "KPI": ${bodyText?.includes('KPI')}`);
    
    // Lấy tất cả buttons
    const buttons = await page.locator('button').count();
    console.log(`🔘 Number of buttons: ${buttons}`);
    
    // Lấy text của các buttons
    const buttonTexts = await page.locator('button').allTextContents();
    console.log(`🔘 Button texts: ${buttonTexts.join(', ')}`);
    
    // Kiểm tra có navigation không
    const navElements = await page.locator('nav, [role="navigation"]').count();
    console.log(`🧭 Navigation elements: ${navElements}`);
    
    // Kiểm tra có sidebar không
    const sidebarElements = await page.locator('[class*="sidebar"], [class*="menu"], [class*="nav"]').count();
    console.log(`📋 Sidebar/Menu elements: ${sidebarElements}`);
    
    // Chụp screenshot để debug
    await page.screenshot({ path: 'debug-current-page.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-current-page.png');
    
    // Luôn pass test này vì chỉ để debug
    expect(true).toBe(true);
  });

  test('should check authentication state', async ({ page }) => {
    console.log('🔍 Checking authentication state...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Kiểm tra localStorage cho auth state
    const authData = await page.evaluate(() => {
      return {
        currentUser: localStorage.getItem('currentUser'),
        authToken: localStorage.getItem('authToken'),
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('💾 LocalStorage auth data:', JSON.stringify(authData, null, 2));
    
    // Kiểm tra sessionStorage
    const sessionData = await page.evaluate(() => {
      return {
        allKeys: Object.keys(sessionStorage),
        sessionData: Object.fromEntries(
          Object.keys(sessionStorage).map(key => [key, sessionStorage.getItem(key)])
        )
      };
    });
    
    console.log('🗂️ SessionStorage data:', JSON.stringify(sessionData, null, 2));
    
    // Kiểm tra cookies
    const cookies = await page.context().cookies();
    console.log('🍪 Cookies:', JSON.stringify(cookies, null, 2));
    
    expect(true).toBe(true);
  });

  test('should try to find login elements with different selectors', async ({ page }) => {
    console.log('🔍 Trying different login element selectors...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Thử nhiều selector khác nhau
    const selectors = [
      'form',
      'input[type="password"]',
      'input[type="text"]',
      'input[placeholder*="tên"]',
      'input[placeholder*="user"]',
      'input[placeholder*="email"]',
      'button:has-text("Đăng nhập")',
      'button:has-text("Login")',
      'button[type="submit"]',
      '[data-testid*="login"]',
      '[class*="login"]',
      '[class*="auth"]',
      '.login-form',
      '.auth-form',
      '#login',
      '#auth'
    ];
    
    for (const selector of selectors) {
      try {
        const count = await page.locator(selector).count();
        const isVisible = count > 0 ? await page.locator(selector).first().isVisible() : false;
        console.log(`🎯 ${selector}: ${count} elements, visible: ${isVisible}`);
        
        if (count > 0 && isVisible) {
          const text = await page.locator(selector).first().textContent();
          console.log(`   Text: "${text}"`);
        }
      } catch (error) {
        console.log(`❌ ${selector}: Error - ${error.message}`);
      }
    }
    
    expect(true).toBe(true);
  });
});
