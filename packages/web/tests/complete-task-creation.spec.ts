import { test, expect } from '@playwright/test';

test.describe('Complete Task Creation', () => {
  test('Create task with all required fields', async ({ page }) => {
    console.log('🔍 Creating task with all required fields...');
    
    // Monitor console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
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
    
    console.log('📝 Step 1: Open task form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 2: Fill all required fields');
    
    // 1. Fill title
    const titleInput = await page.locator('input[placeholder*="tiêu đề"]').first();
    await titleInput.fill('Complete Task - Lê Khánh Duy');
    console.log('✅ 1. Filled title');
    
    // 2. Fill description
    const descInput = await page.locator('textarea:first-of-type').first();
    await descInput.fill('Complete task with all required fields filled');
    console.log('✅ 2. Filled description');
    
    // 3. Select task type (REQUIRED)
    console.log('📝 3. Selecting task type...');
    
    // Look for task type buttons/options
    const taskTypeButtons = await page.locator('button:has-text("KTS mới"), button:has-text("KH/CĐT mới"), button:has-text("Báo cáo"), button:has-text("Họp"), button:has-text("Khác")').all();
    console.log(`📋 Found ${taskTypeButtons.length} task type buttons`);
    
    if (taskTypeButtons.length > 0) {
      // Click first available task type
      await taskTypeButtons[0].click();
      const buttonText = await taskTypeButtons[0].textContent();
      console.log(`✅ 3. Selected task type: ${buttonText}`);
    } else {
      // Try alternative approach - look for task type selector
      const typeSelector = await page.locator('[data-testid="task-type-selector"], .task-type-selector').first();
      const hasTypeSelector = await typeSelector.isVisible().catch(() => false);
      
      if (hasTypeSelector) {
        await typeSelector.click();
        await page.waitForTimeout(1000);
        
        // Select first option
        const firstOption = await page.locator('[data-testid="task-type-option"]:first-child, .task-type-option:first-child').first();
        const hasFirstOption = await firstOption.isVisible().catch(() => false);
        
        if (hasFirstOption) {
          await firstOption.click();
          console.log('✅ 3. Selected first task type option');
        } else {
          console.log('❌ 3. Could not find task type options');
        }
      } else {
        console.log('❌ 3. Could not find task type selector');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 4. Set date (REQUIRED)
    console.log('📝 4. Setting date...');
    
    const dateInputs = await page.locator('input[type="date"]').all();
    console.log(`📅 Found ${dateInputs.length} date inputs`);
    
    if (dateInputs.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await dateInputs[0].fill(today);
      console.log('✅ 4. Set date to today');
    } else {
      // Try alternative date selector
      const dateButton = await page.locator('button:has-text("Chọn ngày"), [data-testid="date-picker"]').first();
      const hasDateButton = await dateButton.isVisible().catch(() => false);
      
      if (hasDateButton) {
        await dateButton.click();
        await page.waitForTimeout(1000);
        
        // Select today
        const todayButton = await page.locator('button:has-text("Today"), .today, [data-today]').first();
        const hasTodayButton = await todayButton.isVisible().catch(() => false);
        
        if (hasTodayButton) {
          await todayButton.click();
          console.log('✅ 4. Selected today from date picker');
        } else {
          console.log('❌ 4. Could not find today button in date picker');
        }
      } else {
        console.log('❌ 4. Could not find date input or picker');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 5. Set deadline (REQUIRED)
    console.log('📝 5. Setting deadline...');
    
    if (dateInputs.length > 1) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const deadlineDate = tomorrow.toISOString().split('T')[0];
      await dateInputs[1].fill(deadlineDate);
      console.log('✅ 5. Set deadline to tomorrow');
    } else {
      console.log('❌ 5. Could not find deadline input');
    }
    
    await page.waitForTimeout(1000);
    
    // 6. Set visibility (REQUIRED)
    console.log('📝 6. Setting visibility...');
    
    // Look for visibility radio buttons or select
    const personalButton = await page.locator('button:has-text("Cá nhân"), input[value="personal"], [data-value="personal"]').first();
    const hasPersonalButton = await personalButton.isVisible().catch(() => false);
    
    if (hasPersonalButton) {
      await personalButton.click();
      console.log('✅ 6. Selected personal visibility');
    } else {
      // Try select dropdown
      const visibilitySelect = await page.locator('select[name="visibility"], [data-testid="visibility-select"]').first();
      const hasVisibilitySelect = await visibilitySelect.isVisible().catch(() => false);
      
      if (hasVisibilitySelect) {
        await visibilitySelect.selectOption('personal');
        console.log('✅ 6. Selected personal from dropdown');
      } else {
        console.log('❌ 6. Could not find visibility options');
      }
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 3: Check if save button is enabled');
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    const isEnabled = await saveButton.isEnabled();
    console.log(`💾 Save button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Save button still disabled, checking validation...');
      
      // Check validation messages
      const validationElements = await page.locator('.text-red-500, .error, [role="alert"]').all();
      console.log(`⚠️ Validation elements: ${validationElements.length}`);
      
      for (let i = 0; i < Math.min(validationElements.length, 10); i++) {
        const text = await validationElements[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'validation-debug.png', fullPage: true });
      
      return;
    }
    
    console.log('📝 Step 4: Submit form');
    
    // Clear previous errors
    errors.length = 0;
    
    await saveButton.click({ force: true });
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 5: Check results');
    
    // Check for errors
    if (errors.length > 0) {
      console.log('🚨 Errors during submission:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors during submission');
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
    await page.waitForTimeout(3000);
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, tr:has(td)').all();
    console.log(`📊 Task elements in list: ${taskElements.length}`);
    
    // Look for the specific task
    const createdTask = await page.locator('text="Complete Task - Lê Khánh Duy"').first();
    const hasCreatedTask = await createdTask.isVisible().catch(() => false);
    console.log(`🎯 Created task visible: ${hasCreatedTask}`);
    
    if (hasCreatedTask) {
      console.log('🎉 SUCCESS: Task created and visible!');
    } else {
      console.log('❌ Task not visible in list');
      
      // Check if task was saved to database
      const dbCheck = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/tasks');
          const tasks = await response.json();
          return tasks.length;
        } catch (error) {
          return 'Error checking database';
        }
      });
      
      console.log(`📊 Tasks in database: ${dbCheck}`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'complete-task-creation.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
