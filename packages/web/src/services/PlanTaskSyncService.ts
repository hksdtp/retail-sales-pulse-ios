import { personalPlanService, PersonalPlan } from './PersonalPlanService';
import { Task } from '@/components/tasks/types/TaskTypes';

// Local task storage service
class LocalTaskService {
  private static instance: LocalTaskService;

  public static getInstance(): LocalTaskService {
    if (!LocalTaskService.instance) {
      LocalTaskService.instance = new LocalTaskService();
    }
    return LocalTaskService.instance;
  }

  private getTaskStorageKey(userId: string): string {
    return `user_tasks_${userId}`;
  }

  public getUserTasks(userId: string): Task[] {
    try {
      const storageKey = this.getTaskStorageKey(userId);
      const storedTasks = localStorage.getItem(storageKey);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Lỗi khi lấy tasks của user:', error);
      return [];
    }
  }

  public addTask(userId: string, taskData: Omit<Task, 'id' | 'created_at'>): Task {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    const existingTasks = this.getUserTasks(userId);
    const updatedTasks = [...existingTasks, newTask];

    this.saveUserTasks(userId, updatedTasks);

    return newTask;
  }

  private saveUserTasks(userId: string, tasks: Task[]): void {
    try {
      const storageKey = this.getTaskStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      console.log(`Đã lưu ${tasks.length} tasks cho user ${userId}`);
    } catch (error) {
      console.error('Lỗi khi lưu tasks:', error);
    }
  }
}

const localTaskService = LocalTaskService.getInstance();

interface SyncOptions {
  userId: string;
  direction: 'plan-to-task' | 'task-to-plan' | 'bidirectional';
}

interface TaskFormData {
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  date: string;
  time: string;
  location?: string;
  assignedTo?: string;
  sharedWith?: string[];
  isShared?: boolean;
  isSharedWithTeam?: boolean;
}

class PlanTaskSyncService {
  private static instance: PlanTaskSyncService;

  private constructor() {}

  public static getInstance(): PlanTaskSyncService {
    if (!PlanTaskSyncService.instance) {
      PlanTaskSyncService.instance = new PlanTaskSyncService();
    }
    return PlanTaskSyncService.instance;
  }

  // Convert Plan to Task format
  public planToTask(plan: PersonalPlan, userId: string): TaskFormData {
    return {
      title: plan.title,
      description: plan.description,
      type: this.mapPlanTypeToTaskType(plan.type),
      status: this.mapPlanStatusToTaskStatus(plan.status),
      priority: plan.priority,
      date: plan.startDate,
      time: plan.startTime,
      location: plan.location,
      assignedTo: userId,
      sharedWith: plan.participants || [],
      isShared: (plan.participants?.length || 0) > 0,
      isSharedWithTeam: false
    };
  }

  // Convert Task to Plan format
  public taskToPlan(task: Task, userId: string): Omit<PersonalPlan, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: task.title,
      description: task.description || '',
      type: this.mapTaskTypeToPlanType(task.type),
      status: this.mapTaskStatusToPlanStatus(task.status),
      priority: task.priority || 'medium',
      startDate: task.date,
      endDate: task.date, // Same day by default
      startTime: task.time || '09:00',
      endTime: this.calculateEndTime(task.time || '09:00'),
      location: task.location || '',
      notes: '',
      participants: this.extractParticipants(task),
      creator: {
        id: userId,
        name: task.user_name || 'Unknown'
      }
    };
  }

  // Map plan types to task types
  private mapPlanTypeToTaskType(planType: string): string {
    const mapping: Record<string, string> = {
      'meeting': 'other',
      'client_meeting': 'client_new',
      'site_visit': 'other',
      'report': 'other',
      'training': 'other',
      'other': 'other'
    };
    return mapping[planType] || 'other';
  }

  // Map task types to plan types
  private mapTaskTypeToPlanType(taskType: string): string {
    const mapping: Record<string, string> = {
      'client_new': 'client_meeting',
      'client_old': 'client_meeting',
      'architect_new': 'meeting',
      'architect_old': 'meeting',
      'quote_new': 'meeting',
      'quote_old': 'meeting',
      'partner_new': 'meeting',
      'partner_old': 'meeting',
      'other': 'other'
    };
    return mapping[taskType] || 'other';
  }

  // Map plan status to task status
  private mapPlanStatusToTaskStatus(planStatus: string): string {
    const mapping: Record<string, string> = {
      'pending': 'todo',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'overdue': 'on-hold'
    };
    return mapping[planStatus] || 'todo';
  }

  // Map task status to plan status
  private mapTaskStatusToPlanStatus(taskStatus: string): string {
    const mapping: Record<string, string> = {
      'todo': 'pending',
      'in-progress': 'in_progress',
      'completed': 'completed',
      'on-hold': 'overdue'
    };
    return mapping[taskStatus] || 'pending';
  }

  // Calculate end time (add 1 hour by default)
  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Extract participants from task
  private extractParticipants(task: Task): string[] {
    const participants: string[] = [];
    
    if (task.user_name) {
      participants.push(task.user_name);
    }
    
    if (task.extraAssignees) {
      const extraNames = task.extraAssignees.split(',').map(name => name.trim());
      participants.push(...extraNames);
    }
    
    return [...new Set(participants)]; // Remove duplicates
  }

  // Sync plan to task (create task from plan)
  public async syncPlanToTask(plan: PersonalPlan, userId: string): Promise<boolean> {
    try {
      const taskData = this.planToTask(plan, userId);

      // Create task using local service
      const newTask = localTaskService.addTask(userId, {
        ...taskData,
        user_id: userId,
        user_name: plan.creator,
        team_id: '1', // Default team
        teamId: '1',
        location: 'hanoi', // Default location
        assignedTo: userId,
        isNew: true,
        progress: 0,
        isShared: false,
        isSharedWithTeam: false,
        extraAssignees: ''
      });

      if (newTask) {
        
        return true;
      } else {
        console.error('❌ Lỗi khi tạo task từ plan');
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi sync plan to task:', error);
      return false;
    }
  }

  // Sync task to plan (create plan from task)
  public syncTaskToPlan(task: Task, userId: string): boolean {
    try {
      const planData = this.taskToPlan(task, userId);
      
      const planId = personalPlanService.addPlan(userId, planData);
      
      if (planId) {
        
        return true;
      } else {
        console.error('❌ Lỗi khi sync task to plan');
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi sync task to plan:', error);
      return false;
    }
  }

  // Bidirectional sync - sync all plans to tasks and vice versa
  public async syncBidirectional(userId: string): Promise<{
    plansToTasks: number;
    tasksToPlans: number;
    errors: string[]
  }> {
    const result = {
      plansToTasks: 0,
      tasksToPlans: 0,
      errors: [] as string[]
    };

    try {
      // Get user's plans
      const plans = personalPlanService.getUserPlans(userId);
      console.log(`🔄 Found ${plans.length} plans to sync for user ${userId}`);

      // Sync plans to tasks
      for (const plan of plans) {
        console.log(`🔄 Syncing plan: ${plan.title}`);
        const success = await this.syncPlanToTask(plan, userId);
        if (success) {
          result.plansToTasks++;
          
        } else {
          result.errors.push(`Failed to sync plan: ${plan.title}`);
          
        }
      }

      // Get user's tasks for task to plan sync
      const tasks = localTaskService.getUserTasks(userId);
      console.log(`🔄 Found ${tasks.length} tasks for potential sync to plans`);

      console.log(`🔄 Bidirectional sync completed:`, result);
      return result;
    } catch (error) {
      console.error('❌ Lỗi trong bidirectional sync:', error);
      result.errors.push(`Bidirectional sync error: ${error}`);
      return result;
    }
  }

  // Check if plan and task are in sync
  public isPlanTaskInSync(plan: PersonalPlan, task: Task): boolean {
    return (
      plan.title === task.title &&
      plan.description === task.description &&
      plan.startDate === task.date &&
      plan.startTime === task.time &&
      this.mapPlanStatusToTaskStatus(plan.status) === task.status
    );
  }

  // Get sync recommendations
  public getSyncRecommendations(userId: string): {
    plansToSync: PersonalPlan[];
    tasksToSync: Task[];
    conflicts: Array<{ plan: PersonalPlan; task: Task; reason: string }>;
  } {
    const plans = personalPlanService.getUserPlans(userId);
    
    // This would require fetching tasks from API
    // For now, return empty recommendations
    return {
      plansToSync: plans.filter(plan => plan.status !== 'completed'),
      tasksToSync: [],
      conflicts: []
    };
  }
}

export const planTaskSyncService = PlanTaskSyncService.getInstance();
export type { SyncOptions, TaskFormData };
