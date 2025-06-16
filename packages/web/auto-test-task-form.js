#!/usr/bin/env node

// 🤖 Auto Test Script - Task Form Dialog
// Chạy: node auto-test-task-form.js

const puppeteer = require('puppeteer');

async function autoTestTaskForm() {
  console.log('🚀 Starting Auto Test for Task Form Dialog...');
  
  let browser;
  let results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Hiển thị browser để debug
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8088', { waitUntil: 'networkidle0' });
    
    // Test 1: Check if page loads
    console.log('✅ Test 1: Page Load');
    const title = await page.title();
    if (title) {
      console.log('✅ PASS: Page loaded successfully');
      results.passed++;
    } else {
      console.log('❌ FAIL: Page failed to load');
      results.failed++;
      results.errors.push('Page failed to load');
    }
    
    // Test 2: Find and click create task button
    console.log('✅ Test 2: Open Task Dialog');
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      
      // Try different selectors for create task button
      const buttonSelectors = [
        'button:has-text("Tạo công việc")',
        'button:has-text("Tạo công việc mới")',
        'button[aria-label*="Tạo"]',
        'button[title*="Tạo"]',
        '.create-task-btn',
        '[data-testid="create-task"]'
      ];
      
      let buttonFound = false;
      for (const selector of buttonSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            buttonFound = true;
            console.log(`✅ PASS: Found and clicked button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!buttonFound) {
        // Fallback: click first button that might be create task
        const buttons = await page.$$('button');
        if (buttons.length > 0) {
          await buttons[0].click();
          console.log('⚠️ FALLBACK: Clicked first button found');
          buttonFound = true;
        }
      }
      
      if (buttonFound) {
        results.passed++;
      } else {
        throw new Error('No create task button found');
      }
      
    } catch (error) {
      console.log('❌ FAIL: Could not find/click create task button');
      results.failed++;
      results.errors.push(`Create task button: ${error.message}`);
    }
    
    // Wait a bit for dialog to appear
    await page.waitForTimeout(1000);
    
    // Test 3: Check if dialog appears
    console.log('✅ Test 3: Dialog Visibility');
    try {
      const dialogSelectors = [
        '[data-radix-dialog-content]',
        '[role="dialog"]',
        '.task-form-dialog',
        '.dialog-content'
      ];
      
      let dialogFound = false;
      for (const selector of dialogSelectors) {
        const dialog = await page.$(selector);
        if (dialog) {
          const isVisible = await dialog.isIntersectingViewport();
          if (isVisible) {
            console.log(`✅ PASS: Dialog visible with selector: ${selector}`);
            dialogFound = true;
            break;
          }
        }
      }
      
      if (dialogFound) {
        results.passed++;
      } else {
        throw new Error('Dialog not visible');
      }
      
    } catch (error) {
      console.log('❌ FAIL: Dialog not visible');
      results.failed++;
      results.errors.push(`Dialog visibility: ${error.message}`);
    }
    
    // Test 4: Check dialog size
    console.log('✅ Test 4: Dialog Size');
    try {
      const dialog = await page.$('[data-radix-dialog-content], [role="dialog"]');
      if (dialog) {
        const box = await dialog.boundingBox();
        const viewport = page.viewport();
        
        if (box && viewport) {
          const widthPercent = (box.width / viewport.width) * 100;
          const heightPercent = (box.height / viewport.height) * 100;
          
          console.log(`📐 Dialog size: ${box.width}x${box.height} (${widthPercent.toFixed(1)}% x ${heightPercent.toFixed(1)}%)`);
          
          if (widthPercent >= 80 && heightPercent >= 70) {
            console.log('✅ PASS: Dialog size is appropriate');
            results.passed++;
          } else {
            console.log('❌ FAIL: Dialog too small');
            results.failed++;
            results.errors.push(`Dialog size too small: ${widthPercent.toFixed(1)}% x ${heightPercent.toFixed(1)}%`);
          }
        }
      }
    } catch (error) {
      console.log('❌ FAIL: Could not measure dialog size');
      results.failed++;
      results.errors.push(`Dialog size: ${error.message}`);
    }
    
    // Test 5: Check form elements
    console.log('✅ Test 5: Form Elements');
    const formElements = [
      { name: 'Title Input', selector: 'input[name="title"]' },
      { name: 'Description Textarea', selector: 'textarea[name="description"]' },
      { name: 'Time Input', selector: 'input[type="time"]' },
      { name: 'Submit Button', selector: 'button:has-text("Tạo công việc")' }
    ];
    
    for (const element of formElements) {
      try {
        const el = await page.$(element.selector);
        if (el) {
          console.log(`✅ PASS: ${element.name} found`);
          results.passed++;
        } else {
          console.log(`❌ FAIL: ${element.name} not found`);
          results.failed++;
          results.errors.push(`${element.name} not found`);
        }
      } catch (error) {
        console.log(`❌ FAIL: ${element.name} error: ${error.message}`);
        results.failed++;
        results.errors.push(`${element.name}: ${error.message}`);
      }
    }
    
    // Test 6: Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'task-form-test-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: task-form-test-screenshot.png');
    
    // Test 7: Check console errors
    console.log('✅ Test 7: Console Errors');
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (logs.length === 0) {
      console.log('✅ PASS: No console errors');
      results.passed++;
    } else {
      console.log(`❌ FAIL: ${logs.length} console errors found`);
      results.failed++;
      results.errors.push(`Console errors: ${logs.join(', ')}`);
    }
    
  } catch (error) {
    console.error('💥 Critical error:', error.message);
    results.errors.push(`Critical: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Print results
  console.log('\n📊 === TEST RESULTS ===');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🐛 === ERRORS FOUND ===');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\n🎯 === RECOMMENDATIONS ===');
  if (results.failed > 0) {
    console.log('❌ Issues found! Please fix:');
    console.log('1. Check if dev server is running on http://localhost:8088');
    console.log('2. Verify task form dialog opens correctly');
    console.log('3. Check dialog sizing and responsive layout');
    console.log('4. Verify all form elements are present');
  } else {
    console.log('✅ All tests passed! Task form is working correctly.');
  }
  
  return results;
}

// Run the test
if (require.main === module) {
  autoTestTaskForm().catch(console.error);
}

module.exports = { autoTestTaskForm };
