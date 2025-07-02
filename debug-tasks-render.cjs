const { chromium } = require('playwright');

async function debugTasksRender() {
    console.log('🔍 Debugging Tasks Render Issue...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture task-related console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('TaskManagementView') || 
            text.includes('effective user') || 
            text.includes('Component ready') ||
            text.includes('Personal view filtering') ||
            text.includes('personalTasks') ||
            text.includes('allRegularTasks')) {
            console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
        }
    });
    
    try {
        console.log('🚀 Step 1: Login and navigate to tasks...');
        await page.goto('http://localhost:8088/login', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.waitForTimeout(2000);
        
        // Quick login
        const allSelects = await page.$$('select');
        if (allSelects.length >= 2) {
            const userSelect = allSelects[1];
            const options = await userSelect.$$eval('option', opts => 
                opts.map(opt => ({ value: opt.value, text: opt.textContent }))
            );
            
            const manhOption = options.find(opt => opt.text.includes('Khổng Đức Mạnh'));
            if (manhOption) {
                await userSelect.selectOption(manhOption.value);
                console.log(`✅ Selected: ${manhOption.text}`);
            }
        }
        
        const passwordInput = await page.$('input[type="password"]');
        await passwordInput.fill('123456');
        
        const submitButton = await page.$('button[type="submit"]');
        await submitButton.click();
        
        console.log('⏳ Waiting for login...');
        await page.waitForTimeout(3000);
        
        // Navigate to tasks
        console.log('🔄 Navigating to tasks page...');
        await page.goto('http://localhost:8088/tasks', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        });
        
        await page.waitForTimeout(5000);
        
        console.log('🔍 Step 2: Debug React component state...');
        
        // Debug React component state and data flow
        const debugInfo = await page.evaluate(() => {
            // Check if TaskManagementView is rendered
            const taskManagementElements = document.querySelectorAll('[data-testid*="task"], [class*="task"], [class*="TaskManagement"]');
            
            // Check for loading states
            const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
            const initializingText = document.body.textContent?.includes('Đang khởi tạo');
            
            // Check for task content
            const taskKeywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
            const hasTaskContent = taskKeywords.some(keyword => 
                document.body.textContent?.includes(keyword)
            );
            
            // Check for empty states
            const emptyStateKeywords = ['Chưa có công việc', 'Không có dữ liệu', 'Empty'];
            const hasEmptyState = emptyStateKeywords.some(keyword => 
                document.body.textContent?.includes(keyword)
            );
            
            // Get all text content for analysis
            const bodyText = document.body.textContent || '';
            
            // Check for specific UI elements
            const hasTaskList = !!document.querySelector('[data-testid*="task-list"], [class*="task-list"], ul, ol');
            const hasTaskCards = document.querySelectorAll('[class*="card"], [class*="item"]').length;
            
            // Check for React components
            const reactElements = document.querySelectorAll('[data-reactroot], [data-react-component]');
            
            return {
                taskManagementElements: taskManagementElements.length,
                loadingElements: loadingElements.length,
                initializingText,
                hasTaskContent,
                hasEmptyState,
                hasTaskList,
                hasTaskCards,
                reactElements: reactElements.length,
                bodyTextLength: bodyText.length,
                firstChars: bodyText.substring(0, 500),
                lastChars: bodyText.substring(Math.max(0, bodyText.length - 200)),
                containsTaskKeywords: taskKeywords.map(keyword => ({
                    keyword,
                    found: bodyText.includes(keyword)
                }))
            };
        });
        
        console.log('\n📊 COMPONENT DEBUG INFO:');
        console.log(`🔧 Task management elements: ${debugInfo.taskManagementElements}`);
        console.log(`⏳ Loading elements: ${debugInfo.loadingElements}`);
        console.log(`🔄 Initializing text: ${debugInfo.initializingText}`);
        console.log(`📋 Has task content: ${debugInfo.hasTaskContent}`);
        console.log(`📭 Has empty state: ${debugInfo.hasEmptyState}`);
        console.log(`📝 Has task list: ${debugInfo.hasTaskList}`);
        console.log(`🎴 Task cards: ${debugInfo.hasTaskCards}`);
        console.log(`⚛️ React elements: ${debugInfo.reactElements}`);
        console.log(`📄 Body text length: ${debugInfo.bodyTextLength}`);
        
        console.log('\n🔍 TASK KEYWORDS CHECK:');
        debugInfo.containsTaskKeywords.forEach(item => {
            console.log(`   ${item.found ? '✅' : '❌'} ${item.keyword}`);
        });
        
        console.log('\n📄 FIRST 500 CHARS:');
        console.log(`"${debugInfo.firstChars}"`);
        
        console.log('\n📄 LAST 200 CHARS:');
        console.log(`"${debugInfo.lastChars}"`);
        
        // Try to force component refresh
        console.log('\n🔄 Step 3: Attempting to force component refresh...');
        
        const refreshResult = await page.evaluate(() => {
            const results = [];
            
            // Try to trigger React re-render
            if (window.React) {
                results.push('React available');
            }
            
            // Check if we can access task data
            if (window.tasks) {
                results.push(`Window tasks: ${window.tasks.length} items`);
            }
            
            // Try to call any refresh functions
            if (window.forceRefresh) {
                try {
                    window.forceRefresh();
                    results.push('Called window.forceRefresh()');
                } catch (e) {
                    results.push(`forceRefresh error: ${e.message}`);
                }
            }
            
            // Check auth state
            if (window.currentUser) {
                results.push(`Current user: ${window.currentUser.name || 'unnamed'}`);
            } else {
                results.push('No current user in window');
            }
            
            return results;
        });
        
        console.log('\n🔄 REFRESH RESULTS:');
        refreshResult.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result}`);
        });
        
        // Wait for potential refresh
        await page.waitForTimeout(3000);
        
        // Check again after refresh
        const afterRefreshInfo = await page.evaluate(() => {
            const bodyText = document.body.textContent || '';
            const taskKeywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
            
            return {
                hasTaskContent: taskKeywords.some(keyword => bodyText.includes(keyword)),
                initializingText: bodyText.includes('Đang khởi tạo'),
                loadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"]').length,
                taskElements: document.querySelectorAll('[data-testid*="task"], [class*="task"]').length,
                firstChars: bodyText.substring(0, 300)
            };
        });
        
        console.log('\n📊 AFTER REFRESH:');
        console.log(`📋 Task content: ${afterRefreshInfo.hasTaskContent}`);
        console.log(`🔄 Initializing: ${afterRefreshInfo.initializingText}`);
        console.log(`⏳ Loading elements: ${afterRefreshInfo.loadingElements}`);
        console.log(`🔧 Task elements: ${afterRefreshInfo.taskElements}`);
        console.log(`📄 First 300 chars: "${afterRefreshInfo.firstChars}"`);
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-tasks-render-final.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot saved');
        
        // Final diagnosis
        console.log('\n🎯 FINAL DIAGNOSIS:');
        
        if (afterRefreshInfo.hasTaskContent) {
            console.log('✅ SUCCESS: Task content is now visible!');
            console.log('🎉 Menu "Công việc của tôi" is working properly!');
        } else if (afterRefreshInfo.initializingText) {
            console.log('❌ ISSUE: Still stuck in "Đang khởi tạo" state');
            console.log('💡 SOLUTION: TaskManagementView component needs further fixes');
        } else if (afterRefreshInfo.loadingElements > 0) {
            console.log('❌ ISSUE: Still showing loading elements');
            console.log('💡 SOLUTION: Component loading logic needs adjustment');
        } else {
            console.log('❌ ISSUE: Component rendered but no task content');
            console.log('💡 SOLUTION: Check data filtering and task rendering logic');
        }
        
        // Specific recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (debugInfo.bodyTextLength < 1000) {
            console.log('   - Page content is very minimal, component might not be rendering');
        }
        if (debugInfo.loadingElements > 0) {
            console.log('   - Remove or fix loading states that block content');
        }
        if (!debugInfo.hasTaskContent && debugInfo.bodyTextLength > 1000) {
            console.log('   - Component is rendering but task data is not being displayed');
            console.log('   - Check task filtering logic and data mapping');
        }
        
    } catch (error) {
        console.error('❌ Error during debugging:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-tasks-render-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Tasks render debugging completed!');
}

// Run the debug
debugTasksRender().catch(console.error);
