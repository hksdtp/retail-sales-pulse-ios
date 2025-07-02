-- Supabase Database Schema for Retail Sales Pulse
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    leader_id TEXT,
    location TEXT,
    description TEXT,
    department TEXT,
    department_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT NOT NULL CHECK (role IN ('retail_director', 'team_leader', 'employee')),
    team_id TEXT REFERENCES teams(id),
    location TEXT,
    department TEXT,
    department_type TEXT,
    position TEXT,
    status TEXT DEFAULT 'active',
    password_changed BOOLEAN DEFAULT false,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type TEXT DEFAULT 'general',
    assigned_to TEXT REFERENCES users(id),
    created_by TEXT REFERENCES users(id),
    team_id TEXT REFERENCES teams(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (with DROP IF EXISTS to avoid conflicts)

-- Teams policies
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
CREATE POLICY "Teams are viewable by authenticated users" ON teams
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teams are editable by team leaders and directors" ON teams;
CREATE POLICY "Teams are editable by team leaders and directors" ON teams
    FOR ALL USING (
        auth.uid()::text IN (
            SELECT id FROM users
            WHERE role IN ('retail_director', 'team_leader')
        )
    );

-- Users policies
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
CREATE POLICY "Users are viewable by authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Directors can manage all users" ON users;
CREATE POLICY "Directors can manage all users" ON users
    FOR ALL USING (
        auth.uid()::text IN (
            SELECT id FROM users WHERE role = 'retail_director'
        )
    );

-- Tasks policies
DROP POLICY IF EXISTS "Users can view tasks assigned to them or their team" ON tasks;
CREATE POLICY "Users can view tasks assigned to them or their team" ON tasks
    FOR SELECT USING (
        auth.uid()::text = assigned_to OR
        auth.uid()::text = created_by OR
        auth.uid()::text IN (
            SELECT id FROM users
            WHERE team_id = tasks.team_id OR role = 'retail_director'
        )
    );

DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid()::text = created_by);

DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
CREATE POLICY "Users can update tasks they created or are assigned to" ON tasks
    FOR UPDATE USING (
        auth.uid()::text = assigned_to OR
        auth.uid()::text = created_by OR
        auth.uid()::text IN (
            SELECT id FROM users
            WHERE role IN ('retail_director', 'team_leader')
        )
    );

-- Allow all access for development (temporary)
DROP POLICY IF EXISTS "Allow all access to tasks" ON tasks;
CREATE POLICY "Allow all access to tasks" ON tasks
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to users" ON users;
CREATE POLICY "Allow all access to users" ON users
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to teams" ON teams;
CREATE POLICY "Allow all access to teams" ON teams
    FOR ALL USING (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
CREATE POLICY "Authenticated users can view files" ON storage.objects
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
