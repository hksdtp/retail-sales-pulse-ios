#!/usr/bin/env node

/**
 * Script để đếm chính xác số lượng users trong hệ thống
 */

const fs = require('fs');

console.log('📊 COUNTING USERS IN SYSTEM');
console.log('='.repeat(50));

try {
  // Đọc file mockAuth.ts
  const filePath = './packages/web/src/services/mockAuth.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Tìm realUsers array
  const realUsersMatch = content.match(/const realUsers: MockUser\[\] = \[([\s\S]*?)\];/);
  
  if (!realUsersMatch) {
    console.log('❌ Không tìm thấy realUsers array');
    process.exit(1);
  }
  
  const realUsersContent = realUsersMatch[1];
  
  // Đếm số objects trong array bằng cách đếm pattern { id: 'user_
  const userObjects = realUsersContent.match(/{\s*id:\s*['"]user_/g) || [];
  const userCount = userObjects.length;
  
  console.log(`📊 Tổng số users trong realUsers: ${userCount}`);
  
  // Tìm và liệt kê tên các users
  const userNames = [];
  const nameMatches = realUsersContent.match(/name:\s*['"]([^'"]+)['"]/g) || [];
  
  nameMatches.forEach(match => {
    const name = match.match(/name:\s*['"]([^'"]+)['"]/)[1];
    userNames.push(name);
  });
  
  console.log('\n👥 DANH SÁCH USERS:');
  userNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  // Kiểm tra trong Firebase data export
  console.log('\n🔍 KIỂM TRA FIREBASE DATA EXPORT:');
  
  const firebaseDataPath = './packages/web/scripts/firebase-data-export.json';
  if (fs.existsSync(firebaseDataPath)) {
    const firebaseData = JSON.parse(fs.readFileSync(firebaseDataPath, 'utf8'));
    const firebaseUsers = firebaseData.users || [];
    
    console.log(`📊 Users trong Firebase export: ${firebaseUsers.length}`);
    
    if (firebaseUsers.length > 0) {
      console.log('\n👥 FIREBASE USERS (first 10):');
      firebaseUsers.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No name'} (${user.email || 'No email'})`);
      });
      
      if (firebaseUsers.length > 10) {
        console.log(`... và ${firebaseUsers.length - 10} users khác`);
      }
    }
  } else {
    console.log('❌ Không tìm thấy Firebase data export');
  }
  
  // Kiểm tra trong migration data
  console.log('\n🔍 KIỂM TRA MIGRATION DATA:');
  
  const migrationDataPath = './supabase-data-converted.json';
  if (fs.existsSync(migrationDataPath)) {
    const migrationData = JSON.parse(fs.readFileSync(migrationDataPath, 'utf8'));
    const migrationUsers = migrationData.users || [];
    
    console.log(`📊 Users trong migration data: ${migrationUsers.length}`);
    
    if (migrationUsers.length > 0) {
      console.log('\n👥 MIGRATION USERS (first 10):');
      migrationUsers.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No name'} (${user.email || 'No email'})`);
      });
      
      if (migrationUsers.length > 10) {
        console.log(`... và ${migrationUsers.length - 10} users khác`);
      }
    }
  } else {
    console.log('❌ Không tìm thấy migration data');
  }
  
  console.log('\n📊 TỔNG KẾT:');
  console.log(`🔧 realUsers trong mockAuth.ts: ${userCount} users`);
  
  if (fs.existsSync(firebaseDataPath)) {
    const firebaseData = JSON.parse(fs.readFileSync(firebaseDataPath, 'utf8'));
    console.log(`🔥 Firebase export: ${firebaseData.users?.length || 0} users`);
  }
  
  if (fs.existsSync(migrationDataPath)) {
    const migrationData = JSON.parse(fs.readFileSync(migrationDataPath, 'utf8'));
    console.log(`📦 Migration data: ${migrationData.users?.length || 0} users`);
  }
  
  console.log('\n💡 LÝ DO SỐ LƯỢNG KHÁC NHAU:');
  console.log('- realUsers: Chỉ chứa users chính thức đang active');
  console.log('- Firebase export: Có thể chứa users test, inactive, duplicate');
  console.log('- Migration data: Chuyển đổi từ Firebase, có thể có users cũ');
  
} catch (error) {
  console.error('❌ LỖI:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('🏁 COUNTING COMPLETE');
console.log('='.repeat(50));
