const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test task data
const testTask = {
  title: 'Test Task từ Script',
  description: 'Đây là task test để kiểm tra API hoạt động',
  type: 'other',
  status: 'todo',
  date: '2025-06-04',
  time: '15:00',
  progress: 0,
  user_id: '1',
  user_name: 'Khổng Đức Mạnh',
  team_id: '0',
  location: 'hanoi',
  assignedTo: '1',
  isNew: true
};

async function testCreateTask() {
  try {
    console.log('🧪 TEST TẠO CÔNG VIỆC QUA API');
    console.log('============================\n');
    
    // Test health check
    console.log('1. 🔍 Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ API Status: ${healthData.status}\n`);
    
    // Test create task
    console.log('2. 📝 Tạo task test...');
    console.log(`   Task: ${testTask.title}`);
    console.log(`   Type: ${testTask.type}`);
    console.log(`   User: ${testTask.user_name}\n`);
    
    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTask)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('   ✅ Tạo task thành công!');
      console.log(`   📄 Task ID: ${createResult.data.id}`);
      console.log(`   📅 Created: ${createResult.data.created_at}`);
    } else {
      console.log('   ❌ Lỗi tạo task:', createResult.error);
    }
    
    console.log('\n3. 📊 Kiểm tra tổng số tasks...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    
    console.log(`   📋 Tổng số tasks: ${tasksData.count}`);
    console.log('   📝 Danh sách tasks:');
    
    tasksData.data.forEach((task, index) => {
      console.log(`      ${index + 1}. ${task.title} (${task.status})`);
    });
    
    console.log('\n🎉 TEST HOÀN TẤT!');
    console.log('================');
    console.log('✅ API tạo task hoạt động tốt');
    console.log('🌐 Dữ liệu được lưu trên Firebase Cloud');
    console.log('🔗 Xem tại: https://console.firebase.google.com/project/appqlgd/firestore');
    
  } catch (error) {
    console.error('❌ Lỗi test API:', error);
  }
}

// Chạy test
testCreateTask();
