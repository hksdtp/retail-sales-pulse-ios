# 🎨 Icon Design System - Retail Sales Pulse iOS

## 📋 Tổng quan

Hệ thống Icon Design System được tạo ra để giải quyết vấn đề trùng lặp và confusion trong việc sử dụng icons trong ứng dụng. Hệ thống này đảm bảo consistency và clarity cho user experience.

## 🚨 Vấn đề đã được giải quyết

### Trước khi có Design System:
- ❌ **3 nút dùng RefreshCw icon** cho các chức năng khác nhau
- ❌ **5 nút settings** gây confusion về scope  
- ❌ **8+ nút action** trùng lặp trong AccountSettings
- ❌ **Thiếu consistency** trong việc sử dụng icons

### Sau khi có Design System:
- ✅ **Icon mapping rõ ràng** cho từng chức năng cụ thể
- ✅ **Specialized components** tránh confusion
- ✅ **Consistent styling** và behavior
- ✅ **Better accessibility** với proper labels

## 🎯 Icon Mapping System

### Data Operations
| Icon Type | Icon Component | Chức năng | Sử dụng khi |
|-----------|----------------|-----------|-------------|
| `refresh-data` | `RefreshCw` | Reload data từ external source | Tải lại từ API/Firebase |
| `reload-ui` | `RotateCcw` | Refresh UI state only | Làm mới giao diện |
| `reset-state` | `RotateCcw` | Reset to initial state | Đặt lại trạng thái |

### Settings Operations  
| Icon Type | Icon Component | Chức năng | Sử dụng khi |
|-----------|----------------|-----------|-------------|
| `system-settings` | `Settings` | System/app settings | Cài đặt hệ thống |
| `user-profile` | `User` | User account settings | Hồ sơ cá nhân |
| `edit-mode` | `Edit3` | Enter edit mode | Chỉnh sửa thông tin |

### Actions
| Icon Type | Icon Component | Chức năng | Sử dụng khi |
|-----------|----------------|-----------|-------------|
| `save` | `Save` | Save changes | Lưu thay đổi |
| `cancel` | `X` | Cancel operation | Hủy thao tác |
| `export` | `Download` | Export data | Xuất dữ liệu |
| `upload` | `Upload` | Upload/sync data | Đồng bộ dữ liệu |
| `delete` | `Trash2` | Delete operation | Xóa dữ liệu |

### Status Indicators
| Icon Type | Icon Component | Chức năng | Sử dụng khi |
|-----------|----------------|-----------|-------------|
| `success` | `CheckCircle` | Success state | Thành công |
| `pending` | `Clock` | Pending state | Đang chờ |
| `error` | `AlertCircle` | Error state | Lỗi |
| `loading` | `Loader2` | Loading state | Đang tải |

## 🛠️ Cách sử dụng ActionButton System

### Basic ActionButton
```tsx
import { ActionButton } from '@/components/ui/ActionButton';

<ActionButton
  iconType="refresh-data"
  onClick={handleRefresh}
  title="Tải lại dữ liệu từ Firebase"
>
  Tải lại dữ liệu
</ActionButton>
```

### Specialized Components

#### RefreshButton
```tsx
import { RefreshButton } from '@/components/ui/ActionButton';

// Cho data operations
<RefreshButton 
  type="data" 
  onClick={handleDataRefresh}
  title="Tải lại từ Firebase"
>
  Tải lại dữ liệu
</RefreshButton>

// Cho UI operations  
<RefreshButton 
  type="ui" 
  onClick={handleUIRefresh}
  title="Làm mới giao diện"
>
  Làm mới thống kê
</RefreshButton>
```

#### SettingsButton
```tsx
import { SettingsButton } from '@/components/ui/ActionButton';

// System settings
<SettingsButton 
  type="system" 
  onClick={() => navigate('/settings')}
>
  Quản lý hệ thống
</SettingsButton>

// User profile
<SettingsButton 
  type="user" 
  onClick={() => setShowProfile(true)}
>
  Hồ sơ cá nhân
</SettingsButton>
```

#### Other Specialized Components
```tsx
import { 
  SaveButton, 
  CancelButton, 
  ExportButton, 
  SyncButton, 
  DeleteButton 
} from '@/components/ui/ActionButton';

<SaveButton onClick={handleSave}>Lưu thay đổi</SaveButton>
<CancelButton onClick={handleCancel}>Hủy</CancelButton>
<ExportButton onClick={handleExport}>Xuất dữ liệu</ExportButton>
<SyncButton onClick={handleSync}>Đồng bộ</SyncButton>
<DeleteButton onClick={handleDelete}>Xóa</DeleteButton>
```

## 🎨 Styling Guidelines

### Button Variants
- **Primary actions**: `variant="default"` (blue)
- **Secondary actions**: `variant="outline"` (white with border)
- **Destructive actions**: `variant="destructive"` (red)
- **Subtle actions**: `variant="ghost"` (transparent)

### Button Sizes
- **Icon only**: `size="icon"` (square button)
- **Small**: `size="sm"` (compact)
- **Default**: `size="default"` (standard)
- **Large**: `size="lg"` (prominent)

### Color Coding
- **Data operations**: Green (`text-green-600`)
- **Export operations**: Blue (`text-blue-600`)
- **Sync operations**: Purple (`text-purple-600`)
- **Delete operations**: Red (`text-red-600`)
- **Settings**: Gray (`text-gray-600`)

## ♿ Accessibility Guidelines

### Required Attributes
```tsx
<ActionButton
  iconType="refresh-data"
  aria-label="Tải lại dữ liệu từ Firebase" // Auto-generated if not provided
  title="Tooltip text for hover"
  onClick={handleClick}
>
  Button text
</ActionButton>
```

### Screen Reader Support
- Tất cả buttons có `aria-label` tự động
- Icon-only buttons cần `<span className="sr-only">` text
- Loading states có proper announcements

## 📱 Responsive Design

### Mobile Considerations
```tsx
// Icon only trên mobile, text trên desktop
<ActionButton
  iconType="export"
  className="md:w-auto w-10" // Icon only on mobile
>
  <span className="hidden md:inline">Xuất dữ liệu</span>
</ActionButton>
```

### Button Grouping
```tsx
// Group related buttons
<div className="flex flex-col md:flex-row gap-2">
  <div className="space-y-2 md:space-y-0 md:space-x-2 md:flex">
    <RefreshButton type="data">Tải lại</RefreshButton>
    <ExportButton>Xuất dữ liệu</ExportButton>
  </div>
</div>
```

## 🧪 Testing Guidelines

### Visual Testing
- [ ] Icons hiển thị đúng cho từng chức năng
- [ ] Colors consistent theo guidelines
- [ ] Hover states hoạt động
- [ ] Loading states hiển thị đúng

### Functional Testing  
- [ ] Click handlers hoạt động đúng
- [ ] Disabled states prevent interaction
- [ ] Tooltips hiển thị đúng nội dung
- [ ] Keyboard navigation hoạt động

### Accessibility Testing
- [ ] Screen reader đọc đúng labels
- [ ] Tab navigation theo thứ tự logic
- [ ] Focus indicators rõ ràng
- [ ] Color contrast đạt WCAG standards

## 🔄 Migration Guide

### Từ Button cũ sang ActionButton

#### Before:
```tsx
<Button onClick={handleRefresh}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Làm mới
</Button>
```

#### After:
```tsx
<RefreshButton type="ui" onClick={handleRefresh}>
  Làm mới thống kê
</RefreshButton>
```

### Checklist Migration
- [ ] Identify button function (data/ui/settings/action)
- [ ] Choose appropriate specialized component
- [ ] Add proper title/aria-label
- [ ] Update styling classes if needed
- [ ] Test functionality and accessibility

## 📈 Metrics & Success

### Before Implementation
- 🔴 **Icon confusion**: 3 RefreshCw icons cho khác chức năng
- 🔴 **Settings confusion**: 5 settings buttons khác scope
- 🔴 **Duplicate code**: 8+ similar buttons trong AccountSettings

### After Implementation  
- 🟢 **Clear icon mapping**: Mỗi icon có chức năng rõ ràng
- 🟢 **Reduced confusion**: Specialized components phân biệt rõ
- 🟢 **Code reuse**: Single ActionButton system
- 🟢 **Better UX**: Consistent behavior và styling

## 🚀 Future Enhancements

### Planned Features
- [ ] **Animation system**: Consistent micro-interactions
- [ ] **Theme support**: Dark/light mode icons
- [ ] **Icon variants**: Different styles cho same function
- [ ] **Keyboard shortcuts**: Hotkeys cho common actions

### Maintenance
- [ ] **Regular audits**: Check for new duplicate patterns
- [ ] **User feedback**: Monitor confusion points
- [ ] **Performance**: Optimize icon loading
- [ ] **Documentation**: Keep guidelines updated

---

**Tạo bởi:** Augment Agent  
**Ngày cập nhật:** 2025-01-20  
**Version:** 1.0.0
