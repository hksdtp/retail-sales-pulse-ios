const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test tasks for debugging member view
const testTasks = [
  {
    title: 'Liên hệ KTS mới - Dự án ABC',
    description: 'Liên hệ và tư vấn cho KTS về dự án ABC tại Hà Nội',
    type: 'architect_new',
    status: 'todo',
    priority: 'high',
    date: '2024-12-20',
    time: '09:00',
    progress: 0,
    assignedTo: '5', // Nguyễn Mạnh Linh
    user_id: '1', // Khổng Đức Mạnh tạo
    user_name: 'Khổng Đức Mạnh',
    team_id: '2',
    teamId: '2',
    location: 'Hà Nội',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Báo cáo tuần - Nhóm 2',
    description: 'Tổng hợp báo cáo hoạt động tuần của nhóm 2',
    type: 'report',
    status: 'in-progress',
    priority: 'normal',
    date: '2024-12-21',
    time: '14:00',
    progress: 50,
    assignedTo: '5', // Nguyễn Mạnh Linh
    user_id: '5', // Nguyễn Mạnh Linh tự tạo
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'Hà Nội',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Họp nhóm hàng tuần',
    description: 'Họp nhóm thảo luận kế hoạch tuần tới',
    type: 'meeting',
    status: 'todo',
    priority: 'normal',
    date: '2024-12-22',
    time: '10:00',
    progress: 0,
    assignedTo: '3', // Lê Khánh Duy
    user_id: '2', // Lương Việt Anh tạo
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'Hà Nội',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Kiểm tra kho hàng',
    description: 'Kiểm tra và cập nhật tình trạng kho hàng',
    type: 'inventory',
    status: 'completed',
    priority: 'low',
    date: '2024-12-19',
    time: '16:00',
    progress: 100,
    assignedTo: '3', // Lê Khánh Duy
    user_id: '3', // Lê Khánh Duy tự tạo
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'Hà Nội',
    isShared: false,
    isSharedWithTeam: false,
  }
];

async function createTestTasks() {
  console.log('🚀 Creating test tasks...');

  for (let i = 0; i < testTasks.length; i++) {
    const task = testTasks[i];

    try {
      console.log(`📝 Creating task ${i + 1}/${testTasks.length}: ${task.title}`);

      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Created: ${task.title} (assigned to: ${task.assignedTo})`);
      } else {
        console.error(`❌ Failed to create: ${task.title}`, result.error);
      }

      // Delay để tránh rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error creating task: ${task.title}`, error.message);
    }
  }

  console.log('🎉 Test tasks creation completed!');
}

// Run the script
createTestTasks().catch(console.error);
