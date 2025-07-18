/**
 * Plan Automation Service
 * Handles automatic task creation from plans and notifications
 */

import { PlanService } from './PlanService';
import { SupabaseService } from './SupabaseService';
import { Plan, PlanNotification } from '@/types/plan';

export class PlanAutomationService {
  private planService: PlanService;
  private supabaseService: SupabaseService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.planService = new PlanService();
    this.supabaseService = SupabaseService.getInstance();
  }

  /**
   * Start the automation service
   */
  public start(): void {
    if (this.isRunning) {
      console.log('Plan automation service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Starting Plan Automation Service...');

    // Run immediately
    this.runAutomationCycle();

    // Run every 5 minutes
    this.intervalId = setInterval(() => {
      this.runAutomationCycle();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop the automation service
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Plan Automation Service stopped');
  }

  /**
   * Run a complete automation cycle
   */
  private async runAutomationCycle(): Promise<void> {
    try {
      console.log('🔄 Running plan automation cycle...');
      
      const results = await Promise.allSettled([
        this.autoCreateTasksFromPlans(),
        this.sendPendingNotifications(),
        this.updateOverduePlans(),
        this.processRecurringPlans()
      ]);

      // Log results
      results.forEach((result, index) => {
        const operations = ['Auto-create tasks', 'Send notifications', 'Update overdue', 'Process recurring'];
        if (result.status === 'rejected') {
          console.error(`❌ ${operations[index]} failed:`, result.reason);
        } else {
          console.log(`✅ ${operations[index]} completed`);
        }
      });

    } catch (error) {
      console.error('❌ Error in automation cycle:', error);
    }
  }

  /**
   * Auto-create tasks from plans that are due today
   */
  private async autoCreateTasksFromPlans(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get plans scheduled for today that should auto-create tasks
      const plans = await this.planService.getPlans({
        status: 'scheduled',
        date_range: { start: today, end: today }
      });

      const eligiblePlans = plans.filter(plan => 
        plan.auto_create_task && 
        !plan.generated_task_ids.some(taskId => taskId) // Not already created today
      );

      console.log(`📅 Found ${eligiblePlans.length} plans to auto-create tasks`);

      for (const plan of eligiblePlans) {
        try {
          await this.planService.convertPlanToTask(plan.id, {
            plan_id: plan.id,
            execution_date: today,
            inherit_properties: true
          });

          // Update plan status to active
          await this.planService.updatePlan(plan.id, { 
            status: 'active' 
          });

          // Create notification about auto-created task
          await this.createNotification(plan, 'auto_created', plan.user_id);

          console.log(`✅ Auto-created task from plan: ${plan.title}`);
        } catch (error) {
          console.error(`❌ Failed to auto-create task from plan ${plan.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in auto-create tasks:', error);
    }
  }

  /**
   * Send pending notifications
   */
  private async sendPendingNotifications(): Promise<void> {
    try {
      const now = new Date();
      
      // Get pending notifications that should be sent
      const { data: notifications, error } = await this.supabaseService.getClient()
        .from('plan_notifications')
        .select('*')
        .eq('sent', false)
        .lte('scheduled_time', now.toISOString());

      if (error) throw error;

      console.log(`📢 Found ${notifications?.length || 0} pending notifications`);

      for (const notification of notifications || []) {
        try {
          // In a real app, you would send actual notifications here
          // For now, we'll just mark them as sent and log
          await this.markNotificationAsSent(notification.id);
          
          console.log(`📨 Sent notification: ${notification.title} to user ${notification.user_id}`);
          
          // You could integrate with:
          // - Browser notifications API
          // - Email service
          // - Push notification service
          // - WebSocket for real-time notifications
          
        } catch (error) {
          console.error(`❌ Failed to send notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
    }
  }

  /**
   * Update plans that are overdue
   */
  private async updateOverduePlans(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get plans that are scheduled but past their date
      const plans = await this.planService.getPlans({
        status: 'scheduled'
      });

      const overduePlans = plans.filter(plan => 
        plan.scheduled_date < today
      );

      console.log(`⏰ Found ${overduePlans.length} overdue plans`);

      for (const plan of overduePlans) {
        try {
          await this.planService.updatePlan(plan.id, { 
            status: 'overdue' 
          });

          // Create overdue notification
          await this.createNotification(plan, 'overdue', plan.user_id);

          console.log(`⚠️ Marked plan as overdue: ${plan.title}`);
        } catch (error) {
          console.error(`❌ Failed to update overdue plan ${plan.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error updating overdue plans:', error);
    }
  }

  /**
   * Process recurring plans and create next occurrences
   */
  private async processRecurringPlans(): Promise<void> {
    try {
      const today = new Date();
      
      // Get recurring plans that have been completed or are active
      const plans = await this.planService.getPlans({
        is_recurring: true
      });

      const recurringPlans = plans.filter(plan => 
        plan.is_recurring && 
        plan.recurrence_pattern &&
        (plan.status === 'completed' || plan.status === 'active')
      );

      console.log(`🔄 Found ${recurringPlans.length} recurring plans to process`);

      for (const plan of recurringPlans) {
        try {
          const nextDate = this.calculateNextRecurrence(plan);
          
          if (nextDate && (!plan.recurrence_end_date || nextDate <= new Date(plan.recurrence_end_date))) {
            // Create next occurrence
            const nextPlanData = {
              ...plan,
              id: undefined, // Will be auto-generated
              scheduled_date: nextDate.toISOString().split('T')[0],
              status: 'scheduled' as const,
              generated_task_ids: [],
              source_task_id: undefined,
              created_at: undefined,
              updated_at: undefined
            };

            await this.planService.createPlan(nextPlanData, plan.user_id, plan.user_name);
            
            console.log(`🔄 Created next occurrence for recurring plan: ${plan.title}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process recurring plan ${plan.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error processing recurring plans:', error);
    }
  }

  /**
   * Calculate next recurrence date
   */
  private calculateNextRecurrence(plan: Plan): Date | null {
    if (!plan.recurrence_pattern || !plan.recurrence_interval) {
      return null;
    }

    const currentDate = new Date(plan.scheduled_date);
    const interval = plan.recurrence_interval;

    switch (plan.recurrence_pattern) {
      case 'daily':
        return new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
      
      case 'weekly':
        return new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
      
      case 'monthly':
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + interval);
        return nextMonth;
      
      case 'yearly':
        const nextYear = new Date(currentDate);
        nextYear.setFullYear(nextYear.getFullYear() + interval);
        return nextYear;
      
      default:
        return null;
    }
  }

  /**
   * Create a notification for a plan
   */
  private async createNotification(
    plan: Plan, 
    type: 'reminder' | 'due_today' | 'overdue' | 'auto_created',
    userId: string
  ): Promise<void> {
    try {
      const messages = {
        reminder: `Nhắc nhở: Kế hoạch "${plan.title}" sẽ được thực hiện vào ${plan.scheduled_date}`,
        due_today: `Kế hoạch "${plan.title}" cần được thực hiện hôm nay`,
        overdue: `Kế hoạch "${plan.title}" đã quá hạn từ ngày ${plan.scheduled_date}`,
        auto_created: `Đã tự động tạo công việc từ kế hoạch "${plan.title}"`
      };

      const notification: Omit<PlanNotification, 'id' | 'created_at'> = {
        plan_id: plan.id,
        type,
        title: `Thông báo kế hoạch`,
        message: messages[type],
        scheduled_time: new Date().toISOString(),
        sent: false,
        user_id: userId
      };

      await this.supabaseService.addDocument('plan_notifications', notification);
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  /**
   * Mark notification as sent
   */
  private async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      await this.supabaseService.updateDocument('plan_notifications', notificationId, {
        sent: true
      });
    } catch (error) {
      console.error('❌ Error marking notification as sent:', error);
    }
  }

  /**
   * Get automation statistics
   */
  public async getAutomationStats(): Promise<{
    totalPlans: number;
    scheduledPlans: number;
    activePlans: number;
    overduePlans: number;
    autoCreatedTasks: number;
    pendingNotifications: number;
  }> {
    try {
      const [plans, notifications] = await Promise.all([
        this.planService.getPlans({}),
        this.supabaseService.getClient()
          .from('plan_notifications')
          .select('*')
          .eq('sent', false)
      ]);

      const planStats = plans.reduce((acc, plan) => {
        acc.totalPlans++;
        if (plan.status === 'scheduled') acc.scheduledPlans++;
        if (plan.status === 'active') acc.activePlans++;
        if (plan.status === 'overdue') acc.overduePlans++;
        acc.autoCreatedTasks += plan.generated_task_ids.length;
        return acc;
      }, {
        totalPlans: 0,
        scheduledPlans: 0,
        activePlans: 0,
        overduePlans: 0,
        autoCreatedTasks: 0
      });

      return {
        ...planStats,
        pendingNotifications: notifications.data?.length || 0
      };
    } catch (error) {
      console.error('❌ Error getting automation stats:', error);
      return {
        totalPlans: 0,
        scheduledPlans: 0,
        activePlans: 0,
        overduePlans: 0,
        autoCreatedTasks: 0,
        pendingNotifications: 0
      };
    }
  }

  /**
   * Manual trigger for automation (for testing)
   */
  public async runManualAutomation(): Promise<void> {
    console.log('🔧 Running manual automation cycle...');
    await this.runAutomationCycle();
  }
}

// Create singleton instance
export const planAutomationService = new PlanAutomationService();

// Auto-start when module loads (in production, you might want to control this)
if (typeof window !== 'undefined') {
  // Only start in browser environment
  setTimeout(() => {
    planAutomationService.start();
  }, 5000); // Start after 5 seconds to allow app initialization
}

export default PlanAutomationService;
