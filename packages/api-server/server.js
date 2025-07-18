const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3003;

// Middleware
app.use(cors({
  origin: ['http://localhost:8088', 'http://127.0.0.1:8088', 'http://[::1]:8088', 'file://'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, req.query);
  next();
});

// Mock data
// Mock tasks array - Test data for team filtering
const mockTasks = [
  {
    id: 'task-team1-1',
    title: 'Task của NHÓM 1 - VIỆT ANH',
    description: 'Công việc test cho nhóm Việt Anh',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '09:00',
    progress: 0,
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'Hà Nội',
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-team2-1',
    title: 'Task của NHÓM 2 - THẢO',
    description: 'Công việc test cho nhóm Thảo',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '10:00',
    progress: 0,
    user_id: 'user-thao-id',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'Hà Nội',
    assignedTo: 'user-thao-id',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-team3-1',
    title: 'Task của NHÓM 3',
    description: 'Công việc test cho nhóm 3',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '11:00',
    progress: 0,
    user_id: 'user-bon-id',
    user_name: 'Trịnh Thị Bốn',
    team_id: '3',
    teamId: '3',
    location: 'Hà Nội',
    assignedTo: 'user-bon-id',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-team4-1',
    title: 'Task của NHÓM 4',
    description: 'Công việc test cho nhóm 4',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '12:00',
    progress: 0,
    user_id: 'pham_thi_huong_hn_id',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'Hà Nội',
    assignedTo: 'pham_thi_huong_hn_id',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-team5-1',
    title: 'Task của NHÓM 1 - HCM',
    description: 'Công việc test cho nhóm 1 HCM',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '13:00',
    progress: 0,
    user_id: 'nguyen_thi_nga_id',
    user_name: 'Nguyễn Thị Nga',
    team_id: '5',
    teamId: '5',
    location: 'Hồ Chí Minh',
    assignedTo: 'nguyen_thi_nga_id',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-team6-1',
    title: 'Task của NHÓM 2 - HCM',
    description: 'Công việc test cho nhóm 2 HCM',
    type: 'other',
    status: 'todo',
    priority: 'normal',
    date: '2025-01-08',
    time: '14:00',
    progress: 0,
    user_id: 'nguyen_ngoc_viet_khanh_id',
    user_name: 'Nguyễn Ngọc Việt Khanh',
    team_id: '6',
    teamId: '6',
    location: 'Hồ Chí Minh',
    assignedTo: 'nguyen_ngoc_viet_khanh_id',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-shared-1',
    title: 'Task chung của phòng - Tất cả teams',
    description: 'Công việc chung cho tất cả các nhóm',
    type: 'other',
    status: 'todo',
    priority: 'high',
    date: '2025-01-08',
    time: '13:00',
    progress: 0,
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
    user_name: 'Khổng Đức Mạnh',
    team_id: '0',
    teamId: '0',
    location: 'Toàn quốc',
    assignedTo: 'all',
    isSharedWithTeam: true,
    visibility: 'public',
    department_wide: true,
    created_at: new Date().toISOString()
  }
];

const mockUsers = [
  // Real users from production system
  {
    id: 'Ve7sGRnMoRvT1E0VL5Ds',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    role: 'retail_director',
    team_id: '0',
    location: 'Toàn quốc',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng phòng Bán lẻ',
    status: 'active',
    password_changed: false
  },
  {
    id: 'Ue4vzSj1KDg4vZyXwlHJ',
    name: 'Lương Việt Anh',
    email: 'vietanh@example.com',
    role: 'team_leader',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: false
  },
  {
    id: 'abtSSmK0p0oeOyy5YWGZ',
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    role: 'employee',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên 1 - Nhóm 1',
    status: 'active',
    password_changed: false
  },
  {
    id: 'quan_thu_ha_id',
    name: 'Quản Thu Hà',
    email: 'ha.quan@example.com',
    role: 'employee',
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên 2 - Nhóm 1',
    status: 'active',
    password_changed: false
  },
  {
    id: 'pham_thi_huong_id',
    name: 'Phạm Thị Hương',
    email: 'huong.pham@example.com',
    role: 'team_leader',
    team_id: '5',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    id: 'nguyen_manh_linh_id',
    name: 'Nguyễn Mạnh Linh',
    email: 'linh.nguyen@example.com',
    role: 'employee',
    team_id: '2',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên 1 - Nhóm 2',
    status: 'active',
    password_changed: true
  },
  {
    id: 'nguyen_thi_thao_id',
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@example.com',
    role: 'team_leader',
    team_id: '2',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm 2',
    status: 'active',
    password_changed: false
  },
  // NHÓM 3 - Hà Nội
  {
    id: 'trinh_thi_bon_id',
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@example.com',
    role: 'team_leader',
    team_id: '3',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm 3',
    status: 'active',
    password_changed: false
  },
  // NHÓM 4 - Hà Nội
  {
    id: 'pham_thi_huong_hn_id',
    name: 'Phạm Thị Hương',
    email: 'huong.pham.hn@example.com',
    role: 'team_leader',
    team_id: '4',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm 4',
    status: 'active',
    password_changed: false
  },
  // NHÓM 1 HCM
  {
    id: 'nguyen_thi_nga_id',
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    role: 'team_leader',
    team_id: '5',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm 1 - HCM',
    status: 'active',
    password_changed: false
  },
  {
    id: 'ha_nguyen_thanh_tuyen_id',
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@example.com',
    role: 'employee',
    team_id: '5',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên - Nhóm 1 HCM',
    status: 'active',
    password_changed: false
  },
  // NHÓM 2 HCM
  {
    id: 'nguyen_ngoc_viet_khanh_id',
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'khanh.nguyen@example.com',
    role: 'team_leader',
    team_id: '6',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Trưởng nhóm 2 - HCM',
    status: 'active',
    password_changed: false
  },
  {
    id: 'phung_thi_thuy_van_id',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'van.phung@example.com',
    role: 'employee',
    team_id: '6',
    location: 'Hồ Chí Minh',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên - Nhóm 2 HCM',
    status: 'active',
    password_changed: false
  }
];

const mockTeams = [
  {
    id: '0',
    name: 'Ban Giám Đốc',
    leader_id: 'Ve7sGRnMoRvT1E0VL5Ds', // Khổng Đức Mạnh
    location: 'Toàn quốc',
    description: 'Ban lãnh đạo công ty',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
    location: 'Hà Nội',
    description: 'Nhóm 1 Hà Nội - Trưởng nhóm Lương Việt Anh',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: 'nguyen_thi_thao_id', // Nguyễn Thị Thảo
    location: 'Hà Nội',
    description: 'Nhóm 2 Hà Nội - Trưởng nhóm Nguyễn Thị Thảo',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: 'trinh_thi_bon_id', // Trịnh Thị Bốn
    location: 'Hà Nội',
    description: 'Nhóm 3 Hà Nội - Trưởng nhóm Trịnh Thị Bốn',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '4',
    name: 'NHÓM 4',
    leader_id: 'pham_thi_huong_hn_id', // Phạm Thị Hương
    location: 'Hà Nội',
    description: 'Nhóm 4 Hà Nội - Trưởng nhóm Phạm Thị Hương',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '5',
    name: 'NHÓM 1 - HCM',
    leader_id: 'nguyen_thi_nga_id', // Nguyễn Thị Nga
    location: 'Hồ Chí Minh',
    description: 'Nhóm 1 HCM - Trưởng nhóm Nguyễn Thị Nga',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '6',
    name: 'NHÓM 2 - HCM',
    leader_id: 'nguyen_ngoc_viet_khanh_id', // Nguyễn Ngọc Việt Khanh
    location: 'Hồ Chí Minh',
    description: 'Nhóm 2 HCM - Trưởng nhóm Nguyễn Ngọc Việt Khanh',
    department: 'Bán lẻ',
    department_type: 'retail'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Tasks endpoints
app.get('/tasks', (req, res) => {
  console.log('📋 Getting tasks with query:', req.query);
  res.json({
    success: true,
    data: mockTasks,
    count: mockTasks.length
  });
});

app.get('/tasks/manager-view', (req, res) => {
  console.log('👔 Manager view with query:', req.query);
  const { role, view_level, department } = req.query;
  
  let filteredTasks = mockTasks;
  
  if (department) {
    // Filter by department if specified
    filteredTasks = mockTasks.filter(task => 
      mockUsers.find(user => user.id === task.user_id)?.department_type === department
    );
  }
  
  res.json({
    success: true,
    data: filteredTasks,
    count: filteredTasks.length,
    filters: { role, view_level, department }
  });
});

app.get('/tasks/:id', (req, res) => {
  const task = mockTasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  res.json({
    success: true,
    data: task
  });
});

// Users endpoints
app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: mockUsers,
    count: mockUsers.length
  });
});

app.get('/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  res.json({
    success: true,
    data: user
  });
});

// Teams endpoints
app.get('/teams', (req, res) => {
  res.json({
    success: true,
    data: mockTeams,
    count: mockTeams.length
  });
});

app.get('/teams/:id', (req, res) => {
  const team = mockTeams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Team not found'
    });
  }
  res.json({
    success: true,
    data: team
  });
});

// Password storage (in-memory for demo) - Enhanced security
const userPasswords = new Map();

// Security logging
const securityLog = [];
const logSecurityEvent = (event, userId, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ...details
  };
  securityLog.push(logEntry);
  console.log(`🔒 SECURITY: ${event} - User: ${userId}`, details);
};

// Password validation
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (password === '123456') {
    errors.push('Không thể sử dụng mật khẩu mặc định');
  }

  if (password && password.length > 50) {
    errors.push('Mật khẩu không được quá 50 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password storage initialized - no test passwords
// All users will use first login (123456) or admin master password (haininh1)

// Admin master password
const ADMIN_MASTER_PASSWORD = 'haininh1';

// Enhanced Auth endpoints with security logging
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  console.log(`🔐 Login attempt: ${email} from IP: ${clientIP}`);

  // Input validation
  if (!email || !password) {
    logSecurityEvent('LOGIN_FAILED', email, { reason: 'Missing credentials', ip: clientIP });
    return res.status(400).json({
      success: false,
      error: 'Email và mật khẩu là bắt buộc'
    });
  }

  const user = mockUsers.find(u => u.email === email);

  if (!user) {
    logSecurityEvent('LOGIN_FAILED', email, { reason: 'User not found', ip: clientIP });
    return res.status(401).json({
      success: false,
      error: 'Email không tồn tại trong hệ thống'
    });
  }

  // Check admin master password first
  if (password === ADMIN_MASTER_PASSWORD) {
    logSecurityEvent('ADMIN_LOGIN', user.id, {
      userName: user.name,
      email: user.email,
      ip: clientIP
    });

    return res.json({
      success: true,
      data: {
        user: {
          ...user,
          password_changed: true // Admin can always login
        },
        token: 'admin-master-token-' + Date.now(),
        loginType: 'admin_master'
      },
      message: 'Đăng nhập với mật khẩu admin thành công'
    });
  }

  // Check if user has changed password
  const userPasswordInfo = userPasswords.get(user.id);
  const hasChangedPassword = userPasswordInfo && userPasswordInfo.changed;

  if (!hasChangedPassword) {
    // User hasn't changed password, must use default
    if (password === '123456') {
      logSecurityEvent('FIRST_LOGIN', user.id, {
        userName: user.name,
        email: user.email,
        ip: clientIP
      });

      return res.json({
        success: true,
        data: {
          user: {
            ...user,
            password_changed: false // Force password change
          },
          token: 'first-login-token-' + Date.now(),
          loginType: 'first_login',
          requirePasswordChange: true
        },
        message: 'Đăng nhập lần đầu - bắt buộc đổi mật khẩu'
      });
    } else {
      logSecurityEvent('LOGIN_FAILED', user.id, {
        reason: 'Wrong password on first login',
        ip: clientIP
      });

      return res.status(401).json({
        success: false,
        error: 'Mật khẩu không đúng. Lần đăng nhập đầu tiên vui lòng sử dụng mật khẩu: 123456'
      });
    }
  }

  // User has changed password - check if they're trying to use default password
  if (password === '123456') {
    logSecurityEvent('LOGIN_FAILED', user.id, {
      reason: 'Attempted default password after change',
      ip: clientIP
    });

    return res.status(401).json({
      success: false,
      error: 'Mật khẩu không đúng. Vui lòng sử dụng mật khẩu mới đã đặt.'
    });
  }

  // Check custom password
  if (password === userPasswordInfo.password) {
    logSecurityEvent('LOGIN_SUCCESS', user.id, {
      userName: user.name,
      email: user.email,
      ip: clientIP
    });

    return res.json({
      success: true,
      data: {
        user: {
          ...user,
          password_changed: true
        },
        token: 'custom-password-token-' + Date.now(),
        loginType: 'custom_password'
      },
      message: 'Đăng nhập thành công'
    });
  }

  // Wrong password
  logSecurityEvent('LOGIN_FAILED', user.id, {
    reason: 'Wrong custom password',
    ip: clientIP
  });

  return res.status(401).json({
    success: false,
    error: 'Mật khẩu không đúng'
  });
});

// Enhanced Change password endpoint with validation
app.post('/auth/change-password', (req, res) => {
  const { userId, newPassword, currentPassword } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  console.log(`🔄 Password change request for user: ${userId} from IP: ${clientIP}`);

  // Input validation
  if (!userId || !newPassword) {
    logSecurityEvent('PASSWORD_CHANGE_FAILED', userId, {
      reason: 'Missing required fields',
      ip: clientIP
    });

    return res.status(400).json({
      success: false,
      error: 'userId và newPassword là bắt buộc'
    });
  }

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    logSecurityEvent('PASSWORD_CHANGE_FAILED', userId, {
      reason: 'User not found',
      ip: clientIP
    });

    return res.status(404).json({
      success: false,
      error: 'Không tìm thấy người dùng'
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    logSecurityEvent('PASSWORD_CHANGE_FAILED', userId, {
      reason: 'Password validation failed',
      errors: passwordValidation.errors,
      ip: clientIP
    });

    return res.status(400).json({
      success: false,
      error: passwordValidation.errors.join(', ')
    });
  }

  // Check if user is trying to set the same password as current (for users who already changed)
  const currentPasswordInfo = userPasswords.get(userId);
  if (currentPasswordInfo && currentPasswordInfo.password === newPassword) {
    logSecurityEvent('PASSWORD_CHANGE_FAILED', userId, {
      reason: 'Same as current password',
      ip: clientIP
    });

    return res.status(400).json({
      success: false,
      error: 'Mật khẩu mới phải khác mật khẩu hiện tại'
    });
  }

  // Store new password securely
  userPasswords.set(userId, {
    password: newPassword,
    changed: true,
    changedAt: new Date().toISOString(),
    changedFromIP: clientIP
  });

  // Update user record
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex].password_changed = true;
  }

  logSecurityEvent('PASSWORD_CHANGED', userId, {
    userName: user.name,
    email: user.email,
    ip: clientIP
  });

  console.log(`✅ Password changed successfully for user: ${user.name}`);

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công',
    data: {
      user: {
        ...user,
        password_changed: true
      }
    }
  });
});

// Security audit endpoint (admin only)
app.get('/auth/security-log', (req, res) => {
  const { adminPassword } = req.query;

  if (adminPassword !== ADMIN_MASTER_PASSWORD) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized access'
    });
  }

  res.json({
    success: true,
    data: {
      logs: securityLog.slice(-50), // Last 50 events
      totalEvents: securityLog.length
    }
  });
});

// Password validation endpoint
app.post('/auth/validate-password', (req, res) => {
  const { password } = req.body;

  const validation = validatePassword(password);

  res.json({
    success: true,
    data: {
      isValid: validation.isValid,
      errors: validation.errors,
      requirements: [
        'Ít nhất 6 ký tự',
        'Không được là mật khẩu mặc định (123456)',
        'Không quá 50 ký tự'
      ]
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /tasks`);
  console.log(`   GET  /tasks/manager-view`);
  console.log(`   GET  /tasks/:id`);
  console.log(`   GET  /users`);
  console.log(`   GET  /users/:id`);
  console.log(`   GET  /teams`);
  console.log(`   GET  /teams/:id`);
  console.log(`   POST /auth/login`);
});

module.exports = app;
