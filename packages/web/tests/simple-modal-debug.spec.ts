import { test, expect } from '@playwright/test';

test.describe('Simple Modal Debug', () => {
  test('Debug modal state after refresh', async ({ page }) => {
    console.log('🧪 Testing modal state after refresh...');

    // Navigate to login page
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');

    // Simulate user that needs password change in localStorage
    await page.evaluate(() => {
      const mockUser = {
        id: 'user_viet_anh',
        name: 'Lương Việt Anh',
        email: 'vietanh.luong@example.com',
        role: 'team_leader',
        team_id: '1',
        location: 'Hà Nội',
        password_changed: false  // This should trigger password change modal
      };
      
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock_token_123');
      localStorage.setItem('loginType', 'mock');
      
      console.log('💾 Set localStorage with user needing password change');
    });

    // Refresh page to trigger session restore
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for React to process
    await page.waitForTimeout(3000);

    // Debug: Check auth context state
    const authState = await page.evaluate(() => {
      return {
        currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
        authToken: localStorage.getItem('authToken'),
        // Try to access React context state
        windowAuthState: (window as any).authState || 'not available'
      };
    });
    console.log('🔍 Auth state after refresh:', authState);

    // Check if modal is visible
    const modalSelectors = [
      '.fixed.inset-0.bg-black.bg-opacity-50',
      '[data-testid="change-password-modal"]',
      'div:has-text("Đổi mật khẩu")',
      'div:has-text("Bắt buộc đổi mật khẩu")'
    ];

    let modalFound = false;
    for (const selector of modalSelectors) {
      const isVisible = await page.locator(selector).isVisible().catch(() => false);
      console.log(`Modal selector "${selector}": ${isVisible}`);
      if (isVisible) {
        modalFound = true;
        break;
      }
    }

    console.log('🔍 Modal found:', modalFound);

    // Check current URL
    const currentUrl = page.url();
    console.log('🔍 Current URL:', currentUrl);

    // Check if we're redirected to login or main app
    if (currentUrl.includes('/login')) {
      console.log('📍 Still on login page - checking login form state');
      
      // Check if login form is visible
      const loginFormVisible = await page.locator('form').isVisible().catch(() => false);
      console.log('Login form visible:', loginFormVisible);
      
    } else {
      console.log('📍 Redirected to main app - checking for modal');
      
      // Look for any modal or overlay
      const overlays = await page.locator('.fixed, .absolute, [role="dialog"]').count();
      console.log('Number of overlay elements:', overlays);
    }

    // Try to find any password-related elements
    const passwordElements = await page.locator('input[type="password"], *:has-text("mật khẩu"), *:has-text("password")').count();
    console.log('Password-related elements found:', passwordElements);

    // Check console logs for any errors
    const logs = await page.evaluate(() => {
      // Try to get any stored console logs
      return (window as any).consoleLogs || [];
    });
    console.log('Browser console logs:', logs);
  });

  test('Debug direct modal trigger', async ({ page }) => {
    console.log('🧪 Testing direct modal trigger...');

    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');

    // Directly trigger modal via JavaScript
    await page.evaluate(() => {
      // Try to trigger modal directly
      const event = new CustomEvent('showPasswordChangeModal', {
        detail: { 
          userName: 'Test User',
          isFirstLogin: true 
        }
      });
      window.dispatchEvent(event);
    });

    await page.waitForTimeout(1000);

    // Check if modal appeared
    const modalVisible = await page.locator('.fixed.inset-0').isVisible().catch(() => false);
    console.log('Modal visible after direct trigger:', modalVisible);

    // Check DOM structure
    const bodyHTML = await page.locator('body').innerHTML();
    const hasModal = bodyHTML.includes('Đổi mật khẩu') || bodyHTML.includes('password');
    console.log('Modal content found in DOM:', hasModal);
  });

  test('Debug authentication flow step by step', async ({ page }) => {
    console.log('🧪 Testing authentication flow step by step...');

    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');

    // Step 1: Check initial state
    console.log('Step 1: Checking initial state...');
    const initialState = await page.evaluate(() => ({
      hasCurrentUser: !!localStorage.getItem('currentUser'),
      hasAuthToken: !!localStorage.getItem('authToken'),
      url: window.location.href
    }));
    console.log('Initial state:', initialState);

    // Step 2: Set user that needs password change
    console.log('Step 2: Setting user that needs password change...');
    await page.evaluate(() => {
      const user = {
        id: 'test_user',
        name: 'Test User',
        email: 'test@example.com',
        password_changed: false
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', 'test_token');
    });

    // Step 3: Trigger auth context refresh
    console.log('Step 3: Triggering auth context refresh...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 4: Check final state
    console.log('Step 4: Checking final state...');
    const finalState = await page.evaluate(() => ({
      currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
      url: window.location.href,
      bodyContent: document.body.textContent?.includes('Đổi mật khẩu') || false
    }));
    console.log('Final state:', finalState);

    // Step 5: Look for any React error boundaries or errors
    const hasErrors = await page.locator('*:has-text("Error"), *:has-text("Something went wrong")').count();
    console.log('React errors found:', hasErrors);
  });
});
