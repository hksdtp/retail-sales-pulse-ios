
// Cache busting script - Force reload all resources
(function() {
  console.log('🔄 Force refreshing page with cache bust...');
  
  // Clear localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
    console.log('🧹 Cleared localStorage');
  }
  
  // Clear sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
    console.log('🧹 Cleared sessionStorage');
  }
  
  // Force reload with cache bust
  const timestamp = Date.now();
  const currentUrl = window.location.href.split('?')[0];
  const newUrl = currentUrl + '?cacheBust=' + timestamp + '&forceReload=true';
  
  console.log('🔄 Reloading with cache bust:', newUrl);
  window.location.href = newUrl;
})();
