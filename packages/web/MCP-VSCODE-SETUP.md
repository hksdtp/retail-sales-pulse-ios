# 🎛️ MCP VSCode Setup - Hướng Dẫn Hoàn Chỉnh

## 🚀 Tự Động Khởi Động MCP Khi Mở VSCode

### 📋 Đã Cấu Hình Sẵn:

1. **VSCode Tasks** (`.vscode/tasks.json`)
2. **Launch Configurations** (`.vscode/launch.json`) 
3. **Workspace Settings** (`.vscode/settings.json`)
4. **MCP Manager Script** (`scripts/mcp-manager.js`)
5. **Auto-start Script** (`scripts/auto-start-mcp.js`)

## 🎯 Cách Sử Dụng

### 1. 🔄 Tự Động Khởi Động (Khuyến Nghị)

**Khi mở VSCode:**
- Mở Command Palette (`Cmd+Shift+P`)
- Chọn `Tasks: Run Task`
- Chọn `Start Both MCP Servers`

**Hoặc sử dụng script:**
```bash
npm run mcp:start-smart
```

### 2. 🎛️ Quản Lý Thông Minh

**Interactive Mode:**
```bash
npm run mcp:interactive
```

**Các lệnh cơ bản:**
```bash
# Kiểm tra trạng thái
npm run mcp:status-smart

# Khởi động tất cả
npm run mcp:start-smart

# Dừng tất cả  
npm run mcp:stop-smart

# Khởi động từng server
node scripts/mcp-manager.js start playwright
node scripts/mcp-manager.js start augment
```

### 3. 🐛 Debug Mode

**Trong VSCode:**
- Mở Debug panel (`Cmd+Shift+D`)
- Chọn configuration:
  - `🎭 Start Playwright MCP Server`
  - `🚀 Start Augment MCP Server` 
  - `🔧 Debug Augment MCP Server`
  - `🎯 Start Both MCP Servers`

## 📊 Monitoring & Status

### Kiểm Tra Trạng Thái:
```bash
npm run mcp:status-smart
```

**Output mẫu:**
```
┌─────────────┬──────────────────┬──────┬─────────┬─────────────────────────┐
│   (index)   │       name       │ port │ status  │           url           │
├─────────────┼──────────────────┼──────┼─────────┼─────────────────────────┤
│ playwright  │ Playwright MCP   │ 3001 │ running │ http://localhost:3001   │
│ augment     │ Augment MCP      │ 3002 │ running │ http://localhost:3002   │
└─────────────┴──────────────────┴──────┴─────────┴─────────────────────────┘
```

### Test Servers:
```bash
# Test cả hai
npm run mcp:test-all

# Test riêng lẻ
npm run mcp:test        # Playwright
npm run augment:test    # Augment
```

## 🔧 Cấu Hình MCP Client

### Cho Playwright MCP:
```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

### Cho Augment MCP:
```json
{
  "mcpServers": {
    "augment": {
      "url": "http://localhost:3002/sse"
    }
  }
}
```

### Cả Hai Servers:
```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:3001/sse",
      "description": "Playwright testing automation"
    },
    "augment": {
      "url": "http://localhost:3002/sse", 
      "description": "AI-powered development tools"
    }
  }
}
```

## 🎮 Lựa Chọn MCP Server

### 1. **Chỉ Augment MCP** (AI Features):
```bash
node scripts/mcp-manager.js start augment
```
**Sử dụng cho:**
- Code analysis
- Task management
- Component generation
- Performance monitoring

### 2. **Chỉ Playwright MCP** (Testing):
```bash
node scripts/mcp-manager.js start playwright
```
**Sử dụng cho:**
- Automated testing
- Browser automation
- UI testing

### 3. **Cả Hai Servers** (Full Features):
```bash
npm run mcp:start-smart
```
**Sử dụng cho:**
- Development + Testing
- Full AI + Automation features

## 🔄 Auto-Start Configuration

### Environment Variables:
```bash
# Trong .env hoặc shell profile
export MCP_AUTO_START="augment,playwright"  # Cả hai
export MCP_AUTO_START="augment"             # Chỉ Augment
export MCP_AUTO_START="playwright"          # Chỉ Playwright
```

### VSCode Settings:
Trong `.vscode/settings.json`:
```json
{
  "mcp.autoStart": ["augment"],
  "mcp.defaultServer": "augment"
}
```

## 🛠️ Troubleshooting

### ❌ Port Already in Use:
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9  # Playwright
lsof -ti:3002 | xargs kill -9  # Augment

# Hoặc dùng manager
npm run mcp:stop-smart
```

### ❌ Server Won't Start:
```bash
# Check logs
node scripts/mcp-manager.js start augment

# Debug mode
node --inspect scripts/augment-mcp-server.js
```

### ❌ Connection Timeout:
1. Kiểm tra server đang chạy: `npm run mcp:status-smart`
2. Test connection: `curl http://localhost:3002/`
3. Restart servers: `npm run mcp:stop-smart && npm run mcp:start-smart`

## 📱 VSCode Commands

### Command Palette Commands:
- `Tasks: Run Task` → `Start Both MCP Servers`
- `Tasks: Run Task` → `Stop All MCP Servers`
- `Tasks: Run Task` → `Test All MCP Servers`

### Keyboard Shortcuts (Optional):
Thêm vào `keybindings.json`:
```json
[
  {
    "key": "cmd+shift+m cmd+s",
    "command": "workbench.action.tasks.runTask",
    "args": "Start Both MCP Servers"
  },
  {
    "key": "cmd+shift+m cmd+x", 
    "command": "workbench.action.tasks.runTask",
    "args": "Stop All MCP Servers"
  }
]
```

## 🎯 Best Practices

### 1. **Development Workflow:**
```bash
# Mở VSCode
code .

# Auto-start MCP (tự động hoặc manual)
npm run mcp:start-smart

# Kiểm tra status
npm run mcp:status-smart

# Develop...

# Khi xong
npm run mcp:stop-smart
```

### 2. **Testing Workflow:**
```bash
# Start servers
npm run mcp:start-smart

# Run tests
npm run mcp:test-all

# Check results
npm run mcp:status-smart
```

### 3. **Production Deployment:**
```bash
# Build
npm run build

# Start production MCP
NODE_ENV=production npm run mcp:start-smart
```

## 📊 Performance Tips

1. **Chỉ start servers cần thiết**
2. **Sử dụng auto-start cho workflow thường xuyên**
3. **Monitor memory usage với manager**
4. **Restart servers định kỳ nếu cần**

---

## 🎉 Summary

**Bây giờ bạn có thể:**

✅ **Tự động khởi động** MCP khi mở VSCode  
✅ **Lựa chọn server** cần thiết (Playwright/Augment/Both)  
✅ **Quản lý thông minh** với MCP Manager  
✅ **Monitor real-time** status và performance  
✅ **Debug dễ dàng** với VSCode integration  
✅ **Test comprehensive** tất cả features  

**Chỉ cần chạy `npm run mcp:interactive` để bắt đầu!** 🚀
