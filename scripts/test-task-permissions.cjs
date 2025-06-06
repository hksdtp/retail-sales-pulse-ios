const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test users
const testUsers = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    role: 'retail_director',
    team_id: '0',
    location: 'hanoi',
  },
  {
    id: '3',
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
  },
  {
    id: '5',
    name: 'Nguyễn Mạnh Linh',
    email: 'manhlinh@example.com',
    role: 'employee',
    team_id: '2',
    location: 'hanoi',
  },
  {
    id: '2',
    name: 'Lương Việt Anh',
    email: 'vietanh@example.com',
    role: 'team_leader',
    team_id: '1',
    location: 'hanoi',
  },
];

async function createTestTask(creatorId, assignedToId, title) {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        description: `Test task created by user ${creatorId} for user ${assignedToId}`,
        type: 'other',
        status: 'todo',
        date: new Date().toISOString().split('T')[0],
        progress: 0,
        user_id: creatorId,
        assignedTo: assignedToId,
        teamId: '1',
        location: 'hanoi',
      }),
    });

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

async function getTasksForUser(userId, role, teamId) {
  try {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (role) params.append('role', role);
    if (teamId) params.append('team_id', teamId);

    const response = await fetch(`${API_BASE}/tasks?${params.toString()}`);
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

async function testTaskPermissions() {
  console.log('🔐 TEST PHÂN QUYỀN TASKS');
  console.log('========================\n');

  // 1. Tạo test tasks
  console.log('1. 📝 Tạo test tasks...');

  // Lê Khánh Duy tạo task cho chính mình
  const task1 = await createTestTask('3', '3', 'Task của Lê Khánh Duy cho chính mình');
  console.log(`   ✅ Task 1: ${task1 ? task1.id : 'Failed'} - Lê Khánh Duy → Lê Khánh Duy`);

  // Lê Khánh Duy tạo task cho Nguyễn Mạnh Linh
  const task2 = await createTestTask('3', '5', 'Task của Lê Khánh Duy cho Nguyễn Mạnh Linh');
  console.log(`   ✅ Task 2: ${task2 ? task2.id : 'Failed'} - Lê Khánh Duy → Nguyễn Mạnh Linh`);

  // Nguyễn Mạnh Linh tạo task cho chính mình
  const task3 = await createTestTask('5', '5', 'Task của Nguyễn Mạnh Linh cho chính mình');
  console.log(`   ✅ Task 3: ${task3 ? task3.id : 'Failed'} - Nguyễn Mạnh Linh → Nguyễn Mạnh Linh`);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for data sync

  // 2. Test permissions cho từng user
  console.log('\n2. 🔍 Test permissions cho từng user...\n');

  for (const user of testUsers) {
    console.log(`👤 ${user.name} (${user.role}):`);

    const tasks = await getTasksForUser(user.id, user.role, user.team_id);
    console.log(`   📊 Thấy được ${tasks.length} tasks:`);

    tasks.forEach((task) => {
      const creator = testUsers.find((u) => u.id === task.user_id);
      const assignee = testUsers.find((u) => u.id === task.assignedTo);
      console.log(`      - ${task.title}`);
      console.log(`        Tạo bởi: ${creator ? creator.name : 'Unknown'}`);
      console.log(`        Giao cho: ${assignee ? assignee.name : 'Unknown'}`);
    });

    console.log('');
  }

  // 3. Kiểm tra logic phân quyền
  console.log('3. ✅ Kiểm tra logic phân quyền...\n');

  // Test Khổng Đức Mạnh (Retail Director)
  const directorTasks = await getTasksForUser('1', 'retail_director', '0');
  console.log(`🏢 Khổng Đức Mạnh (Retail Director): ${directorTasks.length} tasks`);
  console.log(`   Expected: Tất cả tasks của phòng bán lẻ`);

  // Test Lương Việt Anh (Team Leader nhóm 1)
  const leaderTasks = await getTasksForUser('2', 'team_leader', '1');
  console.log(`👥 Lương Việt Anh (Team Leader nhóm 1): ${leaderTasks.length} tasks`);
  console.log(`   Expected: Tasks được giao cho thành viên nhóm 1`);

  // Test Lê Khánh Duy (Employee nhóm 1)
  const employee1Tasks = await getTasksForUser('3', 'employee', '1');
  console.log(`👤 Lê Khánh Duy (Employee nhóm 1): ${employee1Tasks.length} tasks`);
  console.log(`   Expected: Chỉ tasks được giao cho mình`);

  // Test Nguyễn Mạnh Linh (Employee nhóm 2)
  const employee2Tasks = await getTasksForUser('5', 'employee', '2');
  console.log(`👤 Nguyễn Mạnh Linh (Employee nhóm 2): ${employee2Tasks.length} tasks`);
  console.log(`   Expected: Chỉ tasks được giao cho mình`);

  console.log('\n🎯 EXPECTED RESULTS:');
  console.log('- Lê Khánh Duy chỉ thấy task được giao cho mình');
  console.log('- Nguyễn Mạnh Linh chỉ thấy task được giao cho mình');
  console.log('- Lê Khánh Duy KHÔNG thấy task mình tạo cho Nguyễn Mạnh Linh');
  console.log('- Nguyễn Mạnh Linh KHÔNG thấy task của Lê Khánh Duy');
}

// Chạy test
testTaskPermissions().catch(console.error);
