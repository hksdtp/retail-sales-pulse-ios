import { Task } from '../components/tasks/types/TaskTypes';

// Dữ liệu mẫu cho các công việc
export const mockTasks: Task[] = [
  {
    id: 'task_1',
    title: 'Báo cáo doanh thu tháng 6',
    description: 'Tổng hợp doanh thu bán lẻ tháng 6 theo từng cửa hàng và so sánh với cùng kỳ năm trước',
    type: 'other',
    date: new Date().toISOString(),
    status: 'todo',
    progress: 0,
    isNew: true,
    user_id: 'user_123',
    user_name: 'Nguyễn Văn A',
    location: 'hanoi',
    assignedTo: 'user_123',
    teamId: 'team_1',
    created_at: new Date().toISOString(),
    time: '9:00',
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  },
  {
    id: 'task_2',
    title: 'Kiểm tra hàng tồn kho',
    description: 'Kiểm tra và đối soát hàng tồn kho với dữ liệu trong hệ thống',
    type: 'other',
    date: new Date().toISOString(),
    status: 'in-progress',
    progress: 30,
    isNew: false,
    user_id: 'user_456',
    user_name: 'Trần Thị B',
    location: 'hochiminh',
    assignedTo: 'user_456',
    teamId: 'team_2',
    created_at: new Date().toISOString(),
    time: '14:00',
    isShared: true,
    isSharedWithTeam: true,
    extraAssignees: ''
  },
  {
    id: 'task_3',
    title: 'Họp đội ngũ kinh doanh',
    description: 'Họp đội ngũ kinh doanh để thảo luận về mục tiêu quý 3',
    type: 'other',
    date: new Date().toISOString(),
    status: 'completed',
    progress: 100,
    isNew: false,
    user_id: 'user_789',
    user_name: 'Lê Văn C',
    location: 'hanoi',
    assignedTo: 'user_789',
    teamId: 'team_1',
    created_at: new Date().toISOString(),
    time: '10:30',
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  }
];

// Lưu dữ liệu mẫu vào localStorage
export const saveMockTasksToLocalStorage = (): void => {
  localStorage.setItem('rawTasks', JSON.stringify(mockTasks));
};

// Lấy dữ liệu mẫu từ localStorage
export const getMockTasksFromLocalStorage = (): Task[] => {
  const storedTasks = localStorage.getItem('rawTasks');
  return storedTasks ? JSON.parse(storedTasks) : [];
};
