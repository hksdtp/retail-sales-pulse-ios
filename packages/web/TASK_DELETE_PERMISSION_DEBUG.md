# 🔧 Hướng dẫn debug quyền xóa công việc

## 📋 Vấn đề hiện tại:
- **Thông báo lỗi**: "Bạn không có quyền xóa công việc này!"
- **Yêu cầu**: Khổng Đức Mạnh có thể xóa mọi công việc, mọi người có thể xóa công việc của mình

## ✅ Đã kiểm tra và xác nhận:
1. **Logic permission đúng**: `canEditTask()` function hoạt động chính xác
2. **Role detection đúng**: Khổng Đức Mạnh có role `retail_director`
3. **Test logic thành công**: Unit test cho permission logic pass 100%

## 🔍 Debug steps để tìm vấn đề:

### **Bước 1: Khởi động ứng dụng**
```bash
cd retail-sales-pulse-ios/packages/web
npm run dev
```

### **Bước 2: Đăng nhập với Khổng Đức Mạnh**
1. Truy cập: `http://localhost:8088`
2. Click button "Khổng Đức Mạnh"
3. Nhập password: `Haininh1`
4. Click "Đăng Nhập"

**Nếu login không hoạt động:**
- Refresh page và thử lại
- Sử dụng Chrome browser
- Hoặc force enable login button bằng Developer Tools:
  ```javascript
  document.querySelector('button[data-testid="login-submit-button"]').disabled = false;
  ```

### **Bước 3: Kiểm tra user data**
Mở Developer Tools (F12) và chạy:
```javascript
// Kiểm tra current user data
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
console.log('Current User:', currentUser);

// Kiểm tra role
console.log('User Role:', currentUser.role);
console.log('Is Director:', currentUser.role === 'retail_director');
```

**Kết quả mong đợi:**
```javascript
{
  id: "user_manh",
  name: "Khổng Đức Mạnh", 
  role: "retail_director",
  email: "manh.khong@example.com"
}
```

### **Bước 4: Tìm và test xóa công việc**
1. **Tìm task để xóa**:
   - Vào tab "Của tôi", "Của nhóm", hoặc "Thành viên"
   - Tìm một task bất kỳ

2. **Thử xóa task**:
   - Click vào task để mở detail panel
   - Hoặc tìm button "Xóa" trên task item
   - Click button "Xóa"

3. **Kiểm tra console logs**:
   - Mở Developer Tools → Console tab
   - Tìm log bắt đầu với `🔍 DELETE PERMISSION CHECK:`
   - Xem chi tiết thông tin debug

### **Bước 5: Phân tích debug logs**

**Log mẫu khi hoạt động đúng:**
```
🔍 DELETE PERMISSION CHECK: {
  taskId: "task_123",
  taskTitle: "Công việc test",
  taskUserId: "user_viet_anh",
  taskAssignedTo: "user_viet_anh", 
  currentUserId: "user_manh",
  currentUserName: "Khổng Đức Mạnh",
  currentUserRole: "retail_director",
  canEdit: true
}
```

**Các vấn đề có thể gặp:**

1. **currentUserRole không phải "retail_director"**:
   ```
   currentUserRole: "employee" // ❌ SAI
   ```
   → **Giải pháp**: Kiểm tra login process và user data

2. **currentUser null hoặc undefined**:
   ```
   currentUserId: undefined // ❌ SAI
   currentUserName: undefined
   ```
   → **Giải pháp**: Login lại hoặc check authentication

3. **task data thiếu thông tin**:
   ```
   taskUserId: undefined // ❌ SAI
   taskAssignedTo: undefined
   ```
   → **Giải pháp**: Kiểm tra task data structure

### **Bước 6: Test với user thường**

Để so sánh, hãy test với user thường:

1. **Logout**: Xóa localStorage
   ```javascript
   localStorage.clear();
   ```

2. **Login với user khác** (ví dụ: Lương Việt Anh):
   - Click "Lương Việt Anh" 
   - Password: `123456`

3. **Thử xóa task**:
   - Task của chính mình: Phải được phép ✅
   - Task của người khác: Phải bị từ chối ❌

### **Bước 7: Kiểm tra task data structure**

Chạy trong console để xem task data:
```javascript
// Lấy tất cả tasks
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
console.log('All tasks:', tasks);

// Kiểm tra structure của task đầu tiên
if (tasks.length > 0) {
  console.log('First task structure:', tasks[0]);
  console.log('Has user_id:', !!tasks[0].user_id);
  console.log('Has assignedTo:', !!tasks[0].assignedTo);
}
```

## 🛠️ Các giải pháp có thể:

### **Nếu currentUser role sai:**
```javascript
// Force update user role
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
currentUser.role = 'retail_director';
localStorage.setItem('currentUser', JSON.stringify(currentUser));
location.reload();
```

### **Nếu task thiếu user_id:**
Kiểm tra task creation process và đảm bảo user_id được set đúng.

### **Nếu vẫn không hoạt động:**
Có thể có multiple `canEditTask` functions hoặc caching issues.

## 📊 Kết quả mong đợi:

### **Khổng Đức Mạnh (retail_director):**
- ✅ Có thể xóa TẤT CẢ tasks
- ✅ `canEdit: true` cho mọi task
- ✅ Không thấy thông báo lỗi

### **User thường (sales_staff):**
- ✅ Có thể xóa task của chính mình
- ❌ Không thể xóa task của người khác
- ❌ Thấy thông báo "Bạn không có quyền xóa công việc này!" khi xóa task người khác

## 🎯 Báo cáo kết quả:

Sau khi test, hãy báo cáo:
1. **User data**: Role và thông tin user
2. **Debug logs**: Copy paste log `🔍 DELETE PERMISSION CHECK`
3. **Kết quả**: Có xóa được không và thông báo gì
4. **Browser**: Chrome/Firefox/Safari
5. **Screenshots**: Nếu có lỗi UI

---

**Lưu ý**: Debug logs đã được thêm vào code, sẽ hiển thị chi tiết khi click nút xóa.
