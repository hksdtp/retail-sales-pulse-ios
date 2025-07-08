/**
 * Local to Supabase Auto Sync Service
 * Tự động đồng bộ công việc từ localStorage lên Supabase khi đăng nhập
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

import { SupabaseService } from './SupabaseService';
import { Task } from '@/components/tasks/types/TaskTypes';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  details: string[];
}

export class LocalToSupabaseAutoSync {
  private static instance: LocalToSupabaseAutoSync;
  private supabaseService: SupabaseService;
  private isRunning = false;

  private constructor() {
    this.supabaseService = SupabaseService.getInstance();
  }

  public static getInstance(): LocalToSupabaseAutoSync {
    if (!LocalToSupabaseAutoSync.instance) {
      LocalToSupabaseAutoSync.instance = new LocalToSupabaseAutoSync();
    }
    return LocalToSupabaseAutoSync.instance;
  }

  /**
   * Tự động đồng bộ khi user đăng nhập - Optimized for performance
   */
  public async autoSyncOnLogin(userId: string, userName: string): Promise<SyncResult> {
    if (this.isRunning) {
      console.log('🔄 Auto sync already running, skipping...');
      return {
        success: false,
        syncedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: ['Sync already in progress'],
        details: []
      };
    }

    this.isRunning = true;
    console.log(`🚀 Starting auto sync for user: ${userName} (${userId})`);

    try {
      // Kiểm tra Supabase connection
      if (!this.supabaseService.isInitialized()) {
        throw new Error('Supabase not initialized');
      }

      // Lấy tasks từ localStorage
      const localTasks = this.getLocalTasks(userId);
      console.log(`📋 Found ${localTasks.length} local tasks for user ${userId}`);

      if (localTasks.length === 0) {
        return {
          success: true,
          syncedCount: 0,
          skippedCount: 0,
          errorCount: 0,
          errors: [],
          details: ['No local tasks to sync']
        };
      }

      // Lấy tasks từ Supabase để kiểm tra duplicates
      const supabaseTasks = await this.supabaseService.getTasks();
      console.log(`📊 Found ${supabaseTasks.length} existing tasks in Supabase`);

      // Sync từng task
      const result = await this.syncTasks(localTasks, supabaseTasks, userId, userName);

      // Clean up local storage sau khi sync thành công
      if (result.success && result.syncedCount > 0) {
        this.cleanupLocalTasks(userId, result.syncedCount);
      }

      console.log(`✅ Auto sync completed:`, result);
      return result;

    } catch (error) {
      console.error('❌ Auto sync failed:', error);
      return {
        success: false,
        syncedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: []
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Lấy tasks từ localStorage
   */
  private getLocalTasks(userId: string): Task[] {
    const taskKeys = [
      `user_tasks_${userId}`,
      `tasks_${userId}`,
      'rawTasks',
      'filteredTasks'
    ];

    const allTasks: Task[] = [];
    const seenIds = new Set<string>();

    for (const key of taskKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const tasks: Task[] = JSON.parse(stored);
          
          // Lọc duplicates và validate
          for (const task of tasks) {
            if (this.isValidTask(task) && !seenIds.has(task.id)) {
              seenIds.add(task.id);
              allTasks.push(task);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse localStorage key ${key}:`, error);
      }
    }

    console.log(`📋 Collected ${allTasks.length} unique valid tasks from localStorage`);
    return allTasks;
  }

  /**
   * Validate task data
   */
  private isValidTask(task: any): task is Task {
    return (
      task &&
      typeof task === 'object' &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.description === 'string' &&
      typeof task.type === 'string' &&
      typeof task.status === 'string' &&
      typeof task.date === 'string' &&
      task.title.trim().length > 0
    );
  }

  /**
   * Sync tasks to Supabase
   */
  private async syncTasks(
    localTasks: Task[], 
    supabaseTasks: Task[], 
    userId: string, 
    userName: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      details: []
    };

    // Tạo map của existing tasks để check duplicates
    const existingTasksMap = new Map<string, Task>();
    supabaseTasks.forEach(task => {
      // Check by ID và title+date combination
      existingTasksMap.set(task.id, task);
      const titleDateKey = `${task.title}_${task.date}_${task.user_id}`;
      existingTasksMap.set(titleDateKey, task);
    });

    for (const localTask of localTasks) {
      try {
        // Check if task already exists
        const titleDateKey = `${localTask.title}_${localTask.date}_${localTask.user_id || userId}`;
        
        if (existingTasksMap.has(localTask.id) || existingTasksMap.has(titleDateKey)) {
          result.skippedCount++;
          result.details.push(`Skipped duplicate: ${localTask.title}`);
          continue;
        }

        // Prepare task data for Supabase
        const taskData = this.prepareTaskForSupabase(localTask, userId, userName);

        // Insert to Supabase
        const insertedTask = await this.supabaseService.addTask(taskData);
        
        if (insertedTask) {
          result.syncedCount++;
          result.details.push(`Synced: ${localTask.title}`);
          console.log(`✅ Synced task: ${localTask.title}`);
        } else {
          throw new Error('Failed to insert task');
        }

      } catch (error) {
        result.errorCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`${localTask.title}: ${errorMsg}`);
        console.error(`❌ Failed to sync task ${localTask.title}:`, error);
      }
    }

    result.success = result.errorCount === 0;
    return result;
  }

  /**
   * Prepare task data for Supabase format
   */
  private prepareTaskForSupabase(localTask: Task, userId: string, userName: string): Partial<Task> {
    return {
      title: localTask.title,
      description: localTask.description,
      type: localTask.type === 'test' ? 'work' : localTask.type, // Fix type constraint
      status: localTask.status,
      priority: localTask.priority || 'normal',
      date: localTask.date,
      time: localTask.time || '09:00',
      progress: localTask.progress || 0,
      is_new: true,
      is_shared: localTask.isShared || false,
      is_shared_with_team: localTask.isSharedWithTeam || false,
      assigned_to: localTask.assignedTo || localTask.assigned_to || userId,
      user_id: localTask.user_id || userId,
      user_name: localTask.user_name || userName,
      team_id: localTask.team_id || '1',
      location: localTask.location || 'hanoi',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Clean up localStorage sau khi sync thành công
   */
  private cleanupLocalTasks(userId: string, syncedCount: number): void {
    try {
      const taskKeys = [
        `user_tasks_${userId}`,
        `tasks_${userId}`,
      ];

      for (const key of taskKeys) {
        localStorage.removeItem(key);
      }

      // Tạo backup record
      const backupKey = `sync_backup_${userId}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        syncedAt: new Date().toISOString(),
        syncedCount,
        userId,
        note: 'Tasks synced to Supabase and cleaned from localStorage'
      }));

      console.log(`🧹 Cleaned up localStorage after syncing ${syncedCount} tasks`);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup localStorage:', error);
    }
  }

  /**
   * Manual sync trigger (for testing)
   */
  public async manualSync(userId: string, userName: string): Promise<SyncResult> {
    console.log('🔧 Manual sync triggered');
    return this.autoSyncOnLogin(userId, userName);
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}
