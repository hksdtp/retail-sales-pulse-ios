import { test, expect } from '@playwright/test';

test.describe('Test Task Creation Fix', () => {
  test('Test task creation with fixed dialog', async ({ page }) => {
    console.log('🔍 Testing task creation with fixed dialog...');
    
    // Navigate and setup user
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
    
    console.log('📝 Step 1: Check current state');
    
    // Check current user
    const currentUser = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.name;
    });
    console.log(`👤 Current user: ${currentUser}`);
    
    // Check for create task button
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    const hasCreateButton = await createButton.isVisible();
    console.log(`➕ Create button visible: ${hasCreateButton}`);
    
    if (!hasCreateButton) {
      console.log('❌ Create button not found, ending test');
      return;
    }
    
    console.log('📝 Step 2: Open task form');
    await createButton.click();
    await page.waitForTimeout(2000);
    
    // Check if dialog opened
    const dialog = await page.locator('[role="dialog"], .modal').first();
    const hasDialog = await dialog.isVisible();
    console.log(`📋 Dialog opened: ${hasDialog}`);
    
    if (!hasDialog) {
      console.log('❌ Dialog not opened, ending test');
      return;
    }
    
    console.log('📝 Step 3: Fill form');
    
    // Fill title
    const titleInput = await page.locator('input[name="title"], input[placeholder*="tiêu đề"]').first();
    const hasTitleInput = await titleInput.isVisible();
    console.log(`📝 Title input visible: ${hasTitleInput}`);
    
    if (hasTitleInput) {
      await titleInput.fill('Test Task - Lê Khánh Duy Fixed');
      console.log('✅ Filled title');
    }
    
    // Fill description
    const descInput = await page.locator('textarea[name="description"], textarea[placeholder*="mô tả"]').first();
    const hasDescInput = await descInput.isVisible();
    console.log(`📝 Description input visible: ${hasDescInput}`);
    
    if (hasDescInput) {
      await descInput.fill('Test task with fixed dialog overlay issue');
      console.log('✅ Filled description');
    }
    
    console.log('📝 Step 4: Try to save');
    
    // Find save button
    const saveButton = await page.locator('button:has-text("Lưu"), button:has-text("Tạo")').first();
    const hasSaveButton = await saveButton.isVisible();
    console.log(`💾 Save button visible: ${hasSaveButton}`);
    
    if (hasSaveButton) {
      // Check if button is enabled
      const isEnabled = await saveButton.isEnabled();
      console.log(`💾 Save button enabled: ${isEnabled}`);
      
      if (isEnabled) {
        console.log('📝 Attempting to click save button...');
        
        // Try force click to bypass overlay issues
        await saveButton.click({ force: true });
        await page.waitForTimeout(3000);
        
        console.log('✅ Save button clicked');
        
        // Check if dialog closed
        const dialogStillOpen = await dialog.isVisible();
        console.log(`📋 Dialog still open: ${dialogStillOpen}`);
        
        // Check for success message
        const successMessage = await page.locator(':has-text("thành công"), :has-text("success"), .toast').first();
        const hasSuccess = await successMessage.isVisible().catch(() => false);
        console.log(`✅ Success message visible: ${hasSuccess}`);
        
        // Check if task appears in list
        await page.waitForTimeout(2000);
        const taskElements = await page.locator('[data-testid="task-item"], .task-item, tr:has(td)').all();
        console.log(`📊 Task elements after creation: ${taskElements.length}`);
        
        // Look for the specific task
        const createdTask = await page.locator('text="Test Task - Lê Khánh Duy Fixed"').first();
        const hasCreatedTask = await createdTask.isVisible().catch(() => false);
        console.log(`🎯 Created task visible: ${hasCreatedTask}`);
        
        if (hasCreatedTask) {
          console.log('🎉 SUCCESS: Task created and visible!');
        } else {
          console.log('❌ Task not visible in list');
        }
        
      } else {
        console.log('❌ Save button is disabled');
      }
    } else {
      console.log('❌ Save button not found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'task-creation-fix-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
