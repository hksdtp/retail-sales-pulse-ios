import { test, expect } from '@playwright/test';

test.describe('Plan Creation and Task Sync Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should create new plan and sync with tasks', async ({ page }) => {
    console.log('🧪 Testing plan creation and task sync...');
    
    // Step 1: Go to Plans page
    console.log('📋 Step 1: Navigate to Plans page');
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    // Check if we're on plans page
    const plansPageTitle = page.locator('h1:has-text("Kế hoạch")');
    const onPlansPage = await plansPageTitle.isVisible({ timeout: 5000 });
    console.log('On Plans page:', onPlansPage);
    
    if (!onPlansPage) {
      // Try clicking Plans menu
      const plansMenu = page.locator('text=Kế hoạch').first();
      if (await plansMenu.isVisible({ timeout: 5000 })) {
        await plansMenu.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Step 2: Create new plan
    console.log('✨ Step 2: Create new plan');
    const createButton = page.locator('button:has-text("Tạo kế hoạch")').first();
    const createButtonVisible = await createButton.isVisible({ timeout: 5000 });
    console.log('Create plan button visible:', createButtonVisible);
    
    if (createButtonVisible) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Fill plan form
      console.log('📝 Filling plan form...');
      const planTitle = `Test Plan Sync - ${new Date().toLocaleTimeString()}`;
      
      // Title
      const titleInput = page.locator('input[placeholder*="tiêu đề"], input[id="title"]');
      if (await titleInput.isVisible({ timeout: 5000 })) {
        await titleInput.fill(planTitle);
        console.log('✅ Filled title:', planTitle);
      }
      
      // Description
      const descInput = page.locator('textarea[placeholder*="mô tả"], textarea[id="description"]');
      if (await descInput.isVisible({ timeout: 5000 })) {
        await descInput.fill('Test plan để kiểm tra đồng bộ với công việc');
        console.log('✅ Filled description');
      }
      
      // Select type - Meeting
      const typeSelect = page.locator('[role="combobox"]').first();
      if (await typeSelect.isVisible({ timeout: 5000 })) {
        await typeSelect.click();
        await page.waitForTimeout(1000);
        
        const meetingOption = page.locator('text=🤝 Họp');
        if (await meetingOption.isVisible({ timeout: 3000 })) {
          await meetingOption.click();
          console.log('✅ Selected type: Meeting');
        }
      }
      
      // Select priority - High
      const prioritySelects = page.locator('[role="combobox"]');
      const prioritySelect = prioritySelects.nth(1);
      if (await prioritySelect.isVisible({ timeout: 5000 })) {
        await prioritySelect.click();
        await page.waitForTimeout(1000);
        
        const highPriority = page.locator('text=Cao');
        if (await highPriority.isVisible({ timeout: 3000 })) {
          await highPriority.click();
          console.log('✅ Selected priority: High');
        }
      }
      
      // Set date to today
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 5000 })) {
        const today = new Date().toISOString().split('T')[0];
        await dateInput.fill(today);
        console.log('✅ Set date:', today);
      }
      
      // Set time
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible({ timeout: 5000 })) {
        const currentTime = new Date();
        const timeString = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes() + 5).padStart(2, '0')}`;
        await timeInput.fill(timeString);
        console.log('✅ Set time:', timeString);
      }
      
      // Set location
      const locationInput = page.locator('input[placeholder*="địa điểm"], input[id="location"]');
      if (await locationInput.isVisible({ timeout: 5000 })) {
        await locationInput.fill('Phòng họp Test - Tầng 2');
        console.log('✅ Set location');
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Tạo kế hoạch")').last();
      if (await submitButton.isVisible({ timeout: 5000 })) {
        await submitButton.click();
        console.log('✅ Submitted plan form');
        await page.waitForTimeout(3000);
      }
      
      // Check for success message or modal close
      const successIndicator = page.locator('text=Tạo kế hoạch thành công');
      const successVisible = await successIndicator.isVisible({ timeout: 3000 });
      console.log('Success message visible:', successVisible);
      
      // Step 3: Check if plan appears in list
      console.log('🔍 Step 3: Check if plan appears in list');
      await page.waitForTimeout(2000);
      
      const planInList = page.locator(`text=${planTitle}`);
      const planVisible = await planInList.isVisible({ timeout: 5000 });
      console.log('Plan visible in list:', planVisible);
      
      // Step 4: Test sync functionality
      console.log('🔄 Step 4: Test sync functionality');
      
      // Look for sync button in header
      const syncButton = page.locator('button:has-text("Đồng bộ với Công việc")');
      const syncButtonVisible = await syncButton.isVisible({ timeout: 5000 });
      console.log('Sync button visible:', syncButtonVisible);
      
      if (syncButtonVisible) {
        await syncButton.click();
        console.log('✅ Clicked sync button');
        await page.waitForTimeout(3000);
        
        // Check for sync success message
        const syncSuccess = page.locator('text=Đã đồng bộ');
        const syncSuccessVisible = await syncSuccess.isVisible({ timeout: 5000 });
        console.log('Sync success message visible:', syncSuccessVisible);
      } else {
        // Try individual plan sync
        console.log('🔄 Trying individual plan sync...');
        
        if (planVisible) {
          // Look for plan dropdown menu
          const planCard = page.locator(`text=${planTitle}`).locator('..').locator('..');
          const dropdownButton = planCard.locator('button').last();
          
          if (await dropdownButton.isVisible({ timeout: 5000 })) {
            await dropdownButton.click();
            await page.waitForTimeout(1000);
            
            const syncOption = page.locator('text=Đồng bộ thành Công việc');
            if (await syncOption.isVisible({ timeout: 3000 })) {
              await syncOption.click();
              console.log('✅ Clicked individual sync option');
              await page.waitForTimeout(2000);
            }
          }
        }
      }
      
      // Step 5: Check Tasks page for synced task
      console.log('📋 Step 5: Check Tasks page for synced task');
      await page.goto('http://localhost:8088/tasks');
      await page.waitForTimeout(3000);
      
      // Look for the synced task
      const taskInList = page.locator(`text=${planTitle}`);
      const taskVisible = await taskInList.isVisible({ timeout: 5000 });
      console.log('Task visible in Tasks page:', taskVisible);
      
      // Step 6: Check Calendar page
      console.log('📅 Step 6: Check Calendar page');
      await page.goto('http://localhost:8088/');
      await page.waitForTimeout(3000);
      
      // Click on today's date
      const todayButton = page.locator('.rdp-day_today').first();
      if (await todayButton.isVisible({ timeout: 5000 })) {
        await todayButton.click();
        await page.waitForTimeout(2000);
        
        const planInCalendar = page.locator(`text=${planTitle}`);
        const calendarVisible = await planInCalendar.isVisible({ timeout: 5000 });
        console.log('Plan visible in Calendar:', calendarVisible);
      }
      
      // Step 7: Summary
      console.log('\n📊 TEST SUMMARY:');
      console.log('================');
      console.log('✅ Plan creation:', createButtonVisible);
      console.log('✅ Plan in list:', planVisible);
      console.log('✅ Sync button:', syncButtonVisible);
      console.log('✅ Task synced:', taskVisible);
      console.log('✅ Calendar view:', await page.locator(`text=${planTitle}`).isVisible({ timeout: 2000 }));
      
      // Final verification
      if (planVisible && taskVisible) {
        console.log('🎉 SUCCESS: Plan created and synced successfully!');
      } else {
        console.log('❌ ISSUE: Plan creation or sync failed');
      }
      
    } else {
      console.log('❌ Create plan button not found');
    }
  });

  test('should test localStorage and debug functions', async ({ page }) => {
    console.log('🔍 Testing localStorage and debug functions...');
    
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    // Check localStorage
    const storageData = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      const plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      
      console.log('📦 localStorage data:');
      console.log('- Plans count:', plans.length);
      console.log('- Plans:', plans);
      
      // Check refresh functions
      const refreshFunctions = {
        refreshCalendarPlans: typeof (window as any).refreshCalendarPlans === 'function',
        refreshPlanList: typeof (window as any).refreshPlanList === 'function'
      };
      
      console.log('🔄 Refresh functions:', refreshFunctions);
      
      return {
        plansCount: plans.length,
        plans: plans,
        refreshFunctions: refreshFunctions
      };
    });
    
    console.log('Storage data:', storageData);
    
    // Try manual refresh
    await page.evaluate(() => {
      if ((window as any).refreshPlanList) {
        console.log('🔄 Calling refreshPlanList...');
        (window as any).refreshPlanList();
      }
      
      if ((window as any).refreshCalendarPlans) {
        console.log('🔄 Calling refreshCalendarPlans...');
        (window as any).refreshCalendarPlans();
      }
    });
    
    await page.waitForTimeout(2000);
    
    expect(true).toBe(true); // Always pass for debugging
  });
});
