import { test, expect } from '@playwright/test';

test.describe('Debug User Auth and Button Rendering', () => {
  test('should debug user authentication and button rendering', async ({ page }) => {
    console.log('🔍 Debugging user auth and button rendering...');
    
    // Listen for console logs
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for errors
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    // Điều hướng và đăng nhập
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Đăng nhập
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    console.log('✅ Login completed');
    
    // Navigate to tasks
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(3000);
      console.log('✅ Navigated to tasks page');
    }
    
    // Debug: Check current user state
    const userState = await page.evaluate(() => {
      // Try to access React context or global state
      const reactRoot = document.querySelector('#root');
      
      // Check localStorage for user data
      const localStorageData = {
        currentUser: localStorage.getItem('currentUser'),
        authToken: localStorage.getItem('authToken'),
        userRole: localStorage.getItem('userRole')
      };
      
      // Check if there are any React components
      const hasReactComponents = !!document.querySelector('[data-reactroot]') || 
                                !!document.querySelector('[data-react-component]');
      
      return {
        localStorageData,
        hasReactComponents,
        url: window.location.href,
        title: document.title
      };
    });
    
    console.log('🔍 User state:', userState);
    
    // Debug: Check page structure
    const pageStructure = await page.evaluate(() => {
      const structure = {
        hasAppLayout: !!document.querySelector('[data-component*="AppLayout"]') || 
                     !!document.querySelector('.app-layout') ||
                     !!document.querySelector('main'),
        hasTasksHeader: !!document.querySelector('h1'),
        headerText: document.querySelector('h1')?.textContent,
        hasButtons: document.querySelectorAll('button').length,
        buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean),
        hasErrorBoundary: !!document.querySelector('[data-component*="ErrorBoundary"]'),
        hasTaskManagement: !!document.querySelector('[data-component*="TaskManagement"]'),
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main')?.innerHTML?.substring(0, 500) || 'No main content'
      };
      
      return structure;
    });
    
    console.log('🔍 Page structure:', pageStructure);
    
    // Take screenshot for debugging
    await page.screenshot({ 
      path: 'test-results/debug-user-auth-page.png',
      fullPage: true 
    });
    
    // Check if the specific button exists
    const buttonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createButton = buttons.find(btn => 
        btn.textContent?.includes('Tạo công việc') ||
        btn.textContent?.includes('Create') ||
        btn.querySelector('span')?.textContent?.includes('Tạo công việc')
      );
      
      if (createButton) {
        const rect = createButton.getBoundingClientRect();
        const styles = window.getComputedStyle(createButton);
        
        return {
          found: true,
          text: createButton.textContent,
          innerHTML: createButton.innerHTML,
          classes: createButton.className,
          visible: rect.width > 0 && rect.height > 0,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          zIndex: styles.zIndex,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        };
      }
      
      return { found: false };
    });
    
    console.log('🔍 Button analysis:', buttonExists);
    
    if (buttonExists.found) {
      console.log('✅ Button found! Attempting to click...');
      
      // Try different click methods
      const createButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
      
      try {
        // Method 1: Regular click
        await createButton.click();
        await page.waitForTimeout(2000);
        
        const dialogAfterClick = await page.locator('[data-radix-dialog-content]').isVisible();
        console.log(`Dialog visible after regular click: ${dialogAfterClick}`);
        
        if (!dialogAfterClick) {
          // Method 2: Force click
          await createButton.click({ force: true });
          await page.waitForTimeout(2000);
          
          const dialogAfterForceClick = await page.locator('[data-radix-dialog-content]').isVisible();
          console.log(`Dialog visible after force click: ${dialogAfterForceClick}`);
          
          if (!dialogAfterForceClick) {
            // Method 3: JavaScript click
            await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const createButton = buttons.find(btn => 
                btn.textContent?.includes('Tạo công việc')
              );
              if (createButton) {
                createButton.click();
              }
            });
            
            await page.waitForTimeout(2000);
            
            const dialogAfterJSClick = await page.locator('[data-radix-dialog-content]').isVisible();
            console.log(`Dialog visible after JS click: ${dialogAfterJSClick}`);
          }
        }
        
      } catch (error) {
        console.log('❌ Click error:', error.message);
      }
      
    } else {
      console.log('❌ Button not found');
      
      // Debug: Try to find any gradient buttons
      const gradientButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons
          .filter(btn => btn.className.includes('gradient'))
          .map(btn => ({
            text: btn.textContent,
            classes: btn.className,
            innerHTML: btn.innerHTML
          }));
      });
      
      console.log('🔍 Gradient buttons found:', gradientButtons);
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/debug-final-auth-state.png',
      fullPage: true 
    });
    
    console.log('🔍 Debug completed');
  });

  test('should test direct navigation to tasks', async ({ page }) => {
    console.log('🎯 Testing direct navigation to tasks...');
    
    // Direct navigation to tasks page
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Check if redirected to login
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('login') || currentUrl === 'http://localhost:8088/') {
      console.log('🔄 Redirected to login, logging in...');
      
      const emailInput = page.locator('input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('manh.khong@example.com');
        await page.locator('input[type="password"]').fill('password123');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(5000);
      }
      
      // Should now be on tasks page
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      
      if (finalUrl.includes('/tasks')) {
        console.log('✅ Successfully navigated to tasks page');
        
        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/debug-direct-tasks-navigation.png',
          fullPage: true 
        });
        
        // Check for button
        const buttonVisible = await page.locator('button').filter({ hasText: 'Tạo công việc' }).isVisible();
        console.log(`Create button visible: ${buttonVisible}`);
        
      } else {
        console.log('❌ Failed to navigate to tasks page');
      }
      
    } else {
      console.log('✅ Already on tasks page');
    }
    
    console.log('🎯 Direct navigation test completed');
  });
});
