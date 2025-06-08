import { User } from '@/types/user';

export interface EmployeePerformance {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  sales: number;
  deals: number;
  completion: number;
  contribution: number;
  badge: 'excellent' | 'good' | 'average' | 'poor';
  trend: string;
  monthlyData: string[];
  notes: string[];
  plan: number;
  rate: number;
}

export interface DashboardMetrics {
  totalSales: number;
  totalDeals: number;
  averageCompletion: number;
  topPerformers: EmployeePerformance[];
  regionData: {
    hanoi: { sales: number; employees: number };
    hcm: { sales: number; employees: number };
  };
  monthlyTrend: Array<{
    month: string;
    sales: number;
    target: number;
  }>;
}

class ReportsDataService {
  private static instance: ReportsDataService;
  private employeeData: EmployeePerformance[] = [];

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): ReportsDataService {
    if (!ReportsDataService.instance) {
      ReportsDataService.instance = new ReportsDataService();
    }
    return ReportsDataService.instance;
  }

  private initializeData() {
    this.employeeData = [
      {
        id: 'nga_hcm',
        name: 'Nguyễn Thị Nga',
        role: 'Nhân viên',
        location: 'HCM',
        avatar: 'N',
        sales: 2580000000,
        deals: 25,
        completion: 135,
        contribution: 53.67,
        badge: 'excellent',
        trend: '📈 Xuất sắc nhất',
        monthlyData: ['T1: +520tr', 'T2: +480tr', 'T3: +650tr', 'T4: +580tr', 'T5: +350tr'],
        notes: ['🏆 Top performer', '📈 Tăng trưởng ổn định', '💪 Vượt mục tiêu 135%'],
        plan: 1900000000,
        rate: 135.8
      },
      {
        id: 'huong_hn',
        name: 'Phạm Thị Hương',
        role: 'Nhân viên',
        location: 'Hà Nội',
        avatar: 'H',
        sales: 1310000000,
        deals: 20,
        completion: 125,
        contribution: 27.01,
        badge: 'excellent',
        trend: '📈 Rất ổn định',
        monthlyData: ['T1: +0.9tr', 'T2: 0tr', 'T3: +74tr', 'T4: +504.1tr', 'T5: +729.4tr'],
        notes: ['👍 Hiệu suất tốt', '🚀 Đỉnh cao T5: 729.4tr', '📈 Xu hướng tăng'],
        plan: 1050000000,
        rate: 124.8
      },
      {
        id: 'anh_hn',
        name: 'Lương Việt Anh',
        role: 'Nhóm trưởng',
        location: 'Hà Nội',
        avatar: 'A',
        sales: 1150000000,
        deals: 18,
        completion: 120,
        contribution: 23.73,
        badge: 'good',
        trend: '📈 Rất ổn định',
        monthlyData: ['T1: -4.6tr', 'T2: +406.8tr', 'T3: +250.3tr', 'T4: +229.5tr', 'T5: +267.1tr'],
        notes: ['👍 Hiệu suất tốt', '📉 1 tháng âm', '📈 Xu hướng tăng'],
        plan: 960000000,
        rate: 119.8
      },
      {
        id: 'thao_hn',
        name: 'Nguyễn Thị Thảo',
        role: 'Nhân viên',
        location: 'Hà Nội',
        avatar: 'T',
        sales: 1090000000,
        deals: 16,
        completion: 118,
        contribution: 22.49,
        badge: 'good',
        trend: '📊 Bùng nổ T5',
        monthlyData: ['T1: +45tr', 'T2: +120tr', 'T3: +180tr', 'T4: +200tr', 'T5: +545tr'],
        notes: ['📈 Xu hướng tăng', '🚀 Bùng nổ T5', '💪 Tiềm năng cao'],
        plan: 920000000,
        rate: 118.5
      },
      {
        id: 'duy_hn',
        name: 'Lê Khánh Duy',
        role: 'Nhân viên',
        location: 'Hà Nội',
        avatar: 'D',
        sales: 480000000,
        deals: 12,
        completion: 85,
        contribution: 9.91,
        badge: 'average',
        trend: '📊 Ổn định',
        monthlyData: ['T1: -3.4tr', 'T2: +12.6tr', 'T3: 0tr', 'T4: +425.3tr', 'T5: +43.2tr'],
        notes: ['📉 1 tháng âm', '📈 Xu hướng tăng', '⚠️ Cần cải thiện'],
        plan: 560000000,
        rate: 85.7
      },
      {
        id: 'bon_hcm',
        name: 'Trịnh Thị Bốn',
        role: 'Nhân viên',
        location: 'HCM',
        avatar: 'B',
        sales: 620000000,
        deals: 10,
        completion: 78,
        contribution: 12.81,
        badge: 'average',
        trend: '📊 Không ổn định',
        monthlyData: ['T1: +80tr', 'T2: +150tr', 'T3: +90tr', 'T4: +200tr', 'T5: +100tr'],
        notes: ['📊 Biến động', '⚠️ Cần ổn định', '💪 Có tiềm năng'],
        plan: 800000000,
        rate: 77.5
      },
      {
        id: 'quan_hn',
        name: 'Lê Tiến Quân',
        role: 'Nhân viên',
        location: 'Hà Nội',
        avatar: 'Q',
        sales: 0,
        deals: 0,
        completion: 0,
        contribution: 0,
        badge: 'poor',
        trend: 'Chưa có dữ liệu',
        monthlyData: ['T1: 0tr', 'T2: 0tr', 'T3: 0tr', 'T4: 0tr', 'T5: 0tr'],
        notes: ['⚠️ Cần can thiệp ngay', '📞 Liên hệ khẩn cấp'],
        plan: 500000000,
        rate: 0
      }
    ];
  }

  public getAllEmployees(): EmployeePerformance[] {
    return this.employeeData;
  }

  public getEmployeeById(id: string): EmployeePerformance | undefined {
    return this.employeeData.find(emp => emp.id === id);
  }

  public getEmployeesByLocation(location: string): EmployeePerformance[] {
    return this.employeeData.filter(emp => 
      emp.location.toLowerCase() === location.toLowerCase()
    );
  }

  public getTopPerformers(limit: number = 3): EmployeePerformance[] {
    return this.employeeData
      .filter(emp => emp.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  public getDashboardMetrics(): DashboardMetrics {
    const totalSales = this.employeeData.reduce((sum, emp) => sum + emp.sales, 0);
    const totalDeals = this.employeeData.reduce((sum, emp) => sum + emp.deals, 0);
    const averageCompletion = this.employeeData.reduce((sum, emp) => sum + emp.completion, 0) / this.employeeData.length;
    
    const hanoiEmployees = this.getEmployeesByLocation('Hà Nội');
    const hcmEmployees = this.getEmployeesByLocation('HCM');
    
    const hanoiSales = hanoiEmployees.reduce((sum, emp) => sum + emp.sales, 0);
    const hcmSales = hcmEmployees.reduce((sum, emp) => sum + emp.sales, 0);

    return {
      totalSales,
      totalDeals,
      averageCompletion,
      topPerformers: this.getTopPerformers(),
      regionData: {
        hanoi: { sales: hanoiSales, employees: hanoiEmployees.length },
        hcm: { sales: hcmSales, employees: hcmEmployees.length }
      },
      monthlyTrend: [
        { month: 'Tháng 1', sales: 21400000000, target: 22000000000 },
        { month: 'Tháng 2', sales: 24500000000, target: 24000000000 },
        { month: 'Tháng 3', sales: 26400000000, target: 25000000000 },
        { month: 'Tháng 4', sales: 28300000000, target: 26000000000 },
        { month: 'Tháng 5', sales: 30200000000, target: 28000000000 }
      ]
    };
  }


}

export const reportsDataService = ReportsDataService.getInstance();
