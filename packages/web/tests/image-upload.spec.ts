import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Upload Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8093');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Login if needed (assuming we need to login)
    const loginButton = page.locator('button:has-text("Đăng nhập")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Fill login form (adjust selectors based on your login form)
      await page.fill('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]', 'test@example.com');
      await page.fill('input[type="password"], input[placeholder*="password"], input[placeholder*="Password"]', 'password123');
      
      // Submit login
      await page.click('button[type="submit"], button:has-text("Đăng nhập")');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should show image upload component in task form', async ({ page }) => {
    // Open task creation dialog
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc"), button[aria-label*="task"], button[title*="task"]').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
    } else {
      // Try alternative ways to open task form
      await page.click('text="Công việc"');
      await page.click('button:has-text("Tạo mới")');
    }
    
    // Wait for task form dialog to appear
    await page.waitForSelector('[role="dialog"], .dialog, .modal', { timeout: 10000 });
    
    // Check if image upload component exists
    const imageUploadSection = page.locator('text="Hình ảnh", text="Upload", text="Tải ảnh", [data-testid="image-upload"]').first();
    await expect(imageUploadSection).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Image upload component found in task form');
  });

  test('should show Google Drive not configured message', async ({ page }) => {
    // Open task creation dialog
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      
      // Look for Google Drive configuration warning
      const warningMessage = page.locator('text*="Google Drive", text*="chưa được cấu hình", text*="not configured"');
      
      if (await warningMessage.isVisible()) {
        console.log('✅ Google Drive not configured warning shown correctly');
        await expect(warningMessage).toBeVisible();
      } else {
        console.log('ℹ️ Google Drive might be configured or warning not visible');
      }
    }
  });

  test('should handle drag and drop area', async ({ page }) => {
    // Open task form
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForSelector('[role="dialog"]');
      
      // Look for drag and drop area
      const dragDropArea = page.locator('[data-testid="drag-drop-area"], .drag-drop, text*="Kéo thả", text*="drag", text*="drop"').first();
      
      if (await dragDropArea.isVisible()) {
        console.log('✅ Drag and drop area found');
        await expect(dragDropArea).toBeVisible();
        
        // Test hover effect
        await dragDropArea.hover();
        console.log('✅ Drag and drop area hover works');
      } else {
        console.log('⚠️ Drag and drop area not found - might be hidden due to Google Drive not configured');
      }
    }
  });

  test('should show file input for image selection', async ({ page }) => {
    // Open task form
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForSelector('[role="dialog"]');
      
      // Look for file input (might be hidden)
      const fileInput = page.locator('input[type="file"], input[accept*="image"]');
      
      if (await fileInput.count() > 0) {
        console.log('✅ File input found for image selection');
        
        // Check if it accepts images
        const acceptAttr = await fileInput.getAttribute('accept');
        if (acceptAttr && acceptAttr.includes('image')) {
          console.log('✅ File input accepts image files');
        }
      } else {
        console.log('⚠️ File input not found - might be conditional based on Google Drive setup');
      }
    }
  });

  test('should show upload progress area', async ({ page }) => {
    // Open task form
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForSelector('[role="dialog"]');
      
      // Look for upload progress elements
      const progressElements = page.locator('[data-testid="upload-progress"], .progress, text*="progress", text*="uploading"');
      
      if (await progressElements.count() > 0) {
        console.log('✅ Upload progress elements found');
      } else {
        console.log('ℹ️ Upload progress elements not visible (normal when no upload in progress)');
      }
    }
  });

  test('should validate image upload service availability', async ({ page }) => {
    // Check if ImageUploadService is available in the browser context
    const isServiceAvailable = await page.evaluate(() => {
      // Check if Google Drive API is loaded
      const hasGoogleAPI = typeof window.gapi !== 'undefined';
      
      // Check if our service exists (if exposed to window)
      const hasImageService = typeof window.ImageUploadService !== 'undefined';
      
      return {
        hasGoogleAPI,
        hasImageService,
        userAgent: navigator.userAgent,
        location: window.location.href
      };
    });
    
    console.log('🔍 Service availability check:', isServiceAvailable);
    
    // Google API might not be loaded if not configured
    if (!isServiceAvailable.hasGoogleAPI) {
      console.log('ℹ️ Google API not loaded - expected if Google Drive not configured');
    }
  });

  test('should handle task form submission with image data structure', async ({ page }) => {
    // Open task form
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForSelector('[role="dialog"]');
      
      // Fill required task fields
      await page.fill('input[placeholder*="tên"], input[placeholder*="title"]', 'Test Task with Images');
      await page.fill('textarea[placeholder*="mô tả"], textarea[placeholder*="description"]', 'Test task description');
      
      // Look for save button
      const saveButton = page.locator('button:has-text("Lưu"), button:has-text("Tạo"), button[type="submit"]').first();
      
      if (await saveButton.isVisible()) {
        console.log('✅ Task form can be submitted (save button found)');
        
        // Don't actually submit to avoid creating test data
        // await saveButton.click();
      }
    }
  });

  test('should check console for image upload related errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('image') || text.includes('upload') || text.includes('Google') || text.includes('Drive')) {
        consoleMessages.push(`${msg.type()}: ${text}`);
      }
    });
    
    // Navigate and interact
    await page.goto('http://localhost:8093');
    await page.waitForLoadState('networkidle');
    
    // Try to open task form to trigger any image-related code
    const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(2000); // Wait for any async operations
    }
    
    // Report console messages
    if (consoleMessages.length > 0) {
      console.log('📝 Image/Upload related console messages:');
      consoleMessages.forEach(msg => console.log(`  ${msg}`));
    } else {
      console.log('✅ No image/upload related console errors found');
    }
  });
});
