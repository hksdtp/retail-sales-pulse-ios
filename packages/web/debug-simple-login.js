// Simple debug for login issue
import { chromium } from 'playwright';

async function debugSimpleLogin() {
  console.log('🔍 Simple debug for login issue...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to login page
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Check if we're on login page
    const isLoginPage = await page.locator('h1:has-text("Phòng Kinh Doanh Bán Lẻ")').count() > 0;
    console.log('📍 On login page:', isLoginPage);
    
    if (!isLoginPage) {
      console.log('❌ Not on login page, redirecting...');
      await page.goto('http://localhost:8088/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }
    
    // Select Hà Nội
    console.log('📝 Selecting Hà Nội...');
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(3000);
    
    // Get all user options
    const userOptions = await page.locator('select >> nth=1 option').allTextContents();
    console.log('📋 All user options:', userOptions);
    
    // Check if Nguyễn Mạnh Linh is in the list
    const hasNguyenManhLinh = userOptions.some(option => option.includes('Nguyễn Mạnh Linh'));
    console.log('🎯 Has Nguyễn Mạnh Linh:', hasNguyenManhLinh);
    
    if (hasNguyenManhLinh) {
      console.log('✅ Found Nguyễn Mạnh Linh, proceeding with login...');
      
      // Select Nguyễn Mạnh Linh
      await page.selectOption('select >> nth=1', { label: 'Nguyễn Mạnh Linh' });
      await page.waitForTimeout(2000);
      
      // Enter password
      await page.fill('input[type="password"]', '123456');
      await page.waitForTimeout(1000);
      
      // Click login
      await page.click('button:has-text("Đăng nhập")');
      await page.waitForTimeout(5000);
      
      // Check if login was successful
      const isLoggedIn = await page.url() !== 'http://localhost:8088/login';
      console.log('🔐 Login successful:', isLoggedIn);
      
      if (isLoggedIn) {
        // Navigate to tasks
        await page.click('button:has-text("Công việc")');
        await page.waitForTimeout(3000);
        
        // Navigate to team view
        await page.click('button:has-text("Của nhóm")');
        await page.waitForTimeout(3000);
        
        // Check visible teams
        const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').allTextContents();
        console.log('📋 Visible team cards:', teamCards);
        
        // Check specific teams
        const team1Visible = teamCards.some(card => card.includes('NHÓM 1'));
        const team2Visible = teamCards.some(card => card.includes('NHÓM 2'));
        
        console.log('📊 Team visibility:');
        console.log(`  - NHÓM 1: ${team1Visible ? '✅ VISIBLE (SHOULD BE HIDDEN)' : '❌ HIDDEN'}`);
        console.log(`  - NHÓM 2: ${team2Visible ? '✅ VISIBLE (CORRECT)' : '❌ HIDDEN (SHOULD BE VISIBLE)'}`);
        
        if (team1Visible && !team2Visible) {
          console.log('❌ BUG CONFIRMED: Showing wrong team!');
        } else if (!team1Visible && team2Visible) {
          console.log('✅ WORKING CORRECTLY: Showing correct team!');
        } else if (team1Visible && team2Visible) {
          console.log('⚠️ SHOWING BOTH TEAMS: May be director view or permission issue');
        } else {
          console.log('⚠️ NO TEAMS VISIBLE: Check data or permissions');
        }
      }
    } else {
      console.log('❌ Nguyễn Mạnh Linh not found in user options');
      console.log('🔍 Available options:', userOptions);
      
      // Try to find any user with "Nguyễn" in name
      const nguyenUsers = userOptions.filter(option => option.includes('Nguyễn'));
      console.log('👤 Users with "Nguyễn":', nguyenUsers);
    }
    
    await page.screenshot({ path: 'debug-simple-login.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugSimpleLogin();
