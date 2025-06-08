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

// Mock users data - chỉ giữ lại một số users cần thiết cho fallback
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
];

// Email aliases for easier login - chỉ giữ lại những cái cần thiết
export const emailAliases: Record<string, string> = {
  // Khổng Đức Mạnh aliases
  'manh.khong@example.com': 'manh@company.com',
  'ducmanh@company.com': 'manh@company.com',
  'ducmanh': 'manh@company.com',
  'manh': 'manh@company.com',
};

// Mock teams data - sẽ sử dụng teams từ API/Firebase thay vì mock
export const mockTeams: MockTeam[] = [
  {
    id: '1',
    name: 'Nhóm Bán lẻ Hà Nội',
    leader_id: '1',
    location: 'Hà Nội',
    description: 'Nhóm phụ trách bán lẻ khu vực Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
  },
];

// Mock authentication function - accepts any email with correct password
export const mockLogin = async (email: string, password: string): Promise<{
  success: boolean;
  data?: { user: MockUser; token: string };
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple password check first
  if (password !== '123456' && password !== 'password') {
    return {
      success: false,
      error: 'Mật khẩu không đúng. Thử: 123456 hoặc password',
    };
  }

  // Normalize email (convert to lowercase and check aliases)
  const normalizedEmail = email.toLowerCase();
  const actualEmail = emailAliases[normalizedEmail] || normalizedEmail;

  // Try to find user in mock data first
  let user = mockUsers.find(u =>
    u.email.toLowerCase() === actualEmail ||
    u.email.toLowerCase() === normalizedEmail
  );

  // If not found in mock data, create a dynamic user based on email
  if (!user) {
    // Extract name from email (before @)
    const emailPrefix = email.split('@')[0];
    const userName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    // Create dynamic user
    user = {
      id: `dynamic_${Date.now()}`,
      name: userName,
      email: email,
      role: 'employee', // Default role
      team_id: '1',
      location: 'Hà Nội', // Default location
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: true,
    };

    console.log('Created dynamic mock user:', user);
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
