// Các hàm tiện ích liên quan đến việc lọc công việc
import { Team, User } from '@/types/user';

import { Task } from '../types/TaskTypes';

// Hàm sắp xếp tasks theo thời gian và mức độ ưu tiên
export const sortTasks = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    // Lấy thời gian mới nhất (updated_at hoặc created_at)
    const getLatestTime = (task: Task) => {
      const updatedAt = task.updated_at || task.created_at;
      const createdAt = task.created_at;
      return new Date(updatedAt || createdAt).getTime();
    };

    const timeA = getLatestTime(a);
    const timeB = getLatestTime(b);

    // Sắp xếp theo thời gian giảm dần (mới nhất trước)
    const timeDiff = timeB - timeA;

    // Nếu khác nhau hơn 1 phút, sắp xếp theo thời gian
    if (Math.abs(timeDiff) > 60000) {
      return timeDiff;
    }

    // Nếu cùng thời gian (trong vòng 1 phút), sắp xếp theo priority
    const priorityWeight = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1
    };

    const priorityA = priorityWeight[a.priority as keyof typeof priorityWeight] || 2;
    const priorityB = priorityWeight[b.priority as keyof typeof priorityWeight] || 2;

    return priorityB - priorityA; // Priority cao hơn trước
  });
};

export const filterTasksByUserRole = (
  tasks: Task[],
  currentUser: User | null,
  teams: Team[],
  location: string,
  teamId: string,
): Task[] => {
  return tasks.filter((task) => {
    // Lọc theo khu vực
    const matchLocation = location === 'all' || task.location === location;

    // Lọc theo quyền của người dùng
    let hasPermissionToView = false;

    if (currentUser) {
      if (currentUser.role === 'retail_director') {
        // Retail Director chỉ xem công việc của phòng bán lẻ
        hasPermissionToView = true; // Sẽ được lọc ở TaskDataProvider
      } else if (currentUser.role === 'team_leader') {
        // Trưởng nhóm chỉ xem công việc được giao cho thành viên trong nhóm
        hasPermissionToView = true; // Sẽ được lọc ở TaskDataProvider
      } else {
        // Nhân viên chỉ xem công việc được giao cho mình
        hasPermissionToView = task.assignedTo === currentUser.id;
      }
    }

    // Lọc theo nhóm nếu được chọn
    const matchTeam = teamId === 'all' || task.teamId === teamId;

    return matchLocation && matchTeam && hasPermissionToView;
  });
};

// Tạo danh sách nhóm công việc theo thời gian và trạng thái
export const groupTasks = (filteredTasks: Task[]) => {
  // Sắp xếp tasks trước khi nhóm
  const sortedTasks = sortTasks(filteredTasks);

  // Lấy ngày hiện tại để so sánh
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset thời gian về 00:00:00

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + 7);

  // Định dạng ngày tháng để hiển thị
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Khởi tạo các nhóm
  const todayDateStr = formatDate(today);
  const tomorrowDateStr = formatDate(tomorrow);

  const groupedTasks: Record<string, Task[]> = {
    'Tất cả công việc': filteredTasks,
    [`Hôm nay (${todayDateStr})`]: [],
    [`Ngày mai (${tomorrowDateStr})`]: [],
    'Tuần này': [],
    'Tháng này': [],
    'Cần làm': [],
    'Đang thực hiện': [],
    'Tạm hoãn': [],
    'Đã hoàn thành': [],
  };

  // Phân loại công việc vào các nhóm
  sortedTasks.forEach((task) => {
    // Phân loại theo trạng thái
    if (task.status === 'todo') {
      groupedTasks['Cần làm'].push(task);
    } else if (task.status === 'in-progress') {
      groupedTasks['Đang thực hiện'].push(task);
    } else if (task.status === 'on-hold') {
      groupedTasks['Tạm hoãn'].push(task);
    } else if (task.status === 'completed') {
      groupedTasks['Đã hoàn thành'].push(task);
    }

    // Phân loại theo thời gian
    try {
      if (task.date) {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0); // Reset thời gian để so sánh chính xác

        // Kiểm tra ngày của task
        if (taskDate.getTime() === today.getTime()) {
          groupedTasks[`Hôm nay (${todayDateStr})`].push(task);
        } else if (taskDate.getTime() === tomorrow.getTime()) {
          groupedTasks[`Ngày mai (${tomorrowDateStr})`].push(task);
        }

        // Kiểm tra tuần
        const taskDay = taskDate.getDay();
        const todayDay = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - todayDay); // Lùi ngày về đầu tuần (Chủ Nhật)

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Cuối tuần (Thứ Bảy)

        if (taskDate >= startOfWeek && taskDate <= endOfWeek) {
          groupedTasks['Tuần này'].push(task);
        }

        // Kiểm tra tháng
        if (
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        ) {
          groupedTasks['Tháng này'].push(task);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý ngày tháng của công việc:', error);
    }
  });

  // Lọc bỏ các nhóm không có công việc nào
  return Object.fromEntries(
    Object.entries(groupedTasks)
      .filter(([_, tasks]) => tasks.length > 0)
      .sort(([groupA], [groupB]) => {
        // Sắp xếp các nhóm theo thứ tự ưu tiên
        const groupOrder = {
          'Tất cả công việc': 0,
          [`Hôm nay (${todayDateStr})`]: 1,
          [`Ngày mai (${tomorrowDateStr})`]: 2,
          'Tuần này': 3,
          'Tháng này': 4,
          'Cần làm': 5,
          'Đang thực hiện': 6,
          'Tạm hoãn': 7,
          'Đã hoàn thành': 8,
        };

        const orderA = groupOrder[groupA] !== undefined ? groupOrder[groupA] : 999;
        const orderB = groupOrder[groupB] !== undefined ? groupOrder[groupB] : 999;

        return orderA - orderB;
      }),
  );
};
