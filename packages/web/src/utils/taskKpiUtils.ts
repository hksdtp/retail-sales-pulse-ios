import { tasks } from '@/components/tasks/data/TasksData';
import { Task } from '@/components/tasks/types/TaskTypes';
import { User } from '@/types/user';

// Định nghĩa các kiểu KPI
export interface TaskKpiItem {
  type: string;
  category:
    | 'partner_new'
    | 'partner_old'
    | 'architect_new'
    | 'architect_old'
    | 'client_new'
    | 'client_old'
    | 'quote_new'
    | 'quote_old'
    | 'other';
  total: number;
  completed: number;
  completionRate: number;
  targetCount: number;
  progressPercent: number;
  trend: 'up' | 'down' | 'flat';
}

export interface TaskKpiSummary {
  items: TaskKpiItem[];
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
  conversionRates: {
    quoteToOrder: number;
    potentialToActual: number;
    architectToPrj: number;
  };
}

// Hàm lấy tên hiển thị cho loại công việc
export const getTaskTypeName = (type: string) => {
  switch (type) {
    case 'partner_new':
      return 'Đối tác mới';
    case 'partner_old':
      return 'Đối tác cũ';
    case 'architect_new':
      return 'KTS mới';
    case 'architect_old':
      return 'KTS cũ';
    case 'client_new':
      return 'Khách hàng mới';
    case 'client_old':
      return 'Khách hàng cũ';
    case 'quote_new':
      return 'Báo giá mới';
    case 'quote_old':
      return 'Báo giá cũ';
    case 'other':
      return 'Khác';
    default:
      return type;
  }
};

// Hàm lấy màu sắc cho loại công việc
export const getTaskTypeColor = (type: string): string => {
  if (type.startsWith('partner')) return 'bg-ios-blue';
  if (type.startsWith('architect')) return 'bg-ios-green';
  if (type.startsWith('client')) return 'bg-ios-orange';
  if (type.startsWith('quote')) return 'bg-ios-yellow';
  return 'bg-purple-500';
};

// Hàm tính toán mục tiêu theo loại công việc
const getTargetByType = (type: string, role: string): number => {
  // Mục tiêu khác nhau tùy theo vai trò và loại công việc
  if (role === 'retail_director' || role === 'project_director') {
    switch (type) {
      case 'partner_new':
        return 30;
      case 'partner_old':
        return 50;
      case 'architect_new':
        return 20;
      case 'architect_old':
        return 30;
      case 'client_new':
        return 40;
      case 'client_old':
        return 60;
      case 'quote_new':
        return 50;
      case 'quote_old':
        return 40;
      default:
        return 20;
    }
  } else if (role === 'team_leader') {
    switch (type) {
      case 'partner_new':
        return 15;
      case 'partner_old':
        return 25;
      case 'architect_new':
        return 10;
      case 'architect_old':
        return 15;
      case 'client_new':
        return 20;
      case 'client_old':
        return 30;
      case 'quote_new':
        return 25;
      case 'quote_old':
        return 20;
      default:
        return 10;
    }
  } else {
    // Nhân viên
    switch (type) {
      case 'partner_new':
        return 5;
      case 'partner_old':
        return 8;
      case 'architect_new':
        return 3;
      case 'architect_old':
        return 5;
      case 'client_new':
        return 7;
      case 'client_old':
        return 10;
      case 'quote_new':
        return 8;
      case 'quote_old':
        return 7;
      default:
        return 3;
    }
  }
};

// Hàm tính xu hướng dựa trên dữ liệu trước đó (giả lập)
const calculateTrend = (current: number, target: number): 'up' | 'down' | 'flat' => {
  const previousProgress = Math.random(); // Giả lập dữ liệu kỳ trước
  const currentProgress = current / target;

  if (currentProgress > previousProgress + 0.05) return 'up';
  if (currentProgress < previousProgress - 0.05) return 'down';
  return 'flat';
};

// Tính toán KPI từ dữ liệu công việc
export const calculateTaskKpi = (allTasks: Task[], currentUser: User | null): TaskKpiSummary => {
  // Lọc các công việc liên quan đến người dùng hiện tại
  const userTasks = filterTasksByUser(allTasks, currentUser);

  // Danh sách các loại công việc cần tính toán
  const taskTypes = [
    'partner_new',
    'partner_old',
    'architect_new',
    'architect_old',
    'client_new',
    'client_old',
    'quote_new',
    'quote_old',
    'other',
  ];

  // Tính KPI cho từng loại công việc
  const items: TaskKpiItem[] = taskTypes.map((type) => {
    const userTasks = allTasks.filter((task) => task.type === type);
    const total = userTasks.length;
    const completed = userTasks.filter((task) => task.status === 'completed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const targetCount = getTargetByType(type, currentUser?.role || 'employee');
    const progressPercent = targetCount > 0 ? (completed / targetCount) * 100 : 0;
    const trend = calculateTrend(completed, targetCount);

    // Định nghĩa kiểu cho category
    const validCategories = [
      'partner_new',
      'partner_old',
      'architect_new',
      'architect_old',
      'client_new',
      'client_old',
      'quote_new',
      'quote_old',
      'other',
    ] as const;
    type CategoryType = (typeof validCategories)[number];

    const category: CategoryType = validCategories.includes(type as CategoryType)
      ? (type as CategoryType)
      : 'other';

    return {
      type: getTaskTypeName(type),
      category,
      total,
      completed,
      completionRate,
      targetCount,
      progressPercent,
      trend,
    };
  });

  // Tính tổng số công việc và tỷ lệ hoàn thành
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((task) => task.status === 'completed').length;
  const overallCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Tính các tỷ lệ chuyển đổi (giả lập)
  // Trong thực tế, bạn cần dữ liệu về số báo giá đã chuyển thành đơn hàng, v.v.
  const conversionRates = {
    quoteToOrder: 35 + (Math.random() * 10 - 5), // 30-40%
    potentialToActual: 42 + (Math.random() * 10 - 5), // 37-47%
    architectToPrj: 28 + (Math.random() * 10 - 5), // 23-33%
  };

  return {
    items,
    totalTasks,
    completedTasks,
    overallCompletionRate,
    conversionRates,
  };
};

// Lọc công việc theo người dùng
function filterTasksByUser(tasks: Task[], currentUser: User | null): Task[] {
  if (!currentUser) return [];

  if (currentUser.role === 'retail_director' || currentUser.role === 'project_director') {
    // Giám đốc xem tất cả công việc
    return tasks;
  } else if (currentUser.role === 'team_leader') {
    // Trưởng nhóm xem công việc của nhóm mình
    return tasks.filter((task) => task.teamId === currentUser.team_id);
  } else {
    // Nhân viên chỉ xem công việc được giao cho mình
    return tasks.filter((task) => task.assignedTo === currentUser.id);
  }
}

// Hàm để lấy dữ liệu KPI theo loại công việc - sử dụng real tasks
export const getTaskKpiData = (currentUser: User | null, realTasks: Task[] = []): TaskKpiSummary => {
  // Ưu tiên sử dụng realTasks nếu có, fallback về mock tasks
  const tasksToUse = realTasks.length > 0 ? realTasks : tasks;
  console.log(`🔍 KPI calculation using ${tasksToUse.length} tasks (${realTasks.length > 0 ? 'real' : 'mock'} data)`);
  return calculateTaskKpi(tasksToUse, currentUser);
};
