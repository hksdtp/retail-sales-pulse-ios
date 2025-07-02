import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD15K9FMm2J0Hq4yeacqL9fQ0TNK7NI7Lo",
  authDomain: "appqlgd.firebaseapp.com",
  projectId: "appqlgd",
  storageBucket: "appqlgd.appspot.com",
  messagingSenderId: "873528436407",
  appId: "1:873528436407:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Copy updated logic từ TaskFilters.ts
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

    // Parse ngày tạo task - handle multiple formats
    let taskCreatedDate;
    try {
      if (createdAtField && typeof createdAtField === 'object') {
        // Handle Firestore Timestamp
        if (createdAtField.toDate && typeof createdAtField.toDate === 'function') {
          taskCreatedDate = createdAtField.toDate();
        }
        // Handle plain object with _seconds and _nanoseconds
        else if (createdAtField._seconds && typeof createdAtField._seconds === 'number') {
          taskCreatedDate = new Date(createdAtField._seconds * 1000);
        }
        // Handle other object formats
        else {
          taskCreatedDate = new Date(createdAtField);
        }
      } else {
        // Handle string format
        taskCreatedDate = new Date(createdAtField);
      }
      
      // Validate parsed date
      if (isNaN(taskCreatedDate.getTime())) {
        console.log('❌ Invalid date for task:', task.id, createdAtField);
        return false;
      }
      
      taskCreatedDate.setHours(0, 0, 0, 0);
    } catch (error) {
      console.log('❌ Error parsing date for task:', task.id, error.message);
      return false;
    }

    console.log('📅 Task date comparison:', {
      taskId: task.id,
      taskTitle: task.title,
      createdAtField: typeof createdAtField === 'object' ? 'Timestamp object' : createdAtField,
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

async function testRealDateFilter() {
  console.log('🔍 Testing date filter with real Firebase data...');
  
  try {
    const tasksRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📋 Loaded ${tasks.length} tasks from Firebase`);
    
    // Test với 5 tasks đầu tiên
    const testTasks = tasks.slice(0, 5);
    
    console.log('\n=== TEST TODAY FILTER ===');
    const todayTasks = filterTasksByDate(testTasks, 'today');
    console.log('Result:', todayTasks.map(t => `${t.title} (${t.id})`));
    
    console.log('\n=== TEST YESTERDAY FILTER ===');
    const yesterdayTasks = filterTasksByDate(testTasks, 'yesterday');
    console.log('Result:', yesterdayTasks.map(t => `${t.title} (${t.id})`));
    
    console.log('\n=== TEST ALL FILTER ===');
    const allTasks = filterTasksByDate(testTasks, 'all');
    console.log('Result:', allTasks.map(t => `${t.title} (${t.id})`));
    
    // Thống kê theo ngày
    console.log('\n📊 Task distribution by date:');
    const dateGroups = {};
    tasks.forEach(task => {
      const createdAtField = task.created_at || task.date;
      if (createdAtField) {
        let taskDate;
        try {
          if (createdAtField && typeof createdAtField === 'object') {
            if (createdAtField.toDate && typeof createdAtField.toDate === 'function') {
              taskDate = createdAtField.toDate();
            } else if (createdAtField._seconds && typeof createdAtField._seconds === 'number') {
              taskDate = new Date(createdAtField._seconds * 1000);
            } else {
              taskDate = new Date(createdAtField);
            }
          } else {
            taskDate = new Date(createdAtField);
          }
          
          if (!isNaN(taskDate.getTime())) {
            const dateStr = taskDate.toISOString().split('T')[0];
            dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1;
          }
        } catch (error) {
          console.log('Error parsing date for stats:', task.id);
        }
      }
    });
    
    Object.entries(dateGroups)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} tasks`);
      });
    
  } catch (error) {
    console.error('❌ Error testing date filter:', error);
  }
}

testRealDateFilter().then(() => {
  console.log('✅ Real date filter test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
