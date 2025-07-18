/**
 * Simple debug script để kiểm tra team filtering issue
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

const { chromium } = require('playwright');

async function debugTeamFiltering() {
  console.log('🔍 Starting team filtering debug...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to login
    console.log('🌐 Navigating to login page...');
    await page.goto('http://localhost:8088/login');
    await page.waitForLoadState('networkidle');
    
    // Login as Nguyễn Mạnh Linh
    console.log('🔐 Logging in as Nguyễn Mạnh Linh...');
    
    // Click user select dropdown
    await page.click('[data-testid="user-select-trigger"]');
    await page.waitForTimeout(1000);
    
    // Select Nguyễn Mạnh Linh
    const userOption = page.locator('text="Nguyễn Mạnh Linh"').first();
    await userOption.click();
    await page.waitForTimeout(1000);
    
    // Enter password
    await page.fill('input[type="password"]', '123456');
    await page.waitForTimeout(500);
    
    // Click login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Wait for main app
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Check current user
    const currentUser = await page.evaluate(() => {
      return (window as any).currentUser;
    });
    console.log('👤 Current user:', {
      name: currentUser?.name,
      team_id: currentUser?.team_id,
      role: currentUser?.role
    });
    
    // Navigate to Tasks
    console.log('📋 Navigating to Tasks...');
    await page.click('text="Công việc"');
    await page.waitForTimeout(2000);
    
    // Click "Công việc của nhóm"
    console.log('👥 Clicking "Công việc của nhóm"...');
    await page.click('text="Công việc của nhóm"');
    await page.waitForTimeout(3000);
    
    // Check visible teams
    console.log('🏢 Checking visible teams...');
    const teamCards = await page.locator('[data-testid="team-card"]').count();
    console.log(`📊 Found ${teamCards} team cards`);
    
    // Check for specific teams
    const team1Visible = await page.locator('text="NHÓM 1 - VIỆT ANH"').isVisible();
    const team2Visible = await page.locator('text="NHÓM 2 - THẢO"').isVisible();
    
    console.log('🔍 Team visibility:');
    console.log(`  - Team 1 (VIỆT ANH): ${team1Visible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  - Team 2 (THẢO): ${team2Visible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    
    if (team1Visible) {
      console.log('🚨 ISSUE FOUND: Team 1 should NOT be visible to Nguyễn Mạnh Linh!');
    }
    
    if (!team2Visible) {
      console.log('🚨 ISSUE FOUND: Team 2 should be visible to Nguyễn Mạnh Linh!');
    }
    
    // If Team 2 is visible, click it
    if (team2Visible) {
      console.log('🎯 Clicking Team 2...');
      await page.click('text="NHÓM 2 - THẢO"');
      await page.waitForTimeout(3000);
      
      // Check tasks
      console.log('📋 Checking tasks...');
      const team1Tasks = await page.locator('text="Task của NHÓM 1"').isVisible();
      const team2Tasks = await page.locator('text="Task của NHÓM 2"').isVisible();
      
      console.log('🔍 Task visibility:');
      console.log(`  - Team 1 tasks: ${team1Tasks ? '✅ VISIBLE' : '❌ HIDDEN'}`);
      console.log(`  - Team 2 tasks: ${team2Tasks ? '✅ VISIBLE' : '❌ HIDDEN'}`);
      
      if (team1Tasks) {
        console.log('🚨 ISSUE FOUND: Team 1 tasks should NOT be visible!');
      }
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'debug-team-filtering-result.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshot saved: debug-team-filtering-result.png');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Don't close browser automatically
    // await browser.close();
  }
}

debugTeamFiltering().catch(console.error);
