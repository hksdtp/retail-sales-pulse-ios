const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function testLogin() {
  try {
    console.log('🔐 Testing login API...');
    
    // Test với thông tin không hợp lệ
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (result.success) {
      console.log('✅ Login API hoạt động');
    } else {
      console.log('❌ Login failed (expected):', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLogin();
