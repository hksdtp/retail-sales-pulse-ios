#!/usr/bin/env node

/**
 * Script kiểm tra dữ liệu tasks từ Firebase export
 * Phân tích cấu trúc và chuẩn bị cho migration
 */

const fs = require('fs');

console.log('📋 KIỂM TRA DỮ LIỆU TASKS TỪ FIREBASE');
console.log('='.repeat(80));

try {
  // Đọc Firebase export data
  const firebaseDataPath = './packages/web/scripts/firebase-data-export.json';
  
  if (!fs.existsSync(firebaseDataPath)) {
    console.log('❌ Không tìm thấy file Firebase export:', firebaseDataPath);
    process.exit(1);
  }
  
  const firebaseData = JSON.parse(fs.readFileSync(firebaseDataPath, 'utf8'));
  const tasks = firebaseData.tasks || [];
  const users = firebaseData.users || [];
  const teams = firebaseData.teams || [];
  
  console.log('📊 TỔNG QUAN DỮ LIỆU:');
  console.log(`   - Tasks: ${tasks.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Teams: ${teams.length}`);
  
  if (tasks.length === 0) {
    console.log('⚠️ Không có tasks để phân tích');
    process.exit(0);
  }
  
  console.log('\n🔍 PHÂN TÍCH CẤU TRÚC TASKS:');
  console.log('-'.repeat(60));
  
  // Phân tích cấu trúc của task đầu tiên
  const sampleTask = tasks[0];
  console.log('📋 Cấu trúc task mẫu:');
  Object.keys(sampleTask).forEach(key => {
    const value = sampleTask[key];
    const type = Array.isArray(value) ? 'array' : typeof value;
    console.log(`   - ${key}: ${type} (${JSON.stringify(value).substring(0, 50)}...)`);
  });
  
  // Thống kê các trường dữ liệu
  console.log('\n📊 THỐNG KÊ CÁC TRƯỜNG DỮ LIỆU:');
  const fieldStats = {};
  
  tasks.forEach(task => {
    Object.keys(task).forEach(field => {
      if (!fieldStats[field]) {
        fieldStats[field] = {
          count: 0,
          hasValue: 0,
          types: new Set(),
          samples: []
        };
      }
      
      fieldStats[field].count++;
      
      if (task[field] !== null && task[field] !== undefined && task[field] !== '') {
        fieldStats[field].hasValue++;
        fieldStats[field].types.add(typeof task[field]);
        
        if (fieldStats[field].samples.length < 3) {
          fieldStats[field].samples.push(task[field]);
        }
      }
    });
  });
  
  Object.keys(fieldStats).sort().forEach(field => {
    const stat = fieldStats[field];
    const coverage = Math.round((stat.hasValue / stat.count) * 100);
    console.log(`   ${field.padEnd(20)}: ${coverage}% coverage (${stat.hasValue}/${stat.count})`);
    console.log(`     Types: ${Array.from(stat.types).join(', ')}`);
    if (stat.samples.length > 0) {
      console.log(`     Samples: ${stat.samples.map(s => JSON.stringify(s)).join(', ')}`);
    }
  });
  
  // Phân tích status
  console.log('\n📊 PHÂN TÍCH STATUS:');
  const statusCounts = {};
  tasks.forEach(task => {
    const status = task.status || 'undefined';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  Object.keys(statusCounts).sort().forEach(status => {
    console.log(`   ${status}: ${statusCounts[status]} tasks`);
  });
  
  // Phân tích assigned users
  console.log('\n👥 PHÂN TÍCH ASSIGNED USERS:');
  const assignedCounts = {};
  const userIdToName = {};
  
  users.forEach(user => {
    userIdToName[user.id] = user.name;
  });
  
  tasks.forEach(task => {
    const assignedTo = task.assignedTo || task.user_id || 'unassigned';
    const userName = userIdToName[assignedTo] || assignedTo;
    assignedCounts[userName] = (assignedCounts[userName] || 0) + 1;
  });
  
  Object.keys(assignedCounts).sort().forEach(user => {
    console.log(`   ${user}: ${assignedCounts[user]} tasks`);
  });
  
  // Phân tích dates
  console.log('\n📅 PHÂN TÍCH DATES:');
  const dateCounts = {};
  tasks.forEach(task => {
    const date = task.date || 'no-date';
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  
  const sortedDates = Object.keys(dateCounts).sort();
  console.log(`   Earliest date: ${sortedDates[0]}`);
  console.log(`   Latest date: ${sortedDates[sortedDates.length - 1]}`);
  console.log(`   Tasks with dates: ${tasks.filter(t => t.date).length}/${tasks.length}`);
  
  // Phân tích priority
  console.log('\n⭐ PHÂN TÍCH PRIORITY:');
  const priorityCounts = {};
  tasks.forEach(task => {
    const priority = task.priority || 'normal';
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
  });
  
  Object.keys(priorityCounts).sort().forEach(priority => {
    console.log(`   ${priority}: ${priorityCounts[priority]} tasks`);
  });
  
  // Phân tích visibility/sharing
  console.log('\n🔗 PHÂN TÍCH VISIBILITY & SHARING:');
  const visibilityCounts = {};
  const sharedTasks = tasks.filter(task => task.isShared || (task.sharedWith && task.sharedWith.length > 0));
  
  tasks.forEach(task => {
    const visibility = task.visibility || 'personal';
    visibilityCounts[visibility] = (visibilityCounts[visibility] || 0) + 1;
  });
  
  Object.keys(visibilityCounts).sort().forEach(visibility => {
    console.log(`   ${visibility}: ${visibilityCounts[visibility]} tasks`);
  });
  console.log(`   Shared tasks: ${sharedTasks.length}/${tasks.length}`);
  
  // Kiểm tra data integrity
  console.log('\n🔍 KIỂM TRA DATA INTEGRITY:');
  
  const tasksWithoutTitle = tasks.filter(task => !task.title || task.title.trim() === '');
  const tasksWithoutUser = tasks.filter(task => !task.user_id && !task.assignedTo);
  const tasksWithInvalidDate = tasks.filter(task => task.date && isNaN(new Date(task.date).getTime()));
  
  console.log(`   ❌ Tasks without title: ${tasksWithoutTitle.length}`);
  console.log(`   ❌ Tasks without user: ${tasksWithoutUser.length}`);
  console.log(`   ❌ Tasks with invalid date: ${tasksWithInvalidDate.length}`);
  
  if (tasksWithoutTitle.length > 0) {
    console.log('     Tasks without title:');
    tasksWithoutTitle.slice(0, 3).forEach(task => {
      console.log(`       - ID: ${task.id}, Description: ${task.description?.substring(0, 50)}...`);
    });
  }
  
  // Tạo mapping preview
  console.log('\n🔄 PREVIEW MIGRATION MAPPING:');
  console.log('   User ID mappings needed:');
  
  const uniqueUserIds = new Set();
  tasks.forEach(task => {
    if (task.user_id) uniqueUserIds.add(task.user_id);
    if (task.assignedTo) uniqueUserIds.add(task.assignedTo);
    if (task.sharedWith) {
      task.sharedWith.forEach(id => uniqueUserIds.add(id));
    }
  });
  
  Array.from(uniqueUserIds).slice(0, 10).forEach(userId => {
    const userName = userIdToName[userId] || 'Unknown';
    console.log(`     ${userId} → [NEW_UUID] (${userName})`);
  });
  
  if (uniqueUserIds.size > 10) {
    console.log(`     ... và ${uniqueUserIds.size - 10} user IDs khác`);
  }
  
  console.log('\n📋 SUMMARY CHO MIGRATION:');
  console.log(`✅ ${tasks.length} tasks sẵn sàng để migrate`);
  console.log(`✅ ${users.length} users để tạo ID mapping`);
  console.log(`✅ ${teams.length} teams để reference`);
  console.log(`⚠️ ${tasksWithoutTitle.length + tasksWithoutUser.length + tasksWithInvalidDate.length} tasks cần cleanup`);
  
  // Lưu analysis report
  const analysisReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTasks: tasks.length,
      totalUsers: users.length,
      totalTeams: teams.length,
      tasksWithIssues: tasksWithoutTitle.length + tasksWithoutUser.length + tasksWithInvalidDate.length
    },
    fieldStats,
    statusDistribution: statusCounts,
    assignedDistribution: assignedCounts,
    priorityDistribution: priorityCounts,
    visibilityDistribution: visibilityCounts,
    dataIntegrity: {
      tasksWithoutTitle: tasksWithoutTitle.length,
      tasksWithoutUser: tasksWithoutUser.length,
      tasksWithInvalidDate: tasksWithInvalidDate.length
    },
    uniqueUserIds: Array.from(uniqueUserIds)
  };
  
  fs.writeFileSync('./tasks-analysis-report.json', JSON.stringify(analysisReport, null, 2));
  console.log('\n📁 Đã lưu báo cáo phân tích: tasks-analysis-report.json');
  
} catch (error) {
  console.error('❌ LỖI:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(80));
console.log('🏁 KIỂM TRA TASKS DATA HOÀN THÀNH');
console.log('='.repeat(80));
