import express from 'express';
import cors from 'cors';
const app = express();

// Enable CORS for all origins in development
app.use(cors({
  origin: ['http://localhost:8089', 'http://localhost:8088', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mock data - công việc chung của phòng
const sharedTasks = [
  {
    id: 'shared-1',
    title: 'Kiểm tra hàng tồn kho cuối tháng',
    description: 'Thực hiện kiểm kê hàng tồn kho tại tất cả các cửa hàng',
    assignedTo: 'Toàn bộ phòng Retail',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-06-15',
    isShared: true,
    type: 'shared',
    department: 'retail',
    createdBy: 'Khổng Đức Mạnh',
    createdAt: '2024-06-08T10:00:00Z'
  },
  {
    id: 'shared-2', 
    title: 'Báo cáo doanh thu tuần',
    description: 'Tổng hợp và báo cáo doanh thu của tuần vừa qua',
    assignedTo: 'Toàn bộ phòng Retail',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2024-06-12',
    isShared: true,
    type: 'shared',
    department: 'retail',
    createdBy: 'Khổng Đức Mạnh',
    createdAt: '2024-06-07T09:00:00Z'
  },
  {
    id: 'shared-3',
    title: 'Đào tạo quy trình bán hàng mới',
    description: 'Tham gia khóa đào tạo quy trình bán hàng và chăm sóc khách hàng',
    assignedTo: 'Toàn bộ phòng Retail',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-06-20',
    isShared: true,
    type: 'shared',
    department: 'retail',
    createdBy: 'Khổng Đức Mạnh',
    createdAt: '2024-06-06T14:00:00Z'
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test API server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API endpoint giống Firebase Functions
app.get('/tasks/manager-view', (req, res) => {
  const { role, view_level, department } = req.query;
  
  console.log('Request params:', { role, view_level, department });
  
  if (view_level === 'department' && department === 'retail') {
    if (role === 'retail_director' || role === 'project_director') {
      // Directors: Xem tất cả tasks
      console.log('Director requesting department view - showing all tasks');
      res.json({
        success: true,
        data: sharedTasks,
        count: sharedTasks.length,
        message: 'All department tasks loaded'
      });
    } else {
      // ✅ NEW: Employees & Team Leaders: Xem shared tasks
      console.log('Employee/Team Leader requesting department view - showing shared tasks');
      
      const filteredTasks = sharedTasks.filter(task => task.isShared === true);
      
      res.json({
        success: true,
        data: filteredTasks,
        count: filteredTasks.length,
        message: 'Shared department tasks loaded for employee'
      });
    }
  } else {
    res.json({
      success: false,
      error: 'Invalid request parameters',
      data: [],
      count: 0
    });
  }
});

const PORT = 3003; // Changed from 3001 to avoid conflict with MCP Playwright server
app.listen(PORT, () => {
  console.log(`🚀 Test API server running on http://localhost:${PORT}`);
  console.log(`📋 Test URL: http://localhost:${PORT}/tasks/manager-view?role=employee&view_level=department&department=retail`);
  console.log(`🔧 MCP Playwright server: http://localhost:3001`);
  console.log(`🔧 MCP Augment server: http://localhost:3002`);
});
