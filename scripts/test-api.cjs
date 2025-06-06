const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:5001/appqlgd/us-central1/api';

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test GET /health
    console.log('1. Testing GET /health');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test GET /tasks
    console.log('2. Testing GET /tasks');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    console.log('✅ Tasks count:', tasksData.count);
    console.log('✅ First task:', tasksData.data[0]?.title);
    console.log('');

    // Test POST /tasks
    console.log('3. Testing POST /tasks');
    const newTask = {
      title: 'Test task từ API',
      description: 'Đây là task test từ API',
      type: 'other',
      status: 'todo',
      date: '2025-06-04',
      time: '16:00',
      progress: 0,
      user_id: '2',
      user_name: 'Lương Việt Anh',
      team_id: '1',
      location: 'hanoi',
      assignedTo: '2',
    };

    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    const createData = await createResponse.json();
    console.log('✅ Created task:', createData.data?.title);
    console.log('✅ Task ID:', createData.data?.id);
    console.log('');

    // Test GET /tasks again to see new count
    console.log('4. Testing GET /tasks (after creation)');
    const tasksResponse2 = await fetch(`${API_BASE}/tasks`);
    const tasksData2 = await tasksResponse2.json();
    console.log('✅ New tasks count:', tasksData2.count);
    console.log('');

    console.log('🎉 All API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();
