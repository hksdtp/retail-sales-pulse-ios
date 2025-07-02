-- Cleanup script for Supabase
-- Run this first if you get policy conflicts

-- Drop all existing policies
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams are editable by team leaders and directors" ON teams;
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Directors can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view tasks assigned to them or their team" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
DROP POLICY IF EXISTS "Allow all access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all access to users" ON users;
DROP POLICY IF EXISTS "Allow all access to teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;

-- Drop existing tables if needed (CAREFUL - this will delete all data)
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop storage bucket
DELETE FROM storage.buckets WHERE id = 'files';

-- Reset RLS
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;

-- Clear all data (optional - uncomment if needed)
-- TRUNCATE TABLE tasks CASCADE;
-- TRUNCATE TABLE users CASCADE;
-- TRUNCATE TABLE teams CASCADE;

SELECT 'Cleanup completed successfully' as status;
