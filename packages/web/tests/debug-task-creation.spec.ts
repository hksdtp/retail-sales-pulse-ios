import { test, expect } from '@playwright/test';

test.describe('Debug Task Creation', () => {
  test('Debug detailed task creation process', async ({ page }) => {
    console.log('🔍 Debugging detailed task creation process...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    // Navigate and setup
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
    
    console.log('📝 Step 1: Open task form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 2: Fill form with all required fields');
    
    // Fill title
    const titleInput = await page.locator('input[name="title"]').first();
    await titleInput.fill('Debug Task - Complete Form');
    console.log('✅ Filled title');
    
    // Fill description
    const descInput = await page.locator('textarea[name="description"]').first();
    await descInput.fill('Complete task with all required fields for debugging');
    console.log('✅ Filled description');
    
    // Select task type (required)
    console.log('📝 Selecting task type...');
    const typeButton = await page.locator('button:has-text("Chọn loại công việc")').first();
    const hasTypeButton = await typeButton.isVisible();
    console.log(`📋 Type button visible: ${hasTypeButton}`);
    
    if (hasTypeButton) {
      await typeButton.click();
      await page.waitForTimeout(1000);
      
      // Select first available type
      const firstType = await page.locator('[data-testid="task-type-option"]').first();
      const hasFirstType = await firstType.isVisible();
      
      if (hasFirstType) {
        await firstType.click();
        console.log('✅ Selected task type');
      } else {
        // Try alternative selector
        const altType = await page.locator('button:has-text("KTS mới"), button:has-text("KH/CĐT mới")').first();
        const hasAltType = await altType.isVisible();
        
        if (hasAltType) {
          await altType.click();
          console.log('✅ Selected alternative task type');
        } else {
          console.log('❌ No task type options found');
        }
      }
    }
    
    // Set date (required)
    console.log('📝 Setting date...');
    const dateInput = await page.locator('input[type="date"], input[name="date"]').first();
    const hasDateInput = await dateInput.isVisible();
    
    if (hasDateInput) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      console.log('✅ Set date');
    } else {
      console.log('❌ Date input not found');
    }
    
    // Set deadline (required)
    console.log('📝 Setting deadline...');
    const deadlineInput = await page.locator('input[name="deadline"]').first();
    const hasDeadlineInput = await deadlineInput.isVisible();
    
    if (hasDeadlineInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const deadlineDate = tomorrow.toISOString().split('T')[0];
      await deadlineInput.fill(deadlineDate);
      console.log('✅ Set deadline');
    } else {
      console.log('❌ Deadline input not found');
    }
    
    // Set visibility (required)
    console.log('📝 Setting visibility...');
    const visibilitySelect = await page.locator('select[name="visibility"], [data-testid="visibility-select"]').first();
    const hasVisibilitySelect = await visibilitySelect.isVisible();
    
    if (hasVisibilitySelect) {
      await visibilitySelect.selectOption('personal');
      console.log('✅ Set visibility to personal');
    } else {
      // Try radio buttons
      const personalRadio = await page.locator('input[value="personal"], button:has-text("Cá nhân")').first();
      const hasPersonalRadio = await personalRadio.isVisible();
      
      if (hasPersonalRadio) {
        await personalRadio.click();
        console.log('✅ Selected personal visibility');
      } else {
        console.log('❌ Visibility options not found');
      }
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 3: Check form validation');
    
    // Check if save button is enabled
    const saveButton = await page.locator('button:has-text("Lưu"), button:has-text("Tạo")').first();
    const isEnabled = await saveButton.isEnabled();
    console.log(`💾 Save button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Save button disabled, checking required fields...');
      
      // Check form validation messages
      const validationMessages = await page.locator('.text-red-500, .error-message, [role="alert"]').all();
      console.log(`⚠️ Validation messages: ${validationMessages.length}`);
      
      for (let i = 0; i < validationMessages.length; i++) {
        const message = await validationMessages[i].textContent();
        console.log(`  ${i + 1}. ${message}`);
      }
      
      return;
    }
    
    console.log('📝 Step 4: Submit form and monitor');
    
    // Clear previous logs
    consoleLogs.length = 0;
    errors.length = 0;
    
    await saveButton.click({ force: true });
    
    // Wait and monitor logs
    await page.waitForTimeout(5000);
    
    console.log('\n📋 Console logs during submission:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Adding new task') ||
      log.includes('Task added') ||
      log.includes('Error adding') ||
      log.includes('addTask') ||
      log.includes('Supabase') ||
      log.includes('error') ||
      log.includes('Error')
    );
    
    relevantLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log('\n🚨 Errors during submission:');
    if (errors.length > 0) {
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors found');
    }
    
    // Check if dialog closed
    const dialog = await page.locator('[role="dialog"]').first();
    const dialogStillOpen = await dialog.isVisible();
    console.log(`📋 Dialog still open: ${dialogStillOpen}`);
    
    // Check for success toast
    const successToast = await page.locator(':has-text("Thành công"), .toast').first();
    const hasSuccessToast = await successToast.isVisible().catch(() => false);
    console.log(`✅ Success toast visible: ${hasSuccessToast}`);
    
    // Check tasks in list
    await page.waitForTimeout(2000);
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, tr:has(td)').all();
    console.log(`📊 Task elements in list: ${taskElements.length}`);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-task-creation.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
  });
});
