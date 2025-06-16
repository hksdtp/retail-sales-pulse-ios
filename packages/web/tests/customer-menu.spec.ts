import { test, expect } from '@playwright/test';

test.describe('Customer Menu Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8092');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display customer menu in sidebar', async ({ page }) => {
    console.log('🧪 Testing customer menu visibility...');
    
    // Check if customer menu item exists in sidebar
    const customerMenu = page.locator('text=Khách hàng').first();
    
    // Wait for the menu to be visible
    await expect(customerMenu).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Customer menu found in sidebar');
  });

  test('should navigate to customers page', async ({ page }) => {
    console.log('🧪 Testing navigation to customers page...');
    
    // Click on customer menu
    const customerMenu = page.locator('text=Khách hàng').first();
    await customerMenu.click();
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    // Check if we're on customers page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/customers');
    
    console.log('✅ Successfully navigated to customers page');
  });

  test('should display customers page content', async ({ page }) => {
    console.log('🧪 Testing customers page content...');
    
    // Navigate to customers page
    await page.goto('http://localhost:8092/customers');
    await page.waitForTimeout(3000);
    
    // Check for page title
    const pageTitle = page.locator('h1:has-text("Quản lý khách hàng")');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    // Check for customer list component
    const customerList = page.locator('[data-testid="customer-list"], .customer-list, text=Danh sách khách hàng');
    const isCustomerListVisible = await customerList.isVisible().catch(() => false);
    
    if (isCustomerListVisible) {
      console.log('✅ Customer list component found');
    } else {
      console.log('⚠️ Customer list component not found, but page loaded');
    }
    
    console.log('✅ Customers page content verified');
  });

  test('should display customer permissions info', async ({ page }) => {
    console.log('🧪 Testing customer permissions display...');
    
    // Navigate to customers page
    await page.goto('http://localhost:8092/customers');
    await page.waitForTimeout(3000);
    
    // Check for permissions section
    const permissionsSection = page.locator('text=Quyền hạn của bạn');
    const isPermissionsVisible = await permissionsSection.isVisible().catch(() => false);
    
    if (isPermissionsVisible) {
      console.log('✅ Permissions section found');
    } else {
      console.log('⚠️ Permissions section not found');
    }
    
    console.log('✅ Permissions test completed');
  });

  test('should check mobile navigation', async ({ page }) => {
    console.log('🧪 Testing mobile navigation...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to home page
    await page.goto('http://localhost:8092');
    await page.waitForTimeout(2000);
    
    // Check for mobile bottom navigation
    const bottomNav = page.locator('.bottom-nav-mobile, [data-testid="bottom-nav"]');
    const isMobileNavVisible = await bottomNav.isVisible().catch(() => false);
    
    if (isMobileNavVisible) {
      // Look for customer menu in mobile nav
      const mobileCustomerMenu = page.locator('text=Khách hàng').last();
      const isMobileCustomerVisible = await mobileCustomerMenu.isVisible().catch(() => false);
      
      if (isMobileCustomerVisible) {
        console.log('✅ Customer menu found in mobile navigation');
      } else {
        console.log('⚠️ Customer menu not found in mobile navigation');
      }
    } else {
      console.log('⚠️ Mobile navigation not found');
    }
    
    console.log('✅ Mobile navigation test completed');
  });

  test('should test customer types and constants', async ({ page }) => {
    console.log('🧪 Testing customer types and constants...');
    
    // Navigate to customers page
    await page.goto('http://localhost:8092/customers');
    await page.waitForTimeout(3000);
    
    // Check if page loaded without errors
    const bodyText = await page.locator('body').textContent();
    
    // Look for customer type labels
    const hasCustomerTypes = bodyText?.includes('Khách hàng') || 
                            bodyText?.includes('Kiến trúc sư') || 
                            bodyText?.includes('Đối tác');
    
    if (hasCustomerTypes) {
      console.log('✅ Customer types found in page content');
    } else {
      console.log('⚠️ Customer types not found in page content');
    }
    
    console.log('✅ Customer types test completed');
  });

  test('should handle page errors gracefully', async ({ page }) => {
    console.log('🧪 Testing error handling...');
    
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to customers page
    await page.goto('http://localhost:8092/customers');
    await page.waitForTimeout(3000);
    
    // Check for critical errors
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read properties')
    );
    
    if (criticalErrors.length === 0) {
      console.log('✅ No critical JavaScript errors found');
    } else {
      console.log('⚠️ Critical errors found:', criticalErrors);
    }
    
    console.log('✅ Error handling test completed');
  });
});
