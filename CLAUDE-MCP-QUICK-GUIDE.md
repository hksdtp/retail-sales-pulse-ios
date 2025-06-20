# ⚡ Claude Code MCP Quick Guide

Ninh ơi, đây là hướng dẫn nhanh sử dụng Claude Code với MCP tools!

## 🚀 **Khởi động nhanh**

```bash
# Trong project directory
cd /Users/nih/Bán\ lẻ/retail-sales-pulse-ios

# Start Claude Code
claude

# Hoặc chạy demo
./demo-claude-mcp.sh
```

## 🛠️ **7 MCP Tools có sẵn**

| Tool | Chức năng | Example Usage |
|------|-----------|---------------|
| `filesystem` | File operations | "Read my Login.tsx and suggest improvements" |
| `git` | Git operations | "Show me recent commits and current status" |
| `memory` | Context storage | "Remember this conversation for later" |
| `sequential-thinking` | Problem solving | "Help me debug mobile layout step by step" |
| `brave-search` | Web search | "Search for React best practices" |
| `fetch` | HTTP requests | "Fetch data from this API endpoint" |
| `time` | Date/time utils | "Calculate project timeline" |

## 💬 **Interactive Mode Examples**

### **File Analysis:**
```
"Please use filesystem tools to:
- Read my TaskManagementView.tsx file
- Analyze the component structure  
- Suggest performance optimizations"
```

### **Git Operations:**
```
"Use git tools to:
- Show me what files have changed
- Create a summary of recent commits
- Suggest what to commit next"
```

### **Problem Solving:**
```
"Use sequential thinking to help me:
- Debug the mobile calendar layout issue
- Plan the next development sprint
- Optimize the app performance"
```

### **Context Management:**
```
"Store in memory:
- Current project status
- Key issues we discussed
- Next action items"
```

## 🔧 **Command Line Usage**

### **One-shot commands:**
```bash
# Quick analysis
claude --print "Analyze my project structure"

# Git status
claude --print "Check git status and suggest next steps"

# Problem solving
claude --print "Use sequential thinking to plan mobile optimization"
```

### **MCP Management:**
```bash
# List servers
claude mcp list

# Test servers
npm run test:mcp

# Get server details
claude mcp get filesystem
```

## 🎯 **Real-world Use Cases**

### **1. Code Review:**
```
"Please use filesystem tools to review my recent changes in:
- Login.tsx
- TaskManagementView.tsx
- AppLayout.tsx

Check for:
- Performance issues
- Security concerns  
- Best practices
- Mobile responsiveness"
```

### **2. Project Planning:**
```
"Use sequential thinking to help me plan:
1. Mobile UI optimization
2. Performance improvements
3. New feature development
4. Testing strategy

Consider current git status and project structure."
```

### **3. Debugging Workflow:**
```
"I have a mobile calendar layout issue. Please:
1. Use filesystem tools to read Calendar components
2. Use sequential thinking to analyze the problem
3. Use memory to store our debugging session
4. Suggest step-by-step fixes"
```

### **4. Development Status:**
```
"Give me a complete project status using:
- Git tools for recent changes
- Filesystem tools for code analysis
- Memory tools to recall previous discussions
- Time tools for timeline planning"
```

## 🌐 **Integration với Workflow hiện tại**

### **MCP Tools + Custom Servers:**
```bash
# Start all development servers
npm run start:all

# Use Claude Code với MCP tools
claude

# Trong chat, có thể kết hợp:
# - MCP tools (filesystem, git, memory, etc.)
# - Custom servers vẫn chạy trên ports 3001, 3002
```

### **Testing Workflow:**
```bash
# Test với Playwright (custom)
plw test "mobile layout issues"

# Analyze với Claude Code MCP
claude --print "Use filesystem tools to analyze test results"

# Fix với Augment (custom)  
aug fix "performance optimization"
```

## 🔑 **Pro Tips**

### **1. Combine Multiple Tools:**
```
"Please use filesystem and git tools together to:
- Analyze recent code changes
- Identify potential issues
- Suggest improvements"
```

### **2. Context Persistence:**
```
"Store our current discussion in memory, including:
- Issues identified
- Solutions proposed
- Next action items"
```

### **3. Step-by-step Problem Solving:**
```
"Use sequential thinking to break down this complex issue:
[describe your problem]

Consider using other MCP tools as needed."
```

### **4. Project Documentation:**
```
"Use filesystem tools to read project files and create:
- Architecture overview
- Component documentation
- Development guide"
```

## ⚡ **Quick Commands**

```bash
# Demo all MCP features
./demo-claude-mcp.sh

# Test MCP servers
npm run test:mcp

# Interactive session
claude

# One-shot analysis
claude --print "Your question here"

# Check MCP status
claude mcp list
```

## 🎉 **What's Next?**

### **Immediate:**
1. ✅ Run `./demo-claude-mcp.sh`
2. ✅ Try interactive mode: `claude`
3. ✅ Test MCP tools với real use cases

### **Advanced:**
1. **Add API keys** to `.env` for search functionality
2. **Setup Remote MCP** for team collaboration  
3. **Create custom MCP servers** for specific needs
4. **Integrate with CI/CD** pipeline

---

**Ninh ơi**, bây giờ bạn có đầy đủ tools để:
- ✅ **Code analysis** với filesystem MCP
- ✅ **Git operations** với git MCP  
- ✅ **Problem solving** với sequential thinking
- ✅ **Context management** với memory MCP
- ✅ **Web research** với search tools
- ✅ **Custom workflow** với existing servers

**Happy coding với Claude Code + MCP! 🚀**
