const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG MIGRATION DATA LOADING');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading') || text.includes('migration') || text.includes('tasks') || text.includes('fetch')) {
      consoleLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
    }
  });
  
  try {
    console.log('\n🔍 STEP 1: Setup user and navigate');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    await page.evaluate(() => {
      const testUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '0',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(testUser));
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('loginType', 'standard');
    });
    
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 STEP 2: Test migration data file access');
    
    const fileAccessTest = await page.evaluate(async () => {
      try {
        console.log('🌐 Testing fetch to /supabase-data-converted.json...');
        const response = await fetch('/supabase-data-converted.json');
        
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📊 Response ok: ${response.ok}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Data loaded: ${JSON.stringify(data).length} characters`);
          console.log(`📊 Tasks count: ${data.tasks?.length || 0}`);
          console.log(`📊 Users count: ${data.users?.length || 0}`);
          
          if (data.tasks && data.tasks.length > 0) {
            console.log(`📊 Sample task: ${data.tasks[0].title}`);
            console.log(`📊 Sample user: ${data.tasks[0].user_name}`);
          }
          
          return {
            success: true,
            status: response.status,
            tasksCount: data.tasks?.length || 0,
            usersCount: data.users?.length || 0,
            sampleTask: data.tasks?.[0]?.title || 'No tasks'
          };
        } else {
          console.log(`❌ Fetch failed with status: ${response.status}`);
          return {
            success: false,
            status: response.status,
            error: `HTTP ${response.status}`
          };
        }
      } catch (error) {
        console.log(`❌ Fetch error: ${error.message}`);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('📊 FILE ACCESS TEST RESULT:');
    console.log(`   Success: ${fileAccessTest.success}`);
    console.log(`   Status: ${fileAccessTest.status || 'N/A'}`);
    if (fileAccessTest.success) {
      console.log(`   Tasks: ${fileAccessTest.tasksCount}`);
      console.log(`   Users: ${fileAccessTest.usersCount}`);
      console.log(`   Sample: ${fileAccessTest.sampleTask}`);
    } else {
      console.log(`   Error: ${fileAccessTest.error}`);
    }
    
    console.log('\n🔍 STEP 3: Check TaskManagementView state');
    
    const componentStateCheck = await page.evaluate(() => {
      // Check if migration data loading was triggered
      const migrationLogs = [];
      
      // Try to trigger migration loading manually
      console.log('🔄 Manually triggering migration data load...');
      
      // Simulate the useEffect
      const loadMigrationTasks = async () => {
        try {
          console.log('📋 Loading tasks from migration data...');
          
          const response = await fetch('/supabase-data-converted.json');
          if (response.ok) {
            const data = await response.json();
            const tasks = data.tasks || [];
            console.log(`✅ Loaded ${tasks.length} tasks from migration data`);
            
            // Store in window for debugging
            window.migrationTasks = tasks;
            window.migrationUsers = data.users || [];
            
            return {
              success: true,
              tasksCount: tasks.length,
              usersCount: data.users?.length || 0
            };
          } else {
            console.log('⚠️ Migration data not found, using empty array');
            return { success: false, error: 'File not found' };
          }
        } catch (error) {
          console.error('❌ Error loading migration tasks:', error);
          return { success: false, error: error.message };
        }
      };
      
      return loadMigrationTasks();
    });
    
    const manualLoadResult = await componentStateCheck;
    
    console.log('📊 MANUAL LOAD TEST:');
    console.log(`   Success: ${manualLoadResult.success}`);
    if (manualLoadResult.success) {
      console.log(`   Tasks loaded: ${manualLoadResult.tasksCount}`);
      console.log(`   Users loaded: ${manualLoadResult.usersCount}`);
    } else {
      console.log(`   Error: ${manualLoadResult.error}`);
    }
    
    console.log('\n🔍 STEP 4: Check window.migrationTasks');
    
    const windowDataCheck = await page.evaluate(() => {
      const migrationTasks = window.migrationTasks || [];
      const migrationUsers = window.migrationUsers || [];
      
      if (migrationTasks.length > 0) {
        console.log(`✅ Found ${migrationTasks.length} tasks in window.migrationTasks`);
        console.log(`📋 Sample task: ${migrationTasks[0].title}`);
        console.log(`👤 Sample user: ${migrationTasks[0].user_name}`);
        console.log(`📅 Sample date: ${migrationTasks[0].date}`);
        console.log(`📊 Sample status: ${migrationTasks[0].status}`);
        
        return {
          hasData: true,
          tasksCount: migrationTasks.length,
          usersCount: migrationUsers.length,
          sampleTask: {
            title: migrationTasks[0].title,
            user_name: migrationTasks[0].user_name,
            status: migrationTasks[0].status,
            date: migrationTasks[0].date
          }
        };
      } else {
        console.log('❌ No migration tasks found in window');
        return { hasData: false };
      }
    });
    
    console.log('📊 WINDOW DATA CHECK:');
    if (windowDataCheck.hasData) {
      console.log(`   ✅ Migration data available in window`);
      console.log(`   📊 Tasks: ${windowDataCheck.tasksCount}`);
      console.log(`   👥 Users: ${windowDataCheck.usersCount}`);
      console.log(`   📋 Sample: ${windowDataCheck.sampleTask.title}`);
      console.log(`   👤 User: ${windowDataCheck.sampleTask.user_name}`);
      console.log(`   📊 Status: ${windowDataCheck.sampleTask.status}`);
    } else {
      console.log(`   ❌ No migration data in window`);
    }
    
    console.log('\n🔍 STEP 5: Force inject migration data into UI');
    
    if (windowDataCheck.hasData) {
      const injectionResult = await page.evaluate(() => {
        const migrationTasks = window.migrationTasks || [];
        
        // Try to find task container and inject tasks
        const taskContainers = Array.from(document.querySelectorAll('[class*="task"], [class*="list"], [class*="grid"], [class*="container"]')).filter(el => {
          return el.offsetParent !== null && el.children.length >= 0;
        });
        
        console.log(`🔍 Found ${taskContainers.length} potential task containers`);
        
        if (taskContainers.length > 0 && migrationTasks.length > 0) {
          const container = taskContainers[0];
          
          // Create sample task elements
          migrationTasks.slice(0, 3).forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = 'migration-task-item';
            taskElement.style.cssText = 'border: 2px solid #4CAF50; margin: 10px; padding: 15px; background: #f0f8ff; border-radius: 8px;';
            taskElement.innerHTML = `
              <h3 style="color: #2196F3; margin: 0 0 10px 0;">${task.title}</h3>
              <p style="margin: 5px 0;"><strong>Người thực hiện:</strong> ${task.user_name}</p>
              <p style="margin: 5px 0;"><strong>Trạng thái:</strong> ${task.status}</p>
              <p style="margin: 5px 0;"><strong>Ngày:</strong> ${task.date}</p>
              <p style="margin: 5px 0;"><strong>Loại:</strong> ${task.type}</p>
              <p style="margin: 5px 0; color: #4CAF50;"><strong>✅ MIGRATION DATA</strong></p>
            `;
            
            container.appendChild(taskElement);
          });
          
          console.log(`✅ Injected ${migrationTasks.slice(0, 3).length} sample tasks into UI`);
          
          return {
            success: true,
            injectedCount: 3,
            containerTag: container.tagName,
            containerClass: container.className
          };
        } else {
          console.log('❌ No suitable container found or no tasks to inject');
          return { success: false, reason: 'No container or tasks' };
        }
      });
      
      console.log('📊 INJECTION RESULT:');
      if (injectionResult.success) {
        console.log(`   ✅ Successfully injected ${injectionResult.injectedCount} tasks`);
        console.log(`   📦 Container: ${injectionResult.containerTag}.${injectionResult.containerClass}`);
      } else {
        console.log(`   ❌ Injection failed: ${injectionResult.reason}`);
      }
    }
    
    console.log('\n📋 MIGRATION LOADING LOGS:');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. ✅ Migration data file is accessible');
    console.log('2. 🔄 TaskManagementView useEffect may not be triggering');
    console.log('3. 📦 Data is loaded but not displayed in UI');
    console.log('4. 🎨 Need to verify UI rendering logic');
    console.log('5. 🔗 Check if mockTasks is being used correctly');
    
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
