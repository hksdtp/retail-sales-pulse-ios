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
// Mock tasks array - EMPTY - Data will be loaded from Firebase
const mockTasks = [
  // EMPTY - Firebase is the primary data source
  // Mock data only used as fallback when Firebase is not available
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
    position: 'Nhân viên bán hàng',
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
    team_id: '1',
    location: 'Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail',
    position: 'Nhân viên bán hàng',
    status: 'active',
    password_changed: true
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
    name: 'Nhóm 1 Hà Nội',
    leader_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
    location: 'Hà Nội',
    description: 'Nhóm bán hàng số 1 tại Hà Nội',
    department: 'Bán lẻ',
    department_type: 'retail'
  },
  {
    id: '5',
    name: 'Nhóm 5 Hà Nội',
    leader_id: 'pham_thi_huong_id', // Phạm Thị Hương
    location: 'Hà Nội',
    description: 'Nhóm bán hàng số 5 tại Hà Nội',
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
