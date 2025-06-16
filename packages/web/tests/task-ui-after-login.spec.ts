import { test, expect } from '@playwright/test';

test.describe('Task UI After Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');

    // Thực hiện đăng nhập
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    if (await emailInput.isVisible()) {
      console.log('🔐 Performing login...');
      await emailInput.fill('manh.khong@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();

      // Đợi đăng nhập hoàn tất
      await page.waitForTimeout(5000);

      // Chụp ảnh sau khi đăng nhập
      await page.screenshot({
        path: 'test-results/after-login.png',
        fullPage: true
      });
    }
  });

  test('should find task creation UI after login', async ({ page }) => {
    console.log('🔍 Searching for task creation UI after login...');

    // Kiểm tra URL hiện tại
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Tìm tất cả các button sau khi đăng nhập
    const allButtons = await page.locator('button').all();
    console.log(`📊 Found ${allButtons.length} buttons after login`);

    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const classes = await button.getAttribute('class');
      console.log(`Button ${i}: "${text}" - Visible: ${isVisible} - Classes: ${classes}`);
    }

    // Expect to find at least some buttons
    expect(allButtons.length).toBeGreaterThan(0);
  });

  test('should check Google Drive setup page', async ({ page }) => {
    console.log('🔍 Testing Google Drive setup page...');

<<<<<<< HEAD
              return; // Thoát khỏi loop nếu tìm thấy
            } else {
              console.log(`❌ No dialog opened on ${url}`);
            }
          }
        } else {
          console.log(`❌ No create buttons found on ${url}`);
        }
        
      } catch (error) {
        console.log(`❌ Error navigating to ${url}: ${error.message}`);
      }
    }
    
    console.log('❌ Could not find task creation UI on any page');
  });

  test('should check main dashboard for task creation', async ({ page }) => {
    console.log('🏠 Checking main dashboard for task creation...');
    
    // Đảm bảo ở trang chủ
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Tìm tất cả các element có thể click
    const clickableElements = await page.locator('button, a, [role="button"], [onclick]').all();
    console.log(`🖱️ Found ${clickableElements.length} clickable elements`);
    
    const potentialTaskElements = [];
    
    for (let i = 0; i < clickableElements.length; i++) {
      const element = clickableElements[i];
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      
      if (isVisible && text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('task') || 
            lowerText.includes('công việc') || 
            lowerText.includes('tạo') || 
            lowerText.includes('create') || 
            lowerText.includes('add') || 
            lowerText.includes('new') ||
            lowerText.includes('+')) {
          
          potentialTaskElements.push({
            index: i,
            text: text.trim(),
            element
          });
          
          console.log(`🎯 Potential task element ${i}: "${text.trim()}"`);
        }
      }
    }
    
    console.log(`📊 Found ${potentialTaskElements.length} potential task-related elements`);
    
    // Thử click từng element
    for (const item of potentialTaskElements) {
      try {
        console.log(`🖱️ Testing click on: "${item.text}"`);
        
        await item.element.click();
        await page.waitForTimeout(1500);
        
        // Kiểm tra xem có thay đổi gì không
        const currentUrl = page.url();
        const dialogs = await page.locator('[role="dialog"], .modal').count();
        
        console.log(`  - URL after click: ${currentUrl}`);
        console.log(`  - Dialogs visible: ${dialogs}`);
        
        if (dialogs > 0) {
          console.log(`🎉 Dialog opened by clicking: "${item.text}"`);
          
          await page.screenshot({ 
            path: `test-results/dialog-from-${item.index}.png`,
            fullPage: true 
          });
          
          // Phân tích dialog
          const dialog = page.locator('[role="dialog"], .modal').first();
          await analyzeTaskDialog(page, dialog);
          
          // Đóng dialog để test tiếp
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
        
      } catch (error) {
        console.log(`❌ Error clicking "${item.text}": ${error.message}`);
      }
    }
  });

  test('should analyze CSS and UI issues', async ({ page }) => {
    console.log('🎨 Analyzing CSS and UI issues...');
    await analyzeCSSIssues(page);
  });

});

async function analyzeTaskDialog(page, dialog) {
    console.log('🔬 Analyzing task creation dialog...');
    
    try {
      // Kiểm tra title
      const title = await dialog.locator('h1, h2, h3, [role="heading"]').first().textContent();
      console.log(`📋 Dialog title: "${title}"`);
      
      // Kiểm tra form fields
      const inputs = await dialog.locator('input').count();
      const textareas = await dialog.locator('textarea').count();
      const selects = await dialog.locator('select, [role="combobox"]').count();
      const buttons = await dialog.locator('button').count();
      
      console.log(`📝 Form elements: ${inputs} inputs, ${textareas} textareas, ${selects} selects, ${buttons} buttons`);
      
      // Kiểm tra validation errors
      const errors = await dialog.locator('.error, .invalid, [role="alert"]').count();
      console.log(`⚠️ Validation errors visible: ${errors}`);
      
      // Kiểm tra required fields
      const requiredFields = await dialog.locator('[required], [aria-required="true"]').count();
      console.log(`⭐ Required fields: ${requiredFields}`);
      
      // Kiểm tra CSS issues
      const formContainer = dialog.locator('form').first();
      if (await formContainer.isVisible()) {
        const styles = await formContainer.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            overflow: computed.overflow,
            maxHeight: computed.maxHeight,
            height: computed.height,
            width: computed.width
          };
        });
        
        console.log('🎨 Form styles:', styles);
        
        // Kiểm tra xem có element nào bị ẩn không
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
          console.log('🚨 ISSUE: Form container has display/visibility issues!');
        }
      }
      
      // Kiểm tra scroll issues
      const dialogHeight = await dialog.evaluate(el => el.scrollHeight);
      const dialogClientHeight = await dialog.evaluate(el => el.clientHeight);
      
      if (dialogHeight > dialogClientHeight) {
        console.log(`📏 Dialog has scroll: ${dialogHeight}px content in ${dialogClientHeight}px container`);
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing dialog: ${error.message}`);
    }
}

async function analyzeCSSIssues(page) {
    console.log('🎨 Checking for CSS and layout issues...');
    
    // Kiểm tra console errors liên quan đến CSS
    const cssErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('css')) {
        cssErrors.push(msg.text());
        console.log(`🎨 CSS Error: ${msg.text()}`);
      }
    });
    
    // Reload để catch CSS errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Kiểm tra các element có vấn đề về layout
    const hiddenElements = await page.locator('[style*="display: none"], [style*="visibility: hidden"]').count();
    console.log(`👻 Hidden elements found: ${hiddenElements}`);
    
    // Kiểm tra overflow issues
    const overflowElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        if (computed.overflow === 'hidden' && el.scrollHeight > el.clientHeight) {
          issues.push({
            index,
            tagName: el.tagName,
            className: el.className,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight
          });
        }
      });
      
      return issues;
    });
    
    console.log(`📏 Elements with overflow issues: ${overflowElements.length}`);
    overflowElements.forEach((issue, i) => {
      console.log(`  ${i}: ${issue.tagName}.${issue.className} - ${issue.scrollHeight}px in ${issue.clientHeight}px`);
    });
    
    console.log(`📊 CSS Analysis Summary: ${cssErrors.length} CSS errors, ${hiddenElements} hidden elements, ${overflowElements.length} overflow issues`);
}
=======
    try {
      await page.goto('http://localhost:8088/google-drive-setup');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Chụp ảnh trang setup
      await page.screenshot({
        path: 'test-results/google-drive-setup.png',
        fullPage: true
      });

      // Kiểm tra title
      const title = await page.locator('h1').first().textContent();
      console.log(`📋 Page title: "${title}"`);
      expect(title).toContain('Google Drive');

      // Kiểm tra các bước hướng dẫn
      const steps = await page.locator('[class*="border-2"]').count();
      console.log(`📊 Found ${steps} setup steps`);
      expect(steps).toBeGreaterThan(0);

      // Kiểm tra form inputs
      const inputs = await page.locator('input').count();
      console.log(`📝 Found ${inputs} input fields`);
      expect(inputs).toBeGreaterThan(0);

      console.log('✅ Google Drive setup page loaded successfully');

    } catch (error) {
      console.log(`❌ Error testing Google Drive setup: ${error.message}`);
      throw error;
    }
  });

});
>>>>>>> cc745b7 (🗑️ Remove all image upload functionality)
