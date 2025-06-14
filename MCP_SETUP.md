# 🚀 MCP Servers Setup - Retail Sales Pulse iOS

Ninh ơi, đây là hướng dẫn cài đặt và sử dụng MCP (Model Context Protocol) Servers cho dự án.

## 📦 Cài đặt lần đầu

```bash
# Cài đặt MCP servers và dependencies
npm run install:mcp
```

## 🚀 Khởi động dự án

### Khởi động tất cả (Web + MCP Servers)
```bash
npm run start:all
```

### Khởi động riêng lẻ
```bash
# Chỉ web development server
npm run dev

# Chỉ MCP servers
npm run start:mcp

# Dừng tất cả
npm run stop:all
```

## 🔧 Sử dụng MCP Commands

### Playwright MCP (Testing)
```bash
# Test lỗi cụ thể
plw test "lỗi member task filtering không hiển thị đủ công việc"

# Test mobile layout
plw test "mobile bottom navigation layout không đồng đều"

# Debug UI issues
plw test "kiểm tra responsive design trên mobile"
```

### Augment MCP (Code Analysis & Fix)
```bash
# Fix lỗi code
aug fix "member task filtering logic không hoạt động đúng"

# Analyze performance
aug analyze "tối ưu performance cho mobile app"

# Code review
aug review "kiểm tra security và best practices"
```

## 📋 Services & Ports

| Service | Port | URL | Mô tả |
|---------|------|-----|-------|
| Web App | 3000 | http://localhost:3000 | Main application |
| MCP Playwright | 3001 | http://localhost:3001 | Testing server |
| MCP Augment | 3002 | http://localhost:3002 | Code analysis server |

## 🔄 Workflow khuyến nghị

1. **Khởi động dự án:**
   ```bash
   npm run start:all
   ```

2. **Khi gặp lỗi:**
   ```bash
   # Test để reproduce lỗi
   plw test "mô tả lỗi cụ thể"
   
   # Analyze và fix
   aug fix "mô tả lỗi cần fix"
   ```

3. **Trước khi commit:**
   ```bash
   # Code review
   aug review "kiểm tra code quality"
   
   # Test regression
   plw test "test toàn bộ functionality"
   ```

4. **Dừng khi xong:**
   ```bash
   npm run stop:all
   ```

## 🛠️ Troubleshooting

### Port đã được sử dụng
```bash
# Dừng tất cả processes
npm run stop:all

# Hoặc kill manual
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### MCP servers không khởi động
```bash
# Reinstall
npm run install:mcp

# Check logs
tail -f ~/.mcp/logs/playwright.log
tail -f ~/.mcp/logs/augment.log
```

## 📝 Aliases có sẵn

Sau khi chạy `npm run install:mcp`, các aliases sau sẽ có sẵn:

- `plw` - Playwright MCP
- `aug` - Augment MCP  
- `start-all` - Khởi động tất cả
- `stop-all` - Dừng tất cả

## 🎯 Tips

- Luôn dùng `start-all` để đảm bảo có đầy đủ tools
- Dùng `plw test` để test UI/UX issues
- Dùng `aug fix` để analyze và fix code issues
- Check console logs để debug MCP communication

---

**Ninh ơi**, setup này sẽ giúp bạn có đầy đủ tools để develop và debug hiệu quả! 🚀
