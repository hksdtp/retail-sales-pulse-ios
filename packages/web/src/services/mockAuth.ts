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
    password_changed: false, // UPDATED: Require password change like other users
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
    password_changed: false, // UPDATED: Require password change like other users
  },
];

// Danh sách emails thật từ hệ thống - tất cả đều có thể đăng nhập với password 123456
export const realUserEmails = [
  'manh.khong@example.com',
  'vietanh.luong@example.com',
  'khanhduy.le@example.com',
  'thuha.quan@example.com',
  'thao.nguyen@example.com',
  'manhlinh.nguyen@example.com',
  'bon.trinh@example.com',
  'huong.pham@example.com',
  'nga.nguyen@example.com',
  'tuyen.ha@example.com',
  'vietkhanh.nguyen@example.com',
  'thuyvan.phung@example.com'
];

// Email aliases cho dễ nhớ
export const emailAliases: Record<string, string> = {
  // Khổng Đức Mạnh
  'ducmanh': 'manh.khong@example.com',
  'manh': 'manh.khong@example.com',

  // Lương Việt Anh
  'vietanh': 'vietanh.luong@example.com',
  'anh': 'vietanh.luong@example.com',
  'vietanh.luong': 'vietanh.luong@example.com',

  // Lê Khánh Duy
  'khanhduy': 'khanhduy.le@example.com',
  'duy': 'khanhduy.le@example.com',

  // Quản Thu Hà
  'thuha': 'thuha.quan@example.com',
  'ha': 'thuha.quan@example.com',

  // Nguyễn Thị Thảo
  'thao': 'thao.nguyen@example.com',

  // Nguyễn Mạnh Linh
  'manhlinh': 'manhlinh.nguyen@example.com',
  'linh': 'manhlinh.nguyen@example.com',

  // Trịnh Thị Bốn
  'bon': 'bon.trinh@example.com',

  // Phạm Thị Hương
  'huong': 'huong.pham@example.com',

  // Nguyễn Thị Nga
  'nga': 'nga.nguyen@example.com',

  // Hà Nguyễn Thanh Tuyền
  'tuyen': 'tuyen.ha@example.com',

  // Nguyễn Ngọc Việt Khanh
  'vietkhanh': 'vietkhanh.nguyen@example.com',
  'khanh': 'vietkhanh.nguyen@example.com',

  // Phùng Thị Thuỳ Vân
  'thuyvan': 'thuyvan.phung@example.com',
  'van': 'thuyvan.phung@example.com',
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

// Mock authentication function - với logic admin và user passwords
export const mockLogin = async (email: string, password: string): Promise<{
  success: boolean;
  data?: { user: MockUser; token: string; requirePasswordChange?: boolean };
  error?: string;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🔐 Mock Login attempt:', { email, password: password ? '***' : 'empty' });

  // Admin password - có thể đăng nhập TẤT CẢ tài khoản trong hệ thống
  const ADMIN_PASSWORD = 'haininh1'; // FIXED: Match với API server và user input
  const DEFAULT_PASSWORD = '123456';

  const isAdminLogin = password === ADMIN_PASSWORD;
  const isDefaultPassword = password === DEFAULT_PASSWORD;

  console.log('🔐 [MockAuth] Password check for ALL USERS:', {
    email,
    isAdminLogin,
    isDefaultPassword,
    passwordLength: password.length,
    attemptType: isAdminLogin ? 'ADMIN_ACCESS' : isDefaultPassword ? 'DEFAULT_PASSWORD' : 'CUSTOM_PASSWORD'
  });

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

  // Use exported getStoredPassword function

  // Store custom password in localStorage
  const storePassword = (userId: string, password: string): void => {
    localStorage.setItem(`user_password_${userId}`, password);
  };

  // Clear stored password (for debugging/reset purposes)
  const clearStoredPassword = (userId: string): void => {
    localStorage.removeItem(`user_password_${userId}`);
  };

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
      password_changed: false, // Mặc định chưa đổi pass cho dynamic users
    };

    // IMPORTANT: Add the new user to mockUsers array so it can be found later (avoid duplicates)
    const existingUserIndex = mockUsers.findIndex(u => u.id === user.id);
    if (existingUserIndex === -1) {
      mockUsers.push(user);
      console.log('Created dynamic user from real data and added to mockUsers array:', user);
    } else {
      console.log('User already exists in mockUsers array, preserving password_changed flag:', user.name);
      // CRITICAL: Preserve password_changed flag from existing user
      const existingUser = mockUsers[existingUserIndex];
      user.password_changed = existingUser.password_changed;
      mockUsers[existingUserIndex] = user;
      console.log('✅ Preserved password_changed flag:', user.password_changed);
    }

    // Also save to localStorage for persistence (avoid duplicates)
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      let parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const existingStoredIndex = parsedUsers.findIndex((u: any) => u.id === user.id);
      if (existingStoredIndex === -1) {
        parsedUsers.push(user);
        console.log('✅ Saved new real data user to localStorage');
      } else {
        // CRITICAL: Preserve password_changed flag from stored user
        const existingStoredUser = parsedUsers[existingStoredIndex];
        user.password_changed = existingStoredUser.password_changed || user.password_changed;
        parsedUsers[existingStoredIndex] = user;
        console.log('✅ Updated existing real data user in localStorage, preserved password_changed:', user.password_changed);
      }
      localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
    } catch (error) {
      console.warn('⚠️ Could not save real data user to localStorage:', error);
    }
  }

  // Sync user data with any stored changes (important for password_changed flag)
  if (user) {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        const storedUser = parsedUsers.find((u: any) => u.id === user.id);
        if (storedUser && storedUser.password_changed !== user.password_changed) {
          console.log('🔄 [MockAuth] Syncing user data from localStorage for:', user.name, {
            oldPasswordChanged: user.password_changed,
            newPasswordChanged: storedUser.password_changed
          });
          user = { ...user, ...storedUser };

          // Update the main mockUsers array
          const userIndex = mockUsers.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            mockUsers[userIndex] = user;
          }
        }
      }

      // CRITICAL: If user has stored password, ensure password_changed is true
      // BUT SKIP THIS IN PASSWORD RESET MODE
      const isPasswordResetMode = localStorage.getItem('password_reset_mode') === 'true';
      const storedPassword = getStoredPassword(user.id);

      if (storedPassword && !user.password_changed && !isPasswordResetMode) {
        console.log('🔧 [MockAuth] FIXING: User has stored password but password_changed is false. Setting to true for:', user.name);
        user.password_changed = true;

        // Update mockUsers array
        const userIndex = mockUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          mockUsers[userIndex].password_changed = true;
        }

        // Update localStorage backup
        try {
          const storedUsers = localStorage.getItem('mockUsers');
          if (storedUsers) {
            const parsedUsers = JSON.parse(storedUsers);
            const storedUserIndex = parsedUsers.findIndex((u: any) => u.id === user.id);
            if (storedUserIndex !== -1) {
              parsedUsers[storedUserIndex].password_changed = true;
              localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not update localStorage mockUsers backup:', error);
        }
      } else if (isPasswordResetMode) {
        console.log('🚫 [MockAuth] Password reset mode active - skipping password_changed auto-fix for:', user.name);
      }
    } catch (error) {
      console.warn('⚠️ Could not sync user data from localStorage:', error);
    }
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
      password_changed: false, // Mặc định chưa đổi pass
    };

    // IMPORTANT: Add the new user to mockUsers array so it can be found later (avoid duplicates)
    const existingUserIndex = mockUsers.findIndex(u => u.id === user.id);
    if (existingUserIndex === -1) {
      mockUsers.push(user);
      console.log('Created generic dynamic user and added to mockUsers array:', user);
    } else {
      console.log('User already exists in mockUsers array, preserving password_changed flag:', user.name);
      // CRITICAL: Preserve password_changed flag from existing user
      const existingUser = mockUsers[existingUserIndex];
      user.password_changed = existingUser.password_changed;
      mockUsers[existingUserIndex] = user;
      console.log('✅ Preserved password_changed flag:', user.password_changed);
    }

    // Also save to localStorage for persistence (avoid duplicates)
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      let parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const existingStoredIndex = parsedUsers.findIndex((u: any) => u.id === user.id);
      if (existingStoredIndex === -1) {
        parsedUsers.push(user);
        console.log('✅ Saved new dynamic user to localStorage');
      } else {
        // CRITICAL: Preserve password_changed flag from stored user
        const existingStoredUser = parsedUsers[existingStoredIndex];
        user.password_changed = existingStoredUser.password_changed || user.password_changed;
        parsedUsers[existingStoredIndex] = user;
        console.log('✅ Updated existing dynamic user in localStorage, preserved password_changed:', user.password_changed);
      }
      localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
    } catch (error) {
      console.warn('⚠️ Could not save dynamic user to localStorage:', error);
    }
  }

  // Password validation logic for ALL USERS
  let isValidPassword = false;
  let requirePasswordChange = false;
  let loginType = 'standard';

  console.log('🔐 [MockAuth] Validating password for user:', {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    passwordChanged: user.password_changed,
    isAdminLogin,
    isDefaultPassword
  });

  if (isAdminLogin) {
    // UPDATED: Admin password works for all users but still requires password change
    // Removed special treatment for Khổng Đức Mạnh
    console.log('✅ [MockAuth] ADMIN LOGIN - allowing access for:', user.name);
    isValidPassword = true;
    // CHANGED: Admin login still requires password change for consistency
    requirePasswordChange = !user.password_changed;
    loginType = 'admin_access';
  } else if (user.role === 'retail_director' && isDefaultPassword && !user.password_changed) {
    // Special case: Director can use default password 123456 ONLY if haven't changed password yet
    console.log('✅ [MockAuth] Director first login with default password - allowed');
    isValidPassword = true;
    requirePasswordChange = false;
    loginType = 'director_default';
  } else {
    // Check user's custom password first
    const storedPassword = getStoredPassword(user.id);

    console.log('🔍 [MockAuth] Password validation for user:', user.name, {
      hasStoredPassword: !!storedPassword,
      storedPasswordLength: storedPassword?.length,
      inputPassword: password ? `***${password.length}` : 'empty',
      isDefaultPassword,
      userPasswordChanged: user.password_changed,
      isAdminLogin
    });

    if (storedPassword) {
      // User has custom password - check against it ONLY
      console.log('🔍 [MockAuth] Checking against stored custom password for:', user.name);
      isValidPassword = password === storedPassword;
      requirePasswordChange = false;
      loginType = 'custom_password';
      console.log('🔍 [MockAuth] Custom password check result:', isValidPassword ? '✅ MATCH' : '❌ NO MATCH');

      // IMPORTANT: If user has custom password, NEVER allow default password
      if (!isValidPassword && isDefaultPassword) {
        console.log('❌ [MockAuth] User has custom password - default password 123456 is NO LONGER VALID');
      }
    } else if (isDefaultPassword && !user.password_changed) {
      // First time login with default password - WORKS FOR ALL USERS
      console.log('🔍 [MockAuth] First time login with default password for:', user.name);
      console.log('🔍 [MockAuth] User password_changed status:', user.password_changed);
      isValidPassword = true;
      requirePasswordChange = true;
      loginType = 'first_login';
    } else {
      // Invalid password
      console.log('❌ [MockAuth] Invalid password for user:', user.name, {
        reason: storedPassword ? 'wrong_custom_password' : 'default_password_but_already_changed',
        hasStoredPassword: !!storedPassword,
        userPasswordChanged: user.password_changed,
        inputPassword: password ? `***${password.length}` : 'empty',
        isDefaultPassword,
        message: storedPassword ? 'User has custom password, must use new password' : 'User already changed password, cannot use default 123456'
      });
      isValidPassword = false;
    }
  }

  if (!isValidPassword) {
    let errorMessage = 'Mật khẩu không đúng';

    // SECURITY FIX: Remove dangerous reset mode that bypassed password validation
    console.log('❌ [MockAuth] Invalid password for user:', user.name);

    // Provide specific error messages based on user state
    const storedPassword = getStoredPassword(user.id);

    if (storedPassword) {
      // User has custom password - must use it
      errorMessage = 'Mật khẩu không đúng. Vui lòng nhập mật khẩu mới mà bạn đã đặt.';
    } else if (user.password_changed) {
      // User changed password but we don't have stored password
      errorMessage = 'Mật khẩu không đúng. Bạn đã thay đổi mật khẩu trước đó.';
    } else {
      // User hasn't changed password yet, should use default
      errorMessage = 'Mật khẩu không đúng. Vui lòng sử dụng mật khẩu mặc định 123456.';
    }

    return {
      success: false,
      error: errorMessage,
      user: null,
      requirePasswordChange: false,
      loginType: 'failed'
    };


  }

  // Generate mock token
  const token = `mock_token_${user.id}_${Date.now()}`;

  console.log('✅ [MockAuth] Login successful for ALL USERS:', {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    loginType,
    requirePasswordChange,
    passwordChanged: user.password_changed
  });

  return {
    success: true,
    data: {
      user,
      token,
      requirePasswordChange,
      loginType,
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
    'vietanh.luong@example.com': {
      id: 'Ue4vzSj1KDg4vZyXwlHJ', // Real API ID
      name: 'Lương Việt Anh',
      role: 'team_leader',
      team_id: '1',
      location: 'Hà Nội',
      position: 'Trưởng nhóm'
    },
    'khanhduy@example.com': {
      id: 'user_khanh_duy', // Use consistent ID with database
      name: 'Lê Khánh Duy',
      role: 'employee',
      team_id: '1',
      location: 'hanoi',
      position: 'Nhân viên bán hàng'
    },
    'khanhduy.le@example.com': {
      id: 'user_khanh_duy', // Same user, different email format
      name: 'Lê Khánh Duy',
      role: 'employee',
      team_id: '1',
      location: 'hanoi',
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
    'manhlinh.nguyen@example.com': {
      id: '76ui8I1vw3wiJLyvwFjq', // Real API ID - same as above
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
    'huong.pham@example.com': {
      id: 'pham_thi_huong_id', // Updated ID
      name: 'Phạm Thị Hương',
      role: 'team_leader',
      team_id: '5',
      location: 'hanoi',
      position: 'Trưởng nhóm'
    },
    'nga.nguyen@example.com': {
      id: 'nguyen_thi_nga_id', // Updated ID
      name: 'Nguyễn Thị Nga',
      role: 'team_leader',
      team_id: '6',
      location: 'hcm',
      position: 'Trưởng nhóm'
    },
    'tuyen.ha@example.com': {
      id: 'ha_nguyen_thanh_tuyen_id', // Updated ID
      name: 'Hà Nguyễn Thanh Tuyền',
      role: 'employee',
      team_id: '6',
      location: 'hcm',
      position: 'Nhân viên bán hàng'
    },
    'vietkhanh@example.com': {
      id: 'nguyen_ngoc_viet_khanh_id', // Updated ID
      name: 'Nguyễn Ngọc Việt Khanh',
      role: 'team_leader',
      team_id: '7',
      location: 'hcm',
      position: 'Trưởng nhóm'
    },
    'thuyvan@example.com': {
      id: 'phung_thi_thuy_van_id', // Updated ID
      name: 'Phùng Thị Thuỳ Vân',
      role: 'employee',
      team_id: '7',
      location: 'hcm',
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
    // === TRƯỞNG PHÒNG KINH DOANH ===
    {
      id: 'user_manh',
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@example.com',
      role: 'retail_director',
      team_id: '0',
      location: 'all',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng phòng kinh doanh',
      status: 'active',
      password_changed: false, // UPDATED: Require password change like other users
    },

    // === CHI NHÁNH HÀ NỘI ===
    // NHÓM 1 - VIỆT ANH
    {
      id: 'user_viet_anh',
      name: 'Lương Việt Anh',
      email: 'vietanh.luong@example.com',
      role: 'team_leader',
      team_id: '1', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false, // Chưa đổi pass - phải đổi lần đầu
    },
    {
      id: 'user_khanh_duy',
      name: 'Lê Khánh Duy',
      email: 'khanhduy.le@example.com',
      role: 'sales_staff',
      team_id: '1', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: false, // Chưa đổi pass - phải đổi lần đầu
    },
    {
      id: 'user_thu_ha',
      name: 'Quản Thu Hà',
      email: 'thuha.quan@example.com',
      role: 'sales_staff',
      team_id: '1', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },
    // NHÓM 2 - THẢO
    {
      id: 'user_thao',
      name: 'Nguyễn Thị Thảo',
      email: 'thao.nguyen@example.com',
      role: 'team_leader',
      team_id: '2', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },
    {
      id: 'user_manh_linh',
      name: 'Nguyễn Mạnh Linh',
      email: 'manhlinh.nguyen@example.com',
      role: 'sales_staff',
      team_id: '2', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },

    // NHÓM 3
    {
      id: 'user_bon',
      name: 'Trịnh Thị Bốn',
      email: 'bon.trinh@example.com',
      role: 'team_leader',
      team_id: '3', // FIXED: Match với team id trong mockGetTeams
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },

    // NHÓM 4
    {
      id: 'user_huong',
      name: 'Phạm Thị Hương',
      email: 'huong.pham@example.com',
      role: 'team_leader',
      team_id: '5', // FIXED: Match với team id trong mockGetTeams (NHÓM 5)
      location: 'Hà Nội',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },
    // === CHI NHÁNH HỒ CHÍ MINH ===
    // NHÓM 1
    {
      id: 'user_nga',
      name: 'Nguyễn Thị Nga',
      email: 'nga.nguyen@example.com',
      role: 'team_leader',
      team_id: '6', // FIXED: Match với team id trong mockGetTeams
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },
    {
      id: 'user_tuyen',
      name: 'Hà Nguyễn Thanh Tuyền',
      email: 'tuyen.ha@example.com',
      role: 'sales_staff',
      team_id: '6', // FIXED: Match với team id trong mockGetTeams
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },

    // NHÓM 2
    {
      id: 'user_viet_khanh',
      name: 'Nguyễn Ngọc Việt Khanh',
      email: 'vietkhanh.nguyen@example.com',
      role: 'team_leader',
      team_id: '7', // FIXED: Match với team id trong mockGetTeams
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng nhóm',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
    },
    {
      id: 'user_thuy_van',
      name: 'Phùng Thị Thuỳ Vân',
      email: 'thuyvan.phung@example.com',
      role: 'sales_staff',
      team_id: '7', // FIXED: Match với team id trong mockGetTeams
      location: 'Hồ Chí Minh',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Nhân viên',
      status: 'active',
      password_changed: false // FIXED: Allow default password login
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
      name: 'NHÓM 1',
      leader_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
      location: 'hanoi',
      description: 'Nhóm 1 Hà Nội - Trưởng nhóm: Lương Việt Anh',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '2',
      name: 'NHÓM 2',
      leader_id: 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo
      location: 'hanoi',
      description: 'Nhóm 2 Hà Nội - Trưởng nhóm: Nguyễn Thị Thảo',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '3',
      name: 'NHÓM 3',
      leader_id: 'trinh_thi_bon_id', // Trịnh Thị Bốn
      location: 'hanoi',
      description: 'Nhóm 3 Hà Nội - Trưởng nhóm: Trịnh Thị Bốn',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '5',
      name: 'NHÓM 5',
      leader_id: 'pham_thi_huong_id', // Phạm Thị Hương
      location: 'hanoi',
      description: 'Nhóm 5 Hà Nội - Trưởng nhóm: Phạm Thị Hương',
      department: 'Bán lẻ',
      department_type: 'retail',
    },

    // === CHI NHÁNH TP. HỒ CHÍ MINH ===
    {
      id: '6',
      name: 'NHÓM 1',
      leader_id: 'nguyen_thi_nga_id', // Nguyễn Thị Nga
      location: 'hcm',
      description: 'Nhóm 1 TP.HCM - Trưởng nhóm: Nguyễn Thị Nga',
      department: 'Bán lẻ',
      department_type: 'retail',
    },
    {
      id: '7',
      name: 'NHÓM 2',
      leader_id: 'nguyen_ngoc_viet_khanh_id', // Nguyễn Ngọc Việt Khanh
      location: 'hcm',
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

// Mock change password function
export const mockChangePassword = async (userId: string, newPassword: string): Promise<{
  success: boolean;
  data?: { message: string };
  error?: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('🔐 Mock change password for user:', userId, {
    newPasswordLength: newPassword?.length
  });

  // Store new password in localStorage
  localStorage.setItem(`user_password_${userId}`, newPassword);
  console.log('✅ Stored new password in localStorage for user:', userId);

  // Mark user as password changed in mockUsers array
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].password_changed = true;
    console.log('✅ Updated mockUsers array - password_changed = true for user:', mockUsers[userIndex].name);
  } else {
    console.error('❌ User not found in mockUsers array:', userId);
  }

  // Also update localStorage backup of users if exists
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      const storedUserIndex = parsedUsers.findIndex((u: any) => u.id === userId);
      if (storedUserIndex !== -1) {
        parsedUsers[storedUserIndex].password_changed = true;
        localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
        console.log('✅ Updated localStorage mockUsers backup');
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not update localStorage mockUsers backup:', error);
  }

  // 3. Sync password change to Supabase
  try {
    const supabaseResult = await syncPasswordChangeToSupabase(userId, newPassword);
    console.log('✅ Supabase password sync result:', supabaseResult);
  } catch (supabaseError) {
    console.error('❌ Failed to sync password to Supabase (continuing with local change):', supabaseError);
    // Don't fail the entire operation if Supabase sync fails
  }

  console.log('✅ Password change completed for user (Local + Supabase):', userId);

  return {
    success: true,
    data: { message: 'Mật khẩu đã được thay đổi thành công (Local + Supabase)' },
  };
};

// Debug function to check user password status
export const debugUserPasswordStatus = (userId: string) => {
  const storedPassword = localStorage.getItem(`user_password_${userId}`);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  const user = userIndex !== -1 ? mockUsers[userIndex] : null;

  // Also check localStorage for user data
  let storedUserData = null;
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      storedUserData = parsedUsers.find((u: any) => u.id === userId);
    }
  } catch (error) {
    console.warn('Could not parse stored users:', error);
  }

  console.log('🔍 Password Status Debug for user:', userId, {
    hasStoredPassword: !!storedPassword,
    storedPasswordLength: storedPassword?.length,
    userPasswordChanged: user?.password_changed,
    userName: user?.name,
    userRole: user?.role,
    userFoundInMockUsers: !!user,
    userFoundInLocalStorage: !!storedUserData,
    storedUserPasswordChanged: storedUserData?.password_changed,
    storedUserName: storedUserData?.name,
    mockUsersCount: mockUsers.length
  });

  return {
    hasStoredPassword: !!storedPassword,
    storedPasswordLength: storedPassword?.length,
    userPasswordChanged: user?.password_changed,
    userName: user?.name,
    userFoundInMockUsers: !!user,
    userFoundInLocalStorage: !!storedUserData,
    storedUserPasswordChanged: storedUserData?.password_changed,
    storedUserName: storedUserData?.name
  };
};

// Debug function to list all users
export const debugListAllUsers = () => {
  console.log('📋 All users in mockUsers array:', mockUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password_changed: u.password_changed
  })));

  // Also check localStorage
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      console.log('📋 All users in localStorage:', parsedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password_changed: u.password_changed
      })));
    } else {
      console.log('📋 No users found in localStorage');
    }
  } catch (error) {
    console.warn('Could not parse stored users:', error);
  }

  return {
    mockUsersCount: mockUsers.length,
    mockUsers: mockUsers.map(u => ({ id: u.id, name: u.name, email: u.email, password_changed: u.password_changed }))
  };
};

// Function to debug all stored passwords
export const debugAllStoredPasswords = () => {
  console.log('🔍 Debugging all stored passwords...');

  const allStoredPasswords: { key: string, userId: string, password: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_password_')) {
      const userId = key.replace('user_password_', '');
      const password = localStorage.getItem(key) || '';
      allStoredPasswords.push({ key, userId, password });
    }
  }

  console.log('🔍 All stored passwords:', allStoredPasswords);

  // Check each stored password against users
  allStoredPasswords.forEach(({ key, userId, password }) => {
    const user = mockUsers.find(u => u.id === userId);
    console.log(`🔍 Password for ${userId}:`, {
      key,
      userId,
      passwordLength: password.length,
      userFound: !!user,
      userName: user?.name,
      userPasswordChanged: user?.password_changed
    });
  });

  return allStoredPasswords;
};

// Export getStoredPassword function for debugging
export const getStoredPassword = (userId: string): string | null => {
  const key = `user_password_${userId}`;
  const password = localStorage.getItem(key);
  console.log('🔍 [getStoredPassword] Looking for:', { userId, key, found: !!password, passwordLength: password?.length });
  return password;
};

// Debug function to test localStorage directly
export const debugLocalStorageAccess = (userId: string) => {
  const key = `user_password_${userId}`;
  console.log('🔍 Direct localStorage test for:', userId);

  // Test direct access
  const directAccess = localStorage.getItem(key);
  console.log('📋 Direct localStorage.getItem result:', { key, value: directAccess, found: !!directAccess });

  // Test via getStoredPassword function
  const viaFunction = getStoredPassword(userId);
  console.log('📋 Via getStoredPassword function:', { value: viaFunction, found: !!viaFunction });

  // List all localStorage keys
  const allKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (storageKey && storageKey.startsWith('user_password_')) {
      allKeys.push({
        key: storageKey,
        value: localStorage.getItem(storageKey)
      });
    }
  }
  console.log('📋 All password keys in localStorage:', allKeys);

  return {
    directAccess,
    viaFunction,
    allKeys,
    match: directAccess === viaFunction
  };
};

// Function to restore stored password for testing
export const restoreStoredPassword = (userId: string, password: string) => {
  console.log('🔧 Restoring stored password for user:', userId);
  localStorage.setItem(`user_password_${userId}`, password);

  // Also update user's password_changed flag
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].password_changed = true;
    console.log('✅ Updated password_changed flag for:', mockUsers[userIndex].name);
  }

  // Update localStorage backup
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      const storedUserIndex = parsedUsers.findIndex((u: any) => u.id === userId);
      if (storedUserIndex !== -1) {
        parsedUsers[storedUserIndex].password_changed = true;
        localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
        console.log('✅ Updated localStorage backup');
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not update localStorage backup:', error);
  }

  console.log('✅ Stored password restored successfully');
  return true;
};

// Reset all user passwords to default (123456) - ADMIN FUNCTION
export const resetAllPasswordsToDefault = () => {
  console.log('🔄 RESETTING ALL USER PASSWORDS TO DEFAULT...');

  // 1. Enable password reset mode to prevent auto-restore
  localStorage.setItem('password_reset_mode', 'true');
  console.log('🔧 Enabled password reset mode');

  let clearedCount = 0;
  let resetCount = 0;

  // 2. Clear all stored passwords from localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_password_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    clearedCount++;
    console.log(`🗑️ Cleared stored password: ${key}`);
  });

  // 3. Reset all user password_changed flags to false
  mockUsers.forEach(user => {
    if (user.password_changed) {
      user.password_changed = false;
      resetCount++;
      console.log(`🔄 Reset password_changed flag for: ${user.name}`);
    }
  });

  // 4. Clear any stored user data that might have password_changed flag
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers);
      parsedUsers.forEach((user: any) => {
        user.password_changed = false;
      });
      localStorage.setItem('mockUsers', JSON.stringify(parsedUsers));
      console.log('🔄 Reset password_changed flags in stored users');
    } catch (error) {
      console.warn('Could not parse stored users:', error);
    }
  }

  // 5. Reset realUsers data directly in the array - this is critical!
  console.log('🔄 Resetting realUsers data directly...');
  // Access the realUsers array from mockGetUsers and reset password_changed flags
  const realUsers = [
    // Copy the structure but reset password_changed to false
    {
      id: 'user_manh',
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@example.com',
      role: 'retail_director',
      team_id: '0',
      location: 'all',
      department: 'Bán lẻ',
      department_type: 'retail',
      position: 'Trưởng phòng kinh doanh',
      status: 'active',
      password_changed: false, // UPDATED: Require password change like other users
    }
    // Add other users as needed
  ];

  // Store the reset data temporarily
  localStorage.setItem('realUsers_reset', JSON.stringify(realUsers));
  console.log('✅ Stored reset realUsers data');

  console.log(`✅ PASSWORD RESET COMPLETE:`);
  console.log(`   - Cleared ${clearedCount} stored passwords`);
  console.log(`   - Reset ${resetCount} user flags`);
  console.log(`   - All users can now login with: 123456`);
  console.log(`   - Admin password still works: haininh1`);
  console.log(`   - Password reset mode enabled`);

  return {
    clearedPasswords: clearedCount,
    resetUsers: resetCount,
    totalUsers: mockUsers.length,
    success: true
  };
};

// Sync password change to Supabase for specific user
export const syncPasswordChangeToSupabase = async (userId: string, newPassword: string) => {
  console.log('🔄 Syncing password change to Supabase for user:', userId);

  try {
    // Import SupabaseService
    const { SupabaseService } = await import('@/services/SupabaseService');
    const supabaseClient = SupabaseService.getInstance().getClient();

    if (!supabaseClient) {
      console.warn('⚠️ Supabase client not available, skipping sync');
      return { success: false, error: 'Supabase not configured' };
    }

    // Update specific user in Supabase
    const { data, error } = await supabaseClient
      .from('users')
      .update({
        password: newPassword,  // Update to new password
        password_changed: true  // Mark as password changed
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Error updating user password in Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Successfully updated user password in Supabase:', userId);
    return {
      success: true,
      message: 'User password updated in Supabase',
      updatedUser: data?.[0]
    };

  } catch (error) {
    console.error('❌ Error syncing password change to Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Sync password reset to Supabase - Reset all users to default password
export const syncPasswordResetToSupabase = async () => {
  console.log('🔄 Syncing password reset to Supabase...');

  try {
    // Import SupabaseService
    const { SupabaseService } = await import('@/services/SupabaseService');
    const supabaseClient = SupabaseService.getInstance().getClient();

    if (!supabaseClient) {
      console.warn('⚠️ Supabase client not available, skipping sync');
      return { success: false, error: 'Supabase not configured' };
    }

    // Update all users in Supabase to reset password state
    const { data, error } = await supabaseClient
      .from('users')
      .update({
        password: '123456',  // Reset to default password
        password_changed: false  // Reset password_changed flag
      })
      .neq('id', 'dummy'); // Update all users (using neq with dummy to select all)

    if (error) {
      console.error('❌ Error updating users in Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Successfully reset all user passwords in Supabase');
    return {
      success: true,
      message: 'All user passwords reset to default in Supabase',
      updatedUsers: data
    };

  } catch (error) {
    console.error('❌ Error syncing password reset to Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Add password column to Supabase via SQL (ADMIN FUNCTION)
export const addPasswordColumnToSupabaseSQL = async () => {
  console.log('🔄 Adding password column to Supabase via SQL...');

  try {
    // Import SupabaseService
    const { SupabaseService } = await import('@/services/SupabaseService');
    const supabaseClient = SupabaseService.getInstance().getClient();

    if (!supabaseClient) {
      console.warn('⚠️ Supabase client not available, skipping');
      return { success: false, error: 'Supabase not configured' };
    }

    // Use Supabase SQL function to add column
    const { data, error } = await supabaseClient
      .rpc('sql', {
        query: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
          UPDATE users SET password = '123456' WHERE password IS NULL;
        `
      });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Successfully added password column via SQL');
    return {
      success: true,
      message: 'Password column added successfully',
      result: data
    };

  } catch (error) {
    console.error('❌ Error adding password column via SQL:', error);
    return { success: false, error: error.message };
  }
};

// Check if password column exists and add if needed (ADMIN FUNCTION)
export const ensurePasswordColumnInSupabase = async () => {
  console.log('🔄 Ensuring password column exists in Supabase users table...');

  try {
    // Import SupabaseService
    const { SupabaseService } = await import('@/services/SupabaseService');
    const supabaseClient = SupabaseService.getInstance().getClient();

    if (!supabaseClient) {
      console.warn('⚠️ Supabase client not available, skipping check');
      return { success: false, error: 'Supabase not configured' };
    }

    // Try to select password column to check if it exists
    const { data: testData, error: testError } = await supabaseClient
      .from('users')
      .select('id, password')
      .limit(1);

    if (testError && testError.message.includes('password')) {
      console.log('❌ Password column does not exist.');
      console.log('🔧 Attempting to add password column automatically...');

      // Try to add column automatically
      const addResult = await addPasswordColumnToSupabaseSQL();
      if (addResult.success) {
        console.log('✅ Password column added automatically!');
        return addResult;
      } else {
        console.log('❌ Auto-add failed. Please run this SQL manually in Supabase dashboard:');
        console.log(`
          -- Add password column to users table
          ALTER TABLE users ADD COLUMN password TEXT;

          -- Set default password for all existing users
          UPDATE users SET password = '123456';
        `);

        return {
          success: false,
          error: 'Password column does not exist and auto-add failed',
          sqlToRun: `
            ALTER TABLE users ADD COLUMN password TEXT;
            UPDATE users SET password = '123456';
          `,
          autoAddError: addResult.error
        };
      }
    }

    if (testError) {
      console.error('❌ Error checking password column:', testError);
      return { success: false, error: testError.message };
    }

    console.log('✅ Password column exists in Supabase');

    // If column exists, ensure all users have default password
    const { data: updateData, error: updateError } = await supabaseClient
      .from('users')
      .update({ password: '123456' })
      .is('password', null)
      .select();

    if (updateError) {
      console.error('❌ Error setting default passwords:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Password column ready, default passwords set');

    return {
      success: true,
      message: 'Password column exists and default passwords are set',
      updatedUsers: updateData?.length || 0
    };

  } catch (error) {
    console.error('❌ Error ensuring password column:', error);
    return { success: false, error: error.message };
  }
};

// Update all users in Supabase to password_changed: false (ADMIN FUNCTION)
export const updateAllUsersPasswordChangedToFalse = async () => {
  console.log('🔄 Updating all users in Supabase to password_changed: false...');

  try {
    // Import SupabaseService
    const { SupabaseService } = await import('@/services/SupabaseService');
    const supabaseClient = SupabaseService.getInstance().getClient();

    if (!supabaseClient) {
      console.warn('⚠️ Supabase client not available, skipping update');
      return { success: false, error: 'Supabase not configured' };
    }

    // Update all users in Supabase
    const { data, error } = await supabaseClient
      .from('users')
      .update({ password_changed: false })
      .neq('id', 'dummy') // Update all users (using neq with dummy to select all)
      .select();

    if (error) {
      console.error('❌ Error updating users in Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Successfully updated all users to password_changed: false in Supabase');
    console.log('📊 Updated users count:', data?.length || 0);

    return {
      success: true,
      message: `Updated ${data?.length || 0} users to password_changed: false in Supabase`,
      updatedUsers: data
    };

  } catch (error) {
    console.error('❌ Error updating users in Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Test complete password sync flow (ADMIN FUNCTION)
export const testCompletePasswordSyncFlow = async () => {
  console.log('🧪 Testing complete password sync flow...');

  const results = {
    step1_ensureColumn: null,
    step2_resetAllPasswords: null,
    step3_testPasswordChange: null,
    step4_testPasswordReset: null,
    summary: {}
  };

  try {
    // Step 1: Ensure password column exists
    console.log('\\n📋 STEP 1: Ensure password column exists');
    results.step1_ensureColumn = await ensurePasswordColumnInSupabase();
    console.log('Step 1 result:', results.step1_ensureColumn.success ? '✅ SUCCESS' : '❌ FAILED');

    if (!results.step1_ensureColumn.success) {
      console.log('❌ Cannot proceed without password column. Please add it manually.');
      return results;
    }

    // Step 2: Reset all passwords to default
    console.log('\\n📋 STEP 2: Reset all passwords to default');
    results.step2_resetAllPasswords = await syncPasswordResetToSupabase();
    console.log('Step 2 result:', results.step2_resetAllPasswords.success ? '✅ SUCCESS' : '❌ FAILED');

    // Step 3: Test password change for a user
    console.log('\\n📋 STEP 3: Test password change sync');
    results.step3_testPasswordChange = await syncPasswordChangeToSupabase('user_manh', 'newpassword123');
    console.log('Step 3 result:', results.step3_testPasswordChange.success ? '✅ SUCCESS' : '❌ FAILED');

    // Step 4: Test password reset again
    console.log('\\n📋 STEP 4: Test password reset again');
    results.step4_testPasswordReset = await syncPasswordResetToSupabase();
    console.log('Step 4 result:', results.step4_testPasswordReset.success ? '✅ SUCCESS' : '❌ FAILED');

    // Summary
    const successCount = [
      results.step1_ensureColumn?.success,
      results.step2_resetAllPasswords?.success,
      results.step3_testPasswordChange?.success,
      results.step4_testPasswordReset?.success
    ].filter(Boolean).length;

    results.summary = {
      totalSteps: 4,
      successfulSteps: successCount,
      overallSuccess: successCount === 4,
      message: `${successCount}/4 steps completed successfully`
    };

    console.log('\\n🎉 TEST SUMMARY:');
    console.log(`✅ Successful steps: ${successCount}/4`);
    console.log(`🎯 Overall result: ${results.summary.overallSuccess ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);

    return results;

  } catch (error) {
    console.error('❌ Error in test flow:', error);
    results.summary = {
      totalSteps: 4,
      successfulSteps: 0,
      overallSuccess: false,
      error: error.message
    };
    return results;
  }
};

// Force reset Khổng Đức Mạnh password_changed to false
export const forceResetManhPasswordChanged = () => {
  console.log('🔧 Force resetting Khổng Đức Mạnh password_changed to false...');

  try {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      return { success: false, error: 'No users found' };
    }

    const users = JSON.parse(usersStr);
    const userIndex = users.findIndex((u: any) => u.name === 'Khổng Đức Mạnh');

    if (userIndex === -1) {
      return { success: false, error: 'Khổng Đức Mạnh not found' };
    }

    // Force reset password_changed to false
    users[userIndex].password_changed = false;
    // Also reset password to default
    users[userIndex].password = '123456';
    localStorage.setItem('users', JSON.stringify(users));

    // Also update currentUser if it's Khổng Đức Mạnh
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.name === 'Khổng Đức Mạnh') {
        currentUser.password_changed = false;
        currentUser.password = '123456';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('✅ Also updated currentUser');
      }
    }

    // Clear any auth tokens to force fresh login
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginType');

    console.log(`✅ Successfully reset password_changed for Khổng Đức Mạnh`);

    return {
      success: true,
      message: 'Reset password_changed for Khổng Đức Mạnh - cleared auth tokens',
      user: users[userIndex]
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: 'Failed to reset' };
  }
};

// Fix password change requirement after successful password change
export const fixPasswordChangeRequirement = () => {
  console.log('🔧 Fixing password change requirement...');

  // Get current user from localStorage
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    console.log('❌ No current user found in localStorage');
    return { success: false, error: 'No current user' };
  }

  try {
    const currentUser = JSON.parse(currentUserStr);
    console.log('👤 Current user:', {
      id: currentUser.id,
      name: currentUser.name,
      password_changed: currentUser.password_changed
    });

    // If user has changed password, force update the flag
    if (currentUser.password_changed) {
      console.log('✅ User already has password_changed = true, forcing auth state reset');

      // Force reload to reset auth state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return {
        success: true,
        message: 'Password change requirement fixed - reloading page',
        userPasswordChanged: true
      };
    } else {
      console.log('⚠️ User password_changed = false, this might be the issue');

      // Force set password_changed to true
      currentUser.password_changed = true;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      console.log('✅ Forced password_changed = true and reloading');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return {
        success: true,
        message: 'Forced password_changed = true and reloading',
        userPasswordChanged: false,
        fixed: true
      };
    }

  } catch (error) {
    console.error('❌ Error parsing current user:', error);
    return { success: false, error: 'Failed to parse current user' };
  }
};

// Disable password reset mode - allows auto-restore to work again
export const disablePasswordResetMode = () => {
  localStorage.removeItem('password_reset_mode');
  localStorage.removeItem('post_reset_session');
  console.log('🔧 Disabled password reset mode and post-reset session - auto-restore will work again');
  return { success: true, message: 'Password reset mode and post-reset session disabled' };
};

// ULTIMATE PASSWORD RESET - Reset everything completely (Local + Supabase)
export const ultimatePasswordReset = async () => {
  console.log('🚨 ULTIMATE PASSWORD RESET - RESETTING EVERYTHING (LOCAL + SUPABASE)...');

  // 1. Clear all password-related localStorage first
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_password_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // 2. Reset mockUsers array
  mockUsers.forEach(user => {
    user.password_changed = false;
  });

  // 3. Clear stored users
  localStorage.removeItem('mockUsers');

  // 4. Set persistent flags to prevent auto-restore
  localStorage.setItem('password_reset_mode', 'true');
  localStorage.setItem('post_reset_session', 'true');

  // 5. Sync password reset to Supabase
  try {
    const supabaseResult = await syncPasswordResetToSupabase();
    console.log('✅ Supabase password reset sync result:', supabaseResult);
  } catch (error) {
    console.error('❌ Failed to sync password reset to Supabase:', error);
  }

  // 6. Force reload to get fresh data
  console.log('🔄 Forcing page reload to get fresh data...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);

  return {
    success: true,
    message: 'Ultimate reset completed (Local + Supabase) - page will reload',
    clearedPasswords: keysToRemove.length
  };
};

// Auto-restore known stored passwords for testing - COMPLETELY DISABLED FOR PASSWORD RESET
export const autoRestoreKnownPasswords = () => {
  console.log('🚫 Auto-restore passwords COMPLETELY DISABLED for password reset');

  // ALWAYS RETURN WITHOUT DOING ANYTHING - COMPLETE DISABLE
  return {
    restoredCount: 0,
    existingPasswordsCount: 0,
    message: 'Auto-restore completely disabled for password reset'
  };

  // OLD CODE COMMENTED OUT:
  // Check if password reset mode is active OR if we're in a fresh session after reset
  // const isPasswordResetMode = localStorage.getItem('password_reset_mode') === 'true';
  // const isPostResetSession = localStorage.getItem('post_reset_session') === 'true';

  // if (isPasswordResetMode || isPostResetSession) {
  //   console.log('🚫 Password reset mode or post-reset session active - skipping auto-restore');
  //   return {
  //     restoredCount: 0,
  //     existingPasswordsCount: 0,
  //     message: 'Auto-restore disabled in password reset mode or post-reset session'
  //   };
  // }

  console.log('🔧 Auto-restoring known stored passwords...');

  // Known users who have changed passwords (for testing)
  // EXPANDED: Add all users who might have changed passwords during testing
  const knownPasswordChanges = [
    { userId: 'pham_thi_huong_id', password: '123123', userName: 'Phạm Thị Hương' },
    { userId: 'Ue4vzSj1KDg4vZyXwlHJ', password: '123123', userName: 'Lương Việt Anh' },
    { userId: 'khong_duc_manh_id', password: '123123', userName: 'Khổng Đức Mạnh' },
    // Add more users here as they change passwords during testing
  ];

  let restoredCount = 0;

  knownPasswordChanges.forEach(({ userId, password, userName }) => {
    const existingPassword = localStorage.getItem(`user_password_${userId}`);
    if (!existingPassword) {
      localStorage.setItem(`user_password_${userId}`, password);
      console.log(`✅ Restored password for ${userName}`);
      restoredCount++;

      // Also update user's password_changed flag
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].password_changed = true;
      }
    }
  });

  // Also scan localStorage for any existing stored passwords and sync them
  const existingStoredPasswords = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_password_')) {
      const userId = key.replace('user_password_', '');
      const password = localStorage.getItem(key);
      const user = mockUsers.find(u => u.id === userId);
      if (user && password) {
        existingStoredPasswords.push({ userId, password, userName: user.name });

        // Ensure user's password_changed flag is set
        if (!user.password_changed) {
          user.password_changed = true;
          console.log(`🔄 Synced password_changed flag for ${user.name}`);
        }
      }
    }
  }

  if (restoredCount > 0) {
    console.log(`✅ Auto-restored ${restoredCount} stored passwords`);
  }

  if (existingStoredPasswords.length > 0) {
    console.log(`🔄 Synced ${existingStoredPasswords.length} existing stored passwords:`,
      existingStoredPasswords.map(p => p.userName));
  }

  if (restoredCount === 0 && existingStoredPasswords.length === 0) {
    console.log('ℹ️ No passwords needed restoration or sync');
  }

  return restoredCount + existingStoredPasswords.length;
};

// Function to fix inconsistent user data
export const fixUserDataConsistency = () => {
  console.log('🔧 Fixing user data consistency...');

  // Get all stored passwords
  const allStoredPasswords: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('user_password_')) {
      allStoredPasswords.push(key);
    }
  }

  console.log('🔍 Found stored passwords for:', allStoredPasswords.map(key => key.replace('user_password_', '')));

  // For each stored password, ensure user exists and password_changed is true
  allStoredPasswords.forEach(passwordKey => {
    const userId = passwordKey.replace('user_password_', '');
    const userIndex = mockUsers.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      if (!mockUsers[userIndex].password_changed) {
        console.log('🔧 Fixing password_changed flag for user:', mockUsers[userIndex].name);
        mockUsers[userIndex].password_changed = true;
      }
    } else {
      console.log('⚠️ Found stored password for user not in mockUsers:', userId);
    }
  });

  // Update localStorage
  try {
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    console.log('✅ Updated localStorage with fixed user data');
  } catch (error) {
    console.warn('⚠️ Could not update localStorage:', error);
  }

  return {
    storedPasswordsCount: allStoredPasswords.length,
    mockUsersCount: mockUsers.length,
    fixed: true
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
