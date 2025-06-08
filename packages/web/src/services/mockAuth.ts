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
];

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
];

// Mock authentication function
export const mockLogin = async (email: string, password: string): Promise<{
  success: boolean;
  data?: { user: MockUser; token: string };
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return {
      success: false,
      error: 'Email không tồn tại trong hệ thống',
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
