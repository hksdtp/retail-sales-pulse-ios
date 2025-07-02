const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('🧩 TEST VS CODE EXTENSION CONNECTION');
  console.log('='.repeat(80));
  console.log('📋 Kiểm tra kết nối giữa Stagewise extension và browser');
  console.log('='.repeat(80));
  
  // Start development server
  console.log('\n🚀 STEP 1: Starting development server...');
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: './packages/web',
    stdio: 'pipe'
  });
  
  // Wait for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  // Capture all console logs
  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
  });
  
  try {
    console.log('\n🔍 STEP 2: Navigate and check Stagewise');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n📊 STEP 3: Check Stagewise initialization');
    
    const stagewiseCheck = await page.evaluate(() => {
      // Check for Stagewise elements and config
      const toolbarRoot = document.getElementById('stagewise-toolbar-root');
      const hasConfig = typeof window.stagewiseConfig !== 'undefined';
      const isDev = location.hostname === 'localhost';
      
      // Check for any Stagewise-related elements
      const stagewiseElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const className = el.className || '';
        const id = el.id || '';
        return className.includes('stagewise') || id.includes('stagewise');
      });
      
      return {
        toolbarRootExists: !!toolbarRoot,
        hasConfig,
        isDev,
        stagewiseElementsCount: stagewiseElements.length,
        pageLoaded: document.body.innerText.length > 0,
        url: window.location.href
      };
    });
    
    console.log('📊 STAGEWISE STATUS:');
    console.log(`   ✅ Page loaded: ${stagewiseCheck.pageLoaded}`);
    console.log(`   ✅ Development mode: ${stagewiseCheck.isDev}`);
    console.log(`   ${stagewiseCheck.toolbarRootExists ? '✅' : '⚠️'} Toolbar root: ${stagewiseCheck.toolbarRootExists}`);
    console.log(`   ${stagewiseCheck.hasConfig ? '✅' : '⚠️'} Config loaded: ${stagewiseCheck.hasConfig}`);
    console.log(`   📊 Stagewise elements: ${stagewiseCheck.stagewiseElementsCount}`);
    console.log(`   🌐 URL: ${stagewiseCheck.url}`);
    
    console.log('\n🎯 STEP 4: Test element selection capability');
    
    // Find selectable elements
    const selectableElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, input, div, span, a')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
      });
      
      return {
        totalElements: elements.length,
        sampleElements: elements.slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className || 'no-class',
          id: el.id || 'no-id',
          text: (el.textContent || '').substring(0, 50)
        }))
      };
    });
    
    console.log('📊 SELECTABLE ELEMENTS:');
    console.log(`   Total elements: ${selectableElements.totalElements}`);
    console.log('   Sample elements for selection:');
    selectableElements.sampleElements.forEach((el, index) => {
      console.log(`     ${index + 1}. ${el.tagName}${el.className !== 'no-class' ? '.' + el.className.split(' ')[0] : ''}${el.id !== 'no-id' ? '#' + el.id : ''}`);
      console.log(`        Text: "${el.text}${el.text.length === 50 ? '...' : ''}"`);
    });
    
    console.log('\n🔗 STEP 5: Check for VS Code extension connection indicators');
    
    // Check for WebSocket connections or other connection indicators
    const connectionCheck = await page.evaluate(() => {
      // Check for WebSocket connections
      const hasWebSocket = typeof WebSocket !== 'undefined';
      
      // Check for any connection-related global variables
      const connectionGlobals = Object.keys(window).filter(key => 
        key.toLowerCase().includes('stagewise') || 
        key.toLowerCase().includes('websocket') ||
        key.toLowerCase().includes('connection')
      );
      
      // Check for any network activity indicators
      const performanceEntries = performance.getEntriesByType('navigation');
      
      return {
        hasWebSocket,
        connectionGlobals,
        performanceEntries: performanceEntries.length,
        userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome-based' : 'Other',
        isLocalhost: location.hostname === 'localhost'
      };
    });
    
    console.log('📊 CONNECTION CHECK:');
    console.log(`   WebSocket support: ${connectionCheck.hasWebSocket ? '✅' : '❌'}`);
    console.log(`   Connection globals: ${connectionCheck.connectionGlobals.length > 0 ? connectionCheck.connectionGlobals.join(', ') : 'None'}`);
    console.log(`   Browser: ${connectionCheck.userAgent}`);
    console.log(`   Localhost: ${connectionCheck.isLocalhost ? '✅' : '❌'}`);
    
    console.log('\n📋 RECENT CONSOLE LOGS (Last 10):');
    const recentLogs = allLogs.slice(-10);
    if (recentLogs.length > 0) {
      recentLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('No console logs captured');
    }
    
    console.log('\n🎯 STEP 6: Simulate element selection workflow');
    
    // Find and highlight a button for demo
    const buttonTest = await page.locator('button').first();
    if (await buttonTest.count() > 0) {
      console.log('✅ Found button for selection demo');
      
      // Highlight the button
      await buttonTest.evaluate(el => {
        el.style.border = '3px solid #FF6B6B';
        el.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.7)';
        el.style.transition = 'all 0.3s ease';
      });
      
      console.log('🎨 Button highlighted - this simulates element selection');
      console.log('💡 With VS Code extension active, you would:');
      console.log('   1. Right-click this highlighted button');
      console.log('   2. Stagewise toolbar would appear');
      console.log('   3. Type comment: "Change this button color to green"');
      console.log('   4. Press Enter to send to VS Code');
      console.log('   5. AI agent in VS Code would receive context and suggest changes');
      
      await page.waitForTimeout(4000);
      
      // Remove highlight
      await buttonTest.evaluate(el => {
        el.style.border = '';
        el.style.boxShadow = '';
      });
      
      console.log('✅ Demo complete - highlight removed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VS CODE EXTENSION TEST RESULTS');
    console.log('='.repeat(80));
    
    const extensionReady = stagewiseCheck?.toolbarRootExists && stagewiseCheck?.hasConfig;
    
    console.log('\n🎯 EXTENSION STATUS:');
    if (extensionReady) {
      console.log('🎉 STAGEWISE IS READY!');
      console.log('✅ Toolbar initialized');
      console.log('✅ Configuration loaded');
      console.log('✅ Development environment active');
      
      console.log('\n🚀 READY TO USE:');
      console.log('1. ✅ Browser setup complete');
      console.log('2. ⚠️ VS Code extension needs verification');
      console.log('3. 🎯 Ready for element selection');
      
    } else {
      console.log('⚠️ STAGEWISE NEEDS ATTENTION');
      console.log('❌ Some components not ready');
      
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check VS Code extension is installed and active');
      console.log('2. Restart VS Code after installing extension');
      console.log('3. Ensure only one VS Code window is open');
      console.log('4. Check project workspace is correct');
    }
    
    console.log('\n📋 HOW TO VERIFY EXTENSION IS WORKING:');
    console.log('1. 🧩 Open VS Code Extensions tab (Ctrl+Shift+X)');
    console.log('2. 🔍 Search for "stagewise" - should show "Installed"');
    console.log('3. 🎯 Command Palette (Ctrl+Shift+P) → type "stagewise"');
    console.log('4. 📤 Should see Stagewise commands available');
    console.log('5. 🔗 Try "Stagewise: Setup Toolbar" command');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. ✅ Verify extension installed in VS Code');
    console.log('2. 🔄 Restart VS Code if needed');
    console.log('3. 🎯 Try selecting elements in browser');
    console.log('4. 💬 Leave comments and send to AI agent');
    
    console.log('\n🎊 EXPECTED WORKFLOW:');
    console.log('Browser Element → Stagewise Toolbar → VS Code Extension → AI Agent → Code Changes');
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 EXTENSION TEST COMPLETE');
    console.log('='.repeat(80));
    
    await page.waitForTimeout(5000);
    await browser.close();
    
    // Kill server
    serverProcess.kill();
  }
})();
