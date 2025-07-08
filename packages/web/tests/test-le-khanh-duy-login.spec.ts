import { test, expect } from '@playwright/test';

test.describe('Test Lê Khánh Duy Login and Task Creation', () => {
  test('Login as Lê Khánh Duy and create task', async ({ page }) => {
    console.log('🔍 Testing Lê Khánh Duy login and task creation...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleLogs.push(text);
    });
    
    // Navigate to login page
    await page.goto('http://localhost:8088/login');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Navigate to login page');
    
    // Check if login form is visible
    const loginForm = await page.locator('form, .login-form, [data-testid="login-form"]').first();
    const hasLoginForm = await loginForm.isVisible().catch(() => false);
    console.log(`📋 Login form visible: ${hasLoginForm}`);
    
    if (!hasLoginForm) {
      console.log('❌ Login form not found, checking page content...');
      const bodyText = await page.locator('body').textContent();
      console.log('Page content preview:', bodyText?.substring(0, 500));
      return;
    }
    
    // Look for location dropdown
    const locationDropdown = await page.locator('select, [role="combobox"], .select-trigger').first();
    const hasLocationDropdown = await locationDropdown.isVisible().catch(() => false);
    console.log(`📍 Location dropdown visible: ${hasLocationDropdown}`);
    
    if (hasLocationDropdown) {
      console.log('📝 Step 2: Select location - Hà Nội');
      await locationDropdown.click();
      await page.waitForTimeout(1000);
      
      // Try to select Hà Nội
      const hanoiOption = await page.locator('text="Hà Nội", [value="hanoi"]').first();
      const hasHanoiOption = await hanoiOption.isVisible().catch(() => false);
      
      if (hasHanoiOption) {
        await hanoiOption.click();
        console.log('✅ Selected Hà Nội');
      } else {
        console.log('❌ Hà Nội option not found');
        // List available options
        const options = await page.locator('option, [role="option"]').all();
        console.log(`Available options: ${options.length}`);
        for (let i = 0; i < Math.min(options.length, 5); i++) {
          const text = await options[i].textContent();
          console.log(`  ${i + 1}. ${text}`);
        }
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Look for user dropdown
    const userDropdown = await page.locator('select:nth-of-type(2), [data-testid="user-select"]').first();
    const hasUserDropdown = await userDropdown.isVisible().catch(() => false);
    console.log(`👤 User dropdown visible: ${hasUserDropdown}`);
    
    if (hasUserDropdown) {
      console.log('📝 Step 3: Select user - Lê Khánh Duy');
      await userDropdown.click();
      await page.waitForTimeout(1000);
      
      // Try to select Lê Khánh Duy
      const khanhDuyOption = await page.locator('text="Lê Khánh Duy"').first();
      const hasKhanhDuyOption = await khanhDuyOption.isVisible().catch(() => false);
      
      if (hasKhanhDuyOption) {
        await khanhDuyOption.click();
        console.log('✅ Selected Lê Khánh Duy');
      } else {
        console.log('❌ Lê Khánh Duy option not found');
        // List available users
        const userOptions = await page.locator('option, [role="option"]').all();
        console.log(`Available users: ${userOptions.length}`);
        for (let i = 0; i < Math.min(userOptions.length, 10); i++) {
          const text = await userOptions[i].textContent();
          console.log(`  ${i + 1}. ${text}`);
        }
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Look for password input
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="mật khẩu"]').first();
    const hasPasswordInput = await passwordInput.isVisible().catch(() => false);
    console.log(`🔐 Password input visible: ${hasPasswordInput}`);
    
    if (hasPasswordInput) {
      console.log('📝 Step 4: Enter password');
      await passwordInput.fill('123456'); // Default password
      console.log('✅ Entered default password');
      await page.waitForTimeout(1000);
    }
    
    // Look for login button
    const loginButton = await page.locator('button[type="submit"], button:has-text("Đăng nhập"), .login-button').first();
    const hasLoginButton = await loginButton.isVisible().catch(() => false);
    console.log(`🔘 Login button visible: ${hasLoginButton}`);
    
    if (hasLoginButton) {
      console.log('📝 Step 5: Click login button');
      await loginButton.click();
      await page.waitForTimeout(5000);
      
      // Check if redirected to password change or tasks page
      const currentUrl = page.url();
      console.log(`📍 Current URL after login: ${currentUrl}`);
      
      if (currentUrl.includes('tasks')) {
        console.log('✅ Successfully logged in and redirected to tasks page');
        
        // Test task creation
        console.log('📝 Step 6: Test task creation');
        
        // Look for create task button
        const createTaskButton = await page.locator('button:has-text("Tạo công việc"), button:has-text("Thêm"), .create-task-btn').first();
        const hasCreateTaskButton = await createTaskButton.isVisible().catch(() => false);
        console.log(`➕ Create task button visible: ${hasCreateTaskButton}`);
        
        if (hasCreateTaskButton) {
          await createTaskButton.click();
          await page.waitForTimeout(2000);
          
          // Check if task form opened
          const taskForm = await page.locator('.task-form, [data-testid="task-form"], .modal').first();
          const hasTaskForm = await taskForm.isVisible().catch(() => false);
          console.log(`📋 Task form visible: ${hasTaskForm}`);
          
          if (hasTaskForm) {
            // Fill task form
            const titleInput = await page.locator('input[placeholder*="tiêu đề"], input[name="title"]').first();
            const hasTitleInput = await titleInput.isVisible().catch(() => false);
            
            if (hasTitleInput) {
              await titleInput.fill('Test Task - Lê Khánh Duy');
              console.log('✅ Filled task title');
              
              // Look for description
              const descInput = await page.locator('textarea[placeholder*="mô tả"], textarea[name="description"]').first();
              const hasDescInput = await descInput.isVisible().catch(() => false);
              
              if (hasDescInput) {
                await descInput.fill('Test task created by Lê Khánh Duy');
                console.log('✅ Filled task description');
              }
              
              // Look for save button
              const saveButton = await page.locator('button:has-text("Lưu"), button:has-text("Tạo"), button[type="submit"]').first();
              const hasSaveButton = await saveButton.isVisible().catch(() => false);
              
              if (hasSaveButton) {
                await saveButton.click();
                await page.waitForTimeout(3000);
                console.log('✅ Clicked save button');
                
                // Check if task was created
                const taskList = await page.locator('.task-item, [data-testid="task-item"], tr:has(td)').all();
                console.log(`📊 Tasks found after creation: ${taskList.length}`);
                
                // Look for the created task
                const createdTask = await page.locator('text="Test Task - Lê Khánh Duy"').first();
                const hasCreatedTask = await createdTask.isVisible().catch(() => false);
                console.log(`✅ Created task visible: ${hasCreatedTask}`);
              } else {
                console.log('❌ Save button not found');
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
        
      } else if (currentUrl.includes('password') || page.locator(':has-text("Đổi mật khẩu")').isVisible()) {
        console.log('🔐 Redirected to password change page');
        
        // Handle password change
        const newPasswordInput = await page.locator('input[placeholder*="mật khẩu mới"]').first();
        const confirmPasswordInput = await page.locator('input[placeholder*="xác nhận"]').first();
        
        if (await newPasswordInput.isVisible() && await confirmPasswordInput.isVisible()) {
          await newPasswordInput.fill('newpassword123');
          await confirmPasswordInput.fill('newpassword123');
          
          const changePasswordButton = await page.locator('button:has-text("Đổi mật khẩu")').first();
          if (await changePasswordButton.isVisible()) {
            await changePasswordButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Password changed, should redirect to tasks');
          }
        }
      } else {
        console.log('❌ Login failed or unexpected redirect');
      }
    }
    
    // Log relevant console messages
    console.log('\n📋 Relevant console logs:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('TaskManagementView') ||
      log.includes('currentUser') ||
      log.includes('Lê Khánh Duy') ||
      log.includes('error') ||
      log.includes('Error')
    );
    
    relevantLogs.slice(-10).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'le-khanh-duy-test.png', fullPage: true });
    
    console.log('\n✅ Test completed');
  });
});
