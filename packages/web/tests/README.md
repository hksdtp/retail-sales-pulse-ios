# Playwright Testing Guide

## 🎯 Mục đích
Playwright được cài đặt để test automation cho dự án Phòng Kinh Doanh, đặc biệt tập trung vào:
- Notification Panel functionality
- Task Detail Modal
- Task List interface
- Responsive design
- Cross-browser compatibility

## 🚀 Cài đặt đã hoàn thành
- ✅ @playwright/test đã được cài đặt
- ✅ Browsers (Chromium, Firefox, Webkit) đã được download
- ✅ Cấu hình playwright.config.ts đã được tạo
- ✅ Test scripts đã được thêm vào package.json

## 📝 Test Cases đã tạo

### 1. **notification.spec.ts**
- Test notification bell hiển thị
- Test mở/đóng notification panel
- Test z-index đúng (>999999)
- Test responsive trên mobile
- Test click outside để đóng

### 2. **task-detail-modal.spec.ts**
- Test mở modal khi click task card
- Test hiển thị đúng thông tin task
- Test "Người làm" không hiển thị "Không xác định"
- Test backdrop opacity (≤30%)
- Test đóng modal
- Test responsive

### 3. **task-list.spec.ts**
- Test hiển thị task cards
- Test thông tin task đầy đủ
- Test progress bar
- Test hover effects
- Test responsive design
- Test task groups với statistics
- Test empty state

### 4. **example.spec.ts**
- Test cơ bản để verify Playwright setup

## 🛠️ Commands

```bash
# Chạy tất cả tests
npm run test

# Chạy tests với UI mode (interactive)
npm run test:ui

# Chạy tests với browser hiển thị
npm run test:headed

# Debug mode
npm run test:debug

# Chạy test cụ thể
npx playwright test tests/notification.spec.ts

# Chạy test trên browser cụ thể
npx playwright test --project=chromium

# Chạy test trên mobile
npx playwright test --project="Mobile Chrome"
```

## 📊 Test Reports

Sau khi chạy tests, report sẽ được tạo tại:
- `test-results/` - Screenshots và videos khi test fail
- `playwright-report/` - HTML report chi tiết

Mở report:
```bash
npx playwright show-report
```

## 🎯 Test Scenarios chính

### Notification Panel
- ✅ Z-index cao nhất (2147483647)
- ✅ Portal rendering bên ngoài DOM tree
- ✅ Click outside để đóng
- ✅ Responsive mobile

### Task Detail Modal
- ✅ Backdrop opacity 20% (không tối đen)
- ✅ "Người làm" hiển thị tên đúng
- ✅ Modal responsive
- ✅ Đóng modal đúng cách

### Task List
- ✅ Layout cân đối
- ✅ Hover effects
- ✅ Progress bars
- ✅ Task statistics
- ✅ Responsive grid

## 🔧 Cấu hình

### playwright.config.ts
- Base URL: http://localhost:5173
- Browsers: Chromium, Firefox, Webkit
- Mobile: Pixel 5, iPhone 12
- Screenshots on failure
- Video recording on failure
- Trace on retry

### Test Structure
```
tests/
├── notification.spec.ts     # Notification tests
├── task-detail-modal.spec.ts # Modal tests  
├── task-list.spec.ts        # Task list tests
├── example.spec.ts          # Basic setup test
└── README.md               # This file
```

## 🚨 Lưu ý quan trọng

1. **Server cần chạy**: Để test app thực tế, cần start dev server:
   ```bash
   npm run dev
   ```

2. **Uncomment webServer**: Trong playwright.config.ts, bỏ comment webServer config

3. **Update base URL**: Nếu app chạy port khác, update baseURL trong config

4. **Test data**: Tests hiện tại expect có data. Nếu database trống, một số tests có thể fail.

## 🎉 Kết quả mong đợi

Tất cả tests sẽ pass nếu:
- ✅ Notification panel hoạt động đúng z-index
- ✅ Task detail modal không bị tối đen
- ✅ "Người làm" hiển thị tên thật thay vì "Không xác định"
- ✅ Layout responsive và đẹp mắt
- ✅ Hover effects hoạt động
- ✅ Cross-browser compatibility

## 📞 Support

Nếu có vấn đề với tests, check:
1. Dev server có đang chạy không
2. Database có data không
3. Browser versions có compatible không
4. Network connection ổn định không
