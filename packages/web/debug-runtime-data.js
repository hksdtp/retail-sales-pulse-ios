// Debug runtime data for Nguyễn Mạnh Linh
import { chromium } from 'playwright';

async function debugRuntimeData() {
  console.log('🔍 Debug runtime data for Nguyễn Mạnh Linh...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('currentUser') || text.includes('team_id') || text.includes('Director access') || text.includes('Regular user access')) {
      console.log(`🔍 Console: ${text}`);
    }
  });
  
  try {
    // Navigate and login
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Select Hà Nội
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(2000);
    
    // Select Nguyễn Mạnh Linh (try by value first)
    const userOptions = await page.locator('select >> nth=1 option').all();
    let selectedUser = false;
    
    for (const option of userOptions) {
      const text = await option.textContent();
      if (text && text.includes('Nguyễn Mạnh Linh')) {
        const value = await option.getAttribute('value');
        console.log(`🎯 Found Nguyễn Mạnh Linh with value: ${value}`);
        await page.selectOption('select >> nth=1', value);
        selectedUser = true;
        break;
      }
    }
    
    if (!selectedUser) {
      console.log('❌ Could not find Nguyễn Mạnh Linh in options');
      return;
    }
    
    await page.waitForTimeout(2000);
    
    // Enter password and login
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(5000);
    
    // Check currentUser in localStorage
    const currentUserData = await page.evaluate(() => {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    });
    
    console.log('👤 Current user in localStorage:', currentUserData);
    
    if (currentUserData) {
      console.log('📋 Key user data:', {
        name: currentUserData.name,
        team_id: currentUserData.team_id,
        role: currentUserData.role,
        location: currentUserData.location
      });
    }
    
    // Navigate to team view
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(3000);
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(5000);
    
    // Check teams data
    const teamsData = await page.evaluate(() => {
      // Try to get teams from various sources
      const sources = [
        localStorage.getItem('teams'),
        sessionStorage.getItem('teams'),
        window.teamsData
      ];
      
      return sources.map((source, index) => ({
        source: ['localStorage', 'sessionStorage', 'window'][index],
        data: source ? (typeof source === 'string' ? JSON.parse(source) : source) : null
      }));
    });
    
    console.log('📊 Teams data sources:', teamsData);
    
    // Check visible team cards
    const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').allTextContents();
    console.log('👁️ Visible team cards:', teamCards);
    
    // Check specific teams
    const team1Visible = teamCards.some(card => card.includes('NHÓM 1'));
    const team2Visible = teamCards.some(card => card.includes('NHÓM 2'));
    
    console.log('📊 Team visibility analysis:');
    console.log(`  - NHÓM 1: ${team1Visible ? '✅ VISIBLE (WRONG!)' : '❌ HIDDEN (CORRECT)'}`);
    console.log(`  - NHÓM 2: ${team2Visible ? '✅ VISIBLE (CORRECT)' : '❌ HIDDEN (WRONG!)'}`);
    
    // Final diagnosis
    if (team1Visible && !team2Visible) {
      console.log('\n❌ BUG CONFIRMED: Showing NHÓM 1 instead of NHÓM 2');
      console.log('🔍 Possible causes:');
      console.log('  1. currentUser.team_id is wrong');
      console.log('  2. Teams data has wrong IDs');
      console.log('  3. Filtering logic has a bug');
      console.log('  4. There is a hardcoded override');
    } else if (!team1Visible && team2Visible) {
      console.log('\n✅ WORKING CORRECTLY: Showing NHÓM 2 only');
    } else {
      console.log('\n⚠️ UNEXPECTED: Check the data above');
    }
    
    await page.screenshot({ path: 'debug-runtime-data.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugRuntimeData();
