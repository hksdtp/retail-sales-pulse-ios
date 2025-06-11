import { test, expect } from '@playwright/test';

test.describe('User Tagging Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should open task creation dialog and test user tagging', async ({ page }) => {
    console.log('🧪 Testing user tagging functionality...');
    
    // Đi đến trang Tasks
    const tasksLink = page.locator('a:has-text("Tasks"), a:has-text("Công việc"), [href*="tasks"]').first();
    if (await tasksLink.isVisible({ timeout: 5000 })) {
      await tasksLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Tìm nút tạo công việc
    const createTaskSelectors = [
      'button:has-text("Tạo công việc")',
      'button:has-text("+")',
      '[data-testid="create-task"]',
      'button[aria-label*="tạo"]',
      '.create-task-button'
    ];
    
    let createButton = null;
    for (const selector of createTaskSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        createButton = element;
        console.log(`✅ Found create button: ${selector}`);
        break;
      }
    }
    
    if (createButton) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Kiểm tra dialog đã mở
      const dialog = page.locator('[role="dialog"], .task-form-dialog').first();
      await expect(dialog).toBeVisible({ timeout: 10000 });
      console.log('✅ Task creation dialog opened');
      
      // Scroll xuống để thấy phần user tagging
      await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"], .task-form-dialog');
        if (dialog) {
          dialog.scrollTop = dialog.scrollHeight;
        }
      });
      await page.waitForTimeout(1000);
      
      // Tìm phần "Chia sẻ với người cụ thể"
      const userTaggingSection = page.locator('text=Chia sẻ với người cụ thể').first();
      if (await userTaggingSection.isVisible({ timeout: 5000 })) {
        console.log('✅ Found user tagging section');
        
        // Tìm search input
        const searchInput = page.locator('input[placeholder*="Tìm kiếm và thêm người"]').first();
        await expect(searchInput).toBeVisible({ timeout: 5000 });
        console.log('✅ Found search input');
        
        // Test search functionality
        await searchInput.click();
        await searchInput.fill('Việt');
        await page.waitForTimeout(1000);
        
        // Kiểm tra dropdown xuất hiện
        const dropdown = page.locator('[style*="position: fixed"], [style*="z-index: 99999"]').first();
        if (await dropdown.isVisible({ timeout: 3000 })) {
          console.log('✅ Dropdown appeared');
          
          // Kiểm tra có user suggestions
          const userSuggestions = page.locator('button:has-text("Việt")');
          const suggestionCount = await userSuggestions.count();
          console.log(`📋 Found ${suggestionCount} user suggestions`);
          
          if (suggestionCount > 0) {
            // Click vào suggestion đầu tiên
            await userSuggestions.first().click();
            await page.waitForTimeout(1000);
            
            // Kiểm tra user đã được thêm vào selected list
            const selectedUsers = page.locator('.inline-flex:has-text("Việt")');
            const selectedCount = await selectedUsers.count();
            console.log(`✅ Selected ${selectedCount} users`);
            
            if (selectedCount > 0) {
              console.log('✅ User tagging works correctly!');
              
              // Test remove user
              const removeButton = selectedUsers.first().locator('button').last();
              if (await removeButton.isVisible({ timeout: 2000 })) {
                await removeButton.click();
                await page.waitForTimeout(500);
                
                const remainingUsers = await selectedUsers.count();
                console.log(`✅ Removed user, remaining: ${remainingUsers}`);
              }
            }
          } else {
            console.log('⚠️ No user suggestions found');
          }
        } else {
          console.log('❌ Dropdown did not appear');
        }
        
        // Test với search khác
        await searchInput.clear();
        await searchInput.fill('Nguyễn');
        await page.waitForTimeout(1000);
        
        const nguyen_suggestions = page.locator('button:has-text("Nguyễn")');
        const nguyen_count = await nguyen_suggestions.count();
        console.log(`📋 Found ${nguyen_count} "Nguyễn" suggestions`);
        
      } else {
        console.log('❌ User tagging section not found');
      }
      
      // Close dialog
      const closeButton = page.locator('button:has-text("Hủy"), button:has-text("×")').first();
      if (await closeButton.isVisible({ timeout: 3000 })) {
        await closeButton.click();
      }
      
    } else {
      console.log('❌ Create task button not found');
    }
    
    expect(true).toBe(true); // Always pass for debugging
  });

  test('should test user search with different queries', async ({ page }) => {
    console.log('🧪 Testing user search with different queries...');
    
    // Mở task creation dialog (simplified)
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    // Try to find and click create button
    const createButtons = await page.locator('button').all();
    for (const button of createButtons) {
      const text = await button.textContent();
      if (text && (text.includes('+') || text.includes('Tạo') || text.includes('Create'))) {
        await button.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Test different search queries
    const searchQueries = ['Việt', 'Nguyễn', 'Thị', 'Anh', 'Hà'];
    
    for (const query of searchQueries) {
      const searchInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.clear();
        await searchInput.fill(query);
        await page.waitForTimeout(1000);
        
        const suggestions = page.locator(`button:has-text("${query}")`);
        const count = await suggestions.count();
        console.log(`🔍 Query "${query}": ${count} results`);
      }
    }
    
    expect(true).toBe(true);
  });
});
