import { test, expect } from '@playwright/test';

test.describe('Test Permission Fix', () => {
  test('Test DOM nesting fix and team permission logic', async ({ page }) => {
    console.log('🔍 Testing DOM nesting fix and team permission logic...');
    
    // Monitor console for errors
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      const text = `${msg.type()}: ${msg.text()}`;
      
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });
    
    console.log('📝 Step 1: Test as regular user (Lê Khánh Duy)');
    
    // Setup regular user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1', // Team 1 - Việt Anh
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Nhân viên',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    });
    
    await page.goto('http://localhost:8088/tasks');
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 2: Check team tab visibility for regular user');
    
    // Click on "Của nhóm" tab
    const teamTab = await page.locator('button:has-text("Của nhóm")').first();
    const hasTeamTab = await teamTab.isVisible();
    console.log(`📋 "Của nhóm" tab visible: ${hasTeamTab}`);
    
    if (hasTeamTab) {
      await teamTab.click();
      await page.waitForTimeout(2000);
      
      // Check how many team cards are visible
      const teamCards = await page.locator('[class*="team"], [class*="card"]:has-text("NHÓM")').all();
      console.log(`👥 Team cards visible for regular user: ${teamCards.length}`);
      
      // Should only see their own team (Team 1 - Việt Anh)
      const team1Card = await page.locator(':has-text("NHÓM 1 - VIỆT ANH")').first();
      const hasTeam1 = await team1Card.isVisible();
      console.log(`✅ Team 1 (own team) visible: ${hasTeam1}`);
      
      const team2Card = await page.locator(':has-text("NHÓM 2 - THẢO")').first();
      const hasTeam2 = await team2Card.isVisible();
      console.log(`❌ Team 2 (other team) visible: ${hasTeam2}`);
      
      if (hasTeam2) {
        console.log('🚨 PERMISSION ERROR: Regular user can see other teams!');
      } else {
        console.log('✅ PERMISSION OK: Regular user only sees own team');
      }
    }
    
    console.log('📝 Step 3: Test task creation for DOM nesting errors');
    
    // Click create task button
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    const hasCreateButton = await createButton.isVisible();
    
    if (hasCreateButton) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Check for DOM nesting warnings
      const domNestingWarnings = warnings.filter(warning => 
        warning.includes('validateDOMNesting') ||
        warning.includes('cannot appear as a descendant')
      );
      
      if (domNestingWarnings.length > 0) {
        console.log('\n🚨 DOM Nesting Warnings:');
        domNestingWarnings.forEach((warning, index) => {
          console.log(`  ${index + 1}. ${warning.substring(0, 100)}...`);
        });
      } else {
        console.log('✅ No DOM nesting warnings');
      }
      
      // Close dialog
      const closeButton = await page.locator('button[aria-label="Close"], [data-testid="close-button"]').first();
      const hasCloseButton = await closeButton.isVisible();
      
      if (hasCloseButton) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
    
    console.log('📝 Step 4: Test as Director (Khổng Đức Mạnh)');
    
    // Switch to Director user
    await page.evaluate(() => {
      const director = {
        id: 'user_khong_duc_manh',
        name: 'Khổng Đức Mạnh',
        email: 'khong.duc.manh@example.com',
        role: 'retail_director',
        team_id: 'director',
        location: 'hanoi',
        department: 'Bán lẻ',
        department_type: 'retail',
        position: 'Trưởng phòng kinh doanh',
        status: 'active',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(director));
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Click on "Của nhóm" tab as Director
    const directorTeamTab = await page.locator('button:has-text("Của nhóm")').first();
    const hasDirectorTeamTab = await directorTeamTab.isVisible();
    
    if (hasDirectorTeamTab) {
      await directorTeamTab.click();
      await page.waitForTimeout(2000);
      
      // Check how many team cards Director can see
      const directorTeamCards = await page.locator('[class*="team"], [class*="card"]:has-text("NHÓM")').all();
      console.log(`👑 Team cards visible for Director: ${directorTeamCards.length}`);
      
      // Director should see all teams
      const allTeamNames = ['NHÓM 1 - VIỆT ANH', 'NHÓM 2 - THẢO', 'NHÓM 3 - BỐN', 'NHÓM 4 - HƯƠNG'];
      let visibleTeams = 0;
      
      for (const teamName of allTeamNames) {
        const teamCard = await page.locator(`:has-text("${teamName}")`).first();
        const isVisible = await teamCard.isVisible();
        if (isVisible) visibleTeams++;
        console.log(`  ${teamName}: ${isVisible ? '✅' : '❌'}`);
      }
      
      if (visibleTeams >= 4) {
        console.log('✅ PERMISSION OK: Director can see all teams');
      } else {
        console.log('🚨 PERMISSION ERROR: Director cannot see all teams!');
      }
    }
    
    console.log('📝 Step 5: Check console errors');
    
    // Check for any console errors
    if (errors.length > 0) {
      console.log('\n🚨 Console Errors:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.substring(0, 150)}...`);
      });
    } else {
      console.log('✅ No console errors');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'permission-fix-test.png', fullPage: true });
    
    console.log('\n✅ Permission and DOM nesting test completed');
  });
});
