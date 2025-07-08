// Debug Nguyễn Mạnh Linh login issue
import { chromium } from 'playwright';

async function debugNguyenManhLinh() {
  console.log('🔍 Debug Nguyễn Mạnh Linh login issue...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${new Date().toISOString()}] ${text}`);
    console.log(`🔍 Console: ${text}`);
  });
  
  try {
    // Step 1: Navigate to login page
    console.log('📝 Step 1: Navigate to login page');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Select location
    console.log('📝 Step 2: Select Hà Nội');
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(2000);
    
    // Step 3: Check available users
    console.log('📝 Step 3: Check available users');
    const userOptions = await page.locator('select >> nth=1 option').allTextContents();
    console.log('📋 Available users:', userOptions);
    
    // Find Nguyễn Mạnh Linh option
    const nguyenManhLinhOption = userOptions.find(option => option.includes('Nguyễn Mạnh Linh'));
    console.log('🎯 Nguyễn Mạnh Linh option:', nguyenManhLinhOption);
    
    if (!nguyenManhLinhOption) {
      console.log('❌ Nguyễn Mạnh Linh not found in user options!');
      return;
    }
    
    // Step 4: Select Nguyễn Mạnh Linh
    console.log('📝 Step 4: Select Nguyễn Mạnh Linh');
    await page.selectOption('select >> nth=1', { label: 'Nguyễn Mạnh Linh' });
    await page.waitForTimeout(2000);
    
    // Step 5: Enter password
    console.log('📝 Step 5: Enter password');
    await page.fill('input[type="password"]', '123456');
    
    // Step 6: Login
    console.log('📝 Step 6: Click login');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(5000);
    
    // Step 7: Check current user info
    console.log('📝 Step 7: Check current user info');
    const currentUserInfo = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('currentUser'),
        sessionStorage: sessionStorage.getItem('currentUser')
      };
    });
    
    console.log('👤 Current user in storage:', currentUserInfo);
    
    if (currentUserInfo.localStorage) {
      const user = JSON.parse(currentUserInfo.localStorage);
      console.log('👤 Parsed user:', {
        name: user.name,
        team_id: user.team_id,
        role: user.role
      });
    }
    
    // Step 8: Navigate to Công việc
    console.log('📝 Step 8: Navigate to Công việc');
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(3000);
    
    // Step 9: Navigate to Của nhóm
    console.log('📝 Step 9: Navigate to Của nhóm');
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(5000);
    
    // Step 10: Check visible team cards
    console.log('📝 Step 10: Check visible team cards');
    const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').allTextContents();
    console.log('📋 Visible team cards:', teamCards);
    
    // Check specific teams
    const team1Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 1' }).count() > 0;
    const team2Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 2' }).count() > 0;
    
    console.log('📊 Team visibility:');
    console.log(`  - NHÓM 1: ${team1Visible ? '✅ VISIBLE (SHOULD BE HIDDEN)' : '❌ HIDDEN'}`);
    console.log(`  - NHÓM 2: ${team2Visible ? '✅ VISIBLE (CORRECT)' : '❌ HIDDEN (SHOULD BE VISIBLE)'}`);
    
    // Step 11: Check console logs for filtering
    console.log('📝 Step 11: Console logs analysis');
    const filteringLogs = consoleLogs.filter(log => 
      log.includes('Director access') || 
      log.includes('Regular user access') ||
      log.includes('team') ||
      log.includes('currentUser')
    );
    
    console.log('🔍 Filtering-related logs:');
    filteringLogs.forEach(log => console.log(`   ${log}`));
    
    await page.screenshot({ path: 'debug-nguyen-manh-linh.png', fullPage: true });
    
    // Summary
    console.log('\n📊 Debug Summary:');
    console.log(`👤 User found in options: ${!!nguyenManhLinhOption}`);
    console.log(`🔐 Login successful: ${!!currentUserInfo.localStorage}`);
    console.log(`👁️ Can see NHÓM 1: ${team1Visible} (should be false)`);
    console.log(`👁️ Can see NHÓM 2: ${team2Visible} (should be true)`);
    
    if (team1Visible && !team2Visible) {
      console.log('❌ BUG CONFIRMED: Showing wrong team!');
    } else if (!team1Visible && team2Visible) {
      console.log('✅ WORKING CORRECTLY: Showing correct team!');
    } else {
      console.log('⚠️ UNEXPECTED BEHAVIOR: Check logs for details');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugNguyenManhLinh();
