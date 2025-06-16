# Google Drive API Setup Guide

## 🎯 Mục đích
Hướng dẫn cấu hình Google Drive API để cho phép upload ảnh vào công việc trong ứng dụng.

## 📋 Yêu cầu
- Tài khoản Google
- Quyền truy cập Google Cloud Console
- Domain/URL của ứng dụng

## 🚀 Các bước thực hiện

### Bước 1: Tạo Google Cloud Project

1. **Truy cập Google Cloud Console**
   - Vào: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google

2. **Tạo Project mới**
   - Click "Select a project" → "New Project"
   - Nhập tên project: `retail-sales-pulse`
   - Click "Create"

3. **Enable Google Drive API**
   - Vào "APIs & Services" → "Library"
   - Tìm "Google Drive API"
   - Click "Enable"

### Bước 2: Tạo API Credentials

#### 2.1 Tạo API Key

1. **Vào Credentials**
   - "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"

2. **Restrict API Key (Khuyến nghị)**
   - Click vào API Key vừa tạo
   - "Application restrictions" → "HTTP referrers"
   - Thêm các domain:
     ```
     http://localhost:8091/*
     https://yourdomain.com/*
     ```
   - "API restrictions" → "Restrict key"
   - Chọn "Google Drive API"
   - Save

3. **Copy API Key**
   - Copy và lưu API Key để sử dụng

#### 2.2 Tạo OAuth 2.0 Client ID

1. **Configure OAuth Consent Screen**
   - "APIs & Services" → "OAuth consent screen"
   - Chọn "External" → "Create"
   - Điền thông tin:
     - App name: `Retail Sales Pulse`
     - User support email: email của bạn
     - Developer contact: email của bạn
   - Save and Continue

2. **Create OAuth 2.0 Client ID**
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: `Retail Sales Pulse Web Client`

3. **Configure Authorized Origins**
   - Authorized JavaScript origins:
     ```
     http://localhost:8091
     https://yourdomain.com
     ```
   - Authorized redirect URIs (nếu cần):
     ```
     http://localhost:8091/auth/callback
     https://yourdomain.com/auth/callback
     ```

4. **Copy Client ID**
   - Copy và lưu Client ID để sử dụng

### Bước 3: Cấu hình trong ứng dụng

1. **Truy cập trang setup**
   - Vào: `http://localhost:8091/google-drive-setup`
   - Hoặc: `https://yourdomain.com/google-drive-setup`

2. **Nhập credentials**
   - Paste API Key vào trường "API Key"
   - Paste Client ID vào trường "OAuth 2.0 Client ID"
   - Click "Setup Google Drive"

3. **Authorize ứng dụng**
   - Popup Google sẽ hiện ra
   - Đăng nhập và cho phép quyền truy cập
   - Chọn "Allow" cho các permissions

4. **Verify setup**
   - Click "Test Upload" để kiểm tra
   - Nếu thành công, sẽ thấy thông báo "Test thành công!"

## 📁 Cấu trúc thư mục

Sau khi setup thành công, Google Drive sẽ có:

```
Google Drive/
└── TaskImages/           # Folder chứa ảnh từ tasks
    ├── 1703123456_image1.jpg
    ├── 1703123457_image2.png
    └── ...
```

## 🔧 Troubleshooting

### Lỗi "API Key not valid"
- Kiểm tra API Key đã được copy đúng
- Kiểm tra domain restrictions trong Google Cloud Console
- Đảm bảo Google Drive API đã được enable

### Lỗi "OAuth client not found"
- Kiểm tra Client ID đã được copy đúng
- Kiểm tra Authorized origins đã được cấu hình
- Đảm bảo OAuth consent screen đã được setup

### Lỗi "Access denied"
- Kiểm tra user đã authorize ứng dụng
- Kiểm tra scopes trong OAuth consent screen
- Thử sign out và sign in lại

### Lỗi "Folder creation failed"
- Kiểm tra quyền Google Drive trong OAuth scopes
- Đảm bảo user có quyền tạo folder trong Drive
- Kiểm tra quota limits của Google Drive API

## 📊 Monitoring & Logs

### Kiểm tra usage
- Google Cloud Console → "APIs & Services" → "Dashboard"
- Xem số lượng requests và quota usage

### Debug logs
- Mở Developer Tools (F12)
- Xem Console tab để debug upload issues
- Logs sẽ hiển thị:
  ```
  ✅ Google Drive API initialized successfully
  📁 Found existing TaskImages folder: 1BcD...
  ✅ Image uploaded successfully: {...}
  ```

## 🔒 Security Best Practices

1. **Restrict API Keys**
   - Luôn restrict API key theo domain
   - Không expose API key trong client-side code

2. **OAuth Scopes**
   - Chỉ request minimum scopes cần thiết
   - Hiện tại: `https://www.googleapis.com/auth/drive.file`

3. **Domain Restrictions**
   - Chỉ allow domains tin cậy
   - Regularly review authorized domains

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Verify credentials trong Google Cloud Console
3. Test với tài khoản Google khác
4. Liên hệ admin để hỗ trợ

## 🔗 Tài liệu tham khảo

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
