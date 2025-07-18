/**
 * Browser script để xóa toàn bộ task data
 * Chạy script này trong browser console
 */

(function() {
  console.log('🧹 CLEARING ALL TASK DATA - BROWSER CLEANUP');
  console.log('===========================================');
  
  // Step 1: Clear localStorage task data
  console.log('\n🗑️ Step 1: Clearing localStorage...');
  
  const keysToRemove = [];
  const allKeys = Object.keys(localStorage);
  
  // Patterns to remove
  const patternsToRemove = [
    'task',
    'rawTasks',
    'filteredTasks',
    'mockTasks',
    'localTasks',
    'user_tasks_',
    'personal_plans_',
    'testTasks',
    'debugTasks',
    'sampleTasks',
    'task_cache',
    'ui_cache',
    'component_cache'
  ];
  
  // Find keys to remove
  allKeys.forEach(key => {
    const shouldRemove = patternsToRemove.some(pattern => 
      key.includes(pattern) || key.startsWith(pattern)
    );
    if (shouldRemove) {
      keysToRemove.push(key);
    }
  });
  
  // Log what will be removed
  console.log(`📋 Found ${keysToRemove.length} keys to remove:`);
  keysToRemove.forEach((key, index) => {
    console.log(`${index + 1}. ${key}`);
  });
  
  // Remove the keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`✅ Removed ${keysToRemove.length} localStorage keys`);
  
  // Step 2: Clear sessionStorage
  console.log('\n🗑️ Step 2: Clearing sessionStorage...');
  const sessionKeys = Object.keys(sessionStorage);
  const sessionKeysToRemove = sessionKeys.filter(key => 
    patternsToRemove.some(pattern => key.includes(pattern))
  );
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log(`✅ Removed ${sessionKeysToRemove.length} sessionStorage keys`);
  
  // Step 3: Clear any cached data in memory
  console.log('\n🗑️ Step 3: Clearing memory cache...');
  
  // Clear any global task variables
  if (window.taskCache) {
    delete window.taskCache;
    console.log('✅ Cleared window.taskCache');
  }
  
  if (window.rawTasks) {
    delete window.rawTasks;
    console.log('✅ Cleared window.rawTasks');
  }
  
  if (window.filteredTasks) {
    delete window.filteredTasks;
    console.log('✅ Cleared window.filteredTasks');
  }
  
  // Step 4: Force refresh React state (if possible)
  console.log('\n🔄 Step 4: Attempting to refresh React state...');
  
  // Try to trigger a refresh of task data
  if (window.refreshTasks) {
    try {
      window.refreshTasks();
      console.log('✅ Called window.refreshTasks()');
    } catch (error) {
      console.log('⚠️ window.refreshTasks() not available');
    }
  }
  
  if (window.refreshLocalTasks) {
    try {
      window.refreshLocalTasks();
      console.log('✅ Called window.refreshLocalTasks()');
    } catch (error) {
      console.log('⚠️ window.refreshLocalTasks() not available');
    }
  }
  
  // Step 5: Clear browser cache (if possible)
  console.log('\n🗑️ Step 5: Clearing browser cache...');
  
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.includes('task') || cacheName.includes('data')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Cleared relevant browser caches');
    }).catch(error => {
      console.log('⚠️ Could not clear browser caches:', error);
    });
  }
  
  // Step 6: Summary and next steps
  console.log('\n🎉 BROWSER CLEANUP COMPLETED!');
  console.log('============================');
  console.log('✅ localStorage cleared');
  console.log('✅ sessionStorage cleared');
  console.log('✅ Memory cache cleared');
  console.log('✅ Browser cache cleared');
  
  console.log('\n🔄 NEXT STEPS:');
  console.log('1. Refresh the page (F5 or Ctrl+R)');
  console.log('2. Check if tasks are still appearing');
  console.log('3. If tasks persist, they may be coming from Supabase database');
  
  // Auto refresh after 2 seconds
  console.log('\n⏰ Auto-refreshing page in 3 seconds...');
  setTimeout(() => {
    console.log('🔄 Refreshing page now...');
    window.location.reload(true);
  }, 3000);
  
})();

// Export for manual use
window.clearAllTaskData = function() {
  console.log('🧹 Manual task data clear triggered');
  
  // Clear localStorage
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('task') || 
    key.includes('rawTasks') || 
    key.includes('filteredTasks') ||
    key.includes('mockTasks') ||
    key.startsWith('user_tasks_') ||
    key.startsWith('personal_plans_')
  );
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`✅ Cleared ${keysToRemove.length} localStorage keys`);
  
  // Refresh page
  window.location.reload(true);
};

console.log('🔧 Task cleanup script loaded. Run clearAllTaskData() to manually clear data.');
