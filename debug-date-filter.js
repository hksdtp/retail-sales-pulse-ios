// Debug date filter logic
console.log('🔍 Testing date filter logic...');

// Mock task data với các ngày khác nhau
const mockTasks = [
  {
    id: 'task1',
    title: 'Task Today',
    created_at: new Date().toISOString(), // Hôm nay
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'task2', 
    title: 'Task Yesterday',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hôm qua
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'task3',
    title: 'Task Tomorrow',
    created_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ngày mai
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'task4',
    title: 'Task Last Week',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Tuần trước
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

// Copy logic từ TaskFilters.ts
const filterTasksByDate = (tasks, dateFilter = 'today') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('🔍 DEBUG filterTasksByDate:', {
    dateFilter,
    totalTasks: tasks.length,
    todayTimestamp: today.getTime(),
    todayISO: today.toISOString()
  });

  return tasks.filter(task => {
    // Sử dụng created_at thay vì date để filter theo ngày tạo task
    const createdAtField = task.created_at || task.date;
    if (!createdAtField) {
      console.log('❌ Task missing created_at and date:', task.id);
      return false;
    }

    // Parse ngày tạo task
    const taskCreatedDate = new Date(createdAtField);
    taskCreatedDate.setHours(0, 0, 0, 0);

    console.log('📅 Task date comparison:', {
      taskId: task.id,
      taskTitle: task.title,
      createdAtField,
      taskCreatedDate: taskCreatedDate.toISOString(),
      taskTimestamp: taskCreatedDate.getTime()
    });

    switch (dateFilter) {
      case 'today':
        const isToday = taskCreatedDate.getTime() === today.getTime();
        console.log(`📅 Today filter for ${task.id}:`, isToday);
        return isToday;
        
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = taskCreatedDate.getTime() === yesterday.getTime();
        console.log(`📅 Yesterday filter for ${task.id}:`, isYesterday);
        return isYesterday;
        
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = taskCreatedDate.getTime() === tomorrow.getTime();
        console.log(`📅 Tomorrow filter for ${task.id}:`, isTomorrow);
        return isTomorrow;
        
      case 'all':
        console.log(`📅 All filter for ${task.id}: true`);
        return true;
        
      default:
        const isDefaultToday = taskCreatedDate.getTime() === today.getTime();
        console.log(`📅 Default (today) filter for ${task.id}:`, isDefaultToday);
        return isDefaultToday; // Default to today
    }
  });
};

// Test các filter
console.log('\n=== TEST TODAY FILTER ===');
const todayTasks = filterTasksByDate(mockTasks, 'today');
console.log('Result:', todayTasks.map(t => t.title));

console.log('\n=== TEST YESTERDAY FILTER ===');
const yesterdayTasks = filterTasksByDate(mockTasks, 'yesterday');
console.log('Result:', yesterdayTasks.map(t => t.title));

console.log('\n=== TEST TOMORROW FILTER ===');
const tomorrowTasks = filterTasksByDate(mockTasks, 'tomorrow');
console.log('Result:', tomorrowTasks.map(t => t.title));

console.log('\n=== TEST ALL FILTER ===');
const allTasks = filterTasksByDate(mockTasks, 'all');
console.log('Result:', allTasks.map(t => t.title));

console.log('\n🎯 Expected results:');
console.log('- Today: ["Task Today"]');
console.log('- Yesterday: ["Task Yesterday"]');
console.log('- Tomorrow: ["Task Tomorrow"]');
console.log('- All: ["Task Today", "Task Yesterday", "Task Tomorrow", "Task Last Week"]');
