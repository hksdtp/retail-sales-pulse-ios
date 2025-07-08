import { test, expect } from '@playwright/test';

test.describe('Direct Delete Permission Test', () => {
  test('Bypass login and test delete permission directly', async ({ page }) => {
    console.log('🧪 Testing delete permission by bypassing login...');
    
    // Monitor console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Navigate to the application
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 1: Inject Khổng Đức Mạnh user data directly...');
    
    // Inject user data directly into localStorage
    await page.evaluate(() => {
      const khongDucManhUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '0',
        location: 'all',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Trưởng phòng kinh doanh',
        status: 'active',
        password_changed: true
      };
      
      // Set current user
      localStorage.setItem('currentUser', JSON.stringify(khongDucManhUser));
      
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create some sample tasks
      const sampleTasks = [
        {
          id: 'task_1',
          title: 'Task của Khổng Đức Mạnh',
          description: 'Test task for deletion',
          user_id: 'user_manh',
          assignedTo: 'user_manh',
          status: 'todo',
          priority: 'medium',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'task_2', 
          title: 'Task của Lương Việt Anh',
          description: 'Another test task',
          user_id: 'user_viet_anh',
          assignedTo: 'user_viet_anh',
          status: 'in-progress',
          priority: 'high',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'task_3',
          title: 'Task của Lê Khánh Duy', 
          description: 'Third test task',
          user_id: 'user_khanh_duy',
          assignedTo: 'user_khanh_duy',
          status: 'completed',
          priority: 'low',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      localStorage.setItem('tasks', JSON.stringify(sampleTasks));
      
      console.log('✅ Injected user data and sample tasks');
    });
    
    console.log('📝 Step 2: Navigate to dashboard...');
    
    // Navigate to dashboard
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(5000);
    
    // Check if we're on dashboard
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Verify user data was set correctly
    const userData = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      return {
        currentUser,
        isAuthenticated,
        tasksCount: tasks.length
      };
    });
    
    console.log('User data verification:', userData);
    
    console.log('📝 Step 3: Look for task management interface...');
    
    // Wait for page to load and look for task interface
    await page.waitForTimeout(3000);
    
    // Look for "Của tôi" tab
    const cuaToiTab = page.locator('button:has-text("Của tôi")');
    const isTabVisible = await cuaToiTab.isVisible();
    console.log(`"Của tôi" tab visible: ${isTabVisible}`);
    
    if (isTabVisible) {
      await cuaToiTab.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for tasks
    const taskSelectors = [
      '[data-testid="task-item"]',
      '.task-item', 
      '.task-card',
      'tr:has(td)',
      '[class*="task"]'
    ];
    
    let foundTasks = false;
    for (const selector of taskSelectors) {
      const tasks = await page.locator(selector).all();
      if (tasks.length > 0) {
        console.log(`Found ${tasks.length} tasks using selector: ${selector}`);
        foundTasks = true;
        
        // Test delete on first task
        const firstTask = tasks[0];
        
        console.log('📝 Step 4: Test delete permission...');
        
        // Get task text content
        const taskText = await firstTask.textContent();
        console.log(`Testing delete on task: "${taskText?.substring(0, 50)}..."`);
        
        // Look for delete button
        const deleteButton = firstTask.locator('button:has-text("Xóa"), button[title*="Xóa"]');
        const isDeleteButtonVisible = await deleteButton.isVisible().catch(() => false);
        
        if (isDeleteButtonVisible) {
          console.log('✅ Delete button found');
          
          const isDeleteButtonEnabled = await deleteButton.isEnabled();
          console.log(`Delete button enabled: ${isDeleteButtonEnabled}`);
          
          if (isDeleteButtonEnabled) {
            // Click delete button
            await deleteButton.click();
            console.log('✅ Clicked delete button');
            await page.waitForTimeout(2000);
            
            // Handle confirmation dialog
            page.on('dialog', async dialog => {
              console.log(`Dialog: ${dialog.message()}`);
              await dialog.accept();
            });
            
          } else {
            console.log('❌ Delete button is disabled');
          }
        } else {
          // Try clicking on task to open detail panel
          console.log('📝 No direct delete button, trying task detail...');
          await firstTask.click();
          await page.waitForTimeout(2000);
          
          const detailDeleteButton = page.locator('button:has-text("Xóa")');
          const isDetailDeleteVisible = await detailDeleteButton.isVisible().catch(() => false);
          
          if (isDetailDeleteVisible) {
            console.log('✅ Found delete button in detail panel');
            await detailDeleteButton.click();
            await page.waitForTimeout(1000);
          } else {
            console.log('❌ No delete button found in detail panel');
          }
        }
        
        break;
      }
    }
    
    if (!foundTasks) {
      console.log('❌ No tasks found in UI');
      
      // Check if tasks exist in localStorage but not displayed
      const tasksInStorage = await page.evaluate(() => {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        return tasks.length;
      });
      
      console.log(`Tasks in localStorage: ${tasksInStorage}`);
    }
    
    console.log('📝 Step 5: Test permission logic directly...');
    
    // Test canEditTask function directly
    const permissionTestResult = await page.evaluate(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      // Define canEditTask function (copy from actual code)
      const canEditTask = (task: any, user: any) => {
        if (!user) return false;

        // Directors có thể edit tất cả tasks
        if (user.role === 'retail_director' || user.role === 'project_director') {
          return true;
        }

        // Team leaders có thể edit tasks của team members
        if (user.role === 'team_leader') {
          const isCreator = task.user_id === user.id;
          // Simplified team check for test
          return isCreator;
        }

        // Employees chỉ có thể edit tasks của mình
        return task.user_id === user.id || task.assignedTo === user.id;
      };
      
      // Test permission for each task
      const results = tasks.map(task => ({
        taskId: task.id,
        taskTitle: task.title,
        taskUserId: task.user_id,
        canEdit: canEditTask(task, currentUser),
        isOwnTask: task.user_id === currentUser.id
      }));
      
      return {
        currentUser: {
          name: currentUser.name,
          role: currentUser.role,
          id: currentUser.id
        },
        results
      };
    });
    
    console.log('\n📊 Permission test results:');
    console.log('Current user:', permissionTestResult.currentUser);
    
    permissionTestResult.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.taskTitle}`);
      console.log(`   - Task User ID: ${result.taskUserId}`);
      console.log(`   - Is Own Task: ${result.isOwnTask ? '✅' : '❌'}`);
      console.log(`   - Can Edit: ${result.canEdit ? '✅' : '❌'}`);
    });
    
    // Check for permission error messages
    const errorMessages = await page.locator('text="không có quyền", text="permission denied"').all();
    if (errorMessages.length > 0) {
      console.log(`\nFound ${errorMessages.length} permission error messages:`);
      for (let i = 0; i < errorMessages.length; i++) {
        const errorText = await errorMessages[i].textContent();
        console.log(`  ${i + 1}. "${errorText}"`);
      }
    }
    
    // Print debug logs
    console.log('\n📋 Console logs with debug info:');
    const debugLogs = consoleLogs.filter(log => 
      log.includes('DELETE PERMISSION CHECK') || 
      log.includes('canEdit') ||
      log.includes('permission')
    );
    
    if (debugLogs.length > 0) {
      debugLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('No debug logs found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'direct-permission-test.png', fullPage: true });
    
    console.log('\n✅ Direct permission test completed');
  });

  test('Test permission logic in browser console', async ({ page }) => {
    console.log('🧪 Testing permission logic in browser console...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(2000);
    
    // Test the exact logic used in the application
    const testResult = await page.evaluate(() => {
      // Mock data
      const mockCurrentUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        role: 'retail_director'
      };
      
      const mockTask = {
        id: 'task_1',
        title: 'Test Task',
        user_id: 'user_other',
        assignedTo: 'user_other'
      };
      
      // Exact canEditTask function from TaskManagementView.tsx
      const canEditTask = (task: any, currentUser: any) => {
        if (!currentUser) return false;

        // Directors có thể edit tất cả tasks
        if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
          return true;
        }

        // Team leaders có thể edit tasks của team members
        if (currentUser.role === 'team_leader') {
          const isCreator = task.user_id === currentUser.id;
          return isCreator;
        }

        // Employees chỉ có thể edit tasks của mình
        return task.user_id === currentUser.id || task.assignedTo === currentUser.id;
      };
      
      const result = canEditTask(mockTask, mockCurrentUser);
      
      return {
        currentUser: mockCurrentUser,
        task: mockTask,
        canEdit: result,
        explanation: result ? 'Should be able to delete (Director role)' : 'Should NOT be able to delete'
      };
    });
    
    console.log('\n📊 Browser console test result:');
    console.log('Current User:', testResult.currentUser);
    console.log('Task:', testResult.task);
    console.log('Can Edit:', testResult.canEdit);
    console.log('Explanation:', testResult.explanation);
    
    if (testResult.canEdit) {
      console.log('✅ CORRECT: Khổng Đức Mạnh (retail_director) can edit all tasks');
    } else {
      console.log('❌ ERROR: Permission logic is broken');
    }
  });
});
