-- Add password column to users table in Supabase
-- This script adds password storage capability to sync with local authentication

-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password for all existing users
UPDATE users 
SET password = '123456' 
WHERE password IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN users.password IS 'User password - synced with local authentication system';

-- Create index for password queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('password', 'password_changed')
ORDER BY column_name;

-- Show sample of updated users
SELECT 
    id, 
    name, 
    email, 
    password, 
    password_changed,
    updated_at
FROM users 
LIMIT 5;
