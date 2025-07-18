import { PersonalPlan, personalPlanService } from './PersonalPlanService';
import { Task } from '@/components/tasks/types/TaskTypes';

/**
 * Auto Plan Sync Service
 * Tự động chuyển kế hoạch thành công việc khi đến hạn
 * Sync trực tiếp vào TaskDataProvider thay vì LocalTaskService riêng biệt
 */
class AutoPlanSyncService {
  private static instance: AutoPlanSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // Check every 30 seconds for better responsiveness
  private taskDataContext: any = null; // Will be injected

  public static getInstance(): AutoPlanSyncService {
    if (!AutoPlanSyncService.instance) {
      AutoPlanSyncService.instance = new AutoPlanSyncService();
      // Expose to window immediately when instance is created
      AutoPlanSyncService.instance.exposeToWindow();
    }
    return AutoPlanSyncService.instance;
  }

  /**
   * Inject TaskDataContext để có thể add task vào hệ thống chính
   */
  public setTaskDataContext(context: any): void {
    this.taskDataContext = context;
    console.log('🔗 TaskDataContext injected into AutoPlanSyncService');
    console.log('📋 TaskDataContext details:', {
      hasAddTask: typeof context?.addTask === 'function',
      hasRefreshTasks: typeof context?.refreshTasks === 'function',
      taskCount: context?.tasks?.length || 0
    });
  }

  /**
   * Bắt đầu auto-sync service
   */
  public startAutoSync(userId: string): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    console.log('🔄 Starting auto plan sync service for user:', userId);
    console.log('📊 Service status:', {
      hasTaskDataContext: !!this.taskDataContext,
      syncInterval: this.SYNC_INTERVAL_MS,
      userId: userId
    });

    // Sync ngay lập tức
    console.log('⚡ Running initial sync...');
    this.syncDuePlans(userId).catch(error => {
      console.error('❌ Error in initial sync:', error);
    });

    // Thiết lập interval để sync định kỳ
    this.syncInterval = setInterval(() => {
      console.log('⏰ Running scheduled sync...');
      this.syncDuePlans(userId).catch(error => {
        console.error('❌ Error in scheduled sync:', error);
      });
    }, this.SYNC_INTERVAL_MS);

    // Expose to window for debugging
    this.exposeToWindow();
  }

  /**
   * Dừng auto-sync service
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Stopped auto plan sync service');
    }
  }

  /**
   * Sync các kế hoạch đã đến hạn
   */
  public async syncDuePlans(userId: string): Promise<void> {
    try {
      const today = new Date();
      const todayString = this.formatDate(today);

      // Lấy tất cả kế hoạch của user
      const plans = personalPlanService.getUserPlans(userId);

      if (plans.length > 0) {
        console.log('📋 Plan details:', plans.map(p => ({
          id: p.id,
          title: p.title,
          startDate: p.startDate,
          status: p.status,
          type: p.type
        })));
      }

      // Lọc các kế hoạch đã đến hạn (ngày hôm nay hoặc quá hạn)
      const duePlans = plans.filter(plan => {
        const planDate = new Date(plan.startDate);
        const planDateString = this.formatDate(planDate);

        console.log(`📅 Checking plan "${plan.title}": ${planDateString} vs ${todayString}, status: ${plan.status}`);

        // Kế hoạch đến hạn nếu:
        // 1. Là ngày hôm nay
        // 2. Đã quá hạn nhưng chưa hoàn thành
        const isDue = planDateString <= todayString && plan.status !== 'completed';
        console.log(`📅 Plan "${plan.title}" is due: ${isDue}`);

        return isDue;
      });

      console.log(`📅 Found ${duePlans.length} due plans to sync for ${todayString}`);

      if (duePlans.length === 0) {
        console.log('⏭️ No due plans to sync, skipping...');
        return; // Không có kế hoạch nào cần sync
      }

      let syncedCount = 0;

      console.log('🔄 Starting to sync due plans...');
      console.log('📊 TaskDataContext status:', {
        hasContext: !!this.taskDataContext,
        hasAddTask: !!(this.taskDataContext && this.taskDataContext.addTask),
        hasTasks: !!(this.taskDataContext && this.taskDataContext.tasks),
        taskCount: this.taskDataContext?.tasks?.length || 0
      });

      for (const plan of duePlans) {
        try {
          console.log(`🔄 Processing plan: ${plan.title}`);

          // Kiểm tra xem đã có task với title này chưa (nếu có TaskDataContext)
          if (this.taskDataContext && this.taskDataContext.tasks) {
            const existingTask = this.taskDataContext.tasks.find((task: Task) =>
              task.title === plan.title && task.date === plan.startDate
            );

            if (existingTask) {
              console.log(`⏭️ Task already exists for plan: ${plan.title}`);
              continue;
            }
          }

          // Tạo task từ plan
          
          const taskData = this.planToTask(plan, userId);

          // Sync vào TaskDataProvider nếu có
          if (this.taskDataContext && this.taskDataContext.addTask) {
            console.log('📤 Adding task to main system via TaskDataContext...');
            await this.taskDataContext.addTask(taskData);

            // Force UI refresh với delay
            setTimeout(() => {
              if (this.taskDataContext.refreshTasks) {
                console.log('🔄 Triggering TaskDataProvider refresh...');
                this.taskDataContext.refreshTasks();
              }

              // Emit custom event để trigger refresh từ bên ngoài
              console.log('📡 Emitting tasks-updated event...');
              window.dispatchEvent(new CustomEvent('tasks-updated', {
                detail: { source: 'auto-sync', taskTitle: plan.title }
              }));
            }, 100);
          } else {
            // Fallback: Lưu trực tiếp vào localStorage
            console.log('💾 Fallback: saving to localStorage...');
            const tasks = await this.getTasksFromStorage(userId);
            tasks.push(taskData);
            await this.saveTasksToStorage(userId, tasks);

            // Emit event ngay cả khi không có context
            console.log('📡 Emitting tasks-updated event (fallback)...');
            window.dispatchEvent(new CustomEvent('tasks-updated', {
              detail: { source: 'auto-sync-fallback', taskTitle: plan.title }
            }));
          }

          syncedCount++;
        } catch (error) {
          console.error(`❌ Error syncing plan "${plan.title}":`, error);
        }
      }

      if (syncedCount > 0) {
        console.log(`🎉 Auto-synced ${syncedCount} plans to tasks`);
        
        // Trigger refresh cho UI
        this.triggerUIRefresh();
      }

    } catch (error) {
      console.error('❌ Error in auto plan sync:', error);
    }
  }

  /**
   * Chuyển đổi plan thành task data
   */
  private planToTask(plan: PersonalPlan, userId: string): Omit<Task, 'id' | 'created_at'> {
    return {
      title: plan.title,
      description: plan.description,
      type: this.mapPlanTypeToTaskType(plan.type), // Map plan type to task type
      status: this.mapPlanStatusToTaskStatus(plan.status),
      priority: this.mapPlanPriorityToTaskPriority(plan.priority),
      date: plan.startDate,
      time: plan.startTime,
      user_id: userId,
      user_name: plan.creator,
      team_id: '1',
      teamId: '1',
      location: plan.location || '',
      assignedTo: userId,
      isNew: true,
      progress: 0,
      isShared: plan.visibility === 'team' || plan.visibility === 'public',
      isSharedWithTeam: plan.visibility === 'team',
      visibility: plan.visibility || 'personal',
      sharedWith: plan.sharedWith || []
    };
  }

  /**
   * Map plan type to task type
   */
  private mapPlanTypeToTaskType(planType: string): string {
    const typeMap: Record<string, string> = {
      'partner_new': 'partner_new',
      'partner_old': 'partner_old',
      'architect_new': 'architect_new',
      'architect_old': 'architect_old',
      'client_new': 'client_new',
      'client_old': 'client_old',
      'quote_new': 'quote_new',
      'quote_old': 'quote_old',
      // Map plan-only types to 'other'
      'report': 'other',
      'training': 'other',
      'meeting': 'other',
      'inventory': 'other',
      'other': 'other'
    };

    return typeMap[planType] || 'other';
  }

  /**
   * Fallback: Lưu task vào localStorage (tương thích ngược)
   */
  private saveTaskToLocalStorage(userId: string, taskData: Omit<Task, 'id' | 'created_at'>): void {
    try {
      const taskKey = `user_tasks_${userId}`;
      const existingTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };

      existingTasks.push(newTask);
      localStorage.setItem(taskKey, JSON.stringify(existingTasks));
    } catch (error) {
      console.error('Error saving task to localStorage:', error);
    }
  }

  /**
   * Lấy tasks từ storage
   */
  private async getTasksFromStorage(userId: string): Promise<any[]> {
    try {
      const taskKey = `user_tasks_${userId}`;
      const tasks = JSON.parse(localStorage.getItem(taskKey) || '[]');
      
      return tasks;
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      return [];
    }
  }

  /**
   * Lưu tasks vào storage
   */
  private async saveTasksToStorage(userId: string, tasks: any[]): Promise<void> {
    try {
      const taskKey = `user_tasks_${userId}`;
      localStorage.setItem(taskKey, JSON.stringify(tasks));
      console.log(`💾 Saved ${tasks.length} tasks to storage for user ${userId}`);
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }

  /**
   * Map plan priority to task priority
   */
  private mapPlanPriorityToTaskPriority(planPriority: string): string {
    const priorityMap: Record<string, string> = {
      'urgent': 'urgent',
      'high': 'high',
      'normal': 'normal',
      'low': 'low',
      'medium': 'normal' // Map old 'medium' to 'normal'
    };

    return priorityMap[planPriority] || 'normal';
  }

  /**
   * Map plan status to task status
   */
  private mapPlanStatusToTaskStatus(planStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'todo',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'overdue': 'todo'
    };
    
    return statusMap[planStatus] || 'todo';
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Trigger UI refresh
   */
  private triggerUIRefresh(): void {
    // Refresh main task system
    if (this.taskDataContext && this.taskDataContext.refreshTasks) {
      this.taskDataContext.refreshTasks();
    }

    // Refresh Calendar
    if ((window as any).refreshCalendarPlans) {
      (window as any).refreshCalendarPlans();
    }
  }

  /**
   * Manual sync for testing
   */
  public async manualSync(userId: string): Promise<number> {
    console.log('🧪 Manual sync triggered for testing...');
    const beforeCount = this.taskDataContext?.tasks?.length || 0;
    console.log('📊 Tasks before sync:', beforeCount);

    await this.syncDuePlans(userId);

    const afterCount = this.taskDataContext?.tasks?.length || 0;
    console.log('📊 Tasks after sync:', afterCount);

    const syncedCount = afterCount - beforeCount;
    console.log(`🎯 Manual sync result: ${syncedCount} tasks synced`);

    return syncedCount;
  }

  /**
   * Expose service to window for debugging
   */
  public exposeToWindow(): void {
    (window as any).autoPlanSyncService = this;
    (window as any).testAutoSync = (userId: string) => this.manualSync(userId);
    
     to test manual sync');
  }
}

export const autoPlanSyncService = AutoPlanSyncService.getInstance();

// Debug: Log service creation

));

// Global exposure for debugging (immediate)
if (typeof window !== 'undefined') {
  (window as any).autoPlanSyncService = autoPlanSyncService;
  (window as any).testAutoSync = (userId: string) => autoPlanSyncService.manualSync(userId);
  console.log('🌍 AutoPlanSyncService exposed globally on module load');
}
