import { test, expect } from '@playwright/test';

test.describe('Password Change Modal Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:8088');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Debug first-time login flow with password change modal', async ({ page }) => {
    console.log('🧪 Starting first-time login test...');

    // Step 1: Select location (Hà Nội)
    console.log('📍 Step 1: Selecting location...');
    await page.selectOption('select', { label: 'Hà Nội' });
    await page.waitForTimeout(1000);

    // Step 2: Select team (NHÓM 1)
    console.log('👥 Step 2: Selecting team...');
    const teamSelect = page.locator('select').nth(1);
    await teamSelect.selectOption({ label: /NHÓM 1.*Lương Việt Anh/ });
    await page.waitForTimeout(1000);

    // Step 3: Select user (Lương Việt Anh)
    console.log('👤 Step 3: Selecting user...');
    const userSelect = page.locator('select').nth(2);
    await userSelect.selectOption({ label: 'Lương Việt Anh' });
    await page.waitForTimeout(1000);

    // Step 4: Enter password
    console.log('🔐 Step 4: Entering password...');
    await page.fill('input[type="password"]', '123456');

    // Step 5: Click login button
    console.log('🚀 Step 5: Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for login to process
    await page.waitForTimeout(3000);

    // Debug: Check console logs
    console.log('📋 Checking console logs...');
    const logs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    console.log('Console logs:', logs);

    // Debug: Check if modal is present
    console.log('🔍 Checking if password change modal is present...');
    const modal = page.locator('[data-testid="change-password-modal"], .fixed.inset-0.bg-black.bg-opacity-50');
    const isModalVisible = await modal.isVisible().catch(() => false);
    console.log('Modal visible:', isModalVisible);

    if (isModalVisible) {
      console.log('✅ Modal is visible, testing modal functionality...');
      
      // Check modal content
      const modalTitle = await page.locator('h2').textContent();
      console.log('Modal title:', modalTitle);

      // Test password input fields
      console.log('🔐 Testing password input fields...');
      const newPasswordInput = page.locator('input[placeholder*="mật khẩu mới"], input[placeholder*="Nhập mật khẩu mới"]');
      const confirmPasswordInput = page.locator('input[placeholder*="Nhập lại"], input[placeholder*="Xác nhận"]');
      
      await newPasswordInput.fill('newpassword123');
      await confirmPasswordInput.fill('newpassword123');
      
      // Wait for validation
      await page.waitForTimeout(1000);

      // Check if submit button is enabled
      const submitButton = page.locator('button[type="submit"], button:has-text("Đổi mật khẩu")');
      const isSubmitEnabled = await submitButton.isEnabled();
      console.log('Submit button enabled:', isSubmitEnabled);

      if (isSubmitEnabled) {
        console.log('🔄 Clicking submit button...');
        await submitButton.click();
        
        // Wait for submission
        await page.waitForTimeout(3000);
        
        // Check if modal closed
        const isModalStillVisible = await modal.isVisible().catch(() => false);
        console.log('Modal still visible after submit:', isModalStillVisible);
        
        // Check if redirected to main app
        const currentUrl = page.url();
        console.log('Current URL after submit:', currentUrl);
      } else {
        console.log('❌ Submit button is disabled');
        
        // Debug validation requirements
        const requirements = await page.locator('.text-red-800, .text-green-800, [class*="CheckCircle"], [class*="XCircle"]').allTextContents();
        console.log('Validation requirements:', requirements);
      }

      // Test cancel button
      console.log('🚫 Testing cancel button...');
      const cancelButton = page.locator('button:has-text("Hủy")');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);
      console.log('Cancel button visible:', isCancelVisible);
      
      if (isCancelVisible) {
        await cancelButton.click();
        await page.waitForTimeout(1000);
        
        const isModalClosedAfterCancel = await modal.isVisible().catch(() => false);
        console.log('Modal closed after cancel:', !isModalClosedAfterCancel);
      }

    } else {
      console.log('❌ Modal is not visible');
      
      // Debug: Check current page state
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
      
      // Check if user is logged in
      const isLoggedIn = await page.locator('body').evaluate(() => {
        return !!(window as any).currentUser;
      });
      console.log('User logged in:', isLoggedIn);
      
      // Check auth context state
      const authState = await page.evaluate(() => {
        return {
          currentUser: (window as any).currentUser,
          isFirstLogin: (window as any).isFirstLogin,
          requirePasswordChange: (window as any).requirePasswordChange
        };
      });
      console.log('Auth state:', authState);
    }
  });

  test('Debug admin login with Haininh1 password', async ({ page }) => {
    console.log('🧪 Testing admin login...');

    // Select Khổng Đức Mạnh
    await page.selectOption('select', { label: 'Khổng Đức Mạnh' });
    await page.waitForTimeout(1000);

    // Enter admin password
    await page.fill('input[type="password"]', 'Haininh1');

    // Click login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check if logged in successfully
    const currentUrl = page.url();
    console.log('Admin login - Current URL:', currentUrl);

    const isModalVisible = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').isVisible().catch(() => false);
    console.log('Admin login - Modal visible:', isModalVisible);
  });

  test('Debug admin login with 123456 password', async ({ page }) => {
    console.log('🧪 Testing admin login with default password...');

    // Select Khổng Đức Mạnh
    await page.selectOption('select', { label: 'Khổng Đức Mạnh' });
    await page.waitForTimeout(1000);

    // Enter default password
    await page.fill('input[type="password"]', '123456');

    // Click login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check result
    const currentUrl = page.url();
    console.log('Admin default password - Current URL:', currentUrl);

    const isModalVisible = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').isVisible().catch(() => false);
    console.log('Admin default password - Modal visible:', isModalVisible);
  });

  test('Debug page refresh with pending password change', async ({ page }) => {
    console.log('🧪 Testing page refresh scenario...');

    // First, simulate a user that needs password change
    await page.evaluate(() => {
      // Simulate user in localStorage that needs password change
      const mockUser = {
        id: 'user_viet_anh',
        name: 'Lương Việt Anh',
        email: 'vietanh.luong@example.com',
        role: 'team_leader',
        team_id: '1',
        location: 'Hà Nội',
        password_changed: false
      };
      
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock_token_123');
      localStorage.setItem('loginType', 'mock');
    });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if modal opens automatically
    const isModalVisible = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').isVisible().catch(() => false);
    console.log('After refresh - Modal visible:', isModalVisible);

    // Check auth state
    const authState = await page.evaluate(() => {
      return {
        currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
        authToken: localStorage.getItem('authToken'),
        isFirstLogin: (window as any).isFirstLogin,
        requirePasswordChange: (window as any).requirePasswordChange
      };
    });
    console.log('After refresh - Auth state:', authState);
  });
});
