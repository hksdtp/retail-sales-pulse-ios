const { chromium } = require('playwright');

(async () => {
  console.log('🔍 KIỂM TRA STAGEWISE READINESS');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
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
    console.log('\n🚀 STEP 1: Start development server và navigate');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n🔍 STEP 2: Check Stagewise initialization');
    
    const stagewiseStatus = await page.evaluate(() => {
      // Check for Stagewise elements
      const toolbarRoot = document.getElementById('stagewise-toolbar-root');
      const hasConfig = typeof window.stagewiseConfig !== 'undefined';
      const isDev = location.hostname === 'localhost';
      
      return {
        toolbarRootExists: !!toolbarRoot,
        hasConfig,
        isDev,
        configDetails: hasConfig ? {
          framework: window.stagewiseConfig?.integration?.framework,
          enabled: window.stagewiseConfig?.integration?.enabled,
          autoConnect: window.stagewiseConfig?.integration?.autoConnect
        } : null
      };
    });
    
    console.log('📊 STAGEWISE STATUS:');
    console.log(`   Toolbar root exists: ${stagewiseStatus.toolbarRootExists ? '✅' : '❌'}`);
    console.log(`   Has config: ${stagewiseStatus.hasConfig ? '✅' : '❌'}`);
    console.log(`   Development mode: ${stagewiseStatus.isDev ? '✅' : '❌'}`);
    
    if (stagewiseStatus.configDetails) {
      console.log('   Config details:');
      console.log(`     Framework: ${stagewiseStatus.configDetails.framework}`);
      console.log(`     Enabled: ${stagewiseStatus.configDetails.enabled}`);
      console.log(`     Auto-connect: ${stagewiseStatus.configDetails.autoConnect}`);
    }
    
    console.log('\n📋 STAGEWISE CONSOLE LOGS:');
    if (stagewiseLogs.length > 0) {
      stagewiseLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`);
      });
    } else {
      console.log('⚠️ No Stagewise logs found - may need to check initialization');
    }
    
    // Check if ready for usage
    const isReady = stagewiseStatus.toolbarRootExists && stagewiseStatus.hasConfig && stagewiseStatus.isDev;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 READINESS ASSESSMENT');
    console.log('='.repeat(80));
    
    if (isReady) {
      console.log('🎉 STAGEWISE IS READY TO USE!');
      console.log('✅ All components initialized successfully');
      console.log('✅ Development mode active');
      console.log('✅ Configuration loaded');
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Install VS Code extension if not done yet');
      console.log('2. Try selecting elements in your app');
      console.log('3. Leave comments and send to AI agent');
      
    } else {
      console.log('⚠️ STAGEWISE NEEDS SETUP');
      console.log('❌ Some components not ready');
      
      console.log('\n🔧 TROUBLESHOOTING:');
      if (!stagewiseStatus.toolbarRootExists) {
        console.log('- Toolbar root missing - check main.tsx initialization');
      }
      if (!stagewiseStatus.hasConfig) {
        console.log('- Config missing - check stagewise.ts import');
      }
      if (!stagewiseStatus.isDev) {
        console.log('- Not in development mode - check server setup');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
