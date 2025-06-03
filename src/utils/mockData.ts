import { Task } from '@/components/tasks/types/TaskTypes';
import { Team, User } from '@/types/user';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Làm việc với khách hàng VIP',
    description: 'Thảo luận về nhu cầu và kế hoạch cho dự án mới',
    type: 'client_new',
    status: 'todo',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: 'current',
    user_name: 'Người dùng hiện tại',
    progress: 0,
    isNew: true,
    assignedTo: 'current',
    location: 'Hà Nội',
    teamId: 'team1',
  },
  {
    id: '2',
    title: 'Khảo sát địa điểm cho dự án Sunshine',
    description: 'Xem xét và đánh giá địa điểm cho dự án Sunshine',
    type: 'architect_new',
    status: 'in-progress',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: 'current',
    user_name: 'Người dùng hiện tại',
    progress: 30,
    isNew: false,
    assignedTo: 'current',
    location: 'Hồ Chí Minh',
    teamId: 'team1',
  },
  {
    id: '3',
    title: 'Duyệt báo giá mới từ nhà cung cấp',
    description: 'Xem xét và duyệt báo giá mới từ nhà cung cấp vật liệu',
    type: 'quote_new',
    status: 'completed',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: 'current',
    user_name: 'Người dùng hiện tại',
    progress: 100,
    isNew: false,
    assignedTo: 'current',
    location: 'Đà Nẵng',
    teamId: 'team1',
  },
  {
    id: '4',
    title: 'Theo dõi tiến độ dự án Golden Park',
    description: 'Kiểm tra và cập nhật tiến độ của dự án Golden Park',
    type: 'partner_new',
    status: 'on-hold',
    date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: 'current',
    user_name: 'Người dùng hiện tại',
    progress: 50,
    isNew: false,
    assignedTo: 'current',
    location: 'Nha Trang',
    teamId: 'team1',
  }
];

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '4',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: '6',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 3 Hà Nội',
    created_at: '2023-01-15',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '4',
    name: 'NHÓM 4',
    leader_id: '7',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 4 Hà Nội',
    created_at: '2023-02-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '5',
    name: 'NHÓM 1',
    leader_id: '8',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    created_at: '2023-01-01',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '6',
    name: 'NHÓM 2',
    leader_id: '10',
    location: 'hcm',
    description: 'Nhóm kinh doanh 2 Hồ Chí Minh',
    created_at: '2023-01-15',
    department: 'retail',
    department_type: 'retail'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    role: 'retail_director',
    team_id: '0',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng phòng kinh doanh bán lẻ',
    status: 'active',
    password_changed: true
  },
  {
    id: '2',
    name: 'Lương Việt Anh',
    email: 'vietanh@example.com',
    role: 'team_leader',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '3',
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '4',
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@example.com',
    role: 'team_leader',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '5',
    name: 'Nguyễn Mạnh Linh',
    email: 'manhlinh@example.com',
    role: 'employee',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '6',
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@example.com',
    role: 'team_leader',
    team_id: '3',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '7',
    name: 'Phạm Thị Hương',
    email: 'huong.pham@example.com',
    role: 'team_leader',
    team_id: '4',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '8',
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    role: 'team_leader',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '9',
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@example.com',
    role: 'employee',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    id: '10',
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'vietkhanh@example.com',
    role: 'team_leader',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: '11',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    role: 'employee',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  }
];

export const DEFAULT_PASSWORD = '123';

export const mockCredentials: Record<string, string> = {};

mockUsers.forEach(user => {
  if (user.email) {
    mockCredentials[user.email] = DEFAULT_PASSWORD;
  }
});

export const saveMockTasksToLocalStorage = () => {
  try {
    localStorage.setItem('tasks', JSON.stringify(mockTasks));
    console.log('Đã thêm dữ liệu mẫu vào localStorage');
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu mẫu vào localStorage:', error);
    return false;
  }
};
