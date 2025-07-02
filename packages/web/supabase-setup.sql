-- =====================================================
-- SUPABASE DATABASE SETUP FOR RETAIL SALES PULSE
-- =====================================================

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  type TEXT NOT NULL CHECK (type IN ('work', 'meeting', 'call', 'personal', 'other')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'on-hold', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  location TEXT,
  team_id TEXT,
  assigned_to TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT,
  is_new BOOLEAN DEFAULT true,
  is_shared BOOLEAN DEFAULT false,
  is_shared_with_team BOOLEAN DEFAULT false,
  extra_assignees TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'team_leader', 'retail_director', 'project_director', 'admin')),
  team_id TEXT,
  department_type TEXT CHECK (department_type IN ('retail', 'project', 'admin')),
  location TEXT,
  password_changed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_type TEXT CHECK (department_type IN ('retail', 'project', 'admin')),
  leader_id TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_teams_department_type ON teams(department_type);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Tasks policies (temporarily disable RLS for easier setup)
-- Note: For now, allow all operations to simplify initial setup
-- TODO: Implement proper RLS after authentication is set up

-- Temporarily allow all access to tasks
CREATE POLICY "Allow all access to tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Users policies (temporarily allow all access)
CREATE POLICY "Allow all access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Teams policies (temporarily allow all access)
CREATE POLICY "Allow all access to teams" ON teams
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL EMPLOYEE DATA - AS PROVIDED BY USER
-- =====================================================

-- Insert real users data (as provided by user - not fake data)
INSERT INTO users (id, name, email, role, team_id, department_type, location, password_changed) VALUES
('Ve7sGRnMoRvT1E0VL5Ds', 'Khổng Đức Mạnh', 'manh.khong@example.com', 'retail_director', '0', 'retail', 'Toàn quốc', true),
('Ue4vzSj1KDg4vZyXwlHJ', 'Lương Việt Anh', 'vietanh@example.com', 'team_leader', '1', 'retail', 'Hà Nội', true),
('abtSSmK0p0oeOyy5YWGZ', 'Lê Khánh Duy', 'khanhduy@example.com', 'employee', '1', 'retail', 'Hà Nội', true),
('pham_thi_huong_id', 'Phạm Thị Hương', 'huong.pham@example.com', 'team_leader', '5', 'retail', 'Hà Nội', true),
('qgM8ogYQwu0T5zJUesfn', 'Quản Thu Hà', 'thuha@example.com', 'employee', '1', 'retail', 'Hà Nội', true),
('MO7N4Trk6mASlHpIcjME', 'Nguyễn Thị Thảo', 'thao.nguyen@example.com', 'team_leader', '2', 'retail', 'Hà Nội', true),
('trinh_thi_bon_id', 'Trịnh Thị Bốn', 'bon.trinh@example.com', 'team_leader', '3', 'retail', 'Hà Nội', true),
('nguyen_thi_nga_id', 'Nguyễn Thị Nga', 'nga.nguyen@example.com', 'team_leader', '6', 'retail', 'Hồ Chí Minh', true),
('nguyen_ngoc_viet_khanh_id', 'Nguyễn Ngọc Việt Khanh', 'vietkhanh@example.com', 'team_leader', '7', 'retail', 'Hồ Chí Minh', true),
('phung_thi_thuy_van_id', 'Phùng Thị Thuỳ Vân', 'thuyvan@example.com', 'employee', '7', 'retail', 'Hồ Chí Minh', true)
ON CONFLICT (id) DO NOTHING;

-- Insert real teams data (as provided by user - not fake data)
INSERT INTO teams (id, name, department_type, leader_id, location) VALUES
('1', 'NHÓM 1', 'retail', 'Ue4vzSj1KDg4vZyXwlHJ', 'Hà Nội'),
('2', 'NHÓM 2', 'retail', 'MO7N4Trk6mASlHpIcjME', 'Hà Nội'),
('3', 'NHÓM 3', 'retail', 'trinh_thi_bon_id', 'Hà Nội'),
('5', 'NHÓM 4', 'retail', 'pham_thi_huong_id', 'Hà Nội'),
('6', 'NHÓM 1 HCM', 'retail', 'nguyen_thi_nga_id', 'Hồ Chí Minh'),
('7', 'NHÓM 2 HCM', 'retail', 'nguyen_ngoc_viet_khanh_id', 'Hồ Chí Minh')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for tasks with user and team information
CREATE OR REPLACE VIEW tasks_with_details AS
SELECT 
  t.*,
  u.name as assigned_user_name,
  u.email as assigned_user_email,
  u.role as assigned_user_role,
  tm.name as team_name,
  tm.department_type as team_department
FROM tasks t
LEFT JOIN users u ON t.assigned_to = u.id
LEFT JOIN teams tm ON t.team_id = tm.id;

-- View for user statistics
CREATE OR REPLACE VIEW user_task_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.team_id,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) as in_progress_tasks,
  COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_tasks
FROM users u
LEFT JOIN tasks t ON (u.id = t.user_id OR u.id = t.assigned_to)
GROUP BY u.id, u.name, u.email, u.role, u.team_id;
