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

// Danh sách emails thật từ hệ thống - tất cả đều có thể đăng nhập với password 123456
export const realUserEmails = [
  'manh.khong@example.com',
  'vietanh@example.com',
  'khanhduy@example.com',
  'thao.nguyen@example.com',
  'manhlinh@example.com',
  'bon.trinh@example.com',
  'huong.pham@example.com',
  'nga.nguyen@example.com',
  'tuyen.ha@example.com',
  'vietkhanh@example.com',
  'thuyvan@example.com'
];

// Email aliases cho dễ nhớ
export const emailAliases: Record<string, string> = {
  // Khổng Đức Mạnh
  'ducmanh': 'manh.khong@example.com',
  'manh': 'manh.khong@example.com',

  // Lương Việt Anh
  'vietanh': 'vietanh@example.com',
  'anh': 'vietanh@example.com',

  // Lê Khánh Duy
  'khanhduy': 'khanhduy@example.com',
  'duy': 'khanhduy@example.com',

  // Nguyễn Thị Thảo
  'thao': 'thao.nguyen@example.com',

  // Nguyễn Mạnh Linh
  'manhlinh': 'manhlinh@example.com',
  'linh': 'manhlinh@example.com',

  // Trịnh Thị Bốn
  'bon': 'bon.trinh@example.com',

  // Phạm Thị Hương
  'huong': 'huong.pham@example.com',

  // Nguyễn Thị Nga
  'nga': 'nga.nguyen@example.com',

  // Hà Nguyễn Thanh Tuyền
  'tuyen': 'tuyen.ha@example.com',

  // Nguyễn Ngọc Việt Khanh
  'vietkhanh': 'vietkhanh@example.com',
  'khanh': 'vietkhanh@example.com',

  // Phùng Thị Thuỳ Vân
  'thuyvan': 'thuyvan@example.com',
  'van': 'thuyvan@example.com',
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

// Mock authentication function - chấp nhận tất cả emails thật từ hệ thống
export const mockLogin = async (email: string, password: string): Promise<{
  success: boolean;
  data?: { user: MockUser; token: string };
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple password check first - accept multiple password formats
  const validPasswords = ['123456', 'password', 'password123'];
  if (!validPasswords.includes(password)) {
    return {
      success: false,
      error: 'Mật khẩu không đúng. Thử: 123456, password, hoặc password123',
    };
  }

  // Normalize email (convert to lowercase and check aliases)
  const normalizedEmail = email.toLowerCase();
  const actualEmail = emailAliases[normalizedEmail] || normalizedEmail;

  // Check if email is in the real user list or mock data
  const isRealUser = realUserEmails.includes(actualEmail) || realUserEmails.includes(normalizedEmail);

  // Try to find user in mock data first
  let user = mockUsers.find(u =>
    u.email.toLowerCase() === actualEmail ||
    u.email.toLowerCase() === normalizedEmail
  );

  // If not found in mock data but is a real user, create dynamic user
  if (!user && (isRealUser || realUserEmails.length > 0)) {
    // Map email to user info based on real data
    const userInfo = getUserInfoFromEmail(actualEmail);

    user = {
      id: userInfo.id, // Use real API ID instead of dynamic ID
      name: userInfo.name,
      email: actualEmail,
      role: userInfo.role,
      team_id: userInfo.team_id,
      location: userInfo.location,
      department: 'Bán lẻ',
      department_type: 'retail',
      position: userInfo.position,
      status: 'active',
      password_changed: true,
    };

    console.log('Created dynamic user from real data:', user);
  }

  // If still not found, create generic user
  if (!user) {
    const emailPrefix = email.split('@')[0];
    const userName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    user = {
      id: `dynamic_${Date.now()}`,
      name: userName,
      email: email,
      role: 'employee',
      team_id: '1',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: true,
    };

    console.log('Created generic dynamic user:', user);
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

// Helper function để map email thành user info với real API IDs
function getUserInfoFromEmail(email: string): {
  id: string;
  name: string;
  role: string;
  team_id: string;
  location: string;
  position: string;
} {
  const emailToUserMap: Record<string, any> = {
    'manh.khong@example.com': {
      id: 'Ve7sGRnMoRvT1E0VL5Ds', // Real API ID
      name: 'Khổng Đức Mạnh',
      role: 'retail_director',
      team_id: '0',
      location: 'Toàn quốc',
      position: 'Trưởng phòng Bán lẻ'
    },
    'vietanh@example.com': {
      id: 'Ue4vzSj1KDg4vZyXwlHJ', // Real API ID
      name: 'Lương Việt Anh',
      role: 'team_leader',
      team_id: '1',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'khanhduy@example.com': {
      id: 'abtSSmK0p0oeOyy5YWGZ', // Real API ID
      name: 'Lê Khánh Duy',
      role: 'employee',
      team_id: '1',
      location: 'Hà Nội',
      position: 'Nhân viên bán hàng'
    },
    'thao.nguyen@example.com': {
      id: 'MO7N4Trk6mASlHpIcjME', // Real API ID
      name: 'Nguyễn Thị Thảo',
      role: 'team_leader',
      team_id: '2',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'manhlinh@example.com': {
      id: '76ui8I1vw3wiJLyvwFjq', // Real API ID
      name: 'Nguyễn Mạnh Linh',
      role: 'employee',
      team_id: '2',
      location: 'Hà Nội',
      position: 'Nhân viên bán hàng'
    },
    'bon.trinh@example.com': {
      id: 'trinh_thi_bon_id', // Updated ID
      name: 'Trịnh Thị Bốn',
      role: 'team_leader',
      team_id: '3',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'quan@example.com': {
      id: 'le_tien_quan_id', // Added missing user
      name: 'Lê Tiến Quân',
      role: 'team_leader',
      team_id: '4',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'huong.pham@example.com': {
      id: 'pham_thi_huong_id', // Updated ID
      name: 'Phạm Thị Hương',
      role: 'team_leader',
      team_id: '5',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'nga.nguyen@example.com': {
      id: 'nguyen_thi_nga_id', // Updated ID
      name: 'Nguyễn Thị Nga',
      role: 'team_leader',
      team_id: '6',
      location: 'Hồ Chí Minh',
      position: 'Trưởng nhóm'
    },
    'tuyen.ha@example.com': {
      id: 'ha_nguyen_thanh_tuyen_id', // Updated ID
      name: 'Hà Nguyễn Thanh Tuyền',
      role: 'employee',
      team_id: '6',
      location: 'Hồ Chí Minh',
      position: 'Nhân viên bán hàng'
    },
    'vietkhanh@example.com': {
      id: 'nguyen_ngoc_viet_khanh_id', // Updated ID
      name: 'Nguyễn Ngọc Việt Khanh',
      role: 'team_leader',
      team_id: '7',
      location: 'Hồ Chí Minh',
      position: 'Trưởng nhóm'
    },
    'thuyvan@example.com': {
      id: 'phung_thi_thuy_van_id', // Updated ID
      name: 'Phùng Thị Thuỳ Vân',
      role: 'employee',
      team_id: '7',
      location: 'Hồ Chí Minh',
      position: 'Nhân viên bán hàng'
    },
    'thuha@example.com': {
      id: 'qgM8ogYQwu0T5zJUesfn', // Real API ID
      name: 'Quản Thu Hà',
      role: 'employee',
      team_id: '1',
      location: 'Hà Nội',
      position: 'Nhân viên bán hàng'
    }
  };

  return emailToUserMap[email] || {
    id: `fallback_${Date.now()}`,
    name: email.split('@')[0],
    role: 'employee',
    team_id: '1',
    location: 'Hà Nội',
    position: 'Nhân viên'
  };
}

// Mock get users function - trả về tất cả users thật từ hệ thống
export const mockGetUsers = async (): Promise<{
  success: boolean;
  data?: MockUser[];
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Tạo danh sách users thật từ hệ thống với real API IDs - CẬP NHẬT MỚI NHẤT
  const realUsers: MockUser[] = [
    // === TRƯỞNG PHÒNG BÁN LẺ ===
    {
      id: 'Ve7sGRnMoRvT1E0VL5Ds', // Real API ID
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@example.com',
      role: 'retail_director',
      team_id: '0', // Chưa có nhóm
      location: 'Toàn quốc',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng phòng Bán lẻ',
      status: 'active',
      password_changed: true,
    },

    // === CHI NHÁNH HÀ NỘI ===
    // NHÓM 1 HN - Lương Việt Anh (Trưởng nhóm)
    {
      id: 'Ue4vzSj1KDg4vZyXwlHJ', // Real API ID
      name: 'Lương Việt Anh',
      email: 'vietanh@example.com',
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
      id: 'abtSSmK0p0oeOyy5YWGZ', // Real API ID
      name: 'Lê Khánh Duy',
      email: 'khanhduy@example.com',
      role: 'employee',
      team_id: '1',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên bán hàng',
      status: 'active',
      password_changed: true,
    },
    {
      id: 'qgM8ogYQwu0T5zJUesfn', // Real API ID
      name: 'Quản Thu Hà',
      email: 'thuha@example.com',
      role: 'employee',
      team_id: '1',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên bán hàng',
      status: 'active',
      password_changed: true,
    },
    // NHÓM 2 HN - Nguyễn Thị Thảo (Trưởng nhóm)
    {
      id: 'MO7N4Trk6mASlHpIcjME', // Real API ID
      name: 'Nguyễn Thị Thảo',
      email: 'thao.nguyen@example.com',
      role: 'team_leader',
      team_id: '2',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },
    {
      id: '76ui8I1vw3wiJLyvwFjq', // Real API ID
      name: 'Nguyễn Mạnh Linh',
      email: 'manhlinh@example.com',
      role: 'employee',
      team_id: '2',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên bán hàng',
      status: 'active',
      password_changed: true,
    },

    // NHÓM 3 HN - Trịnh Thị Bốn (Trưởng nhóm)
    {
      id: 'trinh_thi_bon_id', // Updated ID
      name: 'Trịnh Thị Bốn',
      email: 'bon.trinh@example.com',
      role: 'team_leader',
      team_id: '3',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },

    // NHÓM 4 HN - Lê Tiến Quân (Trưởng nhóm)
    {
      id: 'le_tien_quan_id', // Updated ID
      name: 'Lê Tiến Quân',
      email: 'quan@example.com',
      role: 'team_leader',
      team_id: '4',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },

    // NHÓM 5 HN - Phạm Thị Hương (Trưởng nhóm)
    {
      id: 'pham_thi_huong_id', // Updated ID
      name: 'Phạm Thị Hương',
      email: 'huong.pham@example.com',
      role: 'team_leader',
      team_id: '5',
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },
    // === CHI NHÁNH TP. HỒ CHÍ MINH ===
    // NHÓM 1 HCM - Nguyễn Thị Nga (Trưởng nhóm)
    {
      id: 'nguyen_thi_nga_id', // Updated ID
      name: 'Nguyễn Thị Nga',
      email: 'nga.nguyen@example.com',
      role: 'team_leader',
      team_id: '6', // NHÓM 1 HCM
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },
    {
      id: 'ha_nguyen_thanh_tuyen_id', // Updated ID
      name: 'Hà Nguyễn Thanh Tuyền',
      email: 'tuyen.ha@example.com',
      role: 'employee',
      team_id: '6', // NHÓM 1 HCM
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên bán hàng',
      status: 'active',
      password_changed: true,
    },

    // NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh (Trưởng nhóm)
    {
      id: 'nguyen_ngoc_viet_khanh_id', // Updated ID
      name: 'Nguyễn Ngọc Việt Khanh',
      email: 'vietkhanh@example.com',
      role: 'team_leader',
      team_id: '7', // NHÓM 2 HCM
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: true,
    },
    {
      id: 'phung_thi_thuy_van_id', // Updated ID
      name: 'Phùng Thị Thuỳ Vân',
      email: 'thuyvan@example.com',
      role: 'employee',
      team_id: '7', // NHÓM 2 HCM
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên bán hàng',
      status: 'active',
      password_changed: true,
    },

    // === NHÂN VIÊN MỚI THÊM VÀO (nếu có) ===
    // Có thể thêm các nhân viên mới vào đây theo cấu trúc tương tự
  ];

  return {
    success: true,
    data: realUsers,
  };
};

// Mock get teams function - trả về tất cả teams thật từ hệ thống
export const mockGetTeams = async (): Promise<{
  success: boolean;
  data?: MockTeam[];
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Tạo danh sách teams thật từ hệ thống - CẬP NHẬT MỚI NHẤT
  const realTeams: MockTeam[] = [
    // === CHI NHÁNH HÀ NỘI ===
    {
      id: '1',
      name: 'NHÓM 1 HN',
      leader_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
      location: 'Hà Nội',
      description: 'Nhóm 1 Hà Nội - Trưởng nhóm: Lương Việt Anh',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '2',
      name: 'NHÓM 2 HN',
      leader_id: 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo
      location: 'Hà Nội',
      description: 'Nhóm 2 Hà Nội - Trưởng nhóm: Nguyễn Thị Thảo',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '3',
      name: 'NHÓM 3 HN',
      leader_id: 'trinh_thi_bon_id', // Trịnh Thị Bốn
      location: 'Hà Nội',
      description: 'Nhóm 3 Hà Nội - Trưởng nhóm: Trịnh Thị Bốn',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '4',
      name: 'NHÓM 4 HN',
      leader_id: 'le_tien_quan_id', // Lê Tiến Quân
      location: 'Hà Nội',
      description: 'Nhóm 4 Hà Nội - Trưởng nhóm: Lê Tiến Quân',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '5',
      name: 'NHÓM 5 HN',
      leader_id: 'pham_thi_huong_id', // Phạm Thị Hương
      location: 'Hà Nội',
      description: 'Nhóm 5 Hà Nội - Trưởng nhóm: Phạm Thị Hương',
      department: 'Bán lẻ',
      department_type: 'retail',
    },

    // === CHI NHÁNH TP. HỒ CHÍ MINH ===
    {
      id: '6',
      name: 'NHÓM 1 HCM',
      leader_id: 'nguyen_thi_nga_id', // Nguyễn Thị Nga
      location: 'Hồ Chí Minh',
      description: 'Nhóm 1 TP.HCM - Trưởng nhóm: Nguyễn Thị Nga',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '7',
      name: 'NHÓM 2 HCM',
      leader_id: 'nguyen_ngoc_viet_khanh_id', // Nguyễn Ngọc Việt Khanh
      location: 'Hồ Chí Minh',
      description: 'Nhóm 2 TP.HCM - Trưởng nhóm: Nguyễn Ngọc Việt Khanh',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
  ];

  return {
    success: true,
    data: realTeams,
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
