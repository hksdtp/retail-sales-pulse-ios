import { test, expect } from '@playwright/test';

test.describe('Simple Task Debug', () => {
  test('Debug task form elements', async ({ page }) => {
    console.log('🔍 Debugging task form elements...');
    
    // Setup user
    await page.goto('http://localhost:8088');
    
    await page.evaluate(() => {
      localStorage.clear();
      
      const user = {
        id: 'user_khanh_duy',
        name: 'Lê Khánh Duy',
        email: 'khanh.duy@example.com',
        role: 'sales_staff',
        team_id: '1',
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
    
    console.log('📝 Step 1: Open task form');
    
    const createButton = await page.locator('button:has-text("Tạo công việc")').first();
    await createButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Step 2: Analyze form structure');
    
    // Check all input elements
    const allInputs = await page.locator('input').all();
    console.log(`📊 Total input elements: ${allInputs.length}`);
    
    for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type').catch(() => '');
      const name = await input.getAttribute('name').catch(() => '');
      const placeholder = await input.getAttribute('placeholder').catch(() => '');
      const id = await input.getAttribute('id').catch(() => '');
      const className = await input.getAttribute('class').catch(() => '');
      
      console.log(`  ${i + 1}. Input: type="${type}" name="${name}" placeholder="${placeholder}" id="${id}"`);
      console.log(`      class="${className?.substring(0, 100)}..."`);
    }
    
    // Check all textarea elements
    const allTextareas = await page.locator('textarea').all();
    console.log(`📊 Total textarea elements: ${allTextareas.length}`);
    
    for (let i = 0; i < allTextareas.length; i++) {
      const textarea = allTextareas[i];
      const name = await textarea.getAttribute('name').catch(() => '');
      const placeholder = await textarea.getAttribute('placeholder').catch(() => '');
      const id = await textarea.getAttribute('id').catch(() => '');
      
      console.log(`  ${i + 1}. Textarea: name="${name}" placeholder="${placeholder}" id="${id}"`);
    }
    
    // Check all button elements
    const allButtons = await page.locator('button').all();
    console.log(`📊 Total button elements: ${allButtons.length}`);
    
    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      const button = allButtons[i];
      const text = await button.textContent().catch(() => '');
      const type = await button.getAttribute('type').catch(() => '');
      const disabled = await button.isDisabled().catch(() => false);
      
      console.log(`  ${i + 1}. Button: "${text?.trim()}" type="${type}" disabled=${disabled}`);
    }
    
    console.log('📝 Step 3: Try to fill form with correct selectors');
    
    // Try different selectors for title
    const titleSelectors = [
      'input[placeholder*="tiêu đề"]',
      'input[placeholder*="Nhập tiêu đề"]',
      'input[placeholder*="công việc"]',
      '.smart-input input',
      '[data-testid="title-input"]',
      'input:first-of-type'
    ];
    
    let titleInput = null;
    for (const selector of titleSelectors) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        console.log(`🔍 Trying selector "${selector}": visible=${isVisible}`);
        
        if (isVisible) {
          titleInput = element;
          console.log(`✅ Found title input with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector "${selector}" failed: ${error}`);
      }
    }
    
    if (titleInput) {
      await titleInput.fill('Debug Task Title');
      console.log('✅ Filled title');
    } else {
      console.log('❌ Could not find title input');
    }
    
    // Try different selectors for description
    const descSelectors = [
      'textarea[placeholder*="mô tả"]',
      'textarea[placeholder*="Nhập mô tả"]',
      'textarea:first-of-type',
      '[data-testid="description-textarea"]'
    ];
    
    let descInput = null;
    for (const selector of descSelectors) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        console.log(`🔍 Trying desc selector "${selector}": visible=${isVisible}`);
        
        if (isVisible) {
          descInput = element;
          console.log(`✅ Found description input with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Desc selector "${selector}" failed: ${error}`);
      }
    }
    
    if (descInput) {
      await descInput.fill('Debug task description');
      console.log('✅ Filled description');
    } else {
      console.log('❌ Could not find description input');
    }
    
    // Check save button
    const saveSelectors = [
      'button:has-text("Lưu")',
      'button:has-text("Tạo")',
      'button[type="submit"]',
      'button:has-text("Lưu Công Việc")'
    ];
    
    let saveButton = null;
    for (const selector of saveSelectors) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        const isEnabled = await element.isEnabled().catch(() => false);
        console.log(`🔍 Trying save selector "${selector}": visible=${isVisible}, enabled=${isEnabled}`);
        
        if (isVisible) {
          saveButton = element;
          console.log(`✅ Found save button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Save selector "${selector}" failed: ${error}`);
      }
    }
    
    if (saveButton) {
      const isEnabled = await saveButton.isEnabled();
      console.log(`💾 Save button enabled: ${isEnabled}`);
      
      if (!isEnabled) {
        console.log('❌ Save button is disabled - checking required fields');
        
        // Check for validation messages
        const validationElements = await page.locator('.text-red-500, .error, [role="alert"]').all();
        console.log(`⚠️ Validation elements: ${validationElements.length}`);
        
        for (let i = 0; i < validationElements.length; i++) {
          const text = await validationElements[i].textContent();
          console.log(`  ${i + 1}. Validation: "${text}"`);
        }
      }
    } else {
      console.log('❌ Could not find save button');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'simple-task-debug.png', fullPage: true });
    
    console.log('\n✅ Debug completed');
  });
});
