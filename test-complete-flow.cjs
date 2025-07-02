const { chromium } = require('playwright');

async function testCompleteFlow() {
    console.log('🎯 Testing Complete Flow: Login → Tasks Menu...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture important console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Loaded') && text.includes('tasks') || 
            text.includes('admin') || 
            text.includes('blockAppAccess') ||
            text.includes('TaskManagement')) {
            console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
        }
    });
    
    try {
        console.log('🚀 Step 1: Navigate to login page...');
        await page.goto('http://localhost:8088/login', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.waitForTimeout(3000);
        console.log('✅ Login page loaded');
        
        console.log('🔧 Step 2: Perform login...');
        
        // Keep default location (all)
        console.log('📍 Using default location (all)');
        
        // Select Khổng Đức Mạnh
        const allSelects = await page.$$('select');
        if (allSelects.length >= 2) {
            const userSelect = allSelects[1];
            const options = await userSelect.$$eval('option', opts => 
                opts.map(opt => ({ value: opt.value, text: opt.textContent }))
            );
            
            // Find Khổng Đức Mạnh or use first available
            const manhOption = options.find(opt => opt.text.includes('Khổng Đức Mạnh'));
            if (manhOption) {
                await userSelect.selectOption(manhOption.value);
                console.log(`✅ Selected: ${manhOption.text}`);
            } else {
                const validOptions = options.filter(opt => opt.value && opt.value !== '');
                if (validOptions.length > 0) {
                    await userSelect.selectOption(validOptions[0].value);
                    console.log(`✅ Selected: ${validOptions[0].text}`);
                }
            }
            await page.waitForTimeout(1000);
        }
        
        // Enter password
        const passwordInput = await page.$('input[type="password"]');
        await passwordInput.fill('123456');
        console.log('✅ Password entered');
        await page.waitForTimeout(500);
        
        // Submit form
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        console.log('✅ Login form submitted');
        
        console.log('⏳ Step 3: Wait for login response...');
        await page.waitForTimeout(5000);
        
        // Check login result
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Login failed, still on login page');
            return;
        }
        
        console.log('✅ Login successful!');
        
        console.log('⏳ Step 4: Wait for main app to load...');
        await page.waitForTimeout(3000);
        
        // Take screenshot of main app
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-complete-flow-main-app.png',
            fullPage: true 
        });
        console.log('📸 Main app screenshot saved');
        
        console.log('🔍 Step 5: Look for tasks menu...');
        
        // Try to find tasks menu
        const tasksMenu = await page.$('text="Công việc của tôi"');
        if (tasksMenu) {
            console.log('✅ Found "Công việc của tôi" menu');
            
            console.log('🖱️  Step 6: Click on tasks menu...');
            await tasksMenu.click();
            console.log('✅ Tasks menu clicked');
            
            console.log('⏳ Step 7: Wait for tasks page to load...');
            await page.waitForTimeout(5000);
            
            // Check new URL
            const tasksUrl = page.url();
            console.log(`🌐 Tasks URL: ${tasksUrl}`);
            
            // Take screenshot after clicking tasks
            await page.screenshot({ 
                path: 'retail-sales-pulse-ios/test-complete-flow-tasks-page.png',
                fullPage: true 
            });
            console.log('📸 Tasks page screenshot saved');
            
            console.log('🔍 Step 8: Check for loading state...');
            
            // Check for "Đang khởi tạo" message
            const initializingMessage = await page.$('text="Đang khởi tạo dữ liệu người dùng"');
            if (initializingMessage) {
                console.log('⚠️  Found "Đang khởi tạo dữ liệu người dùng" message');
                console.log('⏳ Waiting for data to load...');
                
                // Wait up to 15 seconds for loading to complete
                let attempts = 0;
                const maxAttempts = 15;
                
                while (attempts < maxAttempts) {
                    await page.waitForTimeout(1000);
                    attempts++;
                    
                    const stillLoading = await page.$('text="Đang khởi tạo dữ liệu người dùng"');
                    if (!stillLoading) {
                        console.log(`✅ Loading completed after ${attempts} seconds`);
                        break;
                    }
                    
                    if (attempts === maxAttempts) {
                        console.log('❌ Still loading after 15 seconds');
                    }
                }
            } else {
                console.log('✅ No loading message found');
            }
            
            console.log('🔍 Step 9: Check for task content...');
            
            // Look for actual task content
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
                
                // Take final success screenshot
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-complete-flow-success.png',
                    fullPage: true 
                });
                console.log('📸 Success screenshot saved');
                
            } else {
                console.log('❌ No task content visible');
                
                // Debug what's actually showing
                const pageContent = await page.evaluate(() => {
                    const text = document.body.textContent || '';
                    return {
                        hasLoadingText: text.includes('Đang khởi tạo'),
                        hasErrorText: text.includes('lỗi') || text.includes('Error'),
                        hasEmptyText: text.includes('Không có') || text.includes('Empty'),
                        textLength: text.length,
                        firstChars: text.substring(0, 300)
                    };
                });
                
                console.log('📋 Page content debug:');
                console.log(`   Has loading text: ${pageContent.hasLoadingText}`);
                console.log(`   Has error text: ${pageContent.hasErrorText}`);
                console.log(`   Has empty text: ${pageContent.hasEmptyText}`);
                console.log(`   Text length: ${pageContent.textLength}`);
                console.log(`   First 300 chars: "${pageContent.firstChars}"`);
                
                // Take debug screenshot
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-complete-flow-debug.png',
                    fullPage: true 
                });
                console.log('📸 Debug screenshot saved');
            }
            
        } else {
            console.log('❌ "Công việc của tôi" menu not found');
            
            // Try direct navigation to tasks
            console.log('🔄 Trying direct navigation to /tasks...');
            await page.goto('http://localhost:8088/tasks', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            await page.waitForTimeout(5000);
            
            const directTasksUrl = page.url();
            console.log(`🌐 Direct tasks URL: ${directTasksUrl}`);
            
            if (directTasksUrl.includes('/tasks')) {
                console.log('✅ Direct navigation to tasks successful');
                
                // Check for task content on direct navigation
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
                
                console.log(`📋 Direct navigation task content: ${directTaskContent.length} items`);
                if (directTaskContent.length > 0) {
                    console.log('🎉 SUCCESS: Tasks visible on direct navigation!');
                    directTaskContent.forEach((task, index) => {
                        console.log(`   ${index + 1}. ${task}`);
                    });
                }
                
                // Take screenshot of direct navigation
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-complete-flow-direct-tasks.png',
                    fullPage: true 
                });
                
            } else {
                console.log('❌ Direct navigation to tasks failed');
            }
        }
        
        // Final summary
        console.log('\n📊 FINAL SUMMARY:');
        console.log(`   Login successful: ${!page.url().includes('/login')}`);
        console.log(`   Current URL: ${page.url()}`);
        
        const finalTaskCheck = await page.$$eval('*', elements => {
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
        
        console.log(`   Task content visible: ${finalTaskCheck}`);
        
        if (finalTaskCheck) {
            console.log('🎉 FINAL RESULT: SUCCESS! Menu "Công việc của tôi" is working!');
            console.log('✅ Tasks are loading and displaying properly');
        } else {
            console.log('❌ FINAL RESULT: ISSUE! Tasks menu not showing content');
            console.log('⚠️  Need further investigation of UI rendering');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-complete-flow-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Complete flow testing finished!');
}

// Run the test
testCompleteFlow().catch(console.error);
