# MCP Server Playwright - Hướng Dẫn Sử Dụng

## Giới Thiệu
MCP (Model Context Protocol) Server Playwright đã được cấu hình và sẵn sàng sử dụng trong dự án này. Server này cho phép tự động hóa testing và tương tác với trình duyệt thông qua giao thức MCP.

## Trạng Thái Hiện Tại
✅ **MCP Server đang chạy thành công**
- **URL**: http://localhost:3001
- **SSE Endpoint**: http://localhost:3001/sse
- **MCP Endpoint**: http://localhost:3001/mcp
- **Status**: 200 OK
- **Capabilities**: tabs, wait, files

## Cách Sử Dụng

### 1. Khởi Động MCP Server
```bash
# Khởi động trực tiếp (khuyến nghị)
npm run mcp:server

# Hoặc sử dụng script đơn giản
npm run mcp:start

# Script nâng cao với retry logic
npm run mcp:advanced
```

### 2. Kiểm Tra Trạng Thái
```bash
# Kiểm tra đầy đủ
npm run mcp:test

# Kiểm tra nhanh
npm run mcp:status
```

### 3. Cấu Hình Client
Thêm cấu hình sau vào client MCP của bạn:
```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:3001/sse"
    }
  }
}
```

### 4. Test MCP Server
```bash
# Chạy test đầy đủ
npm run mcp:test

# Kết quả mong đợi:
# ✅ MCP Server đang chạy
# 📊 Status Code: 200
# 🎉 Tất cả test đã hoàn thành!
```

## Tính Năng Được Hỗ Trợ

### Capabilities
- **tabs**: Quản lý tab trình duyệt
- **pdf**: Tạo và xử lý file PDF
- **history**: Lịch sử điều hướng
- **wait**: Chờ đợi các phần tử
- **files**: Xử lý file upload/download

### Cấu Hình
- **Headless Mode**: Chạy trình duyệt ẩn
- **Output Directory**: `./test-results`
- **Trace Saving**: Tự động lưu trace
- **Port**: 3001
- **Host**: localhost

## File Cấu Hình
- `mcp-config.json`: Cấu hình chính của MCP server
- `scripts/start-mcp-server.js`: Script khởi động tự động

## Sử Dụng Với Testing

### Playwright Tests
```bash
# Chạy test thông thường
npm run test

# Chạy test với UI
npm run test:ui

# Debug test
npm run test:debug
```

### Xem Trace
Sau khi chạy test, bạn có thể xem trace tại:
http://localhost:49997/trace/index.html?trace=test-results/traces/trace.json

## Troubleshooting

### Server Không Khởi Động
1. Kiểm tra port 3001 có bị chiếm không
2. Đảm bảo đã cài đặt `@playwright/mcp`
3. Kiểm tra log trong terminal

### Không Kết Nối Được
1. Kiểm tra firewall
2. Đảm bảo URL đúng: `http://[::1]:3001/sse`
3. Thử restart server

### Performance Issues
1. Tăng timeout trong cấu hình
2. Giảm số lượng tab đồng thời
3. Sử dụng headless mode

## Tích Hợp Với Dự Án

MCP Server này được tích hợp với:
- **Playwright Testing Framework**
- **Firebase Emulators**
- **Development Server** (port 8088)
- **Vite Build System**

## Lệnh Hữu Ích

```bash
# Khởi động toàn bộ development environment
npm run dev          # Web server (port 8088)
npm run mcp:start    # MCP server (port 3001)

# Testing
npm run test         # Chạy tất cả test
npm run test:ui      # Test với giao diện

# Build
npm run build        # Production build
npm run preview      # Preview build
```

## Bảo Mật
- Server chỉ bind với localhost
- Không expose ra internet
- Sử dụng trong môi trường development

---
**Lưu ý**: MCP Server này chỉ dành cho môi trường development và testing. Không sử dụng trong production.
