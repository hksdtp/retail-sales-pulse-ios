import { personalPlanService } from '@/services/PersonalPlanService';
import { planToTaskSyncService } from '@/services/PlanToTaskSyncService';

// Test utility để kiểm tra tính năng Plan to Task Sync
export const testPlanToTaskSync = {
  // Tạo test plan đã đến hạn
  createTestPlan: (userId: string, minutesAgo: number = 5) => {
    const now = new Date();
    const startTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 giờ sau

    const testPlan = personalPlanService.addPlan(userId, {
      title: `Test Plan - ${new Date().toLocaleTimeString()}`,
      description: 'Đây là kế hoạch test để kiểm tra tính năng auto-sync',
      type: 'meeting',
      status: 'pending',
      priority: 'high',
      startDate: startTime.toISOString().split('T')[0],
      endDate: endTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      location: 'Phòng họp A',
      notes: 'Test plan được tạo tự động',
      participants: [userId],
      creator: userId
    });

    console.log('✅ Đã tạo test plan:', testPlan);
    return testPlan;
  },

  // Tạo plan sẽ đến hạn trong tương lai
  createFuturePlan: (userId: string, minutesFromNow: number = 30) => {
    const now = new Date();
    const startTime = new Date(now.getTime() + minutesFromNow * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const futurePlan = personalPlanService.addPlan(userId, {
      title: `Future Plan - ${new Date().toLocaleTimeString()}`,
      description: 'Kế hoạch sẽ đến hạn trong tương lai',
      type: 'client_meeting',
      status: 'pending',
      priority: 'medium',
      startDate: startTime.toISOString().split('T')[0],
      endDate: endTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      location: 'Văn phòng khách hàng',
      notes: 'Future plan để test',
      participants: [userId],
      creator: userId
    });

    console.log('✅ Đã tạo future plan:', futurePlan);
    return futurePlan;
  },

  // Test manual sync
  testManualSync: async (userId: string) => {
    console.log('🧪 Bắt đầu test manual sync...');
    
    try {
      const result = await planToTaskSyncService.manualSync(userId);
      console.log('✅ Manual sync result:', result);
      return result;
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      throw error;
    }
  },

  // Kiểm tra stats
  checkStats: () => {
    const stats = planToTaskSyncService.getStats();
    console.log('📊 Current sync stats:', stats);
    return stats;
  },

  // Kiểm tra conversions
  checkConversions: () => {
    const conversions = planToTaskSyncService.getConversions();
    console.log('🔄 Conversion history:', conversions);
    return conversions;
  },

  // Test đầy đủ
  runFullTest: async (userId: string) => {
    console.log('🧪 Bắt đầu full test cho user:', userId);
    
    try {
      // 1. Tạo test plans
      console.log('1️⃣ Tạo test plans...');
      const duePlan = testPlanToTaskSync.createTestPlan(userId, 5);
      const futurePlan = testPlanToTaskSync.createFuturePlan(userId, 30);
      
      // 2. Kiểm tra plans đã tạo
      console.log('2️⃣ Kiểm tra plans đã tạo...');
      const userPlans = personalPlanService.getUserPlans(userId);
      console.log(`📋 User có ${userPlans.length} plans`);
      
      // 3. Kiểm tra due plans
      console.log('3️⃣ Kiểm tra due plans...');
      const duePlans = personalPlanService.getDuePlans(userId);
      console.log(`⏰ Có ${duePlans.length} plans đã đến hạn`);
      
      // 4. Test manual sync
      console.log('4️⃣ Test manual sync...');
      const syncResult = await testPlanToTaskSync.testManualSync(userId);
      
      // 5. Kiểm tra kết quả
      console.log('5️⃣ Kiểm tra kết quả...');
      const stats = testPlanToTaskSync.checkStats();
      const conversions = testPlanToTaskSync.checkConversions();
      
      // 6. Kiểm tra plans sau sync
      console.log('6️⃣ Kiểm tra plans sau sync...');
      const plansAfterSync = personalPlanService.getUserPlans(userId);
      const completedPlans = plansAfterSync.filter(p => p.status === 'completed');
      console.log(`✅ Có ${completedPlans.length} plans đã completed`);
      
      const testResult = {
        success: true,
        duePlan,
        futurePlan,
        syncResult,
        stats,
        conversions,
        plansAfterSync: plansAfterSync.length,
        completedPlans: completedPlans.length
      };
      
      console.log('🎉 Full test completed successfully:', testResult);
      return testResult;
      
    } catch (error) {
      console.error('❌ Full test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Cleanup test data
  cleanup: (userId: string) => {
    console.log('🧹 Cleaning up test data...');
    personalPlanService.clearUserData(userId);
    planToTaskSyncService.resetStats();
    console.log('✅ Cleanup completed');
  }
};

// Export để sử dụng trong console
(window as any).testPlanToTaskSync = testPlanToTaskSync;
