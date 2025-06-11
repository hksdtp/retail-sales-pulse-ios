
// Auto-clear localStorage for fresh start
console.log('🧹 Clearing localStorage for fresh project start...');

// Clear all task-related data
localStorage.removeItem('tasks');
localStorage.removeItem('rawTasks');
localStorage.removeItem('taskFilters');
localStorage.removeItem('taskStats');

// Clear personal plans
const userKeys = Object.keys(localStorage).filter(key => 
  key.startsWith('personal_plans_') || 
  key.startsWith('plan_stats_')
);
userKeys.forEach(key => localStorage.removeItem(key));

// Clear any cached data
localStorage.removeItem('cachedTasks');
localStorage.removeItem('lastSync');
localStorage.removeItem('offlineData');

// Keep auth data but reset project start date
localStorage.setItem('projectStartDate', '2025-06-11');
localStorage.setItem('projectStartDisplay', '11/6/2025');

console.log('✅ LocalStorage cleared - Ready for fresh start!');
console.log('📅 Project start date set to: 11/6/2025');
