const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Test task for Nguyễn Mạnh Linh to test KPI sync
const testTask = {
  title: 'Test KPI - Liên hệ KTS mới',
  description: 'Task test để kiểm tra KPI Dashboard sync cho Nguyễn Mạnh Linh',
  type: 'architect_new',
  status: 'completed', // Completed để test KPI
  priority: 'normal',
  date: '2024-12-20',
  time: '10:00',
  progress: 100,
  assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh - REAL ID
  user_id: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh tự tạo
  user_name: 'Nguyễn Mạnh Linh',
  team_id: '2',
  teamId: '2',
  location: 'hanoi',
  isShared: false,
  isSharedWithTeam: false,
};

async function createTestTaskForLinh() {
  console.log('🚀 Creating test task for Nguyễn Mạnh Linh KPI testing...');
  
  try {
    console.log('📝 Creating task:', testTask.title);
    
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTask),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Created task: ${testTask.title}`);
      console.log(`📋 Task details:`, result.data);
      console.log(`🆔 Task ID: ${result.data?.id}`);
      console.log(`📊 This should appear in KPI Dashboard for Nguyễn Mạnh Linh`);
      
      return result.data;
    } else {
      console.error(`❌ Failed to create task: ${testTask.title}`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating task: ${testTask.title}`, error.message);
    return null;
  }
}

// Run the script
createTestTaskForLinh()
  .then(taskData => {
    if (taskData) {
      console.log('\n🎉 Test task creation completed!');
      console.log('\n📝 Next steps:');
      console.log('1. Login as Nguyễn Mạnh Linh (manhlinh@example.com)');
      console.log('2. Check Dashboard for KPI updates');
      console.log('3. Verify task appears in personal tasks');
      console.log('4. Check if KPI shows 1 completed KTS task');
    }
  })
  .catch(console.error);
