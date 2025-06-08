// Mock Authentication Service
// This provides fallback authentication when API is not available

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'retail_director' | 'team_leader' | 'employee';
  team_id: string;
  location: string;
  department: string;
  department_type: string;
  position: string;
  status: string;
  password_changed: boolean;
  avatar?: string;
}

export interface MockTeam {
  id: string;
  name: string;
  leader_id: string;
  location: string;
  description: string;
  department: string;
  department_type: string;
}

// Mock users data
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh@company.com',
    role: 'retail_director',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng phòng',
    status: 'active',
    password_changed: true,
  },
  {
    id: '1b',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    role: 'retail_director',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng phòng',
    status: 'active',
    password_changed: true,
  },
  {
    id: '2',
    name: 'Lương Việt Anh',
    email: 'anh@company.com',
    role: 'team_leader',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true,
  },
  {
    id: '3',
    name: 'Nguyễn Mạnh Linh',
    email: 'linh@company.com',
    role: 'employee',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true,
  },
  // Users cho Hồ Chí Minh
  {
    id: '4',
    name: 'Trần Văn Nam',
    email: 'nam@company.com',
    role: 'team_leader',
    team_id: '2',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true,
  },
  {
    id: '5',
    name: 'Lê Thị Hoa',
    email: 'hoa@company.com',
    role: 'employee',
    team_id: '2',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true,
  },
  {
    id: '6',
    name: 'Phạm Minh Tuấn',
    email: 'tuan@company.com',
    role: 'employee',
    team_id: '2',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true,
  },
];

// Email aliases for easier login
export const emailAliases: Record<string, string> = {
  // Khổng Đức Mạnh aliases - thêm email từ API/Firebase
  'manh.khong@example.com': 'manh@company.com',
  'ducmanh@company.com': 'manh@company.com',
  'khongducmanh@company.com': 'manh@company.com',
  'manh.khong@company.com': 'manh@company.com',
  'khong.manh@company.com': 'manh@company.com',
  'ducmanh': 'manh@company.com',
  'manh': 'manh@company.com',

  // Lương Việt Anh aliases
  'vietanh@company.com': 'anh@company.com',
  'luongvietanh@company.com': 'anh@company.com',
  'anh.luong@company.com': 'anh@company.com',
  'luong.anh@company.com': 'anh@company.com',
  'vietanh': 'anh@company.com',

  // Nguyễn Mạnh Linh aliases
  'manhlinh@company.com': 'linh@company.com',
  'nguyenmanhlinh@company.com': 'linh@company.com',
  'linh.nguyen@company.com': 'linh@company.com',
  'nguyen.linh@company.com': 'linh@company.com',
  'manhlinh': 'linh@company.com',

  // Trần Văn Nam aliases (HCM team leader)
  'vannam@company.com': 'nam@company.com',
  'tranvannam@company.com': 'nam@company.com',
  'nam.tran@company.com': 'nam@company.com',
  'tran.nam@company.com': 'nam@company.com',
  'vannam': 'nam@company.com',

  // Lê Thị Hoa aliases
  'thihoa@company.com': 'hoa@company.com',
  'lethihoa@company.com': 'hoa@company.com',
  'hoa.le@company.com': 'hoa@company.com',
  'le.hoa@company.com': 'hoa@company.com',
  'thihoa': 'hoa@company.com',

  // Phạm Minh Tuấn aliases
  'minhtuan@company.com': 'tuan@company.com',
  'phamminhtuan@company.com': 'tuan@company.com',
  'tuan.pham@company.com': 'tuan@company.com',
  'pham.tuan@company.com': 'tuan@company.com',
  'minhtuan': 'tuan@company.com',
};

// Mock teams data
export const mockTeams: MockTeam[] = [
  {
    id: '1',
    name: 'Nhóm Bán lẻ Hà Nội',
    leader_id: '2',
    location: 'Hà Nội',
    description: 'Nhóm phụ trách bán lẻ khu vực Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
  },
  {
    id: '2',
    name: 'Nhóm Bán lẻ Hồ Chí Minh',
    leader_id: '4',
    location: 'Hồ Chí Minh',
    description: 'Nhóm phụ trách bán lẻ khu vực Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
  },
];

// Mock authentication function
export const mockLogin = async (email: string, password: string): Promise<{
  success: boolean;
  data?: { user: MockUser; token: string };
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Normalize email (convert to lowercase and check aliases)
  const normalizedEmail = email.toLowerCase();
  const actualEmail = emailAliases[normalizedEmail] || normalizedEmail;

  // Find user by email (check both original and actual email)
  const user = mockUsers.find(u =>
    u.email.toLowerCase() === actualEmail ||
    u.email.toLowerCase() === normalizedEmail
  );

  if (!user) {
    return {
      success: false,
      error: `Email "${email}" không tồn tại trong hệ thống. Thử: manh@company.com, anh@company.com, linh@company.com hoặc ducmanh, vietanh, manhlinh`,
    };
  }

  // Simple password check (in real app, this would be hashed)
  if (password !== '123456' && password !== 'password') {
    return {
      success: false,
      error: 'Mật khẩu không đúng',
    };
  }

  // Generate mock token
  const token = `mock_token_${user.id}_${Date.now()}`;

  return {
    success: true,
    data: {
      user,
      token,
    },
  };
};

// Mock get users function
export const mockGetUsers = async (): Promise<{
  success: boolean;
  data?: MockUser[];
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockUsers,
  };
};

// Mock get teams function
export const mockGetTeams = async (): Promise<{
  success: boolean;
  data?: MockTeam[];
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockTeams,
  };
};

// Mock update user function
export const mockUpdateUser = async (id: string, userData: Partial<MockUser>): Promise<{
  success: boolean;
  data?: MockUser;
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return {
      success: false,
      error: 'Không tìm thấy người dùng',
    };
  }

  // Update user data
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
  
  return {
    success: true,
    data: mockUsers[userIndex],
  };
};
