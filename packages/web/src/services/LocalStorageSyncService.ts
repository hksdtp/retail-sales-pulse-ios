// LocalStorage to Firebase Sync Service
import { Task } from '../components/tasks/types/TaskTypes';
import { FirebaseService } from './FirebaseService';

export interface LocalStorageTask extends Task {
  isLocalOnly?: boolean;
  lastModified?: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

export class LocalStorageSyncService {
  private static instance: LocalStorageSyncService;
  private readonly STORAGE_KEY = 'retail_sales_tasks';
  private readonly SYNC_STATUS_KEY = 'retail_sales_sync_status';

  public static getInstance(): LocalStorageSyncService {
    if (!LocalStorageSyncService.instance) {
      LocalStorageSyncService.instance = new LocalStorageSyncService();
    }
    return LocalStorageSyncService.instance;
  }

  // Lấy tất cả tasks từ localStorage
  public getLocalTasks(): LocalStorageTask[] {
    try {
      const tasksJson = localStorage.getItem(this.STORAGE_KEY);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson) as LocalStorageTask[];
      console.log(`📱 Found ${tasks.length} tasks in localStorage`);
      return tasks;
    } catch (error) {
      console.error('❌ Error reading tasks from localStorage:', error);
      return [];
    }
  }

  // Lưu tasks vào localStorage
  public saveLocalTasks(tasks: LocalStorageTask[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log(`💾 Saved ${tasks.length} tasks to localStorage`);
    } catch (error) {
      console.error('❌ Error saving tasks to localStorage:', error);
    }
  }

  // Lấy trạng thái sync
  public getSyncStatus(): { lastSync: string | null; pendingCount: number } {
    try {
      const statusJson = localStorage.getItem(this.SYNC_STATUS_KEY);
      if (!statusJson) return { lastSync: null, pendingCount: 0 };
      
      return JSON.parse(statusJson);
    } catch (error) {
      console.error('❌ Error reading sync status:', error);
      return { lastSync: null, pendingCount: 0 };
    }
  }

  // Cập nhật trạng thái sync
  public updateSyncStatus(lastSync: string, pendingCount: number): void {
    try {
      const status = { lastSync, pendingCount };
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('❌ Error updating sync status:', error);
    }
  }

  // Đánh dấu task cần sync
  public markTaskForSync(task: Task): void {
    const localTasks = this.getLocalTasks();
    const existingIndex = localTasks.findIndex(t => t.id === task.id);
    
    const taskToSave: LocalStorageTask = {
      ...task,
      isLocalOnly: true,
      lastModified: new Date().toISOString(),
      syncStatus: 'pending'
    };

    if (existingIndex >= 0) {
      localTasks[existingIndex] = taskToSave;
    } else {
      localTasks.push(taskToSave);
    }

    this.saveLocalTasks(localTasks);
    console.log(`📝 Marked task "${task.title}" for sync`);
  }

  // Đồng bộ tất cả tasks lên Firebase
  public async syncAllToFirebase(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    console.log('🔄 Starting sync all tasks to Firebase...');
    
    const localTasks = this.getLocalTasks();
    const pendingTasks = localTasks.filter(task => task.syncStatus === 'pending' || task.isLocalOnly);
    
    if (pendingTasks.length === 0) {
      console.log('✅ No pending tasks to sync');
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    console.log(`📤 Found ${pendingTasks.length} tasks to sync to Firebase`);

    if (!FirebaseService.isConfigured()) {
      const error = 'Firebase not configured';
      console.error('❌', error);
      return { success: false, synced: 0, failed: pendingTasks.length, errors: [error] };
    }

    const firebaseService = FirebaseService.getInstance();
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Sync từng task
    for (const task of pendingTasks) {
      try {
        console.log(`🔄 Syncing task: "${task.title}" (${task.id})`);
        
        // Chuẩn bị data cho Firebase
        const firebaseTask = {
          ...task,
          created_at: task.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: 'localStorage_sync',
          // Xóa các field local-only
          isLocalOnly: undefined,
          lastModified: undefined,
          syncStatus: undefined
        };

        // Xóa các field undefined
        Object.keys(firebaseTask).forEach(key => {
          if (firebaseTask[key as keyof typeof firebaseTask] === undefined) {
            delete firebaseTask[key as keyof typeof firebaseTask];
          }
        });

        // Kiểm tra xem task đã tồn tại trên Firebase chưa
        const existingTasks = await firebaseService.queryDocuments('tasks', 'id', '==', task.id);
        
        if (existingTasks.length > 0) {
          // Update existing task
          await firebaseService.updateDocument('tasks', existingTasks[0].id, firebaseTask);
          console.log(`✅ Updated existing task: "${task.title}"`);
        } else {
          // Create new task
          const newId = await firebaseService.addDocument('tasks', firebaseTask);
          console.log(`✅ Created new task: "${task.title}" with ID: ${newId}`);
        }

        // Cập nhật trạng thái local
        const taskIndex = localTasks.findIndex(t => t.id === task.id);
        if (taskIndex >= 0) {
          localTasks[taskIndex].syncStatus = 'synced';
          localTasks[taskIndex].isLocalOnly = false;
        }

        syncedCount++;
      } catch (error) {
        console.error(`❌ Failed to sync task "${task.title}":`, error);
        failedCount++;
        errors.push(`Task "${task.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Đánh dấu task sync failed
        const taskIndex = localTasks.findIndex(t => t.id === task.id);
        if (taskIndex >= 0) {
          localTasks[taskIndex].syncStatus = 'failed';
        }
      }
    }

    // Cập nhật localStorage với trạng thái mới
    this.saveLocalTasks(localTasks);
    
    // Cập nhật sync status
    const remainingPending = localTasks.filter(t => t.syncStatus === 'pending').length;
    this.updateSyncStatus(new Date().toISOString(), remainingPending);

    const result = {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      errors
    };

    console.log('🎉 Sync completed:', result);
    return result;
  }

  // Xóa tasks đã sync thành công khỏi localStorage
  public cleanupSyncedTasks(): number {
    const localTasks = this.getLocalTasks();
    const beforeCount = localTasks.length;
    
    const remainingTasks = localTasks.filter(task => 
      task.syncStatus !== 'synced' || task.isLocalOnly
    );
    
    this.saveLocalTasks(remainingTasks);
    
    const cleanedCount = beforeCount - remainingTasks.length;
    console.log(`🧹 Cleaned up ${cleanedCount} synced tasks from localStorage`);
    
    return cleanedCount;
  }

  // Lấy thống kê sync
  public getSyncStats(): {
    total: number;
    pending: number;
    synced: number;
    failed: number;
    lastSync: string | null;
  } {
    const localTasks = this.getLocalTasks();
    const syncStatus = this.getSyncStatus();
    
    return {
      total: localTasks.length,
      pending: localTasks.filter(t => t.syncStatus === 'pending').length,
      synced: localTasks.filter(t => t.syncStatus === 'synced').length,
      failed: localTasks.filter(t => t.syncStatus === 'failed').length,
      lastSync: syncStatus.lastSync
    };
  }

  // Reset tất cả tasks về trạng thái pending để sync lại
  public resetAllTasksForSync(): void {
    const localTasks = this.getLocalTasks();
    localTasks.forEach(task => {
      task.syncStatus = 'pending';
      task.isLocalOnly = true;
    });
    
    this.saveLocalTasks(localTasks);
    this.updateSyncStatus('', localTasks.length);
    
    console.log(`🔄 Reset ${localTasks.length} tasks for re-sync`);
  }

  // Xóa tất cả dữ liệu local
  public clearAllLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SYNC_STATUS_KEY);
    console.log('🗑️ Cleared all local task data');
  }
}
