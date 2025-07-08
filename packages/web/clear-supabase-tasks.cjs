#!/usr/bin/env node

/**
 * Script để xóa tất cả tasks ảo từ Supabase
 * Ninh ơi - Xóa sạch dữ liệu ảo để chỉ hiển thị tasks thật
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllTasks() {
  console.log('🗑️ Clearing all tasks from Supabase...');
  
  try {
    // Get all tasks first
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title');
    
    if (fetchError) {
      console.error('❌ Error fetching tasks:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${tasks?.length || 0} tasks to delete:`);
    tasks?.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} (ID: ${task.id})`);
    });
    
    if (!tasks || tasks.length === 0) {
      console.log('✅ No tasks to delete');
      return;
    }
    
    // Delete all tasks
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 'non-existent-id'); // Delete all records
    
    if (deleteError) {
      console.error('❌ Error deleting tasks:', deleteError);
      return;
    }
    
    console.log('✅ All tasks deleted successfully!');
    
    // Verify deletion
    const { data: remainingTasks, error: verifyError } = await supabase
      .from('tasks')
      .select('id');
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }
    
    console.log(`📊 Remaining tasks: ${remainingTasks?.length || 0}`);
    
    if (remainingTasks && remainingTasks.length === 0) {
      console.log('🎉 All tasks successfully cleared from Supabase!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
clearAllTasks().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
