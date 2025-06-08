import { User } from '@/types/user';
import { taskKpiService } from '@/services/TaskKpiService';
import { Task } from '@/components/tasks/types/TaskTypes';

export interface KpiItem {
  title: string;
  value: string;
  oldValue: string;
  change: number;
  data: Array<{ value: number }>;
}

export const getKpiDataForUser = (currentUser: User | null, tasks: Task[] = []): KpiItem[] => {
  // Sử dụng TaskKpiService để lấy dữ liệu KPI từ công việc
  return taskKpiService.getKpiDataForUser(currentUser, tasks);
};

// Xây dựng tiêu đề phụ (subtitle) dựa trên loại người dùng
export const getDashboardSubtitle = (currentUser: User | null): string => {
  const isDirector =
    currentUser?.role === 'retail_director' || currentUser?.role === 'project_director';
  const isTeamLeader = currentUser?.role === 'team_leader';

  if (isDirector) {
    const departmentType =
      currentUser?.department_type === 'retail' ? 'Kinh doanh bán lẻ' : 'Kinh doanh dự án';
    return `Tổng quan về hiệu suất kinh doanh phòng ${departmentType}`;
  } else if (isTeamLeader) {
    return 'Tổng quan về hiệu suất kinh doanh của nhóm của bạn';
  } else {
    return 'Tổng quan về hiệu suất kinh doanh cá nhân của bạn';
  }
};
