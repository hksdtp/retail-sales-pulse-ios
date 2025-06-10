# Augment MCP Server - Hướng Dẫn Sử Dụng

## 🚀 Giới Thiệu

Augment MCP (Model Context Protocol) Server là một server AI-powered cung cấp các tính năng thông minh cho việc phát triển ứng dụng. Server này được tích hợp với React hooks và components để dễ dàng sử dụng trong dự án.

## ✨ Tính Năng Chính

### 🔍 Code Analysis
- Phân tích chất lượng code JavaScript/TypeScript
- Đánh giá độ phức tạp và maintainability
- Đưa ra gợi ý cải thiện code
- Tính điểm chất lượng tổng thể

### 📋 Task Management
- Tạo và quản lý tasks với AI assistance
- Theo dõi trạng thái và priority
- Lọc và tìm kiếm tasks
- Tự động phân loại và gợi ý

### ⚛️ Component Generation
- Tự động tạo React components
- Hỗ trợ functional, class và custom hooks
- Styling với Tailwind CSS, CSS modules
- Tự động generate props và TypeScript types

### 🗄️ Database Operations
- Thực hiện các query cơ bản (CRUD)
- Tối ưu hóa queries
- Validation và error handling
- Real-time data synchronization

### 📊 Performance Monitoring
- Theo dõi load time, memory usage
- Network request monitoring
- Real-time metrics dashboard
- Performance optimization suggestions

## 🛠️ Cài Đặt và Khởi Động

### Cài Đặt Dependencies
```bash
npm install
```

### Khởi Động Augment MCP Server
```bash
# Khởi động server
npm run augment:start

# Development mode với auto-reload
npm run augment:dev

# Kiểm tra trạng thái
npm run augment:status
```

### Khởi Động Cả Hai MCP Servers
```bash
# Khởi động cả Playwright và Augment MCP
npm run mcp:all

# Development mode cho cả hai
npm run mcp:dev
```

## 🧪 Testing

### Test Augment MCP Server
```bash
# Test đầy đủ tất cả tính năng
npm run augment:test

# Test cả hai MCP servers
npm run mcp:test-all
```

### Kết Quả Test Mong Đợi
```
🧪 Starting Augment MCP Server Tests...

🏥 Testing Server Health...
  ✅ Server name correct
  ✅ Server status running
  ✅ Capabilities is array
  ✅ Has capabilities
  ✅ Uptime is number
✅ Server running with 5 capabilities

🔌 Testing MCP Protocol...
  ✅ Protocol version correct
  ✅ Has tools capability
  ✅ Server info correct
  ✅ Tools list is array
  ✅ Has tools
  ✅ Tool analyze_code exists
  ✅ Tool manage_tasks exists
  ✅ Tool generate_component exists
  ✅ Tool query_database exists
  ✅ Tool monitor_performance exists
✅ MCP Protocol working with 5 tools

📊 Test Summary
================
Total Tests: 25+
Passed: 25+
Failed: 0
Success Rate: 100%

🎉 All tests passed! Augment MCP Server is working perfectly!
```

## 💻 Sử Dụng Trong React

### Import Hook
```tsx
import { useAugmentMCP, useCodeAnalysis, useTaskManager } from '../hooks/useAugmentMCP';
```

### Basic Usage
```tsx
function MyComponent() {
  const { status, connect, analyzeCode } = useAugmentMCP();
  
  useEffect(() => {
    connect();
  }, []);

  const handleAnalyze = async () => {
    const result = await analyzeCode(`
      function hello() {
        console.log("Hello World");
      }
    `);
    console.log(result);
  };

  return (
    <div>
      <p>Status: {status.connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleAnalyze}>Analyze Code</button>
    </div>
  );
}
```

### Code Analysis Hook
```tsx
function CodeAnalyzer() {
  const { analysis, loading, analyze } = useCodeAnalysis();

  const handleAnalyze = () => {
    analyze(codeInput, 'javascript');
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Code'}
      </button>
      {analysis && (
        <div>
          <p>Score: {analysis.score}</p>
          <p>Complexity: {analysis.metrics.complexity}</p>
          <ul>
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Task Manager Hook
```tsx
function TaskManager() {
  const { tasks, addTask, refreshTasks } = useTaskManager();

  const createNewTask = () => {
    addTask({
      title: 'New Task',
      description: 'Task description',
      status: 'pending',
      priority: 'medium'
    });
  };

  return (
    <div>
      <button onClick={createNewTask}>Create Task</button>
      <button onClick={refreshTasks}>Refresh</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title} - {task.status}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎨 Demo Component

Dự án bao gồm một component demo đầy đủ tại `src/components/augment/AugmentMCPDemo.tsx` showcasing tất cả tính năng:

```tsx
import AugmentMCPDemo from './components/augment/AugmentMCPDemo';

function App() {
  return (
    <div>
      <AugmentMCPDemo />
    </div>
  );
}
```

## 🔧 Cấu Hình

### Server Configuration
File: `mcp-config.json`
```json
{
  "mcpServers": {
    "augment": {
      "url": "http://localhost:3002/sse",
      "description": "Augment MCP Server with AI-powered features",
      "capabilities": ["analyze_code", "manage_tasks", "generate_component", "query_database", "monitor_performance"],
      "config": {
        "port": 3002,
        "host": "localhost",
        "features": {
          "codeAnalysis": true,
          "taskManagement": true,
          "componentGeneration": true,
          "databaseQuery": true,
          "performanceMonitoring": true
        }
      }
    }
  }
}
```

### Environment Variables
```bash
# Optional - defaults shown
AUGMENT_MCP_PORT=3002
AUGMENT_MCP_HOST=localhost
```

## 📡 API Endpoints

### Health Check
```
GET http://localhost:3002/
```

### MCP Protocol
```
POST http://localhost:3002/mcp
Content-Type: application/json

{
  "method": "tools/list",
  "params": {}
}
```

### Direct Tool Calls
```
POST http://localhost:3002/tools/analyze_code
Content-Type: application/json

{
  "code": "function test() { return true; }",
  "language": "javascript",
  "analysis_type": "all"
}
```

### Server-Sent Events
```
GET http://localhost:3002/sse
```

## 🔍 Troubleshooting

### Server Không Khởi Động
1. Kiểm tra port 3002 có bị chiếm không
2. Đảm bảo đã cài đặt dependencies: `npm install`
3. Kiểm tra log trong terminal

### Không Kết Nối Được Từ React
1. Đảm bảo server đang chạy: `npm run augment:status`
2. Kiểm tra CORS settings
3. Verify URL trong client code

### Performance Issues
1. Giảm frequency của performance monitoring
2. Tăng timeout trong client
3. Sử dụng connection pooling

## 🚀 Production Deployment

### Build và Deploy
```bash
# Build production
npm run build

# Start production server
NODE_ENV=production npm run augment:start
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "run", "augment:start"]
```

## 📈 Monitoring và Logging

Server tự động log các hoạt động:
- Tool executions
- Client connections
- Performance metrics
- Error tracking

Logs có thể được redirect hoặc integrated với logging systems.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.

---

**Lưu ý**: Augment MCP Server được thiết kế cho development và testing. Đối với production, cần thêm authentication, rate limiting và security measures.
