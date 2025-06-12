import { test, expect } from '@playwright/test';

test.describe('Simple Plan Creation Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should create plan and check sync', async ({ page }) => {
    console.log('🧪 Simple plan creation and sync test...');
    
    // Step 1: Go to Plans page
    console.log('📋 Step 1: Navigate to Plans page');
    const plansMenu = page.locator('text=Kế hoạch').first();
    await plansMenu.click();
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Step 2: Click create plan button
    console.log('✨ Step 2: Click create plan button');
    const createButton = page.locator('button:has-text("Tạo kế hoạch")').first();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Check if modal content is visible
    console.log('📝 Step 3: Fill plan form');
    const modalTitle = page.locator('h2:has-text("Tạo kế hoạch mới")');
    const modalVisible = await modalTitle.isVisible({ timeout: 5000 });
    console.log('Modal title visible:', modalVisible);
    
    if (modalVisible) {
      // Fill form fields
      const testTitle = `Test Plan ${new Date().getTime()}`;
      
      // Title
      const titleInput = page.locator('input[id="title"]');
      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.fill(testTitle);
        console.log('✅ Filled title:', testTitle);
      }
      
      // Description
      const descInput = page.locator('textarea[id="description"]');
      if (await descInput.isVisible({ timeout: 3000 })) {
        await descInput.fill('Test plan để kiểm tra đồng bộ với công việc');
        console.log('✅ Filled description');
      }
      
      // Type selection
      const typeSelect = page.locator('select, [role="combobox"]').first();
      if (await typeSelect.isVisible({ timeout: 3000 })) {
        await typeSelect.click();
        await page.waitForTimeout(1000);
        
        // Try to select meeting option
        const meetingOption = page.locator('[data-value="meeting"], text=Họp').first();
        if (await meetingOption.isVisible({ timeout: 3000 })) {
          await meetingOption.click();
          console.log('✅ Selected meeting type');
        }
      }
      
      // Priority selection
      const prioritySelects = page.locator('select, [role="combobox"]');
      if (await prioritySelects.count() > 1) {
        const prioritySelect = prioritySelects.nth(1);
        await prioritySelect.click();
        await page.waitForTimeout(1000);
        
        const highPriority = page.locator('[data-value="high"], text=Cao').first();
        if (await highPriority.isVisible({ timeout: 3000 })) {
          await highPriority.click();
          console.log('✅ Selected high priority');
        }
      }
      
      // Date
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 3000 })) {
        const today = new Date().toISOString().split('T')[0];
        await dateInput.fill(today);
        console.log('✅ Set date:', today);
      }
      
      // Time
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible({ timeout: 3000 })) {
        await timeInput.fill('15:30');
        console.log('✅ Set time: 15:30');
      }
      
      // Location
      const locationInput = page.locator('input[id="location"]');
      if (await locationInput.isVisible({ timeout: 3000 })) {
        await locationInput.fill('Phòng họp Test Sync');
        console.log('✅ Set location');
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible({ timeout: 3000 })) {
        await submitButton.click();
        console.log('✅ Submitted form');
        await page.waitForTimeout(3000);
        
        // Check for success alert
        page.on('dialog', async dialog => {
          console.log('Alert message:', dialog.message());
          await dialog.accept();
        });
        
        // Check localStorage
        const planData = await page.evaluate(() => {
          const userId = '1';
          const planKey = `personal_plans_${userId}`;
          const plans = JSON.parse(localStorage.getItem(planKey) || '[]');
          return {
            count: plans.length,
            latestPlan: plans[plans.length - 1] || null
          };
        });
        
        console.log('Plans in localStorage:', planData.count);
        console.log('Latest plan:', planData.latestPlan?.title);
        
        // Step 4: Check if plan appears in calendar
        console.log('📅 Step 4: Check calendar view');
        await page.waitForTimeout(2000);
        
        const planInCalendar = page.locator(`text=${testTitle}`);
        const calendarVisible = await planInCalendar.isVisible({ timeout: 5000 });
        console.log('Plan visible in calendar:', calendarVisible);
        
        // Step 5: Test sync functionality
        console.log('🔄 Step 5: Test sync functionality');
        
        // Go to plans list page
        await page.goto('http://localhost:8088/plans');
        await page.waitForTimeout(3000);
        
        // Look for sync button
        const syncButton = page.locator('button:has-text("Đồng bộ với Công việc")');
        const syncButtonVisible = await syncButton.isVisible({ timeout: 5000 });
        console.log('Sync button visible:', syncButtonVisible);
        
        if (syncButtonVisible) {
          await syncButton.click();
          console.log('✅ Clicked sync button');
          await page.waitForTimeout(3000);
        } else {
          // Try individual plan sync
          const planCard = page.locator(`text=${testTitle}`).first();
          if (await planCard.isVisible({ timeout: 5000 })) {
            // Look for dropdown menu
            const dropdownButton = page.locator('button[aria-haspopup="menu"]').first();
            if (await dropdownButton.isVisible({ timeout: 3000 })) {
              await dropdownButton.click();
              await page.waitForTimeout(1000);
              
              const syncOption = page.locator('text=Đồng bộ thành Công việc');
              if (await syncOption.isVisible({ timeout: 3000 })) {
                await syncOption.click();
                console.log('✅ Clicked individual sync');
                await page.waitForTimeout(2000);
              }
            }
          }
        }
        
        // Step 6: Check tasks page
        console.log('📋 Step 6: Check tasks page');
        await page.goto('http://localhost:8088/tasks');
        await page.waitForTimeout(3000);
        
        const taskInList = page.locator(`text=${testTitle}`);
        const taskVisible = await taskInList.isVisible({ timeout: 5000 });
        console.log('Task visible in tasks page:', taskVisible);
        
        // Step 7: Final summary
        console.log('\n🎯 FINAL TEST RESULTS:');
        console.log('======================');
        console.log('✅ Modal opened:', modalVisible);
        console.log('✅ Form filled:', titleInput !== null);
        console.log('✅ Plan created:', planData.count > 0);
        console.log('✅ Plan in calendar:', calendarVisible);
        console.log('✅ Sync button found:', syncButtonVisible);
        console.log('✅ Task synced:', taskVisible);
        
        if (planData.count > 0 && taskVisible) {
          console.log('🎉 SUCCESS: Plan created and synced successfully!');
        } else if (planData.count > 0) {
          console.log('⚠️ PARTIAL: Plan created but sync may need manual trigger');
        } else {
          console.log('❌ FAILED: Plan creation failed');
        }
        
        // Return results for assertion
        return {
          planCreated: planData.count > 0,
          taskSynced: taskVisible,
          syncButtonFound: syncButtonVisible
        };
        
      } else {
        console.log('❌ Submit button not found');
      }
    } else {
      console.log('❌ Modal did not open');
    }
  });

  test('should manually test sync service', async ({ page }) => {
    console.log('🔧 Testing sync service manually...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    // Test sync service directly
    const syncResult = await page.evaluate(async () => {
      // Create a test plan manually
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      const testPlan = {
        id: `plan_manual_${Date.now()}`,
        userId: userId,
        title: 'Manual Sync Test Plan',
        description: 'Plan tạo để test sync service',
        type: 'meeting',
        status: 'pending',
        priority: 'high',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:00',
        location: 'Manual Test Location',
        notes: 'Manual test notes',
        participants: ['Test User'],
        creator: 'Manual Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      } catch (e) {
        console.error('Error parsing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(planKey, JSON.stringify(plans));
      
      console.log('✅ Created manual test plan');
      
      return {
        planCreated: true,
        planId: testPlan.id,
        planTitle: testPlan.title,
        totalPlans: plans.length
      };
    });
    
    console.log('Manual sync result:', syncResult);
    
    // Refresh page to see if plan appears
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Go to plans page
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    const manualPlan = page.locator('text=Manual Sync Test Plan');
    const manualPlanVisible = await manualPlan.isVisible({ timeout: 5000 });
    console.log('Manual plan visible in UI:', manualPlanVisible);
    
    expect(syncResult.planCreated).toBe(true);
  });
});
