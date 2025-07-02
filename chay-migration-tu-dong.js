#!/usr/bin/env node

/**
 * Script Migration Tự Động từ Firebase sang Supabase
 * Dự án: retail-sales-pulse-ios
 * Ngày: 2025-06-29
 */

import fs from 'fs';
import path from 'path';

// Cấu hình Supabase
const SUPABASE_CONFIG = {
  url: 'https://fnakxavwxubnbucfoujd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI4NzQsImV4cCI6MjA1MTA0ODg3NH0.VGvp7zOmOdJOKOhJOqOqOqOqOqOqOqOqOqOqOqOqOqO'
};

// Đường dẫn file dữ liệu Firebase
const FIREBASE_DATA_PATH = './packages/web/scripts/firebase-data-export.json';

/**
 * Hàm ghi log với timestamp và emoji
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleString('vi-VN');
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    start: '🚀',
    finish: '🎉'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Tạo UUID ngẫu nhiên
 */
function taoUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Chuyển đổi Firebase timestamp sang ISO string
 */
function chuyenDoiTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Đọc dữ liệu Firebase từ file export
 */
function docDuLieuFirebase() {
  try {
    log('Đang đọc dữ liệu Firebase từ file export...', 'info');
    
    if (!fs.existsSync(FIREBASE_DATA_PATH)) {
      throw new Error(`Không tìm thấy file dữ liệu Firebase: ${FIREBASE_DATA_PATH}`);
    }
    
    const duLieuTho = fs.readFileSync(FIREBASE_DATA_PATH, 'utf8');
    const duLieu = JSON.parse(duLieuTho);
    
    log(`Đã đọc thành công: ${duLieu.summary?.total_tasks || 0} công việc, ${duLieu.summary?.total_users || 0} người dùng, ${duLieu.summary?.total_teams || 0} nhóm`, 'success');
    
    return duLieu;
  } catch (error) {
    log(`Lỗi khi đọc dữ liệu Firebase: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Tạo mapping ID từ Firebase sang Supabase
 */
function taoMappingID(duLieuFirebase) {
  const mapping = {
    users: new Map(),
    teams: new Map(),
    tasks: new Map()
  };
  
  // Tạo UUID mapping cho users
  if (duLieuFirebase.users) {
    duLieuFirebase.users.forEach(user => {
      const idMoi = taoUUID();
      mapping.users.set(user.id, idMoi);
    });
  }
  
  // Tạo UUID mapping cho teams
  if (duLieuFirebase.teams) {
    duLieuFirebase.teams.forEach(team => {
      const idMoi = taoUUID();
      mapping.teams.set(team.id, idMoi);
    });
  }
  
  // Tạo UUID mapping cho tasks
  if (duLieuFirebase.tasks) {
    duLieuFirebase.tasks.forEach(task => {
      const idMoi = taoUUID();
      mapping.tasks.set(task.id, idMoi);
    });
  }
  
  log(`Đã tạo mapping ID: ${mapping.users.size} users, ${mapping.teams.size} teams, ${mapping.tasks.size} tasks`, 'info');
  
  return mapping;
}

/**
 * Chuyển đổi dữ liệu Teams
 */
function chuyenDoiTeams(duLieuFirebase, mappingID) {
  log('Đang chuyển đổi dữ liệu Teams...', 'info');
  
  if (!duLieuFirebase.teams || duLieuFirebase.teams.length === 0) {
    log('Không có teams để chuyển đổi', 'warning');
    return [];
  }
  
  const teamsChuyenDoi = duLieuFirebase.teams.map(team => ({
    id: mappingID.teams.get(team.id),
    name: team.name,
    leader_id: mappingID.users.get(team.leader_id) || null,
    location: team.location,
    description: team.description,
    department: team.department || 'retail',
    department_type: team.department_type || 'retail',
    created_at: chuyenDoiTimestamp(team.created_at),
    updated_at: chuyenDoiTimestamp(team.updated_at)
  }));
  
  log(`Đã chuyển đổi ${teamsChuyenDoi.length} teams`, 'success');
  return teamsChuyenDoi;
}

/**
 * Chuyển đổi dữ liệu Users
 */
function chuyenDoiUsers(duLieuFirebase, mappingID) {
  log('Đang chuyển đổi dữ liệu Users...', 'info');
  
  if (!duLieuFirebase.users || duLieuFirebase.users.length === 0) {
    log('Không có users để chuyển đổi', 'warning');
    return [];
  }
  
  const usersChuyenDoi = duLieuFirebase.users.map(user => ({
    id: mappingID.users.get(user.id),
    firebase_id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    team_id: mappingID.teams.get(user.team_id) || null,
    location: user.location,
    department: user.department || 'retail',
    department_type: user.department_type || 'retail',
    position: user.position,
    status: user.status || 'active',
    password_changed: user.password_changed || false,
    temp_password: user.password || '123456', // Lưu tạm thời
    created_at: chuyenDoiTimestamp(user.created_at),
    updated_at: chuyenDoiTimestamp(user.updated_at)
  }));
  
  log(`Đã chuyển đổi ${usersChuyenDoi.length} users`, 'success');
  return usersChuyenDoi;
}

/**
 * Chuyển đổi dữ liệu Tasks
 */
function chuyenDoiTasks(duLieuFirebase, mappingID) {
  log('Đang chuyển đổi dữ liệu Tasks...', 'info');
  
  if (!duLieuFirebase.tasks || duLieuFirebase.tasks.length === 0) {
    log('Không có tasks để chuyển đổi', 'warning');
    return [];
  }
  
  const tasksChuyenDoi = duLieuFirebase.tasks.map(task => ({
    id: mappingID.tasks.get(task.id),
    firebase_id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    date: task.date,
    time: task.time,
    status: task.status || 'todo',
    priority: task.priority || 'normal',
    progress: task.progress || 0,
    is_new: task.isNew !== undefined ? task.isNew : true,
    location: task.location,
    team_id: mappingID.teams.get(task.teamId || task.team_id) || null,
    assigned_to: mappingID.users.get(task.assignedTo) || null,
    user_id: mappingID.users.get(task.user_id),
    user_name: task.user_name,
    visibility: task.visibility || 'personal',
    shared_with: task.sharedWith ? task.sharedWith.map(id => mappingID.users.get(id)).filter(Boolean) : [],
    is_shared: task.isShared || false,
    created_at: chuyenDoiTimestamp(task.created_at),
    updated_at: chuyenDoiTimestamp(task.updated_at)
  })).filter(task => task.user_id); // Chỉ giữ tasks có user_id hợp lệ
  
  log(`Đã chuyển đổi ${tasksChuyenDoi.length} tasks`, 'success');
  return tasksChuyenDoi;
}

/**
 * Lưu dữ liệu đã chuyển đổi ra file JSON
 */
function luuDuLieuChuyenDoi(teams, users, tasks, mappingID) {
  try {
    log('Đang lưu dữ liệu đã chuyển đổi...', 'info');
    
    // Lưu dữ liệu chuyển đổi
    const duLieuSupabase = {
      metadata: {
        migration_date: new Date().toISOString(),
        source: 'Firebase',
        target: 'Supabase',
        total_records: {
          teams: teams.length,
          users: users.length,
          tasks: tasks.length
        }
      },
      teams,
      users,
      tasks
    };
    
    fs.writeFileSync('./supabase-data-converted.json', JSON.stringify(duLieuSupabase, null, 2));
    
    // Lưu ID mapping
    const mappingData = {
      timestamp: new Date().toISOString(),
      users: Object.fromEntries(mappingID.users),
      teams: Object.fromEntries(mappingID.teams),
      tasks: Object.fromEntries(mappingID.tasks)
    };
    
    fs.writeFileSync('./firebase-supabase-id-mapping.json', JSON.stringify(mappingData, null, 2));
    
    log('Đã lưu dữ liệu chuyển đổi thành công', 'success');
    log(`- File dữ liệu: supabase-data-converted.json`, 'info');
    log(`- File mapping: firebase-supabase-id-mapping.json`, 'info');
    
  } catch (error) {
    log(`Lỗi khi lưu dữ liệu: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Tạo SQL script để import vào Supabase
 */
function taoSQLScript(teams, users, tasks) {
  try {
    log('Đang tạo SQL script cho Supabase...', 'info');
    
    let sqlScript = `-- SQL Script Migration từ Firebase sang Supabase
-- Ngày tạo: ${new Date().toLocaleString('vi-VN')}
-- Dự án: retail-sales-pulse-ios

-- Xóa dữ liệu cũ (nếu có)
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE teams CASCADE;

`;

    // Insert Teams
    if (teams.length > 0) {
      sqlScript += `-- Insert Teams\n`;
      teams.forEach(team => {
        sqlScript += `INSERT INTO teams (id, name, leader_id, location, description, department, department_type, created_at, updated_at) VALUES (
  '${team.id}',
  '${team.name.replace(/'/g, "''")}',
  ${team.leader_id ? `'${team.leader_id}'` : 'NULL'},
  '${team.location}',
  '${team.description?.replace(/'/g, "''") || ''}',
  '${team.department}',
  '${team.department_type}',
  '${team.created_at}',
  '${team.updated_at}'
);\n`;
      });
      sqlScript += '\n';
    }

    // Insert Users
    if (users.length > 0) {
      sqlScript += `-- Insert Users\n`;
      users.forEach(user => {
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
  '${user.position?.replace(/'/g, "''") || ''}',
  '${user.status}',
  ${user.password_changed},
  '${user.temp_password}',
  '${user.created_at}',
  '${user.updated_at}'
);\n`;
      });
      sqlScript += '\n';
    }

    // Insert Tasks
    if (tasks.length > 0) {
      sqlScript += `-- Insert Tasks\n`;
      tasks.forEach(task => {
        sqlScript += `INSERT INTO tasks (id, firebase_id, title, description, type, date, time, status, priority, progress, is_new, location, team_id, assigned_to, user_id, user_name, visibility, shared_with, is_shared, created_at, updated_at) VALUES (
  '${task.id}',
  '${task.firebase_id}',
  '${task.title.replace(/'/g, "''")}',
  '${task.description?.replace(/'/g, "''") || ''}',
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
  '${task.user_name?.replace(/'/g, "''") || ''}',
  '${task.visibility}',
  ARRAY[${task.shared_with.map(id => `'${id}'`).join(', ')}],
  ${task.is_shared},
  '${task.created_at}',
  '${task.updated_at}'
);\n`;
      });
    }

    sqlScript += `
-- Cập nhật sequences
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

-- Migration hoàn thành
SELECT 'Migration hoàn thành thành công!' as status;
`;

    fs.writeFileSync('./supabase-migration.sql', sqlScript);
    
    log('Đã tạo SQL script thành công: supabase-migration.sql', 'success');
    
  } catch (error) {
    log(`Lỗi khi tạo SQL script: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Hàm chính thực hiện migration
 */
async function chayMigration() {
  try {
    log('🚀 Bắt đầu quá trình Migration từ Firebase sang Supabase...', 'start');
    
    // Bước 1: Đọc dữ liệu Firebase
    const duLieuFirebase = docDuLieuFirebase();
    
    // Bước 2: Tạo ID mapping
    const mappingID = taoMappingID(duLieuFirebase);
    
    // Bước 3: Chuyển đổi dữ liệu
    const teams = chuyenDoiTeams(duLieuFirebase, mappingID);
    const users = chuyenDoiUsers(duLieuFirebase, mappingID);
    const tasks = chuyenDoiTasks(duLieuFirebase, mappingID);
    
    // Bước 4: Lưu dữ liệu đã chuyển đổi
    luuDuLieuChuyenDoi(teams, users, tasks, mappingID);
    
    // Bước 5: Tạo SQL script
    taoSQLScript(teams, users, tasks);
    
    // Tóm tắt kết quả
    log('🎉 Migration hoàn thành thành công!', 'finish');
    log('📊 Tóm tắt kết quả:', 'info');
    log(`- Teams: ${teams.length} records`, 'info');
    log(`- Users: ${users.length} records`, 'info');
    log(`- Tasks: ${tasks.length} records`, 'info');
    log('📁 Files được tạo:', 'info');
    log('- supabase-data-converted.json (dữ liệu JSON)', 'info');
    log('- firebase-supabase-id-mapping.json (mapping IDs)', 'info');
    log('- supabase-migration.sql (SQL script)', 'info');
    log('', 'info');
    log('🔧 Bước tiếp theo:', 'info');
    log('1. Copy nội dung file supabase-migration.sql', 'info');
    log('2. Paste vào Supabase SQL Editor', 'info');
    log('3. Click Run để thực thi migration', 'info');
    log('4. Chạy test để verify kết quả', 'info');
    
  } catch (error) {
    log(`❌ Migration thất bại: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Chạy migration nếu file được thực thi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  chayMigration();
}

export { chayMigration };
