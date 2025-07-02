# Hướng dẫn Setup Supabase cho Retail Sales Pulse

## Bước 1: Tạo Supabase Project

1. **Truy cập Supabase Console:**
   - Vào https://app.supabase.com
   - Đăng nhập hoặc tạo tài khoản

2. **Tạo Project mới:**
   - Click "New Project"
   - Tên project: `retail-sales-pulse`
   - Database Password: Tạo password mạnh (lưu lại)
   - Region: Singapore (gần VN nhất)
   - Click "Create new project"

## Bước 2: Cấu hình Database

1. **Chạy Schema SQL:**
   - Vào SQL Editor trong Supabase Dashboard
   - Copy nội dung file `supabase-schema.sql`
   - Paste và chạy (Run)

2. **Thêm Sample Data:**
   - Tiếp tục trong SQL Editor
   - Copy nội dung file `supabase-sample-data.sql`
   - Paste và chạy (Run)

## Bước 3: Lấy thông tin kết nối

1. **Vào Settings → API:**
   - Copy `Project URL`
   - Copy `anon public` key

2. **Cập nhật file .env:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Bước 4: Cấu hình Authentication

1. **Vào Authentication → Settings:**
   - Enable "Enable email confirmations": OFF (cho development)
   - Site URL: `http://localhost:8088`
   - Redirect URLs: `http://localhost:8088/**`

2. **Tạo test user:**
   - Vào Authentication → Users
   - Click "Add user"
   - Email: `test@company.com`
   - Password: `123456`
   - Email confirm: OFF

## Bước 5: Test kết nối

1. **Chạy ứng dụng:**
   ```bash
   cd packages/web
   npm run dev
   ```

2. **Kiểm tra:**
   - Vào http://localhost:8088
   - Login với test user
   - Kiểm tra data load từ Supabase

## Bước 6: Cấu hình Storage (Optional)

1. **Vào Storage:**
   - Bucket `files` đã được tạo tự động
   - Cấu hình policies nếu cần

## Troubleshooting

### Lỗi kết nối:
- Kiểm tra URL và API key
- Kiểm tra network/firewall

### Lỗi authentication:
- Kiểm tra RLS policies
- Kiểm tra user permissions

### Lỗi CORS:
- Thêm domain vào Supabase settings
- Kiểm tra redirect URLs

## Production Setup

1. **Tạo production project riêng**
2. **Cấu hình environment variables cho production**
3. **Setup proper RLS policies**
4. **Enable email confirmations**
5. **Configure custom domain**
