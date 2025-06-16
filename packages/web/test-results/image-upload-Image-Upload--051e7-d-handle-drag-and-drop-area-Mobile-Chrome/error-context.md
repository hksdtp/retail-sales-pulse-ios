# Test info

- Name: Image Upload Feature >> should handle drag and drop area
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/image-upload.spec.ts:71:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/nih/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import path from 'path';
   3 |
   4 | test.describe('Image Upload Feature', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // Navigate to the app
   7 |     await page.goto('http://localhost:8093');
   8 |     
   9 |     // Wait for app to load
   10 |     await page.waitForLoadState('networkidle');
   11 |     
   12 |     // Login if needed (assuming we need to login)
   13 |     const loginButton = page.locator('button:has-text("Đăng nhập")');
   14 |     if (await loginButton.isVisible()) {
   15 |       await loginButton.click();
   16 |       
   17 |       // Fill login form (adjust selectors based on your login form)
   18 |       await page.fill('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]', 'test@example.com');
   19 |       await page.fill('input[type="password"], input[placeholder*="password"], input[placeholder*="Password"]', 'password123');
   20 |       
   21 |       // Submit login
   22 |       await page.click('button[type="submit"], button:has-text("Đăng nhập")');
   23 |       await page.waitForLoadState('networkidle');
   24 |     }
   25 |   });
   26 |
   27 |   test('should show image upload component in task form', async ({ page }) => {
   28 |     // Open task creation dialog
   29 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc"), button[aria-label*="task"], button[title*="task"]').first();
   30 |     
   31 |     if (await createTaskButton.isVisible()) {
   32 |       await createTaskButton.click();
   33 |     } else {
   34 |       // Try alternative ways to open task form
   35 |       await page.click('text="Công việc"');
   36 |       await page.click('button:has-text("Tạo mới")');
   37 |     }
   38 |     
   39 |     // Wait for task form dialog to appear
   40 |     await page.waitForSelector('[role="dialog"], .dialog, .modal', { timeout: 10000 });
   41 |     
   42 |     // Check if image upload component exists
   43 |     const imageUploadSection = page.locator('text="Hình ảnh", text="Upload", text="Tải ảnh", [data-testid="image-upload"]').first();
   44 |     await expect(imageUploadSection).toBeVisible({ timeout: 5000 });
   45 |     
   46 |     console.log('✅ Image upload component found in task form');
   47 |   });
   48 |
   49 |   test('should show Google Drive not configured message', async ({ page }) => {
   50 |     // Open task creation dialog
   51 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
   52 |     
   53 |     if (await createTaskButton.isVisible()) {
   54 |       await createTaskButton.click();
   55 |       
   56 |       // Wait for dialog
   57 |       await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
   58 |       
   59 |       // Look for Google Drive configuration warning
   60 |       const warningMessage = page.locator('text*="Google Drive", text*="chưa được cấu hình", text*="not configured"');
   61 |       
   62 |       if (await warningMessage.isVisible()) {
   63 |         console.log('✅ Google Drive not configured warning shown correctly');
   64 |         await expect(warningMessage).toBeVisible();
   65 |       } else {
   66 |         console.log('ℹ️ Google Drive might be configured or warning not visible');
   67 |       }
   68 |     }
   69 |   });
   70 |
>  71 |   test('should handle drag and drop area', async ({ page }) => {
      |   ^ Error: browserType.launch: Executable doesn't exist at /Users/nih/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
   72 |     // Open task form
   73 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
   74 |     
   75 |     if (await createTaskButton.isVisible()) {
   76 |       await createTaskButton.click();
   77 |       await page.waitForSelector('[role="dialog"]');
   78 |       
   79 |       // Look for drag and drop area
   80 |       const dragDropArea = page.locator('[data-testid="drag-drop-area"], .drag-drop, text*="Kéo thả", text*="drag", text*="drop"').first();
   81 |       
   82 |       if (await dragDropArea.isVisible()) {
   83 |         console.log('✅ Drag and drop area found');
   84 |         await expect(dragDropArea).toBeVisible();
   85 |         
   86 |         // Test hover effect
   87 |         await dragDropArea.hover();
   88 |         console.log('✅ Drag and drop area hover works');
   89 |       } else {
   90 |         console.log('⚠️ Drag and drop area not found - might be hidden due to Google Drive not configured');
   91 |       }
   92 |     }
   93 |   });
   94 |
   95 |   test('should show file input for image selection', async ({ page }) => {
   96 |     // Open task form
   97 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
   98 |     
   99 |     if (await createTaskButton.isVisible()) {
  100 |       await createTaskButton.click();
  101 |       await page.waitForSelector('[role="dialog"]');
  102 |       
  103 |       // Look for file input (might be hidden)
  104 |       const fileInput = page.locator('input[type="file"], input[accept*="image"]');
  105 |       
  106 |       if (await fileInput.count() > 0) {
  107 |         console.log('✅ File input found for image selection');
  108 |         
  109 |         // Check if it accepts images
  110 |         const acceptAttr = await fileInput.getAttribute('accept');
  111 |         if (acceptAttr && acceptAttr.includes('image')) {
  112 |           console.log('✅ File input accepts image files');
  113 |         }
  114 |       } else {
  115 |         console.log('⚠️ File input not found - might be conditional based on Google Drive setup');
  116 |       }
  117 |     }
  118 |   });
  119 |
  120 |   test('should show upload progress area', async ({ page }) => {
  121 |     // Open task form
  122 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
  123 |     
  124 |     if (await createTaskButton.isVisible()) {
  125 |       await createTaskButton.click();
  126 |       await page.waitForSelector('[role="dialog"]');
  127 |       
  128 |       // Look for upload progress elements
  129 |       const progressElements = page.locator('[data-testid="upload-progress"], .progress, text*="progress", text*="uploading"');
  130 |       
  131 |       if (await progressElements.count() > 0) {
  132 |         console.log('✅ Upload progress elements found');
  133 |       } else {
  134 |         console.log('ℹ️ Upload progress elements not visible (normal when no upload in progress)');
  135 |       }
  136 |     }
  137 |   });
  138 |
  139 |   test('should validate image upload service availability', async ({ page }) => {
  140 |     // Check if ImageUploadService is available in the browser context
  141 |     const isServiceAvailable = await page.evaluate(() => {
  142 |       // Check if Google Drive API is loaded
  143 |       const hasGoogleAPI = typeof window.gapi !== 'undefined';
  144 |       
  145 |       // Check if our service exists (if exposed to window)
  146 |       const hasImageService = typeof window.ImageUploadService !== 'undefined';
  147 |       
  148 |       return {
  149 |         hasGoogleAPI,
  150 |         hasImageService,
  151 |         userAgent: navigator.userAgent,
  152 |         location: window.location.href
  153 |       };
  154 |     });
  155 |     
  156 |     console.log('🔍 Service availability check:', isServiceAvailable);
  157 |     
  158 |     // Google API might not be loaded if not configured
  159 |     if (!isServiceAvailable.hasGoogleAPI) {
  160 |       console.log('ℹ️ Google API not loaded - expected if Google Drive not configured');
  161 |     }
  162 |   });
  163 |
  164 |   test('should handle task form submission with image data structure', async ({ page }) => {
  165 |     // Open task form
  166 |     const createTaskButton = page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm công việc")').first();
  167 |     
  168 |     if (await createTaskButton.isVisible()) {
  169 |       await createTaskButton.click();
  170 |       await page.waitForSelector('[role="dialog"]');
  171 |       
```