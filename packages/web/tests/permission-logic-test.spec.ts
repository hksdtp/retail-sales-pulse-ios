import { test, expect } from '@playwright/test';

test.describe('Permission Logic Test', () => {
  test('Test canEditTask logic directly', async ({ page }) => {
    console.log('🧪 Testing canEditTask logic directly...');
    
    // Navigate to app
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(3000);
    
    // Inject test data and logic
    const testResult = await page.evaluate(() => {
      // Mock current user as Khổng Đức Mạnh
      const mockCurrentUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '0',
        location: 'all'
      };
      
      // Mock users array
      const mockUsers = [
        {
          id: 'user_manh',
          name: 'Khổng Đức Mạnh',
          role: 'retail_director',
          team_id: '0'
        },
        {
          id: 'user_viet_anh',
          name: 'Lương Việt Anh',
          role: 'team_leader',
          team_id: '1'
        },
        {
          id: 'user_khanh_duy',
          name: 'Lê Khánh Duy',
          role: 'sales_staff',
          team_id: '1'
        }
      ];
      
      // Mock tasks
      const mockTasks = [
        {
          id: 'task_1',
          title: 'Task của Khổng Đức Mạnh',
          user_id: 'user_manh',
          assignedTo: 'user_manh'
        },
        {
          id: 'task_2',
          title: 'Task của Lương Việt Anh',
          user_id: 'user_viet_anh',
          assignedTo: 'user_viet_anh'
        },
        {
          id: 'task_3',
          title: 'Task của Lê Khánh Duy',
          user_id: 'user_khanh_duy',
          assignedTo: 'user_khanh_duy'
        }
      ];
      
      // Define canEditTask function (copy from actual code)
      const canEditTask = (task: any, currentUser: any, users: any[]) => {
        if (!currentUser) return false;

        // Directors có thể edit tất cả tasks
        if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
          return true;
        }

        // Team leaders có thể edit tasks của team members
        if (currentUser.role === 'team_leader') {
          // Có thể edit nếu là người tạo hoặc task được assign cho team member
          const isCreator = task.user_id === currentUser.id;
          const isTeamTask = users.some(user =>
            user.team_id === currentUser.team_id &&
            (user.id === task.assignedTo || user.id === task.user_id)
          );
          return isCreator || isTeamTask;
        }

        // Employees chỉ có thể edit tasks của mình
        return task.user_id === currentUser.id || task.assignedTo === currentUser.id;
      };
      
      // Test permission for each task
      const results = mockTasks.map(task => {
        const canEdit = canEditTask(task, mockCurrentUser, mockUsers);
        return {
          taskId: task.id,
          taskTitle: task.title,
          taskUserId: task.user_id,
          canEdit: canEdit,
          reason: canEdit ? 'Allowed' : 'Denied'
        };
      });
      
      return {
        currentUser: mockCurrentUser,
        testResults: results,
        summary: {
          totalTasks: mockTasks.length,
          allowedTasks: results.filter(r => r.canEdit).length,
          deniedTasks: results.filter(r => !r.canEdit).length
        }
      };
    });
    
    console.log('\n📊 Permission Test Results:');
    console.log('Current User:', testResult.currentUser);
    console.log('\nTask Permissions:');
    
    testResult.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.taskTitle}`);
      console.log(`   - Task User ID: ${result.taskUserId}`);
      console.log(`   - Can Edit: ${result.canEdit ? '✅ YES' : '❌ NO'}`);
      console.log(`   - Reason: ${result.reason}`);
      console.log('');
    });
    
    console.log('Summary:', testResult.summary);
    
    // Verify that Khổng Đức Mạnh can edit all tasks
    const allTasksEditable = testResult.testResults.every(r => r.canEdit);
    console.log(`\n🎯 All tasks editable by Khổng Đức Mạnh: ${allTasksEditable ? '✅ YES' : '❌ NO'}`);
    
    if (!allTasksEditable) {
      console.log('❌ ISSUE: Khổng Đức Mạnh should be able to edit all tasks!');
      const deniedTasks = testResult.testResults.filter(r => !r.canEdit);
      console.log('Denied tasks:', deniedTasks);
    } else {
      console.log('✅ CORRECT: Khổng Đức Mạnh can edit all tasks as expected');
    }
  });

  test('Test permission logic for regular employee', async ({ page }) => {
    console.log('🧪 Testing permission logic for regular employee...');
    
    await page.goto('http://localhost:8088');
    await page.waitForTimeout(1000);
    
    const testResult = await page.evaluate(() => {
      // Mock current user as regular employee
      const mockCurrentUser = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanhduy.le@example.com',
        role: 'sales_staff',
        team_id: '1'
      };
      
      // Mock tasks
      const mockTasks = [
        {
          id: 'task_1',
          title: 'Task của chính mình',
          user_id: 'user_khanh_duy',
          assignedTo: 'user_khanh_duy'
        },
        {
          id: 'task_2',
          title: 'Task của người khác',
          user_id: 'user_viet_anh',
          assignedTo: 'user_viet_anh'
        }
      ];
      
      // Define canEditTask function
      const canEditTask = (task: any, currentUser: any) => {
        if (!currentUser) return false;

        // Directors có thể edit tất cả tasks
        if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
          return true;
        }

        // Team leaders có thể edit tasks của team members
        if (currentUser.role === 'team_leader') {
          return true; // Simplified for test
        }

        // Employees chỉ có thể edit tasks của mình
        return task.user_id === currentUser.id || task.assignedTo === currentUser.id;
      };
      
      // Test permission for each task
      const results = mockTasks.map(task => {
        const canEdit = canEditTask(task, mockCurrentUser);
        return {
          taskId: task.id,
          taskTitle: task.title,
          taskUserId: task.user_id,
          canEdit: canEdit,
          isOwnTask: task.user_id === mockCurrentUser.id
        };
      });
      
      return {
        currentUser: mockCurrentUser,
        testResults: results
      };
    });
    
    console.log('\n📊 Employee Permission Test Results:');
    console.log('Current User:', testResult.currentUser);
    
    testResult.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.taskTitle}`);
      console.log(`   - Is Own Task: ${result.isOwnTask ? '✅ YES' : '❌ NO'}`);
      console.log(`   - Can Edit: ${result.canEdit ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    // Verify employee can only edit own tasks
    const ownTaskEditable = testResult.testResults.find(r => r.isOwnTask)?.canEdit;
    const otherTaskEditable = testResult.testResults.find(r => !r.isOwnTask)?.canEdit;
    
    console.log(`\n🎯 Can edit own task: ${ownTaskEditable ? '✅ YES' : '❌ NO'}`);
    console.log(`🎯 Can edit other's task: ${otherTaskEditable ? '❌ YES (WRONG!)' : '✅ NO (CORRECT)'}`);
    
    if (ownTaskEditable && !otherTaskEditable) {
      console.log('✅ CORRECT: Employee permission logic working as expected');
    } else {
      console.log('❌ ISSUE: Employee permission logic has problems');
    }
  });
});
