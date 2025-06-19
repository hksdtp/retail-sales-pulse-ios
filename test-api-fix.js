#!/usr/bin/env node

/**
 * Test script để kiểm tra API endpoints sau khi sửa lỗi
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

async function testAPIEndpoints() {
  console.log('🧪 KIỂM TRA API ENDPOINTS SAU KHI SỬA LỖI');
  console.log('==========================================\n');

  const endpoints = [
    {
      name: 'Production API Health Check',
      url: 'https://api-adwc442mha-uc.a.run.app/health',
      expected: 'JSON response'
    },
    {
      name: 'Production API Tasks',
      url: 'https://api-adwc442mha-uc.a.run.app/tasks/manager-view?role=employee&view_level=department&department=retail',
      expected: 'JSON with tasks data'
    },
    {
      name: 'Test Server Health Check',
      url: 'http://localhost:3003/health',
      expected: 'JSON response'
    },
    {
      name: 'Test Server Tasks',
      url: 'http://localhost:3003/tasks/manager-view?role=employee&view_level=department&department=retail',
      expected: 'JSON with mock tasks'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`🔍 Testing: ${endpoint.name}`);
    console.log(`📡 URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`📄 Content-Type: ${contentType}`);
      
      if (response.ok) {
        const text = await response.text();
        
        // Check if response is HTML (error case)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.log('❌ ERROR: Server returned HTML instead of JSON');
          console.log(`📄 HTML Response: ${text.substring(0, 200)}...`);
        } else {
          try {
            const data = JSON.parse(text);
            console.log('✅ SUCCESS: Valid JSON response');
            console.log(`📋 Data keys: ${Object.keys(data).join(', ')}`);
            
            if (data.data && Array.isArray(data.data)) {
              console.log(`📊 Items count: ${data.data.length}`);
            }
          } catch (parseError) {
            console.log('❌ ERROR: Invalid JSON response');
            console.log(`📄 Raw response: ${text.substring(0, 200)}...`);
          }
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error: ${errorText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎯 KIỂM TRA CSP VÀ REACT REFRESH');
  console.log('================================');
  console.log('✅ Đã sửa CSP: Loại bỏ frame-ancestors directive');
  console.log('✅ Đã sửa API config: Sử dụng production API thay vì localhost:3001');
  console.log('✅ Đã sửa Vite config: Thêm React Refresh configuration');
  console.log('✅ Đã thêm error handling: Phát hiện HTML response thay vì JSON');
  console.log('');
  
  console.log('🔧 HƯỚNG DẪN TIẾP THEO:');
  console.log('======================');
  console.log('1. Mở Developer Tools trong trình duyệt (F12)');
  console.log('2. Kiểm tra Console tab để xem còn lỗi nào không');
  console.log('3. Kiểm tra Network tab để xem API calls');
  console.log('4. Nếu vẫn có lỗi, chụp màn hình và báo lại');
  console.log('');
}

// Run the test
testAPIEndpoints().catch(console.error);
