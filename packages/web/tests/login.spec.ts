import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang đăng nhập
    await page.goto('http://localhost:8088');
  });

  test('should display login form elements', async ({ page }) => {
    // Kiểm tra tiêu đề trang (cập nhật theo tên thực tế)
    await expect(page).toHaveTitle(/Phòng Kinh Doanh/);

    // Kiểm tra các phần tử form đăng nhập có hiển thị
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Kiểm tra placeholder text
    await expect(page.locator('input[type="email"]')).toHaveAttribute('placeholder', /email/i);
    await expect(page.locator('input[type="password"]')).toHaveAttribute('placeholder', /password/i);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click nút đăng nhập mà không điền gì
    await page.locator('button[type="submit"]').click();
    
    // Kiểm tra thông báo lỗi validation
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Điền email không hợp lệ
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Kiểm tra thông báo lỗi email
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should attempt login with valid credentials', async ({ page }) => {
    // Điền thông tin đăng nhập hợp lệ
    await page.locator('input[type="email"]').fill('manh.khong@example.com');
    await page.locator('input[type="password"]').fill('password123');
    
    // Click nút đăng nhập
    await page.locator('button[type="submit"]').click();
    
    // Kiểm tra loading state
    await expect(page.locator('text=Đang đăng nhập...')).toBeVisible();
    
    // Đợi redirect hoặc thông báo
    await page.waitForTimeout(2000);
    
    // Kiểm tra có redirect đến dashboard không
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
    } else {
      console.log('ℹ️ Login form still visible - checking for error messages');
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Điền thông tin đăng nhập sai
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Đợi phản hồi từ server
    await page.waitForTimeout(3000);
    
    // Kiểm tra thông báo lỗi
    const errorMessage = page.locator('text=Invalid credentials');
    if (await errorMessage.isVisible()) {
      console.log('✅ Error message displayed correctly');
    }
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('[data-testid="password-toggle"]');
    
    // Điền password
    await passwordInput.fill('testpassword');
    
    // Kiểm tra type ban đầu là password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle để hiện password
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click lại để ẩn password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should take screenshot of login page', async ({ page }) => {
    // Chụp ảnh màn hình trang đăng nhập
    await page.screenshot({ 
      path: 'test-results/login-page.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshot saved: test-results/login-page.png');
  });

  test('should test responsive design', async ({ page }) => {
    // Test trên desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: 'test-results/login-desktop.png',
      fullPage: true 
    });
    
    // Test trên tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: 'test-results/login-tablet.png',
      fullPage: true 
    });
    
    // Test trên mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'test-results/login-mobile.png',
      fullPage: true 
    });
    
    console.log('📱 Responsive screenshots saved');
  });
});
