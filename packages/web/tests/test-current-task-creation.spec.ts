import { test, expect } from '@playwright/test';

test.describe('Test Current Task Creation', () => {
  test('Test task creation with current state', async ({ page }) => {
    console.log('🔍 Testing current task creation state...');
    
    // Monitor console for errors
    const errors: string[] = [];
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
      
      if (msg.type() === 'error') {
        errors.push(text);
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
    
    console.log('📝 Step 1: Check current tasks count');
    
    // Check current tasks
    const currentTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Current tasks: ${currentTasks.length}`);
    
    console.log('📝 Step 2: Open task creation form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    const hasCreateButton = await createButton.isVisible();
    console.log(`➕ Create button visible: ${hasCreateButton}`);
    
    if (!hasCreateButton) {
      console.log('❌ Create button not found');
      return;
    }
    
    await createButton.click();
    await page.waitForTimeout(2000);
    
    // Check if dialog opened
    const dialog = await page.locator('[role="dialog"]').first();
    const hasDialog = await dialog.isVisible();
    console.log(`📋 Dialog opened: ${hasDialog}`);
    
    if (!hasDialog) {
      console.log('❌ Dialog not opened');
      return;
    }
    
    console.log('📝 Step 3: Fill form completely');
    
    // Fill title
    const titleInput = await page.locator('input[placeholder*="tiêu đề"]').first();
    const hasTitleInput = await titleInput.isVisible();
    console.log(`📝 Title input visible: ${hasTitleInput}`);
    
    if (hasTitleInput) {
      await titleInput.fill('New Test Task - ' + Date.now());
      console.log('✅ Filled title');
    } else {
      console.log('❌ Title input not found');
      return;
    }
    
    // Fill description
    const descInput = await page.locator('textarea:first-of-type').first();
    const hasDescInput = await descInput.isVisible();
    console.log(`📝 Description input visible: ${hasDescInput}`);
    
    if (hasDescInput) {
      await descInput.fill('Test task description - ' + new Date().toISOString());
      console.log('✅ Filled description');
    }
    
    // Select task type
    console.log('📝 Selecting task type...');
    const taskTypeButtons = await page.locator('button:has-text("KTS mới"), button:has-text("KH/CĐT mới"), button:has-text("Báo cáo"), button:has-text("Họp"), button:has-text("Khác")').all();
    console.log(`📋 Task type buttons found: ${taskTypeButtons.length}`);
    
    if (taskTypeButtons.length > 0) {
      await taskTypeButtons[0].click();
      const buttonText = await taskTypeButtons[0].textContent();
      console.log(`✅ Selected task type: ${buttonText}`);
    } else {
      console.log('❌ No task type buttons found');
    }
    
    await page.waitForTimeout(1000);
    
    // Set dates
    console.log('📝 Setting dates...');
    const dateInputs = await page.locator('input[type="date"]').all();
    console.log(`📅 Date inputs found: ${dateInputs.length}`);
    
    if (dateInputs.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await dateInputs[0].fill(today);
      console.log('✅ Set start date');
      
      if (dateInputs.length > 1) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const deadlineDate = tomorrow.toISOString().split('T')[0];
        await dateInputs[1].fill(deadlineDate);
        console.log('✅ Set deadline');
      }
    }
    
    // Set visibility
    console.log('📝 Setting visibility...');
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    const hasPersonalButton = await personalButton.isVisible();
    
    if (hasPersonalButton) {
      await personalButton.click();
      console.log('✅ Selected personal visibility');
    } else {
      console.log('❌ Personal visibility button not found');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 4: Check save button state');
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    const isSaveButtonVisible = await saveButton.isVisible();
    const isSaveButtonEnabled = await saveButton.isEnabled();
    
    console.log(`💾 Save button visible: ${isSaveButtonVisible}`);
    console.log(`💾 Save button enabled: ${isSaveButtonEnabled}`);
    
    if (!isSaveButtonEnabled) {
      console.log('❌ Save button disabled, checking validation...');
      
      // Check for validation messages
      const validationElements = await page.locator('.text-red-500, .error, [role="alert"]').all();
      console.log(`⚠️ Validation elements: ${validationElements.length}`);
      
      for (let i = 0; i < validationElements.length; i++) {
        const text = await validationElements[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
      }
      
      return;
    }
    
    console.log('📝 Step 5: Submit form');
    
    // Clear previous errors and logs
    errors.length = 0;
    consoleLogs.length = 0;
    
    await saveButton.click({ force: true });
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 6: Check submission results');
    
    // Check for errors
    if (errors.length > 0) {
      console.log('🚨 Errors during submission:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors during submission');
    }
    
    // Check relevant console logs
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Adding new task') ||
      log.includes('Task added') ||
      log.includes('Error adding') ||
      log.includes('addTask') ||
      log.includes('Supabase') ||
      log.includes('error') ||
      log.includes('Error')
    );
    
    if (relevantLogs.length > 0) {
      console.log('\n📋 Relevant console logs:');
      relevantLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Check if dialog closed
    const dialogStillOpen = await dialog.isVisible();
    console.log(`📋 Dialog still open: ${dialogStillOpen}`);
    
    // Check for success toast
    const successToast = await page.locator(':has-text("Thành công"), .toast').first();
    const hasSuccessToast = await successToast.isVisible().catch(() => false);
    console.log(`✅ Success toast visible: ${hasSuccessToast}`);
    
    // Check tasks count after creation
    await page.waitForTimeout(3000);
    const newTasksCount = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after creation: ${newTasksCount.length}`);
    console.log(`📈 Tasks added: ${newTasksCount.length - currentTasks.length}`);
    
    if (newTasksCount.length > currentTasks.length) {
      console.log('🎉 SUCCESS: New task was created!');
    } else {
      console.log('❌ FAILED: No new task was created');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'current-task-creation-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
