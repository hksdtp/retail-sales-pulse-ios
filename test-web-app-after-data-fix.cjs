const { chromium } = require('playwright');

async function testWebAppAfterDataFix() {
    console.log('🔍 Testing Web App After Data Fix...\n');
    
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
    
    try {
        console.log('🚀 Navigating to web app...');
        await page.goto('http://localhost:8088', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-after-data-fix-initial.png',
            fullPage: true 
        });
        console.log('📸 Initial screenshot: test-after-data-fix-initial.png');
        
        // Check if we're on login page
        const isLoginPage = await page.$('input[type="password"]') !== null;
        console.log(`🔐 Is login page: ${isLoginPage}`);
        
        if (isLoginPage) {
            console.log('\n🔐 Attempting login...');
            
            // Select location (Hồ Chí Minh)
            const locationSelect = await page.$('select');
            if (locationSelect) {
                await locationSelect.selectOption('Hồ Chí Minh');
                console.log('📍 Selected Hồ Chí Minh');
                await page.waitForTimeout(1000);
            }
            
            // Select user (first available)
            const userSelects = await page.$$('select');
            if (userSelects.length > 1) {
                const userSelect = userSelects[1];
                const options = await userSelect.$$('option');
                if (options.length > 1) {
                    await userSelect.selectOption({ index: 1 });
                    console.log('👤 Selected first available user');
                    await page.waitForTimeout(1000);
                }
            }
            
            // Enter password
            const passwordInput = await page.$('input[type="password"]');
            if (passwordInput) {
                await passwordInput.fill('123456');
                console.log('🔑 Entered password');
            }
            
            // Click login button
            const loginButton = await page.$('button[type="submit"]');
            if (loginButton) {
                await loginButton.click();
                console.log('🚀 Clicked login button');
                
                // Wait for navigation
                await page.waitForTimeout(5000);
            }
        }
        
        // Take screenshot after login
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-after-data-fix-after-login.png',
            fullPage: true 
        });
        console.log('📸 After login screenshot: test-after-data-fix-after-login.png');
        
        // Check for loading elements
        console.log('\n🔍 Checking for loading elements...');
        const loadingElements = await page.$$('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]');
        console.log(`Found ${loadingElements.length} loading elements`);
        
        if (loadingElements.length > 0) {
            console.log('⚠️  Still showing loading state, waiting longer...');
            await page.waitForTimeout(10000);
            
            // Check again
            const finalLoadingElements = await page.$$('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]');
            console.log(`Final loading elements: ${finalLoadingElements.length}`);
        }
        
        // Look for task-related content
        console.log('\n🔍 Looking for task content...');
        const taskElements = await page.$$('[data-testid*="task"], [class*="task"], .task-item, .task-list');
        console.log(`Found ${taskElements.length} task-related elements`);
        
        // Look for task titles or content
        const taskTitles = await page.$$eval('*', elements => {
            const taskKeywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin', 'Họp team', 'Phân tích đối thủ'];
            const foundTasks = [];
            
            elements.forEach(el => {
                const text = el.textContent || '';
                taskKeywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        foundTasks.push(keyword);
                    }
                });
            });
            
            return [...new Set(foundTasks)];
        });
        
        console.log(`📋 Found task content: ${taskTitles.length} tasks`);
        if (taskTitles.length > 0) {
            taskTitles.forEach((title, index) => {
                console.log(`   ${index + 1}. ${title}`);
            });
        }
        
        // Check for "Công việc của tôi" menu
        console.log('\n🔍 Looking for "Công việc của tôi" menu...');
        const menuItems = await page.$$eval('*', elements => {
            const menuTexts = [];
            elements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('Công việc') || text.includes('Tasks') || text.includes('công việc')) {
                    menuTexts.push(text.trim());
                }
            });
            return [...new Set(menuTexts)];
        });
        
        console.log(`📋 Menu items found: ${menuItems.length}`);
        menuItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item}`);
        });
        
        // Try to click on tasks menu if found
        const tasksMenuButton = await page.$('text="Công việc của tôi"');
        if (tasksMenuButton) {
            console.log('\n🖱️  Clicking on "Công việc của tôi" menu...');
            await tasksMenuButton.click();
            await page.waitForTimeout(3000);
            
            // Take screenshot after clicking tasks menu
            await page.screenshot({ 
                path: 'retail-sales-pulse-ios/test-after-data-fix-tasks-menu.png',
                fullPage: true 
            });
            console.log('📸 Tasks menu screenshot: test-after-data-fix-tasks-menu.png');
        }
        
        // Final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-after-data-fix-final.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot: test-after-data-fix-final.png');
        
        // Summary
        console.log('\n📊 SUMMARY:');
        console.log(`   Loading elements: ${loadingElements.length}`);
        console.log(`   Task elements: ${taskElements.length}`);
        console.log(`   Task content found: ${taskTitles.length}`);
        console.log(`   Menu items: ${menuItems.length}`);
        
        if (taskTitles.length > 0) {
            console.log('✅ SUCCESS: Tasks data is now visible in the web app!');
        } else {
            console.log('❌ ISSUE: Tasks data still not visible');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-after-data-fix-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testWebAppAfterDataFix().catch(console.error);
