import { Notification } from '@/components/notifications/NotificationCenter';
import { personalPlanService } from './personalPlanService';

export interface NotificationBadge {
  count: number;
  type: 'info' | 'warning' | 'error' | 'success';
  urgent?: boolean;
}

export interface MenuNotifications {
  dashboard: NotificationBadge | null;
  tasks: NotificationBadge | null;
  calendar: NotificationBadge | null;
  curtainDesign: NotificationBadge | null;
  employees: NotificationBadge | null;
}

class NotificationService {
  private readonly STORAGE_KEY = 'notifications';
  private readonly MAX_NOTIFICATIONS = 50; // Giới hạn số thông báo

  // Lấy tất cả thông báo
  getNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }

  // Lưu thông báo
  private saveNotifications(notifications: Notification[]): void {
    try {
      // Giới hạn số lượng thông báo
      const limited = notifications.slice(0, this.MAX_NOTIFICATIONS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Tạo thông báo mới khi tạo công việc
  createTaskNotification(
    taskId: string,
    taskTitle: string,
    creatorId: string,
    creatorName: string,
  ): void {
    const notification: Notification = {
      id: `task_created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'task_created',
      title: 'Công việc mới được tạo',
      message: `${creatorName} đã tạo công việc mới`,
      taskId,
      taskTitle,
      userId: creatorId,
      userName: creatorName,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.addNotification(notification);
  }

  // Tạo thông báo khi cập nhật công việc
  updateTaskNotification(
    taskId: string,
    taskTitle: string,
    updaterId: string,
    updaterName: string,
    changes: string,
  ): void {
    const notification: Notification = {
      id: `task_updated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'task_updated',
      title: 'Công việc được cập nhật',
      message: `${updaterName} đã cập nhật: ${changes}`,
      taskId,
      taskTitle,
      userId: updaterId,
      userName: updaterName,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.addNotification(notification);
  }

  // Tạo thông báo khi thay đổi trạng thái
  statusChangeNotification(
    taskId: string,
    taskTitle: string,
    userId: string,
    userName: string,
    oldStatus: string,
    newStatus: string,
  ): void {
    const statusMapping: Record<string, string> = {
      'todo': 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Tạm dừng',
      'completed': 'Hoàn thành',
    };

    const notification: Notification = {
      id: `status_changed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'status_changed',
      title: 'Trạng thái công việc thay đổi',
      message: `${userName} đã chuyển từ "${statusMapping[oldStatus]}" sang "${statusMapping[newStatus]}"`,
      taskId,
      taskTitle,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: {
        oldStatus,
        newStatus,
      },
    };

    this.addNotification(notification);
  }

  // Tạo thông báo khi thay đổi độ ưu tiên
  priorityChangeNotification(
    taskId: string,
    taskTitle: string,
    userId: string,
    userName: string,
    oldPriority: string,
    newPriority: string,
  ): void {
    const priorityMapping: Record<string, string> = {
      low: 'Thấp',
      normal: 'Bình thường',
      high: 'Cao',
    };

    const notification: Notification = {
      id: `priority_changed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'priority_changed',
      title: 'Độ ưu tiên thay đổi',
      message: `${userName} đã thay đổi độ ưu tiên từ "${priorityMapping[oldPriority]}" sang "${priorityMapping[newPriority]}"`,
      taskId,
      taskTitle,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata: {
        oldPriority,
        newPriority,
      },
    };

    this.addNotification(notification);
  }

  // Thêm thông báo vào danh sách
  private addNotification(notification: Notification): void {
    const notifications = this.getNotifications();

    // Thêm vào đầu danh sách (mới nhất trước)
    notifications.unshift(notification);

    // Lưu lại
    this.saveNotifications(notifications);

    // Trigger event để update UI
    this.triggerNotificationUpdate();
  }

  // Đánh dấu đã đọc
  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    );
    this.saveNotifications(updated);
    this.triggerNotificationUpdate();
  }

  // Đánh dấu tất cả đã đọc
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    this.saveNotifications(updated);
    this.triggerNotificationUpdate();
  }

  // Xóa thông báo
  deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.filter((n) => n.id !== notificationId);
    this.saveNotifications(updated);
    this.triggerNotificationUpdate();
  }

  // Xóa tất cả thông báo
  clearAllNotifications(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.triggerNotificationUpdate();
  }

  // Lấy số thông báo chưa đọc
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter((n) => !n.isRead).length;
  }

  // Lấy thông báo theo task ID
  getNotificationsByTaskId(taskId: string): Notification[] {
    const notifications = this.getNotifications();
    return notifications.filter((n) => n.taskId === taskId);
  }

  // Trigger event để update UI (có thể dùng EventEmitter hoặc custom event)
  private triggerNotificationUpdate(): void {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }

  // Subscribe to notification updates
  onNotificationUpdate(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('notificationsUpdated', handler);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('notificationsUpdated', handler);
    };
  }

  // Lọc thông báo theo user role
  getNotificationsForRole(userRole: string, userId: string): Notification[] {
    const notifications = this.getNotifications();

    // Trưởng phòng xem tất cả thông báo
    if (userRole === 'retail_director' || userRole === 'project_director') {
      return notifications;
    }

    // Team leader chỉ xem thông báo của team mình
    if (userRole === 'team_leader') {
      // TODO: Filter by team - cần thêm team_id vào notification
      return notifications;
    }

    // Nhân viên không xem thông báo
    return [];
  }

  // Get menu notifications for badges
  getMenuNotifications(userId: string): MenuNotifications {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Get pending tasks from localStorage (simplified for now)
    const pendingTasks: any[] = []; // TODO: Implement task service
    const overdueTasks: any[] = [];

    // Get today's plans
    const todayPlans = personalPlanService.getUserPlans(userId).filter(plan =>
      plan.startDate === todayString
    );

    // Get urgent plans (high priority)
    const urgentPlans = todayPlans.filter(plan => plan.priority === 'high');

    return {
      dashboard: null, // Dashboard doesn't need badges

      tasks: pendingTasks.length > 0 ? {
        count: overdueTasks.length > 0 ? overdueTasks.length : pendingTasks.length,
        type: overdueTasks.length > 0 ? 'error' : 'info',
        urgent: overdueTasks.length > 0
      } : null,

      calendar: todayPlans.length > 0 ? {
        count: urgentPlans.length > 0 ? urgentPlans.length : todayPlans.length,
        type: urgentPlans.length > 0 ? 'warning' : 'info',
        urgent: urgentPlans.length > 0
      } : null,

      curtainDesign: null, // No notifications for design tool

      employees: null // No notifications for employees page
    };
  }

  getBadgeColor(badge: NotificationBadge): string {
    switch (badge.type) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  }

  shouldPulse(badge: NotificationBadge): boolean {
    return badge.urgent || badge.type === 'error';
  }

  // Tạo thông báo test (cho development)
  createTestNotification(): void {
    const testNotification: Notification = {
      id: `test_${Date.now()}`,
      type: 'task_created',
      title: 'Thông báo test',
      message: 'Đây là thông báo test để kiểm tra hệ thống',
      taskId: 'test_task_id',
      taskTitle: 'Công việc test',
      userId: 'test_user',
      userName: 'Test User',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.addNotification(testNotification);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
