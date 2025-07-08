-- Fix Supabase schema for tasks table
-- Ninh ơi - Thêm các columns thiếu để task creation hoạt động

-- Add missing columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assignedTo TEXT,
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS team_id TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS deadline TEXT,
ADD COLUMN IF NOT EXISTS time TEXT,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_shared_with_team BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS types TEXT[],
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS shared_with TEXT[],
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update existing records to have default values
UPDATE tasks 
SET 
  visibility = COALESCE(visibility, 'personal'),
  progress = COALESCE(progress, 0),
  is_new = COALESCE(is_new, true),
  is_shared = COALESCE(is_shared, false),
  is_shared_with_team = COALESCE(is_shared_with_team, false)
WHERE visibility IS NULL 
   OR progress IS NULL 
   OR is_new IS NULL 
   OR is_shared IS NULL 
   OR is_shared_with_team IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON tasks(visibility);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
