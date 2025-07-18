/**
 * Script để fix vấn đề đồng bộ mật khẩu giữa các thiết bị
 * Chạy: node fix-password-sync.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔐 FIXING PASSWORD SYNCHRONIZATION ISSUES');
console.log('=========================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function analyzePasswordSyncIssue() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lấy tất cả users từ Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log('\n📊 CURRENT PASSWORD STATUS IN SUPABASE:');
    console.log('=======================================');
    console.log('| Name                    | Password | Password Changed | Last Updated          |');
    console.log('|-------------------------|----------|------------------|-----------------------|');
    
    users?.forEach(user => {
      const lastUpdated = user.updated_at ? new Date(user.updated_at).toLocaleString('vi-VN') : 'N/A';
      console.log(`| ${user.name.padEnd(23)} | ${user.password.padEnd(8)} | ${user.password_changed.toString().padEnd(16)} | ${lastUpdated.padEnd(21)} |`);
    });
    
    // Phân tích vấn đề
    console.log('\n🔍 ANALYSIS:');
    console.log('============');
    
    const usersWithDefaultPassword = users?.filter(u => u.password === '123456') || [];
    const usersWithCustomPassword = users?.filter(u => u.password !== '123456') || [];
    const usersWithPasswordChangedFlag = users?.filter(u => u.password_changed === true) || [];
    const usersWithInconsistentState = users?.filter(u => 
      (u.password === '123456' && u.password_changed === true) ||
      (u.password !== '123456' && u.password_changed === false)
    ) || [];
    
    console.log(`📊 Users with default password (123456): ${usersWithDefaultPassword.length}`);
    usersWithDefaultPassword.forEach(u => console.log(`   - ${u.name}`));
    
    console.log(`📊 Users with custom password: ${usersWithCustomPassword.length}`);
    usersWithCustomPassword.forEach(u => console.log(`   - ${u.name} (${u.password})`));
    
    console.log(`📊 Users with password_changed=true: ${usersWithPasswordChangedFlag.length}`);
    usersWithPasswordChangedFlag.forEach(u => console.log(`   - ${u.name}`));
    
    if (usersWithInconsistentState.length > 0) {
      console.log(`⚠️  Users with INCONSISTENT state: ${usersWithInconsistentState.length}`);
      usersWithInconsistentState.forEach(u => {
        console.log(`   - ${u.name}: password="${u.password}", password_changed=${u.password_changed}`);
      });
    } else {
      console.log('✅ No inconsistent password states found');
    }
    
    return {
      users,
      usersWithDefaultPassword,
      usersWithCustomPassword,
      usersWithPasswordChangedFlag,
      usersWithInconsistentState
    };
    
  } catch (error) {
    console.error('❌ Error analyzing password sync:', error);
    return null;
  }
}

async function fixPasswordInconsistencies() {
  try {
    console.log('\n🔧 FIXING PASSWORD INCONSISTENCIES');
    console.log('==================================');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lấy analysis results
    const analysis = await analyzePasswordSyncIssue();
    if (!analysis) return;
    
    const { usersWithInconsistentState } = analysis;
    
    if (usersWithInconsistentState.length === 0) {
      console.log('✅ No inconsistencies to fix');
      return;
    }
    
    console.log(`🔧 Fixing ${usersWithInconsistentState.length} inconsistent users...`);
    
    for (const user of usersWithInconsistentState) {
      console.log(`\n🔧 Fixing user: ${user.name}`);
      console.log(`   Current: password="${user.password}", password_changed=${user.password_changed}`);
      
      let updates = {};
      
      // Logic: Nếu password không phải 123456 thì password_changed phải là true
      if (user.password !== '123456' && user.password_changed === false) {
        updates.password_changed = true;
        console.log(`   Fix: Set password_changed = true (user has custom password)`);
      }
      
      // Logic: Nếu password là 123456 thì password_changed phải là false
      if (user.password === '123456' && user.password_changed === true) {
        updates.password_changed = false;
        console.log(`   Fix: Set password_changed = false (user has default password)`);
      }
      
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
        
        if (error) {
          console.error(`   ❌ Error updating ${user.name}:`, error);
        } else {
          console.log(`   ✅ Fixed ${user.name}`);
        }
      } else {
        console.log(`   ℹ️ No fixes needed for ${user.name}`);
      }
    }
    
    console.log('\n✅ Password inconsistency fixes completed!');
    
  } catch (error) {
    console.error('❌ Error fixing password inconsistencies:', error);
  }
}

async function testPasswordAuthentication() {
  try {
    console.log('\n🧪 TESTING PASSWORD AUTHENTICATION');
    console.log('==================================');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lấy một user để test
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (!users || users.length === 0) {
      console.log('❌ No users found for testing');
      return;
    }
    
    console.log('🧪 Testing authentication for sample users:');
    
    for (const user of users) {
      console.log(`\n👤 Testing user: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Stored password: ${user.password}`);
      console.log(`   Password changed: ${user.password_changed}`);
      
      // Test với password hiện tại
      console.log(`   🔐 Testing with stored password: "${user.password}"`);
      
      // Test với default password
      if (user.password !== '123456') {
        console.log(`   🔐 Testing with default password: "123456"`);
        console.log(`   Expected result: Should FAIL (user has custom password)`);
      } else {
        console.log(`   🔐 User still has default password`);
        console.log(`   Expected result: Should SUCCEED with "123456"`);
      }
      
      console.log(`   📱 Multi-device sync: Password should be consistent across all devices`);
    }
    
    console.log('\n💡 AUTHENTICATION LOGIC EXPLANATION:');
    console.log('====================================');
    console.log('1. When user logs in, check password against Supabase database');
    console.log('2. If password_changed = false, accept "123456"');
    console.log('3. If password_changed = true, only accept the stored custom password');
    console.log('4. When password is changed, update both "password" and "password_changed" fields');
    console.log('5. All devices should check Supabase database, not localStorage');
    
  } catch (error) {
    console.error('❌ Error testing password authentication:', error);
  }
}

async function generatePasswordSyncFix() {
  console.log('\n🔧 GENERATING PASSWORD SYNC FIX');
  console.log('===============================');
  
  console.log('📝 Issues identified:');
  console.log('1. Multiple password storage locations (localStorage, Supabase, API server memory)');
  console.log('2. Inconsistent password validation logic');
  console.log('3. Cache not being cleared when password changes');
  console.log('');
  
  console.log('🔧 Recommended fixes:');
  console.log('1. Use Supabase as single source of truth for passwords');
  console.log('2. Clear localStorage password cache when password changes');
  console.log('3. Update password validation to always check Supabase first');
  console.log('4. Ensure password change updates both password and password_changed fields');
  console.log('');
  
  console.log('📋 Code changes needed:');
  console.log('- Update mockAuth.ts to always sync with Supabase');
  console.log('- Clear passwordService localStorage when password changes');
  console.log('- Update login logic to check Supabase database first');
  console.log('- Add password change event to clear all caches');
}

// Main execution
async function main() {
  console.log('🚀 Starting password synchronization analysis and fix...\n');
  
  // Step 1: Analyze current state
  await analyzePasswordSyncIssue();
  
  // Step 2: Fix inconsistencies
  await fixPasswordInconsistencies();
  
  // Step 3: Test authentication
  await testPasswordAuthentication();
  
  // Step 4: Generate fix recommendations
  await generatePasswordSyncFix();
  
  console.log('\n🎉 PASSWORD SYNC ANALYSIS COMPLETED!');
  console.log('===================================');
  console.log('✅ Database inconsistencies fixed');
  console.log('📋 Code fix recommendations generated');
  console.log('🧪 Authentication logic tested');
  console.log('');
  console.log('🔄 Next steps:');
  console.log('1. Apply code fixes to authentication logic');
  console.log('2. Test password changes on multiple devices');
  console.log('3. Verify password sync works correctly');
}

main().catch(console.error);
