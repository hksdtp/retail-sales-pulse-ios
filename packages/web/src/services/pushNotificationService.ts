export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface TaskNotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    priority?: 'high' | 'medium' | 'low';
    status?: string[];
    dueInHours?: number;
    overdue?: boolean;
    assignedToMe?: boolean;
  };
  timing: {
    immediate?: boolean;
    beforeDue?: number; // hours
    daily?: string; // time like "09:00"
  };
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private permission: NotificationPermission = 'default';
  private rules: TaskNotificationRule[] = [];

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  constructor() {
    this.initializeDefaultRules();
    this.checkPermission();
  }

  // Initialize default notification rules
  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'high_priority_immediate',
        name: 'Công việc ưu tiên cao - Thông báo ngay',
        enabled: true,
        conditions: {
          priority: 'high',
          assignedToMe: true
        },
        timing: {
          immediate: true
        }
      },
      {
        id: 'due_in_2_hours',
        name: 'Sắp đến hạn - 2 giờ trước',
        enabled: true,
        conditions: {
          dueInHours: 2,
          assignedToMe: true
        },
        timing: {
          beforeDue: 2
        }
      },
      {
        id: 'overdue_tasks',
        name: 'Công việc quá hạn',
        enabled: true,
        conditions: {
          overdue: true,
          assignedToMe: true
        },
        timing: {
          immediate: true
        }
      },
      {
        id: 'daily_summary',
        name: 'Tóm tắt công việc hàng ngày',
        enabled: true,
        conditions: {
          assignedToMe: true
        },
        timing: {
          daily: '09:00'
        }
      },
      {
        id: 'team_urgent',
        name: 'Công việc khẩn cấp của nhóm',
        enabled: true,
        conditions: {
          priority: 'high',
          status: ['pending', 'in_progress']
        },
        timing: {
          immediate: true
        }
      }
    ];
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser không hỗ trợ notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        this.showWelcomeNotification();
      }
      
      return this.permission;
    } catch (error) {
      console.error('Lỗi khi xin quyền notification:', error);
      return 'denied';
    }
  }

  // Check current permission
  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Show welcome notification
  private showWelcomeNotification() {
    this.sendNotification({
      title: '🎉 Thông báo đã được bật!',
      body: 'Bạn sẽ nhận được thông báo về các công việc quan trọng.',
      icon: '/favicon.ico',
      tag: 'welcome'
    });
  }

  // Send push notification
  async sendNotification(config: PushNotificationConfig): Promise<boolean> {
    if (this.permission !== 'granted') {
      console.warn('Không có quyền gửi notification');
      return false;
    }

    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon || '/favicon.ico',
        badge: config.badge || '/favicon.ico',
        tag: config.tag,
        requireInteraction: config.requireInteraction || false,
        data: config.data
      });

      // Auto close after 5 seconds if not requiring interaction
      if (!config.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      // Handle click events
      notification.onclick = () => {
        window.focus();
        if (config.data?.url) {
          window.location.href = config.data.url;
        }
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Lỗi khi gửi notification:', error);
      return false;
    }
  }

  // Check and send task notifications
  checkTaskNotifications(tasks: any[], currentUserId: string) {
    if (this.permission !== 'granted') return;

    const now = new Date();
    
    tasks.forEach(task => {
      this.rules.forEach(rule => {
        if (!rule.enabled) return;
        
        if (this.shouldNotifyForTask(task, rule, currentUserId, now)) {
          this.sendTaskNotification(task, rule);
        }
      });
    });
  }

  // Check if should notify for a specific task
  private shouldNotifyForTask(task: any, rule: TaskNotificationRule, userId: string, now: Date): boolean {
    const conditions = rule.conditions;

    // Check if assigned to me
    if (conditions.assignedToMe && task.assignedTo !== userId) {
      return false;
    }

    // Check priority
    if (conditions.priority && task.priority !== conditions.priority) {
      return false;
    }

    // Check status
    if (conditions.status && !conditions.status.includes(task.status)) {
      return false;
    }

    // Check if overdue
    if (conditions.overdue) {
      const dueDate = new Date(task.dueDate || task.date);
      if (dueDate >= now) return false;
    }

    // Check due in hours
    if (conditions.dueInHours) {
      const dueDate = new Date(task.dueDate || task.date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDue > conditions.dueInHours || hoursUntilDue < 0) {
        return false;
      }
    }

    return true;
  }

  // Send task-specific notification
  private sendTaskNotification(task: any, rule: TaskNotificationRule) {
    let title = '';
    let body = '';
    let requireInteraction = false;

    switch (rule.id) {
      case 'high_priority_immediate':
        title = '🔥 Công việc ưu tiên cao!';
        body = `"${task.title}" cần được xử lý ngay`;
        requireInteraction = true;
        break;
        
      case 'due_in_2_hours':
        title = '⏰ Sắp đến hạn!';
        body = `"${task.title}" sẽ đến hạn trong 2 giờ`;
        break;
        
      case 'overdue_tasks':
        title = '🚨 Công việc quá hạn!';
        body = `"${task.title}" đã quá hạn`;
        requireInteraction = true;
        break;
        
      case 'team_urgent':
        title = '👥 Công việc nhóm khẩn cấp!';
        body = `"${task.title}" cần sự chú ý của nhóm`;
        break;
        
      default:
        title = '📋 Thông báo công việc';
        body = `"${task.title}"`;
    }

    this.sendNotification({
      title,
      body,
      tag: `task_${task.id}`,
      requireInteraction,
      data: {
        taskId: task.id,
        url: `/tasks?highlight=${task.id}`
      }
    });
  }

  // Send daily summary
  sendDailySummary(tasks: any[], userId: string) {
    const myTasks = tasks.filter(t => t.assignedTo === userId);
    const pendingCount = myTasks.filter(t => t.status === 'pending').length;
    const overdueCount = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate || t.date);
      return dueDate < new Date() && t.status !== 'completed';
    }).length;

    let body = `Bạn có ${pendingCount} công việc đang chờ`;
    if (overdueCount > 0) {
      body += `, ${overdueCount} công việc quá hạn`;
    }

    this.sendNotification({
      title: '📊 Tóm tắt công việc hôm nay',
      body,
      tag: 'daily_summary',
      data: { url: '/tasks' }
    });
  }

  // Get notification rules
  getRules(): TaskNotificationRule[] {
    return [...this.rules];
  }

  // Update rule
  updateRule(ruleId: string, updates: Partial<TaskNotificationRule>) {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      this.saveRulesToStorage();
    }
  }

  // Save rules to localStorage
  private saveRulesToStorage() {
    localStorage.setItem('notification_rules', JSON.stringify(this.rules));
  }

  // Load rules from localStorage
  private loadRulesFromStorage() {
    try {
      const saved = localStorage.getItem('notification_rules');
      if (saved) {
        this.rules = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Lỗi khi load notification rules:', error);
    }
  }

  // Schedule daily notifications
  scheduleDailyNotifications() {
    const dailyRules = this.rules.filter(r => r.enabled && r.timing.daily);
    
    dailyRules.forEach(rule => {
      const [hours, minutes] = rule.timing.daily!.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime();
      
      setTimeout(() => {
        // This would trigger daily summary
        console.log(`Scheduled notification for rule: ${rule.name}`);
      }, timeUntilNotification);
    });
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
