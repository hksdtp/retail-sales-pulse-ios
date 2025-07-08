#!/usr/bin/env node

/**
 * Test API connection after starting server
 * Ninh ơi - Kiểm tra kết nối API server
 */

const fetch = require('node-fetch');

async function testAPIConnection() {
  console.log('🧪 Testing API server connection...');
  console.log('===================================');
  
  const endpoints = [
    {
      name: 'Health Check',
      url: 'http://localhost:3003/health',
      method: 'GET'
    },
    {
      name: 'Tasks Endpoint',
      url: 'http://localhost:3003/tasks',
      method: 'GET'
    },
    {
      name: 'Manager View Endpoint',
      url: 'http://localhost:3003/tasks/manager-view?role=employee&view_level=department&department=retail',
      method: 'GET'
    },
    {
      name: 'Users Endpoint',
      url: 'http://localhost:3003/users',
      method: 'GET'
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`📡 URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${endpoint.name}`);
        
        if (endpoint.name === 'Health Check') {
          console.log(`   Response: ${JSON.stringify(data)}`);
        } else if (endpoint.name === 'Tasks Endpoint') {
          console.log(`   Tasks count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        } else if (endpoint.name === 'Manager View Endpoint') {
          console.log(`   Manager view data: ${JSON.stringify(data).substring(0, 100)}...`);
        } else if (endpoint.name === 'Users Endpoint') {
          console.log(`   Users count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        }
      } else {
        console.log(`❌ Failed: ${endpoint.name}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${endpoint.name}`);
      console.log(`   ${error.message}`);
    }
  }
  
  console.log('\n🏁 API connection test completed');
  console.log('\n💡 Next steps:');
  console.log('1. If all tests passed, refresh your browser');
  console.log('2. Check browser console for any remaining errors');
  console.log('3. API server is running on http://localhost:3003');
}

testAPIConnection().catch(console.error);
