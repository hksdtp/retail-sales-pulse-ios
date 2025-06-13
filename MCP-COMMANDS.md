# 🤖 MCP Commands Guide

Hướng dẫn sử dụng MCP Augment và Playwright với các lệnh ngắn gọn.

## 🚀 Cài đặt nhanh

```bash
# 1. Setup aliases (chỉ cần chạy 1 lần)
./setup-aliases.sh
source ~/.zshrc  # hoặc ~/.bashrc

# 2. Khởi động MCP servers
bun run start:all
```

## 🔍 Augment MCP Commands

### Cú pháp cơ bản:
```bash
aug [command] [args...]
```

### Các lệnh chính:

#### 🔍 Tìm kiếm code
```bash
aug search "useState"
aug search "function login"
aug search "error"
```

#### 📊 Phân tích codebase
```bash
aug analyze "React components"
aug analyze "authentication"
aug analyze "API calls"
```

#### 📖 Đọc file
```bash
aug read "src/App.tsx"
aug read "package.json"
aug read "mcp-servers/augment-mcp.js"
```

#### 🔧 Sửa lỗi
```bash
aug fix "TypeError: Cannot read property"
aug fix "Module not found"
aug fix "Uncaught ReferenceError"
```

#### 👥 Phân tích menu nhân viên
```bash
aug employees
```

## 🎭 Playwright MCP Commands

### Cú pháp cơ bản:
```bash
plw [command] [args...]
```

### Các lệnh chính:

#### 📊 Kiểm tra trạng thái
```bash
plw status
```

#### 🌐 Mở trang web
```bash
plw open                           # Mở http://localhost:8088
plw open "http://localhost:3000"   # Mở URL khác
```

#### 👆 Tương tác với elements
```bash
plw click "button.login"
plw click "#submit-btn"
plw type "input[name=email]" "user@example.com"
plw type "#password" "mypassword"
```

#### 📸 Chụp màn hình
```bash
plw screenshot
```

#### 🧪 Chạy test
```bash
plw test "login functionality"
plw test "form validation"
plw test "navigation menu"
```

#### 🚀 Quản lý browser
```bash
plw launch    # Khởi động browser
plw close     # Đóng browser
```

## 💡 Ví dụ thực tế

### Scenario 1: Debug lỗi login
```bash
# 1. Tìm code liên quan đến login
aug search "login"

# 2. Phân tích lỗi
aug fix "login failed"

# 3. Test login functionality
plw test "login functionality"

# 4. Mở app và test thủ công
plw open
plw click "button.login"
plw screenshot
```

### Scenario 2: Phân tích component
```bash
# 1. Tìm tất cả React components
aug search "export default"

# 2. Đọc component cụ thể
aug read "src/components/LoginForm.tsx"

# 3. Phân tích cách sử dụng
aug analyze "LoginForm component"
```

### Scenario 3: Test UI workflow
```bash
# 1. Mở ứng dụng
plw open

# 2. Điền form
plw type "input[name=username]" "testuser"
plw type "input[name=password]" "testpass"

# 3. Submit và chụp màn hình
plw click "button[type=submit]"
plw screenshot
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### "Could not connect to Playwright MCP server"
```bash
# Kiểm tra server có chạy không
bun run plw

# Hoặc khởi động tất cả
bun run start:all
```

#### "Command not found: aug"
```bash
# Setup lại aliases
./setup-aliases.sh
source ~/.zshrc
```

#### "Permission denied"
```bash
# Cấp quyền thực thi
chmod +x aug plw setup-aliases.sh
```

## 📋 Quick Reference

### Aliases nhanh:
```bash
aug-search "term"     # = aug search "term"
aug-analyze "query"   # = aug analyze "query"
aug-fix "error"       # = aug fix "error"
plw-test "desc"       # = plw test "desc"
plw-open "url"        # = plw open "url"
plw-status            # = plw status
```

### Ports:
- **Web App**: http://localhost:8088
- **Playwright MCP**: http://localhost:3001
- **Augment MCP**: stdio (background process)

### Logs:
```bash
# Xem logs của MCP servers
bun run aug    # Terminal riêng cho Augment
bun run plw    # Terminal riêng cho Playwright
bun run dev    # Terminal riêng cho Web App
```

## 🎯 Tips & Tricks

1. **Luôn kiểm tra status trước khi test:**
   ```bash
   plw status
   ```

2. **Sử dụng screenshot để debug UI:**
   ```bash
   plw screenshot
   ```

3. **Tìm kiếm code trước khi fix:**
   ```bash
   aug search "error message"
   aug fix "specific error"
   ```

4. **Test từng bước một:**
   ```bash
   plw open
   plw click "selector"
   plw screenshot
   ```

5. **Đọc file để hiểu code:**
   ```bash
   aug read "path/to/file"
   ```
