# 🌐 Remote MCP Setup Guide - Claude Code

Ninh ơi, đây là hướng dẫn chi tiết về cách sử dụng Remote MCP servers với Claude Code.

## 📋 Tình trạng hiện tại

### ✅ **Đã cài đặt thành công:**
- **Claude Code CLI**: Version 1.0.25
- **7 MCP Servers chuẩn**:
  - `sequential-thinking` - Problem solving step by step
  - `filesystem` - File operations trong project
  - `memory` - Context storage và retrieval
  - `brave-search` - Web search (cần API key)
  - `fetch` - HTTP requests và web scraping
  - `git` - Git operations
  - `time` - Date/time utilities

### 🔧 **Custom servers vẫn hoạt động:**
- `playwright-server.js` - Port 3001 (REST API)
- `augment-server.js` - Port 3002 (REST API)

## 🚀 Cách sử dụng

### **1. Trong Claude Code conversations:**
```bash
# Khởi động Claude Code trong project
cd /Users/nih/Bán\ lẻ/retail-sales-pulse-ios
claude
```

### **2. Sử dụng MCP tools trong chat:**
- MCP servers sẽ tự động available trong Claude Code
- Claude sẽ có thể sử dụng các tools như:
  - File operations (đọc/ghi files)
  - Git operations (commit, status, diff)
  - Web search và fetch
  - Memory storage
  - Sequential thinking

### **3. Kiểm tra MCP status:**
```bash
# Trong Claude Code chat
/mcp

# Hoặc từ terminal
claude mcp list
```

## 🌐 Remote MCP Servers

### **Cách setup Remote MCP qua API:**

```javascript
// Example: Sử dụng MCP Connector API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_ANTHROPIC_API_KEY',
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'mcp-client-2025-04-04'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {role: 'user', content: 'What tools do you have available?'}
    ],
    mcp_servers: [
      {
        type: 'url',
        url: 'https://example-server.modelcontextprotocol.io/sse',
        name: 'remote-example',
        authorization_token: 'YOUR_TOKEN'
      }
    ]
  })
});
```

### **Popular Remote MCP Servers:**
- **Atlassian MCP Server** - Jira/Confluence integration
- **GitHub MCP Server** - Repository operations
- **Slack MCP Server** - Team communication
- **Database MCP Servers** - SQL operations

## 🔧 Commands & Scripts

### **MCP Management:**
```bash
# Test all MCP servers
npm run test:mcp

# Restart MCP connection
npm run restart:mcp

# Setup remote MCP (đã chạy rồi)
npm run setup:remote-mcp

# List servers
claude mcp list

# Get server details
claude mcp get sequential-thinking

# Add new server
claude mcp add <name> <command> [args...]

# Remove server
claude mcp remove <name>
```

### **Custom Servers (vẫn hoạt động):**
```bash
# Start all (web + custom MCP servers)
npm run start:all

# Test Playwright
plw test "mobile layout issues"

# Use Augment
aug fix "performance optimization"
```

## 🔑 API Keys Setup

Thêm API keys vào file `.env`:

```bash
# Brave Search (optional)
BRAVE_API_KEY=your_brave_api_key

# Tavily Search (optional) 
TAVILY_API_KEY=your_tavily_api_key

# GitHub Token (optional)
GITHUB_TOKEN=your_github_token
```

## 💡 Best Practices

### **1. Workflow tích hợp:**
```bash
# Bước 1: Start development environment
npm run start:all

# Bước 2: Open Claude Code
claude

# Bước 3: Trong Claude Code chat, MCP tools sẽ available
# Claude có thể:
# - Đọc/ghi files (filesystem)
# - Search web (brave-search, fetch)
# - Git operations (git)
# - Store context (memory)
# - Problem solving (sequential-thinking)
```

### **2. Debugging workflow:**
```bash
# Test với Playwright (custom server)
plw test "specific UI issue"

# Analyze với Augment (custom server)  
aug fix "code issue"

# Use MCP tools trong Claude Code cho:
# - File analysis
# - Web research
# - Git operations
# - Context management
```

### **3. Remote MCP cho production:**
- Sử dụng MCP Connector API
- Setup OAuth authentication
- Connect to enterprise MCP servers
- Integrate with team tools

## 🎯 Next Steps

### **Immediate:**
1. ✅ Test MCP servers: `npm run test:mcp`
2. ✅ Start Claude Code: `claude`
3. ✅ Verify MCP tools work trong conversations

### **Optional enhancements:**
1. **Add API keys** to `.env` for search functionality
2. **Setup Remote MCP servers** for team collaboration
3. **Create custom MCP servers** for specific needs
4. **Integrate with CI/CD** pipeline

## 🔍 Troubleshooting

### **MCP servers không load:**
```bash
# Restart Claude Code
# Check server status
claude mcp list

# Test connectivity
npm run test:mcp

# Reinstall if needed
claude mcp remove <server-name>
claude mcp add <server-name> <command>
```

### **Custom servers conflict:**
- MCP servers và custom servers chạy độc lập
- MCP servers: Trong Claude Code conversations
- Custom servers: REST API trên ports 3001, 3002

### **Remote MCP authentication:**
- Cần OAuth tokens cho authenticated servers
- Sử dụng MCP Inspector để get tokens
- Configure trong API calls

---

**Ninh ơi**, setup này cho bạn:
- ✅ **7 MCP servers chuẩn** trong Claude Code
- ✅ **Custom servers** vẫn hoạt động bình thường  
- ✅ **Remote MCP support** ready to use
- ✅ **Tích hợp workflow** với scripts hiện tại

Bây giờ bạn có thể sử dụng Claude Code với đầy đủ MCP tools! 🚀
