import { User } from '@/types/user';

export interface EmployeePerformance {
  id: string;
  name: string;
  role: string;
  location: string;
  team?: string;
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
      // === TRƯỞNG PHÒNG ===
      {
        id: 'ducmanh',
        name: 'Khổng Đức Mạnh',
        role: 'Trưởng phòng',
        location: 'Hà Nội',
        team: 'QUẢN LÝ',
        avatar: 'KDM',
        sales: 0, // Trưởng phòng quản lý - không có doanh số
        deals: 0,
        completion: 0,
        contribution: 0,
        badge: 'excellent',
        trend: '👨‍💼 Quản lý điều hành',
        monthlyData: ['Quản lý', 'Điều hành', 'Giám sát', 'Hỗ trợ', 'Phát triển', 'Đào tạo'],
        notes: ['👨‍💼 Trưởng phòng quản lý', '📊 Giám sát toàn bộ hoạt động', '🎯 Hỗ trợ đội ngũ sales'],
        plan: 0, // Không có kế hoạch doanh số
        rate: 0
      },
      // === HÀ NỘI - NHÓM 1 ===
      {
        id: 'vietanh_hn',
        name: 'Lương Việt Anh',
        role: 'Trưởng nhóm',
        location: 'Hà Nội',
        team: 'NHÓM 1',
        avatar: 'LVA',
        sales: 1149179104, // 1.149 tỷ từ Google Sheets HN
        deals: 25,
        completion: 118,
        contribution: 17.68,
        badge: 'good',
        trend: '📈 Ổn định tăng trưởng',
        monthlyData: ['T1: -4.6tr', 'T2: +406.8tr', 'T3: +250.3tr', 'T4: +229.5tr', 'T5: +267.1tr', 'T6: 0tr'],
        notes: ['👍 Hiệu suất tốt', '📈 Xu hướng tăng dần', '💪 Đạt 17.68% kế hoạch'],
        plan: 6500000000, // Kế hoạch năm 2025
        rate: 17.68
      },
      {
        id: 'duy_hn',
        name: 'Lê Khánh Duy',
        role: 'Nhân viên',
        location: 'Hà Nội',
        team: 'NHÓM 1',
        avatar: 'LKD',
        sales: 477722922, // 477.7 triệu từ Google Sheets HN (cập nhật chính xác)
        deals: 15,
        completion: 85,
        contribution: 13.65,
        badge: 'average',
        trend: '📉 Cần cải thiện',
        monthlyData: ['T1: -27.3tr', 'T2: +12.6tr', 'T3: +6.2tr', 'T4: +425.3tr', 'T5: +43.2tr', 'T6: 0tr'],
        notes: ['📉 Chỉ đạt 13.65% kế hoạch', '⚠️ Cần hỗ trợ', '🎯 Cần cải thiện'],
        plan: 3500000000, // Kế hoạch năm 2025 từ Google Sheets
        rate: 13.65
      },
      {
        id: 'thuha_hn',
        name: 'Quản Thu Hà',
        role: 'Nhân viên',
        location: 'Hà Nội',
        team: 'NHÓM 1',
        avatar: 'QTH',
        sales: 0, // Nhân viên mới - chưa có số liệu
        deals: 0,
        completion: 0,
        contribution: 0,
        badge: 'average',
        trend: '🆕 Nhân viên mới',
        monthlyData: ['Mới vào', 'Đào tạo', 'Học hỏi', 'Thực tập', 'Phát triển', 'Chuẩn bị'],
        notes: ['🆕 Nhân viên mới', '📚 Đang trong quá trình đào tạo', '🎯 Chuẩn bị bắt đầu'],
        plan: 0, // Chưa có kế hoạch
        rate: 0
      },
      // === HÀ NỘI - NHÓM 2 ===
      {
        id: 'thao_hn',
        name: 'Nguyễn Thị Thảo',
        role: 'Trưởng nhóm',
        location: 'Hà Nội',
        team: 'NHÓM 2',
        avatar: 'NTT',
        sales: 1068283526, // 1.069 tỷ từ báo cáo
        deals: 22,
        completion: 110,
        contribution: 16.74,
        badge: 'good',
        trend: '📈 Tăng trưởng ổn định',
        monthlyData: ['T1: +9.2tr', 'T2: -2.5tr', 'T3: +189.1tr', 'T4: +146.8tr', 'T5: +629.2tr', 'T6: 0tr'],
        notes: ['📈 Đạt 16.74% kế hoạch', '💪 Hiệu suất tốt', '🎯 Xu hướng tăng'],
        plan: 6380000000, // Kế hoạch năm 2025
        rate: 16.74
      },
      {
        id: 'manhlinh_hn',
        name: 'Nguyễn Mạnh Linh',
        role: 'Nhân viên',
        location: 'Hà Nội',
        team: 'NHÓM 2',
        avatar: 'NML',
        sales: 193078534, // Từ Google Sheets: 193.078.534 VND
        deals: 13,
        completion: 88,
        contribution: 5.52,
        badge: 'average',
        trend: '📈 Cải thiện dần',
        monthlyData: ['T1: +15.2tr', 'T2: 0tr', 'T3: +6.2tr', 'T4: +193.1tr', 'T5: 0tr', 'T6: 0tr'],
        notes: ['📈 Xu hướng tăng', '💪 Có tiến bộ', '⚠️ Cần hỗ trợ thêm'],
        plan: 3500000000, // Kế hoạch năm 2025
        rate: 5.52
      },
      // === HÀ NỘI - NHÓM 3 ===
      {
        id: 'bon_hn',
        name: 'Trịnh Thị Bốn',
        role: 'Trưởng nhóm',
        location: 'Hà Nội',
        team: 'NHÓM 3',
        avatar: 'TTB',
        sales: 619765056, // 619.8 triệu từ báo cáo
        deals: 18,
        completion: 90,
        contribution: 12.32,
        badge: 'average',
        trend: '📉 Cần cải thiện',
        monthlyData: ['T1: +203.6tr', 'T2: +203.8tr', 'T3: +212.1tr', 'T4: +10.5tr', 'T5: +414.7tr', 'T6: 0tr'],
        notes: ['📉 Chỉ đạt 12.32% kế hoạch', '⚠️ Cần hỗ trợ', '🎯 Cần cải thiện'],
        plan: 5030000000, // Kế hoạch năm 2025
        rate: 12.32
      },
      // === HÀ NỘI - NHÓM 4 ===
      {
        id: 'quan_hn',
        name: 'Lê Tiến Quân',
        role: 'Trưởng nhóm',
        location: 'Hà Nội',
        team: 'NHÓM 4',
        avatar: 'LTQ',
        sales: 414702365, // 414.7 triệu từ báo cáo
        deals: 12,
        completion: 75,
        contribution: 0,
        badge: 'poor',
        trend: '🚨 Cần hỗ trợ khẩn cấp',
        monthlyData: ['T1: +6.4tr', 'T2: +4.2tr', 'T3: +4.2tr', 'T4: +6.5tr', 'T5: +395.1tr', 'T6: 0tr'],
        notes: ['🚨 0% kế hoạch', '⚠️ Cần hỗ trợ khẩn cấp', '📉 Hiệu suất thấp'],
        plan: 4150000000, // Kế hoạch năm 2025
        rate: 0
      },
      // === HÀ NỘI - NHÓM 5 ===
      {
        id: 'huong_hn',
        name: 'Phạm Thị Hương',
        role: 'Trưởng nhóm',
        location: 'Hà Nội',
        team: 'NHÓM 5',
        avatar: 'PTH',
        sales: 1308392338, // 1.309 tỷ từ báo cáo
        deals: 28,
        completion: 120,
        contribution: 21.81,
        badge: 'excellent',
        trend: '🏆 Xuất sắc nhất HN',
        monthlyData: ['T1: +920tr', 'T2: 0tr', 'T3: +60.3tr', 'T4: +382.3tr', 'T5: +728.4tr', 'T6: 0tr'],
        notes: ['🏆 Top performer Hà Nội', '📈 Đạt 21.81% kế hoạch', '💪 Hiệu suất xuất sắc'],
        plan: 6000000000, // Kế hoạch năm 2025
        rate: 21.81
      },
      // === TP.HCM - NHÓM 1 ===
      {
        id: 'nga_hcm',
        name: 'Nguyễn Thị Nga',
        role: 'Trưởng nhóm',
        location: 'HCM',
        team: 'NHÓM 1',
        avatar: 'NTN',
        sales: 2580541759, // 2.581 tỷ từ Google Sheets HCM
        deals: 35,
        completion: 145,
        contribution: 44.49,
        badge: 'excellent',
        trend: '🏆 Top performer toàn hệ thống',
        monthlyData: ['T1: +1092.5tr', 'T2: +167.6tr', 'T3: +716.7tr', 'T4: -9.7tr', 'T5: +613.5tr', 'T6: 0tr'],
        notes: ['🏆 Top performer toàn hệ thống', '📈 Đạt 44.49% kế hoạch', '💪 Hiệu suất xuất sắc'],
        plan: 5800000000, // Kế hoạch năm 2025 từ Google Sheets
        rate: 44.49
      },
      {
        id: 'tuyen_hcm',
        name: 'Hà Nguyễn Thanh Tuyền',
        role: 'Nhân viên',
        location: 'HCM',
        team: 'NHÓM 1',
        avatar: 'HNT',
        sales: 179585750, // 179.6 triệu từ Google Sheets HCM (cập nhật chính xác)
        deals: 8,
        completion: 75,
        contribution: 8.98,
        badge: 'poor',
        trend: '🚨 Cần hỗ trợ khẩn cấp',
        monthlyData: ['T1: +141.8tr', 'T2: 0tr', 'T3: +37.8tr', 'T4: 0tr', 'T5: 0tr', 'T6: 0tr'],
        notes: ['🚨 Chỉ đạt 8.98% kế hoạch', '⚠️ Cần hỗ trợ khẩn cấp', '📉 Hiệu suất rất thấp'],
        plan: 2000000000, // Kế hoạch năm 2025 từ Google Sheets
        rate: 8.98
      },
      // === TP.HCM - NHÓM 2 ===
      {
        id: 'khanh_hcm',
        name: 'Nguyễn Ngọc Việt Khanh',
        role: 'Trưởng nhóm',
        location: 'HCM',
        team: 'NHÓM 2',
        avatar: 'NNV',
        sales: 1859111510, // 1.859 tỷ từ Google Sheets HCM (cập nhật chính xác)
        deals: 25,
        completion: 110,
        contribution: 33.80,
        badge: 'excellent',
        trend: '📈 Hiệu suất xuất sắc',
        monthlyData: ['T1: +368.1tr', 'T2: +746.9tr', 'T3: +292.5tr', 'T4: +451.2tr', 'T5: +0.4tr', 'T6: 0tr'],
        notes: ['📈 Đạt 33.80% kế hoạch', '💪 Hiệu suất xuất sắc', '🎯 Xu hướng ổn định'],
        plan: 5500000000, // Kế hoạch năm 2025 từ Google Sheets
        rate: 33.80
      },
      {
        id: 'thuyvan_hcm',
        name: 'Phùng Thị Thuỳ Vân',
        role: 'Nhân viên',
        location: 'HCM',
        team: 'NHÓM 2',
        avatar: 'PTT',
        sales: 330974134, // 331.0 triệu từ Google Sheets HCM (cập nhật chính xác)
        deals: 22,
        completion: 115,
        contribution: 11.03,
        badge: 'average',
        trend: '📈 Cần cải thiện',
        monthlyData: ['T1: +3.5tr', 'T2: 0tr', 'T3: +144.3tr', 'T4: +193.7tr', 'T5: -10.5tr', 'T6: 0tr'],
        notes: ['📈 Đạt 11.03% kế hoạch', '⚠️ Cần cải thiện', '🎯 Có tiềm năng'],
        plan: 3000000000, // Kế hoạch năm 2025 từ Google Sheets
        rate: 11.03
      },

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

  public getEmployeesByTeam(team: string): EmployeePerformance[] {
    return this.employeeData.filter(emp =>
      emp.team?.toLowerCase() === team.toLowerCase()
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
        { month: 'Tháng 1', sales: 1300000000, target: 2650000000 }, // Từ Google Sheets 2025
        { month: 'Tháng 2', sales: 430000000, target: 2100000000 },  // Từ Google Sheets 2025
        { month: 'Tháng 3', sales: 1500000000, target: 2750000000 }, // Từ Google Sheets 2025
        { month: 'Tháng 4', sales: 1330000000, target: 3570000000 }, // Từ Google Sheets 2025
        { month: 'Tháng 5', sales: 1450000000, target: 4450000000 }, // Từ Google Sheets 2025
        { month: 'Tháng 6', sales: 4300000000, target: 5140000000 }  // Từ Google Sheets 2025
      ]
    };
  }


}

export const reportsDataService = ReportsDataService.getInstance();
