import { test, expect } from '@playwright/test';

test.describe('Find Actual Task', () => {
  test('Find and analyze the actual task element', async ({ page }) => {
    console.log('🔍 Finding and analyzing actual task element...');
    
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
    await page.waitForTimeout(5000);
    
    console.log('📝 Step 1: Go to "Của tôi" tab');
    
    const myTasksTab = page.locator('button:has-text("Của tôi")');
    await myTasksTab.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Step 2: Find all possible task elements');
    
    // Try different selectors for task elements
    const taskSelectors = [
      'tr:has(td)',
      '[data-testid="task-item"]',
      '.task-item',
      '.task-card',
      '[class*="task"]',
      'tbody tr',
      'table tr:not(:first-child)',
      '[role="row"]'
    ];
    
    for (const selector of taskSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`\n🔍 Selector "${selector}": ${elements.length} elements`);
        
        if (elements.length > 0 && elements.length <= 5) {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = await element.textContent().catch(() => '');
            const innerHTML = await element.innerHTML().catch(() => '');
            
            console.log(`  ${i + 1}. Text: "${text?.substring(0, 200)}..."`);
            console.log(`      HTML: "${innerHTML?.substring(0, 300)}..."`);
            
            // Check if this element contains task data
            if (text?.includes('Complete') || text?.includes('Lê Khánh Duy') || text?.includes('todo')) {
              console.log(`      🎯 POTENTIAL TASK ELEMENT FOUND!`);
              
              // Get more details
              const tagName = await element.evaluate(el => el.tagName);
              const className = await element.getAttribute('class').catch(() => '');
              const id = await element.getAttribute('id').catch(() => '');
              
              console.log(`      Tag: ${tagName}, Class: "${className}", ID: "${id}"`);
              
              // Check child elements
              const children = await element.locator('*').all();
              console.log(`      Children: ${children.length}`);
              
              for (let j = 0; j < Math.min(children.length, 10); j++) {
                const child = children[j];
                const childText = await child.textContent().catch(() => '');
                const childTag = await child.evaluate(el => el.tagName).catch(() => '');
                
                if (childText && childText.trim()) {
                  console.log(`        ${j + 1}. ${childTag}: "${childText.substring(0, 100)}"`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`❌ Selector "${selector}" failed: ${error}`);
      }
    }
    
    console.log('📝 Step 3: Search for specific text patterns');
    
    const textPatterns = [
      'Complete Task',
      'Complete',
      'Lê Khánh Duy',
      'todo',
      'other',
      'user_khanh_duy'
    ];
    
    for (const pattern of textPatterns) {
      try {
        const elements = await page.locator(`:has-text("${pattern}")`).all();
        console.log(`\n🔍 Text pattern "${pattern}": ${elements.length} elements`);
        
        if (elements.length > 0 && elements.length <= 10) {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const text = await element.textContent().catch(() => '');
            const tagName = await element.evaluate(el => el.tagName).catch(() => '');
            
            if (text && text.length < 500) { // Only show reasonable length text
              console.log(`  ${i + 1}. ${tagName}: "${text}"`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Text pattern "${pattern}" failed: ${error}`);
      }
    }
    
    console.log('📝 Step 4: Check table structure');
    
    // Check if there's a table
    const tables = await page.locator('table').all();
    console.log(`\n📊 Tables found: ${tables.length}`);
    
    if (tables.length > 0) {
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        console.log(`\nTable ${i + 1}:`);
        
        // Check headers
        const headers = await table.locator('th').all();
        console.log(`  Headers: ${headers.length}`);
        
        for (let j = 0; j < headers.length; j++) {
          const headerText = await headers[j].textContent().catch(() => '');
          console.log(`    ${j + 1}. "${headerText}"`);
        }
        
        // Check rows
        const rows = await table.locator('tbody tr').all();
        console.log(`  Data rows: ${rows.length}`);
        
        for (let j = 0; j < Math.min(rows.length, 3); j++) {
          const row = rows[j];
          const cells = await row.locator('td').all();
          console.log(`    Row ${j + 1}: ${cells.length} cells`);
          
          for (let k = 0; k < Math.min(cells.length, 6); k++) {
            const cellText = await cells[k].textContent().catch(() => '');
            console.log(`      Cell ${k + 1}: "${cellText?.substring(0, 50)}"`);
          }
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'find-actual-task.png', fullPage: true });
    
    console.log('\n✅ Analysis completed');
  });
});
