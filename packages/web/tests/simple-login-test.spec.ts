import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('Test login flow and clear mock data', async ({ page }) => {
    console.log('🔍 Testing login flow and clearing mock data...');
    
    // Navigate to app
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Clear localStorage first
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Navigate to login
    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Manual login setup');
    
    // Setup Lê Khánh Duy user directly
    await page.evaluate(() => {
      const leKhanhDuyUser = {
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
      
      localStorage.setItem('currentUser', JSON.stringify(leKhanhDuyUser));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authToken', 'test-token-khanh-duy');
      
      console.log('✅ Setup Lê Khánh Duy user data');
    });
    
    // Navigate to tasks page
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Check tasks page');
    
    // Check current user
    const currentUserInfo = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return {
        name: user.name,
        role: user.role,
        id: user.id
      };
    });
    
    console.log('👤 Current user:', currentUserInfo);
    
    // Check for tasks
    const taskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
    console.log(`📊 Task elements found: ${taskElements.length}`);
    
    // Check for empty state
    const emptyStateElements = await page.locator(':has-text("Chưa có công việc"), :has-text("No tasks")').all();
    console.log(`📝 Empty state elements: ${emptyStateElements.length}`);
    
    // Check for tabs
    const tabs = ['Của tôi', 'Của nhóm', 'Thành viên', 'Chung'];
    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isVisible = await tab.isVisible().catch(() => false);
      console.log(`📋 Tab "${tabName}" visible: ${isVisible}`);
      
      if (isVisible) {
        await tab.click();
        await page.waitForTimeout(1000);
        
        const tabTasks = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
        console.log(`📊 Tasks in "${tabName}" tab: ${tabTasks.length}`);
      }
    }
    
    // Test create task
    console.log('📝 Step 3: Test create task');
    
    const createTaskButton = await page.locator('button:has-text("Tạo công việc")').first();
    const hasCreateButton = await createTaskButton.isVisible().catch(() => false);
    console.log(`➕ Create task button visible: ${hasCreateButton}`);
    
    if (hasCreateButton) {
      await createTaskButton.click();
      await page.waitForTimeout(2000);
      
      // Check if modal/form opened
      const taskForm = await page.locator('.modal, .dialog, [role="dialog"]').first();
      const hasTaskForm = await taskForm.isVisible().catch(() => false);
      console.log(`📋 Task form opened: ${hasTaskForm}`);
      
      if (hasTaskForm) {
        // Try to fill form
        const titleInput = await page.locator('input[name="title"], input[placeholder*="tiêu đề"]').first();
        const hasTitleInput = await titleInput.isVisible().catch(() => false);
        
        if (hasTitleInput) {
          await titleInput.fill('Test Task - Lê Khánh Duy');
          console.log('✅ Filled task title');
          
          // Look for description
          const descInput = await page.locator('textarea[name="description"], textarea[placeholder*="mô tả"]').first();
          const hasDescInput = await descInput.isVisible().catch(() => false);
          
          if (hasDescInput) {
            await descInput.fill('Test task created by Lê Khánh Duy');
            console.log('✅ Filled task description');
          }
          
          // Look for save button
          const saveButton = await page.locator('button:has-text("Lưu"), button:has-text("Tạo"), button[type="submit"]').first();
          const hasSaveButton = await saveButton.isVisible().catch(() => false);
          
          if (hasSaveButton) {
            console.log('📝 Attempting to save task...');
            await saveButton.click();
            await page.waitForTimeout(3000);
            
            // Check for success
            const successMessage = await page.locator(':has-text("thành công"), :has-text("success")').first();
            const hasSuccess = await successMessage.isVisible().catch(() => false);
            console.log(`✅ Success message visible: ${hasSuccess}`);
            
            // Check if task appears in list
            const newTaskElements = await page.locator('[data-testid="task-item"], .task-item, .task-card, tr:has(td)').all();
            console.log(`📊 Task elements after creation: ${newTaskElements.length}`);
            
            // Look for the specific task
            const createdTask = await page.locator('text="Test Task - Lê Khánh Duy"').first();
            const hasCreatedTask = await createdTask.isVisible().catch(() => false);
            console.log(`🎯 Created task visible: ${hasCreatedTask}`);
            
          } else {
            console.log('❌ Save button not found');
            
            // Debug form elements
            const formElements = await page.locator('button, input, textarea, select').all();
            console.log(`🔍 Form elements found: ${formElements.length}`);
            
            for (let i = 0; i < Math.min(formElements.length, 10); i++) {
              const element = formElements[i];
              const tagName = await element.evaluate(el => el.tagName);
              const text = await element.textContent().catch(() => '');
              const placeholder = await element.getAttribute('placeholder').catch(() => '');
              console.log(`  ${i + 1}. ${tagName}: "${text}" placeholder="${placeholder}"`);
            }
          }
        } else {
          console.log('❌ Title input not found');
        }
      } else {
        console.log('❌ Task form not opened');
      }
    } else {
      console.log('❌ Create task button not found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'simple-login-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
