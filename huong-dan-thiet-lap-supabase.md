# 🔧 HƯỚNG DẪN THIẾT LẬP SUPABASE CHO DỰ ÁN

**Dự án:** retail-sales-pulse-ios  
**Ngày:** 2025-06-29  
**Mục tiêu:** Migration từ Firebase sang Supabase  

---

## 📋 **BƯỚC 1: TRUY CẬP SUPABASE DASHBOARD**

1. **Mở trình duyệt** và truy cập: https://supabase.com/dashboard
2. **Đăng nhập** vào tài khoản Supabase
3. **Chọn project:** `fnakxavwxubnbucfoujd`
4. **Vào mục SQL Editor** (biểu tượng database ở sidebar)

---

## 📊 **BƯỚC 2: CHẠY SCHEMA SQL**

### **2.1 Mở SQL Editor**
- Click vào **"SQL Editor"** trong sidebar trái
- Click **"New query"** để tạo query mới

### **2.2 Copy và Paste Schema**
- Mở file `supabase-schema.sql` trong dự án
- **Copy toàn bộ nội dung** của file
- **Paste vào SQL Editor** trong Supabase

### **2.3 Thực thi Schema**
- Click nút **"Run"** (hoặc Ctrl+Enter)
- Đợi cho đến khi thấy thông báo **"Success"**
- Kiểm tra không có error messages màu đỏ

### **2.4 Xác minh Tables đã được tạo**
- Vào mục **"Table Editor"** trong sidebar
- Kiểm tra có 3 tables: `users`, `teams`, `tasks`
- Mỗi table phải có đầy đủ columns theo schema

---

## 🔄 **BƯỚC 3: CHẠY MIGRATION SCRIPT**

### **3.1 Kiểm tra dữ liệu Firebase**
```bash
# Kiểm tra file dữ liệu có tồn tại không
ls -la packages/web/scripts/firebase-data-export.json
```

### **3.2 Chạy Migration Script**
```bash
# Di chuyển đến thư mục dự án
cd /Users/nih/web\ app/BL\ dang\ su\ dung/retail-sales-pulse-ios

# Chạy migration script
node firebase-to-supabase-migration.js
```

### **3.3 Kiểm tra kết quả Migration**
- Vào **Table Editor** trong Supabase
- Kiểm tra dữ liệu trong từng table:
  - **users table:** Phải có ~24 records
  - **teams table:** Phải có ~12 records  
  - **tasks table:** Phải có ~31 records

---

## ✅ **BƯỚC 4: XÁC MINH MIGRATION THÀNH CÔNG**

### **4.1 Kiểm tra Row Level Security (RLS)**
- Vào **Authentication > Policies**
- Xác minh có policies cho cả 3 tables
- Đảm bảo RLS được enable

### **4.2 Kiểm tra Indexes**
- Vào **Database > Indexes**
- Xác minh có đầy đủ indexes cho performance

### **4.3 Test kết nối từ ứng dụng**
```bash
# Chạy test kết nối
node simple-supabase-test.cjs
```

---

## 🎯 **BƯỚC 5: CẬP NHẬT ỨNG DỤNG**

### **5.1 Cập nhật Supabase Service**
- File: `packages/web/src/services/SupabaseService.ts`
- Đảm bảo URL và API key đúng
- Test connection methods

### **5.2 Cập nhật Authentication Context**
- File: `packages/web/src/context/AuthContextSupabase.tsx`
- Chuyển từ mock data sang Supabase data
- Test authentication flow

### **5.3 Cập nhật Task Management**
- File: `packages/web/src/components/tasks/TaskManagementView.tsx`
- Kết nối với Supabase thay vì Firebase
- Test CRUD operations

---

## 🚨 **LƯU Ý QUAN TRỌNG**

### **Backup dữ liệu:**
- ✅ Dữ liệu Firebase đã được export vào `firebase-data-export.json`
- ✅ ID mapping sẽ được lưu trong `firebase-supabase-id-mapping.json`

### **Rollback plan:**
- Giữ nguyên Firebase configuration để có thể rollback
- Sử dụng feature flags để switch giữa Firebase và Supabase

### **Testing:**
- Test từng chức năng sau khi migration
- Kiểm tra performance và user experience
- Verify data integrity

---

## 📞 **HỖ TRỢ VÀ TROUBLESHOOTING**

### **Nếu gặp lỗi SQL:**
1. Kiểm tra syntax trong `supabase-schema.sql`
2. Chạy từng phần schema riêng biệt
3. Xem error logs trong Supabase dashboard

### **Nếu migration script lỗi:**
1. Kiểm tra file `firebase-data-export.json` có tồn tại
2. Verify Supabase connection string
3. Check API key permissions

### **Nếu ứng dụng không kết nối được:**
1. Kiểm tra Supabase URL và API key
2. Verify RLS policies
3. Check network connectivity

---

**✅ SAU KHI HOÀN THÀNH TẤT CẢ BƯỚC TRÊN, HỆ THỐNG SẼ CHẠY HOÀN TOÀN TRÊN SUPABASE!**
