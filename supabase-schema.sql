-- =====================================================
-- SUPABASE SCHEMA FOR RETAIL SALES PULSE iOS
-- Migration from Firebase Firestore to Supabase PostgreSQL
-- Date: 2025-06-29
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID, -- Will reference users(id) after users table is created
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  description TEXT,
  department TEXT DEFAULT 'retail',
  department_type TEXT DEFAULT 'retail',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_id TEXT UNIQUE, -- Store original Firebase ID for migration
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('retail_director', 'team_leader', 'member')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  department TEXT DEFAULT 'retail',
  department_type TEXT DEFAULT 'retail',
  position TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  password_changed BOOLEAN DEFAULT false,
  -- Store password temporarily for migration (will be removed after Supabase Auth setup)
  temp_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_id TEXT UNIQUE, -- Store original Firebase ID for migration
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'partner_new', 'partner_old', 'architect_new', 'architect_old',
    'client_new', 'client_old', 'quote_new', 'quote_old', 'other'
  )),
  date DATE NOT NULL,
  time TEXT, -- Store time separately as text
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'on-hold', 'completed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_new BOOLEAN DEFAULT true,
  location TEXT CHECK (location IN ('hanoi', 'hcm')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT, -- Denormalized for performance
  visibility TEXT DEFAULT 'personal' CHECK (visibility IN ('personal', 'team', 'public')),
  shared_with UUID[], -- Array of user IDs
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign key constraint for teams.leader_id after users table exists
ALTER TABLE teams 
ADD CONSTRAINT fk_teams_leader 
FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_firebase_id ON users(firebase_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(location);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_firebase_id ON tasks(firebase_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_teams_location ON teams(location);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_team_date ON tasks(team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_date ON tasks(status, date DESC);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Teams policies  
CREATE POLICY "Users can view all teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Team leaders can update their team" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.id = teams.leader_id
    )
  );

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    assigned_to::text = auth.uid()::text OR
    visibility = 'public' OR
    (visibility = 'team' AND team_id IN (
      SELECT team_id FROM users WHERE id::text = auth.uid()::text
    )) OR
    auth.uid()::text = ANY(shared_with::text[])
  );

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (
    user_id::text = auth.uid()::text OR
    assigned_to::text = auth.uid()::text
  );

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for tasks with user and team information
CREATE OR REPLACE VIEW tasks_with_details AS
SELECT 
  t.*,
  u.name as user_name,
  u.email as user_email,
  u.role as user_role,
  tm.name as team_name,
  tm.location as team_location,
  au.name as assigned_user_name,
  au.email as assigned_user_email
FROM tasks t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN teams tm ON t.team_id = tm.id
LEFT JOIN users au ON t.assigned_to = au.id;

-- View for team statistics
CREATE OR REPLACE VIEW team_stats AS
SELECT 
  t.id,
  t.name,
  t.location,
  COUNT(u.id) as member_count,
  COUNT(CASE WHEN tk.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN tk.status = 'in-progress' THEN 1 END) as in_progress_tasks,
  COUNT(CASE WHEN tk.status = 'todo' THEN 1 END) as todo_tasks
FROM teams t
LEFT JOIN users u ON t.id = u.team_id
LEFT JOIN tasks tk ON t.id = tk.team_id
GROUP BY t.id, t.name, t.location;

-- =====================================================
-- 9. FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to get user tasks with filters
CREATE OR REPLACE FUNCTION get_user_tasks(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  date DATE,
  status TEXT,
  priority TEXT,
  progress INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.title, t.description, t.type, t.date, 
    t.status, t.priority, t.progress, t.created_at, t.updated_at
  FROM tasks t
  WHERE 
    (t.user_id = p_user_id OR t.assigned_to = p_user_id)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_date_from IS NULL OR t.date >= p_date_from)
    AND (p_date_to IS NULL OR t.date <= p_date_to)
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample team (will be replaced by migration data)
INSERT INTO teams (id, name, location, description) VALUES 
('00000000-0000-0000-0000-000000000001', 'Sample Team', 'hanoi', 'Sample team for testing')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user (will be replaced by migration data)
INSERT INTO users (id, firebase_id, name, email, role, team_id, location, position) VALUES 
('00000000-0000-0000-0000-000000000001', '1b', 'Khổng Đức Mạnh', 'manh.khong@example.com', 'retail_director', '00000000-0000-0000-0000-000000000001', 'hanoi', 'Trưởng phòng')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
