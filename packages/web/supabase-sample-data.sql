-- Sample Data for Retail Sales Pulse - Updated Structure
-- Run this after creating the schema

-- Clear existing data
DELETE FROM users;
DELETE FROM teams;

-- Insert teams according to new structure
INSERT INTO teams (id, name, leader_id, location, description, department, department_type) VALUES
('team_hanoi_1', 'NHÓM 1 - VIỆT ANH', 'user_viet_anh', 'Hà Nội', 'Nhóm 1 Hà Nội - Việt Anh', 'retail', 'retail'),
('team_hanoi_2', 'NHÓM 2 - THẢO', 'user_thao', 'Hà Nội', 'Nhóm 2 Hà Nội - Thảo', 'retail', 'retail'),
('team_hanoi_3', 'NHÓM 3', 'user_bon', 'Hà Nội', 'Nhóm 3 Hà Nội', 'retail', 'retail'),
('team_hanoi_4', 'NHÓM 4', 'user_huong', 'Hà Nội', 'Nhóm 4 Hà Nội', 'retail', 'retail'),
('team_hcm_1', 'NHÓM 1', 'user_nga', 'Hồ Chí Minh', 'Nhóm 1 HCM', 'retail', 'retail'),
('team_hcm_2', 'NHÓM 2', 'user_viet_khanh', 'Hồ Chí Minh', 'Nhóm 2 HCM', 'retail', 'retail')
ON CONFLICT (id) DO NOTHING;

-- Insert users according to new structure
INSERT INTO users (id, name, email, password, role, team_id, location, department, department_type, position, status, password_changed) VALUES
-- Trưởng phòng kinh doanh
('user_manh', 'Khổng Đức Mạnh', 'manh.khong@example.com', '123456', 'retail_director', '0', 'all', 'retail', 'retail', 'Trưởng phòng kinh doanh', 'active', true),

-- Hà Nội - NHÓM 1 - VIỆT ANH
('user_viet_anh', 'Lương Việt Anh', 'vietanh.luong@example.com', '123456', 'team_leader', 'team_hanoi_1', 'Hà Nội', 'retail', 'retail', 'Trưởng nhóm 1', 'active', true),
('user_khanh_duy', 'Lê Khánh Duy', 'khanhduy.le@example.com', '123456', 'sales_staff', 'team_hanoi_1', 'Hà Nội', 'retail', 'retail', 'Nhân viên 1', 'active', true),
('user_thu_ha', 'Quản Thu Hà', 'thuha.quan@example.com', '123456', 'sales_staff', 'team_hanoi_1', 'Hà Nội', 'retail', 'retail', 'Nhân viên 2', 'active', true),

-- Hà Nội - NHÓM 2 - THẢO
('user_thao', 'Nguyễn Thị Thảo', 'thao.nguyen@example.com', '123456', 'team_leader', 'team_hanoi_2', 'Hà Nội', 'retail', 'retail', 'Trưởng nhóm 2', 'active', true),
('user_manh_linh', 'Nguyễn Mạnh Linh', 'manhlinh.nguyen@example.com', '123456', 'sales_staff', 'team_hanoi_2', 'Hà Nội', 'retail', 'retail', 'Nhân viên 1', 'active', true),

-- Hà Nội - NHÓM 3
('user_bon', 'Trịnh Thị Bốn', 'bon.trinh@example.com', '123456', 'team_leader', 'team_hanoi_3', 'Hà Nội', 'retail', 'retail', 'Trưởng nhóm 3', 'active', true),

-- Hà Nội - NHÓM 4
('user_huong', 'Phạm Thị Hương', 'huong.pham@example.com', '123456', 'team_leader', 'team_hanoi_4', 'Hà Nội', 'retail', 'retail', 'Trưởng nhóm 4', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- Insert HCM users
INSERT INTO users (id, name, email, password, role, team_id, location, department, department_type, position, status, password_changed) VALUES
-- Hồ Chí Minh - NHÓM 1
('user_nga', 'Nguyễn Thị Nga', 'nga.nguyen@example.com', '123456', 'team_leader', 'team_hcm_1', 'Hồ Chí Minh', 'retail', 'retail', 'Trưởng nhóm 1 - HCM', 'active', true),
('user_tuyen', 'Hà Nguyễn Thanh Tuyền', 'tuyen.ha@example.com', '123456', 'sales_staff', 'team_hcm_1', 'Hồ Chí Minh', 'retail', 'retail', 'Nhân viên', 'active', true),

-- Hồ Chí Minh - NHÓM 2
('user_viet_khanh', 'Nguyễn Ngọc Việt Khanh', 'vietkhanh.nguyen@example.com', '123456', 'team_leader', 'team_hcm_2', 'Hồ Chí Minh', 'retail', 'retail', 'Trưởng nhóm 2 - HCM', 'active', true),
('user_thuy_van', 'Phùng Thị Thuỳ Vân', 'thuyvan.phung@example.com', '123456', 'sales_staff', 'team_hcm_2', 'Hồ Chí Minh', 'retail', 'retail', 'Nhân viên', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- Update team leader references
UPDATE teams SET leader_id = 'user_viet_anh' WHERE id = 'team_hanoi_1';
UPDATE teams SET leader_id = 'user_thao' WHERE id = 'team_hanoi_2';
UPDATE teams SET leader_id = 'user_bon' WHERE id = 'team_hanoi_3';
UPDATE teams SET leader_id = 'user_huong' WHERE id = 'team_hanoi_4';
UPDATE teams SET leader_id = 'user_nga' WHERE id = 'team_hcm_1';
UPDATE teams SET leader_id = 'user_viet_khanh' WHERE id = 'team_hcm_2';

-- Insert sample tasks with new user IDs
INSERT INTO tasks (id, title, description, status, priority, type, assigned_to, created_by, team_id, due_date, tags) VALUES
('task_1', 'Báo cáo doanh số tháng 12', 'Tổng hợp và phân tích doanh số bán hàng tháng 12/2024', 'in_progress', 'high', 'report', 'user_viet_anh', 'user_manh', 'team_hanoi_1', '2024-12-31 23:59:59+07', ARRAY['báo cáo', 'doanh số']),
('task_2', 'Kiểm tra kho hàng', 'Kiểm tra tồn kho và cập nhật hệ thống', 'pending', 'medium', 'inventory', 'user_khanh_duy', 'user_viet_anh', 'team_hanoi_1', '2024-12-25 17:00:00+07', ARRAY['kho hàng', 'kiểm tra']),
('task_3', 'Lập kế hoạch khuyến mãi Tết', 'Chuẩn bị chương trình khuyến mãi Tết Nguyên Đán 2025', 'pending', 'high', 'marketing', 'user_thao', 'user_manh', 'team_hanoi_2', '2024-12-30 18:00:00+07', ARRAY['khuyến mãi', 'tết']),
('task_4', 'Đào tạo nhân viên mới', 'Đào tạo quy trình bán hàng cho nhân viên mới', 'completed', 'medium', 'training', 'user_nga', 'user_manh', 'team_hcm_1', '2024-12-20 16:00:00+07', ARRAY['đào tạo', 'nhân viên']),
('task_5', 'Cập nhật giá sản phẩm', 'Cập nhật bảng giá mới cho quý 1/2025', 'pending', 'medium', 'pricing', 'user_tuyen', 'user_nga', 'team_hcm_1', '2024-12-28 12:00:00+07', ARRAY['giá cả', 'sản phẩm'])
ON CONFLICT (id) DO NOTHING;

-- Set completed_at for completed tasks
UPDATE tasks SET completed_at = '2024-12-20 15:30:00+07' WHERE status = 'completed';
