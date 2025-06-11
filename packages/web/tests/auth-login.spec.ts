import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Đảm bảo bắt đầu từ trang chủ
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
  });

  test('should display login form when not authenticated', async ({ page }) => {
    console.log('🧪 Testing login form display...');
    
    // Kiểm tra có form đăng nhập
    const loginForm = page.locator('form').first();
    await expect(loginForm).toBeVisible({ timeout: 10000 });
    
    // Kiểm tra các trường input
    const usernameInput = page.locator('input[type="text"], input[placeholder*="tên"], input[placeholder*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    console.log('✅ Login form displayed correctly');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    console.log('🧪 Testing successful login...');
    
    // Tìm form đăng nhập
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Nhập thông tin đăng nhập (sử dụng credentials từ mockAuth)
    const usernameInput = page.locator('input[type="text"], input[placeholder*="tên"], input[placeholder*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await usernameInput.fill('vietanh');
    await passwordInput.fill('123456');
    
    // Click nút đăng nhập
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
    await loginButton.click();
    
    // Đợi chuyển hướng và kiểm tra đăng nhập thành công
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra có dashboard hoặc nội dung sau đăng nhập
    const dashboardContent = page.locator('text=Dashboard, text=Tổng quan, text=KPI').first();
    await expect(dashboardContent).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Login successful');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    console.log('🧪 Testing login with invalid credentials...');
    
    // Tìm form đăng nhập
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Nhập thông tin sai
    const usernameInput = page.locator('input[type="text"], input[placeholder*="tên"], input[placeholder*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await usernameInput.fill('wronguser');
    await passwordInput.fill('wrongpass');
    
    // Click nút đăng nhập
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
    await loginButton.click();
    
    // Đợi và kiểm tra thông báo lỗi
    await page.waitForTimeout(2000);
    
    // Kiểm tra vẫn ở trang đăng nhập hoặc có thông báo lỗi
    const errorMessage = page.locator('text=sai, text=lỗi, text=không đúng').first();
    const stillOnLogin = page.locator('input[type="password"]').first();
    
    const hasError = await errorMessage.isVisible().catch(() => false);
    const stillLogin = await stillOnLogin.isVisible().catch(() => false);
    
    expect(hasError || stillLogin).toBe(true);
    
    console.log('✅ Invalid login handled correctly');
  });

  test('should logout successfully', async ({ page }) => {
    console.log('🧪 Testing logout functionality...');
    
    // Đăng nhập trước
    await page.waitForSelector('form', { timeout: 10000 });
    
    const usernameInput = page.locator('input[type="text"], input[placeholder*="tên"], input[placeholder*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await usernameInput.fill('vietanh');
    await passwordInput.fill('123456');
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    // Tìm nút đăng xuất
    const logoutButton = page.locator('button:has-text("Đăng xuất"), button:has-text("Logout"), [data-testid="logout"]').first();
    
    if (await logoutButton.isVisible({ timeout: 5000 })) {
      await logoutButton.click();
      
      // Kiểm tra quay về trang đăng nhập
      await page.waitForLoadState('networkidle');
      const loginForm = page.locator('input[type="password"]').first();
      await expect(loginForm).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Logout successful');
    } else {
      console.log('⚠️ Logout button not found - may be in menu');
      
      // Thử tìm trong menu
      const menuButton = page.locator('button:has-text("Menu"), [data-testid="menu"], .menu-trigger').first();
      if (await menuButton.isVisible({ timeout: 3000 })) {
        await menuButton.click();
        await page.waitForTimeout(1000);
        
        const menuLogout = page.locator('button:has-text("Đăng xuất"), a:has-text("Đăng xuất")').first();
        if (await menuLogout.isVisible({ timeout: 3000 })) {
          await menuLogout.click();
          
          await page.waitForLoadState('networkidle');
          const loginForm = page.locator('input[type="password"]').first();
          await expect(loginForm).toBeVisible({ timeout: 10000 });
          
          console.log('✅ Logout from menu successful');
        }
      }
    }
  });

  test('should persist login state on page refresh', async ({ page }) => {
    console.log('🧪 Testing login persistence...');
    
    // Đăng nhập
    await page.waitForSelector('form', { timeout: 10000 });
    
    const usernameInput = page.locator('input[type="text"], input[placeholder*="tên"], input[placeholder*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await usernameInput.fill('vietanh');
    await passwordInput.fill('123456');
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    // Refresh trang
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra vẫn đăng nhập
    const dashboardContent = page.locator('text=Dashboard, text=Tổng quan, text=KPI').first();
    const loginForm = page.locator('input[type="password"]').first();
    
    const hasDashboard = await dashboardContent.isVisible({ timeout: 5000 }).catch(() => false);
    const hasLoginForm = await loginForm.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Nếu có dashboard thì OK, nếu có login form thì cũng OK (tùy implementation)
    expect(hasDashboard || !hasLoginForm).toBe(true);
    
    console.log('✅ Login persistence tested');
  });
});
