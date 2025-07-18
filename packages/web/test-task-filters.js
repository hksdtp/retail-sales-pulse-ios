/**
 * Script để test các thay đổi filter tasks
 * Chạy: node test-task-filters.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🧪 TESTING TASK FILTER IMPROVEMENTS');
console.log('===================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function createTestTasks() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Test tasks để kiểm tra filter logic
    const testTasks = [
      {
        id: 'test_current_1',
        title: 'Công việc hôm nay - Nguyễn Mạnh Linh',
        description: 'Test task for current day filter',
        type: 'work',
        status: 'todo',
        priority: 'normal',
        date: today.toISOString().split('T')[0],
        time: '09:00',
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
        progress: 0,
        is_new: true,
        is_shared: false,
        is_shared_with_team: true, // Shared với team
        assigned_to: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh ID
        user_id: '76ui8I1vw3wiJLyvwFjq',
        user_name: 'Nguyễn Mạnh Linh',
        team_id: '2', // Team Thảo
        location: 'hanoi'
      },
      {
        id: 'test_pending_1',
        title: 'Công việc cũ chưa hoàn thành - Nguyễn Mạnh Linh',
        description: 'Old pending task that should still show',
        type: 'work', // Sử dụng type hợp lệ
        status: 'in-progress', // Chưa hoàn thành
        priority: 'high',
        date: yesterday.toISOString().split('T')[0],
        time: '10:00',
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
        progress: 50,
        is_new: false,
        is_shared: false,
        is_shared_with_team: false,
        assigned_to: '76ui8I1vw3wiJLyvwFjq',
        user_id: '76ui8I1vw3wiJLyvwFjq',
        user_name: 'Nguyễn Mạnh Linh',
        team_id: '2',
        location: 'hanoi'
      },
      {
        id: 'test_completed_old',
        title: 'Công việc cũ đã hoàn thành - Nguyễn Mạnh Linh',
        description: 'Old completed task that should NOT show in current filter',
        type: 'work',
        status: 'completed', // Đã hoàn thành
        priority: 'normal',
        date: yesterday.toISOString().split('T')[0],
        time: '11:00',
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
        progress: 100,
        is_new: false,
        is_shared: false,
        is_shared_with_team: false,
        assigned_to: '76ui8I1vw3wiJLyvwFjq',
        user_id: '76ui8I1vw3wiJLyvwFjq',
        user_name: 'Nguyễn Mạnh Linh',
        team_id: '2',
        location: 'hanoi'
      },
      {
        id: 'test_shared_dept',
        title: 'Công việc chung phòng - Shared Task',
        description: 'Department-wide shared task for testing',
        type: 'work', // Sử dụng type hợp lệ
        status: 'todo',
        priority: 'normal',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
        progress: 0,
        is_new: true,
        is_shared: true, // Công việc chung
        is_shared_with_team: true,
        assigned_to: null, // Không giao cho ai cụ thể
        user_id: 'user_khanh_duy',
        user_name: 'Lê Khánh Duy',
        team_id: '1',
        location: 'hanoi'
        // Bỏ visibility vì không có trong schema
      },
      {
        id: 'test_team_shared',
        title: 'Công việc chung nhóm Thảo',
        description: 'Team shared task for testing team visibility',
        type: 'work',
        status: 'todo',
        priority: 'normal',
        date: today.toISOString().split('T')[0],
        time: '15:00',
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
        progress: 0,
        is_new: true,
        is_shared: false,
        is_shared_with_team: true, // Shared với team
        assigned_to: null,
        user_id: 'team_leader_thao_id',
        user_name: 'Trưởng nhóm Thảo',
        team_id: '2',
        location: 'hanoi'
        // Bỏ visibility vì không có trong schema
      }
    ];
    
    console.log('\n📝 Creating test tasks...');
    for (const task of testTasks) {
      const { error } = await supabase
        .from('tasks')
        .insert(task);
      
      if (error) {
        console.error(`❌ Error creating task ${task.id}:`, error);
      } else {
        console.log(`✅ Created test task: ${task.title}`);
      }
    }
    
    console.log('\n🎉 Test tasks created successfully!');
    console.log('\n📋 Test scenarios:');
    console.log('1. Tab "Thành viên" (Khổng Đức Mạnh) - should show Nguyễn Mạnh Linh tasks');
    console.log('2. Tab "Chung" - should show shared/department tasks');
    console.log('3. Current date filter - should show today + pending old tasks');
    console.log('4. Should NOT show completed old tasks in current filter');
    
    console.log('\n🔄 Please refresh your web app and test the filters!');
    
  } catch (error) {
    console.error('❌ Error creating test tasks:', error);
  }
}

// Hàm để xóa test tasks
async function cleanupTestTasks() {
  try {
    console.log('🧹 Cleaning up test tasks...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const testTaskIds = [
      'test_current_1',
      'test_pending_1', 
      'test_completed_old',
      'test_shared_dept',
      'test_team_shared'
    ];
    
    for (const taskId of testTaskIds) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error(`❌ Error deleting task ${taskId}:`, error);
      } else {
        console.log(`✅ Deleted test task: ${taskId}`);
      }
    }
    
    console.log('✅ Test tasks cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error cleaning up test tasks:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'cleanup') {
    await cleanupTestTasks();
  } else {
    await createTestTasks();
    console.log('\n💡 To cleanup test tasks later, run: node test-task-filters.js cleanup');
  }
}

main().catch(console.error);
