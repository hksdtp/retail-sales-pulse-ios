// Debug by manually stepping through the process
import { chromium } from 'playwright';

async function debugManualSteps() {
  console.log('🔍 Debug manual steps for Nguyễn Mạnh Linh...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // Very slow for observation
  });
  const page = await browser.newPage();
  
  // Capture ALL console logs
  page.on('console', msg => {
    console.log(`🔍 [${msg.type()}] ${msg.text()}`);
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/users') || request.url().includes('/teams')) {
      console.log(`🌐 Request: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/users') || response.url().includes('/teams')) {
      console.log(`📡 Response: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📝 Step 1: Navigate to login page');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 2: Check if on login page');
    const pageTitle = await page.title();
    const hasLoginForm = await page.locator('select').count() > 0;
    console.log(`📋 Page title: ${pageTitle}`);
    console.log(`📋 Has login form: ${hasLoginForm}`);
    
    if (!hasLoginForm) {
      console.log('❌ No login form found, trying /login route');
      await page.goto('http://localhost:8088/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);
    }
    
    console.log('📝 Step 3: Select location - Hà Nội');
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('hanoi');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 4: Check available users');
    const userSelect = page.locator('select').nth(1);
    await page.waitForTimeout(2000);
    
    // Get all options
    const options = await userSelect.locator('option').allTextContents();
    console.log('📋 All user options:', options);
    
    // Try to find Nguyễn Mạnh Linh by different methods
    const methods = [
      { name: 'by exact text', selector: { label: 'Nguyễn Mạnh Linh' } },
      { name: 'by partial text', selector: { label: /Nguyễn Mạnh Linh/ } },
      { name: 'by value', selector: 'nguyen_manh_linh_id' }
    ];
    
    let selectedSuccessfully = false;
    
    for (const method of methods) {
      try {
        console.log(`🎯 Trying to select by ${method.name}...`);
        await userSelect.selectOption(method.selector);
        await page.waitForTimeout(1000);
        
        const selectedValue = await userSelect.inputValue();
        console.log(`✅ Selected value: ${selectedValue}`);
        selectedSuccessfully = true;
        break;
      } catch (error) {
        console.log(`❌ Failed to select by ${method.name}: ${error.message}`);
      }
    }
    
    if (!selectedSuccessfully) {
      console.log('❌ Could not select Nguyễn Mạnh Linh by any method');
      
      // Try to select any user for testing
      const firstOption = options.find(opt => opt && opt.trim() && !opt.includes('Chọn'));
      if (firstOption) {
        console.log(`🔄 Trying to select first available user: ${firstOption}`);
        await userSelect.selectOption({ label: firstOption });
        await page.waitForTimeout(1000);
      } else {
        console.log('❌ No users available at all');
        return;
      }
    }
    
    console.log('📝 Step 5: Enter password');
    await page.fill('input[type="password"]', '123456');
    await page.waitForTimeout(1000);
    
    console.log('📝 Step 6: Click login');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(8000);
    
    console.log('📝 Step 7: Check login result');
    const currentUrl = page.url();
    console.log(`📋 Current URL: ${currentUrl}`);
    
    // Check localStorage
    const storageData = await page.evaluate(() => {
      return {
        currentUser: localStorage.getItem('currentUser'),
        teams: localStorage.getItem('teams'),
        users: localStorage.getItem('users')
      };
    });
    
    console.log('📋 Storage data:');
    if (storageData.currentUser) {
      const user = JSON.parse(storageData.currentUser);
      console.log(`  👤 Current user: ${user.name} (team_id: ${user.team_id}, role: ${user.role})`);
    } else {
      console.log('  ❌ No current user in localStorage');
    }
    
    if (storageData.teams) {
      const teams = JSON.parse(storageData.teams);
      console.log(`  📊 Teams count: ${teams.length}`);
      teams.forEach(team => {
        console.log(`    - ${team.name} (id: ${team.id})`);
      });
    }
    
    if (currentUrl.includes('login')) {
      console.log('❌ Still on login page - login failed');
      return;
    }
    
    console.log('📝 Step 8: Navigate to Công việc');
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 9: Navigate to Của nhóm');
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 10: Check visible teams');
    const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').allTextContents();
    console.log('👁️ Visible team cards:', teamCards);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-manual-steps.png', fullPage: true });
    
    console.log('\n📊 Final Analysis:');
    console.log('='.repeat(50));
    
    if (storageData.currentUser) {
      const user = JSON.parse(storageData.currentUser);
      console.log(`👤 Logged in as: ${user.name}`);
      console.log(`📋 User team_id: ${user.team_id}`);
      console.log(`📋 User role: ${user.role}`);
      
      const expectedTeam = user.team_id === '2' ? 'NHÓM 2 - THẢO' : `NHÓM ${user.team_id}`;
      const actualTeams = teamCards.filter(card => card.includes('NHÓM'));
      
      console.log(`✅ Expected to see: ${expectedTeam}`);
      console.log(`👁️ Actually seeing: ${actualTeams.join(', ')}`);
      
      if (actualTeams.length === 1 && actualTeams[0].includes(user.team_id)) {
        console.log('✅ CORRECT: Showing correct team');
      } else {
        console.log('❌ BUG: Showing wrong team(s)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n⏸️ Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

debugManualSteps();
