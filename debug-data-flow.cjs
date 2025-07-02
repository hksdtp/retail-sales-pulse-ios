const { chromium } = require('playwright');

async function debugDataFlow() {
    console.log('🔍 Debugging Data Flow in Detail...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture all console logs
    page.on('console', msg => {
        const text = msg.text();
        console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
    });
    
    try {
        console.log('🚀 Navigating directly to tasks page...');
        await page.goto('http://localhost:8088/tasks', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        console.log('🔍 Checking current state...');
        
        // Check if we're redirected to login
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Redirected to login, need to authenticate first');
            return;
        }
        
        console.log('✅ On tasks page, debugging data flow...');
        
        // Take screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-data-flow-initial.png',
            fullPage: true 
        });
        
        // Debug React state and data
        const debugInfo = await page.evaluate(() => {
            // Check if React DevTools data is available
            const reactData = {
                hasReact: typeof window.React !== 'undefined',
                hasReactDOM: typeof window.ReactDOM !== 'undefined',
                windowKeys: Object.keys(window).filter(key => key.includes('react') || key.includes('React')),
            };
            
            // Check for task-related data in window
            const taskData = {
                hasTasksInWindow: !!window.tasks,
                tasksCount: window.tasks ? window.tasks.length : 0,
                hasSupabaseData: !!window.supabaseData,
                hasAuthState: !!window.authState,
                currentUser: window.currentUser ? window.currentUser.name : 'none'
            };
            
            // Check DOM for task elements
            const domData = {
                hasTaskElements: document.querySelectorAll('[data-testid*="task"], [class*="task"]').length,
                hasLoadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"]').length,
                hasErrorElements: document.querySelectorAll('[class*="error"]').length,
                bodyText: document.body.textContent || '',
                hasTaskKeywords: false
            };
            
            // Check for task keywords in DOM
            const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
            domData.hasTaskKeywords = keywords.some(keyword => domData.bodyText.includes(keyword));
            
            // Check for specific UI elements
            const uiElements = {
                hasTaskManagementView: !!document.querySelector('[data-testid*="task-management"], [class*="task-management"]'),
                hasTaskList: !!document.querySelector('[data-testid*="task-list"], [class*="task-list"]'),
                hasEmptyState: domData.bodyText.includes('Chưa có công việc') || domData.bodyText.includes('Không có'),
                hasInitializingText: domData.bodyText.includes('Đang khởi tạo'),
                mainContentText: domData.bodyText.substring(0, 500)
            };
            
            return {
                reactData,
                taskData,
                domData,
                uiElements,
                timestamp: new Date().toISOString()
            };
        });
        
        console.log('\n📊 DEBUG INFORMATION:');
        console.log('🔧 React Data:', debugInfo.reactData);
        console.log('📋 Task Data:', debugInfo.taskData);
        console.log('🌐 DOM Data:', {
            hasTaskElements: debugInfo.domData.hasTaskElements,
            hasLoadingElements: debugInfo.domData.hasLoadingElements,
            hasErrorElements: debugInfo.domData.hasErrorElements,
            hasTaskKeywords: debugInfo.domData.hasTaskKeywords,
            textLength: debugInfo.domData.bodyText.length
        });
        console.log('🎨 UI Elements:', debugInfo.uiElements);
        
        if (debugInfo.uiElements.hasInitializingText) {
            console.log('⚠️  Found "Đang khởi tạo" text - component is stuck in loading state');
        }
        
        if (debugInfo.uiElements.hasEmptyState) {
            console.log('📭 Found empty state - no tasks are being displayed');
        }
        
        // Try to force refresh data using browser console
        console.log('\n🔄 Attempting to force refresh data...');
        
        const refreshResult = await page.evaluate(() => {
            const results = [];
            
            // Try to call refresh functions if they exist
            if (window.refreshTasks) {
                window.refreshTasks();
                results.push('Called window.refreshTasks()');
            }
            
            if (window.forceRefresh) {
                window.forceRefresh();
                results.push('Called window.forceRefresh()');
            }
            
            // Try to trigger React re-render
            if (window.React) {
                results.push('React is available');
            }
            
            // Check if we can access Supabase data
            if (window.supabase) {
                results.push('Supabase client is available');
            }
            
            // Check auth state
            if (window.authState) {
                results.push(`Auth state: ${JSON.stringify(window.authState)}`);
            }
            
            return results;
        });
        
        console.log('🔄 Refresh results:', refreshResult);
        
        // Wait for potential refresh
        await page.waitForTimeout(3000);
        
        // Check again after refresh attempt
        const afterRefreshInfo = await page.evaluate(() => {
            const bodyText = document.body.textContent || '';
            const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
            
            return {
                hasTaskKeywords: keywords.some(keyword => bodyText.includes(keyword)),
                hasInitializingText: bodyText.includes('Đang khởi tạo'),
                hasEmptyState: bodyText.includes('Chưa có công việc'),
                taskElementsCount: document.querySelectorAll('[data-testid*="task"], [class*="task"]').length,
                loadingElementsCount: document.querySelectorAll('[class*="loading"], [class*="spinner"]').length,
                firstChars: bodyText.substring(0, 300)
            };
        });
        
        console.log('\n📊 AFTER REFRESH:');
        console.log('📋 Task keywords found:', afterRefreshInfo.hasTaskKeywords);
        console.log('⏳ Still initializing:', afterRefreshInfo.hasInitializingText);
        console.log('📭 Empty state:', afterRefreshInfo.hasEmptyState);
        console.log('🔢 Task elements:', afterRefreshInfo.taskElementsCount);
        console.log('⏳ Loading elements:', afterRefreshInfo.loadingElementsCount);
        console.log('📄 First 300 chars:', afterRefreshInfo.firstChars);
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-data-flow-final.png',
            fullPage: true 
        });
        
        // Final diagnosis
        console.log('\n🎯 DIAGNOSIS:');
        
        if (afterRefreshInfo.hasTaskKeywords) {
            console.log('✅ SUCCESS: Task content is visible in the DOM!');
        } else if (afterRefreshInfo.hasInitializingText) {
            console.log('❌ ISSUE: Component stuck in "Đang khởi tạo" state');
            console.log('   - Data is loaded but UI component is not updating');
            console.log('   - Possible React state management issue');
        } else if (afterRefreshInfo.hasEmptyState) {
            console.log('❌ ISSUE: Component showing empty state');
            console.log('   - Data might not be reaching the component');
            console.log('   - Possible data filtering issue');
        } else {
            console.log('❌ ISSUE: Unknown UI state');
            console.log('   - Component might not be rendering properly');
        }
        
        // Specific recommendations
        if (debugInfo.taskData.tasksCount > 0 && !afterRefreshInfo.hasTaskKeywords) {
            console.log('\n💡 RECOMMENDATION:');
            console.log('   - Data is loaded in window but not displayed');
            console.log('   - Check TaskManagementView component state');
            console.log('   - Check data filtering logic');
            console.log('   - Check React context providers');
        }
        
    } catch (error) {
        console.error('❌ Error during debugging:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/debug-data-flow-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Data flow debugging completed!');
}

// Run the debug
debugDataFlow().catch(console.error);
