const { chromium } = require('playwright');

async function debugTaskLoadingIssue() {
    console.log('🔍 Debugging Task Loading Issue...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const logEntry = {
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        };
        consoleLogs.push(logEntry);
        console.log(`📝 Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Capture network requests
    const networkRequests = [];
    page.on('request', request => {
        const requestInfo = {
            url: request.url(),
            method: request.method(),
            timestamp: new Date().toISOString()
        };
        networkRequests.push(requestInfo);
        console.log(`🌐 Request: ${request.method()} ${request.url()}`);
    });
    
    // Capture network responses
    page.on('response', response => {
        console.log(`📡 Response: ${response.status()} ${response.url()}`);
        if (response.status() >= 400) {
            console.log(`❌ Error Response: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('🚀 Navigating to web app...');
        await page.goto('http://localhost:8088', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForTimeout(3000);
        
        // Take screenshot of current state
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-task-loading-current.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved: debug-task-loading-current.png');
        
        // Check for loading elements
        console.log('\n🔍 Checking for loading elements...');
        const loadingElements = await page.$$('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]');
        console.log(`Found ${loadingElements.length} loading elements`);
        
        // Check for error messages
        console.log('\n🔍 Checking for error messages...');
        const errorElements = await page.$$('[data-testid*="error"], .error, [class*="error"]');
        console.log(`Found ${errorElements.length} error elements`);
        
        // Check page title and content
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        // Check if we're on login page or main app
        const isLoginPage = await page.$('input[type="password"]') !== null;
        console.log(`🔐 Is login page: ${isLoginPage}`);
        
        if (isLoginPage) {
            console.log('\n🔐 Detected login page, attempting login...');
            
            // Try to find location selector
            const locationSelect = await page.$('select, [role="combobox"]');
            if (locationSelect) {
                console.log('📍 Found location selector');
                await locationSelect.click();
                await page.waitForTimeout(1000);
                
                // Select Hồ Chí Minh
                const hcmOption = await page.$('option[value*="Hồ Chí Minh"], [data-value*="Hồ Chí Minh"]');
                if (hcmOption) {
                    await hcmOption.click();
                    console.log('✅ Selected Hồ Chí Minh');
                }
            }
            
            // Try to find user selector
            const userSelect = await page.$('select[data-testid*="user"], select:nth-of-type(2)');
            if (userSelect) {
                console.log('👤 Found user selector');
                await userSelect.click();
                await page.waitForTimeout(1000);
                
                // Select first available user
                const userOption = await page.$('option:not([value=""]):nth-of-type(1)');
                if (userOption) {
                    await userOption.click();
                    console.log('✅ Selected user');
                }
            }
            
            // Enter password
            const passwordInput = await page.$('input[type="password"]');
            if (passwordInput) {
                await passwordInput.fill('123456');
                console.log('🔑 Entered password');
            }
            
            // Click login button
            const loginButton = await page.$('button[type="submit"], button:has-text("Đăng nhập")');
            if (loginButton) {
                await loginButton.click();
                console.log('🚀 Clicked login button');
                
                // Wait for navigation or loading
                await page.waitForTimeout(5000);
            }
        }
        
        // Check current URL after potential login
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        // Take screenshot after login attempt
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-after-login-attempt.png',
            fullPage: true 
        });
        console.log('📸 Screenshot after login: debug-after-login-attempt.png');
        
        // Check for task-related elements
        console.log('\n🔍 Checking for task-related elements...');
        const taskElements = await page.$$('[data-testid*="task"], [class*="task"], .task-item, .task-list');
        console.log(`Found ${taskElements.length} task-related elements`);
        
        // Check for navigation menu
        const menuElements = await page.$$('nav, [role="navigation"], .menu, [class*="menu"]');
        console.log(`Found ${menuElements.length} menu elements`);
        
        // Wait a bit more to see if data loads
        console.log('\n⏳ Waiting for potential data loading...');
        await page.waitForTimeout(10000);
        
        // Final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-final-state.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot: debug-final-state.png');
        
        // Check final state
        const finalLoadingElements = await page.$$('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]');
        console.log(`\n📊 Final loading elements: ${finalLoadingElements.length}`);
        
        if (finalLoadingElements.length > 0) {
            console.log('⚠️  Still showing loading state after 10 seconds');
            
            // Get text content of loading elements
            for (let i = 0; i < finalLoadingElements.length; i++) {
                const text = await finalLoadingElements[i].textContent();
                console.log(`   Loading element ${i + 1}: "${text}"`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error during debugging:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-error-state.png',
            fullPage: true 
        });
    }
    
    // Summary report
    console.log('\n📋 DEBUGGING SUMMARY:');
    console.log(`Console logs: ${consoleLogs.length}`);
    console.log(`Network requests: ${networkRequests.length}`);
    
    // Show recent console errors
    const errors = consoleLogs.filter(log => log.type === 'error');
    if (errors.length > 0) {
        console.log('\n❌ Console Errors:');
        errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.text}`);
        });
    }
    
    // Show Supabase-related requests
    const supabaseRequests = networkRequests.filter(req => 
        req.url.includes('supabase') || req.url.includes('fnakxavwxubnbucfoujd')
    );
    if (supabaseRequests.length > 0) {
        console.log('\n🗄️  Supabase Requests:');
        supabaseRequests.forEach((req, index) => {
            console.log(`   ${index + 1}. ${req.method} ${req.url}`);
        });
    }
    
    await browser.close();
    console.log('\n✅ Debugging completed!');
}

// Run the debug
debugTaskLoadingIssue().catch(console.error);
