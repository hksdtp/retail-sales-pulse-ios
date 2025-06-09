const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function getCurrentUsers() {
  console.log('🔍 Getting current users from API...');
  
  try {
    const response = await fetch(`${API_BASE}/users`);
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log(`✅ Found ${result.data.length} users:`);
      
      result.data.forEach(user => {
        console.log(`👤 ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Team: ${user.team_id}`);
        console.log(`   Location: ${user.location}`);
        console.log('');
      });
      
      // Find specific users we need
      const manhLinh = result.data.find(u => u.name === 'Nguyễn Mạnh Linh');
      const khanhDuy = result.data.find(u => u.name === 'Lê Khánh Duy');
      const ducManh = result.data.find(u => u.name === 'Khổng Đức Mạnh');
      
      console.log('🎯 Key users for testing:');
      if (ducManh) console.log(`Khổng Đức Mạnh: ${ducManh.id}`);
      if (manhLinh) console.log(`Nguyễn Mạnh Linh: ${manhLinh.id}`);
      if (khanhDuy) console.log(`Lê Khánh Duy: ${khanhDuy.id}`);
      
      return { ducManh, manhLinh, khanhDuy };
    } else {
      console.error('❌ Failed to get users:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting users:', error.message);
    return null;
  }
}

// Run the script
getCurrentUsers().catch(console.error);
