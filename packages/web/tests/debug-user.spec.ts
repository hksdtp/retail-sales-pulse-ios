import { test, expect } from '@playwright/test';

test.describe('Debug Current User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should debug current user and localStorage', async ({ page }) => {
    console.log('🔍 Debugging current user...');
    
    // Check current user in React context
    const userInfo = await page.evaluate(() => {
      // Try to access React context
      const rootElement = document.getElementById('root');
      if (rootElement && (rootElement as any)._reactInternalFiber) {
        console.log('React fiber found');
      }
      
      // Check localStorage
      const storedUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('authToken');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      console.log('📦 localStorage data:');
      console.log('- currentUser:', storedUser);
      console.log('- authToken:', authToken);
      console.log('- isAuthenticated:', isAuthenticated);
      
      // Check plans
      const planKeys = Object.keys(localStorage).filter(key => key.startsWith('personal_plans_'));
      console.log('📋 Plan keys:', planKeys);
      
      planKeys.forEach(key => {
        const plans = JSON.parse(localStorage.getItem(key) || '[]');
        console.log(`${key}:`, plans.length, 'plans');
      });
      
      return {
        storedUser: storedUser ? JSON.parse(storedUser) : null,
        authToken,
        isAuthenticated,
        planKeys,
        userAgent: navigator.userAgent
      };
    });
    
    console.log('User info:', userInfo);
    
    // Check if we're on the right page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if user name appears anywhere
    const userNameVisible = await page.locator('text=Khổng Đức Mạnh').isVisible({ timeout: 5000 });
    console.log('User name visible:', userNameVisible);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Try to find any user-related elements
    const userElements = await page.locator('[data-testid*="user"], [class*="user"], [id*="user"]').count();
    console.log('User-related elements:', userElements);
    
    // Check console logs
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('user') || msg.text().includes('auth') || msg.text().includes('plan')) {
        logs.push(msg.text());
      }
    });
    
    // Refresh and wait
    await page.reload();
    await page.waitForTimeout(5000);
    
    console.log('Console logs:', logs);
    
    expect(true).toBe(true);
  });

  test('should manually create plan and check components', async ({ page }) => {
    console.log('🧪 Manual plan creation test...');
    
    // Create plan in localStorage first
    await page.evaluate(() => {
      const userId = '1';
      const storageKey = `personal_plans_${userId}`;
      
      const testPlan = {
        id: `plan_manual_${Date.now()}`,
        userId: userId,
        title: 'Manual Test Plan',
        description: 'Plan tạo thủ công để test',
        type: 'meeting',
        status: 'pending',
        priority: 'high',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:00',
        location: 'Manual Test Location',
        notes: 'Manual test notes',
        participants: ['Manual Test User'],
        creator: 'Manual Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let plans = [];
      try {
        plans = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        console.error('Error parsing plans:', e);
      }
      
      plans.push(testPlan);
      localStorage.setItem(storageKey, JSON.stringify(plans));
      
      console.log('✅ Manual plan created:', testPlan.title);
      console.log('📋 Total plans:', plans.length);
      
      // Try to trigger refresh functions
      if ((window as any).refreshCalendarPlans) {
        console.log('🔄 Calling refreshCalendarPlans...');
        (window as any).refreshCalendarPlans();
      }
      
      if ((window as any).refreshPlanList) {
        console.log('🔄 Calling refreshPlanList...');
        (window as any).refreshPlanList();
      }
      
      return testPlan;
    });
    
    await page.waitForTimeout(2000);
    
    // Check if plan appears in calendar
    await page.goto('http://localhost:8088/');
    await page.waitForTimeout(3000);
    
    const calendarPlan = await page.locator('text=Manual Test Plan').isVisible({ timeout: 5000 });
    console.log('Manual plan in calendar:', calendarPlan);
    
    // Check if plan appears in plans page
    await page.goto('http://localhost:8088/plans');
    await page.waitForTimeout(3000);
    
    const plansPlan = await page.locator('text=Manual Test Plan').isVisible({ timeout: 5000 });
    console.log('Manual plan in plans page:', plansPlan);
    
    // Check component states
    const componentStates = await page.evaluate(() => {
      const planKeys = Object.keys(localStorage).filter(key => key.startsWith('personal_plans_'));
      const allPlans = [];
      
      planKeys.forEach(key => {
        const plans = JSON.parse(localStorage.getItem(key) || '[]');
        allPlans.push(...plans);
      });
      
      return {
        totalPlans: allPlans.length,
        planTitles: allPlans.map(p => p.title),
        refreshFunctionsAvailable: {
          refreshCalendarPlans: typeof (window as any).refreshCalendarPlans === 'function',
          refreshPlanList: typeof (window as any).refreshPlanList === 'function'
        }
      };
    });
    
    console.log('Component states:', componentStates);
    
    expect(true).toBe(true);
  });
});
