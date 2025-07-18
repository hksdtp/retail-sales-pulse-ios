
// Clear all task-related localStorage
const keysToRemove = Object.keys(localStorage).filter(key => 
  key.includes('task') || 
  key.includes('rawTasks') || 
  key.includes('filteredTasks') ||
  key.includes('mockTasks') ||
  key.includes('debugTasks') ||
  key.includes('testTasks') ||
  key.startsWith('user_tasks_') ||
  key.startsWith('personal_plans_')
);

keysToRemove.forEach(key => localStorage.removeItem(key));
console.log('🧹 Cleared', keysToRemove.length, 'localStorage keys');
