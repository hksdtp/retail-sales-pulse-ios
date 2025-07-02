const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG TASKS PAGE - DETAILED ANALYSIS');
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
    consoleLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
  });
  
  try {
    console.log('\n🔍 STEP 1: Navigate to login and setup user');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Setup user session
    await page.evaluate(() => {
      const testUser = {
        id: 'user_manh',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        team_id: '1',
        password_changed: false
      };
      
      localStorage.setItem('currentUser', JSON.stringify(testUser));
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('loginType', 'standard');
      
      console.log('✅ User session setup complete');
    });
    
    console.log('\n🔍 STEP 2: Navigate to tasks page');
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n🔍 STEP 3: Analyze page content');
    const pageAnalysis = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const bodyHTML = document.body.innerHTML;
      
      // Check for specific content
      const hasTasksText = bodyText.includes('Công việc') || bodyText.includes('Tasks');
      const hasLoadingText = bodyText.includes('Đang tải') || bodyText.includes('Loading') || 
                            bodyText.includes('Đang khởi tạo');
      const hasErrorText = bodyText.includes('Error') || bodyText.includes('Lỗi');
      
      // Check for React components
      const hasReactComponents = bodyHTML.includes('data-reactroot') || 
                                bodyHTML.includes('react') ||
                                document.querySelector('[data-reactroot]') !== null;
      
      // Check for task-related elements
      const taskElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        const className = el.className || '';
        return text.includes('KH-CT') || text.includes('KTS-') || 
               className.includes('task') || className.includes('Task');
      });
      
      // Check for migration data elements
      const migrationElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Phạm Thị Hương') || text.includes('Lương Việt Anh') ||
               text.includes('OCEANPARK') || text.includes('customer_contact');
      });
      
      // Check for buttons and interactive elements
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.offsetParent !== null
      );
      
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(input => 
        input.offsetParent !== null
      );
      
      return {
        bodyTextLength: bodyText.length,
        bodyTextPreview: bodyText.substring(0, 500),
        hasTasksText,
        hasLoadingText,
        hasErrorText,
        hasReactComponents,
        taskElementsCount: taskElements.length,
        migrationElementsCount: migrationElements.length,
        buttonsCount: buttons.length,
        inputsCount: inputs.length,
        currentUrl: window.location.href,
        title: document.title
      };
    });
    
    console.log('📊 PAGE ANALYSIS:');
    console.log(`   URL: ${pageAnalysis.currentUrl}`);
    console.log(`   Title: ${pageAnalysis.title}`);
    console.log(`   Body text length: ${pageAnalysis.bodyTextLength}`);
    console.log(`   Has tasks text: ${pageAnalysis.hasTasksText}`);
    console.log(`   Has loading text: ${pageAnalysis.hasLoadingText}`);
    console.log(`   Has error text: ${pageAnalysis.hasErrorText}`);
    console.log(`   Has React components: ${pageAnalysis.hasReactComponents}`);
    console.log(`   Task elements: ${pageAnalysis.taskElementsCount}`);
    console.log(`   Migration elements: ${pageAnalysis.migrationElementsCount}`);
    console.log(`   Buttons: ${pageAnalysis.buttonsCount}`);
    console.log(`   Inputs: ${pageAnalysis.inputsCount}`);
    
    console.log('\n📝 BODY TEXT PREVIEW:');
    console.log(pageAnalysis.bodyTextPreview);
    
    console.log('\n🔍 STEP 4: Check for specific task data');
    const taskDataCheck = await page.evaluate(() => {
      // Check if migration data is loaded
      const migrationDataCheck = fetch('/supabase-data-converted.json')
        .then(response => response.ok)
        .catch(() => false);
      
      // Check localStorage for task data
      const localStorageKeys = Object.keys(localStorage);
      const taskKeys = localStorageKeys.filter(key => 
        key.includes('task') || key.includes('Task')
      );
      
      // Check for specific task titles from migration
      const specificTasks = [
        'KH-CT ANH THÁI CHỊ TUYẾN OCEANPARK',
        'KTS-CHỊ DUYÊN THIẾT KẾ A+',
        'KH-CT CHỊ LINH-QUẢNG AN'
      ];
      
      const foundTasks = specificTasks.filter(taskTitle => 
        document.body.innerText.includes(taskTitle)
      );
      
      return {
        taskKeysInLocalStorage: taskKeys,
        foundSpecificTasks: foundTasks,
        localStorageData: taskKeys.map(key => ({
          key,
          value: localStorage.getItem(key)?.substring(0, 100)
        }))
      };
    });
    
    console.log('\n📋 TASK DATA CHECK:');
    console.log(`   Task keys in localStorage: ${taskDataCheck.taskKeysInLocalStorage.length}`);
    console.log(`   Found specific tasks: ${taskDataCheck.foundSpecificTasks.length}`);
    
    if (taskDataCheck.taskKeysInLocalStorage.length > 0) {
      console.log('   LocalStorage task keys:');
      taskDataCheck.taskKeysInLocalStorage.forEach(key => {
        console.log(`     - ${key}`);
      });
    }
    
    if (taskDataCheck.foundSpecificTasks.length > 0) {
      console.log('   Found specific tasks:');
      taskDataCheck.foundSpecificTasks.forEach(task => {
        console.log(`     - ${task}`);
      });
    }
    
    console.log('\n🔍 STEP 5: Check migration data file');
    const migrationFileCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('/supabase-data-converted.json');
        if (response.ok) {
          const data = await response.json();
          return {
            fileExists: true,
            tasksCount: data.tasks?.length || 0,
            usersCount: data.users?.length || 0,
            teamsCount: data.teams?.length || 0,
            sampleTask: data.tasks?.[0] ? {
              title: data.tasks[0].title,
              user_name: data.tasks[0].user_name,
              status: data.tasks[0].status
            } : null
          };
        } else {
          return { fileExists: false, error: `HTTP ${response.status}` };
        }
      } catch (error) {
        return { fileExists: false, error: error.message };
      }
    });
    
    console.log('\n📁 MIGRATION FILE CHECK:');
    if (migrationFileCheck.fileExists) {
      console.log('   ✅ Migration file exists');
      console.log(`   📊 Tasks: ${migrationFileCheck.tasksCount}`);
      console.log(`   👥 Users: ${migrationFileCheck.usersCount}`);
      console.log(`   🏢 Teams: ${migrationFileCheck.teamsCount}`);
      
      if (migrationFileCheck.sampleTask) {
        console.log('   📋 Sample task:');
        console.log(`     - Title: ${migrationFileCheck.sampleTask.title}`);
        console.log(`     - User: ${migrationFileCheck.sampleTask.user_name}`);
        console.log(`     - Status: ${migrationFileCheck.sampleTask.status}`);
      }
    } else {
      console.log('   ❌ Migration file not accessible');
      console.log(`   Error: ${migrationFileCheck.error}`);
    }
    
    console.log('\n📋 RECENT CONSOLE LOGS (Last 20):');
    consoleLogs.slice(-20).forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🔧 RECOMMENDATIONS:');
    
    console.log('1. Check if TaskManagementView is properly loading migration data');
    console.log('2. Verify React components are rendering correctly');
    console.log('3. Check console logs for any JavaScript errors');
    console.log('4. Ensure migration data file is accessible');
    console.log('5. Debug useEffect hooks in TaskManagementView');
    
    await page.waitForTimeout(15000);
    await browser.close();
  }
})();
