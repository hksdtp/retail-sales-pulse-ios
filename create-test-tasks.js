import admin from 'firebase-admin';

// Initialize Firebase Admin với project appqlgd
admin.initializeApp({
  projectId: 'appqlgd'
});

const db = admin.firestore();

async function createTestTasks() {
  console.log('🔧 Creating test tasks with different dates...');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const testTasks = [
    {
      id: `test_today_${Date.now()}`,
      title: '📅 Task created TODAY',
      description: 'This task was created today for testing date filter',
      type: 'daily',
      status: 'todo',
      priority: 'high',
      progress: 0,
      date: today.toISOString().split('T')[0], // YYYY-MM-DD format
      created_at: today.toISOString(),
      user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
      user_name: 'Giám đốc Bán lẻ',
      assignedTo: 'Ve7sGRnMoRvT1E0VL5Ds',
      teamId: '0',
      location: 'Hà Nội',
      time: '09:00',
      isShared: false,
      isSharedWithTeam: false,
      extraAssignees: ''
    },
    {
      id: `test_yesterday_${Date.now()}`,
      title: '📅 Task created YESTERDAY',
      description: 'This task was created yesterday for testing date filter',
      type: 'daily',
      status: 'in-progress',
      priority: 'normal',
      progress: 50,
      date: yesterday.toISOString().split('T')[0],
      created_at: yesterday.toISOString(),
      user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
      user_name: 'Giám đốc Bán lẻ',
      assignedTo: 'Ve7sGRnMoRvT1E0VL5Ds',
      teamId: '0',
      location: 'Hà Nội',
      time: '10:00',
      isShared: false,
      isSharedWithTeam: false,
      extraAssignees: ''
    },
    {
      id: `test_tomorrow_${Date.now()}`,
      title: '📅 Task created TOMORROW',
      description: 'This task was created tomorrow for testing date filter',
      type: 'daily',
      status: 'todo',
      priority: 'low',
      progress: 0,
      date: tomorrow.toISOString().split('T')[0],
      created_at: tomorrow.toISOString(),
      user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
      user_name: 'Giám đốc Bán lẻ',
      assignedTo: 'Ve7sGRnMoRvT1E0VL5Ds',
      teamId: '0',
      location: 'Hà Nội',
      time: '11:00',
      isShared: false,
      isSharedWithTeam: false,
      extraAssignees: ''
    },
    {
      id: `test_lastweek_${Date.now()}`,
      title: '📅 Task created LAST WEEK',
      description: 'This task was created last week for testing date filter',
      type: 'weekly',
      status: 'completed',
      priority: 'normal',
      progress: 100,
      date: lastWeek.toISOString().split('T')[0],
      created_at: lastWeek.toISOString(),
      user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
      user_name: 'Giám đốc Bán lẻ',
      assignedTo: 'Ve7sGRnMoRvT1E0VL5Ds',
      teamId: '0',
      location: 'Hà Nội',
      time: '14:00',
      isShared: false,
      isSharedWithTeam: false,
      extraAssignees: ''
    }
  ];
  
  try {
    for (const task of testTasks) {
      await db.collection('tasks').doc(task.id).set(task);
      console.log(`✅ Created test task: ${task.title} (${task.created_at.split('T')[0]})`);
    }
    
    console.log('🎉 All test tasks created successfully!');
    console.log('\n📊 Test data summary:');
    console.log(`- TODAY (${today.toISOString().split('T')[0]}): 1 task`);
    console.log(`- YESTERDAY (${yesterday.toISOString().split('T')[0]}): 1 task`);
    console.log(`- TOMORROW (${tomorrow.toISOString().split('T')[0]}): 1 task`);
    console.log(`- LAST WEEK (${lastWeek.toISOString().split('T')[0]}): 1 task`);
    
  } catch (error) {
    console.error('❌ Error creating test tasks:', error);
  }
}

createTestTasks().then(() => {
  console.log('✅ Test task creation completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
