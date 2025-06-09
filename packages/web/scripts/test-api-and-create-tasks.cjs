const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test tasks for Nguyễn Mạnh Linh
const testTasks = [
  {
    title: 'Liên hệ KTS Nguyễn Văn A',
    description: 'Liên hệ và tư vấn cho KTS về dự án mới tại Hà Nội',
    type: 'architect_new',
    status: 'completed',
    priority: 'high',
    date: '2024-12-20',
    time: '09:00',
    progress: 100,
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Gặp khách hàng Công ty ABC',
    description: 'Tư vấn và báo giá cho khách hàng mới về sản phẩm',
    type: 'client_new',
    status: 'completed',
    priority: 'normal',
    date: '2024-12-20',
    time: '14:00',
    progress: 100,
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Theo dõi đối tác XYZ',
    description: 'Duy trì mối quan hệ với đối tác cũ',
    type: 'partner_old',
    status: 'in-progress',
    priority: 'normal',
    date: '2024-12-21',
    time: '10:00',
    progress: 60,
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    isShared: false,
    isSharedWithTeam: false,
  }
];

async function testApiAndCreateTasks() {
  console.log('🚀 Testing API and creating tasks for Nguyễn Mạnh Linh...\n');
  
  // Test 1: Check API health
  try {
    console.log('1️⃣ Testing API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthResult = await healthResponse.json();
    console.log('✅ API Health:', healthResult);
  } catch (error) {
    console.error('❌ API Health check failed:', error.message);
  }

  // Test 2: Get existing tasks
  try {
    console.log('\n2️⃣ Getting existing tasks...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksResult = await tasksResponse.json();
    
    if (tasksResult.success) {
      console.log(`✅ Found ${tasksResult.data.length} existing tasks`);
      
      // Filter tasks for Nguyễn Mạnh Linh
      const linhTasks = tasksResult.data.filter(task => 
        task.assignedTo === '76ui8I1vw3wiJLyvwFjq' || 
        task.user_id === '76ui8I1vw3wiJLyvwFjq'
      );
      console.log(`📋 Nguyễn Mạnh Linh has ${linhTasks.length} existing tasks`);
      
      if (linhTasks.length > 0) {
        console.log('📝 Existing tasks for Nguyễn Mạnh Linh:');
        linhTasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.title} (${task.type}, ${task.status})`);
        });
      }
    } else {
      console.error('❌ Failed to get tasks:', tasksResult.error);
    }
  } catch (error) {
    console.error('❌ Error getting tasks:', error.message);
  }

  // Test 3: Create new tasks
  console.log('\n3️⃣ Creating new test tasks...');
  const createdTasks = [];
  
  for (let i = 0; i < testTasks.length; i++) {
    const task = testTasks[i];
    try {
      console.log(`📝 Creating task ${i + 1}: ${task.title}`);
      
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created: ${task.title} (ID: ${result.data?.id})`);
        createdTasks.push(result.data);
      } else {
        console.error(`❌ Failed to create: ${task.title}`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creating task: ${task.title}`, error.message);
    }
  }

  // Test 4: Verify tasks were created
  console.log('\n4️⃣ Verifying created tasks...');
  try {
    const verifyResponse = await fetch(`${API_BASE}/tasks`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success) {
      const linhTasks = verifyResult.data.filter(task => 
        task.assignedTo === '76ui8I1vw3wiJLyvwFjq' || 
        task.user_id === '76ui8I1vw3wiJLyvwFjq'
      );
      
      console.log(`✅ Total tasks for Nguyễn Mạnh Linh: ${linhTasks.length}`);
      
      // Count by type and status
      const taskStats = {
        architect_new: linhTasks.filter(t => t.type === 'architect_new').length,
        client_new: linhTasks.filter(t => t.type === 'client_new').length,
        partner_old: linhTasks.filter(t => t.type === 'partner_old').length,
        completed: linhTasks.filter(t => t.status === 'completed').length,
        in_progress: linhTasks.filter(t => t.status === 'in-progress').length,
      };
      
      console.log('📊 Task Statistics:');
      console.log(`   - KTS mới: ${taskStats.architect_new}`);
      console.log(`   - KH mới: ${taskStats.client_new}`);
      console.log(`   - Đối tác cũ: ${taskStats.partner_old}`);
      console.log(`   - Đã hoàn thành: ${taskStats.completed}`);
      console.log(`   - Đang thực hiện: ${taskStats.in_progress}`);
    }
  } catch (error) {
    console.error('❌ Error verifying tasks:', error.message);
  }

  console.log('\n🎉 Test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Login as Nguyễn Mạnh Linh (manhlinh@example.com)');
  console.log('2. Check Dashboard for KPI updates');
  console.log('3. Check Tasks page for badge functionality');
  console.log('4. Verify status change functionality');
}

// Run the script
testApiAndCreateTasks().catch(console.error);
