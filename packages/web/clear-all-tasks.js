/**
 * Script để xóa toàn bộ task ảo và reset hệ thống
 * Sử dụng: node clear-all-tasks.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🧹 CLEARING ALL FAKE TASKS - COMPREHENSIVE CLEANUP');
console.log('================================================');

// Đọc config Supabase từ localStorage backup hoặc file config
function getSupabaseConfig() {
  try {
    // Thử đọc từ file config nếu có
    const configPath = path.join(process.cwd(), 'supabase-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
    
    // Fallback config (cần được cập nhật với thông tin thật)
    return {
      url: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
      key: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
    };
  } catch (error) {
    console.error('❌ Error reading Supabase config:', error);
    return null;
  }
}

// Xóa tất cả tasks từ Supabase
async function clearSupabaseTasks() {
  console.log('\n🗑️ Step 1: Clearing Supabase tasks...');
  
  const config = getSupabaseConfig();
  if (!config || !config.url || !config.key) {
    console.log('⚠️ Supabase config not found, skipping Supabase cleanup');
    return;
  }

  try {
    const supabase = createClient(config.url, config.key);
    
    // Lấy tất cả tasks trước khi xóa để log
    const { data: allTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, user_name, created_at');
    
    if (fetchError) {
      console.error('❌ Error fetching tasks:', fetchError);
      return;
    }
    
    console.log(`📋 Found ${allTasks?.length || 0} tasks in Supabase`);
    
    if (allTasks && allTasks.length > 0) {
      // Log tasks trước khi xóa
      console.log('\n📝 Tasks to be deleted:');
      allTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} (${task.user_name}) - ${task.created_at}`);
      });
      
      // Xóa tất cả tasks
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .neq('id', ''); // Delete all records
      
      if (deleteError) {
        console.error('❌ Error deleting tasks:', deleteError);
      } else {
        console.log(`✅ Successfully deleted ${allTasks.length} tasks from Supabase`);
      }
    } else {
      console.log('✅ No tasks found in Supabase');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
  }
}

// Xóa localStorage data
function clearLocalStorageData() {
  console.log('\n🗑️ Step 2: Clearing localStorage data...');
  
  // Danh sách các keys cần xóa
  const keysToRemove = [
    // Task-related keys
    'rawTasks',
    'filteredTasks',
    'tasks',
    'mockTasks',
    'localTasks',
    
    // User-specific task keys (pattern: user_tasks_*)
    // Personal plan keys (pattern: personal_plans_*)
    // Cache keys
    'ui_cache',
    'component_cache',
    'task_cache',
    
    // Test data keys
    'testTasks',
    'debugTasks',
    'sampleTasks'
  ];
  
  // Tìm và xóa các keys theo pattern
  const allKeys = Object.keys(localStorage);
  const patternsToRemove = [
    'user_tasks_',
    'personal_plans_',
    'task_',
    'rawTasks',
    'filteredTasks',
    'mockTasks'
  ];
  
  let removedCount = 0;
  
  // Xóa keys cụ thể
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
      removedCount++;
    }
  });
  
  // Xóa keys theo pattern
  allKeys.forEach(key => {
    const shouldRemove = patternsToRemove.some(pattern => key.includes(pattern));
    if (shouldRemove && localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
      removedCount++;
    }
  });
  
  console.log(`✅ Removed ${removedCount} localStorage keys`);
}

// Xóa cache files
function clearCacheFiles() {
  console.log('\n🗑️ Step 3: Clearing cache files...');
  
  const cacheFiles = [
    'public/supabase-data-converted.json',
    'dist/supabase-data-converted.json',
    'src/data/cachedTasks.json',
    'test-results/tasks-cache.json'
  ];
  
  let removedCount = 0;
  
  cacheFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Removed cache file: ${filePath}`);
        removedCount++;
      } catch (error) {
        console.error(`❌ Error removing ${filePath}:`, error.message);
      }
    }
  });
  
  console.log(`✅ Removed ${removedCount} cache files`);
}

// Reset mock data files
function resetMockDataFiles() {
  console.log('\n🔄 Step 4: Resetting mock data files...');
  
  const mockDataFiles = [
    {
      path: 'src/utils/mockData.ts',
      content: `import { Task } from '../components/tasks/types/TaskTypes';

// Dữ liệu trống - sẵn sàng cho dữ liệu thật
export const mockTasks: Task[] = [];

// Xóa tất cả dữ liệu trong localStorage
export const saveMockTasksToLocalStorage = (): void => {
  localStorage.removeItem('rawTasks');
  localStorage.removeItem('tasks');
};

// Lấy dữ liệu mẫu từ localStorage
export const getMockTasksFromLocalStorage = (): Task[] => {
  const storedTasks = localStorage.getItem('rawTasks');
  return storedTasks ? JSON.parse(storedTasks) : [];
};
`
    },
    {
      path: 'src/data/mockTasks.ts',
      content: `// Dữ liệu mẫu cho ứng dụng khi không thể kết nối đến Google Sheets
import { Task } from '@/components/tasks/types/TaskTypes';

export const mockTasks: Task[] = [];
`
    }
  ];
  
  mockDataFiles.forEach(({ path: filePath, content }) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Reset mock data file: ${filePath}`);
      } catch (error) {
        console.error(`❌ Error resetting ${filePath}:`, error.message);
      }
    }
  });
}

// Main cleanup function
async function main() {
  try {
    console.log('🚀 Starting comprehensive task cleanup...\n');
    
    // Step 1: Clear Supabase
    await clearSupabaseTasks();
    
    // Step 2: Clear localStorage (chỉ có thể làm từ browser)
    console.log('\n🗑️ Step 2: localStorage cleanup...');
    console.log('⚠️ localStorage can only be cleared from browser console');
    console.log('📋 Run this in browser console:');
    console.log(`
// Clear all task-related localStorage
const keysToRemove = Object.keys(localStorage).filter(key => 
  key.includes('task') || 
  key.includes('rawTasks') || 
  key.includes('filteredTasks') ||
  key.includes('mockTasks') ||
  key.startsWith('user_tasks_') ||
  key.startsWith('personal_plans_')
);
keysToRemove.forEach(key => localStorage.removeItem(key));
console.log('✅ Cleared', keysToRemove.length, 'localStorage keys');
location.reload();
`);
    
    // Step 3: Clear cache files
    clearCacheFiles();
    
    // Step 4: Reset mock data
    resetMockDataFiles();
    
    console.log('\n🎉 CLEANUP COMPLETED!');
    console.log('================================================');
    console.log('✅ Supabase tasks cleared');
    console.log('⚠️ localStorage needs manual clearing (see instructions above)');
    console.log('✅ Cache files removed');
    console.log('✅ Mock data files reset');
    console.log('\n🔄 Please refresh your browser and check the task list');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
main();
