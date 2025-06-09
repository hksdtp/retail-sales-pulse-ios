const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test tasks for Quản Thu Hà
const testTasks = [
  {
    title: 'Liên hệ đối tác mới - Dự án DEF',
    description: 'Liên hệ và tư vấn đối tác mới về dự án DEF tại Hà Nội',
    type: 'partner_new',
    status: 'todo',
    priority: 'high',
    date: '2024-12-25',
    time: '09:30',
    progress: 0,
    assignedTo: 'qgM8ogYQwu0T5zJUesfn', // Quản Thu Hà - REAL ID
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh tạo - REAL ID
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    isShared: false,
    isSharedWithTeam: false,
  },
  {
    title: 'Báo cáo sale tuần - Team 1',
    description: 'Tổng hợp báo cáo bán hàng tuần của team 1',
    type: 'report',
    status: 'in-progress',
    priority: 'normal',
    date: '2024-12-26',
    time: '15:00',
    progress: 25,
    assignedTo: 'qgM8ogYQwu0T5zJUesfn', // Quản Thu Hà - REAL ID
    user_id: 'qgM8ogYQwu0T5zJUesfn', // Quản Thu Hà tự tạo - REAL ID
    user_name: 'Quản Thu Hà',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    isShared: false,
    isSharedWithTeam: false,
  }
];

async function createTasksForThuHa() {
  console.log('🚀 Creating test tasks for Quản Thu Hà...');
  
  for (const task of testTasks) {
    try {
      console.log(`📝 Creating task: ${task.title} for Quản Thu Hà`);
      
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created task: ${task.title} (ID: ${result.data?.id})`);
      } else {
        console.error(`❌ Failed to create task: ${task.title}`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creating task: ${task.title}`, error.message);
    }
  }
  
  console.log('🎉 Test tasks for Quản Thu Hà completed!');
}

// Run the script
createTasksForThuHa().catch(console.error);
