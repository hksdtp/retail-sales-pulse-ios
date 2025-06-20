#!/usr/bin/env node

// Playwright Web App Test Script
import { chromium } from 'playwright';

async function testWebApp() {
  let browser;
  let context;
  let page;

  try {
    console.log('🎭 PLAYWRIGHT WEB APP TEST');
    console.log('==========================');

    // Launch browser
    console.log('\n🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false, // Show browser for debugging
      slowMo: 1000 // Slow down for visibility
    });
    
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    page = await context.newPage();

    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (type === 'warning') {
        console.log(`⚠️  Console Warning: ${msg.text()}`);
      } else {
        console.log(`📝 Console ${type}: ${msg.text()}`);
      }
    });

    // Enable error tracking
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
    });

    // Enable request/response tracking
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Failed Request: ${response.status()} ${response.url()}`);
      }
    });

    // Test 1: Navigate to app
    console.log('\n📍 Test 1: Navigating to web app...');
    const urls = [
      'http://127.0.0.1:8088',
      'http://localhost:8088'
    ];

    let successUrl = null;
    for (const url of urls) {
      try {
        console.log(`   Trying: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        successUrl = url;
        console.log(`   ✅ Successfully loaded: ${url}`);
        break;
      } catch (error) {
        console.log(`   ❌ Failed to load: ${url} - ${error.message}`);
      }
    }

    if (!successUrl) {
      throw new Error('Could not load web app from any URL');
    }

    // Test 2: Check page title and basic elements
    console.log('\n📋 Test 2: Checking page content...');
    
    const title = await page.title();
    console.log(`   Page title: "${title}"`);
    
    // Wait for React to load
    await page.waitForTimeout(3000);
    
    // Check if it's login page or dashboard
    const isLoginPage = await page.locator('input[type="email"], input[type="password"]').count() > 0;
    const isDashboard = await page.locator('[data-testid="dashboard"], .dashboard, h1, h2').count() > 0;
    
    if (isLoginPage) {
      console.log('   ✅ Login page detected');
      
      // Test 3: Test login functionality
      console.log('\n🔐 Test 3: Testing login functionality...');
      
      // Fill login form
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first();
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        console.log('   📝 Filling login form...');
        await emailInput.fill('vietanh@example.com');
        await passwordInput.fill('haininh1');
        
        console.log('   🔑 Submitting login...');
        await loginButton.click();
        
        // Wait for navigation or error
        try {
          await page.waitForTimeout(3000);
          
          // Check if login was successful
          const currentUrl = page.url();
          const hasError = await page.locator('.error, [role="alert"], .alert-error').count() > 0;
          
          if (hasError) {
            const errorText = await page.locator('.error, [role="alert"], .alert-error').first().textContent();
            console.log(`   ❌ Login failed: ${errorText}`);
          } else if (currentUrl !== successUrl) {
            console.log(`   ✅ Login successful - redirected to: ${currentUrl}`);
          } else {
            console.log('   ⚠️  Login submitted but no redirect detected');
          }
        } catch (error) {
          console.log(`   ❌ Login test failed: ${error.message}`);
        }
      } else {
        console.log('   ⚠️  Login form elements not found');
      }
      
    } else if (isDashboard) {
      console.log('   ✅ Dashboard/main page detected');
    } else {
      console.log('   ⚠️  Unknown page type');
    }

    // Test 4: Check for JavaScript errors
    console.log('\n🔍 Test 4: Checking for JavaScript errors...');
    
    // Get all console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit more for any async errors
    await page.waitForTimeout(2000);
    
    if (errors.length === 0) {
      console.log('   ✅ No JavaScript errors detected');
    } else {
      console.log(`   ❌ Found ${errors.length} JavaScript errors:`);
      errors.forEach((error, index) => {
        console.log(`      ${index + 1}. ${error}`);
      });
    }

    // Test 5: Check network requests
    console.log('\n🌐 Test 5: Checking network requests...');
    
    const failedRequests = [];
    page.on('response', response => {
      if (!response.ok() && !response.url().includes('favicon')) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Trigger some network activity
    await page.reload({ waitUntil: 'networkidle' });
    
    if (failedRequests.length === 0) {
      console.log('   ✅ All network requests successful');
    } else {
      console.log(`   ❌ Found ${failedRequests.length} failed requests:`);
      failedRequests.forEach((req, index) => {
        console.log(`      ${index + 1}. ${req.status} ${req.url}`);
      });
    }

    // Test 6: Take screenshot
    console.log('\n📸 Test 6: Taking screenshot...');
    const screenshotPath = `screenshots/webapp-test-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    console.log(`   ✅ Screenshot saved: ${screenshotPath}`);

    console.log('\n🎉 PLAYWRIGHT TEST COMPLETED');
    console.log('============================');
    console.log(`✅ Web app is accessible at: ${successUrl}`);
    console.log(`📊 JavaScript errors: ${errors.length}`);
    console.log(`🌐 Failed requests: ${failedRequests.length}`);
    console.log(`📸 Screenshot: ${screenshotPath}`);

  } catch (error) {
    console.error('\n💥 PLAYWRIGHT TEST FAILED:');
    console.error('Error:', error.message);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   • Make sure web server is running: cd packages/web && npm run dev');
      console.log('   • Check if port 8088 is accessible: curl http://localhost:8088');
    }
    
    if (error.message.includes('Timeout')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   • Web app might be loading slowly');
      console.log('   • Check browser console for errors');
      console.log('   • Verify all services are running');
    }
  } finally {
    // Cleanup
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

// Run the test
testWebApp();
