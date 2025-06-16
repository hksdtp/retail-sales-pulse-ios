# Test KPI Data

## Các loại công việc được tính vào KPI:

### 1. KTS (Kiến trúc sư)
- `architect_new`: KTS mới
- `architect_old`: KTS cũ

### 2. Đối tác
- `partner_new`: Đối tác mới  
- `partner_old`: Đối tác cũ

### 3. Khách hàng
- `client_new`: Khách hàng mới
- `client_old`: Khách hàng cũ

### 4. Báo giá
- `quote_new`: Báo giá mới
- `quote_old`: Báo giá cũ

### 5. Công việc khác
- `other`: Công việc khác

## Cách tính KPI:
- **Tổng số**: Đếm tất cả tasks thuộc loại đó (không phân biệt trạng thái)
- **Hoàn thành**: Đếm tasks có status = 'completed'
- **Đang thực hiện**: Đếm tasks có status = 'in-progress'
- **Tạm hoãn**: Đếm tasks có status = 'on-hold'
- **Cần làm**: Đếm tasks có status = 'todo'
- **Tỷ lệ hoàn thành**: (Hoàn thành / Tổng số) * 100%

## Test Cases:
1. Tạo task loại "KTS mới" → KPI KTS tăng
2. Tạo task loại "Đối tác cũ" → KPI Đối tác tăng
3. Tạo task loại "Khách hàng mới" → KPI Khách hàng tăng
4. Tạo task loại "Báo giá mới" → KPI Báo giá tăng
5. Tạo task loại "Công việc khác" → KPI Công việc khác tăng

## Hiển thị trong TaskDetailPanel:
- Badge hiển thị loại công việc với màu sắc phù hợp
- Icon Briefcase trong meta info
- Tên loại công việc được hiển thị rõ ràng
