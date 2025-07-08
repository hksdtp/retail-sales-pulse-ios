import { test, expect } from '@playwright/test';

test.describe('Debug Task Creation Error', () => {
  test('Debug the "Failed to add task" error', async ({ page }) => {
    console.log('🔍 Debugging "Failed to add task" error...');
    
    // Monitor all console messages and errors
    const errors: string[] = [];
    const consoleLogs: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.statusText()} - ${response.url()}`);
      }
    });
    
    page.on('requestfailed', request => {
      networkErrors.push(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Setup user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1',
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Nhân viên',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Open task creation form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 2: Fill form with minimal required data');
    
    // Fill only essential fields
    const titleInput = await page.locator('input[placeholder*="tiêu đề"]').first();
    await titleInput.fill('Debug Task - ' + Date.now());
    console.log('✅ Filled title');
    
    const descInput = await page.locator('textarea:first-of-type').first();
    await descInput.fill('Debug task to find error');
    console.log('✅ Filled description');
    
    // Select task type
    const taskTypeButtons = await page.locator('button:has-text("Khác")').first();
    const hasKhacButton = await taskTypeButtons.isVisible();
    
    if (hasKhacButton) {
      await taskTypeButtons.click();
      console.log('✅ Selected "Khác" task type');
    } else {
      // Try first available button
      const anyTypeButton = await page.locator('button:has-text("KTS mới"), button:has-text("KH/CĐT mới"), button:has-text("Báo cáo"), button:has-text("Họp")').first();
      const hasAnyButton = await anyTypeButton.isVisible();
      
      if (hasAnyButton) {
        await anyTypeButton.click();
        const buttonText = await anyTypeButton.textContent();
        console.log(`✅ Selected task type: ${buttonText}`);
      } else {
        console.log('❌ No task type buttons found');
      }
    }
    
    // Set visibility
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    const hasPersonalButton = await personalButton.isVisible();
    
    if (hasPersonalButton) {
      await personalButton.click();
      console.log('✅ Selected personal visibility');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 3: Clear previous logs and submit');
    
    // Clear previous logs to focus on submission
    errors.length = 0;
    consoleLogs.length = 0;
    networkErrors.length = 0;
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    const isEnabled = await saveButton.isEnabled();
    console.log(`💾 Save button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Save button disabled, checking validation...');
      
      const validationElements = await page.locator('.text-red-500, .error, [role="alert"]').all();
      console.log(`⚠️ Validation elements: ${validationElements.length}`);
      
      for (let i = 0; i < validationElements.length; i++) {
        const text = await validationElements[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      return;
    }
    
    console.log('📝 Clicking save button...');
    await saveButton.click({ force: true });
    
    // Wait for response
    await page.waitForTimeout(8000);
    
    console.log('📝 Step 4: Analyze errors and logs');
    
    // Check for error toast
    const errorToast = await page.locator(':has-text("Failed to add task"), :has-text("Lỗi")').first();
    const hasErrorToast = await errorToast.isVisible().catch(() => false);
    console.log(`🚨 Error toast visible: ${hasErrorToast}`);
    
    if (hasErrorToast) {
      const errorText = await errorToast.textContent();
      console.log(`🚨 Error toast text: "${errorText}"`);
    }
    
    // Check console errors
    if (errors.length > 0) {
      console.log('\n🚨 Console Errors:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors');
    }
    
    // Check network errors
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors:');
      networkErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No network errors');
    }
    
    // Check relevant console logs
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Adding new task') ||
      log.includes('Task added') ||
      log.includes('Error adding') ||
      log.includes('addTask') ||
      log.includes('Failed') ||
      log.includes('error') ||
      log.includes('Error') ||
      log.includes('Supabase')
    );
    
    if (relevantLogs.length > 0) {
      console.log('\n📋 Relevant Console Logs:');
      relevantLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Check if dialog is still open
    const dialog = await page.locator('[role="dialog"]').first();
    const dialogStillOpen = await dialog.isVisible();
    console.log(`📋 Dialog still open: ${dialogStillOpen}`);
    
    // Check for success indicators
    const successToast = await page.locator(':has-text("Thành công"), .toast:not(:has-text("Lỗi"))').first();
    const hasSuccessToast = await successToast.isVisible().catch(() => false);
    console.log(`✅ Success toast visible: ${hasSuccessToast}`);
    
    // Check task count
    const taskElements = await page.locator('tr:has(td)').all();
    console.log(`📊 Current task count: ${taskElements.length}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-task-creation-error.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
  });
});
