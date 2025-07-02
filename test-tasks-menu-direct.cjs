const { chromium } = require('playwright');

async function testTasksMenuDirect() {
    console.log('🔍 Testing Tasks Menu Directly...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
        if (msg.text().includes('Loaded') && msg.text().includes('tasks')) {
            console.log(`📝 IMPORTANT: ${msg.text()}`);
        }
    });
    
    try {
        console.log('🚀 Navigating to web app...');
        await page.goto('http://localhost:8088', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for initial load
        await page.waitForTimeout(3000);
        
        // Check if we're on login page
        const isLoginPage = await page.$('input[type="password"]') !== null;
        console.log(`🔐 Is login page: ${isLoginPage}`);
        
        if (isLoginPage) {
            console.log('\n🔐 Performing login...');
            
            // Select Hồ Chí Minh
            const locationSelect = await page.$('select');
            if (locationSelect) {
                await locationSelect.selectOption('Hồ Chí Minh');
                console.log('📍 Selected Hồ Chí Minh');
                await page.waitForTimeout(1000);
            }
            
            // Select Nguyễn Thị Nga (team leader HCM)
            const userSelects = await page.$$('select');
            if (userSelects.length > 1) {
                const userSelect = userSelects[1];
                // Try to select by value or text
                try {
                    await userSelect.selectOption('Nguyễn Thị Nga');
                    console.log('👤 Selected Nguyễn Thị Nga');
                } catch (e) {
                    // Fallback to first option
                    const options = await userSelect.$$('option');
                    if (options.length > 1) {
                        await userSelect.selectOption({ index: 1 });
                        console.log('👤 Selected first available user');
                    }
                }
                await page.waitForTimeout(1000);
            }
            
            // Enter password
            const passwordInput = await page.$('input[type="password"]');
            if (passwordInput) {
                await passwordInput.fill('123456');
                console.log('🔑 Entered password');
                await page.waitForTimeout(500);
            }
            
            // Submit form using Enter key instead of clicking button
            console.log('🚀 Submitting login form...');
            await passwordInput.press('Enter');
            
            // Wait for navigation
            console.log('⏳ Waiting for login to complete...');
            await page.waitForTimeout(5000);
            
            // Check if login was successful
            const currentUrl = page.url();
            console.log(`🌐 Current URL after login: ${currentUrl}`);
            
            if (currentUrl.includes('/login')) {
                console.log('❌ Still on login page, login may have failed');
                
                // Try alternative login method
                console.log('🔄 Trying alternative login...');
                
                // Clear and re-enter password
                await passwordInput.clear();
                await passwordInput.fill('123456');
                
                // Try clicking the submit button directly
                const submitButton = await page.$('button[type="submit"], button:has-text("Đăng nhập")');
                if (submitButton) {
                    // Force click using JavaScript
                    await page.evaluate(button => button.click(), submitButton);
                    console.log('🖱️  Force clicked login button');
                    await page.waitForTimeout(5000);
                }
            }
        }
        
        // Take screenshot after login attempt
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-tasks-menu-after-login.png',
            fullPage: true 
        });
        console.log('📸 After login screenshot saved');
        
        // Check current state
        const finalUrl = page.url();
        console.log(`🌐 Final URL: ${finalUrl}`);
        
        if (!finalUrl.includes('/login')) {
            console.log('✅ Successfully logged in!');
            
            // Look for tasks menu or navigation
            console.log('\n🔍 Looking for tasks menu...');
            
            // Wait a bit more for data to load
            await page.waitForTimeout(3000);
            
            // Look for menu items
            const menuItems = await page.$$eval('*', elements => {
                const items = [];
                elements.forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('Công việc') || text.includes('Tasks') || text.includes('công việc')) {
                        items.push({
                            text: text.trim(),
                            tagName: el.tagName,
                            className: el.className
                        });
                    }
                });
                return items;
            });
            
            console.log(`📋 Found ${menuItems.length} menu items related to tasks:`);
            menuItems.forEach((item, index) => {
                console.log(`   ${index + 1}. "${item.text}" (${item.tagName})`);
            });
            
            // Try to click on tasks menu
            const tasksLink = await page.$('text="Công việc của tôi"');
            if (tasksLink) {
                console.log('\n🖱️  Clicking on "Công việc của tôi"...');
                await tasksLink.click();
                await page.waitForTimeout(3000);
                
                // Take screenshot after clicking tasks
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-tasks-menu-clicked.png',
                    fullPage: true 
                });
                console.log('📸 Tasks menu clicked screenshot saved');
                
                // Check for task content
                console.log('\n🔍 Checking for task content...');
                
                // Look for loading indicators
                const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], text="Đang khởi tạo"');
                console.log(`⏳ Loading elements found: ${loadingElements.length}`);
                
                if (loadingElements.length > 0) {
                    console.log('⚠️  Still loading, waiting longer...');
                    await page.waitForTimeout(10000);
                    
                    // Check again
                    const finalLoadingElements = await page.$$('[class*="loading"], [class*="spinner"], text="Đang khởi tạo"');
                    console.log(`⏳ Final loading elements: ${finalLoadingElements.length}`);
                }
                
                // Look for actual task content
                const taskContent = await page.$$eval('*', elements => {
                    const tasks = [];
                    const taskKeywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin', 'Họp team', 'Phân tích đối thủ', 'Training', 'Kiểm tra kho'];
                    
                    elements.forEach(el => {
                        const text = el.textContent || '';
                        taskKeywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                tasks.push({
                                    keyword: keyword,
                                    fullText: text.trim(),
                                    tagName: el.tagName
                                });
                            }
                        });
                    });
                    
                    return tasks;
                });
                
                console.log(`📋 Task content found: ${taskContent.length} items`);
                if (taskContent.length > 0) {
                    console.log('✅ SUCCESS: Tasks are now visible!');
                    taskContent.slice(0, 5).forEach((task, index) => {
                        console.log(`   ${index + 1}. ${task.keyword} (${task.tagName})`);
                    });
                } else {
                    console.log('❌ No task content visible yet');
                }
                
            } else {
                console.log('❌ Could not find "Công việc của tôi" menu item');
                
                // Try alternative selectors
                const altTasksLink = await page.$('a[href*="tasks"], a[href*="cong-viec"], text="Tasks"');
                if (altTasksLink) {
                    console.log('🔄 Found alternative tasks link, clicking...');
                    await altTasksLink.click();
                    await page.waitForTimeout(3000);
                }
            }
            
        } else {
            console.log('❌ Login failed, still on login page');
        }
        
        // Final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-tasks-menu-final.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot saved');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-tasks-menu-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testTasksMenuDirect().catch(console.error);
