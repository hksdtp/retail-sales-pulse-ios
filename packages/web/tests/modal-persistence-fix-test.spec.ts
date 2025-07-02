import { test, expect } from '@playwright/test';

test.describe('Modal Persistence Fix Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:8088');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Admin login should NOT show password change modal', async ({ page }) => {
    console.log('🧪 Testing admin login - should bypass modal...');

    // Select admin user
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Khổng Đức MạnhTrưởng phòng kinh doanh');
    await page.waitForTimeout(1000);

    // Enter admin password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');

    // Click login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Check result
    const currentUrl = page.url();
    const isModalVisible = await page.locator('[data-testid="change-password-modal"]').isVisible().catch(() => false);
    
    console.log('Admin login result:', {
      currentUrl: currentUrl,
      modalVisible: isModalVisible,
      expectedBehavior: 'Should login directly without password change modal'
    });

    // Admin should not see password change modal
    expect(isModalVisible).toBe(false);
    
    // Should be redirected to main app
    expect(currentUrl).not.toBe('http://localhost:8088/login');
    
    console.log('✅ Admin login works correctly - no modal shown');
  });

  test('First-time user login should show modal with correct user name', async ({ page }) => {
    console.log('🧪 Testing first-time user login - should show modal with user name...');

    // Select first-time user
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Hà Nội');
    await page.waitForTimeout(1000);

    const teamSelect = page.locator('select').nth(1);
    await teamSelect.selectOption('NHÓM 1 - Lương Việt Anh');
    await page.waitForTimeout(1000);

    const userSelect = page.locator('select').nth(2);
    await userSelect.selectOption('Lương Việt Anh');
    await page.waitForTimeout(1000);

    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');

    // Click login
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Check if modal appears
    const modal = page.locator('[data-testid="change-password-modal"]');
    const isModalVisible = await modal.isVisible().catch(() => false);
    
    console.log('First-time login result:', {
      modalVisible: isModalVisible,
      currentUrl: page.url()
    });

    expect(isModalVisible).toBe(true);

    // Check if user name is displayed correctly
    const userNameText = await page.locator('text=Xin chào').textContent();
    console.log('User name display:', userNameText);
    
    expect(userNameText).toContain('Lương Việt Anh');
    
    console.log('✅ First-time login shows modal with correct user name');
  });

  test('Modal should NOT reappear after successful password change', async ({ page }) => {
    console.log('🧪 Testing modal persistence after password change...');

    // Login as first-time user
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Hà Nội');
    await page.waitForTimeout(1000);

    const teamSelect = page.locator('select').nth(1);
    await teamSelect.selectOption('NHÓM 1 - Lương Việt Anh');
    await page.waitForTimeout(1000);

    const userSelect = page.locator('select').nth(2);
    await userSelect.selectOption('Lương Việt Anh');
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('123456');

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Verify modal appears
    const modal = page.locator('[data-testid="change-password-modal"]');
    const isModalVisible = await modal.isVisible().catch(() => false);
    expect(isModalVisible).toBe(true);

    // Change password
    const newPasswordInput = page.locator('input[placeholder*="mật khẩu mới"], input[placeholder*="Nhập mật khẩu mới"]').first();
    const confirmPasswordInput = page.locator('input[placeholder*="Nhập lại"], input[placeholder*="Xác nhận"]').first();
    
    await newPasswordInput.fill('newpassword123');
    await confirmPasswordInput.fill('newpassword123');
    await page.waitForTimeout(1000);

    // Submit password change
    const submitButton = page.locator('[data-testid="submit-password-change-button"], button:has-text("Đổi mật khẩu")').first();
    await submitButton.click({ force: true });
    await page.waitForTimeout(3000);

    // Check if modal closed
    const isModalStillVisible = await modal.isVisible().catch(() => false);
    console.log('After password change - modal still visible:', isModalStillVisible);
    
    // Modal should be closed
    expect(isModalStillVisible).toBe(false);

    // Now refresh the page to test persistence
    console.log('🔄 Refreshing page to test modal persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check if modal reappears after refresh
    const isModalVisibleAfterRefresh = await modal.isVisible().catch(() => false);
    console.log('After refresh - modal visible:', isModalVisibleAfterRefresh);
    
    // Modal should NOT reappear after refresh
    expect(isModalVisibleAfterRefresh).toBe(false);

    console.log('✅ Modal does not reappear after successful password change and refresh');
  });

  test('Modal should NOT appear when navigating back/forward', async ({ page }) => {
    console.log('🧪 Testing modal behavior with navigation...');

    // First, complete a password change (simulate user who already changed password)
    // We'll use admin login to simulate a user who doesn't need password change
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('Khổng Đức MạnhTrưởng phòng kinh doanh');
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Should be in main app now
    const currentUrl = page.url();
    expect(currentUrl).not.toBe('http://localhost:8088/login');

    // Navigate back to login page
    console.log('🔄 Navigating back to login page...');
    await page.goBack();
    await page.waitForTimeout(2000);

    // Check if modal appears (it shouldn't)
    const modal = page.locator('[data-testid="change-password-modal"]');
    const isModalVisible = await modal.isVisible().catch(() => false);
    console.log('After navigation back - modal visible:', isModalVisible);
    
    expect(isModalVisible).toBe(false);

    // Navigate forward again
    console.log('🔄 Navigating forward...');
    await page.goForward();
    await page.waitForTimeout(2000);

    // Check if modal appears (it shouldn't)
    const isModalVisibleAfterForward = await modal.isVisible().catch(() => false);
    console.log('After navigation forward - modal visible:', isModalVisibleAfterForward);
    
    expect(isModalVisibleAfterForward).toBe(false);

    console.log('✅ Modal does not appear during navigation');
  });

  test('Clear localStorage and verify clean state', async ({ page }) => {
    console.log('🧪 Testing clean state after localStorage clear...');

    // Clear localStorage to simulate fresh start
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should be on login page
    expect(page.url()).toBe('http://localhost:8088/login');

    // Check if modal appears (it shouldn't on clean state)
    const modal = page.locator('[data-testid="change-password-modal"]');
    const isModalVisible = await modal.isVisible().catch(() => false);
    console.log('Clean state - modal visible:', isModalVisible);
    
    expect(isModalVisible).toBe(false);

    console.log('✅ Clean state works correctly - no modal on fresh start');
  });
});
