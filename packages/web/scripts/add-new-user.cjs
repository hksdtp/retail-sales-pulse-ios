const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// New user: Quản Thu Hà
const newUser = {
  name: 'Quản Thu Hà',
  email: 'thuha@example.com',
  password: '123456',
  role: 'employee',
  team_id: '1', // Nhóm của Lương Việt Anh
  location: 'hanoi',
  department: 'retail',
  department_type: 'retail',
  position: 'Nhân viên sale',
  status: 'active',
  password_changed: true,
};

async function addNewUser() {
  console.log('🚀 Adding new user: Quản Thu Hà...');
  
  try {
    console.log('📝 Creating user:', newUser.name);
    
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Created user: ${newUser.name}`);
      console.log(`📋 User details:`, result.data);
      console.log(`🆔 User ID: ${result.data?.id}`);
      
      // Return the created user data for updating mock
      return result.data;
    } else {
      console.error(`❌ Failed to create user: ${newUser.name}`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating user: ${newUser.name}`, error.message);
    return null;
  }
}

// Run the script
addNewUser()
  .then(userData => {
    if (userData) {
      console.log('\n🎉 User creation completed!');
      console.log('\n📝 Next steps:');
      console.log('1. Update mockAuth.ts with the new user ID');
      console.log('2. Add email alias for easy login');
      console.log('3. Create test tasks for the new user');
      console.log(`\n🔑 User ID to add to mock: ${userData.id}`);
      console.log(`📧 Email: ${userData.email}`);
    }
  })
  .catch(console.error);
