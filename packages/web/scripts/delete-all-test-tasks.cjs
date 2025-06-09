const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function getAllTasks() {
  console.log('🔍 Getting all tasks from API...');
  
  try {
    const response = await fetch(`${API_BASE}/tasks`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ Found ${result.data.length} tasks total`);
      return result.data;
    } else {
      console.error('❌ Failed to get tasks:', result.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting tasks:', error.message);
    return [];
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      console.error(`❌ Failed to delete task ${taskId}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting task ${taskId}:`, error.message);
    return false;
  }
}

async function deleteAllTestTasks() {
  console.log('🚀 Starting to delete all test tasks...');
  
  // Get all tasks
  const allTasks = await getAllTasks();
  
  if (allTasks.length === 0) {
    console.log('📭 No tasks found to delete');
    return;
  }

  console.log('\n📋 Tasks to delete:');
  allTasks.forEach((task, index) => {
    console.log(`${index + 1}. "${task.title}" (ID: ${task.id}) - Assigned to: ${task.assignedTo}`);
  });

  console.log(`\n🗑️ Deleting ${allTasks.length} tasks...`);
  
  let deletedCount = 0;
  let failedCount = 0;

  for (const task of allTasks) {
    console.log(`🗑️ Deleting: "${task.title}" (${task.id})`);
    
    const success = await deleteTask(task.id);
    
    if (success) {
      console.log(`✅ Deleted: "${task.title}"`);
      deletedCount++;
    } else {
      console.log(`❌ Failed to delete: "${task.title}"`);
      failedCount++;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Cleanup completed!');
  console.log(`✅ Successfully deleted: ${deletedCount} tasks`);
  console.log(`❌ Failed to delete: ${failedCount} tasks`);
  console.log(`📊 Total processed: ${deletedCount + failedCount} tasks`);
}

// Run the script
deleteAllTestTasks().catch(console.error);
