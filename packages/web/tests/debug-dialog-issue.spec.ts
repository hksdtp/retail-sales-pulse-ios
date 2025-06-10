import { test, expect } from '@playwright/test';

test.describe('Debug Dialog Issue', () => {
  test('should debug dialog opening issue', async ({ page }) => {
    console.log('🐛 Debugging dialog opening issue...');
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Listen for page errors
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
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to tasks page');
    }
    
    // Debug: Check React state before clicking
    const reactState = await page.evaluate(() => {
      // Try to find React component state
      const buttons = document.querySelectorAll('button');
      const createButton = Array.from(buttons).find(btn => 
        btn.textContent?.includes('Tạo công việc')
      );
      
      return {
        buttonFound: !!createButton,
        buttonText: createButton?.textContent,
        buttonClasses: createButton?.className,
        reactFiberKey: createButton ? Object.keys(createButton).find(key => key.startsWith('__reactFiber')) : null
      };
    });
    
    console.log('🔍 React state:', reactState);
    
    // Find and click button
    const createTaskButton = page.locator('button').filter({ hasText: 'Tạo công việc' }).first();
    
    if (await createTaskButton.isVisible()) {
      console.log('✅ Button is visible, clicking...');
      
      // Debug: Check if button has click handler
      const hasClickHandler = await createTaskButton.evaluate(el => {
        const events = getEventListeners ? getEventListeners(el) : null;
        return {
          hasOnClick: !!el.onclick,
          hasEventListeners: !!events,
          eventTypes: events ? Object.keys(events) : []
        };
      });
      
      console.log('🔍 Button event handlers:', hasClickHandler);
      
      // Click button
      await createTaskButton.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ Button clicked');
      
      // Debug: Check DOM after click
      const domState = await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        const radixDialogs = document.querySelectorAll('[data-radix-dialog-content]');
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        const portals = document.querySelectorAll('[data-radix-portal]');
        
        return {
          dialogCount: dialogs.length,
          radixDialogCount: radixDialogs.length,
          overlayCount: overlays.length,
          portalCount: portals.length,
          bodyClasses: document.body.className,
          htmlClasses: document.documentElement.className
        };
      });
      
      console.log('🔍 DOM state after click:', domState);
      
      // Check if dialog elements exist but are hidden
      const hiddenDialogs = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const hiddenDialogs = [];
        
        for (const el of allElements) {
          if (el.getAttribute('role') === 'dialog' || 
              el.hasAttribute('data-radix-dialog-content')) {
            const styles = window.getComputedStyle(el);
            hiddenDialogs.push({
              tagName: el.tagName,
              role: el.getAttribute('role'),
              dataRadix: el.hasAttribute('data-radix-dialog-content'),
              display: styles.display,
              visibility: styles.visibility,
              opacity: styles.opacity,
              zIndex: styles.zIndex,
              position: styles.position,
              transform: styles.transform
            });
          }
        }
        
        return hiddenDialogs;
      });
      
      console.log('🔍 Hidden dialogs:', hiddenDialogs);
      
      // Try to force dialog visibility
      if (hiddenDialogs.length > 0) {
        console.log('🔧 Attempting to force dialog visibility...');
        
        await page.evaluate(() => {
          const dialogs = document.querySelectorAll('[data-radix-dialog-content]');
          dialogs.forEach(dialog => {
            dialog.style.display = 'grid';
            dialog.style.visibility = 'visible';
            dialog.style.opacity = '1';
            dialog.style.zIndex = '10000';
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
            dialog.style.background = 'white';
            dialog.style.border = '1px solid #ccc';
            dialog.style.borderRadius = '8px';
            dialog.style.padding = '20px';
            dialog.style.maxWidth = '800px';
            dialog.style.maxHeight = '90vh';
            dialog.style.overflow = 'auto';
          });
          
          const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
          overlays.forEach(overlay => {
            overlay.style.display = 'block';
            overlay.style.visibility = 'visible';
            overlay.style.opacity = '1';
            overlay.style.zIndex = '9999';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.background = 'rgba(0, 0, 0, 0.3)';
          });
        });
        
        await page.waitForTimeout(1000);
        
        // Check if dialog is now visible
        const dialog = page.locator('[data-radix-dialog-content]');
        const isVisible = await dialog.isVisible();
        
        if (isVisible) {
          console.log('🎉 SUCCESS! Dialog is now visible after force styling');
          
          // Take screenshot
          await page.screenshot({ 
            path: 'test-results/debug-dialog-forced-visible.png',
            fullPage: true 
          });
          
          // Test form interaction
          const titleInput = page.locator('input[name="title"]');
          if (await titleInput.isVisible()) {
            await titleInput.fill('Debug Test Dialog');
            console.log('✅ Title input works');
          }
          
        } else {
          console.log('❌ Dialog still not visible after force styling');
        }
      }
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'test-results/debug-final-state.png',
        fullPage: true 
      });
      
    } else {
      console.log('❌ Create task button not visible');
    }
    
    console.log('🐛 Debug completed');
  });

  test('should test manual dialog creation', async ({ page }) => {
    console.log('🔧 Testing manual dialog creation...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(5000);
    }
    
    const taskMenuLink = page.locator('a[href="/tasks"]').first();
    if (await taskMenuLink.isVisible()) {
      await taskMenuLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Manually create dialog in DOM
    await page.evaluate(() => {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.setAttribute('data-radix-dialog-overlay', '');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 9999;
        display: block;
      `;
      
      // Create dialog content
      const dialog = document.createElement('div');
      dialog.setAttribute('data-radix-dialog-content', '');
      dialog.setAttribute('role', 'dialog');
      dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 20px;
        max-width: 800px;
        max-height: 90vh;
        overflow: auto;
        z-index: 10000;
        display: grid;
        gap: 16px;
      `;
      
      dialog.innerHTML = `
        <h2>Test Dialog</h2>
        <p>This is a manually created dialog to test visibility</p>
        <input type="text" placeholder="Test input" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <button onclick="this.parentElement.parentElement.remove(); this.parentElement.remove();" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">Close</button>
      `;
      
      document.body.appendChild(overlay);
      document.body.appendChild(dialog);
    });
    
    await page.waitForTimeout(2000);
    
    // Check if manual dialog is visible
    const manualDialog = page.locator('[data-radix-dialog-content]');
    const isVisible = await manualDialog.isVisible();
    
    if (isVisible) {
      console.log('✅ Manual dialog is visible');
      
      await page.screenshot({ 
        path: 'test-results/debug-manual-dialog.png',
        fullPage: true 
      });
      
      // Test input
      const testInput = page.locator('input[placeholder="Test input"]');
      if (await testInput.isVisible()) {
        await testInput.fill('Manual dialog test');
        console.log('✅ Manual dialog input works');
      }
      
      // Close dialog
      const closeButton = page.locator('button').filter({ hasText: 'Close' });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✅ Manual dialog closed');
      }
      
    } else {
      console.log('❌ Manual dialog not visible');
    }
    
    console.log('🔧 Manual dialog test completed');
  });
});
