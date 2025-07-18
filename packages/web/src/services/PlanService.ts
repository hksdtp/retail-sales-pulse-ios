/**
 * Plan Service
 * Service layer cho quản lý kế hoạch và đồng bộ với tasks
 */

import { SupabaseService } from './SupabaseService';
import { 
  Plan, 
  PlanFormData, 
  PlanFilters, 
  TaskToPlanConversion, 
  PlanToTaskConversion,
  PlanNotification,
  PlanTemplate,
  PlanStats
} from '@/types/plan';
import { Task } from '@/types/task';

export class PlanService {
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = SupabaseService.getInstance();
  }

  // ===== CRUD OPERATIONS =====

  /**
   * Tạo kế hoạch mới
   */
  async createPlan(planData: PlanFormData, userId: string, userName: string): Promise<Plan> {
    try {
      const plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'> = {
        ...planData,
        user_id: userId,
        user_name: userName,
        generated_task_ids: [],
        status: 'scheduled',
        team_id: planData.assigned_to ? '' : planData.team_id || '',
        location: planData.location || 'Hà Nội'
      };

      const result = await this.supabaseService.addDocument('plans', plan);
      
      if (result) {
        // Tạo notification reminder nếu có
        if (planData.reminder_date) {
          await this.createPlanNotification(result.id, 'reminder', userId);
        }
        
        // Log sync event
        await this.logSyncEvent('plan_created', result.id, undefined, plan, userId);
        
        return result;
      }
      
      throw new Error('Failed to create plan');
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách kế hoạch với filters
   */
  async getPlans(filters: PlanFilters = {}): Promise<Plan[]> {
    try {
      let query = this.supabaseService.getClient()
        .from('plans')
        .select('*');

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      if (filters.team_id) {
        query = query.eq('team_id', filters.team_id);
      }
      
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters.is_recurring !== undefined) {
        query = query.eq('is_recurring', filters.is_recurring);
      }
      
      if (filters.date_range) {
        query = query
          .gte('scheduled_date', filters.date_range.start)
          .lte('scheduled_date', filters.date_range.end);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Order by scheduled_date
      query = query.order('scheduled_date', { ascending: true });

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Lấy kế hoạch theo ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  }

  /**
   * Cập nhật kế hoạch
   */
  async updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log sync event
      await this.logSyncEvent('plan_updated', planId, undefined, updates, updates.user_id || '');
      
      return data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Xóa kế hoạch
   */
  async deletePlan(planId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      return false;
    }
  }

  // ===== TASK-PLAN CONVERSION =====

  /**
   * Chuyển đổi Task thành Plan
   */
  async convertTaskToPlan(taskId: string, conversionData: TaskToPlanConversion): Promise<Plan> {
    try {
      // Lấy thông tin task
      const task = await this.supabaseService.getDocumentById('tasks', taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Tạo plan từ task
      const planData: PlanFormData = {
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority || 'normal',
        scheduled_date: conversionData.scheduled_date,
        scheduled_time: conversionData.scheduled_time || '09:00',
        reminder_date: conversionData.reminder_date,
        is_recurring: conversionData.is_recurring || false,
        recurrence_pattern: conversionData.recurrence_pattern,
        recurrence_interval: conversionData.recurrence_interval || 1,
        auto_create_task: conversionData.auto_create_task !== false,
        is_template: false,
        assigned_to: task.assignedTo,
        visibility: task.visibility || 'personal',
        shared_with: task.sharedWith || [],
        tags: [],
        notes: `Được tạo từ công việc: ${task.title}`
      };

      const plan = await this.createPlan(planData, task.user_id, task.user_name);
      
      // Cập nhật task để link với plan
      await this.supabaseService.updateDocument('tasks', taskId, {
        plan_id: plan.id
      });

      // Cập nhật plan với source_task_id
      await this.updatePlan(plan.id, {
        source_task_id: taskId
      });

      // Log sync event
      await this.logSyncEvent('task_to_plan', plan.id, taskId, conversionData, task.user_id);

      return plan;
    } catch (error) {
      console.error('Error converting task to plan:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi Plan thành Task
   */
  async convertPlanToTask(planId: string, conversionData: PlanToTaskConversion): Promise<Task> {
    try {
      // Lấy thông tin plan
      const plan = await this.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Tạo task từ plan
      const taskData = {
        title: conversionData.custom_title || plan.title,
        description: conversionData.custom_description || plan.description,
        type: plan.type,
        status: 'todo',
        priority: conversionData.custom_priority || plan.priority,
        date: conversionData.execution_date,
        time: plan.scheduled_time || '09:00',
        user_id: plan.user_id,
        user_name: plan.user_name,
        team_id: plan.team_id,
        location: plan.location,
        assignedTo: plan.assigned_to || plan.user_id,
        visibility: plan.visibility,
        sharedWith: plan.shared_with,
        plan_id: planId,
        is_from_plan: true,
        auto_created: !conversionData.inherit_properties,
        progress: 0,
        isNew: true
      };

      const task = await this.supabaseService.addDocument('tasks', taskData);
      
      if (task) {
        // Cập nhật plan với generated_task_id
        const updatedTaskIds = [...plan.generated_task_ids, task.id];
        await this.updatePlan(planId, {
          generated_task_ids: updatedTaskIds
        });

        // Log sync event
        await this.logSyncEvent('plan_to_task', planId, task.id, conversionData, plan.user_id);

        return task;
      }
      
      throw new Error('Failed to create task from plan');
    } catch (error) {
      console.error('Error converting plan to task:', error);
      throw error;
    }
  }

  // ===== AUTOMATION =====

  /**
   * Tự động tạo tasks từ plans đến hạn
   */
  async autoCreateTasksFromPlans(): Promise<{ created: number; errors: string[] }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Lấy plans cần tạo task hôm nay
      const plans = await this.getPlans({
        status: 'scheduled',
        date_range: { start: today, end: today }
      });

      const results = { created: 0, errors: [] as string[] };

      for (const plan of plans) {
        if (plan.auto_create_task) {
          try {
            await this.convertPlanToTask(plan.id, {
              plan_id: plan.id,
              execution_date: today,
              inherit_properties: true
            });
            
            // Cập nhật status plan thành active
            await this.updatePlan(plan.id, { status: 'active' });
            
            results.created++;
          } catch (error) {
            results.errors.push(`Failed to create task from plan ${plan.id}: ${error}`);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error in auto-create tasks:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Tạo notification cho plan
   */
  private async createPlanNotification(planId: string, type: string, userId: string): Promise<void> {
    try {
      const plan = await this.getPlanById(planId);
      if (!plan) return;

      const notification: Omit<PlanNotification, 'id' | 'created_at'> = {
        plan_id: planId,
        type: type as any,
        title: `Nhắc nhở: ${plan.title}`,
        message: `Kế hoạch "${plan.title}" sẽ được thực hiện vào ${plan.scheduled_date}`,
        scheduled_time: plan.reminder_date || plan.scheduled_date,
        sent: false,
        user_id: userId
      };

      await this.supabaseService.addDocument('plan_notifications', notification);
    } catch (error) {
      console.error('Error creating plan notification:', error);
    }
  }

  /**
   * Log sync event
   */
  private async logSyncEvent(
    eventType: string, 
    planId?: string, 
    taskId?: string, 
    data?: any, 
    userId?: string
  ): Promise<void> {
    try {
      const logEntry = {
        event_type: eventType,
        plan_id: planId,
        task_id: taskId,
        event_data: data,
        user_id: userId || '',
        created_at: new Date().toISOString()
      };

      await this.supabaseService.addDocument('plan_task_sync_log', logEntry);
    } catch (error) {
      console.error('Error logging sync event:', error);
    }
  }
}

export default PlanService;
