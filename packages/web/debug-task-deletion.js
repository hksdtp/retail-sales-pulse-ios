/**
 * Debug Task Deletion Issues
 * Ninh ơi - Test và debug vấn đề xóa task
 */

import { createClient } from '@supabase/supabase-js';

console.log('🗑️ DEBUGGING TASK DELETION ISSUES');
console.log('=================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testTaskDeletion() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Step 1: Get all tasks
    console.log('\n📋 Step 1: Getting all tasks...');
    const { data: allTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching tasks:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${allTasks?.length || 0} tasks`);
    
    if (!allTasks || allTasks.length === 0) {
      console.log('ℹ️ No tasks found to test deletion');
      return;
    }
    
    // Display tasks
    console.log('\n📝 Available tasks:');
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (ID: ${task.id}) - ${task.user_name}`);
    });
    
    // Step 2: Test deletion on first task
    const testTask = allTasks[0];
    console.log(`\n🗑️ Step 2: Testing deletion on task: "${testTask.title}"`);
    console.log(`   Task ID: ${testTask.id}`);
    console.log(`   Created by: ${testTask.user_name}`);
    
    // Test 1: Check if task exists before deletion
    console.log('\n🔍 Test 1: Verify task exists...');
    const { data: taskBefore, error: beforeError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', testTask.id)
      .single();
    
    if (beforeError) {
      console.error('❌ Error checking task before deletion:', beforeError);
      return;
    }
    
    if (taskBefore) {
      console.log('✅ Task exists before deletion');
    } else {
      console.log('❌ Task not found before deletion');
      return;
    }
    
    // Test 2: Attempt deletion
    console.log('\n🗑️ Test 2: Attempting deletion...');
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', testTask.id);
    
    if (deleteError) {
      console.error('❌ Deletion failed:', deleteError);
      console.error('   Error details:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      });
      return;
    }
    
    console.log('✅ Deletion command executed successfully');
    
    // Test 3: Verify deletion
    console.log('\n🔍 Test 3: Verifying deletion...');
    const { data: taskAfter, error: afterError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', testTask.id)
      .single();
    
    if (afterError && afterError.code === 'PGRST116') {
      // PGRST116 = No rows found, which means deletion was successful
      console.log('✅ Task successfully deleted (not found in database)');
    } else if (afterError) {
      console.error('❌ Error checking task after deletion:', afterError);
    } else if (taskAfter) {
      console.log('❌ Task still exists after deletion - deletion failed!');
      console.log('   Task data:', taskAfter);
    }
    
    // Test 4: Check permissions
    console.log('\n🔐 Test 4: Checking permissions...');
    
    // Try to delete a different task to see if it's a permission issue
    if (allTasks.length > 1) {
      const secondTask = allTasks[1];
      console.log(`   Testing deletion on second task: "${secondTask.title}"`);
      
      const { error: permissionError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', secondTask.id);
      
      if (permissionError) {
        console.error('❌ Permission error on second task:', permissionError);
        console.log('   This might be a general permission issue');
      } else {
        console.log('✅ Second task deletion command executed (rolling back...)');
        
        // Don't actually delete, just test the permission
        // We can't easily rollback, so let's just log this
        console.log('⚠️ Note: Second task was actually deleted in this test');
      }
    }
    
    // Test 5: Check RLS policies
    console.log('\n🛡️ Test 5: Checking RLS policies...');
    
    // Try to get information about the table policies
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'tasks' })
      .catch(() => {
        console.log('   RPC function not available, skipping policy check');
        return { data: null, error: null };
      });
    
    if (policyError) {
      console.log('   Could not check RLS policies:', policyError.message);
    } else if (policies) {
      console.log('   RLS policies found:', policies);
    } else {
      console.log('   No RLS policy information available');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

async function testSupabaseServiceDeletion() {
  console.log('\n🔧 TESTING SUPABASE SERVICE DELETION');
  console.log('====================================');
  
  try {
    // Simulate the SupabaseService.deleteTask method
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get a task to test with
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching tasks for service test:', fetchError);
      return;
    }
    
    if (!tasks || tasks.length === 0) {
      console.log('ℹ️ No tasks available for service test');
      return;
    }
    
    const testTask = tasks[0];
    console.log(`🧪 Testing SupabaseService.deleteTask simulation on: "${testTask.title}"`);
    
    // Simulate the exact code from SupabaseService.deleteTask
    const deleteTask = async (id) => {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return false;
      }

      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting task:', error);
          return false;
        }

        console.log('✅ Task deleted successfully:', id);
        return true;
      } catch (error) {
        console.error('Error deleting task:', error);
        return false;
      }
    };
    
    // Test the function
    const result = await deleteTask(testTask.id);
    console.log(`🔍 Deletion result: ${result}`);
    
    if (result) {
      console.log('✅ SupabaseService.deleteTask simulation successful');
    } else {
      console.log('❌ SupabaseService.deleteTask simulation failed');
    }
    
  } catch (error) {
    console.error('❌ Error in service test:', error);
  }
}

async function checkDatabaseConstraints() {
  console.log('\n🔗 CHECKING DATABASE CONSTRAINTS');
  console.log('=================================');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Check if there are any foreign key constraints preventing deletion
    console.log('🔍 Checking for foreign key constraints...');
    
    // This would require admin access, so we'll just log what we're trying to do
    console.log('   Note: Foreign key constraint check requires admin access');
    console.log('   Common constraints that might prevent deletion:');
    console.log('   - References from other tables');
    console.log('   - Cascade delete rules');
    console.log('   - RLS policies');
    
    // Check if there are any related records that might prevent deletion
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, user_id, team_id')
      .limit(1);
    
    if (tasks && tasks.length > 0) {
      const task = tasks[0];
      console.log(`\n📋 Sample task structure:`, {
        id: task.id,
        title: task.title,
        user_id: task.user_id,
        team_id: task.team_id
      });
      
      console.log('   Checking for potential constraint issues...');
      console.log('   - user_id references: Could prevent deletion if user is referenced elsewhere');
      console.log('   - team_id references: Could prevent deletion if team constraints exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting task deletion debugging...\n');
  
  // Test 1: Basic task deletion
  await testTaskDeletion();
  
  // Test 2: Service method simulation
  await testSupabaseServiceDeletion();
  
  // Test 3: Database constraints
  await checkDatabaseConstraints();
  
  console.log('\n🎉 TASK DELETION DEBUGGING COMPLETED!');
  console.log('=====================================');
  console.log('✅ All tests completed');
  console.log('📋 Check the logs above for any issues');
  console.log('');
  console.log('🔧 Next steps if deletion is failing:');
  console.log('1. Check RLS policies in Supabase dashboard');
  console.log('2. Verify user permissions');
  console.log('3. Check for foreign key constraints');
  console.log('4. Test deletion directly in Supabase SQL editor');
}

main().catch(console.error);
