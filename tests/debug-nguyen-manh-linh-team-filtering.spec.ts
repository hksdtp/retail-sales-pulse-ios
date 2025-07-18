import { test, expect } from '@playwright/test';

test.describe('Debug Nguyễn Mạnh Linh Team Filtering Issue', () => {
  test('should show only Team 2 tasks for Nguyễn Mạnh Linh', async ({ page }) => {
    console.log('🔍 Testing team filtering for Nguyễn Mạnh Linh...');

    // Navigate to login page
    await page.goto('http://localhost:8088/login');
    await page.waitForLoadState('networkidle');

    // Login as Nguyễn Mạnh Linh
    console.log('🔐 Logging in as Nguyễn Mạnh Linh...');
    
    // Select user from dropdown
    await page.click('[data-testid="user-select-trigger"]');
    await page.waitForTimeout(1000);
    
    // Find and click Nguyễn Mạnh Linh option
    const userOption = page.locator('text="Nguyễn Mạnh Linh"').first();
    await expect(userOption).toBeVisible();
    await userOption.click();
    await page.waitForTimeout(1000);

    // Enter password
    await page.fill('input[type="password"]', '123456');
    await page.waitForTimeout(500);

    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Wait for main app to load
    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });
    console.log('✅ Login successful, main app loaded');

    // Navigate to Tasks menu
    console.log('📋 Navigating to Tasks menu...');
    await page.click('text="Công việc"');
    await page.waitForTimeout(2000);

    // Click on "Công việc của nhóm" tab
    console.log('👥 Clicking on "Công việc của nhóm" tab...');
    await page.click('text="Công việc của nhóm"');
    await page.waitForTimeout(2000);

    // Debug: Log current user info from browser
    const currentUserInfo = await page.evaluate(() => {
      const user = (window as any).currentUser;
      return {
        name: user?.name,
        id: user?.id,
        team_id: user?.team_id,
        role: user?.role
      };
    });
    console.log('👤 Current user info from browser:', currentUserInfo);

    // Verify user is Nguyễn Mạnh Linh with team_id = '2'
    expect(currentUserInfo.name).toBe('Nguyễn Mạnh Linh');
    expect(currentUserInfo.team_id).toBe('2');
    expect(currentUserInfo.role).toBe('employee');

    // Check visible teams in TeamCardsView
    console.log('🏢 Checking visible teams...');
    
    // Should only see Team 2 card
    const teamCards = await page.locator('[data-testid="team-card"]').all();
    console.log(`📊 Found ${teamCards.length} team cards`);

    // Verify only Team 2 is visible
    const team2Card = page.locator('text="NHÓM 2 - THẢO"');
    await expect(team2Card).toBeVisible();
    
    // Verify Team 1 is NOT visible
    const team1Card = page.locator('text="NHÓM 1 - VIỆT ANH"');
    await expect(team1Card).not.toBeVisible();

    console.log('✅ Team filtering correct: Only Team 2 visible');

    // Click on Team 2 to view tasks
    console.log('🎯 Clicking on Team 2 to view tasks...');
    await team2Card.click();
    await page.waitForTimeout(2000);

    // Debug: Check selectedTeamForView state
    const teamViewState = await page.evaluate(() => {
      return {
        selectedTeamForView: (window as any).selectedTeamForView,
        showTeamCards: (window as any).showTeamCards
      };
    });
    console.log('🔍 Team view state:', teamViewState);

    // Verify we're now viewing Team 2 tasks
    const teamHeader = page.locator('text="NHÓM 2 - THẢO"').first();
    await expect(teamHeader).toBeVisible();

    // Check task list
    console.log('📋 Checking task list...');
    
    // Should see Team 2 tasks only
    const team2Tasks = page.locator('text="Task của NHÓM 2"');
    const minhLinhTask = page.locator('text="Task cho Nguyễn Mạnh Linh"');
    
    // Wait for tasks to load
    await page.waitForTimeout(2000);

    // Verify Team 2 tasks are visible
    await expect(team2Tasks).toBeVisible();
    await expect(minhLinhTask).toBeVisible();

    // Verify Team 1 tasks are NOT visible
    const team1Tasks = page.locator('text="Task của NHÓM 1"');
    await expect(team1Tasks).not.toBeVisible();

    console.log('✅ Task filtering correct: Only Team 2 tasks visible');

    // Debug: Log all visible tasks
    const visibleTasks = await page.evaluate(() => {
      const taskElements = document.querySelectorAll('[data-testid="task-item"]');
      return Array.from(taskElements).map(el => ({
        title: el.querySelector('[data-testid="task-title"]')?.textContent,
        assignedTo: el.querySelector('[data-testid="task-assigned-to"]')?.textContent
      }));
    });
    console.log('📋 Visible tasks:', visibleTasks);

    // Take screenshot for verification
    await page.screenshot({ 
      path: 'debug-nguyen-manh-linh-team-filtering.png',
      fullPage: true 
    });

    console.log('✅ Test completed successfully');
  });

  test('should prevent access to other teams via direct navigation', async ({ page }) => {
    console.log('🔒 Testing team access prevention...');

    // Login as Nguyễn Mạnh Linh (same as above)
    await page.goto('http://localhost:8088/login');
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="user-select-trigger"]');
    await page.waitForTimeout(1000);
    
    const userOption = page.locator('text="Nguyễn Mạnh Linh"').first();
    await userOption.click();
    await page.waitForTimeout(1000);

    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.waitForSelector('[data-testid="main-app"]', { timeout: 10000 });

    // Navigate to Tasks menu
    await page.click('text="Công việc"');
    await page.waitForTimeout(2000);
    await page.click('text="Công việc của nhóm"');
    await page.waitForTimeout(2000);

    // Try to simulate selecting Team 1 (should be prevented)
    console.log('🚫 Attempting to access Team 1 (should be blocked)...');
    
    // Inject JavaScript to try to force team selection
    const accessResult = await page.evaluate(() => {
      try {
        // Try to manually set selectedTeamForView to Team 1
        const setTeamFunction = (window as any).setSelectedTeamForView;
        if (setTeamFunction) {
          setTeamFunction({ id: '1', name: 'NHÓM 1 - VIỆT ANH' });
          return 'attempted';
        }
        return 'no_function';
      } catch (error) {
        return `error: ${error.message}`;
      }
    });

    console.log('🔍 Access attempt result:', accessResult);

    // Verify Team 1 tasks are still not visible
    await page.waitForTimeout(1000);
    const team1Tasks = page.locator('text="Task của NHÓM 1"');
    await expect(team1Tasks).not.toBeVisible();

    console.log('✅ Access prevention working correctly');
  });
});
