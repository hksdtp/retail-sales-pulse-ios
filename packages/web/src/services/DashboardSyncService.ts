// Service đồng bộ dữ liệu KPI từ tasks và reports cho dashboard
import { Task } from '@/components/tasks/types/TaskTypes';
import { User } from '@/types/user';
import { reportsDataService } from '@/services/ReportsDataService';

export interface SyncedKpiData {
  title: string;
  value: string;
  oldValue: string;
  change: number;
  data: Array<{ value: number }>;
  category: 'task' | 'sales' | 'combined';
  details?: {
    new: number;
    old: number;
    total: number;
  };
}

export interface DashboardData {
  kpiCards: SyncedKpiData[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalSales: number;
    completionRate: number;
  };
  permissions: {
    canViewAll: boolean;
    canViewTeam: boolean;
    canViewPersonal: boolean;
  };
}

class DashboardSyncService {
  private static instance: DashboardSyncService;

  private constructor() {}

  public static getInstance(): DashboardSyncService {
    if (!DashboardSyncService.instance) {
      DashboardSyncService.instance = new DashboardSyncService();
    }
    return DashboardSyncService.instance;
  }

  /**
   * Lấy dữ liệu dashboard đồng bộ cho user
   */
  public getSyncedDashboardData(currentUser: User | null, tasks: Task[] = []): DashboardData {
    if (!currentUser) {
      return this.getDefaultDashboardData();
    }

    try {
      const permissions = this.getUserPermissions(currentUser);
      const filteredTasks = this.filterTasksByPermissions(tasks, currentUser, permissions);

      // Safe call to reportsDataService
      let salesData;
      try {
        salesData = reportsDataService.getDashboardMetrics();
      } catch (error) {
        console.warn('⚠️ Failed to get sales data, using fallback:', error);
        salesData = {
          totalSales: 0,
          regionData: { hanoi: { sales: 0 }, hcm: { sales: 0 } },
          topPerformers: []
        };
      }

      console.log('🔄 Syncing dashboard data for:', {
        user: currentUser.name,
        role: currentUser.role,
        location: currentUser.location,
        tasksCount: filteredTasks.length,
        permissions
      });

      const kpiCards = this.generateKpiCards(currentUser, filteredTasks, salesData, permissions);
      const summary = this.generateSummary(filteredTasks, salesData, permissions);

      return {
        kpiCards,
        summary,
        permissions
      };
    } catch (error) {
      console.error('❌ Error in getSyncedDashboardData:', error);
      return this.getDefaultDashboardData();
    }
  }

  /**
   * Xác định quyền hạn của user
   */
  private getUserPermissions(user: User): DashboardData['permissions'] {
    const isDirector = user.role === 'director' || user.name === 'Khổng Đức Mạnh';
    const isTeamLeader = user.role === 'team_leader';

    return {
      canViewAll: isDirector,
      canViewTeam: isDirector || isTeamLeader,
      canViewPersonal: true
    };
  }

  /**
   * Lọc tasks theo quyền hạn
   */
  private filterTasksByPermissions(tasks: Task[], user: User, permissions: DashboardData['permissions']): Task[] {
    if (permissions.canViewAll) {
      // Director: xem tất cả tasks
      return tasks;
    } else if (permissions.canViewTeam) {
      // Team leader: chỉ xem tasks của team cụ thể mà họ quản lý + cá nhân
      return tasks.filter(task => {
        // Tasks cá nhân
        if (task.userId === user.id || (task.assignedUsers && task.assignedUsers.includes(user.id))) {
          return true;
        }

        // Tasks của team cụ thể mà user này quản lý
        // Kiểm tra team_id thay vì location để đảm bảo chỉ xem team của mình
        if (task.teamId && user.team_id && task.teamId === user.team_id) {
          return true;
        }

        // Fallback: nếu không có teamId, dùng location nhưng chỉ cho team leader của location đó
        if (!task.teamId && task.location === user.location && user.role === 'team_leader') {
          return true;
        }

        return false;
      });
    } else {
      // Employee: chỉ xem tasks cá nhân
      return tasks.filter(task =>
        task.userId === user.id ||
        (task.assignedUsers && task.assignedUsers.includes(user.id))
      );
    }
  }

  /**
   * Tạo KPI cards từ dữ liệu tasks và sales
   */
  private generateKpiCards(
    user: User,
    tasks: Task[],
    salesData: any,
    permissions: DashboardData['permissions']
  ): SyncedKpiData[] {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const cards: SyncedKpiData[] = [];

    console.log('📊 Generating KPI cards:', {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      taskTypes: [...new Set(tasks.map(t => t.type))],
      permissions
    });

    // KPI từ tasks - KTS (Kiến trúc sư)
    const ktsData = this.calculateTaskKpiByCategory(tasks, ['architect_new', 'architect_old']);
    const ktsTitle = permissions.canViewAll ? 'Tổng KTS' :
                     permissions.canViewTeam ? 'KTS Nhóm' : 'KTS Cá nhân';
    cards.push({
      title: ktsTitle,
      value: ktsData.total.toString(),
      oldValue: Math.round(ktsData.total * 0.8).toString(),
      change: ktsData.total > 0 ? 15.2 : 0,
      data: this.generateTrendData(ktsData.total),
      category: 'task',
      details: ktsData
    });

    // KPI từ tasks - Đối tác
    const partnerData = this.calculateTaskKpiByCategory(tasks, ['partner_new', 'partner_old']);
    const partnerTitle = permissions.canViewAll ? 'Tổng Đối tác' :
                         permissions.canViewTeam ? 'Đối tác Nhóm' : 'Đối tác Cá nhân';
    cards.push({
      title: partnerTitle,
      value: partnerData.total.toString(),
      oldValue: Math.round(partnerData.total * 0.8).toString(),
      change: partnerData.total > 0 ? 12.3 : 0,
      data: this.generateTrendData(partnerData.total),
      category: 'task',
      details: partnerData
    });

    // KPI từ tasks - Khách hàng
    const clientData = this.calculateTaskKpiByCategory(tasks, ['client_new', 'client_old']);
    const clientTitle = permissions.canViewAll ? 'Tổng Khách hàng' :
                        permissions.canViewTeam ? 'Khách hàng Nhóm' : 'Khách hàng Cá nhân';
    cards.push({
      title: clientTitle,
      value: clientData.total.toString(),
      oldValue: Math.round(clientData.total * 0.8).toString(),
      change: clientData.total > 0 ? 18.7 : 0,
      data: this.generateTrendData(clientData.total),
      category: 'task',
      details: clientData
    });

    // KPI từ tasks - Báo giá
    const quoteData = this.calculateTaskKpiByCategory(tasks, ['quote_new', 'quote_old']);
    const quoteTitle = permissions.canViewAll ? 'Tổng Báo giá' :
                       permissions.canViewTeam ? 'Báo giá Nhóm' : 'Báo giá Cá nhân';
    cards.push({
      title: quoteTitle,
      value: quoteData.total.toString(),
      oldValue: Math.round(quoteData.total * 0.8).toString(),
      change: quoteData.total > 0 ? 22.1 : 0,
      data: this.generateTrendData(quoteData.total),
      category: 'task',
      details: quoteData
    });

    // KPI từ tasks - Công việc khác
    const otherData = this.calculateTaskKpiByCategory(tasks, ['other']);
    const otherTitle = permissions.canViewAll ? 'Tổng Công việc khác' :
                       permissions.canViewTeam ? 'Công việc khác Nhóm' : 'Công việc khác Cá nhân';
    cards.push({
      title: otherTitle,
      value: otherData.total.toString(),
      oldValue: Math.round(otherData.total * 0.8).toString(),
      change: otherData.total > 0 ? 8.5 : 0,
      data: this.generateTrendData(otherData.total),
      category: 'task',
      details: otherData
    });

    // KPI từ reports - Doanh số
    const salesValue = this.calculateSalesKpi(salesData, user, permissions);
    const salesTitle = permissions.canViewAll ? 'Tổng Doanh Số' :
                       permissions.canViewTeam ? 'Doanh Số Nhóm' : 'Doanh Số Cá nhân';
    cards.push({
      title: salesTitle,
      value: this.formatCurrency(salesValue.current),
      oldValue: this.formatCurrency(salesValue.previous),
      change: salesValue.change,
      data: this.generateTrendData(salesValue.current / 1000000), // Convert to millions for chart
      category: 'sales'
    });

    return cards;
  }

  /**
   * Tính KPI từ tasks theo danh mục cụ thể
   */
  private calculateTaskKpiByCategory(tasks: Task[], taskTypes: string[]) {
    const categoryTasks = tasks.filter(task => taskTypes.includes(task.type));

    const total = categoryTasks.length;
    const completed = categoryTasks.filter(task => task.status === 'completed').length;
    const inProgress = categoryTasks.filter(task => task.status === 'in-progress').length;
    const onHold = categoryTasks.filter(task => task.status === 'on-hold').length;
    const todo = categoryTasks.filter(task => task.status === 'todo').length;

    console.log(`📊 Task KPI calculation for types [${taskTypes.join(', ')}]:`, {
      total,
      completed,
      inProgress,
      onHold,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      allTasksCount: tasks.length,
      breakdown: taskTypes.map(type => ({
        type,
        count: categoryTasks.filter(task => task.type === type).length
      }))
    });

    return {
      total,
      completed,
      inProgress,
      onHold,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      taskTypes: taskTypes,
      breakdown: taskTypes.map(type => ({
        type,
        count: categoryTasks.filter(task => task.type === type).length,
        completed: categoryTasks.filter(task => task.type === type && task.status === 'completed').length
      }))
    };
  }

  /**
   * Tính toán KPI từ tasks theo loại (chỉ completed - method cũ)
   */
  private calculateTaskKpi(completedTasks: Task[], type: string): { new: number; old: number; total: number } {
    const newTasks = completedTasks.filter(task => task.type === `${type}_new`).length;
    const oldTasks = completedTasks.filter(task => task.type === `${type}_old`).length;

    return {
      new: newTasks,
      old: oldTasks,
      total: newTasks + oldTasks
    };
  }

  /**
   * Tính toán KPI doanh số từ reports
   */
  private calculateSalesKpi(salesData: any, user: User, permissions: DashboardData['permissions']): {
    current: number;
    previous: number;
    change: number;
  } {
    let currentSales = 0;
    let previousSales = 0;

    if (permissions.canViewAll) {
      // Director: tổng doanh số toàn phòng
      currentSales = salesData.totalSales || 0;
      previousSales = currentSales * 0.85; // Giả lập dữ liệu tháng trước
    } else if (permissions.canViewTeam) {
      // Team leader: doanh số theo location
      const locationData = user.location === 'Hà Nội' ? salesData.regionData?.hanoi : salesData.regionData?.hcm;
      currentSales = locationData?.sales || 0;
      previousSales = currentSales * 0.9;
    } else {
      // Employee: doanh số cá nhân
      const employeeData = salesData.topPerformers?.find((emp: any) => emp.name === user.name);
      currentSales = employeeData?.sales || 0;
      previousSales = currentSales * 0.95;
    }

    const change = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0;

    return {
      current: currentSales,
      previous: previousSales,
      change: Math.round(change * 10) / 10
    };
  }

  /**
   * Tạo summary data
   */
  private generateSummary(tasks: Task[], salesData: any, permissions: DashboardData['permissions']): DashboardData['summary'] {
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    let totalSales = 0;
    if (permissions.canViewAll) {
      totalSales = salesData.totalSales || 0;
    } else {
      // Tính doanh số theo quyền hạn
      totalSales = salesData.regionData?.hanoi?.sales || 0;
    }

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalSales,
      completionRate: Math.round(completionRate * 10) / 10
    };
  }

  /**
   * Tạo dữ liệu trend cho chart
   */
  private generateTrendData(baseValue: number): Array<{ value: number }> {
    return Array(10).fill(0).map((_, index) => ({
      value: Math.max(0, baseValue * (0.7 + Math.random() * 0.6) + (index * 0.1))
    }));
  }

  /**
   * Format currency theo VND
   */
  private formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ VND`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu VND`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K VND`;
    } else if (value > 0) {
      return `${value.toLocaleString('vi-VN')} VND`;
    }
    return '0 VND';
  }

  /**
   * Default dashboard data
   */
  private getDefaultDashboardData(): DashboardData {
    return {
      kpiCards: [],
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        totalSales: 0,
        completionRate: 0
      },
      permissions: {
        canViewAll: false,
        canViewTeam: false,
        canViewPersonal: false
      }
    };
  }
}

export const dashboardSyncService = DashboardSyncService.getInstance();
