import { test, expect } from '@playwright/test';

test.describe('Team Navigation Bug Test', () => {
  test('Test team selection bug - auto redirect to Team 1', async ({ page }) => {
    console.log('🚀 Starting team navigation bug test...');
    
    // Step 1: Navigate to login page
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    console.log('📝 Step 1: Login as Khổng Đức Mạnh');
    
    // Select location
    const locationSelect = page.locator('select').first();
    await locationSelect.selectOption('hanoi');
    await page.waitForTimeout(1000);
    
    // Select user - Khổng Đức Mạnh
    const userSelect = page.locator('select').nth(1);
    await userSelect.selectOption({ label: 'Khổng Đức Mạnh' });
    await page.waitForTimeout(1000);
    
    // Enter password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Haininh1');
    
    // Click login
    const loginButton = page.locator('button:has-text("Đăng nhập")');
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 2: Navigate to "Của nhóm" tab');
    
    // Click on "Công việc" tab first
    const taskTab = page.locator('button:has-text("Công việc")');
    await taskTab.click();
    await page.waitForTimeout(2000);
    
    // Click on "Của nhóm" tab
    const teamTab = page.locator('button:has-text("Của nhóm")');
    await teamTab.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 3: Test team selection sequence');
    
    // Capture console logs to monitor auto-selection
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('TEMPORARY') || text.includes('Auto-selecting') || text.includes('handleTeamSelect') || text.includes('selectedTeamForView')) {
        consoleLogs.push(`[${new Date().toISOString()}] ${text}`);
        console.log(`🔍 Console: ${text}`);
      }
    });
    
    // Wait for team cards to load
    await page.waitForSelector('[data-testid="team-card"], .cursor-pointer:has(.bg-blue-50)', { timeout: 10000 });
    
    // Get all team cards
    const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').all();
    console.log(`📋 Found ${teamCards.length} team cards`);
    
    // Test clicking different teams
    const teamTests = [
      { name: 'NHÓM 2 - THẢO', expectedId: '2' },
      { name: 'NHÓM 3', expectedId: '3' },
      { name: 'NHÓM 4', expectedId: '4' },
      { name: 'NHÓM 1 - VIỆT ANH', expectedId: '1' }
    ];
    
    for (const teamTest of teamTests) {
      console.log(`🎯 Testing team: ${teamTest.name}`);
      
      // Clear previous logs
      consoleLogs.length = 0;
      
      // Find and click the team card
      const teamCard = page.locator('.cursor-pointer:has(.bg-blue-50)').filter({ hasText: teamTest.name });
      const cardExists = await teamCard.count() > 0;
      
      if (cardExists) {
        console.log(`✅ Found team card: ${teamTest.name}`);
        
        // Click the team card
        await teamCard.click();
        console.log(`🖱️ Clicked team: ${teamTest.name}`);
        
        // Wait for potential auto-redirect (the bug happens after 2 seconds)
        await page.waitForTimeout(3000);
        
        // Check current team header
        const teamHeader = page.locator('h3:has-text("NHÓM")');
        const currentTeamText = await teamHeader.textContent();
        console.log(`📋 Current team header: ${currentTeamText}`);
        
        // Check if we got redirected to Team 1
        const isRedirectedToTeam1 = currentTeamText?.includes('NHÓM 1 - VIỆT ANH');
        
        if (teamTest.name !== 'NHÓM 1 - VIỆT ANH' && isRedirectedToTeam1) {
          console.log(`❌ BUG DETECTED: Selected ${teamTest.name} but got redirected to Team 1`);
          console.log('🔍 Console logs during this test:');
          consoleLogs.forEach(log => console.log(`   ${log}`));
        } else if (currentTeamText?.includes(teamTest.name)) {
          console.log(`✅ SUCCESS: Correctly showing ${teamTest.name}`);
        } else {
          console.log(`⚠️ UNEXPECTED: Expected ${teamTest.name}, got ${currentTeamText}`);
        }
        
        // Go back to team cards for next test
        const backButton = page.locator('button:has-text("Quay lại")');
        if (await backButton.count() > 0) {
          await backButton.click();
          await page.waitForTimeout(2000);
        }
      } else {
        console.log(`❌ Team card not found: ${teamTest.name}`);
      }
    }
    
    console.log('📝 Step 4: Summary of console logs');
    console.log('🔍 All relevant console logs:');
    consoleLogs.forEach(log => console.log(`   ${log}`));
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/team-navigation-bug-test.png', fullPage: true });
    
    console.log('✅ Team navigation bug test completed');
  });
});
