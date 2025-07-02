const { chromium } = require('playwright');

async function testFinalFix() {
    console.log('🎯 Testing Final Fix - Admin Logic...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture important console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('admin') || text.includes('Khổng Đức Mạnh') || text.includes('password change') || text.includes('blockAppAccess') || text.includes('Loaded') && text.includes('tasks')) {
            console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
        }
    });
    
    try {
        console.log('🚀 Navigating to login page...');
        await page.goto('http://localhost:8088/login', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        console.log('🔧 Performing login as Khổng Đức Mạnh...');
        
        // Select location - keep "all" (default)
        console.log('📍 Keeping default location (all)');
        
        // Select Khổng Đức Mạnh directly
        const allSelects = await page.$$('select');
        if (allSelects.length >= 2) {
            const userSelect = allSelects[1];
            
            // Get available options
            const options = await userSelect.$$eval('option', opts => 
                opts.map(opt => ({ value: opt.value, text: opt.textContent }))
            );
            
            console.log('👥 Available users:');
            options.forEach((opt, index) => {
                if (opt.value) {
                    console.log(`   ${index}. ${opt.text} (${opt.value})`);
                }
            });
            
            // Find Khổng Đức Mạnh
            const manhOption = options.find(opt => opt.text.includes('Khổng Đức Mạnh'));
            if (manhOption) {
                await userSelect.selectOption(manhOption.value);
                console.log(`✅ Selected: ${manhOption.text}`);
                await page.waitForTimeout(1000);
            } else {
                console.log('❌ Khổng Đức Mạnh not found, selecting first available');
                const validOptions = options.filter(opt => opt.value && opt.value !== '');
                if (validOptions.length > 0) {
                    await userSelect.selectOption(validOptions[0].value);
                    console.log(`✅ Selected: ${validOptions[0].text}`);
                }
            }
        }
        
        console.log('🔑 Entering password...');
        const passwordInput = await page.$('input[type="password"]');
        await passwordInput.fill('123456');
        console.log('✅ Password entered');
        await page.waitForTimeout(1000);
        
        console.log('🚀 Submitting login form...');
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        console.log('✅ Login form submitted');
        
        console.log('⏳ Waiting for login response...');
        await page.waitForTimeout(5000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Still on login page');
            
            // Take screenshot for debugging
            await page.screenshot({ 
                path: 'retail-sales-pulse-ios/test-final-fix-login-failed.png',
                fullPage: true 
            });
            
        } else {
            console.log('✅ Login successful! Redirected to:', currentUrl);
            
            // Wait for main app to load
            console.log('⏳ Waiting for main app to load...');
            await page.waitForTimeout(5000);
            
            // Check for password change modal
            const passwordModal = await page.$('[data-testid*="password"], [class*="password-modal"], text="Đổi mật khẩu"');
            if (passwordModal) {
                console.log('❌ Password change modal is still showing');
                
                // Take screenshot
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-final-fix-password-modal.png',
                    fullPage: true 
                });
                
            } else {
                console.log('✅ No password change modal - admin bypass working!');
                
                // Look for main app content
                console.log('🔍 Looking for main app content...');
                
                // Check for navigation menu
                const menuItems = await page.$$eval('*', elements => {
                    const items = [];
                    elements.forEach(el => {
                        const text = el.textContent || '';
                        if (text.includes('Công việc') || text.includes('Dashboard') || text.includes('Khách hàng')) {
                            items.push(text.trim());
                        }
                    });
                    return [...new Set(items)].slice(0, 10);
                });
                
                console.log(`📋 Menu items found: ${menuItems.length}`);
                menuItems.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item}`);
                });
                
                // Try to click on "Công việc của tôi"
                const tasksMenu = await page.$('text="Công việc của tôi"');
                if (tasksMenu) {
                    console.log('🖱️  Clicking on "Công việc của tôi"...');
                    await tasksMenu.click();
                    await page.waitForTimeout(3000);
                    
                    // Check for loading state
                    const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], text="Đang khởi tạo"');
                    console.log(`⏳ Loading elements: ${loadingElements.length}`);
                    
                    if (loadingElements.length > 0) {
                        console.log('⚠️  Still loading, waiting longer...');
                        await page.waitForTimeout(10000);
                        
                        // Check again
                        const finalLoadingElements = await page.$$('[class*="loading"], [class*="spinner"], text="Đang khởi tạo"');
                        console.log(`⏳ Final loading elements: ${finalLoadingElements.length}`);
                        
                        if (finalLoadingElements.length > 0) {
                            console.log('❌ Still stuck in loading state');
                        } else {
                            console.log('✅ Loading completed!');
                        }
                    }
                    
                    // Look for task content
                    const taskContent = await page.$$eval('*', elements => {
                        const tasks = [];
                        const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin', 'Họp team', 'Phân tích đối thủ', 'Training', 'Kiểm tra kho', 'Chuẩn bị báo cáo'];
                        
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
                    
                    console.log(`📋 Task content found: ${taskContent.length} items`);
                    if (taskContent.length > 0) {
                        console.log('🎉 SUCCESS: Tasks are visible in the menu!');
                        taskContent.slice(0, 5).forEach((task, index) => {
                            console.log(`   ${index + 1}. ${task}`);
                        });
                    } else {
                        console.log('❌ No task content visible');
                        
                        // Check for any text content
                        const pageText = await page.evaluate(() => {
                            return document.body.textContent || '';
                        });
                        
                        if (pageText.includes('Đang khởi tạo')) {
                            console.log('⚠️  Page still shows "Đang khởi tạo" message');
                        } else {
                            console.log('ℹ️  Page loaded but no task content found');
                        }
                    }
                    
                    // Take final screenshot
                    await page.screenshot({ 
                        path: 'retail-sales-pulse-ios/test-final-fix-tasks-menu.png',
                        fullPage: true 
                    });
                    console.log('📸 Tasks menu screenshot saved');
                    
                } else {
                    console.log('❌ "Công việc của tôi" menu not found');
                    
                    // Look for alternative menu items
                    const altMenus = await page.$$('a, button, [role="button"]');
                    console.log(`🔍 Found ${altMenus.length} clickable elements`);
                    
                    // Try to find any tasks-related link
                    const tasksLink = await page.$('a[href*="tasks"], text="Tasks"');
                    if (tasksLink) {
                        console.log('🔄 Found alternative tasks link, clicking...');
                        await tasksLink.click();
                        await page.waitForTimeout(3000);
                    }
                }
                
                // Take final screenshot
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-final-fix-final.png',
                    fullPage: true 
                });
                console.log('📸 Final screenshot saved');
            }
        }
        
        // Summary
        console.log('\n📊 FINAL SUMMARY:');
        console.log(`   Current URL: ${page.url()}`);
        console.log(`   Login successful: ${!page.url().includes('/login')}`);
        
        const hasPasswordModal = await page.$('[data-testid*="password"], [class*="password-modal"]') !== null;
        console.log(`   Password modal showing: ${hasPasswordModal}`);
        
        if (!page.url().includes('/login') && !hasPasswordModal) {
            console.log('🎉 SUCCESS: Admin login working, no password change required!');
            console.log('🎯 NEXT: Check if tasks menu loads properly');
        } else {
            console.log('❌ ISSUE: Still have login or password change problems');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-final-fix-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testFinalFix().catch(console.error);
