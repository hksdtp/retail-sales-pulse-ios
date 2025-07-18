/**
 * Comprehensive Auto Sync Service
 * Quản lý tất cả các auto sync services để đảm bảo dữ liệu luôn được đồng bộ
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

import { autoPlanSyncService } from './AutoPlanSyncService';
import { LocalToSupabaseAutoSync } from './LocalToSupabaseAutoSync';
import { planToTaskSyncService } from './PlanToTaskSyncService';

export interface ComprehensiveSyncStatus {
  planSync: {
    isRunning: boolean;
    lastSync: string | null;
    interval: number;
  };
  localToSupabase: {
    isRunning: boolean;
    lastSync: string | null;
  };
  planToTask: {
    isRunning: boolean;
    lastSync: string | null;
    interval: number;
  };
  overall: {
    allServicesRunning: boolean;
    healthScore: number;
  };
}

class ComprehensiveAutoSyncService {
  private static instance: ComprehensiveAutoSyncService;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 60000; // Check every minute
  
  private localToSupabaseSync: LocalToSupabaseAutoSync;

  private constructor() {
    // autoPlanSyncService and planToTaskSyncService are already singleton instances
    this.localToSupabaseSync = LocalToSupabaseAutoSync.getInstance();
  }

  public static getInstance(): ComprehensiveAutoSyncService {
    if (!ComprehensiveAutoSyncService.instance) {
      ComprehensiveAutoSyncService.instance = new ComprehensiveAutoSyncService();
    }
    return ComprehensiveAutoSyncService.instance;
  }

  /**
   * Khởi động tất cả auto sync services
   */
  public startAllAutoSyncServices(userId: string, userName: string): void {

    try {
      // 1. Start Auto Plan Sync (30 seconds interval)
      console.log('🔄 Starting Auto Plan Sync Service...');
      autoPlanSyncService.startAutoSync(userId);
      
      // 2. Start Plan to Task Sync (1 minute interval)
      
      planToTaskSyncService.startAutoSync(1); // 1 minute
      
      // 3. Trigger initial Local to Supabase sync
      console.log('☁️ Triggering initial Local to Supabase sync...');
      this.localToSupabaseSync.autoSyncOnLogin(userId, userName).catch(error => {
        console.warn('⚠️ Initial local to Supabase sync failed:', error);
      });
      
      // 4. Start health monitoring
      this.startHealthMonitoring(userId, userName);

      // 5. Expose to window for debugging
      this.exposeToWindow();
      
    } catch (error) {
      console.error('❌ Error starting auto sync services:', error);
    }
  }

  /**
   * Dừng tất cả auto sync services
   */
  public stopAllAutoSyncServices(): void {
    console.log('⏹️ Stopping all auto sync services...');
    
    try {
      autoPlanSyncService.stopAutoSync();
      planToTaskSyncService.stopAutoSync();
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

    } catch (error) {
      console.error('❌ Error stopping auto sync services:', error);
    }
  }

  /**
   * Bắt đầu health monitoring
   */
  private startHealthMonitoring(userId: string, userName: string): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck(userId, userName);
    }, this.HEALTH_CHECK_INTERVAL);

    console.log('🏥 Health monitoring started');
  }

  /**
   * Thực hiện health check và restart services nếu cần
   */
  private async performHealthCheck(userId: string, userName: string): Promise<void> {
    try {
      const status = this.getSyncStatus();
      console.log('🏥 Health check:', status);

      // Restart services if they're not running
      if (!status.overall.allServicesRunning) {
        console.log('⚠️ Some services not running, attempting restart...');
        
        // Restart Auto Plan Sync if needed
        if (!status.planSync.isRunning) {
          console.log('🔄 Restarting Auto Plan Sync...');
          autoPlanSyncService.startAutoSync(userId);
        }
        
        // Restart Plan to Task Sync if needed
        if (!status.planToTask.isRunning) {
          
          planToTaskSyncService.startAutoSync(1);
        }
        
        // Trigger Local to Supabase sync if needed
        if (!status.localToSupabase.isRunning) {
          console.log('☁️ Triggering Local to Supabase sync...');
          this.localToSupabaseSync.autoSyncOnLogin(userId, userName).catch(error => {
            console.warn('⚠️ Health check sync failed:', error);
          });
        }
      }

      // Log health score
      if (status.overall.healthScore < 80) {
        console.warn('⚠️ Low health score:', status.overall.healthScore);
      }

    } catch (error) {
      console.error('❌ Error in health check:', error);
    }
  }

  /**
   * Lấy trạng thái tổng hợp của tất cả sync services
   */
  public getSyncStatus(): ComprehensiveSyncStatus {
    try {
      // Get individual service statuses
      const planSyncStatus = autoPlanSyncService.getSyncStatus();
      const localToSupabaseStatus = this.localToSupabaseSync.getSyncStatus();
      const planToTaskStatus = planToTaskSyncService.getSyncStatus();

      const status: ComprehensiveSyncStatus = {
        planSync: {
          isRunning: planSyncStatus.isRunning,
          lastSync: planSyncStatus.lastSyncTime || null,
          interval: 30000 // 30 seconds
        },
        localToSupabase: {
          isRunning: localToSupabaseStatus.isRunning,
          lastSync: null // This service doesn't track last sync time
        },
        planToTask: {
          isRunning: planToTaskStatus.isRunning,
          lastSync: planToTaskStatus.lastSyncTime || null,
          interval: 60000 // 1 minute
        },
        overall: {
          allServicesRunning: false,
          healthScore: 0
        }
      };

      // Calculate overall status
      const runningServices = [
        status.planSync.isRunning,
        status.planToTask.isRunning
        // Note: localToSupabase runs on-demand, not continuously
      ].filter(Boolean).length;

      const totalServices = 2; // planSync + planToTask (localToSupabase is on-demand)
      status.overall.allServicesRunning = runningServices === totalServices;
      status.overall.healthScore = Math.round((runningServices / totalServices) * 100);

      return status;
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        planSync: { isRunning: false, lastSync: null, interval: 30000 },
        localToSupabase: { isRunning: false, lastSync: null },
        planToTask: { isRunning: false, lastSync: null, interval: 60000 },
        overall: { allServicesRunning: false, healthScore: 0 }
      };
    }
  }

  /**
   * Trigger manual sync for all services
   */
  public async triggerManualSyncAll(userId: string, userName: string): Promise<{
    planSync: number;
    localToSupabase: any;
    planToTask: any;
  }> {

    try {
      const results = await Promise.allSettled([
        autoPlanSyncService.manualSync(userId),
        this.localToSupabaseSync.manualSync(userId, userName),
        planToTaskSyncService.manualSync(userId)
      ]);

      const syncResults = {
        planSync: results[0].status === 'fulfilled' ? results[0].value : 0,
        localToSupabase: results[1].status === 'fulfilled' ? results[1].value : null,
        planToTask: results[2].status === 'fulfilled' ? results[2].value : null
      };

      return syncResults;
    } catch (error) {
      console.error('❌ Error in manual sync:', error);
      throw error;
    }
  }

  /**
   * Expose service to window for debugging
   */
  private exposeToWindow(): void {
    if (typeof window !== 'undefined') {
      (window as any).comprehensiveAutoSync = {
        getStatus: () => this.getSyncStatus(),
        startAll: (userId: string, userName: string) => this.startAllAutoSyncServices(userId, userName),
        stopAll: () => this.stopAllAutoSyncServices(),
        manualSyncAll: (userId: string, userName: string) => this.triggerManualSyncAll(userId, userName),
        healthCheck: (userId: string, userName: string) => this.performHealthCheck(userId, userName)
      };
      
    }
  }
}

export default ComprehensiveAutoSyncService;
