// Test password change functionality with Playwright
import { chromium } from 'playwright';

async function testPasswordChange() {
  console.log('🧪 Testing password change functionality...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${new Date().toISOString()}] ${text}`);
    console.log(`🔍 Console: ${text}`);
  });
  
  try {
    // Step 1: Navigate to login page
    console.log('📝 Step 1: Navigate to login page');
    await page.goto('http://localhost:8088');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Check available users in Hà Nội
    console.log('📝 Step 2: Check available users in Hà Nội');
    await page.selectOption('select', 'hanoi');
    await page.waitForTimeout(3000);

    // Debug: Check if user dropdown exists
    const userDropdownExists = await page.locator('select >> nth=1').isVisible().catch(() => false);
    console.log('🔍 User dropdown exists:', userDropdownExists);

    if (!userDropdownExists) {
      console.log('❌ User dropdown not found! Checking all selects...');
      const allSelects = await page.locator('select').count();
      console.log('📊 Total selects found:', allSelects);

      for (let i = 0; i < allSelects; i++) {
        const selectOptions = await page.locator(`select >> nth=${i} option`).allTextContents().catch(() => []);
        console.log(`📋 Select ${i} options:`, selectOptions);
      }

      // Try alternative selectors
      const userSelectorByTestId = await page.locator('[data-testid="user-selector"]').isVisible().catch(() => false);
      console.log('🔍 User selector by test-id exists:', userSelectorByTestId);

      if (userSelectorByTestId) {
        const userOptions = await page.locator('[data-testid="user-selector"] option').allTextContents();
        console.log('📋 Available users via test-id:', userOptions);
      }

      return;
    }

    // Get all available users
    const userOptions = await page.locator('select >> nth=1 option').allTextContents();
    console.log('📋 Available users in Hà Nội:', userOptions);

    // Check if Nguyễn Mạnh Linh is available
    const manhLinhOption = userOptions.find(option => option.includes('Nguyễn Mạnh Linh'));
    console.log('🎯 Nguyễn Mạnh Linh found:', !!manhLinhOption);

    if (!manhLinhOption) {
      console.log('❌ Nguyễn Mạnh Linh not found! Available options:', userOptions);
      // Try to find any user with "Linh" in name
      const linhOptions = userOptions.filter(option => option.includes('Linh'));
      console.log('🔍 Options with "Linh":', linhOptions);

      // Use first available user for testing
      if (userOptions.length > 1) {
        const testUser = userOptions[1]; // Skip first option which is usually placeholder
        console.log('🔄 Using test user instead:', testUser);
        await page.selectOption('select >> nth=1', { label: testUser });
      } else {
        throw new Error('No users available for testing');
      }
    } else {
      console.log('✅ Selecting Nguyễn Mạnh Linh');
      await page.selectOption('select >> nth=1', { label: 'Nguyễn Mạnh Linh' });
    }

    await page.waitForTimeout(2000);
    
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    // Step 3: Check if password change modal appears
    console.log('📝 Step 3: Check password change modal');
    const passwordModal = await page.locator('[data-testid="password-change-modal"], .password-change-modal, div:has-text("Đổi mật khẩu")').first();
    const modalVisible = await passwordModal.isVisible().catch(() => false);
    
    console.log('🔍 Password change modal visible:', modalVisible);
    
    if (!modalVisible) {
      console.log('❌ Password change modal not found! Checking current state...');
      
      // Check current user info
      const currentUserInfo = await page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return {
          name: user.name,
          id: user.id,
          password_changed: user.password_changed,
          storedPassword: localStorage.getItem(`user_password_${user.id}`)
        };
      });
      
      console.log('📊 Current user info:', currentUserInfo);
      
      // If already logged in, logout and try again
      if (currentUserInfo.name) {
        console.log('🔄 User already logged in, logging out...');
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await page.reload();
        await page.waitForTimeout(2000);
        
        // Login again
        await page.selectOption('select', 'hanoi');
        await page.waitForTimeout(2000);
        await page.selectOption('select >> nth=1', { label: 'Nguyễn Mạnh Linh' });
        await page.waitForTimeout(2000);
        await page.fill('input[type="password"]', '123456');
        await page.click('button:has-text("Đăng nhập")');
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 4: Change password
    console.log('📝 Step 4: Change password to "newpass123"');
    
    // Try different selectors for password inputs
    const newPasswordSelectors = [
      'input[placeholder*="mật khẩu mới"]',
      'input[type="password"] >> nth=0',
      'input[name="newPassword"]',
      'input[id*="new-password"]'
    ];
    
    const confirmPasswordSelectors = [
      'input[placeholder*="xác nhận"]',
      'input[type="password"] >> nth=1', 
      'input[name="confirmPassword"]',
      'input[id*="confirm-password"]'
    ];
    
    let newPasswordInput = null;
    let confirmPasswordInput = null;
    
    for (const selector of newPasswordSelectors) {
      try {
        newPasswordInput = page.locator(selector).first();
        if (await newPasswordInput.isVisible()) {
          console.log('✅ Found new password input:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    for (const selector of confirmPasswordSelectors) {
      try {
        confirmPasswordInput = page.locator(selector).first();
        if (await confirmPasswordInput.isVisible()) {
          console.log('✅ Found confirm password input:', selector);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (newPasswordInput && confirmPasswordInput) {
      await newPasswordInput.fill('newpass123');
      await page.waitForTimeout(1000);
      await confirmPasswordInput.fill('newpass123');
      await page.waitForTimeout(1000);
      
      // Find and click submit button
      const submitSelectors = [
        'button:has-text("Đổi mật khẩu")',
        'button:has-text("Cập nhật")',
        'button:has-text("Xác nhận")',
        'button[type="submit"]'
      ];
      
      for (const selector of submitSelectors) {
        try {
          const submitBtn = page.locator(selector).first();
          if (await submitBtn.isVisible()) {
            console.log('✅ Found submit button:', selector);
            await submitBtn.click();
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      await page.waitForTimeout(3000);
      
      // Step 5: Check if password was stored
      console.log('📝 Step 5: Check if password was stored');
      const passwordStorageInfo = await page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const storedPassword = localStorage.getItem(`user_password_${user.id}`);
        
        return {
          userId: user.id,
          userName: user.name,
          passwordChanged: user.password_changed,
          storedPassword: storedPassword,
          storedPasswordLength: storedPassword?.length,
          allPasswordKeys: Object.keys(localStorage).filter(key => key.startsWith('user_password_'))
        };
      });
      
      console.log('📊 Password storage info:', passwordStorageInfo);
      
      // Step 6: Logout and test login with new password
      console.log('📝 Step 6: Logout and test login with new password');
      
      // Clear session and reload
      await page.evaluate(() => {
        // Keep stored password but clear session
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const storedPassword = localStorage.getItem(`user_password_${user.id}`);
        
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore stored password
        if (storedPassword && user.id) {
          localStorage.setItem(`user_password_${user.id}`, storedPassword);
        }
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Step 7: Try login with old password (should fail)
      console.log('📝 Step 7: Try login with old password (should fail)');
      await page.selectOption('select', 'hanoi');
      await page.waitForTimeout(2000);
      await page.selectOption('select >> nth=1', { label: 'Nguyễn Mạnh Linh' });
      await page.waitForTimeout(2000);
      await page.fill('input[type="password"]', '123456');
      await page.click('button:has-text("Đăng nhập")');
      await page.waitForTimeout(3000);
      
      // Check if login failed
      const loginFailedOld = await page.locator('text=Mật khẩu không đúng').isVisible().catch(() => false);
      console.log('🔍 Login with old password failed (expected):', loginFailedOld);
      
      // Step 8: Try login with new password (should succeed)
      console.log('📝 Step 8: Try login with new password (should succeed)');
      await page.fill('input[type="password"]', 'newpass123');
      await page.click('button:has-text("Đăng nhập")');
      await page.waitForTimeout(3000);
      
      // Check if login succeeded
      const loginSuccessNew = await page.locator('text=Công việc').isVisible().catch(() => false);
      console.log('🔍 Login with new password succeeded:', loginSuccessNew);
      
      // Final verification
      const finalUserInfo = await page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return {
          loggedIn: !!user.name,
          userName: user.name,
          passwordChanged: user.password_changed
        };
      });
      
      console.log('📊 Final user info:', finalUserInfo);
      
      // Summary
      console.log('\n📊 Test Summary:');
      console.log(`✅ Password stored: ${!!passwordStorageInfo.storedPassword}`);
      console.log(`✅ Old password rejected: ${loginFailedOld}`);
      console.log(`✅ New password accepted: ${loginSuccessNew}`);
      console.log(`✅ User logged in: ${finalUserInfo.loggedIn}`);
      
      if (passwordStorageInfo.storedPassword && loginFailedOld && loginSuccessNew && finalUserInfo.loggedIn) {
        console.log('🎉 PASSWORD CHANGE TEST PASSED!');
      } else {
        console.log('❌ PASSWORD CHANGE TEST FAILED!');
        console.log('🔍 Debug info:');
        console.log('- Stored password:', passwordStorageInfo.storedPassword);
        console.log('- Old password rejected:', loginFailedOld);
        console.log('- New password accepted:', loginSuccessNew);
        console.log('- User logged in:', finalUserInfo.loggedIn);
      }
      
    } else {
      console.log('❌ Could not find password input fields!');
    }
    
    await page.screenshot({ path: 'password-change-test.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'password-change-test-error.png', fullPage: true });
  } finally {
    // Show relevant console logs
    console.log('\n🔍 Relevant console logs:');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('password') || 
      log.includes('Password') || 
      log.includes('changePassword') ||
      log.includes('mockChangePassword') ||
      log.includes('localStorage') ||
      log.includes('stored')
    );
    relevantLogs.forEach(log => console.log(`   ${log}`));
    
    await browser.close();
  }
}

// Run the test
testPasswordChange().catch(console.error);
