const { chromium } = require('playwright');

async function testLoginDirect() {
    console.log('🔍 Testing Login Directly...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Login') || text.includes('Submit') || text.includes('Auth') || text.includes('Error') || text.includes('Success')) {
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
        
        console.log('🔍 Checking login form elements...');
        
        // Check for form elements
        const locationSelect = await page.$('select');
        const passwordInput = await page.$('input[type="password"]');
        const submitButton = await page.$('button[type="submit"]');
        
        console.log(`📋 Form elements found:`);
        console.log(`   Location select: ${locationSelect ? '✅' : '❌'}`);
        console.log(`   Password input: ${passwordInput ? '✅' : '❌'}`);
        console.log(`   Submit button: ${submitButton ? '✅' : '❌'}`);
        
        if (!locationSelect || !passwordInput || !submitButton) {
            console.log('❌ Missing form elements, cannot proceed');
            return;
        }
        
        console.log('\n🔧 Performing login steps...');
        
        // Step 1: Select location
        console.log('📍 Step 1: Selecting location...');
        await locationSelect.selectOption('Hồ Chí Minh');
        await page.waitForTimeout(1000);
        console.log('✅ Location selected: Hồ Chí Minh');
        
        // Step 2: Wait for user dropdown to populate
        console.log('👤 Step 2: Waiting for user dropdown...');
        await page.waitForTimeout(2000);
        
        // Find user select (should be second select)
        const allSelects = await page.$$('select');
        console.log(`📋 Found ${allSelects.length} select elements`);
        
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
            
            // Select first available user (not empty option)
            const validOptions = options.filter(opt => opt.value && opt.value !== '');
            if (validOptions.length > 0) {
                await userSelect.selectOption(validOptions[0].value);
                console.log(`✅ User selected: ${validOptions[0].text}`);
                await page.waitForTimeout(1000);
            } else {
                console.log('❌ No valid users found');
                return;
            }
        } else {
            console.log('❌ User select not found');
            return;
        }
        
        // Step 3: Enter password
        console.log('🔑 Step 3: Entering password...');
        await passwordInput.fill('123456');
        console.log('✅ Password entered');
        await page.waitForTimeout(500);
        
        // Step 4: Check if submit button is enabled
        const isButtonEnabled = await submitButton.isEnabled();
        console.log(`🔘 Submit button enabled: ${isButtonEnabled ? '✅' : '❌'}`);
        
        if (!isButtonEnabled) {
            console.log('⚠️  Submit button is disabled, checking form validation...');
            
            // Check form validation state
            const formValidation = await page.evaluate(() => {
                const form = document.querySelector('form');
                const selects = Array.from(document.querySelectorAll('select'));
                const passwordInput = document.querySelector('input[type="password"]');
                
                return {
                    formExists: !!form,
                    locationValue: selects[0]?.value || 'none',
                    userValue: selects[1]?.value || 'none',
                    passwordValue: passwordInput?.value ? 'has_value' : 'empty',
                    selectCount: selects.length
                };
            });
            
            console.log('📋 Form validation state:', formValidation);
            
            // Try to force enable the button
            await page.evaluate(() => {
                const button = document.querySelector('button[type="submit"]');
                if (button) {
                    button.disabled = false;
                    button.removeAttribute('disabled');
                }
            });
            
            const isNowEnabled = await submitButton.isEnabled();
            console.log(`🔘 Submit button after force enable: ${isNowEnabled ? '✅' : '❌'}`);
        }
        
        // Step 5: Submit the form
        console.log('🚀 Step 5: Submitting form...');
        
        // Take screenshot before submit
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-login-before-submit.png',
            fullPage: true 
        });
        
        // Try multiple submit methods
        try {
            // Method 1: Click submit button
            await submitButton.click();
            console.log('✅ Clicked submit button');
        } catch (e) {
            console.log('❌ Click failed, trying alternative methods...');
            
            // Method 2: Press Enter on password field
            try {
                await passwordInput.press('Enter');
                console.log('✅ Pressed Enter on password field');
            } catch (e2) {
                console.log('❌ Enter key failed, trying JavaScript click...');
                
                // Method 3: JavaScript click
                await page.evaluate(() => {
                    const button = document.querySelector('button[type="submit"]');
                    if (button) {
                        button.click();
                    }
                });
                console.log('✅ JavaScript click executed');
            }
        }
        
        // Step 6: Wait for response
        console.log('⏳ Step 6: Waiting for login response...');
        await page.waitForTimeout(5000);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        // Take screenshot after submit
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-login-after-submit.png',
            fullPage: true 
        });
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Still on login page - login failed');
            
            // Check for error messages
            const errorMessages = await page.$$eval('*', elements => {
                const errors = [];
                elements.forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('lỗi') || text.includes('thất bại') || text.includes('error') || text.includes('failed')) {
                        errors.push(text.trim());
                    }
                });
                return errors;
            });
            
            if (errorMessages.length > 0) {
                console.log('📋 Error messages found:');
                errorMessages.forEach((msg, index) => {
                    console.log(`   ${index + 1}. ${msg}`);
                });
            } else {
                console.log('📋 No error messages found');
            }
            
        } else {
            console.log('✅ Login successful! Redirected to:', currentUrl);
            
            // Wait for main app to load
            await page.waitForTimeout(3000);
            
            // Look for tasks menu
            console.log('\n🔍 Looking for tasks menu...');
            const tasksMenu = await page.$('text="Công việc"');
            if (tasksMenu) {
                console.log('✅ Tasks menu found, clicking...');
                await tasksMenu.click();
                await page.waitForTimeout(3000);
                
                // Check for task content
                const taskContent = await page.$$eval('*', elements => {
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
                
                console.log(`📋 Task content found: ${taskContent.length} items`);
                if (taskContent.length > 0) {
                    console.log('✅ SUCCESS: Tasks are visible!');
                    taskContent.forEach((task, index) => {
                        console.log(`   ${index + 1}. ${task}`);
                    });
                } else {
                    console.log('❌ No task content visible');
                }
                
                // Final screenshot
                await page.screenshot({ 
                    path: 'retail-sales-pulse-ios/test-login-tasks-final.png',
                    fullPage: true 
                });
                
            } else {
                console.log('❌ Tasks menu not found');
            }
        }
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-login-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testLoginDirect().catch(console.error);
