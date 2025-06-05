const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function testLoginWithMockUser() {
  try {
    console.log('🔐 Testing login với mock user...');
    
    // Test với user từ AuthContext mock data
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'manh.khong@example.com',
        password: '123456'
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (result.success) {
      console.log('✅ Login thành công!');
      console.log('User:', result.data.user.name);
      console.log('Token:', result.data.token ? 'Generated' : 'Missing');
    } else {
      console.log('❌ Login failed:', result.error);
      console.log('💡 Cần thêm user vào Firestore database');
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLoginWithMockUser();
