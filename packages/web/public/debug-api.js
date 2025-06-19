// Debug API script - chạy trong browser console
// Ninh ơi - Copy và paste script này vào browser console để debug

console.log('🔍 DEBUG API FROM BROWSER');
console.log('=========================\n');

// Test API configuration
const testApiConfig = () => {
  console.log('📊 Current Environment:');
  console.log(`  Location: ${window.location.href}`);
  console.log(`  DEV mode: ${window.location.hostname === 'localhost' ? 'true' : 'false'}`);
  console.log(`  Current port: ${window.location.port}`);
  console.log('');

  // Test proxy endpoint
  console.log('🔧 Testing proxy endpoint...');
  fetch('/api/health')
    .then(response => {
      console.log('✅ Proxy test response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('✅ Proxy test data:', data);
    })
    .catch(error => {
      console.error('❌ Proxy test error:', error);
    });
};

// Test API endpoints
const testApiEndpoints = async () => {
  const endpoints = [
    'http://localhost:3003/health',
    'http://localhost:3003/tasks/manager-view?role=employee&view_level=department&department=retail'
  ];

  for (const endpoint of endpoints) {
    console.log(`🧪 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📄 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ ERROR:', errorText);
      }
    } catch (error) {
      console.log(`❌ FETCH ERROR: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
};

// Run tests
const runDebug = async () => {
  testApiConfig();
  await testApiEndpoints();
  
  console.log('🔧 NEXT STEPS:');
  console.log('==============');
  console.log('1. Check Network tab in DevTools');
  console.log('2. Look for CORS errors');
  console.log('3. Verify API server is running on port 3003');
  console.log('4. Check if any ad blockers are interfering');
};

// Intercept fetch calls to debug API routing
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  console.log('🌐 FETCH INTERCEPTED:', url);

  if (typeof url === 'string' && url.includes('tasks')) {
    console.log('📋 TASKS API CALL DETECTED:', url);
    console.log('🔍 Call stack:', new Error().stack);
  }

  return originalFetch.apply(this, args);
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runDebug().catch(console.error);
}

// Export for manual use
window.debugAPI = {
  testApiConfig,
  testApiEndpoints,
  runDebug
};
