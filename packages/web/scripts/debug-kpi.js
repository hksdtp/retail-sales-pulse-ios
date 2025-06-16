/**
 * Debug script for KPI Dashboard
 * Run this in browser console to debug KPI calculation issues
 */

console.log('🔍 Starting KPI Debug...');

// Function to debug tasks data
function debugTasksData() {
  console.log('\n📋 === TASKS DATA DEBUG ===');
  
  // Get tasks from localStorage
  const tasksData = localStorage.getItem('tasks');
  if (!tasksData) {
    console.log('❌ No tasks found in localStorage');
    return null;
  }
  
  const tasks = JSON.parse(tasksData);
  console.log(`✅ Found ${tasks.length} tasks in localStorage`);
  
  // Analyze task types
  const taskTypes = {};
  const taskStatuses = {};
  
  tasks.forEach(task => {
    // Count by type
    if (taskTypes[task.type]) {
      taskTypes[task.type]++;
    } else {
      taskTypes[task.type] = 1;
    }
    
    // Count by status
    if (taskStatuses[task.status]) {
      taskStatuses[task.status]++;
    } else {
      taskStatuses[task.status] = 1;
    }
  });
  
  console.log('\n📊 Task Types Distribution:');
  Object.entries(taskTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\n📈 Task Status Distribution:');
  Object.entries(taskStatuses).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  // Check for KPI relevant types
  console.log('\n🎯 KPI Relevant Tasks:');
  const kpiTypes = ['architect_new', 'architect_old', 'partner_new', 'partner_old', 'client_new', 'client_old'];
  kpiTypes.forEach(type => {
    const count = tasks.filter(t => t.type === type).length;
    const completed = tasks.filter(t => t.type === type && t.status === 'completed').length;
    console.log(`  ${type}: ${count} total, ${completed} completed`);
  });
  
  return tasks;
}

// Function to debug current user
function debugCurrentUser() {
  console.log('\n👤 === CURRENT USER DEBUG ===');
  
  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    console.log('❌ No current user found in localStorage');
    return null;
  }
  
  const user = JSON.parse(userData);
  console.log('✅ Current user:', {
    name: user.name,
    role: user.role,
    location: user.location,
    team_id: user.team_id,
    id: user.id
  });
  
  return user;
}

// Function to debug dashboard data
function debugDashboardData() {
  console.log('\n📊 === DASHBOARD DATA DEBUG ===');
  
  // Try to access dashboard sync service
  if (typeof window.dashboardSyncService !== 'undefined') {
    console.log('✅ Dashboard sync service found');
    
    const user = debugCurrentUser();
    const tasks = debugTasksData();
    
    if (user && tasks) {
      try {
        const dashboardData = window.dashboardSyncService.getSyncedDashboardData(user, tasks);
        console.log('✅ Dashboard data generated:', dashboardData);
        
        console.log('\n🎯 KPI Cards:');
        dashboardData.kpiCards.forEach((card, index) => {
          console.log(`  ${index + 1}. ${card.title}: ${card.value} (was ${card.oldValue}, change: ${card.change}%)`);
          if (card.details) {
            console.log(`     Details: new=${card.details.new}, old=${card.details.old}, total=${card.details.total}`);
          }
        });
        
        console.log('\n📈 Summary:');
        console.log(`  Total Tasks: ${dashboardData.summary.totalTasks}`);
        console.log(`  Completed Tasks: ${dashboardData.summary.completedTasks}`);
        console.log(`  Completion Rate: ${dashboardData.summary.completionRate}%`);
        console.log(`  Total Sales: ${dashboardData.summary.totalSales}`);
        
        return dashboardData;
      } catch (error) {
        console.log('❌ Error generating dashboard data:', error);
      }
    }
  } else {
    console.log('❌ Dashboard sync service not found on window');
  }
  
  return null;
}

// Function to create test tasks
function createTestTasks() {
  console.log('\n🧪 === CREATING TEST TASKS ===');
  
  const testTasks = [
    {
      id: 'test-kts-1',
      title: 'Test KTS mới 1',
      description: 'Test architect new task',
      type: 'architect_new',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      progress: 100,
      userId: 'current-user',
      assignedTo: 'current-user',
      teamId: 'team-1',
      location: 'Hà Nội',
      created_at: new Date().toISOString()
    },
    {
      id: 'test-kts-2',
      title: 'Test KTS cũ 1',
      description: 'Test architect old task',
      type: 'architect_old',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      progress: 100,
      userId: 'current-user',
      assignedTo: 'current-user',
      teamId: 'team-1',
      location: 'Hà Nội',
      created_at: new Date().toISOString()
    },
    {
      id: 'test-partner-1',
      title: 'Test Đối tác mới 1',
      description: 'Test partner new task',
      type: 'partner_new',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      progress: 100,
      userId: 'current-user',
      assignedTo: 'current-user',
      teamId: 'team-1',
      location: 'Hà Nội',
      created_at: new Date().toISOString()
    },
    {
      id: 'test-client-1',
      title: 'Test Khách hàng mới 1',
      description: 'Test client new task',
      type: 'client_new',
      status: 'in-progress',
      date: new Date().toISOString().split('T')[0],
      progress: 50,
      userId: 'current-user',
      assignedTo: 'current-user',
      teamId: 'team-1',
      location: 'Hà Nội',
      created_at: new Date().toISOString()
    }
  ];
  
  // Get existing tasks
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
  // Add test tasks
  const allTasks = [...existingTasks, ...testTasks];
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  
  console.log(`✅ Added ${testTasks.length} test tasks`);
  console.log('🔄 Refresh the page to see updated KPI data');
  
  return testTasks;
}

// Function to clear test tasks
function clearTestTasks() {
  console.log('\n🧹 === CLEARING TEST TASKS ===');
  
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const filteredTasks = tasks.filter(task => !task.id.startsWith('test-'));
  
  localStorage.setItem('tasks', JSON.stringify(filteredTasks));
  
  console.log(`✅ Removed ${tasks.length - filteredTasks.length} test tasks`);
  console.log('🔄 Refresh the page to see updated data');
}

// Main debug function
function runKpiDebug() {
  console.log('🚀 Running complete KPI debug...\n');
  
  const user = debugCurrentUser();
  const tasks = debugTasksData();
  const dashboardData = debugDashboardData();
  
  console.log('\n💡 === RECOMMENDATIONS ===');
  
  if (!user) {
    console.log('❌ Please login first');
  } else if (!tasks || tasks.length === 0) {
    console.log('❌ No tasks found. Create some tasks first or run createTestTasks()');
  } else {
    const kpiRelevantTasks = tasks.filter(t => 
      ['architect_new', 'architect_old', 'partner_new', 'partner_old', 'client_new', 'client_old'].includes(t.type)
    );
    
    if (kpiRelevantTasks.length === 0) {
      console.log('⚠️ No KPI-relevant tasks found. Run createTestTasks() to add some test data');
    } else {
      console.log(`✅ Found ${kpiRelevantTasks.length} KPI-relevant tasks`);
      
      if (dashboardData && dashboardData.kpiCards.length > 0) {
        console.log('✅ KPI calculation working correctly');
      } else {
        console.log('❌ KPI calculation not working. Check console for errors');
      }
    }
  }
  
  console.log('\n🛠️ === AVAILABLE FUNCTIONS ===');
  console.log('- runKpiDebug() - Run complete debug');
  console.log('- debugTasksData() - Debug tasks data');
  console.log('- debugCurrentUser() - Debug current user');
  console.log('- debugDashboardData() - Debug dashboard data');
  console.log('- createTestTasks() - Create test tasks for KPI');
  console.log('- clearTestTasks() - Remove test tasks');
}

// Export functions to window for manual use
window.kpiDebug = {
  runKpiDebug,
  debugTasksData,
  debugCurrentUser,
  debugDashboardData,
  createTestTasks,
  clearTestTasks
};

// Auto-run debug
runKpiDebug();
