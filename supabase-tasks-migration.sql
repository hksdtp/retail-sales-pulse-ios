-- SQL Script Import Tasks Migration từ Firebase sang Supabase
-- Ngày tạo: 08:24:31 30/6/2025
-- Dự án: retail-sales-pulse-ios
-- Mục tiêu: Import 31 tasks với đầy đủ relationships

-- =====================================================
-- BƯỚC 1: XÓA DỮ LIỆU CŨ (NẾU CÓ)
-- =====================================================

-- Xóa theo thứ tự để tránh foreign key constraints
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE teams CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS teams_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tasks_id_seq RESTART WITH 1;

-- =====================================================
-- BƯỚC 2: INSERT TEAMS
-- =====================================================

INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '331d784d-b7aa-4b3c-98d6-159c58586ce0',
  'NHÓM 4',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 4 Hà Nội',
  'retail',
  'retail',
  '2025-06-11T01:40:48.000Z',
  '2025-06-11T01:40:48.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'a93e6961-1d11-44aa-8859-023d4b3fbaf5',
  'NHÓM 2',
  NULL,
  'hcm',
  'Nhóm kinh doanh 2 Hồ Chí Minh',
  'retail',
  'retail',
  '2025-06-11T01:40:49.000Z',
  '2025-06-11T01:40:49.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'bcd7e62c-17be-4e5f-870a-9e8a19801de3',
  'NHÓM 1',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 1 Hà Nội',
  'retail',
  'retail',
  '2025-06-11T01:40:45.000Z',
  '2025-06-11T01:40:45.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'aebeb4b5-57ca-4707-b0e4-9001930be7a0',
  'NHÓM 1',
  NULL,
  'hcm',
  'Nhóm kinh doanh 1 Hồ Chí Minh',
  'retail',
  'retail',
  '2025-06-04T10:41:44.000Z',
  '2025-06-04T10:41:44.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '5da1c5ec-eda3-4d26-8988-aaee22ea51bf',
  'NHÓM 1 - VIỆT ANH',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 1 Hà Nội',
  'retail',
  'retail',
  '2025-06-04T10:41:41.000Z',
  '2025-06-04T10:41:41.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'f4252c1a-5e14-4720-acc4-6bfb140a562b',
  'NHÓM 2',
  NULL,
  'hcm',
  'Nhóm kinh doanh 2 Hồ Chí Minh',
  'retail',
  'retail',
  '2025-06-04T10:41:45.000Z',
  '2025-06-04T10:41:45.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'dfd32ed2-72ae-4cfa-85d3-72193a4549a9',
  'NHÓM 4',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 4 Hà Nội',
  'retail',
  'retail',
  '2025-06-04T10:41:43.000Z',
  '2025-06-04T10:41:43.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  'fb15c065-fddf-4356-bf8f-83a753263311',
  'NHÓM 2 - THẢO',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 2 Hà Nội',
  'retail',
  'retail',
  '2025-06-04T10:41:41.000Z',
  '2025-06-04T10:41:41.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '76ef9f04-1b0d-41f1-8d2b-f2285162734e',
  'NHÓM 3',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 3 Hà Nội',
  'retail',
  'retail',
  '2025-06-04T10:41:42.000Z',
  '2025-06-04T10:41:42.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '333eddff-e77f-4935-852e-a8ffe5315fb7',
  'NHÓM 3',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 3 Hà Nội',
  'retail',
  'retail',
  '2025-06-11T01:40:47.000Z',
  '2025-06-11T01:40:47.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '41fe4bca-5e7b-43ad-a286-c62375c231b5',
  'NHÓM 1',
  NULL,
  'hcm',
  'Nhóm kinh doanh 1 Hồ Chí Minh',
  'retail',
  'retail',
  '2025-06-11T01:40:49.000Z',
  '2025-06-11T01:40:49.000Z'
);
INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '0b997711-3027-4be6-bba7-9bc0bf598623',
  'NHÓM 2',
  NULL,
  'hanoi',
  'Nhóm kinh doanh 2 Hà Nội',
  'retail',
  'retail',
  '2025-06-11T01:40:46.000Z',
  '2025-06-11T01:40:46.000Z'
);

-- =====================================================
-- BƯỚC 3: INSERT USERS
-- =====================================================

INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'cfd4fc96-062c-4331-830f-dfa87d7f0ef1',
  '0AzCiDnWxcCMzIAwLA9D',
  'Nguyễn Ngọc Việt Khanh',
  'vietkhanh@example.com',
  'team_leader',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:39.000Z',
  '2025-06-04T10:41:39.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'dd95eb7d-b988-48c3-a6eb-144892c0fa0e',
  '1',
  'Khổng Đức Mạnh 123',
  'manh.khong@example.com',
  'undefined',
  NULL,
  'undefined',
  'retail',
  'retail',
  '',
  'active',
  false,
  '123456',
  '2025-06-30T01:23:16.034Z',
  '2025-06-30T01:23:16.034Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '76ui8I1vw3wiJLyvwFjq',
  'Nguyễn Mạnh Linh',
  'manhlinh@example.com',
  'employee',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:35.000Z',
  '2025-06-04T10:41:35.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'fd32f335-a445-47b8-8771-19e040577283',
  '8NpVPLaiLDhv75jZNq5q',
  'Hà Nguyễn Thanh Tuyền',
  'tuyen.ha@example.com',
  'employee',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:38.000Z',
  '2025-06-04T10:41:38.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'ACKzl2RISqrx5ca9QDM6',
  'Phạm Thị Hương',
  'huong.pham@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:37.000Z',
  '2025-06-04T10:41:37.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'fe04c444-00cc-45ec-94d5-dff18fcf7d1d',
  'ERi0hcgzKhWsRKx1Gm26',
  'Phạm Thị Hương',
  'huong.pham@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:39.000Z',
  '2025-06-11T01:40:39.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '56414efe-e5ef-4e4c-9455-527ae7454305',
  'H0ixVALWdoDxWbSOSxBn',
  'Nguyễn Ngọc Việt Khanh',
  'khanh.nguyen@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:36.000Z',
  '2025-06-11T01:40:36.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'MO7N4Trk6mASlHpIcjME',
  'Nguyễn Thị Thảo',
  'thao.nguyen@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  'Nguyenthithao1',
  '2025-06-04T10:41:34.000Z',
  '2025-06-12T08:26:23.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '44e4c64a-7850-4a94-bc07-7d7c8b8bfc00',
  'ObroYv1R4odHRcTGOB8d',
  'Khổng Đức Mạnh',
  'manh.khong@example.com',
  'retail_director',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng phòng kinh doanh bán lẻ',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:33.000Z',
  '2025-06-11T01:40:33.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '0bba7409-504c-41bd-be11-e41779060c51',
  'RIWI0w6ETBPy6AA2Z5hL',
  'Phùng Thị Thuỳ Vân',
  'thuyvan@example.com',
  'employee',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:40.000Z',
  '2025-06-04T10:41:40.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'Ue4vzSj1KDg4vZyXwlHJ',
  'Lương Việt Anh',
  'vietanh@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  'Lva@173366043',
  '2025-06-04T10:41:33.000Z',
  '2025-06-11T04:41:33.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '20705bee-1252-4548-b8b1-5eb93fb12b01',
  'Ve7sGRnMoRvT1E0VL5Ds',
  'Khổng Đức Mạnh',
  'manh.khong@example.com',
  'retail_director',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng phòng kinh doanh bán lẻ',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:32.000Z',
  '2025-06-04T10:41:32.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'ddf02ecd-ad03-4d82-8673-ca79863078ae',
  'XbEKpUCw6OPLiFQWmCCm',
  'Hà Nguyễn Tuyến',
  'tuyen.ha@example.com',
  'employee',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:36.000Z',
  '2025-06-11T01:40:36.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '5f869fd7-5b04-4bdf-b7ce-b5cc89d43fd3',
  'ZIJgzHB2b60qfWyOK0Ko',
  'Trịnh Thị Bốn',
  'bon.trinh@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:38.000Z',
  '2025-06-11T01:40:38.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'e1ff1a85-11fa-4da0-8579-6006c29378d1',
  'aa2tloFwBhe6m05lwypc',
  'Nguyễn Ngọc Việt Khanh',
  'vietkhanh@example.com',
  'team_leader',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:43.000Z',
  '2025-06-11T01:40:43.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'abtSSmK0p0oeOyy5YWGZ',
  'Lê Khánh Duy',
  'khanhduy@example.com',
  'employee',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:33.000Z',
  '2025-06-04T10:41:33.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'e4edc0c0-80a6-42a0-94fe-6a7c1974396a',
  'k030JV0tAobf5rMvdzG4',
  'Trịnh Thị Bốn',
  'bon.trinh@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:36.000Z',
  '2025-06-04T10:41:36.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '9069b7c6-94c9-4237-9970-fd2181a99a0a',
  'oH7an8cvGdI4uwmi7bpZ',
  'Nguyễn Thị Nga',
  'nga.nguyen@example.com',
  'team_leader',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:34.000Z',
  '2025-06-11T01:40:34.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '20bdea44-6912-4e8c-a8d6-1e479ee40378',
  'pGahEQwrJN8aIpEdRnBY',
  'Hà Nguyễn Thanh Tuyền',
  'tuyen.ha@example.com',
  'employee',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:42.000Z',
  '2025-06-11T01:40:42.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '1ac26d9b-269f-4e58-a4de-fd006f8d5ab1',
  'pzSa30JeZR0UoOoKhZ7l',
  'Nguyễn Thị Nga',
  'nga.nguyen@example.com',
  'team_leader',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-04T10:41:37.000Z',
  '2025-06-04T10:41:37.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'ee043984-5217-429a-b2b0-ddf36e0cc110',
  'qgM8ogYQwu0T5zJUesfn',
  'Quản Thu Hà',
  'thuha@example.com',
  'employee',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Nhân viên sale',
  'active',
  true,
  '123456',
  '2025-06-09T00:10:43.000Z',
  '2025-06-09T00:10:43.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '82ed4b02-357e-41eb-80cb-763a2dc3a0d2',
  'tacjOehkubNmOvgnmvOo',
  'Phùng Thị Thuỳ Vân',
  'thuyvan@example.com',
  'employee',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:44.000Z',
  '2025-06-11T01:40:44.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  'e8bf01a3-a6c1-4d95-8755-c17b6d573c6e',
  'xpKkMvhRi7nfT8v81pUr',
  'Phùng Thị Thuỳ Vân',
  'thuyvan@example.com',
  'employee',
  NULL,
  'hanoi',
  'retail',
  'retail',
  'Nhân viên',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:37.000Z',
  '2025-06-11T01:40:37.000Z'
);
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '25ed19d9-5fcb-4c32-8dae-070d78dc6ee6',
  'zdORDsodkjHvQjDwbIEX',
  'Nguyễn Thị Nga',
  'nga.nguyen@example.com',
  'team_leader',
  NULL,
  'hcm',
  'retail',
  'retail',
  'Trưởng nhóm',
  'active',
  true,
  '123456',
  '2025-06-11T01:40:41.000Z',
  '2025-06-11T01:40:41.000Z'
);

-- =====================================================
-- BƯỚC 4: INSERT TASKS (QUAN TRỌNG NHẤT)
-- =====================================================

INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '38494270-02d0-46b7-b712-64f1319a6149',
  '1Cmy7q130b6WDe7oLtCj',
  'KH-CT ANH THÁI CHỊ TUYẾN OCEANPARK',
  'Khách hàng anh Thái chị Tuyến tại Oceanpark',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '6517793c-af22-4352-af95-bb2f497ac35b',
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'Phạm Thị Hương',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:52.000Z',
  '2025-06-14T03:46:52.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '5e01f603-92fa-4416-ab7a-cec66069b9ba',
  '77YpiEq4Z214uUACf4OP',
  'KTS-CHỊ DUYÊN THIẾT KẾ A+',
  'Kiến trúc sư chị Duyên thiết kế A+',
  'partner_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '6517793c-af22-4352-af95-bb2f497ac35b',
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'Phạm Thị Hương',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:56.000Z',
  '2025-06-14T03:46:56.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '4bc0781b-c2d7-42df-97bd-0b5ea97e63f9',
  'CO2RpR1Iad9A5qHtorTv',
  'KH-CT CHỊ LINH-QUẢNG AN',
  'Liên hệ khách hàng chị Linh tại Quảng An',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '6517793c-af22-4352-af95-bb2f497ac35b',
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'Phạm Thị Hương',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:44.000Z',
  '2025-06-14T03:46:44.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '60609eaa-b62d-43dd-8fae-b9a00f3bfb5a',
  'MXX7bbsj1o6pib5gMbxp',
  'Gặp kh chị Linh, chị Dung Hải Phòng',
  'Gặp khách hàng chị Linh và chị Dung tại Hải Phòng',
  'customer_meeting',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'Lương Việt Anh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:55.000Z',
  '2025-06-14T03:46:55.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '1d37002d-e339-40df-8bcc-6100d1c88179',
  'MhwpUWDOlGQl1XwkzaHG',
  'Kết nối bên thiết kế Sunjinvietnam',
  'Kết nối với đội ngũ thiết kế Sunjinvietnam',
  'partner_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:54.000Z',
  '2025-06-14T03:46:54.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'c021c411-b1e0-4c38-b42d-1bed725a348a',
  'NwLiryRALfFZdbTvJfVm',
  'Liên hệ chị Trang - Vinhome',
  'Liên hệ chị Trang tại Vinhome',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:47:00.000Z',
  '2025-06-14T03:47:00.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '7aecda3b-2771-46ba-b524-41fa3998d943',
  'OnNJfKTT9aDfqxdWU6yM',
  'Gặp a Mẫn M+',
  'Gặp anh Mẫn tại M+',
  'partner_meeting',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'Lương Việt Anh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:59.000Z',
  '2025-06-14T03:46:59.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '09d8657b-88e5-45b2-883e-34c840211b5e',
  'Qq64Iz2dmwu0KS0tlklE',
  'Chị Hà Hải Phòng',
  'Liên hệ chị Hà tại Hải Phòng',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'Nguyễn Thị Thảo',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:47:01.000Z',
  '2025-06-14T03:47:01.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'ab5fe710-eed6-4334-afe4-879d12f52bd2',
  'RsVVYDOTAvSAETnQqE6M',
  'Hỗ trợ nhân viên nhóm',
  'Hỗ trợ và training nhân viên trong nhóm',
  'training',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'Nguyễn Thị Thảo',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:47:02.000Z',
  '2025-06-14T03:47:02.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'cff8d1a8-9b45-4f22-b4f5-f3d8c765973b',
  'Rzma3vUrzc3BpmhWcNXu',
  'Học AI về SP Hunter',
  'Học về AI và ứng dụng SP Hunter',
  'training',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:48.000Z',
  '2025-06-14T03:46:48.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '5e6e21e3-6b08-410f-896f-8faafc37d3e6',
  'S4etVkkgrVNFhztteRfk',
  'KH A Nga- Chị Hải',
  'Khách hàng anh Nga và chị Hải',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:54.000Z',
  '2025-06-14T03:46:54.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '383c7e7a-31a7-41d4-b559-6c387cea2f26',
  'SPXyCBF9TskP3xt9v75w',
  'ĐT - CHỊ HƯƠNG TBVS VÀ CHỊ DIỆP CỬA NHÔM',
  'Điện thoại liên hệ chị Hương TBVS và chị Diệp về cửa nhôm',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:47.000Z',
  '2025-06-14T03:46:47.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'cefe2746-76d6-4e63-b8e8-2b48b26be2bb',
  'T5nCKWjSyiu2QAvnbBG7',
  'ĐÀO TẠO AI',
  'Tham gia khóa đào tạo về AI và ứng dụng trong công việc',
  'training',
  '2025-06-14',
  '09:00',
  'todo',
  'high',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:46.000Z',
  '2025-06-14T03:46:46.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '4da115f6-8983-420b-91c0-33cf41f46c47',
  'Xvi1QWjt65zIThK87Ids',
  'Đi ctrinh a Long, a Quang, a Hưng ở Thanh Hoá cùng nhóm đối tác',
  'Công tác tại Thanh Hoá cùng đối tác',
  'business_trip',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'Lương Việt Anh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:47.000Z',
  '2025-06-14T03:46:47.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '6755ca60-88ba-4b3a-b6b4-a6b6d53c0235',
  'YuHD8yKUl5ArVx3zZFL0',
  'KH- CHỊ HẰNG - ROYAL',
  'Khách hàng chị Hằng tại Royal',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:51.000Z',
  '2025-06-14T03:46:51.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '7e818e69-1c54-4f78-a850-8ac0158e12a5',
  'dT15xwxXLLbPIE2etGwb',
  'KH C Nhung Lưu',
  'Khách hàng cô Nhung Lưu',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:57.000Z',
  '2025-06-14T03:46:57.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '4bae54fe-72b5-4ea2-b67d-97e051fab8e2',
  'dvi8WrUJKl7CMPANA0IH',
  'Kh Chị Thủy- Mỹ Đình',
  'Khách hàng chị Thủy tại Mỹ Đình',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:58.000Z',
  '2025-06-14T03:46:58.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '6423e1ab-1e67-45ee-b5d1-f995c9a8e8f7',
  'dwXCVQMA72C5vN3ih7Kh',
  'ĐT- Gặp mặt',
  'Điện thoại sắp xếp cuộc gặp mặt',
  'meeting',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:48.000Z',
  '2025-06-14T03:46:48.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'e739045d-d0f4-4310-9f28-faec412074b8',
  'h4P1sl3TEYurrdEWYoxp',
  'Liên Hệ với chị Phương-Vihome',
  'Liên hệ chị Phương tại Vihome',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'Nguyễn Thị Thảo',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:50.000Z',
  '2025-06-14T03:46:50.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '2c9f160f-46b5-4ff5-83ea-25ea96b5f101',
  'iIsQn1Ia0XvUX7n2ClLJ',
  'ĐT - EM VIỆT THANG MÁY OTIS',
  'Điện thoại liên hệ em Việt về thang máy OTIS',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:49.000Z',
  '2025-06-14T03:46:49.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'e2bfdbc9-ca7b-47a4-82fe-58eda2c5915a',
  'jMghvvdCoafPc4acC9NY',
  'KH Chị Hà- Dương Nội',
  'Khách hàng chị Hà tại Dương Nội',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:51.000Z',
  '2025-06-14T03:46:51.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '76c0588e-923b-4a10-a0b2-2dfa2c9aa87a',
  'jSIrpKYXzTv4pfbbNdaM',
  'Liên hệ KTS Hiếu THHOME',
  'Liên hệ kiến trúc sư Hiếu tại THHOME',
  'partner_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:45.000Z',
  '2025-06-14T03:46:45.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '6787d124-56ff-425c-8a0e-d014863fb150',
  'lYzlqBzUPkvoUsPyYriq',
  'Xử lý đơn hàng Someser',
  'Xử lý và theo dõi đơn hàng của khách hàng Someser',
  'order_processing',
  '2025-06-14',
  '09:00',
  'in-progress',
  'high',
  0,
  false,
  'hanoi',
  NULL,
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'Nguyễn Thị Thảo',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:45.000Z',
  '2025-06-14T03:46:45.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '3b63fca1-2cb9-45ce-ae16-43feb532a385',
  'ljS2MSYQM9yiZSuFdWfj',
  'Tham gia hội thảo Đệm Xinh',
  'Tham gia hội thảo của Đệm Xinh',
  'training',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'c1d20de4-913d-4dd6-a58c-424037b313f3',
  'Lương Việt Anh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:59.000Z',
  '2025-06-14T03:46:59.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'a6cd79f4-255a-4330-953a-905c8f24c3f8',
  'mU0RgmqwwyLj4d5tE2V9',
  'ĐT - EM MẠNH EVERYGOLF',
  'Điện thoại liên hệ em Mạnh tại Everygolf',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:52.000Z',
  '2025-06-14T03:46:52.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '7128feaf-4bf9-4bca-949f-171f4e1d84d8',
  'mhDCRvK8QR7dQi69auVF',
  'KH Minh- NTT',
  'Khách hàng Minh tại NTT',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  '0330648f-e511-4fd4-9096-27ee3a990b77',
  'Lê Khánh Duy',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:47:01.000Z',
  '2025-06-14T03:47:01.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'b6d58fcc-fa6a-4722-af6e-aeea4aa4a56f',
  'rc7kn6hvT0GDHi1sjChK',
  'Báo giá chị Hiền Khai Sơn',
  'Lập báo giá cho chị Hiền tại Khai Sơn',
  'quote_new',
  '2025-06-14',
  '09:00',
  'todo',
  'high',
  0,
  false,
  'hanoi',
  NULL,
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'ec551985-fe7d-4d71-8741-738b85cdb46f',
  'Nguyễn Thị Thảo',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:56.000Z',
  '2025-06-14T03:46:56.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '580e4a6e-9480-433d-8b18-4462332e7c36',
  'vZgCW0D5dMxkk3lqN892',
  'KH-CT ANH TIẾN-XUÂN PHƯƠNG',
  'Liên hệ khách hàng anh Tiến tại Xuân Phương',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '6517793c-af22-4352-af95-bb2f497ac35b',
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'Phạm Thị Hương',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:50.000Z',
  '2025-06-14T03:46:50.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  'bfbcc278-6f79-4af7-9e7e-00f2b75a39a3',
  'xVtccyVoJ1g4imEpRx3F',
  'ĐT - CHỊ HUYỀN NỘI THẤT NORDIC',
  'Điện thoại chị Huyền về nội thất Nordic',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:53.000Z',
  '2025-06-14T03:46:53.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '9327d565-d246-4033-9a0c-d45a50c2c94a',
  'xnA2cUEQYKA2I9bNvk3P',
  'KH-CT CHỊ THẢO-SOMMERSET',
  'Khách hàng chị Thảo tại Somerset',
  'customer_contact',
  '2025-06-14',
  '09:00',
  'todo',
  'normal',
  0,
  false,
  'hanoi',
  NULL,
  '6517793c-af22-4352-af95-bb2f497ac35b',
  '6517793c-af22-4352-af95-bb2f497ac35b',
  'Phạm Thị Hương',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:55.000Z',
  '2025-06-14T03:46:55.000Z'
);
INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '96438035-4bd4-4945-994b-6cdbfd0cc137',
  'yhfzz3ymQxoFNoZX1wRo',
  'Lên đơn cắt nhà anh Dương Lò Đúc',
  'Lập đơn cắt nhà cho anh Dương tại Lò Đúc',
  'order_processing',
  '2025-06-14',
  '09:00',
  'todo',
  'high',
  0,
  false,
  'hanoi',
  NULL,
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  '303dc46c-1aea-4721-a7cb-58d1898b8205',
  'Nguyễn Mạnh Linh',
  'personal',
  ARRAY[]::UUID[],
  false,
  '2025-06-14T03:46:58.000Z',
  '2025-06-14T03:46:58.000Z'
);

-- =====================================================
-- BƯỚC 5: VERIFY DATA INTEGRITY
-- =====================================================

-- Kiểm tra số lượng records
SELECT 'Teams imported:' as info, COUNT(*) as count FROM teams;
SELECT 'Users imported:' as info, COUNT(*) as count FROM users;
SELECT 'Tasks imported:' as info, COUNT(*) as count FROM tasks;

-- Kiểm tra relationships
SELECT 'Tasks with valid users:' as info, COUNT(*) as count 
FROM tasks t 
JOIN users u ON t.user_id = u.id;

SELECT 'Tasks with valid teams:' as info, COUNT(*) as count 
FROM tasks t 
JOIN teams tm ON t.team_id = tm.id;

-- Kiểm tra assigned tasks
SELECT 'Tasks with assignments:' as info, COUNT(*) as count 
FROM tasks 
WHERE assigned_to IS NOT NULL;

-- =====================================================
-- BƯỚC 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes cho tasks table (quan trọng cho performance)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(location);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Indexes cho users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_id ON users(firebase_id);

-- Indexes cho teams table
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_department ON teams(department);

-- =====================================================
-- BƯỚC 7: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS cho tất cả tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho tasks (quan trọng cho security)
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (user_id = auth.uid()::text OR assigned_to = auth.uid()::text);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid()::text OR assigned_to = auth.uid()::text);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (user_id = auth.uid()::text);

-- RLS Policies cho users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid()::text);

-- RLS Policies cho teams
CREATE POLICY "Users can view all teams" ON teams FOR SELECT USING (true);

-- =====================================================
-- BƯỚC 8: FINAL VERIFICATION
-- =====================================================

-- Tổng kết migration
SELECT 
  'MIGRATION SUMMARY' as status,
  (SELECT COUNT(*) FROM teams) as teams_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM tasks) as tasks_count,
  NOW() as completed_at;

-- Kiểm tra tasks theo user
SELECT 
  u.name as user_name,
  COUNT(t.id) as task_count,
  COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_count,
  COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_count
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name
ORDER BY task_count DESC;

-- Migration hoàn thành thành công!
SELECT '🎉 TASKS MIGRATION COMPLETED SUCCESSFULLY! 🎉' as final_status;
