// Service để quản lý đồng bộ hai chiều giữa web app và Google Sheets

import { googleSheetsService } from './GoogleSheetsService';
import { appsScriptGoogleSheetsService } from './AppsScriptGoogleSheetsService';
import { Task } from '@/components/tasks/types/TaskTypes';
import { mockTasks } from '@/data/mockTasks';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private isInitialSync: boolean = true;

  /**
   * Khởi tạo đồng bộ định kỳ
   * @param intervalInSeconds thời gian giữa các lần đồng bộ (giây)
   * @param onSyncSuccess callback được gọi khi đồng bộ thành công
   * @param onSyncError callback được gọi khi đồng bộ thất bại
   * @returns
   */
  startPeriodicSync(
    intervalSeconds: number = 300, // Mặc định 5 phút
    onSyncSuccess?: (tasks: Task[]) => void,
    onSyncError?: (error: Error) => void
  ): boolean {
    // Hủy chu kỳ đồng bộ cũ nếu đang có
    this.stopSync();
    
    // Kiểm tra đã cấu hình Google Sheets chưa
    if (!googleSheetsService.isConfigured() && !appsScriptGoogleSheetsService.isConfigured()) {
      const configError = new Error('Google Sheets chưa được cấu hình');
      if (onSyncError) {
        onSyncError(configError);
      }
      return false;
    }
    
    // Hàm gọi khi đến thời gian đồng bộ
    const syncFunction = async () => {
      try {
        // Lấy dữ liệu mới nhất
        const tasks = await this.fetchTasksFromGoogleSheets();
        
        if (onSyncSuccess) {
          onSyncSuccess(tasks);
        }
      } catch (error) {
        // Đảm bảo error luôn là một đối tượng Error để dễ xử lý
        const syncError = error instanceof Error 
          ? error 
          : new Error(typeof error === 'string' ? error : 'Lỗi không xác định khi đồng bộ');
        
        console.error('Lỗi khi đồng bộ:', { 
          error, 
          message: syncError.message, 
          stack: syncError.stack 
        });
        
        if (onSyncError) {
          onSyncError(syncError);
        }
      }
    };
    
    // Gọi lần đầu ngay lập tức
    syncFunction();
    
    // Thiết lập chu kỳ đồng bộ
    this.syncInterval = setInterval(syncFunction, intervalSeconds * 1000);
    
    return true;
  }

  /**
   * Dừng đồng bộ định kỳ
   */
  stopSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Đã dừng đồng bộ định kỳ');
    }
  }

  /**
   * Kiểm tra xem đã cấu hình Google Sheets chưa
   * @returns true nếu đã cấu hình
   */
  private isGoogleSheetsConfigured(): boolean {
    return (
      googleSheetsService.isConfigured() ||
      appsScriptGoogleSheetsService.isConfigured()
    );
  }

  /**
   * Lấy service đang được cấu hình
   */
  private getConfiguredService() {
    if (appsScriptGoogleSheetsService.isConfigured()) {
      return appsScriptGoogleSheetsService;
    }
    if (googleSheetsService.isConfigured()) {
      return googleSheetsService;
    }
    return null;
  }

  /**
   * Đồng bộ tasks giữa local và Google Sheets
   * @param onSync callback khi đồng bộ thành công
   * @returns Promise
   */
  async syncTasks(onSync: (tasks: Task[]) => void): Promise<void> {
    try {
      // Lấy tasks từ Google Sheets
      const tasks = await this.fetchTasksFromGoogleSheets();
      onSync(tasks);
      
      // Cập nhật thời gian đồng bộ cuối cùng
      this.lastSyncTime = Date.now();
      this.isInitialSync = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('Lỗi khi đồng bộ tasks:', { error, message: errorMessage });
      throw new Error(`Lỗi khi đồng bộ: ${errorMessage}`);
    }
  }

  /**
   * Lấy danh sách tasks từ Google Sheets
   * @returns Danh sách tasks
   */
  async fetchTasksFromGoogleSheets(): Promise<Task[]> {
    try {
      // Lấy service đã cấu hình
      const service = this.getConfiguredService();
      
      if (!service) {
        console.warn('Chưa cấu hình Google Sheets, sử dụng dữ liệu mẫu');
        return this.useMockData();
      }

      // Sử dụng phương thức fetchTasks từ service
      if ('fetchTasks' in service && typeof service.fetchTasks === 'function') {
        try {
          const tasks = await service.fetchTasks();
          if (tasks && tasks.length > 0) {
            return tasks;
          } else {
            console.warn('Không lấy được dữ liệu từ Google Sheets, sử dụng dữ liệu mẫu');
            return this.useMockData();
          }
        } catch (fetchError) {
          console.error('Lỗi khi lấy dữ liệu từ Google Sheets:', fetchError);
          return this.useMockData();
        }
      } else {
        console.warn('Phương thức fetchTasks không tồn tại trong service, sử dụng dữ liệu mẫu');
        return this.useMockData();
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu task:', error);
      return this.useMockData();
    }
  }
  
  /**
   * Sử dụng dữ liệu mẫu khi không thể kết nối với Google Sheets
   * @returns Danh sách tasks mẫu
   */
  private useMockData(): Task[] {
    console.log('Đang sử dụng dữ liệu mẫu để thay thế...');
    return mockTasks;
  }

  /**
   * Đồng bộ một task cụ thể lên Google Sheets
   * @param task Task cần đồng bộ
   * @returns Task đã đồng bộ
   */
  async syncTaskToGoogleSheets(task: Task): Promise<Task> {
    const service = this.getConfiguredService();
    
    if (!service) {
      throw new Error('Chưa cấu hình Google Sheets');
    }

    // Lưu task lên Google Sheets
    await service.saveTask(task);
    
    return task;
  }
  
  /**
   * Đồng bộ nhiều task cùng lúc
   * @param tasks Danh sách tasks cần đồng bộ
   * @returns Danh sách tasks đã đồng bộ
   */
  async syncMultipleTasksToGoogleSheets(tasks: Task[]): Promise<Task[]> {
    const results: Task[] = [];
    
    for (const task of tasks) {
      try {
        const syncedTask = await this.syncTaskToGoogleSheets(task);
        results.push(syncedTask);
      } catch (error) {
        console.error(`Lỗi khi đồng bộ task ${task.id}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Lấy thời gian đồng bộ cuối cùng
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }
  
  /**
   * Kiểm tra có phải lần đồng bộ đầu tiên không
   */
  isFirstSync(): boolean {
    return this.isInitialSync;
  }
}

// Export singleton instance
export const syncService = new SyncService();
