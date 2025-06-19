#!/usr/bin/env node

// Simple API test without Playwright
async function runAPITests() {
  console.log('🧪 API Test Report');
  console.log('==================\n');

  const tests = [
    {
      name: 'Tasks API - Employee View',
      url: 'http://localhost:3001/tasks/manager-view?role=employee&view_level=department&department=retail',
      expectedFields: ['success', 'data', 'count']
    },
    {
      name: 'Tasks API - Manager View', 
      url: 'http://localhost:3001/tasks/manager-view?role=manager&view_level=department&department=retail',
      expectedFields: ['success', 'data', 'count']
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.name}`);
    console.log(`📡 URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if all expected fields exist
        const hasAllFields = test.expectedFields.every(field => data.hasOwnProperty(field));
        
        if (hasAllFields && data.success && Array.isArray(data.data)) {
          console.log(`✅ PASSED - Found ${data.data.length} tasks`);
          passedTests++;
        } else {
          console.log(`❌ FAILED - Invalid response format`);
          console.log(`   Expected fields: ${test.expectedFields.join(', ')}`);
          console.log(`   Actual fields: ${Object.keys(data).join(', ')}`);
        }
      } else {
        console.log(`❌ FAILED - HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ FAILED - ${error.message}`);
    }
    
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All API tests passed! The API configuration is correct.');
    console.log('✅ Port 3001 is working correctly');
    console.log('✅ JSON responses are properly formatted');
    console.log('✅ Task data is being returned successfully');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API server.');
  }

  return passedTests === totalTests;
}

// Run tests
runAPITests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});
