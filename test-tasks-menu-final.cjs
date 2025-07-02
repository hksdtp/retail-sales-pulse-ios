const { chromium } = require('playwright');

async function testTasksMenuFinal() {
    console.log('🎯 Testing Tasks Menu Final...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture task-related console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('tasks') || text.includes('Tasks') || text.includes('Loaded') || text.includes('TaskManagement')) {
            console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
        }
    });
    
    try {
        console.log('🚀 Navigating to web app...');
        await page.goto('http://localhost:8088', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Check if we're on main app (not login)
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Still on login page, need to login first');
            return;
        }
        
        console.log('✅ On main app, looking for tasks menu...');
        
        // Take screenshot of current state
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-tasks-menu-main-app.png',
            fullPage: true 
        });
        console.log('📸 Main app screenshot saved');
        
        // Look for navigation menu items
        console.log('🔍 Looking for navigation menu...');
        
        // Try different selectors for tasks menu
        const taskMenuSelectors = [
            'text="Công việc của tôi"',
            'text="Công việc"',
            'text="Tasks"',
            'a[href*="tasks"]',
            'a[href="/tasks"]',
            '[data-testid*="tasks"]',
            'nav a:has-text("Công việc")',
            'button:has-text("Công việc")'
        ];
        
        let tasksMenuFound = false;
        let tasksMenuElement = null;
        
        for (const selector of taskMenuSelectors) {
            try {
                tasksMenuElement = await page.$(selector);
                if (tasksMenuElement) {
                    console.log(`✅ Found tasks menu with selector: ${selector}`);
                    tasksMenuFound = true;
                    break;
                }
            } catch (e) {
                // Selector might be invalid, continue
            }
        }
        
        if (!tasksMenuFound) {
            console.log('❌ Tasks menu not found with standard selectors');
            
            // Get all clickable elements and their text
            const clickableElements = await page.$$eval('a, button, [role="button"], [role="link"]', elements => {
                return elements.map(el => ({
                    text: el.textContent?.trim() || '',
                    href: el.href || '',
                    tagName: el.tagName,
                    className: el.className
                })).filter(el => el.text.length > 0);
            });
            
            console.log(`🔍 Found ${clickableElements.length} clickable elements:`);
            clickableElements.slice(0, 10).forEach((el, index) => {
                console.log(`   ${index + 1}. "${el.text}" (${el.tagName})`);
            });
            
            // Look for any element containing "công việc" or "task"
            const taskRelated = clickableElements.filter(el => 
                el.text.toLowerCase().includes('công việc') || 
                el.text.toLowerCase().includes('task') ||
                el.href.includes('tasks')
            );
            
            if (taskRelated.length > 0) {
                console.log(`📋 Found ${taskRelated.length} task-related elements:`);
                taskRelated.forEach((el, index) => {
                    console.log(`   ${index + 1}. "${el.text}" (${el.tagName})`);
                });
                
                // Try to click the first one
                const firstTaskElement = await page.$(`text="${taskRelated[0].text}"`);
                if (firstTaskElement) {
                    tasksMenuElement = firstTaskElement;
                    tasksMenuFound = true;
                    console.log(`✅ Will try clicking: "${taskRelated[0].text}"`);
                }
            }
        }
        
        if (tasksMenuFound && tasksMenuElement) {
            console.log('🖱️  Clicking on tasks menu...');
            await tasksMenuElement.click();
            console.log('✅ Tasks menu clicked');
            
            // Wait for navigation/content to load
            await page.waitForTimeout(3000);
            
            // Check new URL
            const newUrl = page.url();
            console.log(`🌐 New URL after click: ${newUrl}`);
            
            // Take screenshot after clicking
            await page.screenshot({ 
                path: 'retail-sales-pulse-ios/test-tasks-menu-after-click.png',
                fullPage: true 
            });
            console.log('📸 After click screenshot saved');
            
            // Check for loading state
            console.log('🔍 Checking for loading state...');
            const loadingElements = await page.$$('[class*="loading"], [class*="spinner"]');
            console.log(`⏳ Loading elements found: ${loadingElements.length}`);
            
            // Check for "Đang khởi tạo" text
            const initializingText = await page.$('text="Đang khởi tạo dữ liệu người dùng"');
            if (initializingText) {
                console.log('⚠️  Found "Đang khởi tạo dữ liệu người dùng" message');
                console.log('⏳ Waiting for initialization to complete...');
                
                // Wait longer for data to load
                await page.waitForTimeout(10000);
                
                // Check again
                const stillInitializing = await page.$('text="Đang khởi tạo dữ liệu người dùng"');
                if (stillInitializing) {
                    console.log('❌ Still showing initialization message after 10 seconds');
                } else {
                    console.log('✅ Initialization completed!');
                }
            } else {
                console.log('✅ No initialization message found');
            }
            
            // Look for actual task content
            console.log('🔍 Looking for task content...');
            
            const taskContent = await page.$$eval('*', elements => {
                const tasks = [];
                const keywords = [
                    'Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin', 
                    'Họp team', 'Phân tích đối thủ', 'Training', 'Kiểm tra kho', 
                    'Chuẩn bị báo cáo'
                ];
                
                elements.forEach(el => {
                    const text = el.textContent || '';
                    keywords.forEach(keyword => {
                        if (text.includes(keyword)) {
                            tasks.push({
                                keyword: keyword,
                                fullText: text.trim().substring(0, 100),
                                tagName: el.tagName,
                                className: el.className
                            });
                        }
                    });
                });
                
                return tasks;
            });
            
            console.log(`📋 Task content found: ${taskContent.length} items`);
            
            if (taskContent.length > 0) {
                console.log('🎉 SUCCESS: Task content is visible!');
                taskContent.slice(0, 5).forEach((task, index) => {
                    console.log(`   ${index + 1}. ${task.keyword} (${task.tagName})`);
                });
                
                // Check for task list structure
                const taskListElements = await page.$$('[class*="task"], [data-testid*="task"], .task-item, .task-list');
                console.log(`📋 Task list elements: ${taskListElements.length}`);
                
                // Check for task cards or rows
                const taskCards = await page.$$('[class*="card"], [class*="row"], [class*="item"]');
                console.log(`📋 Potential task cards: ${taskCards.length}`);
                
            } else {
                console.log('❌ No task content visible');
                
                // Check what content is actually showing
                const pageContent = await page.evaluate(() => {
                    const body = document.body;
                    const text = body.textContent || '';
                    
                    // Look for key phrases
                    const phrases = [
                        'Đang khởi tạo', 'Loading', 'Không có dữ liệu', 
                        'Empty', 'Error', 'Lỗi', 'Task', 'Công việc'
                    ];
                    
                    const found = [];
                    phrases.forEach(phrase => {
                        if (text.includes(phrase)) {
                            found.push(phrase);
                        }
                    });
                    
                    return {
                        foundPhrases: found,
                        textLength: text.length,
                        firstChars: text.substring(0, 200)
                    };
                });
                
                console.log('📋 Page content analysis:');
                console.log(`   Found phrases: ${pageContent.foundPhrases.join(', ')}`);
                console.log(`   Text length: ${pageContent.textLength}`);
                console.log(`   First 200 chars: "${pageContent.firstChars}"`);
            }
            
            // Take final screenshot
            await page.screenshot({ 
                path: 'retail-sales-pulse-ios/test-tasks-menu-final.png',
                fullPage: true 
            });
            console.log('📸 Final screenshot saved');
            
        } else {
            console.log('❌ Could not find tasks menu');
            
            // Try direct navigation to tasks page
            console.log('🔄 Trying direct navigation to /tasks...');
            await page.goto('http://localhost:8088/tasks', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            await page.waitForTimeout(3000);
            
            // Check if tasks page loaded
            const tasksUrl = page.url();
            console.log(`🌐 Tasks page URL: ${tasksUrl}`);
            
            if (tasksUrl.includes('/tasks')) {
                console.log('✅ Successfully navigated to tasks page');
                
                // Wait for content to load
                await page.waitForTimeout(5000);
                
                // Check for task content again
                const directTaskContent = await page.$$eval('*', elements => {
                    const tasks = [];
                    const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
                    
                    elements.forEach(el => {
                        const text = el.textContent || '';
                        keywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                tasks.push(keyword);
                            }
                        });
                    });
                    
                    return [...new Set(tasks)];
                });
                
                console.log(`📋 Direct tasks page content: ${directTaskContent.length} items`);
                if (directTaskContent.length > 0) {
                    console.log('🎉 SUCCESS: Tasks visible on direct navigation!');
                    directTaskContent.forEach((task, index) => {
                        console.log(`   ${index + 1}. ${task}`);
                    });
                } else {
                    console.log('❌ No task content on direct navigation either');
                }
                
                // Take screenshot of direct navigation
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-tasks-direct-navigation.png',
                    fullPage: true 
                });
                
            } else {
                console.log('❌ Could not navigate to tasks page');
            }
        }
        
        // Final summary
        console.log('\n📊 FINAL SUMMARY:');
        console.log(`   Tasks menu found: ${tasksMenuFound}`);
        console.log(`   Current URL: ${page.url()}`);
        
        const finalTaskContent = await page.$$eval('*', elements => {
            const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
            let found = 0;
            
            elements.forEach(el => {
                const text = el.textContent || '';
                keywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        found++;
                    }
                });
            });
            
            return found > 0;
        });
        
        console.log(`   Task content visible: ${finalTaskContent}`);
        
        if (finalTaskContent) {
            console.log('🎉 FINAL SUCCESS: Menu "Công việc của tôi" is working and showing tasks!');
        } else {
            console.log('❌ FINAL ISSUE: Tasks menu not showing content properly');
        }
        
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
testTasksMenuFinal().catch(console.error);
