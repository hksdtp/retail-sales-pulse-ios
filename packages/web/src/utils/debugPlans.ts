// Debug utility for checking plans in localStorage
export const debugPlans = {
  // Check all plans in localStorage
  checkAllPlans: () => {
    console.log('🔍 Checking all plans in localStorage...');
    
    const allKeys = Object.keys(localStorage);
    const planKeys = allKeys.filter(key => key.startsWith('personal_plans_'));
    
    console.log('📋 Found plan keys:', planKeys);
    
    planKeys.forEach(key => {
      const userId = key.replace('personal_plans_', '');
      const plans = JSON.parse(localStorage.getItem(key) || '[]');
      console.log(`👤 User ${userId}: ${plans.length} plans`, plans);
    });
  },

  // Check plans for specific user
  checkUserPlans: (userId: string) => {
    console.log(`🔍 Checking plans for user: ${userId}`);
    
    const key = `personal_plans_${userId}`;
    const plans = JSON.parse(localStorage.getItem(key) || '[]');
    
    console.log(`📋 Found ${plans.length} plans:`, plans);
    
    // Group by month
    const plansByMonth: Record<string, any[]> = {};
    plans.forEach((plan: any) => {
      const date = new Date(plan.startDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!plansByMonth[monthKey]) {
        plansByMonth[monthKey] = [];
      }
      plansByMonth[monthKey].push(plan);
    });
    
    console.log('📅 Plans by month:', plansByMonth);
    
    return plans;
  },

  // Clear all plans (for testing)
  clearAllPlans: () => {
    console.log('🗑️ Clearing all plans...');
    
    const allKeys = Object.keys(localStorage);
    const planKeys = allKeys.filter(key => key.startsWith('personal_plans_'));
    
    planKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    });
    
    console.log('✅ All plans cleared');
  },

  // Add test plan
  addTestPlan: (userId: string) => {
    console.log(`➕ Adding test plan for user: ${userId}`);
    
    const key = `personal_plans_${userId}`;
    const existingPlans = JSON.parse(localStorage.getItem(key) || '[]');
    
    const testPlan = {
      id: `test_plan_${Date.now()}`,
      userId,
      title: `Test Plan ${new Date().toLocaleTimeString()}`,
      description: 'This is a test plan created by debug utility',
      type: 'meeting',
      status: 'pending',
      priority: 'normal',
      startDate: new Date().toISOString().split('T')[0], // Today
      endDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      location: 'Test Location',
      notes: 'Test notes',
      participants: ['Test User'],
      creator: 'Debug Utility',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedPlans = [...existingPlans, testPlan];
    localStorage.setItem(key, JSON.stringify(updatedPlans));
    
    console.log('✅ Test plan added:', testPlan);
    
    // Trigger refresh
    if ((window as any).refreshModernCalendar) {
      (window as any).refreshModernCalendar();
    }
    
    return testPlan;
  },

  // Check localStorage size
  checkStorageSize: () => {
    let totalSize = 0;
    
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
    });
    
    console.log(`💾 localStorage total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    // Check plan-specific storage
    const planKeys = Object.keys(localStorage).filter(key => key.startsWith('personal_plans_'));
    let planSize = 0;
    
    planKeys.forEach(key => {
      const value = localStorage.getItem(key) || '';
      planSize += key.length + value.length;
    });
    
    console.log(`📋 Plans storage size: ${(planSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Plan keys: ${planKeys.length}`);
  }
};

// Expose to window for easy access in console
(window as any).debugPlans = debugPlans;

console.log('🔧 Debug utility loaded. Use debugPlans.checkAllPlans() in console to check plans.');
