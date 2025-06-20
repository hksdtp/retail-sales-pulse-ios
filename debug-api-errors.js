#!/usr/bin/env node

/**
 * Debug script để test API errors với Playwright
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

import { chromium } from 'playwright';

async function debugApiErrors() {
  console.log('🧪 DEBUGGING API ERRORS WITH PLAYWRIGHT');
  console.log('========================================\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    
    if (type === 'error') {
      console.log('🚨 CONSOLE ERROR:', text);
    }
  });

  // Capture network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: new Date().toISOString()
    });
    
    if (request.url().includes('/api/')) {
      console.log('📤 API REQUEST:', request.method(), request.url());
    }
  });

  // Capture network responses
  const networkResponses = [];
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const headers = response.headers();
    
    let body = '';
    try {
      if (url.includes('/api/')) {
        body = await response.text();
        console.log('📥 API RESPONSE:', status, url);
        console.log('📄 Response Body Preview:', body.substring(0, 200) + '...');
        
        // Check if response is HTML instead of JSON
        if (body.includes('<!DOCTYPE html>') || body.includes('<html')) {
          console.log('🚨 ERROR: API returned HTML instead of JSON!');
          console.log('🔍 Full HTML Response:', body);
        }
      }
    } catch (e) {
      console.log('❌ Could not read response body:', e.message);
    }
    
    networkResponses.push({
      url,
      status,
      headers,
      body: body.substring(0, 500), // Limit body size
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('🌐 Navigating to http://localhost:8088...');
    await page.goto('http://localhost:8088', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('⏳ Waiting for page to load completely...');
    await page.waitForTimeout(5000);

    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'debug-api-errors-screenshot.png',
      fullPage: true 
    });

    // Try to trigger API calls by interacting with the page
    console.log('🔄 Trying to trigger API calls...');
    
    // Look for buttons or elements that might trigger API calls
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons`);
    
    // Click first few buttons to trigger API calls
    for (let i = 0; i < Math.min(3, buttons.length); i++) {
      try {
        await buttons[i].click();
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`⚠️ Could not click button ${i}:`, e.message);
      }
    }

    console.log('⏳ Waiting for any additional network activity...');
    await page.waitForTimeout(3000);

  } catch (error) {
    console.log('❌ Error during page interaction:', error.message);
  }

  // Summary report
  console.log('\n📊 SUMMARY REPORT');
  console.log('==================');
  
  console.log(`\n🔍 Console Messages (${consoleMessages.length}):`);
  consoleMessages.forEach((msg, i) => {
    console.log(`${i + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
  });

  console.log(`\n📤 Network Requests (${networkRequests.length}):`);
  networkRequests.forEach((req, i) => {
    if (req.url.includes('/api/')) {
      console.log(`${i + 1}. ${req.method} ${req.url}`);
    }
  });

  console.log(`\n📥 Network Responses (${networkResponses.length}):`);
  networkResponses.forEach((res, i) => {
    if (res.url.includes('/api/')) {
      console.log(`${i + 1}. ${res.status} ${res.url}`);
      if (res.body.includes('<!DOCTYPE html>')) {
        console.log('   🚨 WARNING: HTML response detected!');
      }
    }
  });

  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  console.log('1. Check if API server is running on correct port');
  console.log('2. Verify Vite proxy configuration');
  console.log('3. Check for CORS issues');
  console.log('4. Verify API endpoint paths');

  await browser.close();
}

// Run the debug script
debugApiErrors().catch(console.error);
