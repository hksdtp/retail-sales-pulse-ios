#!/usr/bin/env node

/**
 * Script để kiểm tra tasks trong Supabase sau khi tạo
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
  console.log('🔍 Checking tasks in Supabase...');
  
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching tasks:', error);
      return;
    }
    
    console.log(`📊 Found ${tasks?.length || 0} tasks in Supabase:`);
    
    if (tasks && tasks.length > 0) {
      tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. Task: ${task.title}`);
        console.log(`   ID: ${task.id}`);
        console.log(`   User: ${task.user_name} (${task.user_id})`);
        console.log(`   Created by: ${task.created_by}`);
        console.log(`   Status: ${task.status}`);
        console.log(`   Type: ${task.type}`);
        console.log(`   Visibility: ${task.visibility}`);
        console.log(`   Created: ${task.created_at}`);
        console.log(`   Description: ${task.description?.substring(0, 100)}...`);
      });
      
      // Check for Lê Khánh Duy tasks
      const khanhDuyTasks = tasks.filter(task => 
        task.user_name?.includes('Lê Khánh Duy') || 
        task.title?.includes('Lê Khánh Duy') ||
        task.user_id === 'user_khanh_duy'
      );
      
      console.log(`\n👤 Lê Khánh Duy tasks: ${khanhDuyTasks.length}`);
      khanhDuyTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.title}" - ${task.status}`);
      });
      
    } else {
      console.log('📝 No tasks found in Supabase');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTasks().then(() => {
  console.log('\n🏁 Check completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  process.exit(1);
});
