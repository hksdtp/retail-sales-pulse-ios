import { test, expect } from '@playwright/test';

test.describe('Test Fixed Form Attributes', () => {
  test('Test task creation with fixed form id/name attributes', async ({ page }) => {
    console.log('🔍 Testing task creation with fixed form attributes...');
    
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
    
    console.log('📝 Step 3: Check form elements have proper id/name attributes');
    
    // Check title input
    const titleInput = await page.locator('#task-title').first();
    const hasTitleInput = await titleInput.isVisible();
    console.log(`📝 Title input (#task-title) visible: ${hasTitleInput}`);
    
    if (hasTitleInput) {
      const titleName = await titleInput.getAttribute('name');
      console.log(`📝 Title input name attribute: "${titleName}"`);
    }
    
    // Check description textarea
    const descTextarea = await page.locator('#task-description').first();
    const hasDescTextarea = await descTextarea.isVisible();
    console.log(`📝 Description textarea (#task-description) visible: ${hasDescTextarea}`);
    
    if (hasDescTextarea) {
      const descName = await descTextarea.getAttribute('name');
      console.log(`📝 Description textarea name attribute: "${descName}"`);
    }
    
    console.log('📝 Step 4: Fill form with proper selectors');
    
    // Fill title using id selector
    if (hasTitleInput) {
      await titleInput.fill('Fixed Form Test - ' + Date.now());
      console.log('✅ Filled title using #task-title');
    }
    
    // Fill description using id selector
    if (hasDescTextarea) {
      await descTextarea.fill('Test task with fixed form attributes');
      console.log('✅ Filled description using #task-description');
    }
    
    // Select task type
    const taskTypeButtons = await page.locator('button:has-text("Khác")').first();
    const hasKhacButton = await taskTypeButtons.isVisible();
    
    if (hasKhacButton) {
      await taskTypeButtons.click();
      console.log('✅ Selected "Khác" task type');
    }
    
    // Select visibility
    const personalButton = await page.locator('button:has-text("Cá nhân")').first();
    const hasPersonalButton = await personalButton.isVisible();
    
    if (hasPersonalButton) {
      await personalButton.click();
      console.log('✅ Selected personal visibility');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 5: Submit form');
    
    // Clear previous logs
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
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 6: Check results');
    
    // Check for error toast
    const errorToast = await page.locator(':has-text("Failed to add task"), :has-text("Lỗi")').first();
    const hasErrorToast = await errorToast.isVisible().catch(() => false);
    console.log(`🚨 Error toast visible: ${hasErrorToast}`);
    
    // Check for success toast
    const successToast = await page.locator(':has-text("Thành công")').first();
    const hasSuccessToast = await successToast.isVisible().catch(() => false);
    console.log(`✅ Success toast visible: ${hasSuccessToast}`);
    
    // Check console errors
    if (errors.length > 0) {
      console.log('\n🚨 Console Errors:');
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
      log.includes('Supabase')
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
    await page.screenshot({ path: 'fixed-form-attributes-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
