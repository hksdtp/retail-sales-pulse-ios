// Test team member permissions
import { chromium } from 'playwright';

async function testTeamMemberPermissions() {
  console.log('🔐 Testing team member permissions...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Access denied') || text.includes('Team member') || text.includes('permission') || text.includes('🚫') || text.includes('🔑')) {
      consoleLogs.push(`[${new Date().toISOString()}] ${text}`);
      console.log(`🔍 ${text}`);
    }
  });
  
  try {
    // Test 1: Login as Lê Khánh Duy (team member from NHÓM 1)
    console.log('📝 Test 1: Login as Lê Khánh Duy (NHÓM 1 member)');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Select Hà Nội
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(1000);
    
    // Select Lê Khánh Duy
    await page.selectOption('select >> nth=1', 'abtSSmK0p0oeOyy5YWGZ');
    await page.waitForTimeout(1000);
    
    // Enter password (default first-time password)
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    // Navigate to Công việc
    await page.click('button:has-text("Công việc")');
    await page.waitForTimeout(2000);
    
    // Navigate to Của nhóm
    await page.click('button:has-text("Của nhóm")');
    await page.waitForTimeout(3000);
    
    // Check visible teams
    const teamCards = await page.locator('.cursor-pointer:has(.bg-blue-50)').all();
    console.log(`📊 Visible team cards: ${teamCards.length}`);
    
    // Should only see NHÓM 1 - VIỆT ANH
    const team1Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 1 - VIỆT ANH' }).count() > 0;
    const team2Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 2 - THẢO' }).count() > 0;
    const team3Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 3' }).count() > 0;
    const team4Visible = await page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 4' }).count() > 0;
    
    console.log(`📋 Team visibility check:`);
    console.log(`  - NHÓM 1 (own team): ${team1Visible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  - NHÓM 2: ${team2Visible ? '❌ VISIBLE (SHOULD BE HIDDEN)' : '✅ HIDDEN'}`);
    console.log(`  - NHÓM 3: ${team3Visible ? '❌ VISIBLE (SHOULD BE HIDDEN)' : '✅ HIDDEN'}`);
    console.log(`  - NHÓM 4: ${team4Visible ? '❌ VISIBLE (SHOULD BE HIDDEN)' : '✅ HIDDEN'}`);
    
    // Test accessing own team
    if (team1Visible) {
      console.log('📝 Testing access to own team (NHÓM 1)...');
      const team1Card = page.locator('.cursor-pointer').filter({ hasText: 'NHÓM 1 - VIỆT ANH' });
      await team1Card.click();
      await page.waitForTimeout(2000);
      
      const header = await page.locator('h3').filter({ hasText: 'NHÓM' }).textContent();
      const taskCount = await page.locator('tr:has(td)').count();
      
      console.log(`📋 Own team access result:`);
      console.log(`  - Header: ${header}`);
      console.log(`  - Tasks visible: ${taskCount}`);
      
      if (header?.includes('NHÓM 1 - VIỆT ANH')) {
        console.log('✅ SUCCESS: Can access own team tasks');
      } else {
        console.log('❌ FAIL: Cannot access own team tasks');
      }
    }
    
    await page.screenshot({ path: 'test-team-member-permissions.png', fullPage: true });
    
    // Summary
    console.log('\n📊 Permission Test Summary:');
    console.log('🔍 Console logs with permission checks:');
    consoleLogs.forEach(log => console.log(`   ${log}`));
    
    const permissionTestPassed = team1Visible && !team2Visible && !team3Visible && !team4Visible;
    console.log(`\n🎯 Overall Result: ${permissionTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (permissionTestPassed) {
      console.log('✅ Team member can only see their own team - Permission logic working correctly!');
    } else {
      console.log('❌ Team member can see other teams - Permission logic needs fixing!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testTeamMemberPermissions();
