# 🎨 Hướng dẫn Theme Toggle - Chuyển đổi giao diện sáng/tối

## ✨ Tính năng đã hoàn thành

### 🎯 Chức năng chính:
- ✅ **Theme Context** - Quản lý trạng thái theme toàn ứng dụng
- ✅ **Dark Theme CSS** - Giao diện tối hoàn chỉnh
- ✅ **Theme Toggle Components** - Các component chuyển đổi theme
- ✅ **Account Settings Integration** - Tab "Giao diện" trong cài đặt tài khoản
- ✅ **Header Integration** - Nút toggle nhanh trong header
- ✅ **Auto Theme Detection** - Tự động theo cài đặt hệ thống
- ✅ **LocalStorage Persistence** - Lưu cài đặt theme

### 🎨 Các chế độ theme:
1. **🌞 Chế độ sáng** - Giao diện truyền thống, dễ đọc ban ngày
2. **🌙 Chế độ tối** - Giảm mỏi mắt, tiết kiệm pin, phù hợp ban đêm
3. **💻 Theo hệ thống** - Tự động thay đổi theo cài đặt thiết bị

## 🚀 Cách sử dụng

### 1. Truy cập cài đặt theme

#### Qua Account Settings:
1. Click vào **avatar/tên người dùng** ở góc phải
2. Chọn tab **"Giao diện"** 
3. Sử dụng dropdown để chọn chế độ

#### Qua Header Toggle:
- Click vào icon **🌞/🌙** ở header để toggle nhanh

### 2. Demo trang theme

Truy cập: `http://localhost:8089/theme-demo`

Trang này cho phép test tất cả các component theme toggle.

## 🛠️ Cấu trúc kỹ thuật

### Files đã tạo/cập nhật:

#### 1. Theme Context
```
packages/web/src/context/ThemeContext.tsx
```
- Quản lý state theme (light/dark/system)
- Tự động detect system theme
- Lưu/load từ localStorage

#### 2. Dark Theme CSS
```
packages/web/src/styles/dark-theme.css
```
- CSS variables cho dark theme
- Override các component colors
- Smooth transitions

#### 3. Theme Toggle Components
```
packages/web/src/components/ui/theme-toggle.tsx
```
- `ThemeToggle` - Component chính với nhiều variants
- `QuickThemeToggle` - Toggle nhanh cho header
- `ThemeIndicator` - Hiển thị trạng thái theme

#### 4. Account Settings
```
packages/web/src/components/account/AccountSettings.tsx
```
- Thêm tab "Giao diện"
- UI đầy đủ cho cài đặt theme
- Preview và quick actions

#### 5. Layout Updates
```
packages/web/src/components/layout/PageHeader.tsx
```
- Thêm QuickThemeToggle vào header
- Dark theme support

#### 6. App Integration
```
packages/web/src/App.tsx
packages/web/src/main.tsx
packages/web/index.html
```
- ThemeProvider wrapper
- Import dark-theme.css
- Meta theme-color tag

## 🎯 Cách test

### 1. Test cơ bản:
```bash
# Mở ứng dụng
plw open "http://localhost:8089"

# Chụp screenshot chế độ sáng
plw screenshot

# Click toggle theme
plw click "[title*='Chuyển sang chế độ']"

# Chụp screenshot chế độ tối
plw screenshot
```

### 2. Test demo page:
```bash
# Mở trang demo
plw open "http://localhost:8089/theme-demo"

# Test các buttons
plw click "button:has-text('Chế độ tối')"
plw click "button:has-text('Chế độ sáng')"
plw click "button:has-text('Theo hệ thống')"
```

### 3. Test Account Settings:
```bash
# Mở ứng dụng và login
plw open "http://localhost:8089"

# Click vào avatar (cần login trước)
plw click "[data-testid='user-avatar']"

# Click tab Giao diện
plw click "button:has-text('Giao diện')"

# Test dropdown theme toggle
```

## 🎨 Customization

### Thêm màu sắc mới cho dark theme:

1. **Cập nhật CSS variables** trong `dark-theme.css`:
```css
:root.dark {
  --custom-color: hsl(220 70% 50%);
}
```

2. **Sử dụng trong components**:
```css
.my-component {
  background-color: hsl(var(--custom-color));
}
```

### Tạo theme toggle tùy chỉnh:

```tsx
import { useTheme } from '@/context/ThemeContext';

const MyCustomToggle = () => {
  const { actualTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {actualTheme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
};
```

## 🔧 Troubleshooting

### Theme không thay đổi:
1. Kiểm tra ThemeProvider đã wrap App chưa
2. Kiểm tra dark-theme.css đã import chưa
3. Kiểm tra localStorage có lưu theme không

### CSS không apply:
1. Đảm bảo class `dark` được thêm vào `<html>`
2. Kiểm tra CSS specificity
3. Sử dụng `!important` nếu cần

### Component không re-render:
1. Đảm bảo component sử dụng `useTheme` hook
2. Kiểm tra ThemeContext provider

## 📱 Mobile Support

Theme toggle hoạt động tốt trên mobile:
- Touch-friendly buttons
- Responsive design
- Auto theme-color meta tag update

## 🎉 Kết quả

### ✅ Đã hoàn thành:
- [x] Theme Context với 3 chế độ (light/dark/system)
- [x] Dark theme CSS hoàn chỉnh
- [x] Theme toggle components đa dạng
- [x] Integration vào Account Settings
- [x] Quick toggle trong header
- [x] Demo page để test
- [x] LocalStorage persistence
- [x] System theme detection
- [x] Smooth transitions
- [x] Mobile responsive

### 🎯 Cách sử dụng nhanh:
1. **Click icon 🌞/🌙 ở header** để toggle nhanh
2. **Vào Account Settings > Giao diện** để cài đặt chi tiết
3. **Truy cập `/theme-demo`** để test đầy đủ

Theme sẽ được lưu tự động và áp dụng ngay lập tức cho toàn bộ ứng dụng! 🎊
