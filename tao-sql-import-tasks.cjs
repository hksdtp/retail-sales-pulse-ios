#!/usr/bin/env node

/**
 * Script tạo SQL import cho tasks vào Supabase
 * Tạo file SQL hoàn chỉnh để import tất cả dữ liệu
 */

const fs = require('fs');

console.log('📝 TẠO SQL SCRIPT IMPORT TASKS VÀO SUPABASE');
console.log('='.repeat(80));

try {
  // Đọc dữ liệu đã chuyển đổi
  const dataPath = './supabase-data-converted.json';
  if (!fs.existsSync(dataPath)) {
    console.log('❌ Không tìm thấy file dữ liệu đã chuyển đổi:', dataPath);
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const { teams, users, tasks } = data;
  
  console.log('📊 Dữ liệu để import:');
  console.log(`   - Teams: ${teams.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Tasks: ${tasks.length}`);
  
  // Tạo SQL script
  let sqlScript = `-- SQL Script Import Tasks Migration từ Firebase sang Supabase
-- Ngày tạo: ${new Date().toLocaleString('vi-VN')}
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

`;

  // Insert Teams
  console.log('📋 Tạo SQL cho Teams...');
  teams.forEach((team, index) => {
    sqlScript += `INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '${team.id}',
  '${team.name.replace(/'/g, "''")}',
  ${team.leader_id ? `'${team.leader_id}'` : 'NULL'},
  '${team.location}',
  '${(team.description || '').replace(/'/g, "''")}',
  '${team.department}',
  '${team.department_type}',
  '${team.created_at}',
  '${team.updated_at}'
);
`;
  });

  sqlScript += `
-- =====================================================
-- BƯỚC 3: INSERT USERS
-- =====================================================

`;

  // Insert Users
  console.log('📋 Tạo SQL cho Users...');
  users.forEach((user, index) => {
    sqlScript += `INSERT INTO users (id, firebase_id, name, email, role, team_id, location, department, department_type, position, status, password_changed, temp_password, created_at, updated_at) VALUES (
  '${user.id}',
  '${user.firebase_id}',
  '${user.name.replace(/'/g, "''")}',
  '${user.email}',
  '${user.role}',
  ${user.team_id ? `'${user.team_id}'` : 'NULL'},
  '${user.location}',
  '${user.department}',
  '${user.department_type}',
  '${(user.position || '').replace(/'/g, "''")}',
  '${user.status}',
  ${user.password_changed},
  '${user.temp_password}',
  '${user.created_at}',
  '${user.updated_at}'
);
`;
  });

  sqlScript += `
-- =====================================================
-- BƯỚC 4: INSERT TASKS (QUAN TRỌNG NHẤT)
-- =====================================================

`;

  // Insert Tasks
  console.log('📋 Tạo SQL cho Tasks...');
  tasks.forEach((task, index) => {
    // Xử lý shared_with array
    const sharedWithArray = task.shared_with && task.shared_with.length > 0 
      ? `ARRAY[${task.shared_with.map(id => `'${id}'`).join(', ')}]`
      : 'ARRAY[]::UUID[]';
    
    sqlScript += `INSERT INTO tasks (
  id, firebase_id, title, description, type, date, time, status, priority, progress, 
  is_new, location, team_id, assigned_to, user_id, user_name, visibility, 
  shared_with, is_shared, created_at, updated_at
) VALUES (
  '${task.id}',
  '${task.firebase_id}',
  '${task.title.replace(/'/g, "''")}',
  '${(task.description || '').replace(/'/g, "''")}',
  '${task.type}',
  '${task.date}',
  '${task.time || ''}',
  '${task.status}',
  '${task.priority}',
  ${task.progress},
  ${task.is_new},
  '${task.location}',
  ${task.team_id ? `'${task.team_id}'` : 'NULL'},
  ${task.assigned_to ? `'${task.assigned_to}'` : 'NULL'},
  '${task.user_id}',
  '${(task.user_name || '').replace(/'/g, "''")}',
  '${task.visibility}',
  ${sharedWithArray},
  ${task.is_shared},
  '${task.created_at}',
  '${task.updated_at}'
);
`;
  });

  sqlScript += `
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
`;

  // Lưu SQL script
  const sqlFilePath = './supabase-tasks-migration.sql';
  fs.writeFileSync(sqlFilePath, sqlScript);
  
  console.log('\n✅ Đã tạo SQL script thành công!');
  console.log(`📁 File: ${sqlFilePath}`);
  console.log(`📊 Kích thước: ${Math.round(fs.statSync(sqlFilePath).size / 1024)} KB`);
  
  // Tạo summary
  console.log('\n📋 SUMMARY SQL SCRIPT:');
  console.log(`   - ${teams.length} teams sẽ được import`);
  console.log(`   - ${users.length} users sẽ được import`);
  console.log(`   - ${tasks.length} tasks sẽ được import`);
  console.log(`   - Indexes được tạo cho performance`);
  console.log(`   - RLS policies được thiết lập cho security`);
  console.log(`   - Data integrity checks được bao gồm`);
  
  // Tạo quick import script
  const quickImportScript = `#!/bin/bash

# Quick Import Script cho Supabase Tasks Migration
# Chạy script này để import nhanh vào Supabase

echo "🚀 STARTING SUPABASE TASKS MIGRATION..."
echo "========================================"

# Kiểm tra file SQL
if [ ! -f "supabase-tasks-migration.sql" ]; then
    echo "❌ Không tìm thấy file supabase-tasks-migration.sql"
    exit 1
fi

echo "📁 File SQL found: supabase-tasks-migration.sql"
echo "📊 File size: $(du -h supabase-tasks-migration.sql | cut -f1)"

echo ""
echo "🔧 HƯỚNG DẪN IMPORT VÀO SUPABASE:"
echo "1. Mở Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Chọn project: fnakxavwxubnbucfoujd"
echo "3. Vào SQL Editor"
echo "4. Copy nội dung file supabase-tasks-migration.sql"
echo "5. Paste vào SQL Editor và click Run"
echo ""
echo "📋 EXPECTED RESULTS:"
echo "   - 12 teams imported"
echo "   - 24 users imported"
echo "   - 31 tasks imported"
echo "   - Indexes created"
echo "   - RLS policies enabled"
echo ""
echo "✅ Ready for import!"
`;

  fs.writeFileSync('./quick-import-tasks.sh', quickImportScript);
  fs.chmodSync('./quick-import-tasks.sh', '755');
  
  console.log('\n📁 Đã tạo thêm script hỗ trợ:');
  console.log('   - quick-import-tasks.sh (hướng dẫn import)');
  
} catch (error) {
  console.error('❌ LỖI:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(80));
console.log('🏁 TẠO SQL SCRIPT HOÀN THÀNH');
console.log('='.repeat(80));
