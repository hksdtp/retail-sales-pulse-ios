# Hướng dẫn thêm Password Column vào Supabase

## 🎯 Mục đích
Thêm column `password` vào table `users` trong Supabase để lưu trữ mật khẩu thật của người dùng và đồng bộ với hệ thống authentication local.

## 📋 Các bước thực hiện

### Bước 1: Truy cập Supabase Dashboard
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project: `fnakxavwxubnbucfoujd`
3. Vào mục **SQL Editor** (biểu tượng </> ở sidebar)

### Bước 2: Chạy SQL Script
Copy và paste đoạn SQL sau vào SQL Editor:

```sql
-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password '123456' for all existing users
UPDATE users 
SET password = '123456' 
WHERE password IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN users.password IS 'User password - synced with local authentication system';

-- Create index for password queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('password', 'password_changed')
ORDER BY column_name;

-- Show sample of updated users
SELECT 
    id, 
    name, 
    email, 
    password, 
    password_changed,
    updated_at
FROM users 
LIMIT 5;
```

### Bước 3: Chạy Script
1. Click nút **Run** để thực thi script
2. Kiểm tra kết quả trong phần **Results**
3. Đảm bảo không có lỗi nào xuất hiện

### Bước 4: Xác nhận thành công
Sau khi chạy script thành công, bạn sẽ thấy:
- Column `password` đã được thêm vào table `users`
- Tất cả users hiện tại có password mặc định là `'123456'`
- Index đã được tạo để tối ưu performance

## 🧪 Test sau khi setup
Sau khi hoàn thành, hãy test trong ứng dụng:

```javascript
// Trong browser console
await window.ensurePasswordColumnInSupabase()
// Kết quả mong đợi: { success: true, message: "Password column exists..." }

await window.syncPasswordResetToSupabase()
// Kết quả mong đợi: { success: true, message: "All user passwords reset..." }
```

## 🔄 Logic mật khẩu sau khi setup
```
Mật khẩu mặc định (123456) 
    ↓ User đổi mật khẩu
Mật khẩu mới (localStorage + Supabase)
    ↓ Sử dụng
Đăng nhập với mật khẩu mới (đồng bộ từ Supabase)
```

## ⚠️ Lưu ý quan trọng
- **Backup**: Luôn backup database trước khi chạy script
- **Test**: Test trên environment development trước
- **Security**: Mật khẩu sẽ được lưu dạng plain text (có thể hash sau này)
- **Sync**: Từ giờ mọi thay đổi mật khẩu sẽ được đồng bộ lên Supabase

## 🚨 Troubleshooting
Nếu gặp lỗi:
1. Kiểm tra quyền truy cập Supabase
2. Đảm bảo table `users` tồn tại
3. Kiểm tra syntax SQL
4. Liên hệ admin nếu cần hỗ trợ
