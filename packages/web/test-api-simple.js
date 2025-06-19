#!/usr/bin/env node

// Use built-in fetch for Node.js 18+

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test the corrected API endpoint
    console.log('1. Testing GET /tasks/manager-view');
    const url = 'http://localhost:3001/tasks/manager-view?role=employee&view_level=department&department=retail';
    console.log(`📡 URL: ${url}`);

    const response = await fetch(url);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test PASSED!');
      console.log(`✅ Found ${data.data?.length || 0} tasks`);

      if (data.data && data.data.length > 0) {
        console.log('📋 Sample tasks:');
        data.data.slice(0, 2).forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.title} (${task.status})`);
        });
      }

      // Test if response format is correct
      if (data.success && Array.isArray(data.data)) {
        console.log('✅ Response format is correct');
        return true;
      } else {
        console.log('❌ Invalid response format');
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testAPI().then(success => {
  if (success) {
    console.log('\n🎉 API test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ API test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Test crashed:', error);
  process.exit(1);
});
