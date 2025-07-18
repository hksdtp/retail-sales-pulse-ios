/**
 * Script để thêm missing users vào database
 * Chạy: node fix-missing-users.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 FIXING MISSING USERS IN DATABASE');
console.log('===================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function addMissingUsers() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Kiểm tra users hiện tại
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email');
    
    if (fetchError) {
      console.error('❌ Error fetching existing users:', fetchError);
      return;
    }
    
    console.log('\n📊 Current users in database:');
    existingUsers?.forEach(user => {
      console.log(`- ${user.name} (${user.id}) - ${user.email}`);
    });
    
    // Danh sách users cần thêm
    const missingUsers = [
      {
        id: '76ui8I1vw3wiJLyvwFjq',
        name: 'Nguyễn Mạnh Linh',
        email: 'manhlinh@example.com',
        role: 'employee',
        team_id: '2', // Thuộc nhóm Thảo
        location: 'Hà Nội',
        department_type: 'retail',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    console.log('\n➕ Adding missing users...');
    
    for (const user of missingUsers) {
      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = existingUsers?.find(u => u.id === user.id || u.email === user.email);
      
      if (existingUser) {
        console.log(`⚠️  User ${user.name} already exists (${existingUser.id})`);
        continue;
      }
      
      // Thêm user mới
      const { error: insertError } = await supabase
        .from('users')
        .insert(user);
      
      if (insertError) {
        console.error(`❌ Error adding user ${user.name}:`, insertError);
      } else {
        console.log(`✅ Added user: ${user.name} (${user.id})`);
      }
    }
    
    console.log('\n🎉 Missing users fix completed!');
    
  } catch (error) {
    console.error('❌ Error adding missing users:', error);
  }
}

async function fixUserIdMappings() {
  try {
    console.log('\n🔧 FIXING USER ID MAPPINGS IN TASKS...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get all tasks with problematic user_ids
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      return;
    }
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    let fixedCount = 0;
    
    // Fix user_id mappings
    const userIdMappings = {
      'user_khanh_duy': 'abtSSmK0p0oeOyy5YWGZ', // Lê Khánh Duy real ID
      'team_leader_thao_id': 'MO7N4Trk6mASlHpIcjME' // Nguyễn Thị Thảo real ID
    };
    
    for (const task of tasks) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix user_id if it's a placeholder
      if (userIdMappings[task.user_id]) {
        const realUserId = userIdMappings[task.user_id];
        const realUser = users.find(u => u.id === realUserId);
        
        if (realUser) {
          updates.user_id = realUserId;
          updates.user_name = realUser.name;
          updates.team_id = realUser.team_id;
          needsUpdate = true;
          
          console.log(`🔧 Fixing user mapping for "${task.title}":`, {
            oldUserId: task.user_id,
            newUserId: realUserId,
            newUserName: realUser.name,
            newTeamId: realUser.team_id
          });
        }
      }
      
      // Fix assigned_to if it's a placeholder
      if (userIdMappings[task.assigned_to]) {
        updates.assigned_to = userIdMappings[task.assigned_to];
        needsUpdate = true;
        console.log(`🔧 Fixing assigned_to for "${task.title}": ${task.assigned_to} → ${userIdMappings[task.assigned_to]}`);
      }
      
      if (needsUpdate) {
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', task.id);
        
        if (error) {
          console.error(`❌ Error updating task ${task.id}:`, error);
        } else {
          fixedCount++;
        }
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} user ID mappings!`);
    
  } catch (error) {
    console.error('❌ Error fixing user ID mappings:', error);
  }
}

// Main execution
async function main() {
  await addMissingUsers();
  await fixUserIdMappings();
  
  console.log('\n🎉 ALL FIXES COMPLETED!');
  console.log('======================');
  console.log('✅ Missing users added');
  console.log('✅ User ID mappings fixed');
  console.log('✅ Team assignments corrected');
  console.log('\n🔄 Please refresh your web app to see the changes!');
}

main().catch(console.error);
