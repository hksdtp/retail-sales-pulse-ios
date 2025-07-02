const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('🎯 STAGEWISE COMPLETE DEMO');
  console.log('='.repeat(80));
  console.log('📋 Hướng dẫn sử dụng Stagewise từng bước với demo thực tế');
  console.log('='.repeat(80));
  
  // Start development server
  console.log('\n🚀 STEP 1: Starting development server...');
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: './packages/web',
    stdio: 'pipe'
  });
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    args: ['--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  // Capture Stagewise logs
  const stagewiseLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Stagewise') || text.includes('stagewise')) {
      stagewiseLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
    }
  });
  
  try {
    console.log('\n🔍 STEP 2: Navigate to application');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n📊 STEP 3: Check Stagewise initialization');
    
    const stagewiseStatus = await page.evaluate(() => {
      const toolbarRoot = document.getElementById('stagewise-toolbar-root');
      const hasConfig = typeof window.stagewiseConfig !== 'undefined';
      const isDev = location.hostname === 'localhost';
      
      return {
        toolbarRootExists: !!toolbarRoot,
        hasConfig,
        isDev,
        bodyContent: document.body.innerText.length > 0
      };
    });
    
    console.log('📊 STAGEWISE STATUS:');
    console.log(`   ✅ Page loaded: ${stagewiseStatus.bodyContent}`);
    console.log(`   ${stagewiseStatus.toolbarRootExists ? '✅' : '❌'} Toolbar root: ${stagewiseStatus.toolbarRootExists}`);
    console.log(`   ${stagewiseStatus.hasConfig ? '✅' : '❌'} Config loaded: ${stagewiseStatus.hasConfig}`);
    console.log(`   ${stagewiseStatus.isDev ? '✅' : '❌'} Development mode: ${stagewiseStatus.isDev}`);
    
    console.log('\n📋 STAGEWISE CONSOLE LOGS:');
    if (stagewiseLogs.length > 0) {
      stagewiseLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('⚠️ No Stagewise logs found');
    }
    
    console.log('\n🎯 STEP 4: DEMO - Element Selection');
    
    // Find login button
    const loginButton = await page.locator('button:has-text("Đăng nhập")').first();
    if (await loginButton.count() > 0) {
      console.log('✅ Found login button for demo');
      
      // Highlight the button
      await loginButton.evaluate(el => {
        el.style.border = '3px solid #FF6B6B';
        el.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
      });
      
      console.log('🎨 Button highlighted with red border');
      console.log('💡 In real usage, you would:');
      console.log('   1. Right-click this button');
      console.log('   2. Stagewise toolbar would appear');
      console.log('   3. Type: "Change this button color to green"');
      console.log('   4. Press Enter to send to AI agent');
      
      await page.waitForTimeout(3000);
      
      // Remove highlight
      await loginButton.evaluate(el => {
        el.style.border = '';
        el.style.boxShadow = '';
      });
    }
    
    console.log('\n🎯 STEP 5: DEMO - Form Enhancement');
    
    // Find form elements
    const emailInput = await page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      console.log('✅ Found email input for demo');
      
      // Highlight the input
      await emailInput.evaluate(el => {
        el.style.border = '3px solid #4ECDC4';
        el.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.5)';
      });
      
      console.log('🎨 Email input highlighted with teal border');
      console.log('💡 In real usage, you would:');
      console.log('   1. Select this input field');
      console.log('   2. Comment: "Add real-time email validation with error messages"');
      console.log('   3. AI would suggest validation logic and error UI');
      
      await page.waitForTimeout(3000);
      
      // Remove highlight
      await emailInput.evaluate(el => {
        el.style.border = '';
        el.style.boxShadow = '';
      });
    }
    
    console.log('\n🎯 STEP 6: Navigate to Tasks Page Demo');
    
    // Setup user session for tasks page
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
    
    console.log('✅ Navigated to tasks page');
    
    // Find task elements
    const taskElements = await page.locator('[class*="task"], [class*="card"]').all();
    if (taskElements.length > 0) {
      console.log(`✅ Found ${taskElements.length} task elements for demo`);
      
      // Highlight first task
      await taskElements[0].evaluate(el => {
        el.style.border = '3px solid #FFD93D';
        el.style.boxShadow = '0 0 15px rgba(255, 217, 61, 0.5)';
      });
      
      console.log('🎨 First task highlighted with yellow border');
      console.log('💡 In real usage, you would:');
      console.log('   1. Select this task card');
      console.log('   2. Comment: "Add priority badge and due date to this task"');
      console.log('   3. AI would suggest UI enhancements and data structure');
      
      await page.waitForTimeout(3000);
      
      // Remove highlight
      await taskElements[0].evaluate(el => {
        el.style.border = '';
        el.style.boxShadow = '';
      });
    }
    
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  } finally {
    console.log('\n' + '='.repeat(80));
    console.log('🎊 STAGEWISE DEMO COMPLETE');
    console.log('='.repeat(80));
    
    console.log('\n📋 WHAT YOU LEARNED:');
    console.log('✅ How to check Stagewise initialization');
    console.log('✅ How to identify elements for selection');
    console.log('✅ What comments to write for AI agents');
    console.log('✅ How to enhance different UI components');
    
    console.log('\n🔧 NEXT STEPS TO START USING:');
    console.log('1. 🧩 Install VS Code extension: stagewise.stagewise-vscode-extension');
    console.log('2. 🔄 Restart VS Code/Cursor');
    console.log('3. 🎯 Select any element in your app');
    console.log('4. 💬 Leave a comment describing what you want');
    console.log('5. 📤 Send to AI agent and see magic happen!');
    
    console.log('\n💡 EXAMPLE COMMENTS TO TRY:');
    console.log('• "Make this button green with hover animation"');
    console.log('• "Add loading spinner to this form submission"');
    console.log('• "Convert this to a reusable component with TypeScript"');
    console.log('• "Add real-time updates using Supabase subscriptions"');
    console.log('• "Implement drag and drop for this list"');
    
    console.log('\n🎯 BENEFITS YOU\'LL GET:');
    console.log('⚡ 93% faster development (no manual context description)');
    console.log('🎨 Visual feedback on changes');
    console.log('🤖 Intelligent AI suggestions with real context');
    console.log('🔄 Seamless workflow integration');
    
    console.log('\n📞 SUPPORT:');
    console.log('🔗 GitHub: https://github.com/stagewise-io/stagewise');
    console.log('💬 Discord: https://discord.gg/gkdGsDYaKA');
    console.log('📖 Docs: https://stagewise.io');
    
    console.log('\n🎉 Happy visual coding with Stagewise! 🚀');
    console.log('='.repeat(80));
    
    await page.waitForTimeout(10000);
    await browser.close();
    
    // Kill server
    serverProcess.kill();
  }
})();
