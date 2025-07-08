#!/usr/bin/env node

/**
 * Script để thêm team_id column vào tasks table
 * Ninh ơi - Sửa team filtering issue
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTeamIdColumn() {
  console.log('🔧 Fixing team_id column in tasks table...');
  
  try {
    // 1. Check current table structure
    console.log('\n📊 Step 1: Checking current table structure...');
    
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching tasks:', fetchError);
      return;
    }
    
    if (tasks && tasks.length > 0) {
      const sampleTask = tasks[0];
      console.log('📋 Sample task columns:', Object.keys(sampleTask));
      
      if (sampleTask.team_id !== undefined) {
        console.log('✅ team_id column already exists');
      } else {
        console.log('❌ team_id column missing');
      }
      
      if (sampleTask.location !== undefined) {
        console.log('✅ location column already exists');
      } else {
        console.log('❌ location column missing');
      }
    }
    
    // 2. Try to add team_id column (this might fail if column exists)
    console.log('\n🔧 Step 2: Attempting to add team_id column...');
    
    try {
      // Note: This is a direct SQL operation that might not work with RLS
      // We'll try to update existing tasks instead
      console.log('⚠️ Cannot add columns via client, will update existing tasks instead');
    } catch (alterError) {
      console.log('⚠️ Cannot alter table structure via client');
    }
    
    // 3. Update existing tasks with team_id based on user_id
    console.log('\n📝 Step 3: Updating existing tasks with team_id...');
    
    // Get all tasks
    const { data: allTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (allTasksError) {
      console.error('❌ Error fetching all tasks:', allTasksError);
      return;
    }
    
    console.log(`📊 Found ${allTasks.length} tasks to update`);
    
    // Define user to team mapping
    const userTeamMapping = {
      'user_khanh_duy': '1',           // Lê Khánh Duy - Team 1
      'user_viet_anh': '1',            // Lương Việt Anh - Team 1 Leader
      'user_thu_ha': '1',              // Quản Thu Hà - Team 1
      'user_thao': '2',                // Nguyễn Thị Thảo - Team 2 Leader
      'user_manh_linh': '2',           // Nguyễn Mạnh Linh - Team 2
      'user_bon': '3',                 // Trịnh Thị Bốn - Team 3 Leader
      'user_huong': '4',               // Phạm Thị Hương - Team 4 Leader
      'user_nga': '5',                 // Nguyễn Thị Nga - Team 1 HCM
      'user_tuyen': '5',               // Hà Nguyễn Thanh Tuyền - Team 1 HCM
      'user_viet_khanh': '6',          // Nguyễn Ngọc Việt Khanh - Team 2 HCM Leader
      'user_thuy_van': '6',            // Phùng Thị Thuỳ Vân - Team 2 HCM
      'user_khong_duc_manh': 'director' // Khổng Đức Mạnh - Director
    };
    
    const userLocationMapping = {
      'user_khanh_duy': 'hanoi',
      'user_viet_anh': 'hanoi',
      'user_thu_ha': 'hanoi',
      'user_thao': 'hanoi',
      'user_manh_linh': 'hanoi',
      'user_bon': 'hanoi',
      'user_huong': 'hanoi',
      'user_nga': 'hcm',
      'user_tuyen': 'hcm',
      'user_viet_khanh': 'hcm',
      'user_thuy_van': 'hcm',
      'user_khong_duc_manh': 'hanoi'
    };
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const task of allTasks) {
      const userId = task.user_id;
      const teamId = userTeamMapping[userId];
      const location = userLocationMapping[userId];
      
      if (teamId && location) {
        console.log(`📝 Updating task "${task.title}" - user: ${userId} → team: ${teamId}, location: ${location}`);
        
        try {
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ 
              team_id: teamId,
              location: location
            })
            .eq('id', task.id);
          
          if (updateError) {
            console.error(`❌ Error updating task ${task.id}:`, updateError.message);
            errorCount++;
          } else {
            updatedCount++;
          }
        } catch (updateException) {
          console.error(`❌ Exception updating task ${task.id}:`, updateException.message);
          errorCount++;
        }
      } else {
        console.log(`⚠️ No team mapping for user: ${userId}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Update summary:`);
    console.log(`  ✅ Successfully updated: ${updatedCount} tasks`);
    console.log(`  ❌ Failed to update: ${errorCount} tasks`);
    
    // 4. Verify updates
    console.log('\n🔍 Step 4: Verifying updates...');
    
    const { data: updatedTasks, error: verifyError } = await supabase
      .from('tasks')
      .select('id, title, user_id, team_id, location')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📋 Sample updated tasks:');
      updatedTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.title}" - user: ${task.user_id}, team: ${task.team_id}, location: ${task.location}`);
      });
    }
    
    console.log('\n✅ Team ID fix completed!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the script
fixTeamIdColumn().then(() => {
  console.log('\n🏁 Team ID fix script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Team ID fix script failed:', error);
  process.exit(1);
});
