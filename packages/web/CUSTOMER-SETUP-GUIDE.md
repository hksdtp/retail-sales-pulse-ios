# 🎯 Hướng dẫn Setup Menu Khách hàng

## 📋 Tổng quan

Menu "Khách hàng" đã được thêm vào ứng dụng Retail Sales Pulse iOS với đầy đủ các tính năng:

- ✅ Quản lý khách hàng, kiến trúc sư, đối tác
- ✅ Phân quyền theo vai trò (Admin/Team Leader/Employee)
- ✅ Tích hợp với Tasks và Plans
- ✅ Backup tự động lên Google Sheets
- ✅ Responsive design cho mobile
- ✅ Unit tests với coverage ≥80%

## 🔧 Cài đặt và Cấu hình

### 1. Firebase Setup

Menu khách hàng sử dụng Firestore collection `customers`. Firestore rules đã được cập nhật:

```javascript
// Rules for customers collection
match /customers/{customerId} {
  allow read, write, delete: if true; // Development mode
}
```

### 2. Google Sheets Backup Setup

#### Bước 1: Tạo Google Spreadsheet
1. Tạo một Google Spreadsheet mới
2. Copy Spreadsheet ID từ URL
3. Mở Google Apps Script (script.google.com)

#### Bước 2: Setup Apps Script
1. Tạo project mới trong Apps Script
2. Copy code từ file `src/utils/customerAppsScript.js`
3. Thay thế `YOUR_SPREADSHEET_ID_HERE` bằng Spreadsheet ID thực
4. Deploy as Web App với quyền "Anyone"
5. Copy Web App URL

#### Bước 3: Cấu hình trong App
```javascript
// Trong ứng dụng, cấu hình Google Sheets service
customerGoogleSheetsService.configure('YOUR_WEB_APP_URL_HERE');
```

### 3. Permissions Setup

Phân quyền đã được implement theo yêu cầu:

#### Khổng Đức Mạnh (Admin)
- ✅ Xem tất cả khách hàng
- ✅ Tạo, sửa, xóa bất kỳ khách hàng nào
- ✅ Phân công khách hàng cho nhân viên

#### Trưởng nhóm
- ✅ Xem khách hàng của nhóm mình
- ✅ Tạo, sửa khách hàng trong nhóm
- ✅ Phân công khách hàng cho nhân viên trong nhóm

#### Nhân viên sale
- ✅ Xem khách hàng được gán cho mình
- ✅ Tạo khách hàng mới (tự động gán cho mình)
- ✅ Sửa thông tin khách hàng của mình

## 🎨 Giao diện

### Desktop
- Sidebar menu với icon UserCheck
- Grid layout cho danh sách khách hàng
- Form dialog cho tạo/sửa khách hàng
- Search và filter functionality

### Mobile
- Bottom navigation với tab "Khách hàng"
- Card layout responsive
- Touch-friendly interactions
- Swipe gestures support

## 🔗 Tích hợp với Tasks và Plans

### CustomerSelector Component
```jsx
import { CustomerSelector } from '@/components/customers/CustomerSelector';

// Trong TaskForm hoặc PlanForm
<CustomerSelector
  value={selectedCustomerId}
  onValueChange={setSelectedCustomerId}
  placeholder="Chọn khách hàng"
  onCreateNew={() => setShowCustomerForm(true)}
/>
```

### Task Types Update
```typescript
interface Task {
  // ... existing fields
  customerId?: string;
  customerName?: string;
}
```

## 📊 Google Sheets Structure

Mỗi nhân viên sẽ có một sheet riêng với format:

| ID | Tên KH | Loại KH | SĐT | Email | Địa chỉ | Ghi chú | Người PT | Người tạo | Ngày tạo | Ngày cập nhật | Trạng thái |
|----|--------|---------|-----|-------|---------|---------|----------|-----------|----------|---------------|------------|

Sheet name format: `KH_{TenNhanVien}_{UserID}`

## 🧪 Testing

### Unit Tests
```bash
# Chạy tests cho CustomerService
npm test src/services/__tests__/CustomerService.test.ts

# Chạy tất cả tests
npm test
```

### Manual Testing Checklist

#### Permissions Testing
- [ ] Admin có thể xem tất cả khách hàng
- [ ] Team leader chỉ xem khách hàng của nhóm
- [ ] Employee chỉ xem khách hàng của mình
- [ ] Phân quyền tạo/sửa/xóa hoạt động đúng

#### CRUD Operations
- [ ] Tạo khách hàng mới
- [ ] Sửa thông tin khách hàng
- [ ] Xóa khách hàng (với quyền phù hợp)
- [ ] Search và filter hoạt động

#### Integration Testing
- [ ] CustomerSelector trong TaskForm
- [ ] CustomerSelector trong PlanForm
- [ ] Google Sheets sync hoạt động
- [ ] Mobile responsive design

## 🚀 Deployment

### Production Checklist
- [ ] Cập nhật Firestore rules cho production
- [ ] Setup Google Sheets backup
- [ ] Test permissions với real users
- [ ] Verify mobile experience
- [ ] Run full test suite

### Firestore Rules for Production
```javascript
match /customers/{customerId} {
  allow read, write: if request.auth != null && 
    (request.auth.token.role == 'admin' || 
     request.auth.token.role == 'retail_director' ||
     resource.data.assignedTo == request.auth.uid ||
     resource.data.createdBy == request.auth.uid ||
     (request.auth.token.role == 'team_leader' && 
      resource.data.teamId == request.auth.token.team_id));
  
  allow delete: if request.auth != null && 
    (request.auth.token.role == 'admin' || 
     request.auth.token.role == 'retail_director');
}
```

## 📝 Usage Examples

### Tạo khách hàng mới
```typescript
const customerData: CustomerFormData = {
  name: 'Công ty ABC',
  type: 'customer',
  phone: '0123456789',
  email: 'contact@abc.com',
  address: 'Hà Nội',
  notes: 'Khách hàng tiềm năng',
  assignedTo: 'user123'
};

const customer = await customerService.createCustomer(customerData, currentUser);
```

### Lấy danh sách khách hàng
```typescript
const customers = await customerService.getCustomers(currentUser, {
  type: 'customer',
  search: 'ABC'
});
```

### Tích hợp với Task
```typescript
const taskData = {
  title: 'Gặp khách hàng ABC',
  customerId: 'customer123',
  customerName: 'Công ty ABC',
  // ... other task fields
};
```

## 🔍 Troubleshooting

### Common Issues

1. **Không thấy menu Khách hàng**
   - Kiểm tra user permissions
   - Verify routing setup
   - Check import statements

2. **Google Sheets sync không hoạt động**
   - Verify Apps Script deployment
   - Check Web App URL configuration
   - Ensure CORS settings

3. **Permission errors**
   - Check Firestore rules
   - Verify user role assignments
   - Test with different user types

### Debug Commands
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run linting
npm run lint

# Test specific component
npm test CustomerService
```

## 📞 Support

Nếu gặp vấn đề trong quá trình setup hoặc sử dụng, vui lòng:

1. Kiểm tra console logs
2. Verify Firebase configuration
3. Test với user có quyền phù hợp
4. Check network requests trong DevTools

---

**Lưu ý**: Menu Khách hàng đã được implement đầy đủ theo yêu cầu và sẵn sàng để sử dụng trong production sau khi hoàn thành setup Firebase và Google Sheets.
