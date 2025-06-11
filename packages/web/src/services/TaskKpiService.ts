import { User } from '@/types/user';
import { Task } from '@/components/tasks/types/TaskTypes';
import { reportsDataService } from './ReportsDataService';

export interface TaskKpiData {
  title: string;
  value: string;
  oldValue: string;
  change: number;
  data: Array<{ value: number }>;
}

class TaskKpiService {
  private static instance: TaskKpiService;

  private constructor() {}

  public static getInstance(): TaskKpiService {
    if (!TaskKpiService.instance) {
      TaskKpiService.instance = new TaskKpiService();
    }
    return TaskKpiService.instance;
  }

  public getKpiDataForUser(currentUser: User | null, tasks: Task[] = []): TaskKpiData[] {
    if (!currentUser) return this.getDefaultKpiData();

    // Cập nhật logic phân quyền để sync với DashboardSyncService
    const isDirector = currentUser.role === 'director' || currentUser.name === 'Khổng Đức Mạnh';
    const isTeamLeader = currentUser.role === 'team_leader';

    console.log('🔄 TaskKpiService - User permissions:', {
      user: currentUser.name,
      role: currentUser.role,
      isDirector,
      isTeamLeader,
      tasksCount: tasks.length
    });

    if (isDirector) {
      return this.getDirectorKpiData(tasks);
    } else if (isTeamLeader) {
      return this.getTeamLeaderKpiData(currentUser, tasks);
    } else {
      return this.getEmployeeKpiData(currentUser, tasks);
    }
  }

  private getDirectorKpiData(tasks: Task[]): TaskKpiData[] {
    // Tổng KPI toàn phòng - tất cả tasks hoàn thành
    const completedTasks = tasks.filter(task => task.status === 'completed');

    // Tổng các loại công việc mới
    const totalKtsNew = completedTasks.filter(task => task.type === 'kts_new').length;
    const totalKhCdtNew = completedTasks.filter(task => task.type === 'kh_cdt_new').length;
    const totalSbgNew = completedTasks.filter(task => task.type === 'sbg_new').length;

    // Tổng các loại công việc cũ
    const totalKtsOld = completedTasks.filter(task => task.type === 'kts_old').length;
    const totalKhCdtOld = completedTasks.filter(task => task.type === 'kh_cdt_old').length;
    const totalSbgOld = completedTasks.filter(task => task.type === 'sbg_old').length;

    // Lấy tổng doanh số toàn phòng
    const salesMetrics = reportsDataService.getDashboardMetrics();

    return [
      {
        title: 'Tổng KTS',
        value: (totalKtsNew + totalKtsOld).toString(),
        oldValue: Math.round((totalKtsNew + totalKtsOld) * 0.8).toString(),
        change: (totalKtsNew + totalKtsOld) > 0 ? 15.2 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKtsNew + totalKtsOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng KH/CĐT',
        value: (totalKhCdtNew + totalKhCdtOld).toString(),
        oldValue: Math.round((totalKhCdtNew + totalKhCdtOld) * 0.8).toString(),
        change: (totalKhCdtNew + totalKhCdtOld) > 0 ? 12.3 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKhCdtNew + totalKhCdtOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng SBG',
        value: (totalSbgNew + totalSbgOld).toString(),
        oldValue: Math.round((totalSbgNew + totalSbgOld) * 0.8).toString(),
        change: (totalSbgNew + totalSbgOld) > 0 ? 18.7 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalSbgNew + totalSbgOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng doanh số',
        value: `${Math.round(salesMetrics.totalSales / 1000000000 * 1000) / 1000}B`,
        oldValue: `${Math.round(salesMetrics.totalSales * 0.8 / 1000000000 * 1000) / 1000}B`,
        change: 15.8,
        data: Array(10).fill(0).map(() => ({ value: salesMetrics.totalSales / 1000000 * (0.8 + Math.random() * 0.4) }))
      }
    ];
  }

  private getTeamLeaderKpiData(currentUser: User, tasks: Task[]): TaskKpiData[] {
    // Tổng KPI nhóm - lọc tasks của team cụ thể mà team leader quản lý
    const teamTasks = tasks.filter(task => {
      // Tasks cá nhân của team leader
      if (task.userId === currentUser.id || (task.assignedUsers && task.assignedUsers.includes(currentUser.id))) {
        return true;
      }

      // Tasks của team cụ thể mà user này quản lý
      if (task.teamId && currentUser.team_id && task.teamId === currentUser.team_id) {
        return true;
      }

      // Fallback: nếu không có teamId, dùng location nhưng chỉ cho team leader của location đó
      if (!task.teamId && task.location === currentUser.location && currentUser.role === 'team_leader') {
        return true;
      }

      return false;
    });
    const completedTasks = teamTasks.filter(task => task.status === 'completed');

    // Tổng các loại công việc mới của nhóm
    const totalKtsNew = completedTasks.filter(task => task.type === 'kts_new').length;
    const totalKhCdtNew = completedTasks.filter(task => task.type === 'kh_cdt_new').length;
    const totalSbgNew = completedTasks.filter(task => task.type === 'sbg_new').length;

    // Tổng các loại công việc cũ của nhóm
    const totalKtsOld = completedTasks.filter(task => task.type === 'kts_old').length;
    const totalKhCdtOld = completedTasks.filter(task => task.type === 'kh_cdt_old').length;
    const totalSbgOld = completedTasks.filter(task => task.type === 'sbg_old').length;

    // Lấy tổng doanh số nhóm từ ReportsDataService
    const teamData = reportsDataService.getEmployeesByLocation(currentUser.location || 'Hà Nội');
    const totalSales = teamData.reduce((sum, emp) => sum + emp.sales, 0);

    return [
      {
        title: 'Tổng KTS nhóm',
        value: (totalKtsNew + totalKtsOld).toString(),
        oldValue: Math.round((totalKtsNew + totalKtsOld) * 0.8).toString(),
        change: (totalKtsNew + totalKtsOld) > 0 ? 12.1 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKtsNew + totalKtsOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng KH/CĐT nhóm',
        value: (totalKhCdtNew + totalKhCdtOld).toString(),
        oldValue: Math.round((totalKhCdtNew + totalKhCdtOld) * 0.8).toString(),
        change: (totalKhCdtNew + totalKhCdtOld) > 0 ? 9.8 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKhCdtNew + totalKhCdtOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng SBG nhóm',
        value: (totalSbgNew + totalSbgOld).toString(),
        oldValue: Math.round((totalSbgNew + totalSbgOld) * 0.8).toString(),
        change: (totalSbgNew + totalSbgOld) > 0 ? 14.5 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalSbgNew + totalSbgOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng doanh số nhóm',
        value: `${Math.round(totalSales / 1000000000 * 1000) / 1000}B`,
        oldValue: `${Math.round(totalSales * 0.8 / 1000000000 * 1000) / 1000}B`,
        change: 14.2,
        data: Array(10).fill(0).map(() => ({ value: totalSales / 1000000 * (0.8 + Math.random() * 0.4) }))
      }
    ];
  }

  private getEmployeeKpiData(currentUser: User, tasks: Task[]): TaskKpiData[] {
    // KPI cá nhân - lọc tasks của bản thân (assignedTo hoặc user_id)
    const userTasks = tasks.filter(task =>
      task.user_id === currentUser.id || task.assignedTo === currentUser.id
    );
    const completedTasks = userTasks.filter(task => task.status === 'completed');

    console.log(`👤 Employee KPI for ${currentUser.name}:`, {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      userId: currentUser.id
    });

    // Tổng các loại công việc cá nhân - sử dụng đúng type names
    const totalKtsNew = completedTasks.filter(task => task.type === 'architect_new').length;
    const totalKhCdtNew = completedTasks.filter(task => task.type === 'client_new').length;
    const totalSbgNew = completedTasks.filter(task => task.type === 'partner_new').length;

    const totalKtsOld = completedTasks.filter(task => task.type === 'architect_old').length;
    const totalKhCdtOld = completedTasks.filter(task => task.type === 'client_old').length;
    const totalSbgOld = completedTasks.filter(task => task.type === 'partner_old').length;

    // Lấy dữ liệu doanh số cá nhân từ ReportsDataService
    const employee = reportsDataService.getEmployeeById(currentUser.id);
    const salesData = employee ? employee.sales : 0;
    const salesInBillions = (salesData / 1000000000).toFixed(2);
    const planInBillions = employee ? (employee.plan / 1000000000).toFixed(2) : '0.00';

    return [
      {
        title: 'Tổng KTS',
        value: (totalKtsNew + totalKtsOld).toString(),
        oldValue: Math.round((totalKtsNew + totalKtsOld) * 0.8).toString(),
        change: (totalKtsNew + totalKtsOld) > 0 ? 10.2 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKtsNew + totalKtsOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng KH/CĐT',
        value: (totalKhCdtNew + totalKhCdtOld).toString(),
        oldValue: Math.round((totalKhCdtNew + totalKhCdtOld) * 0.8).toString(),
        change: (totalKhCdtNew + totalKhCdtOld) > 0 ? 8.1 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalKhCdtNew + totalKhCdtOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Tổng SBG',
        value: (totalSbgNew + totalSbgOld).toString(),
        oldValue: Math.round((totalSbgNew + totalSbgOld) * 0.8).toString(),
        change: (totalSbgNew + totalSbgOld) > 0 ? 11.4 : 0,
        data: Array(10).fill(0).map(() => ({ value: (totalSbgNew + totalSbgOld) * (0.8 + Math.random() * 0.4) }))
      },
      {
        title: 'Doanh số cá nhân',
        value: `${salesInBillions}B`,
        oldValue: `${planInBillions}B (KH)`,
        change: employee ? Math.round(employee.rate - 100) : 0,
        data: Array(10).fill(0).map(() => ({ value: parseFloat(salesInBillions) * (0.8 + Math.random() * 0.4) }))
      }
    ];
  }

  private getDefaultKpiData(): TaskKpiData[] {
    return [
      {
        title: 'Tổng KTS',
        value: '0',
        oldValue: '0',
        change: 0,
        data: Array(10).fill(0).map(() => ({ value: 0 }))
      },
      {
        title: 'Tổng KH/CĐT',
        value: '0',
        oldValue: '0',
        change: 0,
        data: Array(10).fill(0).map(() => ({ value: 0 }))
      },
      {
        title: 'Tổng SBG',
        value: '0',
        oldValue: '0',
        change: 0,
        data: Array(10).fill(0).map(() => ({ value: 0 }))
      },
      {
        title: 'Doanh số cá nhân',
        value: '0.00B',
        oldValue: '0.00B (KH)',
        change: 0,
        data: Array(10).fill(0).map(() => ({ value: 0 }))
      }
    ];
  }

  public getTaskStats(tasks: Task[], userId?: string, location?: string, role?: string) {
    let filteredTasks = tasks;

    // Áp dụng filter theo phân quyền
    if (role === 'employee' && userId) {
      filteredTasks = tasks.filter(task => task.user_id === userId);
    } else if (role === 'team_leader' && userId) {
      // Team leader chỉ xem tasks của team cụ thể mà họ quản lý
      filteredTasks = tasks.filter(task => {
        // Tasks cá nhân
        if (task.userId === userId || (task.assignedUsers && task.assignedUsers.includes(userId))) {
          return true;
        }

        // Tasks của team cụ thể (cần có team_id của user để so sánh)
        // Tạm thời dùng location làm fallback
        if (location && task.location === location) {
          return true;
        }

        return false;
      });
    }
    // Director thấy tất cả

    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress').length;
    const todoTasks = filteredTasks.filter(task => task.status === 'todo').length;

    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }
}

export const taskKpiService = TaskKpiService.getInstance();
