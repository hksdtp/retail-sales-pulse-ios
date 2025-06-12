// Test script để kiểm tra fix auto-sync
import { chromium } from 'playwright';

async function testAutoSyncFix() {
  console.log('🚀 Starting Auto-Sync Fix Test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8089/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Login
    console.log('🔐 Logging in...');

    // Wait for login form to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.fill('input[type="email"]', 'vietanh@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Navigate to Plans
    console.log('📋 Navigating to Plans...');
    await page.click('text=Kế hoạch');
    await page.waitForTimeout(2000);
    
    // Create a plan
    console.log('➕ Creating a plan...');
    await page.click('text=Tạo kế hoạch mới');
    await page.waitForTimeout(1000);
    
    const testTitle = `Test Plan - Fix Check ${Date.now()}`;
    await page.fill('input[placeholder*="tiêu đề"]', testTitle);
    await page.fill('textarea[placeholder*="mô tả"]', 'Test plan for auto-sync fix verification');
    
    // Set date to today
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    await page.click('button:has-text("Tạo kế hoạch")');
    await page.waitForTimeout(3000);
    
    // Navigate to Tasks
    console.log('📝 Navigating to Tasks...');
    await page.click('text=Công việc');
    await page.waitForTimeout(3000);
    
    // Check if task appears in UI
    console.log('🔍 Checking if task appears in UI...');
    const taskExists = await page.locator(`text=${testTitle}`).count() > 0;
    
    // Check localStorage
    const userTasks = await page.evaluate(() => {
      const tasks = localStorage.getItem('user_tasks_1');
      return tasks ? JSON.parse(tasks) : [];
    });
    
    const rawTasks = await page.evaluate(() => {
      const tasks = localStorage.getItem('rawTasks');
      return tasks ? JSON.parse(tasks) : [];
    });
    
    const filteredTasks = await page.evaluate(() => {
      const tasks = localStorage.getItem('filteredTasks');
      return tasks ? JSON.parse(tasks) : [];
    });
    
    // Results
    console.log('\n🎯 TEST RESULTS:');
    console.log('================');
    console.log(`✅ Plan created: ${testTitle}`);
    console.log(`📋 User tasks count: ${userTasks.length}`);
    console.log(`📊 Raw tasks count: ${rawTasks.length}`);
    console.log(`🔍 Filtered tasks count: ${filteredTasks.length}`);
    console.log(`🎯 Task found in UI: ${taskExists}`);
    
    if (taskExists && rawTasks.length > 0 && filteredTasks.length > 0) {
      console.log('\n🎉 SUCCESS: Fix is working! Tasks are properly synced.');
    } else {
      console.log('\n❌ ISSUE: Fix needs more work.');
      console.log('- Task in UI:', taskExists);
      console.log('- Raw tasks:', rawTasks.length);
      console.log('- Filtered tasks:', filteredTasks.length);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAutoSyncFix();
