// Định nghĩa các cấp độ quyền trong ứng dụng
export enum LogLevel {
  NONE = 0,
  BASIC = 1,
  DETAILED = 2,
}

// Các hàm kiểm tra vai trò người dùng
export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};

export const isDirector = (role?: string): boolean => {
  return role === 'retail_director' || role === 'project_director';
};

export const isTeamLeader = (role?: string): boolean => {
  return role === 'team_leader';
};

// Kiểm tra quyền quản lý nhóm (đội trưởng hoặc giám đốc)
export const isManager = (role?: string): boolean => {
  return isTeamLeader(role) || isDirector(role) || isAdmin(role);
};

// Kiểm tra quyền xem báo cáo (chỉ retail_director)
export const canViewReports = (role?: string): boolean => {
  return role === 'retail_director';
};

// Kiểm tra quyền giao công việc cho người khác (manager level)
export const canAssignTasks = (role?: string): boolean => {
  return isManager(role);
};

// Hàm ghi log phân quyền với mức độ chi tiết khác nhau
export const permissionLog = (message: string, level: LogLevel = LogLevel.BASIC): void => {
  // Thiết lập mức độ log mặc định là BASIC, có thể thay đổi ở đây
  const currentLogLevel = LogLevel.BASIC;

  if (level <= currentLogLevel) {
    console.log(`[PERMISSION] ${message}`);
  }
};
