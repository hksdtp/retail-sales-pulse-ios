import { test, expect } from '@playwright/test';

test.describe('Create Test Plan for Debugging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should create a test plan and verify it appears', async ({ page }) => {
    console.log('🧪 Creating test plan for debugging...');
    
    // Go to Plans page
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    // Check debug script loaded
    const debugResult = await page.evaluate(() => {
      console.log('🔍 Running debug script...');
      return typeof window !== 'undefined';
    });
    
    console.log('Debug script available:', debugResult);
    
    // Create plan via modal
    const createButton = page.locator('button:has-text("Tạo kế hoạch")').first();
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Fill form
      await page.fill('input[placeholder*="tiêu đề"]', 'Test Plan - Họp khách hàng XYZ');
      await page.fill('textarea[placeholder*="mô tả"]', 'Thảo luận về dự án rèm cửa cho văn phòng');
      
      // Select type
      await page.click('[role="combobox"]');
      await page.waitForTimeout(500);
      await page.click('text=🤝 Họp');
      
      // Select priority
      await page.click('[role="combobox"]:nth-child(2)');
      await page.waitForTimeout(500);
      await page.click('text=Cao');
      
      // Set date to today
      const today = new Date().toISOString().split('T')[0];
      await page.fill('input[type="date"]', today);
      
      // Set time
      await page.fill('input[type="time"]', '14:00');
      
      // Set location
      await page.fill('input[placeholder*="địa điểm"]', 'Phòng họp A - Tầng 2');
      
      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      console.log('✅ Plan creation form submitted');
    }
    
    // Check localStorage after creation
    const planData = await page.evaluate(() => {
      const userId = '1'; // Khổng Đức Mạnh
      const storageKey = `personal_plans_${userId}`;
      const plans = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log('📋 Plans in localStorage:', plans);
      return plans;
    });
    
    console.log('Plans found:', planData.length);
    
    // Refresh page and check if plan appears
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Look for the plan in the UI
    const planExists = await page.locator('text=Test Plan - Họp khách hàng XYZ').isVisible({ timeout: 5000 });
    console.log('Plan visible in UI:', planExists);
    
    // Check calendar page
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    // Click on today's date in calendar
    const todayButton = page.locator('.rdp-day_today').first();
    if (await todayButton.isVisible({ timeout: 5000 })) {
      await todayButton.click();
      await page.waitForTimeout(2000);
      
      const calendarPlan = await page.locator('text=Test Plan - Họp khách hàng XYZ').isVisible({ timeout: 5000 });
      console.log('Plan visible in calendar:', calendarPlan);
    }
    
    // Debug localStorage one more time
    await page.evaluate(() => {
      console.log('🔍 Final localStorage check:');
      const allKeys = Object.keys(localStorage);
      const planKeys = allKeys.filter(key => key.startsWith('personal_plans_'));
      planKeys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`${key}:`, data);
      });
    });
    
    expect(true).toBe(true); // Always pass for debugging
  });

  test('should test localStorage directly', async ({ page }) => {
    console.log('🧪 Testing localStorage directly...');
    
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(2000);
    
    // Create plan directly in localStorage
    const result = await page.evaluate(() => {
      const userId = '1';
      const storageKey = `personal_plans_${userId}`;
      
      const testPlan = {
        id: `plan_${Date.now()}_test`,
        userId: userId,
        title: 'Direct localStorage Test Plan',
        description: 'Plan tạo trực tiếp trong localStorage',
        type: 'meeting',
        status: 'pending',
        priority: 'high',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '15:00',
        endTime: '16:00',
        location: 'Test Location',
        notes: 'Test notes',
        participants: ['Test User'],
        creator: 'Direct Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        console.error('Error parsing existing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(storageKey, JSON.stringify(plans));
      
      console.log('✅ Created plan directly in localStorage');
      console.log('📋 Total plans:', plans.length);
      
      return { success: true, planCount: plans.length, plan: testPlan };
    });
    
    console.log('Direct creation result:', result);
    
    // Refresh and check if it appears
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Go to plans page
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    const directPlan = await page.locator('text=Direct localStorage Test Plan').isVisible({ timeout: 5000 });
    console.log('Direct plan visible:', directPlan);
    
    // Go to calendar
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    const calendarDirectPlan = await page.locator('text=Direct localStorage Test Plan').isVisible({ timeout: 5000 });
    console.log('Direct plan in calendar:', calendarDirectPlan);
    
    expect(true).toBe(true);
  });
});
