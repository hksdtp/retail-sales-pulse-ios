const { chromium } = require('playwright');

async function testFinalSuccess() {
    console.log('🎉 Testing Final Success - Tasks Display...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture task-related console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Filtered personalTasks') || text.includes('Data sources')) {
            console.log(`📝 ${msg.type().toUpperCase()}: ${text}`);
        }
    });
    
    try {
        console.log('🚀 Step 1: Quick login and navigate to tasks...');
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
        
        console.log('🔍 Step 2: Analyzing task content...');
        
        // Get all task-related content
        const taskAnalysis = await page.evaluate(() => {
            const bodyText = document.body.textContent || '';
            
            // Look for actual task titles that we saw in the logs
            const actualTaskKeywords = [
                'ĐÀO TẠO AI',
                'Xử lý đơn hàng',
                'Báo giá',
                'Lên đơn',
                'Someser',
                'Khai Sơn',
                'Nguyễn Mạnh Linh',
                'Nguyễn Thị Thảo'
            ];
            
            // Check for task status indicators
            const statusKeywords = [
                'CHỜ',
                'LÀM',
                'HOÀN THÀNH',
                'CAO', // Priority
                'THẤP'
            ];
            
            // Check for UI elements
            const uiElements = [
                'Công việc của tôi',
                'Của tôi',
                'Của nhóm',
                'Thành viên',
                'Chung',
                'Lọc theo thời gian',
                'Tất cả',
                'Bộ lọc'
            ];
            
            const results = {
                actualTasks: [],
                statusIndicators: [],
                uiElements: [],
                totalTextLength: bodyText.length,
                hasTaskTable: false,
                hasTaskRows: false
            };
            
            // Check for actual task content
            actualTaskKeywords.forEach(keyword => {
                if (bodyText.includes(keyword)) {
                    results.actualTasks.push(keyword);
                }
            });
            
            // Check for status indicators
            statusKeywords.forEach(keyword => {
                if (bodyText.includes(keyword)) {
                    results.statusIndicators.push(keyword);
                }
            });
            
            // Check for UI elements
            uiElements.forEach(keyword => {
                if (bodyText.includes(keyword)) {
                    results.uiElements.push(keyword);
                }
            });
            
            // Check for table structure
            results.hasTaskTable = !!document.querySelector('table, [role="table"], .table');
            results.hasTaskRows = document.querySelectorAll('tr, [role="row"], .task-row, .task-item').length > 0;
            
            // Get sample of visible text
            results.sampleText = bodyText.substring(0, 1000);
            
            return results;
        });
        
        console.log('\n📊 TASK CONTENT ANALYSIS:');
        console.log(`📄 Total text length: ${taskAnalysis.totalTextLength}`);
        console.log(`📋 Has task table: ${taskAnalysis.hasTaskTable}`);
        console.log(`📝 Has task rows: ${taskAnalysis.hasTaskRows}`);
        
        console.log('\n✅ ACTUAL TASKS FOUND:');
        if (taskAnalysis.actualTasks.length > 0) {
            taskAnalysis.actualTasks.forEach((task, index) => {
                console.log(`   ${index + 1}. ${task}`);
            });
        } else {
            console.log('   ❌ No actual task content found');
        }
        
        console.log('\n🎯 STATUS INDICATORS:');
        if (taskAnalysis.statusIndicators.length > 0) {
            taskAnalysis.statusIndicators.forEach((status, index) => {
                console.log(`   ${index + 1}. ${status}`);
            });
        } else {
            console.log('   ❌ No status indicators found');
        }
        
        console.log('\n🎨 UI ELEMENTS:');
        if (taskAnalysis.uiElements.length > 0) {
            taskAnalysis.uiElements.forEach((element, index) => {
                console.log(`   ${index + 1}. ${element}`);
            });
        } else {
            console.log('   ❌ No UI elements found');
        }
        
        console.log('\n📄 SAMPLE TEXT (first 500 chars):');
        console.log(`"${taskAnalysis.sampleText.substring(0, 500)}"`);
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-final-success.png',
            fullPage: true 
        });
        console.log('\n📸 Final screenshot saved');
        
        // Final verdict
        console.log('\n🎯 FINAL VERDICT:');
        
        const hasTaskContent = taskAnalysis.actualTasks.length > 0;
        const hasStatusIndicators = taskAnalysis.statusIndicators.length > 0;
        const hasUIElements = taskAnalysis.uiElements.length > 0;
        const hasStructure = taskAnalysis.hasTaskTable || taskAnalysis.hasTaskRows;
        
        if (hasTaskContent && hasStatusIndicators && hasUIElements && hasStructure) {
            console.log('🎉 COMPLETE SUCCESS! Menu "Công việc của tôi" is fully working!');
            console.log('✅ Tasks are loading and displaying properly');
            console.log('✅ UI elements are present');
            console.log('✅ Task content is visible');
            console.log('✅ Status indicators are working');
            console.log('✅ Table structure is present');
        } else if (hasTaskContent && hasUIElements) {
            console.log('🎊 MAJOR SUCCESS! Menu "Công việc của tôi" is working!');
            console.log('✅ Tasks are loading and displaying');
            console.log('✅ UI elements are present');
            if (!hasStatusIndicators) console.log('⚠️  Status indicators could be improved');
            if (!hasStructure) console.log('⚠️  Table structure could be improved');
        } else if (hasUIElements) {
            console.log('✅ PARTIAL SUCCESS! Menu loads but task content needs work');
            console.log('✅ UI structure is working');
            console.log('❌ Task content display needs improvement');
        } else {
            console.log('❌ STILL ISSUES: Menu not working properly');
        }
        
        // Summary stats
        console.log('\n📊 SUMMARY STATS:');
        console.log(`   Task content items: ${taskAnalysis.actualTasks.length}`);
        console.log(`   Status indicators: ${taskAnalysis.statusIndicators.length}`);
        console.log(`   UI elements: ${taskAnalysis.uiElements.length}`);
        console.log(`   Page text length: ${taskAnalysis.totalTextLength} chars`);
        console.log(`   Has table structure: ${hasStructure}`);
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-final-success-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Final success testing completed!');
}

// Run the test
testFinalSuccess().catch(console.error);
