const { chromium } = require('playwright');

async function testBypassAuth() {
    console.log('🔍 Testing with Auth Bypass...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture important console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Loaded') && text.includes('tasks')) {
            console.log(`📝 TASKS: ${text}`);
        }
        if (text.includes('SUCCESS') || text.includes('ERROR') || text.includes('FAIL')) {
            console.log(`📝 STATUS: ${text}`);
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
        
        console.log('\n🔧 Bypassing authentication using browser console...');
        
        // Inject authentication bypass
        await page.evaluate(() => {
            // Create a mock user
            const mockUser = {
                id: 'user-test',
                name: 'Nguyễn Thị Nga',
                role: 'team_leader',
                location: 'Hồ Chí Minh',
                team: 'NHÓM 1',
                isAuthenticated: true
            };
            
            // Store in localStorage
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            localStorage.setItem('authToken', 'mock-token-123');
            localStorage.setItem('isAuthenticated', 'true');
            
            console.log('🔧 Mock authentication data stored');
            
            // Try to trigger auth state update if possible
            if (window.manualLogin) {
                console.log('🔧 Calling manual login function');
                window.manualLogin();
            }
            
            if (window.forceRefresh) {
                console.log('🔧 Calling force refresh');
                window.forceRefresh();
            }
        });
        
        console.log('✅ Authentication bypass injected');
        
        // Refresh the page to apply auth changes
        console.log('🔄 Refreshing page to apply auth changes...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        // Take screenshot after auth bypass
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-bypass-auth-after-refresh.png',
            fullPage: true 
        });
        console.log('📸 After auth bypass screenshot saved');
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('⚠️  Still on login page, trying direct navigation...');
            
            // Try to navigate directly to main app
            await page.goto('http://localhost:8088/dashboard', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            }).catch(() => {
                console.log('❌ Dashboard route not found');
            });
            
            await page.goto('http://localhost:8088/tasks', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            }).catch(() => {
                console.log('❌ Tasks route not found');
            });
            
            await page.goto('http://localhost:8088/', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
        }
        
        // Wait for any data loading
        console.log('\n⏳ Waiting for data to load...');
        await page.waitForTimeout(5000);
        
        // Check for task-related content
        console.log('\n🔍 Checking for task content...');
        
        const taskContent = await page.$$eval('*', elements => {
            const results = [];
            const taskKeywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin', 'Họp team', 'Phân tích đối thủ', 'Training', 'Kiểm tra kho', 'Chuẩn bị báo cáo'];
            
            elements.forEach(el => {
                const text = el.textContent || '';
                taskKeywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        results.push({
                            keyword: keyword,
                            text: text.trim().substring(0, 100),
                            tagName: el.tagName,
                            className: el.className
                        });
                    }
                });
            });
            
            return results;
        });
        
        console.log(`📋 Task content found: ${taskContent.length} items`);
        if (taskContent.length > 0) {
            console.log('✅ SUCCESS: Task data is visible in the DOM!');
            taskContent.slice(0, 5).forEach((task, index) => {
                console.log(`   ${index + 1}. ${task.keyword}`);
            });
        } else {
            console.log('❌ No task content found in DOM');
        }
        
        // Check for loading states
        const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], text="Đang khởi tạo"');
        console.log(`⏳ Loading elements: ${loadingElements.length}`);
        
        if (loadingElements.length > 0) {
            console.log('⚠️  Still showing loading state');
            
            // Get loading text
            for (let i = 0; i < Math.min(loadingElements.length, 3); i++) {
                const text = await loadingElements[i].textContent();
                console.log(`   Loading ${i + 1}: "${text}"`);
            }
        }
        
        // Check for menu items
        const menuItems = await page.$$eval('*', elements => {
            const items = [];
            elements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('Công việc') || text.includes('Tasks') || text.includes('Menu')) {
                    items.push({
                        text: text.trim(),
                        tagName: el.tagName,
                        href: el.href || null
                    });
                }
            });
            return items.slice(0, 10); // Limit results
        });
        
        console.log(`\n📋 Menu items found: ${menuItems.length}`);
        menuItems.forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.text}" (${item.tagName})`);
        });
        
        // Try to force data refresh using browser console
        console.log('\n🔄 Trying to force data refresh...');
        await page.evaluate(() => {
            // Try various refresh methods
            if (window.forceRefresh) {
                window.forceRefresh();
                console.log('🔄 Called window.forceRefresh()');
            }
            
            if (window.location.reload) {
                console.log('🔄 Page reload available');
            }
            
            // Check if tasks are in window/global scope
            if (window.tasks) {
                console.log('📋 Found window.tasks:', window.tasks.length);
            }
            
            // Check localStorage for tasks
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                console.log('📋 Found stored tasks in localStorage');
            }
        });
        
        // Wait a bit more
        await page.waitForTimeout(3000);
        
        // Final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-bypass-auth-final.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot saved');
        
        // Final summary
        console.log('\n📊 FINAL SUMMARY:');
        console.log(`   Task content in DOM: ${taskContent.length} items`);
        console.log(`   Loading elements: ${loadingElements.length}`);
        console.log(`   Menu items: ${menuItems.length}`);
        
        if (taskContent.length > 0) {
            console.log('✅ CONCLUSION: Task data is successfully loaded and visible!');
            console.log('   The issue may be with the UI display or authentication flow.');
        } else {
            console.log('❌ CONCLUSION: Task data is not visible in the UI.');
            console.log('   Need to investigate data loading or component rendering.');
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-bypass-auth-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testBypassAuth().catch(console.error);
