// Manual test script để kiểm tra auto-sync
console.log('🧪 MANUAL AUTO-SYNC TEST');
console.log('========================');

// Function để check localStorage
function checkLocalStorage() {
  const userId = '1'; // Khổng Đức Mạnh
  const planKey = `personal_plans_${userId}`;
  const taskKey = `user_tasks_${userId}`;
  
  const plans = JSON.parse(localStorage.getItem(planKey) || '[]');
  const tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
  
  console.log('📋 CURRENT DATA:');
  console.log(`- Plans: ${plans.length}`);
  console.log(`- Tasks: ${tasks.length}`);
  
  if (plans.length > 0) {
    console.log('\n📝 PLANS:');
    plans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.title} (${plan.startDate})`);
    });
  }
  
  if (tasks.length > 0) {
    console.log('\n✅ TASKS:');
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} (${task.date})`);
    });
  }
  
  return { plans, tasks };
}

// Function để test manual sync
async function testManualSync() {
  console.log('\n🔄 TESTING MANUAL SYNC...');
  
  if (window.autoPlanSyncService) {
    try {
      const syncedCount = await window.autoPlanSyncService.manualSync('1');
      console.log(`✅ Manual sync completed: ${syncedCount} tasks synced`);
      
      // Check data after sync
      console.log('\n📊 DATA AFTER SYNC:');
      checkLocalStorage();
      
      return syncedCount;
    } catch (error) {
      console.error('❌ Manual sync error:', error);
      return 0;
    }
  } else {
    console.log('❌ AutoPlanSyncService not available');
    return 0;
  }
}

// Function để tạo test plan
function createTestPlan() {
  console.log('\n🆕 CREATING TEST PLAN...');
  
  const userId = '1';
  const planKey = `personal_plans_${userId}`;
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);
  
  const testPlan = {
    id: `plan_${Date.now()}`,
    title: 'Manual Test Plan',
    description: 'Test plan for manual auto-sync verification',
    type: 'client_new',
    status: 'pending',
    priority: 'high',
    startDate: today,
    endDate: today,
    startTime: currentTime,
    endTime: currentTime,
    location: 'Test Location',
    notes: 'Manual test notes',
    participants: [],
    creator: 'Khổng Đức Mạnh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const existingPlans = JSON.parse(localStorage.getItem(planKey) || '[]');
  existingPlans.push(testPlan);
  localStorage.setItem(planKey, JSON.stringify(existingPlans));
  
  console.log(`✅ Created test plan: ${testPlan.title}`);
  return testPlan;
}

// Main test function
async function runFullTest() {
  console.log('\n🚀 RUNNING FULL AUTO-SYNC TEST');
  console.log('================================');
  
  // Step 1: Check initial state
  console.log('\n1️⃣ INITIAL STATE:');
  checkLocalStorage();
  
  // Step 2: Create test plan
  console.log('\n2️⃣ CREATE TEST PLAN:');
  createTestPlan();
  checkLocalStorage();
  
  // Step 3: Test manual sync
  console.log('\n3️⃣ TEST MANUAL SYNC:');
  const syncedCount = await testManualSync();
  
  // Step 4: Final verification
  console.log('\n4️⃣ FINAL VERIFICATION:');
  const finalData = checkLocalStorage();
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log(`- Plans created: ${finalData.plans.length}`);
  console.log(`- Tasks synced: ${syncedCount}`);
  console.log(`- Total tasks: ${finalData.tasks.length}`);
  
  if (syncedCount > 0 && finalData.tasks.length > 0) {
    console.log('🎉 AUTO-SYNC TEST PASSED!');
  } else {
    console.log('❌ AUTO-SYNC TEST FAILED!');
  }
}

// Expose functions globally
window.checkLocalStorage = checkLocalStorage;
window.testManualSync = testManualSync;
window.createTestPlan = createTestPlan;
window.runFullTest = runFullTest;

console.log('\n🔧 FUNCTIONS AVAILABLE:');
console.log('- checkLocalStorage()');
console.log('- testManualSync()');
console.log('- createTestPlan()');
console.log('- runFullTest()');
console.log('\nRun: runFullTest() to test everything');
