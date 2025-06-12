import { test, expect } from '@playwright/test';

test.describe('Final Plan Creation Test', () => {
  test('should create plan manually and verify sync issue', async ({ page }) => {
    console.log('🔍 Final diagnosis of plan creation and sync...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    // Step 1: Create plan directly in localStorage
    console.log('📝 Step 1: Create plan directly in localStorage');
    const planResult = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      
      const testPlan = {
        id: `plan_final_${Date.now()}`,
        userId: userId,
        title: 'Final Test Plan - Họp khách hàng ABC',
        description: 'Thảo luận về dự án rèm cửa cho văn phòng ABC',
        type: 'meeting',
        status: 'pending',
        priority: 'high',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        location: 'Phòng họp A - Tầng 2',
        notes: 'Chuẩn bị báo giá và mẫu vải',
        participants: ['Khách hàng ABC', 'Nhân viên kinh doanh'],
        creator: 'Khổng Đức Mạnh',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      } catch (e) {
        console.error('Error parsing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(planKey, JSON.stringify(plans));
      
      console.log('✅ Created plan in localStorage');
      console.log('Plan details:', testPlan);
      
      return {
        success: true,
        planId: testPlan.id,
        planTitle: testPlan.title,
        totalPlans: plans.length,
        allPlans: plans
      };
    });
    
    console.log('Plan creation result:', planResult);
    
    // Step 2: Check if refresh functions are available
    console.log('🔄 Step 2: Check refresh functions');
    const refreshStatus = await page.evaluate(() => {
      return {
        refreshCalendarPlans: typeof (window as any).refreshCalendarPlans === 'function',
        refreshPlanList: typeof (window as any).refreshPlanList === 'function'
      };
    });
    
    console.log('Refresh functions status:', refreshStatus);
    
    // Step 3: Try to trigger refresh manually
    if (refreshStatus.refreshCalendarPlans || refreshStatus.refreshPlanList) {
      console.log('🔄 Step 3: Trigger manual refresh');
      await page.evaluate(() => {
        if ((window as any).refreshCalendarPlans) {
          console.log('Calling refreshCalendarPlans...');
          (window as any).refreshCalendarPlans();
        }
        if ((window as any).refreshPlanList) {
          console.log('Calling refreshPlanList...');
          (window as any).refreshPlanList();
        }
      });
      await page.waitForTimeout(2000);
    }
    
    // Step 4: Check calendar page
    console.log('📅 Step 4: Check calendar page');
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    const planInCalendar = page.locator(`text=${planResult.planTitle}`);
    const calendarVisible = await planInCalendar.isVisible({ timeout: 5000 });
    console.log('Plan visible in calendar:', calendarVisible);
    
    // Step 5: Check plans page
    console.log('📋 Step 5: Check plans page');
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    const planInList = page.locator(`text=${planResult.planTitle}`);
    const listVisible = await planInList.isVisible({ timeout: 5000 });
    console.log('Plan visible in plans list:', listVisible);
    
    // Step 6: Force page refresh and check again
    console.log('🔄 Step 6: Force page refresh');
    await page.reload();
    await page.waitForTimeout(3000);
    
    const planAfterRefresh = page.locator(`text=${planResult.planTitle}`);
    const refreshVisible = await planAfterRefresh.isVisible({ timeout: 5000 });
    console.log('Plan visible after page refresh:', refreshVisible);
    
    // Step 7: Check localStorage persistence
    console.log('💾 Step 7: Verify localStorage persistence');
    const persistenceCheck = await page.evaluate(() => {
      const userId = '1';
      const planKey = `personal_plans_${userId}`;
      const plans = JSON.parse(localStorage.getItem(planKey) || '[]');
      return {
        planCount: plans.length,
        planTitles: plans.map(p => p.title),
        latestPlan: plans[plans.length - 1]
      };
    });
    
    console.log('Persistence check:', persistenceCheck);
    
    // Step 8: Test sync functionality if plan is visible
    if (refreshVisible || listVisible) {
      console.log('🔄 Step 8: Test sync functionality');
      
      const syncButton = page.locator('button:has-text("Đồng bộ")');
      const syncButtonVisible = await syncButton.isVisible({ timeout: 5000 });
      console.log('Sync button visible:', syncButtonVisible);
      
      if (syncButtonVisible) {
        await syncButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Clicked sync button');
        
        // Check tasks page
        await page.goto('http://localhost:8088/tasks');
        await page.waitForTimeout(3000);
        
        const taskInList = page.locator(`text=${planResult.planTitle}`);
        const taskVisible = await taskInList.isVisible({ timeout: 5000 });
        console.log('Task visible after sync:', taskVisible);
      }
    }
    
    // Step 9: Final diagnosis
    console.log('\n🎯 FINAL DIAGNOSIS:');
    console.log('===================');
    console.log('✅ Plan created in localStorage:', planResult.success);
    console.log('✅ Total plans in storage:', persistenceCheck.planCount);
    console.log('❌ Plan visible in calendar:', calendarVisible);
    console.log('❌ Plan visible in plans list:', listVisible);
    console.log('❌ Plan visible after refresh:', refreshVisible);
    console.log('🔄 Refresh functions available:', refreshStatus.refreshCalendarPlans || refreshStatus.refreshPlanList);
    
    if (planResult.success && !refreshVisible) {
      console.log('\n🚨 ISSUE CONFIRMED:');
      console.log('- Plans are saved to localStorage successfully');
      console.log('- UI components are not loading plans from localStorage');
      console.log('- Refresh functions may not be working properly');
      console.log('- Need to fix component state management');
    }
    
    // Return diagnostic data
    return {
      planCreated: planResult.success,
      planVisible: refreshVisible || listVisible || calendarVisible,
      refreshFunctionsWork: refreshStatus.refreshCalendarPlans || refreshStatus.refreshPlanList,
      storageCount: persistenceCheck.planCount
    };
  });
});
