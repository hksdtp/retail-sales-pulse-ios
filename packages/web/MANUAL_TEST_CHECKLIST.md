# 🧪 Manual Test Checklist - Task Form Dialog

## Ninh ơi, hãy test theo checklist này để tìm lỗi:

### 1. 🚀 **Mở Dialog**
- [ ] Click nút "Tạo công việc mới" 
- [ ] Dialog xuất hiện không?
- [ ] Tiêu đề "Tạo công việc mới" hiển thị đúng không?
- [ ] Dialog có đủ rộng (chiếm 85-95% màn hình) không?

### 2. 📐 **Kiểm tra Layout Desktop**
- [ ] **3 cột thời gian:** "Ngày thực hiện", "Hạn chót", "Thời gian" nằm cùng 1 hàng?
- [ ] **2 cột Assignment:** "Giao cho" và "Phạm vi chia sẻ" nằm cạnh nhau?
- [ ] Spacing giữa các sections đủ rộng không?
- [ ] Form có scroll smooth không?

### 3. 📱 **Kiểm tra Responsive**
- [ ] Thu nhỏ browser xuống mobile size
- [ ] Tất cả trường chuyển thành 1 cột không?
- [ ] Dialog vẫn sử dụng hết chiều rộng không?

### 4. ✏️ **Test Input Fields**
- [ ] **Tiêu đề:** Nhập text → có hiển thị không?
- [ ] **Mô tả:** Nhập text → có hiển thị không?
- [ ] **Loại công việc:** Click các pill → có highlight không?
- [ ] **Trạng thái:** Dropdown mở được không?
- [ ] **Ưu tiên:** Dropdown mở được không?

### 5. 📅 **Test Date Pickers**
- [ ] Click "Chọn ngày thực hiện" → Calendar mở không?
- [ ] Chọn 1 ngày → Calendar đóng và hiển thị ngày đã chọn?
- [ ] Click "Chọn hạn chót" → Calendar mở không?
- [ ] Chọn 1 ngày → Calendar đóng và hiển thị ngày đã chọn?
- [ ] **Time input:** Nhập giờ → có hoạt động không?

### 6. 👥 **Test Visibility & Sharing**
- [ ] Click "Cá nhân" → có highlight xanh không?
- [ ] Click "Nhóm" → có highlight xanh lá không?
- [ ] Click "Chung" → có highlight tím không?
- [ ] **Search người:** Nhập tên → dropdown xuất hiện không?

### 7. ✅ **Test Validation**
- [ ] Form trống → nút "Tạo công việc" bị disable không?
- [ ] Điền tiêu đề → nút vẫn disable không?
- [ ] Điền đủ các trường bắt buộc → nút enable không?

### 8. 🎨 **Test Visual**
- [ ] Dark theme hoạt động đúng không?
- [ ] Icons hiển thị đúng không?
- [ ] Colors/gradients đẹp không?
- [ ] Animations smooth không?

### 9. 🔧 **Test Functionality**
- [ ] Click "Hủy bỏ" → Dialog đóng không?
- [ ] Click outside dialog → Dialog đóng không?
- [ ] Press ESC → Dialog đóng không?

### 10. 🐛 **Common Issues to Check**

#### **Layout Issues:**
- [ ] Dialog quá nhỏ (không sử dụng hết màn hình)
- [ ] Các cột không align đúng
- [ ] Spacing quá chật hoặc quá rộng
- [ ] Scroll không smooth

#### **Input Issues:**
- [ ] Placeholder text không hiển thị
- [ ] Input không focus được
- [ ] Dropdown không mở
- [ ] Date picker không hoạt động

#### **Styling Issues:**
- [ ] Colors không đúng theme
- [ ] Icons bị lỗi/thiếu
- [ ] Fonts quá nhỏ/lớn
- [ ] Border/shadow không đẹp

#### **Responsive Issues:**
- [ ] Mobile layout bị vỡ
- [ ] Text bị cắt
- [ ] Buttons quá nhỏ trên mobile
- [ ] Dialog không fit màn hình

#### **Performance Issues:**
- [ ] Dialog mở chậm
- [ ] Animations lag
- [ ] Input lag khi typing
- [ ] Memory leaks

---

## 🚨 **Báo cáo lỗi:**

**Khi tìm thấy lỗi, hãy ghi:**
1. **Lỗi gì:** Mô tả chi tiết
2. **Ở đâu:** Trường/component nào
3. **Khi nào:** Thao tác gì gây ra
4. **Screenshot:** Nếu có thể
5. **Browser:** Chrome/Safari/Firefox
6. **Screen size:** Desktop/Mobile

**Ví dụ:**
```
❌ Lỗi: Date picker không mở
📍 Vị trí: Trường "Ngày thực hiện" 
🔄 Thao tác: Click button "Chọn ngày thực hiện"
🖥️ Môi trường: Chrome Desktop 1920x1080
💡 Chi tiết: Click button nhưng calendar không xuất hiện
```

---

## ✅ **Sau khi test xong:**

Hãy báo cáo cho tôi:
- **Tổng số lỗi tìm được:** X lỗi
- **Lỗi nghiêm trọng:** (ảnh hưởng chức năng chính)
- **Lỗi nhỏ:** (chỉ ảnh hưởng UI/UX)
- **Đánh giá tổng thể:** 1-10 điểm

Tôi sẽ fix từng lỗi một cách có hệ thống! 🔧
