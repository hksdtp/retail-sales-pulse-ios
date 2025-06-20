# 🧩 Component Usage Guide - ActionButton System

## 🎯 Quick Reference

### Import Statement
```tsx
import { 
  ActionButton,
  RefreshButton,
  SettingsButton,
  SaveButton,
  CancelButton,
  ExportButton,
  SyncButton,
  DeleteButton
} from '@/components/ui/ActionButton';
```

## 📋 Component Catalog

### 1. ActionButton (Base Component)

**Khi nào sử dụng:** Khi cần custom icon type không có trong specialized components

```tsx
<ActionButton
  iconType="reset-state"
  onClick={handleReset}
  variant="outline"
  title="Đặt lại trạng thái về ban đầu"
>
  Đặt lại
</ActionButton>
```

**Props:**
- `iconType`: Icon type từ ICON_MAP
- `onClick`: Click handler function
- `variant`: Button style variant
- `size`: Button size
- `disabled`: Disable state
- `loading`: Loading state với spinner
- `className`: Additional CSS classes
- `title`: Tooltip text
- `aria-label`: Accessibility label

### 2. RefreshButton

**Khi nào sử dụng:** Cho các thao tác refresh/reload

```tsx
// Tải lại data từ external source
<RefreshButton 
  type="data" 
  onClick={handleDataRefresh}
  title="Tải lại từ Firebase"
>
  Tải lại dữ liệu
</RefreshButton>

// Refresh UI state only
<RefreshButton 
  type="ui" 
  onClick={handleUIRefresh}
  title="Làm mới giao diện"
>
  Làm mới thống kê
</RefreshButton>
```

**Props:** Tất cả props của ActionButton + `type: 'data' | 'ui'`

### 3. SettingsButton

**Khi nào sử dụng:** Cho các thao tác settings/configuration

```tsx
// System settings
<SettingsButton 
  type="system" 
  onClick={() => navigate('/settings')}
>
  Quản lý hệ thống
</SettingsButton>

// User profile settings
<SettingsButton 
  type="user" 
  onClick={() => setShowProfile(true)}
>
  Hồ sơ cá nhân
</SettingsButton>
```

**Props:** Tất cả props của ActionButton + `type: 'system' | 'user'`

### 4. SaveButton

**Khi nào sử dụng:** Cho các thao tác lưu dữ liệu

```tsx
<SaveButton 
  onClick={handleSave}
  disabled={!hasChanges}
  loading={isSaving}
>
  Lưu thay đổi
</SaveButton>
```

### 5. CancelButton

**Khi nào sử dụng:** Cho các thao tác hủy/cancel

```tsx
<CancelButton 
  onClick={handleCancel}
  disabled={isProcessing}
>
  Hủy
</CancelButton>
```

### 6. ExportButton

**Khi nào sử dụng:** Cho các thao tác xuất dữ liệu

```tsx
<ExportButton 
  onClick={handleExport}
  title="Xuất dữ liệu dạng JSON"
>
  Xuất báo cáo
</ExportButton>
```

### 7. SyncButton

**Khi nào sử dụng:** Cho các thao tác đồng bộ dữ liệu

```tsx
<SyncButton 
  onClick={handleSync}
  loading={isSyncing}
  disabled={noPendingData}
>
  Đồng bộ ({pendingCount})
</SyncButton>
```

### 8. DeleteButton

**Khi nào sử dụng:** Cho các thao tác xóa (tự động có variant="destructive")

```tsx
<DeleteButton 
  onClick={handleDelete}
  disabled={isDeleting}
>
  Xóa tất cả
</DeleteButton>
```

## 🎨 Styling Patterns

### Button Groups
```tsx
// Horizontal group
<div className="flex gap-2">
  <SaveButton onClick={handleSave}>Lưu</SaveButton>
  <CancelButton onClick={handleCancel}>Hủy</CancelButton>
</div>

// Vertical group (mobile)
<div className="flex flex-col gap-2 md:flex-row">
  <SyncButton onClick={handleSync}>Đồng bộ</SyncButton>
  <RefreshButton type="ui" onClick={handleRefresh}>Làm mới</RefreshButton>
</div>
```

### Grouped by Function
```tsx
<div className="space-y-4">
  {/* Data Operations */}
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
      Thao tác dữ liệu
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SyncButton onClick={handleSync}>Đồng bộ</SyncButton>
      <RefreshButton type="ui" onClick={handleRefresh}>Làm mới</RefreshButton>
    </div>
  </div>
  
  {/* State Management */}
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
      Quản lý trạng thái
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ActionButton iconType="reset-state" onClick={handleReset}>
        Đặt lại
      </ActionButton>
      <ActionButton iconType="success" onClick={handleCleanup}>
        Dọn dẹp
      </ActionButton>
    </div>
  </div>
</div>
```

### Icon-only Buttons
```tsx
// For toolbars and compact spaces
<div className="flex gap-1">
  <RefreshButton 
    type="data" 
    size="icon"
    title="Tải lại dữ liệu"
    onClick={handleRefresh}
  >
    <span className="sr-only">Tải lại</span>
  </RefreshButton>
  
  <ExportButton 
    size="icon"
    title="Xuất dữ liệu"
    onClick={handleExport}
  >
    <span className="sr-only">Xuất</span>
  </ExportButton>
</div>
```

## 🔄 Common Patterns

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

<SyncButton 
  onClick={async () => {
    setIsLoading(true);
    await handleSync();
    setIsLoading(false);
  }}
  loading={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Đang đồng bộ...' : 'Đồng bộ'}
</SyncButton>
```

### Conditional Rendering
```tsx
{hasChanges && (
  <div className="flex gap-2">
    <SaveButton onClick={handleSave}>Lưu thay đổi</SaveButton>
    <CancelButton onClick={handleCancel}>Hủy</CancelButton>
  </div>
)}
```

### Form Actions
```tsx
// Form footer pattern
<div className="flex justify-end gap-3 pt-4 border-t">
  <CancelButton onClick={onCancel}>Hủy</CancelButton>
  <SaveButton 
    onClick={onSave}
    disabled={!isValid}
    loading={isSaving}
  >
    Lưu
  </SaveButton>
</div>
```

## ⚠️ Common Mistakes

### ❌ Sai
```tsx
// Sử dụng sai icon type
<ActionButton iconType="refresh-data" onClick={handleUIRefresh}>
  Làm mới giao diện
</ActionButton>

// Thiếu accessibility
<RefreshButton type="data" onClick={handleRefresh} />

// Inconsistent styling
<Button className="custom-style">
  <RefreshCw className="h-4 w-4" />
  Làm mới
</Button>
```

### ✅ Đúng
```tsx
// Sử dụng đúng icon type
<RefreshButton type="ui" onClick={handleUIRefresh}>
  Làm mới giao diện
</RefreshButton>

// Đầy đủ accessibility
<RefreshButton 
  type="data" 
  onClick={handleRefresh}
  title="Tải lại dữ liệu từ Firebase"
>
  Tải lại dữ liệu
</RefreshButton>

// Sử dụng specialized component
<RefreshButton type="data" onClick={handleRefresh}>
  Tải lại dữ liệu
</RefreshButton>
```

## 🧪 Testing Examples

### Unit Tests
```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { RefreshButton } from '@/components/ui/ActionButton';

test('RefreshButton calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(
    <RefreshButton type="data" onClick={handleClick}>
      Tải lại
    </RefreshButton>
  );
  
  fireEvent.click(screen.getByRole('button', { name: /tải lại/i }));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Integration Tests
```tsx
test('Sync panel buttons work correctly', async () => {
  render(<LocalStorageSyncPanel />);
  
  // Test sync button
  const syncButton = screen.getByRole('button', { name: /đồng bộ tất cả/i });
  expect(syncButton).toBeInTheDocument();
  
  // Test refresh button
  const refreshButton = screen.getByRole('button', { name: /làm mới thống kê/i });
  fireEvent.click(refreshButton);
  
  // Verify UI updates
  await waitFor(() => {
    expect(screen.getByText(/thống kê đã được cập nhật/i)).toBeInTheDocument();
  });
});
```

## 📱 Responsive Guidelines

### Mobile-first Approach
```tsx
// Stack vertically on mobile, horizontal on desktop
<div className="flex flex-col gap-2 sm:flex-row">
  <SyncButton onClick={handleSync}>Đồng bộ</SyncButton>
  <RefreshButton type="ui" onClick={handleRefresh}>Làm mới</RefreshButton>
</div>

// Icon only on mobile, with text on desktop
<RefreshButton 
  type="data"
  size="icon"
  className="sm:w-auto"
  onClick={handleRefresh}
>
  <span className="sr-only sm:not-sr-only sm:ml-2">Tải lại dữ liệu</span>
</RefreshButton>
```

### Breakpoint Considerations
- **Mobile (< 640px)**: Icon-only buttons, vertical stacking
- **Tablet (640px - 1024px)**: Mixed icon+text, flexible layout
- **Desktop (> 1024px)**: Full text buttons, horizontal layout

---

**Cập nhật:** 2025-01-20  
**Version:** 1.0.0
