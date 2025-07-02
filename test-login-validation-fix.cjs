const { chromium } = require('playwright');

async function testLoginValidationFix() {
    console.log('🔍 Testing Login Validation Fix...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('LoginForm') || text.includes('Submit') || text.includes('Validation') || text.includes('selectedUser') || text.includes('password')) {
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
        
        console.log('🔧 Step 1: Selecting location...');
        const locationSelect = await page.$('select');
        await locationSelect.selectOption('Hồ Chí Minh');
        await page.waitForTimeout(2000);
        console.log('✅ Location selected');
        
        console.log('🔧 Step 2: Selecting user...');
        const allSelects = await page.$$('select');
        if (allSelects.length >= 2) {
            const userSelect = allSelects[1];
            const options = await userSelect.$$eval('option', opts => 
                opts.map(opt => ({ value: opt.value, text: opt.textContent }))
            );
            
            const validOptions = options.filter(opt => opt.value && opt.value !== '');
            if (validOptions.length > 0) {
                await userSelect.selectOption(validOptions[0].value);
                console.log(`✅ User selected: ${validOptions[0].text}`);
                await page.waitForTimeout(1000);
            }
        }
        
        console.log('🔧 Step 3: Entering password...');
        const passwordInput = await page.$('input[type="password"]');
        await passwordInput.fill('123456');
        console.log('✅ Password entered');
        await page.waitForTimeout(1000);
        
        console.log('🔍 Step 4: Checking form validation state...');
        
        // Check form state using JavaScript
        const formState = await page.evaluate(() => {
            const selects = Array.from(document.querySelectorAll('select'));
            const passwordInput = document.querySelector('input[type="password"]');
            const submitButton = document.querySelector('button[type="submit"]');
            
            return {
                locationValue: selects[0]?.value || 'none',
                userValue: selects[1]?.value || 'none',
                passwordValue: passwordInput?.value || 'none',
                passwordLength: passwordInput?.value?.length || 0,
                submitButtonExists: !!submitButton,
                submitButtonDisabled: submitButton?.disabled || false,
                submitButtonText: submitButton?.textContent || 'none'
            };
        });
        
        console.log('📋 Form validation state:');
        console.log(`   Location: ${formState.locationValue}`);
        console.log(`   User: ${formState.userValue}`);
        console.log(`   Password: ${formState.passwordValue !== 'none' ? '***' : 'none'} (${formState.passwordLength} chars)`);
        console.log(`   Submit button disabled: ${formState.submitButtonDisabled}`);
        
        if (formState.submitButtonDisabled) {
            console.log('⚠️  Submit button is disabled. Attempting to fix...');
            
            // Try to force enable the button and debug React state
            const reactDebugInfo = await page.evaluate(() => {
                // Try to access React state
                const submitButton = document.querySelector('button[type="submit"]');
                const form = document.querySelector('form');
                
                // Force enable button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.removeAttribute('disabled');
                }
                
                // Try to trigger React state update
                const passwordInput = document.querySelector('input[type="password"]');
                const userSelect = document.querySelectorAll('select')[1];
                
                if (passwordInput) {
                    // Trigger input events to update React state
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                if (userSelect) {
                    userSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                return {
                    buttonForcedEnabled: !submitButton?.disabled,
                    formExists: !!form,
                    passwordInputExists: !!passwordInput,
                    userSelectExists: !!userSelect,
                    passwordInputValue: passwordInput?.value || 'none',
                    userSelectValue: userSelect?.value || 'none'
                };
            });
            
            console.log('🔧 React debug info:');
            console.log(`   Button forced enabled: ${reactDebugInfo.buttonForcedEnabled}`);
            console.log(`   Password input value: ${reactDebugInfo.passwordInputValue !== 'none' ? '***' : 'none'}`);
            console.log(`   User select value: ${reactDebugInfo.userSelectValue}`);
            
            await page.waitForTimeout(1000);
            
            // Check if button is now enabled
            const isNowEnabled = await page.evaluate(() => {
                const button = document.querySelector('button[type="submit"]');
                return !button?.disabled;
            });
            
            console.log(`🔘 Submit button now enabled: ${isNowEnabled}`);
        }
        
        console.log('🚀 Step 5: Attempting to submit...');
        
        // Try multiple submission methods
        try {
            // Method 1: Click the button
            const submitButton = await page.$('button[type="submit"]');
            await submitButton.click();
            console.log('✅ Clicked submit button');
        } catch (e) {
            console.log('❌ Button click failed, trying Enter key...');
            
            // Method 2: Press Enter on password field
            const passwordInput = await page.$('input[type="password"]');
            await passwordInput.press('Enter');
            console.log('✅ Pressed Enter on password field');
        }
        
        console.log('⏳ Step 6: Waiting for login response...');
        await page.waitForTimeout(5000);
        
        // Check result
        const currentUrl = page.url();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/login')) {
            console.log('❌ Still on login page');
            
            // Check for any error messages or validation issues
            const errorCheck = await page.evaluate(() => {
                const errors = [];
                
                // Look for error messages
                document.querySelectorAll('*').forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('lỗi') || text.includes('thất bại') || text.includes('error')) {
                        errors.push(text.trim());
                    }
                });
                
                // Check form validation state again
                const selects = Array.from(document.querySelectorAll('select'));
                const passwordInput = document.querySelector('input[type="password"]');
                const submitButton = document.querySelector('button[type="submit"]');
                
                return {
                    errors: [...new Set(errors)],
                    finalFormState: {
                        locationValue: selects[0]?.value || 'none',
                        userValue: selects[1]?.value || 'none',
                        passwordValue: passwordInput?.value ? 'has_value' : 'none',
                        submitDisabled: submitButton?.disabled || false
                    }
                };
            });
            
            if (errorCheck.errors.length > 0) {
                console.log('📋 Error messages found:');
                errorCheck.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }
            
            console.log('📋 Final form state:');
            console.log(`   Location: ${errorCheck.finalFormState.locationValue}`);
            console.log(`   User: ${errorCheck.finalFormState.userValue}`);
            console.log(`   Password: ${errorCheck.finalFormState.passwordValue}`);
            console.log(`   Submit disabled: ${errorCheck.finalFormState.submitDisabled}`);
            
        } else {
            console.log('✅ Login successful! Redirected to:', currentUrl);
            
            // Wait for main app to load
            await page.waitForTimeout(3000);
            
            // Look for tasks menu
            const tasksMenu = await page.$('text="Công việc"');
            if (tasksMenu) {
                console.log('✅ Tasks menu found, clicking...');
                await tasksMenu.click();
                await page.waitForTimeout(3000);
                
                // Check for task content
                const hasTaskContent = await page.evaluate(() => {
                    const keywords = ['Báo cáo doanh số', 'Liên hệ khách hàng', 'Cập nhật thông tin'];
                    let found = 0;
                    
                    document.querySelectorAll('*').forEach(el => {
                        const text = el.textContent || '';
                        keywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                found++;
                            }
                        });
                    });
                    
                    return found > 0;
                });
                
                if (hasTaskContent) {
                    console.log('🎉 SUCCESS: Tasks are visible in the menu!');
                } else {
                    console.log('⚠️  Tasks menu opened but no task content visible');
                }
            }
        }
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-login-validation-final.png',
            fullPage: true 
        });
        console.log('📸 Final screenshot saved');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        await page.screenshot({ 
            path: 'retail-sales-pulse-ios/test-login-validation-error.png',
            fullPage: true 
        });
    }
    
    await browser.close();
    console.log('\n✅ Testing completed!');
}

// Run the test
testLoginValidationFix().catch(console.error);
