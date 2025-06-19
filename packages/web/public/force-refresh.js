// Force refresh script - Clear cache and reload
// Ninh ơi - Script này sẽ clear cache và force reload

console.log('🔄 FORCE REFRESH SCRIPT');
console.log('======================');

// Clear all caches
const clearAllCaches = async () => {
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ Cleared localStorage');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');
    
    // Clear service worker caches if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Cleared service worker caches');
    }
    
    // Clear cookies for current domain
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('✅ Cleared cookies');
    
  } catch (error) {
    console.log('⚠️ Some caches could not be cleared:', error.message);
  }
};

// Force reload with cache bypass
const forceReload = () => {
  console.log('🔄 Force reloading page...');
  // Use location.reload(true) to bypass cache
  window.location.reload(true);
};

// Main function
const performForceRefresh = async () => {
  console.log('🧹 Starting force refresh process...');
  
  await clearAllCaches();
  
  console.log('⏳ Reloading in 2 seconds...');
  setTimeout(forceReload, 2000);
};

// Auto-run if URL contains force-refresh parameter
if (window.location.search.includes('force-refresh=true')) {
  performForceRefresh();
}

// Make available globally for manual use
window.forceRefresh = performForceRefresh;
window.clearAllCaches = clearAllCaches;

console.log('💡 To manually force refresh, run: window.forceRefresh()');
console.log('💡 Or add ?force-refresh=true to URL');
