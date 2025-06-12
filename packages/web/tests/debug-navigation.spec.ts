import { test, expect } from '@playwright/test';

test.describe('Debug Navigation and Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8088/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should debug navigation and find plans page', async ({ page }) => {
    console.log('🔍 Debugging navigation and plans page...');
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if user is authenticated
    const userInfo = await page.evaluate(() => {
      const storedUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('authToken');
      return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: authToken,
        isAuthenticated: localStorage.getItem('isAuthenticated')
      };
    });
    console.log('User info:', userInfo);
    
    // Check sidebar menu items
    console.log('🔍 Checking sidebar menu items...');
    const menuItems = await page.locator('nav a').allTextContents();
    console.log('Menu items found:', menuItems);
    
    // Look for Plans menu specifically
    const plansMenu = page.locator('text=Kế hoạch');
    const plansMenuCount = await plansMenu.count();
    console.log('Plans menu count:', plansMenuCount);
    
    for (let i = 0; i < plansMenuCount; i++) {
      const menuItem = plansMenu.nth(i);
      const isVisible = await menuItem.isVisible();
      const text = await menuItem.textContent();
      console.log(`Plans menu ${i}: visible=${isVisible}, text="${text}"`);
    }
    
    // Try clicking the first visible Plans menu
    const firstPlansMenu = plansMenu.first();
    if (await firstPlansMenu.isVisible({ timeout: 5000 })) {
      console.log('✅ Clicking Plans menu...');
      await firstPlansMenu.click();
      await page.waitForTimeout(3000);
      
      // Check new URL
      const newUrl = page.url();
      console.log('New URL after clicking Plans:', newUrl);
      
      // Check for page content
      const pageContent = await page.locator('h1, h2, h3').allTextContents();
      console.log('Page headings:', pageContent);
      
      // Look for create button
      const createButtons = await page.locator('button').allTextContents();
      console.log('All buttons:', createButtons);
      
      const createPlanButton = page.locator('button:has-text("Tạo kế hoạch")');
      const createButtonCount = await createPlanButton.count();
      console.log('Create plan button count:', createButtonCount);
      
      if (createButtonCount > 0) {
        console.log('✅ Found create plan button!');
        
        // Try to create a plan
        await createPlanButton.first().click();
        await page.waitForTimeout(2000);
        
        // Check if modal opened
        const modal = page.locator('[role="dialog"], .modal, .fixed.inset-0');
        const modalVisible = await modal.isVisible({ timeout: 5000 });
        console.log('Modal visible:', modalVisible);
        
        if (modalVisible) {
          console.log('✅ Modal opened, checking form fields...');
          
          // Check form fields
          const titleInput = page.locator('input[placeholder*="tiêu đề"], input[id="title"]');
          const titleVisible = await titleInput.isVisible({ timeout: 3000 });
          console.log('Title input visible:', titleVisible);
          
          const descInput = page.locator('textarea[placeholder*="mô tả"], textarea[id="description"]');
          const descVisible = await descInput.isVisible({ timeout: 3000 });
          console.log('Description input visible:', descVisible);
          
          const typeSelect = page.locator('[role="combobox"]');
          const typeSelectCount = await typeSelect.count();
          console.log('Type select count:', typeSelectCount);
          
          if (titleVisible) {
            // Fill a simple plan
            const testTitle = `Test Plan ${new Date().getTime()}`;
            await titleInput.fill(testTitle);
            console.log('✅ Filled title:', testTitle);
            
            if (descVisible) {
              await descInput.fill('Test description for plan');
              console.log('✅ Filled description');
            }
            
            // Try to select type
            if (typeSelectCount > 0) {
              await typeSelect.first().click();
              await page.waitForTimeout(1000);
              
              const options = await page.locator('[role="option"], [data-value]').allTextContents();
              console.log('Type options:', options);
              
              const meetingOption = page.locator('text=Họp');
              if (await meetingOption.isVisible({ timeout: 3000 })) {
                await meetingOption.click();
                console.log('✅ Selected meeting type');
              }
            }
            
            // Set date
            const dateInput = page.locator('input[type="date"]');
            if (await dateInput.isVisible({ timeout: 3000 })) {
              const today = new Date().toISOString().split('T')[0];
              await dateInput.fill(today);
              console.log('✅ Set date:', today);
            }
            
            // Set time
            const timeInput = page.locator('input[type="time"]');
            if (await timeInput.isVisible({ timeout: 3000 })) {
              await timeInput.fill('14:00');
              console.log('✅ Set time: 14:00');
            }
            
            // Submit
            const submitButton = page.locator('button[type="submit"], button:has-text("Tạo kế hoạch")').last();
            if (await submitButton.isVisible({ timeout: 3000 })) {
              await submitButton.click();
              console.log('✅ Submitted form');
              await page.waitForTimeout(3000);
              
              // Check for success
              const successMessage = page.locator('text=thành công');
              const successVisible = await successMessage.isVisible({ timeout: 5000 });
              console.log('Success message visible:', successVisible);
              
              // Check localStorage after creation
              const planData = await page.evaluate(() => {
                const userId = '1';
                const planKey = `personal_plans_${userId}`;
                const plans = JSON.parse(localStorage.getItem(planKey) || '[]');
                return plans;
              });
              console.log('Plans in localStorage after creation:', planData.length);
              
              // Check if plan appears in list
              await page.waitForTimeout(2000);
              const planInList = page.locator(`text=${testTitle}`);
              const planVisible = await planInList.isVisible({ timeout: 5000 });
              console.log('Plan visible in list:', planVisible);
              
              // Test sync functionality
              console.log('🔄 Testing sync functionality...');
              
              // Look for sync button
              const syncButton = page.locator('button:has-text("Đồng bộ")');
              const syncButtonVisible = await syncButton.isVisible({ timeout: 5000 });
              console.log('Sync button visible:', syncButtonVisible);
              
              if (syncButtonVisible) {
                await syncButton.click();
                await page.waitForTimeout(2000);
                console.log('✅ Clicked sync button');
              }
              
              // Check tasks page
              console.log('📋 Checking tasks page...');
              await page.goto('http://localhost:8088/tasks');
              await page.waitForTimeout(3000);
              
              const taskInList = page.locator(`text=${testTitle}`);
              const taskVisible = await taskInList.isVisible({ timeout: 5000 });
              console.log('Task visible in tasks page:', taskVisible);
              
              // Final summary
              console.log('\n📊 FINAL SUMMARY:');
              console.log('=================');
              console.log('✅ Plans page accessible:', newUrl.includes('plans') || newUrl.includes('calendar'));
              console.log('✅ Create button found:', createButtonCount > 0);
              console.log('✅ Modal opened:', modalVisible);
              console.log('✅ Form filled:', titleVisible);
              console.log('✅ Plan created:', planData.length > 0);
              console.log('✅ Plan in list:', planVisible);
              console.log('✅ Sync button:', syncButtonVisible);
              console.log('✅ Task synced:', taskVisible);
              
            } else {
              console.log('❌ Submit button not found');
            }
          } else {
            console.log('❌ Title input not found');
          }
        } else {
          console.log('❌ Modal did not open');
        }
      } else {
        console.log('❌ Create plan button not found');
      }
    } else {
      console.log('❌ Plans menu not found or not visible');
    }
  });
});
