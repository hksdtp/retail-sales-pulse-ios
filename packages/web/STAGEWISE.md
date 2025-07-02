# 🎨 Stagewise Visual Coding Setup

Stagewise đã được tích hợp vào dự án để hỗ trợ visual coding với AI agents.

## 🚀 Cách sử dụng

### 1. Cài đặt VS Code Extension
- Mở VS Code/Cursor
- Cài đặt extension: `stagewise.stagewise-vscode-extension`
- Hoặc truy cập: https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension

### 2. Khởi động dự án
```bash
npm run start
```

### 3. Sử dụng Stagewise
1. **Chọn element**: Click vào bất kỳ element nào trên trang web
2. **Để lại comment**: Mô tả những gì bạn muốn thay đổi
3. **AI thực hiện**: AI agent sẽ tự động thực hiện thay đổi trong code

## ✨ Tính năng

- 🎯 **Visual Element Selection**: Chọn trực tiếp element trên UI
- 💬 **Comment System**: Để lại comment mô tả yêu cầu
- 🧠 **AI Integration**: Kết nối với Cursor, GitHub Copilot, Windsurf
- ⚡ **Real-time Context**: Gửi context thực tế từ browser đến AI
- 🔧 **Framework Support**: Hỗ trợ React, Vue, Svelte, Next.js

## 📁 Cấu trúc file

```
packages/web/src/
├── config/
│   └── stagewise.ts          # Cấu hình Stagewise
├── components/
│   └── stagewise/
│       └── StagewiseWrapper.tsx  # Component wrapper
└── main.tsx                  # Entry point với Stagewise init
```

## ⚙️ Cấu hình

### Cấu hình cơ bản (stagewise.ts)
```typescript
export const stagewiseConfig: ToolbarConfig = {
  plugins: [],
  theme: {
    primary: '#007AFF', // iOS blue
  },
  integration: {
    framework: 'react',
    enabled: import.meta.env.DEV,
    autoConnect: true,
  },
};
```

### Thêm plugins tùy chỉnh
```typescript
export const stagewiseConfig: ToolbarConfig = {
  plugins: [
    // Component inspector
    {
      name: 'component-inspector',
      enabled: true,
    },
    // State debugger
    {
      name: 'state-debugger',
      enabled: true,
    },
  ],
};
```

## 🔧 Troubleshooting

### Stagewise không hiển thị
1. Kiểm tra VS Code extension đã cài đặt
2. Đảm bảo đang ở development mode
3. Kiểm tra console log có lỗi không

### AI không nhận được context
1. Đảm bảo chỉ mở 1 cửa sổ Cursor/VS Code
2. Kiểm tra extension đã kết nối
3. Thử refresh trang web

### Performance issues
1. Stagewise chỉ chạy ở development mode
2. Không ảnh hưởng đến production build
3. Có thể disable bằng cách set `enabled: false`

## 📚 Tài liệu tham khảo

- [Stagewise GitHub](https://github.com/stagewise-io/stagewise)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=stagewise.stagewise-vscode-extension)
- [Documentation](https://stagewise.io)

## 🎯 Ví dụ sử dụng

### Thay đổi màu button
1. Click vào button trên UI
2. Comment: "Đổi màu button thành xanh lá"
3. AI sẽ tự động cập nhật CSS/styling

### Thêm tính năng mới
1. Click vào khu vực muốn thêm tính năng
2. Comment: "Thêm dropdown menu ở đây"
3. AI sẽ tạo component và logic cần thiết

### Fix bug UI
1. Click vào element bị lỗi
2. Comment: "Fix responsive layout cho mobile"
3. AI sẽ phân tích và sửa CSS

## 🔒 Bảo mật

- Stagewise chỉ hoạt động ở development mode
- Không gửi data production lên server
- Code changes được thực hiện local trong editor
- Có thể disable hoàn toàn nếu cần
