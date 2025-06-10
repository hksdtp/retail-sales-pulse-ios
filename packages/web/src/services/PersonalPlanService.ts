import { User } from '@/types/user';

export interface PersonalPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'meeting' | 'site_visit' | 'report' | 'training' | 'client_meeting' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  participants: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  reminderTime?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

export interface PersonalPlanStats {
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
  overduePlans: number;
  thisWeekPlans: number;
  completionRate: number;
}

class PersonalPlanService {
  private static instance: PersonalPlanService;
  private readonly STORAGE_KEY_PREFIX = 'personal_plans_';
  private readonly STATS_KEY_PREFIX = 'plan_stats_';

  private constructor() {}

  public static getInstance(): PersonalPlanService {
    if (!PersonalPlanService.instance) {
      PersonalPlanService.instance = new PersonalPlanService();
    }
    return PersonalPlanService.instance;
  }

  // Lấy key storage cho user cụ thể
  private getUserStorageKey(userId: string): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }

  private getUserStatsKey(userId: string): string {
    return `${this.STATS_KEY_PREFIX}${userId}`;
  }

  // Lấy tất cả kế hoạch của user
  public getUserPlans(userId: string): PersonalPlan[] {
    try {
      const storageKey = this.getUserStorageKey(userId);
      const storedPlans = localStorage.getItem(storageKey);
      
      if (!storedPlans) {
        return [];
      }

      const plans = JSON.parse(storedPlans) as PersonalPlan[];
      
      // Cập nhật trạng thái overdue cho các kế hoạch quá hạn
      const updatedPlans = plans.map(plan => {
        if (plan.status !== 'completed' && new Date(plan.endDate) < new Date()) {
          return { ...plan, status: 'overdue' as const };
        }
        return plan;
      });

      // Lưu lại nếu có thay đổi
      if (updatedPlans.some((plan, index) => plan.status !== plans[index].status)) {
        this.saveUserPlans(userId, updatedPlans);
      }

      return updatedPlans;
    } catch (error) {
      console.error('Lỗi khi lấy kế hoạch của user:', error);
      return [];
    }
  }

  // Lưu kế hoạch của user
  private saveUserPlans(userId: string, plans: PersonalPlan[]): void {
    try {
      const storageKey = this.getUserStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(plans));
      
      // Cập nhật thống kê
      this.updateUserStats(userId, plans);
      
      console.log(`Đã lưu ${plans.length} kế hoạch cho user ${userId}`);
    } catch (error) {
      console.error('Lỗi khi lưu kế hoạch:', error);
    }
  }

  // Thêm kế hoạch mới
  public addPlan(userId: string, planData: Omit<PersonalPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): PersonalPlan {
    const newPlan: PersonalPlan = {
      ...planData,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingPlans = this.getUserPlans(userId);
    const updatedPlans = [...existingPlans, newPlan];
    
    this.saveUserPlans(userId, updatedPlans);
    
    console.log('Đã thêm kế hoạch mới:', newPlan.title);
    return newPlan;
  }

  // Cập nhật kế hoạch
  public updatePlan(userId: string, planId: string, updates: Partial<PersonalPlan>): PersonalPlan | null {
    const plans = this.getUserPlans(userId);
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex === -1) {
      console.error('Không tìm thấy kế hoạch với ID:', planId);
      return null;
    }

    const updatedPlan = {
      ...plans[planIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    plans[planIndex] = updatedPlan;
    this.saveUserPlans(userId, plans);
    
    console.log('Đã cập nhật kế hoạch:', updatedPlan.title);
    return updatedPlan;
  }

  // Xóa kế hoạch
  public deletePlan(userId: string, planId: string): boolean {
    const plans = this.getUserPlans(userId);
    const filteredPlans = plans.filter(plan => plan.id !== planId);
    
    if (filteredPlans.length === plans.length) {
      console.error('Không tìm thấy kế hoạch để xóa với ID:', planId);
      return false;
    }

    this.saveUserPlans(userId, filteredPlans);
    console.log('Đã xóa kế hoạch với ID:', planId);
    return true;
  }

  // Lấy kế hoạch theo ID
  public getPlanById(userId: string, planId: string): PersonalPlan | null {
    const plans = this.getUserPlans(userId);
    return plans.find(plan => plan.id === planId) || null;
  }

  // Lấy kế hoạch theo ngày
  public getPlansByDate(userId: string, date: string): PersonalPlan[] {
    const plans = this.getUserPlans(userId);
    return plans.filter(plan => 
      plan.startDate <= date && plan.endDate >= date
    );
  }

  // Lấy kế hoạch trong khoảng thời gian
  public getPlansInRange(userId: string, startDate: string, endDate: string): PersonalPlan[] {
    const plans = this.getUserPlans(userId);
    return plans.filter(plan => 
      (plan.startDate >= startDate && plan.startDate <= endDate) ||
      (plan.endDate >= startDate && plan.endDate <= endDate) ||
      (plan.startDate <= startDate && plan.endDate >= endDate)
    );
  }

  // Cập nhật thống kê user
  private updateUserStats(userId: string, plans: PersonalPlan[]): void {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));

    const stats: PersonalPlanStats = {
      totalPlans: plans.length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      inProgressPlans: plans.filter(p => p.status === 'in_progress').length,
      overduePlans: plans.filter(p => p.status === 'overdue').length,
      thisWeekPlans: plans.filter(p => {
        const planDate = new Date(p.startDate);
        return planDate >= startOfWeek && planDate <= endOfWeek;
      }).length,
      completionRate: plans.length > 0 ? Math.round((plans.filter(p => p.status === 'completed').length / plans.length) * 100) : 0
    };

    const statsKey = this.getUserStatsKey(userId);
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  // Lấy thống kê user
  public getUserStats(userId: string): PersonalPlanStats {
    try {
      const statsKey = this.getUserStatsKey(userId);
      const storedStats = localStorage.getItem(statsKey);
      
      if (storedStats) {
        return JSON.parse(storedStats);
      }

      // Nếu chưa có thống kê, tính toán từ dữ liệu hiện tại
      const plans = this.getUserPlans(userId);
      this.updateUserStats(userId, plans);
      
      const newStatsData = localStorage.getItem(statsKey);
      return newStatsData ? JSON.parse(newStatsData) : {
        totalPlans: 0,
        completedPlans: 0,
        inProgressPlans: 0,
        overduePlans: 0,
        thisWeekPlans: 0,
        completionRate: 0
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê user:', error);
      return {
        totalPlans: 0,
        completedPlans: 0,
        inProgressPlans: 0,
        overduePlans: 0,
        thisWeekPlans: 0,
        completionRate: 0
      };
    }
  }

  // Lọc kế hoạch theo điều kiện
  public filterPlans(
    userId: string, 
    filters: {
      status?: string;
      type?: string;
      priority?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    }
  ): PersonalPlan[] {
    let plans = this.getUserPlans(userId);

    if (filters.status && filters.status !== 'all') {
      plans = plans.filter(plan => plan.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      plans = plans.filter(plan => plan.type === filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
      plans = plans.filter(plan => plan.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      plans = plans.filter(plan => 
        plan.title.toLowerCase().includes(searchLower) ||
        plan.description.toLowerCase().includes(searchLower) ||
        (plan.location && plan.location.toLowerCase().includes(searchLower))
      );
    }

    if (filters.startDate) {
      plans = plans.filter(plan => plan.startDate >= filters.startDate!);
    }

    if (filters.endDate) {
      plans = plans.filter(plan => plan.endDate <= filters.endDate!);
    }

    return plans;
  }

  // Xóa tất cả dữ liệu của user (khi logout hoặc xóa tài khoản)
  public clearUserData(userId: string): void {
    const storageKey = this.getUserStorageKey(userId);
    const statsKey = this.getUserStatsKey(userId);
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(statsKey);
    
    console.log(`Đã xóa tất cả dữ liệu kế hoạch của user ${userId}`);
  }

  // Xuất dữ liệu user (backup)
  public exportUserData(userId: string): { plans: PersonalPlan[], stats: PersonalPlanStats } {
    return {
      plans: this.getUserPlans(userId),
      stats: this.getUserStats(userId)
    };
  }

  // Nhập dữ liệu user (restore)
  public importUserData(userId: string, data: { plans: PersonalPlan[], stats?: PersonalPlanStats }): void {
    this.saveUserPlans(userId, data.plans);
    
    if (data.stats) {
      const statsKey = this.getUserStatsKey(userId);
      localStorage.setItem(statsKey, JSON.stringify(data.stats));
    }
    
    console.log(`Đã nhập ${data.plans.length} kế hoạch cho user ${userId}`);
  }
}

export const personalPlanService = PersonalPlanService.getInstance();
