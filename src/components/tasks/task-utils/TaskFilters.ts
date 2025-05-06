
// Các hàm tiện ích liên quan đến việc lọc công việc

import { Task } from '../types/TaskTypes';
import { User, Team } from '@/context/AuthContext';

export const filterTasksByUserRole = (
  tasks: Task[], 
  currentUser: User | null, 
  teams: Team[], 
  location: string, 
  teamId: string
): Task[] => {
  return tasks.filter(task => {
    // Lọc theo khu vực
    const matchLocation = location === 'all' || task.location === location;
    
    // Lọc theo quyền của người dùng
    let hasPermissionToView = false;
    
    if (currentUser) {
      if (currentUser.role === 'director') {
        // Giám đốc xem tất cả công việc
        hasPermissionToView = true;
      } else if (currentUser.role === 'team_leader') {
        // Trưởng nhóm chỉ xem công việc của nhóm mình
        const userTeam = teams.find(team => team.leader_id === currentUser.id);
        hasPermissionToView = userTeam ? task.teamId === userTeam.id : false;
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

// Tạo danh sách nhóm công việc theo thời gian
export const groupTasks = (filteredTasks: Task[]) => {
  const groups = {
    'Hôm nay (05/05/2025)': filteredTasks.filter(t => t.date === '10:30' || t.date === '14:00'),
    'Ngày mai (06/05/2025)': filteredTasks.filter(t => t.date === '09:00'),
    'Sắp tới': filteredTasks.filter(t => t.date === '12/05/2025' || t.date === '07/05/2025'),
    'Hoàn thành gần đây': filteredTasks.filter(t => t.status === 'completed'),
  };

  // Lọc bỏ các nhóm không có công việc nào
  return Object.fromEntries(
    Object.entries(groups).filter(([_, tasks]) => tasks.length > 0)
  );
};
