#!/usr/bin/env node

/**
 * Script Import Dữ Liệu vào Supabase
 * Dự án: retail-sales-pulse-ios
 * Ngày: 2025-06-29
 */

const fs = require('fs');

// Cấu hình Supabase
const SUPABASE_CONFIG = {
  url: 'https://fnakxavwxubnbucfoujd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI4NzQsImV4cCI6MjA1MTA0ODg3NH0.VGvp7zOmOdJOKOhJOqOqOqOqOqOqOqOqOqOqOqOqOqO'
};

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
 * Kiểm tra Supabase connection
 */
async function kiemTraKetNoi() {
  try {
    log('Đang kiểm tra kết nối Supabase...', 'info');
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      log(`Lỗi kết nối Supabase: ${error.message}`, 'error');
      return null;
    }
    
    log('Kết nối Supabase thành công!', 'success');
    return supabase;
    
  } catch (error) {
    log(`Lỗi khi import Supabase client: ${error.message}`, 'error');
    log('Hãy đảm bảo đã cài đặt: npm install @supabase/supabase-js', 'warning');
    return null;
  }
}

/**
 * Đọc dữ liệu đã chuyển đổi
 */
function docDuLieuChuyenDoi() {
  try {
    log('Đang đọc dữ liệu đã chuyển đổi...', 'info');
    
    const filePath = './supabase-data-converted.json';
    if (!fs.existsSync(filePath)) {
      throw new Error(`Không tìm thấy file: ${filePath}. Hãy chạy migration script trước.`);
    }
    
    const duLieuTho = fs.readFileSync(filePath, 'utf8');
    const duLieu = JSON.parse(duLieuTho);
    
    log(`Đã đọc dữ liệu: ${duLieu.teams.length} teams, ${duLieu.users.length} users, ${duLieu.tasks.length} tasks`, 'success');
    
    return duLieu;
  } catch (error) {
    log(`Lỗi khi đọc dữ liệu: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Import Teams vào Supabase
 */
async function importTeams(supabase, teams) {
  try {
    log(`Đang import ${teams.length} teams vào Supabase...`, 'info');
    
    // Xóa dữ liệu cũ
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      log(`Cảnh báo khi xóa teams cũ: ${deleteError.message}`, 'warning');
    }
    
    // Insert teams theo batch
    const batchSize = 10;
    let importedCount = 0;
    
    for (let i = 0; i < teams.length; i += batchSize) {
      const batch = teams.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('teams')
        .insert(batch);
      
      if (error) {
        log(`Lỗi khi insert teams batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
        throw error;
      }
      
      importedCount += batch.length;
      log(`Đã import ${importedCount}/${teams.length} teams`, 'info');
    }
    
    log(`Import teams hoàn thành: ${importedCount} records`, 'success');
    return importedCount;
    
  } catch (error) {
    log(`Lỗi khi import teams: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Import Users vào Supabase
 */
async function importUsers(supabase, users) {
  try {
    log(`Đang import ${users.length} users vào Supabase...`, 'info');
    
    // Xóa dữ liệu cũ
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      log(`Cảnh báo khi xóa users cũ: ${deleteError.message}`, 'warning');
    }
    
    // Insert users theo batch
    const batchSize = 10;
    let importedCount = 0;
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('users')
        .insert(batch);
      
      if (error) {
        log(`Lỗi khi insert users batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
        throw error;
      }
      
      importedCount += batch.length;
      log(`Đã import ${importedCount}/${users.length} users`, 'info');
    }
    
    log(`Import users hoàn thành: ${importedCount} records`, 'success');
    return importedCount;
    
  } catch (error) {
    log(`Lỗi khi import users: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Import Tasks vào Supabase
 */
async function importTasks(supabase, tasks) {
  try {
    log(`Đang import ${tasks.length} tasks vào Supabase...`, 'info');
    
    // Xóa dữ liệu cũ
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      log(`Cảnh báo khi xóa tasks cũ: ${deleteError.message}`, 'warning');
    }
    
    // Insert tasks theo batch
    const batchSize = 10;
    let importedCount = 0;
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(batch);
      
      if (error) {
        log(`Lỗi khi insert tasks batch ${Math.floor(i/batchSize) + 1}: ${error.message}`, 'error');
        throw error;
      }
      
      importedCount += batch.length;
      log(`Đã import ${importedCount}/${tasks.length} tasks`, 'info');
    }
    
    log(`Import tasks hoàn thành: ${importedCount} records`, 'success');
    return importedCount;
    
  } catch (error) {
    log(`Lỗi khi import tasks: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Xác minh dữ liệu sau khi import
 */
async function xacMinhDuLieu(supabase) {
  try {
    log('Đang xác minh dữ liệu sau import...', 'info');
    
    // Đếm records trong từng table
    const [usersResult, teamsResult, tasksResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true })
    ]);
    
    const counts = {
      users: usersResult.count || 0,
      teams: teamsResult.count || 0,
      tasks: tasksResult.count || 0
    };
    
    log('📊 Kết quả xác minh:', 'info');
    log(`- Users: ${counts.users} records`, 'info');
    log(`- Teams: ${counts.teams} records`, 'info');
    log(`- Tasks: ${counts.tasks} records`, 'info');
    
    // Kiểm tra một số records cụ thể
    const { data: sampleUser } = await supabase
      .from('users')
      .select('name, email, role')
      .limit(1)
      .single();
    
    if (sampleUser) {
      log(`✅ Sample user: ${sampleUser.name} (${sampleUser.email}) - ${sampleUser.role}`, 'success');
    }
    
    return counts;
    
  } catch (error) {
    log(`Lỗi khi xác minh dữ liệu: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Hàm chính thực hiện import
 */
async function chayImport() {
  try {
    log('🚀 Bắt đầu quá trình Import dữ liệu vào Supabase...', 'start');
    
    // Bước 1: Kiểm tra kết nối Supabase
    const supabase = await kiemTraKetNoi();
    if (!supabase) {
      throw new Error('Không thể kết nối Supabase');
    }
    
    // Bước 2: Đọc dữ liệu đã chuyển đổi
    const duLieu = docDuLieuChuyenDoi();
    
    // Bước 3: Import theo thứ tự (teams -> users -> tasks)
    const teamsCount = await importTeams(supabase, duLieu.teams);
    const usersCount = await importUsers(supabase, duLieu.users);
    const tasksCount = await importTasks(supabase, duLieu.tasks);
    
    // Bước 4: Xác minh dữ liệu
    const verificationCounts = await xacMinhDuLieu(supabase);
    
    // Tóm tắt kết quả
    log('🎉 Import dữ liệu hoàn thành thành công!', 'finish');
    log('📊 Tóm tắt kết quả import:', 'info');
    log(`- Teams: ${teamsCount} imported, ${verificationCounts.teams} verified`, 'info');
    log(`- Users: ${usersCount} imported, ${verificationCounts.users} verified`, 'info');
    log(`- Tasks: ${tasksCount} imported, ${verificationCounts.tasks} verified`, 'info');
    
    // Kiểm tra tính toàn vẹn
    const isIntegrityOk = (
      teamsCount === verificationCounts.teams &&
      usersCount === verificationCounts.users &&
      tasksCount === verificationCounts.tasks
    );
    
    if (isIntegrityOk) {
      log('✅ Tính toàn vẹn dữ liệu: OK', 'success');
    } else {
      log('⚠️ Tính toàn vẹn dữ liệu: Có sự khác biệt', 'warning');
    }
    
    log('', 'info');
    log('🔧 Bước tiếp theo:', 'info');
    log('1. Chạy test để verify ứng dụng hoạt động với Supabase', 'info');
    log('2. Cập nhật ứng dụng để sử dụng Supabase thay vì Firebase', 'info');
    log('3. Test toàn bộ chức năng CRUD', 'info');
    
  } catch (error) {
    log(`❌ Import thất bại: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Chạy import
chayImport();
