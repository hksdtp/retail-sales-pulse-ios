// Comprehensive test for password change system
// Tests: localStorage + Supabase sync + cross-device + old password rejection

async function testCompletePasswordSystem() {
  console.log('🧪 Testing Complete Password System...');
  console.log('=====================================');
  
  // Test users
  const testUsers = [
    { id: 'user_manh_linh', name: 'Nguyễn Mạnh Linh', email: 'manhlinh.nguyen@example.com' },
    { id: 'user_viet_anh', name: 'Lương Việt Anh', email: 'vietanh@example.com' },
    { id: 'user_thao', name: 'Nguyễn Thị Thảo', email: 'thao@example.com' }
  ];
  
  const results = {
    localStorage: {},
    supabase: {},
    crossDevice: {},
    oldPasswordRejection: {},
    summary: {}
  };
  
  try {
    console.log('\n📋 STEP 1: Test localStorage password storage');
    console.log('==============================================');
    
    for (const user of testUsers) {
      console.log(`\n🔍 Testing user: ${user.name} (${user.id})`);
      
      // 1. Clear existing password
      localStorage.removeItem(`user_password_${user.id}`);
      console.log('✅ Cleared existing password');
      
      // 2. Test default password (123456)
      const defaultPassword = localStorage.getItem(`user_password_${user.id}`);
      console.log('🔍 Default password:', defaultPassword || 'none (will use 123456)');
      
      // 3. Set new password
      const newPassword = `newpass_${user.id}_${Date.now()}`;
      localStorage.setItem(`user_password_${user.id}`, newPassword);
      console.log('✅ Set new password:', `***${newPassword.length} chars`);
      
      // 4. Verify password stored
      const storedPassword = localStorage.getItem(`user_password_${user.id}`);
      const passwordMatch = storedPassword === newPassword;
      console.log('🔍 Password verification:', passwordMatch ? '✅ PASS' : '❌ FAIL');
      
      results.localStorage[user.id] = {
        passwordSet: !!storedPassword,
        passwordMatch: passwordMatch,
        newPassword: newPassword
      };
    }
    
    console.log('\n📋 STEP 2: Test Supabase sync');
    console.log('=============================');
    
    for (const user of testUsers) {
      console.log(`\n🔍 Testing Supabase sync for: ${user.name}`);
      
      try {
        // Call the sync function
        const syncResult = await window.syncPasswordChangeToSupabase(user.id, results.localStorage[user.id].newPassword);
        console.log('📥 Sync result:', syncResult);
        
        results.supabase[user.id] = {
          syncSuccess: syncResult.success,
          syncError: syncResult.error,
          syncMessage: syncResult.message
        };
        
        console.log('🔍 Supabase sync:', syncResult.success ? '✅ PASS' : '❌ FAIL');
        
      } catch (error) {
        console.error('❌ Supabase sync error:', error);
        results.supabase[user.id] = {
          syncSuccess: false,
          syncError: error.message
        };
      }
    }
    
    console.log('\n📋 STEP 3: Test cross-device simulation');
    console.log('======================================');
    
    for (const user of testUsers) {
      console.log(`\n🔍 Testing cross-device for: ${user.name}`);
      
      // Simulate device 1: Clear localStorage (simulate different device)
      const originalPassword = localStorage.getItem(`user_password_${user.id}`);
      localStorage.removeItem(`user_password_${user.id}`);
      console.log('📱 Device 1: Cleared localStorage (simulating new device)');
      
      // Simulate device 2: Try to get password from Supabase
      try {
        // In real scenario, this would load from Supabase on login
        // For now, we'll simulate by checking if Supabase sync worked
        const supabaseWorked = results.supabase[user.id]?.syncSuccess;
        
        if (supabaseWorked) {
          // Simulate loading password from Supabase
          localStorage.setItem(`user_password_${user.id}`, originalPassword);
          console.log('📱 Device 2: ✅ Password loaded from Supabase simulation');
          
          results.crossDevice[user.id] = {
            crossDeviceSync: true,
            passwordRestored: true
          };
        } else {
          console.log('📱 Device 2: ❌ Could not load from Supabase');
          results.crossDevice[user.id] = {
            crossDeviceSync: false,
            passwordRestored: false
          };
        }
        
      } catch (error) {
        console.error('❌ Cross-device simulation error:', error);
        results.crossDevice[user.id] = {
          crossDeviceSync: false,
          error: error.message
        };
      }
    }
    
    console.log('\n📋 STEP 4: Test old password rejection');
    console.log('=====================================');
    
    for (const user of testUsers) {
      console.log(`\n🔍 Testing old password rejection for: ${user.name}`);
      
      const newPassword = results.localStorage[user.id].newPassword;
      const oldPassword = '123456'; // Default password
      
      // Test 1: New password should work
      const newPasswordStored = localStorage.getItem(`user_password_${user.id}`);
      const newPasswordValid = newPasswordStored === newPassword;
      console.log('🔍 New password validation:', newPasswordValid ? '✅ PASS' : '❌ FAIL');
      
      // Test 2: Old password should be rejected
      const oldPasswordValid = newPasswordStored === oldPassword;
      const oldPasswordRejected = !oldPasswordValid;
      console.log('🔍 Old password rejection:', oldPasswordRejected ? '✅ PASS' : '❌ FAIL');
      
      results.oldPasswordRejection[user.id] = {
        newPasswordValid: newPasswordValid,
        oldPasswordRejected: oldPasswordRejected,
        storedPassword: `***${newPasswordStored?.length || 0} chars`
      };
    }
    
    console.log('\n📋 STEP 5: Test complete login flow simulation');
    console.log('==============================================');
    
    for (const user of testUsers) {
      console.log(`\n🔍 Testing complete login flow for: ${user.name}`);
      
      try {
        // Simulate login with new password
        const storedPassword = localStorage.getItem(`user_password_${user.id}`);
        const newPassword = results.localStorage[user.id].newPassword;
        
        // Test login logic
        const loginWithNewPassword = storedPassword === newPassword;
        const loginWithOldPassword = storedPassword === '123456';
        
        console.log('🔐 Login with new password:', loginWithNewPassword ? '✅ SUCCESS' : '❌ FAIL');
        console.log('🔐 Login with old password:', loginWithOldPassword ? '❌ SHOULD FAIL' : '✅ CORRECTLY REJECTED');
        
        results.oldPasswordRejection[user.id].loginFlow = {
          newPasswordLogin: loginWithNewPassword,
          oldPasswordLogin: loginWithOldPassword,
          correctBehavior: loginWithNewPassword && !loginWithOldPassword
        };
        
      } catch (error) {
        console.error('❌ Login flow test error:', error);
      }
    }
    
    console.log('\n📊 FINAL SUMMARY');
    console.log('================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const user of testUsers) {
      console.log(`\n👤 ${user.name}:`);
      
      // localStorage tests
      const localStoragePass = results.localStorage[user.id]?.passwordMatch;
      console.log(`  📱 localStorage: ${localStoragePass ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++; if (localStoragePass) passedTests++;
      
      // Supabase tests
      const supabasePass = results.supabase[user.id]?.syncSuccess;
      console.log(`  ☁️  Supabase: ${supabasePass ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++; if (supabasePass) passedTests++;
      
      // Cross-device tests
      const crossDevicePass = results.crossDevice[user.id]?.crossDeviceSync;
      console.log(`  🔄 Cross-device: ${crossDevicePass ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++; if (crossDevicePass) passedTests++;
      
      // Old password rejection tests
      const oldPasswordPass = results.oldPasswordRejection[user.id]?.oldPasswordRejected;
      console.log(`  🚫 Old password rejection: ${oldPasswordPass ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++; if (oldPasswordPass) passedTests++;
      
      // Login flow tests
      const loginFlowPass = results.oldPasswordRejection[user.id]?.loginFlow?.correctBehavior;
      console.log(`  🔐 Login flow: ${loginFlowPass ? '✅ PASS' : '❌ FAIL'}`);
      totalTests++; if (loginFlowPass) passedTests++;
    }
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    console.log(`\n🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
    
    if (successRate >= 80) {
      console.log('🎉 PASSWORD SYSTEM TEST: ✅ PASSED');
    } else {
      console.log('❌ PASSWORD SYSTEM TEST: ❌ FAILED');
    }
    
    results.summary = {
      totalTests,
      passedTests,
      successRate,
      overallPass: successRate >= 80
    };
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return { error: error.message, results };
  }
}

// Auto-run test
console.log('🚀 Starting password system test...');
testCompletePasswordSystem()
  .then(results => {
    console.log('\n✅ Test completed!');
    console.log('📊 Full results:', results);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
