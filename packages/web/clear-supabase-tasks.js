/**
 * Script để xóa toàn bộ tasks từ Supabase database
 * Chạy: node clear-supabase-tasks.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🗑️ CLEARING ALL TASKS FROM SUPABASE DATABASE');
console.log('==============================================');

// Supabase configuration từ code
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function clearAllSupabaseTasks() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Step 1: Lấy tất cả tasks để log trước khi xóa
    console.log('\n📋 Step 1: Fetching all tasks...');
    const { data: allTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, user_name, user_id, created_at, assigned_to');
    
    if (fetchError) {
      console.error('❌ Error fetching tasks:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${allTasks?.length || 0} tasks in database`);
    
    if (!allTasks || allTasks.length === 0) {
      console.log('✅ No tasks found in database - already clean!');
      return;
    }
    
    // Step 2: Log tất cả tasks sẽ bị xóa
    console.log('\n📝 Tasks to be deleted:');
    console.log('========================');
    allTasks.forEach((task, index) => {
      const date = new Date(task.created_at).toLocaleDateString('vi-VN');
      console.log(`${index + 1}. "${task.title}" - ${task.user_name} (${task.user_id}) - ${date}`);
    });
    
    // Step 3: Xác nhận trước khi xóa
    console.log(`\n⚠️  WARNING: About to delete ${allTasks.length} tasks!`);
    console.log('This action cannot be undone.');
    
    // Trong môi trường production, bạn có thể thêm confirmation prompt
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // const answer = await new Promise(resolve => rl.question('Continue? (yes/no): ', resolve));
    // rl.close();
    // if (answer.toLowerCase() !== 'yes') { console.log('Cancelled.'); return; }
    
    // Step 4: Xóa tất cả tasks
    console.log('\n🗑️ Step 2: Deleting all tasks...');
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', ''); // This deletes all records (where id is not empty string)
    
    if (deleteError) {
      console.error('❌ Error deleting tasks:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted ${allTasks.length} tasks from Supabase!`);
    
    // Step 5: Verify deletion
    console.log('\n🔍 Step 3: Verifying deletion...');
    const { data: remainingTasks, error: verifyError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }
    
    if (remainingTasks && remainingTasks.length === 0) {
      console.log('✅ Verification successful - no tasks remaining in database');
    } else {
      console.log(`⚠️ Warning: ${remainingTasks?.length || 0} tasks still remain`);
    }
    
    console.log('\n🎉 SUPABASE CLEANUP COMPLETED!');
    console.log('==============================');
    console.log('✅ All tasks have been removed from Supabase database');
    console.log('🔄 Please refresh your web application to see changes');
    
  } catch (error) {
    console.error('❌ Fatal error during Supabase cleanup:', error);
    process.exit(1);
  }
}

// Hàm để xóa tasks của user cụ thể (nếu cần)
async function clearTasksForUser(userId) {
  try {
    console.log(`🗑️ Clearing tasks for user: ${userId}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lấy tasks của user trước khi xóa
    const { data: userTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, user_name')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('❌ Error fetching user tasks:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${userTasks?.length || 0} tasks for user ${userId}`);
    
    if (!userTasks || userTasks.length === 0) {
      console.log('✅ No tasks found for this user');
      return;
    }
    
    // Xóa tasks của user
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('❌ Error deleting user tasks:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted ${userTasks.length} tasks for user ${userId}`);
    
  } catch (error) {
    console.error('❌ Error clearing user tasks:', error);
  }
}

// Hàm để xóa tasks theo tên user
async function clearTasksForUserName(userName) {
  try {
    console.log(`🗑️ Clearing tasks for user name: ${userName}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Lấy tasks của user trước khi xóa
    const { data: userTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, user_name, user_id')
      .eq('user_name', userName);
    
    if (fetchError) {
      console.error('❌ Error fetching user tasks:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${userTasks?.length || 0} tasks for user "${userName}"`);
    
    if (!userTasks || userTasks.length === 0) {
      console.log('✅ No tasks found for this user');
      return;
    }
    
    // Log tasks sẽ bị xóa
    userTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}" (ID: ${task.id})`);
    });
    
    // Xóa tasks của user
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_name', userName);
    
    if (deleteError) {
      console.error('❌ Error deleting user tasks:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted ${userTasks.length} tasks for user "${userName}"`);
    
  } catch (error) {
    console.error('❌ Error clearing user tasks:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Xóa tất cả tasks
    await clearAllSupabaseTasks();
  } else if (args[0] === '--user-id' && args[1]) {
    // Xóa tasks của user cụ thể theo ID
    await clearTasksForUser(args[1]);
  } else if (args[0] === '--user-name' && args[1]) {
    // Xóa tasks của user cụ thể theo tên
    await clearTasksForUserName(args[1]);
  } else {
    console.log('Usage:');
    console.log('  node clear-supabase-tasks.js                    # Clear all tasks');
    console.log('  node clear-supabase-tasks.js --user-id <id>     # Clear tasks for specific user ID');
    console.log('  node clear-supabase-tasks.js --user-name <name> # Clear tasks for specific user name');
    console.log('');
    console.log('Examples:');
    console.log('  node clear-supabase-tasks.js --user-name "Lê Khánh Duy"');
  }
}

main().catch(console.error);
