import { test, expect } from '@playwright/test';

test.describe('Test Constraint Fix', () => {
  test('Test task creation with fixed type constraint', async ({ page }) => {
    console.log('🔍 Testing task creation with fixed type constraint...');
    
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
    
    const currentTasks = await page.locator('tr:has(td)').all();
    console.log(`📊 Current tasks: ${currentTasks.length}`);
    
    console.log('📝 Step 2: Open task creation form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 3: Fill form with task type that should be mapped');
    
    // Fill title
    const titleInput = await page.locator('#task-title').first();
    await titleInput.fill('Constraint Fix Test - ' + Date.now());
    console.log('✅ Filled title');
    
    // Fill description
    const descTextarea = await page.locator('#task-description').first();
    await descTextarea.fill('Test task with constraint fix - should map UI type to database type');
    console.log('✅ Filled description');
    
    // Select a task type that needs mapping (e.g., SBG mới -> work)
    console.log('📝 Selecting task type that needs mapping...');
    
    // Look for SBG mới button (should map to 'work')
    const sbgButton = await page.locator('button:has-text("SBG mới")').first();
    const hasSbgButton = await sbgButton.isVisible();
    
    if (hasSbgButton) {
      await sbgButton.click();
      console.log('✅ Selected "SBG mới" (should map to "work")');
    } else {
      // Fallback to any available task type
      const anyTypeButton = await page.locator('button:has-text("Đối tác mới"), button:has-text("KH/CĐT mới"), button:has-text("Khác")').first();
      const hasAnyButton = await anyTypeButton.isVisible();
      
      if (hasAnyButton) {
        await anyTypeButton.click();
        const buttonText = await anyTypeButton.textContent();
        console.log(`✅ Selected task type: ${buttonText}`);
      } else {
        console.log('❌ No task type buttons found');
      }
    }
    
    // Select visibility
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    const hasPersonalButton = await personalButton.isVisible();
    
    if (hasPersonalButton) {
      await personalButton.click();
      console.log('✅ Selected personal visibility');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 4: Submit form');
    
    // Clear previous logs to focus on submission
    errors.length = 0;
    consoleLogs.length = 0;
    
    const saveButton = await page.locator('button:has-text("Lưu")').first();
    const isEnabled = await saveButton.isEnabled();
    console.log(`💾 Save button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Save button disabled');
      return;
    }
    
    await saveButton.click({ force: true });
    await page.waitForTimeout(8000); // Wait longer for processing
    
    console.log('📝 Step 5: Check results');
    
    // Check for constraint error specifically
    const constraintErrors = errors.filter(error => 
      error.includes('tasks_type_check') ||
      error.includes('check constraint') ||
      error.includes('violates')
    );
    
    if (constraintErrors.length > 0) {
      console.log('\n🚨 Constraint Errors:');
      constraintErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No constraint errors');
    }
    
    // Check for error toast
    const errorToast = await page.locator(':has-text("Failed to add task"), :has-text("Lỗi")').first();
    const hasErrorToast = await errorToast.isVisible().catch(() => false);
    console.log(`🚨 Error toast visible: ${hasErrorToast}`);
    
    // Check for success toast
    const successToast = await page.locator(':has-text("Thành công")').first();
    const hasSuccessToast = await successToast.isVisible().catch(() => false);
    console.log(`✅ Success toast visible: ${hasSuccessToast}`);
    
    // Check all console errors
    if (errors.length > 0) {
      console.log('\n🚨 All Console Errors:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors');
    }
    
    // Check relevant logs
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Adding new task') ||
      log.includes('Task added') ||
      log.includes('Error adding') ||
      log.includes('Failed') ||
      log.includes('Supabase') ||
      log.includes('type') ||
      log.includes('constraint')
    );
    
    if (relevantLogs.length > 0) {
      console.log('\n📋 Relevant Console Logs:');
      relevantLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    }
    
    // Check if dialog closed
    const dialog = await page.locator('[role="dialog"]').first();
    const dialogStillOpen = await dialog.isVisible();
    console.log(`📋 Dialog still open: ${dialogStillOpen}`);
    
    // Check task count
    await page.waitForTimeout(2000);
    const newTasksCount = await page.locator('tr:has(td)').all();
    console.log(`📊 Tasks after creation: ${newTasksCount.length}`);
    console.log(`📈 Tasks added: ${newTasksCount.length - currentTasks.length}`);
    
    if (newTasksCount.length > currentTasks.length) {
      console.log('🎉 SUCCESS: New task was created!');
    } else {
      console.log('❌ FAILED: No new task was created');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'constraint-fix-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
