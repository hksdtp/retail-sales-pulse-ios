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
      // Team leader: xem tasks của team (cùng location) + cá nhân
      return tasks.filter(task => 
        task.location === user.location || 
        task.userId === user.id || 
        (task.assignedUsers && task.assignedUsers.includes(user.id))
      );
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

    // KPI từ tasks - KTS (Kiến trúc sư)
    const ktsData = this.calculateTaskKpi(completedTasks, 'kts');
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

    // KPI từ tasks - KH/CĐT (Khách hàng/Chủ đầu tư)
    const khCdtData = this.calculateTaskKpi(completedTasks, 'kh_cdt');
    const khCdtTitle = permissions.canViewAll ? 'Tổng KH/CĐT' :
                       permissions.canViewTeam ? 'KH/CĐT Nhóm' : 'KH/CĐT Cá nhân';
    cards.push({
      title: khCdtTitle,
      value: khCdtData.total.toString(),
      oldValue: Math.round(khCdtData.total * 0.8).toString(),
      change: khCdtData.total > 0 ? 12.3 : 0,
      data: this.generateTrendData(khCdtData.total),
      category: 'task',
      details: khCdtData
    });

    // KPI từ tasks - SBG (Sàn bán gỗ)
    const sbgData = this.calculateTaskKpi(completedTasks, 'sbg');
    const sbgTitle = permissions.canViewAll ? 'Tổng SBG' :
                     permissions.canViewTeam ? 'SBG Nhóm' : 'SBG Cá nhân';
    cards.push({
      title: sbgTitle,
      value: sbgData.total.toString(),
      oldValue: Math.round(sbgData.total * 0.8).toString(),
      change: sbgData.total > 0 ? 18.7 : 0,
      data: this.generateTrendData(sbgData.total),
      category: 'task',
      details: sbgData
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
   * Tính toán KPI từ tasks theo loại
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
