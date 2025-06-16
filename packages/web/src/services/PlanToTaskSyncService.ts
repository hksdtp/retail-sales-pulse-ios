import { Task } from '@/components/tasks/types/TaskTypes';
import { PersonalPlan, personalPlanService } from './PersonalPlanService';
import { pushNotificationService } from './pushNotificationService';

export interface PlanToTaskConversion {
  planId: string;
  taskId: string;
  convertedAt: string;
  success: boolean;
  error?: string;
}

export interface SyncStats {
  totalPlansChecked: number;
  plansConverted: number;
  plansFailed: number;
  lastSyncTime: string;
}

class PlanToTaskSyncService {
  private static instance: PlanToTaskSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private conversions: PlanToTaskConversion[] = [];
  private stats: SyncStats = {
    totalPlansChecked: 0,
    plansConverted: 0,
    plansFailed: 0,
    lastSyncTime: new Date().toISOString()
  };

  private constructor() {}

  public static getInstance(): PlanToTaskSyncService {
    if (!PlanToTaskSyncService.instance) {
      PlanToTaskSyncService.instance = new PlanToTaskSyncService();
    }
    return PlanToTaskSyncService.instance;
  }

  // Khởi tạo service với auto-sync
  public startAutoSync(intervalMinutes: number = 1): void {
    if (this.isRunning) {
      console.log('PlanToTaskSyncService đã đang chạy');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Khởi tạo PlanToTaskSyncService với interval ${intervalMinutes} phút`);

    // Chạy ngay lần đầu
    this.syncPlansToTasks();

    // Thiết lập interval
    this.syncInterval = setInterval(() => {
      this.syncPlansToTasks();
    }, intervalMinutes * 60 * 1000);
  }

  // Dừng auto-sync
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Đã dừng PlanToTaskSyncService');
  }

  // Sync thủ công
  public async manualSync(userId: string): Promise<SyncStats> {
    console.log('🔄 Bắt đầu sync thủ công cho user:', userId);
    return await this.syncUserPlansToTasks(userId);
  }

  // Hàm chính để sync plans thành tasks
  private async syncPlansToTasks(): Promise<void> {
    try {
      console.log('🔍 Kiểm tra plans cần chuyển đổi thành tasks...');
      
      // Lấy danh sách tất cả users từ localStorage
      const allUsers = this.getAllUsersFromStorage();
      
      for (const userId of allUsers) {
        await this.syncUserPlansToTasks(userId);
      }

      this.stats.lastSyncTime = new Date().toISOString();
      console.log('✅ Hoàn thành sync plans to tasks:', this.stats);
      
    } catch (error) {
      console.error('❌ Lỗi khi sync plans to tasks:', error);
    }
  }

  // Sync plans của một user cụ thể
  private async syncUserPlansToTasks(userId: string): Promise<SyncStats> {
    const userPlans = personalPlanService.getUserPlans(userId);
    const now = new Date();
    let converted = 0;
    let failed = 0;

    console.log(`📋 Kiểm tra ${userPlans.length} plans của user ${userId}`);

    for (const plan of userPlans) {
      this.stats.totalPlansChecked++;

      // Kiểm tra xem plan đã đến hạn chưa
      if (this.shouldConvertPlanToTask(plan, now)) {
        try {
          const success = await this.convertPlanToTask(plan, userId);
          if (success) {
            converted++;
            this.stats.plansConverted++;
          } else {
            failed++;
            this.stats.plansFailed++;
          }
        } catch (error) {
          console.error(`❌ Lỗi khi convert plan ${plan.id}:`, error);
          failed++;
          this.stats.plansFailed++;
        }
      }
    }

    if (converted > 0) {
      console.log(`✅ Đã convert ${converted} plans thành tasks cho user ${userId}`);
      
      // Gửi thông báo cho user
      this.sendConversionNotification(userId, converted);
    }

    return {
      ...this.stats,
      plansConverted: converted,
      plansFailed: failed
    };
  }

  // Kiểm tra xem plan có cần convert thành task không
  private shouldConvertPlanToTask(plan: PersonalPlan, now: Date): boolean {
    // Chỉ convert plans có status pending hoặc in_progress
    if (plan.status === 'completed' || plan.status === 'overdue') {
      return false;
    }

    // Kiểm tra đã convert rồi chưa
    if (this.conversions.some(c => c.planId === plan.id && c.success)) {
      return false;
    }

    // Tạo datetime từ startDate và startTime
    const planDateTime = new Date(`${plan.startDate}T${plan.startTime}`);
    
    // Convert nếu đã đến hoặc qua thời gian bắt đầu
    return planDateTime <= now;
  }

  // Convert plan thành task
  private async convertPlanToTask(plan: PersonalPlan, userId: string): Promise<boolean> {
    try {
      console.log(`🔄 Converting plan "${plan.title}" to task...`);

      // Tạo task ID
      const taskId = `task_from_plan_${plan.id}_${Date.now()}`;

      // Tạo task từ plan
      const newTask: Task = {
        id: taskId,
        title: plan.title,
        description: plan.description,
        type: this.mapPlanTypeToTaskType(plan.type),
        status: 'todo',
        priority: plan.priority === 'high' ? 'urgent' : plan.priority,
        date: plan.startDate,
        time: plan.startTime,
        progress: 0,
        isNew: true,
        location: plan.location || '',
        teamId: '',
        assignedTo: userId,
        user_id: userId,
        user_name: '',
        created_at: new Date().toISOString(),
        visibility: 'personal',
        sharedWith: [],
        isShared: false,
        isSharedWithTeam: false
      };

      // Lưu conversion record
      const conversion: PlanToTaskConversion = {
        planId: plan.id,
        taskId: taskId,
        convertedAt: new Date().toISOString(),
        success: true
      };

      this.conversions.push(conversion);

      // Cập nhật plan status thành completed (đã chuyển thành task)
      personalPlanService.updatePlan(userId, plan.id, {
        status: 'completed',
        notes: `${plan.notes || ''}\n[Đã chuyển thành công việc: ${taskId}]`
      });

      // Lưu task vào localStorage
      this.saveTaskToLocalStorage(newTask, userId);

      // Trigger custom event để thông báo cho UI
      this.dispatchPlanToTaskEvent(newTask, plan);

      console.log(`✅ Đã convert plan "${plan.title}" thành task ${taskId}`);
      return true;

    } catch (error) {
      console.error(`❌ Lỗi khi convert plan ${plan.id}:`, error);

      // Lưu conversion record với lỗi
      const conversion: PlanToTaskConversion = {
        planId: plan.id,
        taskId: '',
        convertedAt: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.conversions.push(conversion);
      return false;
    }
  }

  // Map plan type sang task type
  private mapPlanTypeToTaskType(planType: string): Task['type'] {
    const typeMap: Record<string, Task['type']> = {
      'personal': 'other',
      'team': 'other',
      'department': 'other',
      'meeting': 'other',
      'training': 'other',
      'report': 'other',
      'partner_new': 'partner_new',
      'partner_old': 'partner_old',
      'architect_new': 'architect_new',
      'architect_old': 'architect_old',
      'client_new': 'client_new',
      'client_old': 'client_old',
      'quote_new': 'quote_new',
      'quote_old': 'quote_old',
      'inventory': 'inventory',
      'other': 'other'
    };

    return typeMap[planType] || 'other';
  }

  // Gửi thông báo conversion
  private sendConversionNotification(userId: string, count: number): void {
    try {
      pushNotificationService.sendNotification({
        title: '📋 Kế hoạch đã chuyển thành công việc',
        body: `${count} kế hoạch đã được tự động chuyển thành công việc cần thực hiện`,
        tag: `plan_conversion_${userId}`,
        data: {
          userId,
          count,
          url: '/tasks'
        }
      });
    } catch (error) {
      console.error('Lỗi khi gửi thông báo conversion:', error);
    }
  }

  // Lưu task vào localStorage
  private saveTaskToLocalStorage(task: Task, userId: string): void {
    try {
      // Lấy tasks hiện tại từ localStorage
      const tasksKey = `tasks_${userId}`;
      const existingTasksJson = localStorage.getItem(tasksKey);
      let existingTasks: Task[] = [];

      if (existingTasksJson) {
        existingTasks = JSON.parse(existingTasksJson);
      }

      // Kiểm tra task đã tồn tại chưa
      const taskExists = existingTasks.some(t => t.id === task.id);
      if (!taskExists) {
        // Thêm task mới
        existingTasks.push(task);

        // Lưu lại vào localStorage
        localStorage.setItem(tasksKey, JSON.stringify(existingTasks));
        console.log(`💾 Đã lưu task "${task.title}" vào localStorage cho user ${userId}`);
      } else {
        console.log(`⚠️ Task "${task.title}" đã tồn tại trong localStorage`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lưu task vào localStorage:', error);
    }
  }

  // Dispatch custom event để UI có thể listen
  private dispatchPlanToTaskEvent(task: Task, plan: PersonalPlan): void {
    const event = new CustomEvent('planToTaskConverted', {
      detail: { task, plan }
    });
    window.dispatchEvent(event);
  }

  // Lấy danh sách users từ localStorage
  private getAllUsersFromStorage(): string[] {
    const users: string[] = [];
    
    // Scan localStorage để tìm các key có pattern personal_plans_*
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('personal_plans_')) {
        const userId = key.replace('personal_plans_', '');
        users.push(userId);
      }
    }

    return users;
  }

  // Lấy thống kê
  public getStats(): SyncStats {
    return { ...this.stats };
  }

  // Lấy lịch sử conversions
  public getConversions(): PlanToTaskConversion[] {
    return [...this.conversions];
  }

  // Reset stats
  public resetStats(): void {
    this.stats = {
      totalPlansChecked: 0,
      plansConverted: 0,
      plansFailed: 0,
      lastSyncTime: new Date().toISOString()
    };
    this.conversions = [];
  }

  // Kiểm tra service có đang chạy không
  public isActive(): boolean {
    return this.isRunning;
  }

  // Debug function - force sync ngay lập tức
  public async debugForceSync(userId: string): Promise<void> {
    console.log('🔧 DEBUG: Force sync for user:', userId);
    await this.syncUserPlansToTasks(userId);
  }
}

export const planToTaskSyncService = PlanToTaskSyncService.getInstance();
