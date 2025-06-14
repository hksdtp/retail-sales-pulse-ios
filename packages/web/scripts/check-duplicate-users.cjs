const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function checkDuplicateUsers() {
  console.log('🔍 KIỂM TRA USERS BỊ DUPLICATE');
  console.log('==============================\n');

  try {
    // 1. Lấy tất cả users từ API
    console.log('1. 👥 Lấy tất cả users từ API...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    
    if (!usersData.success) {
      console.log('❌ Lỗi khi lấy users:', usersData.error);
      return;
    }

    const allUsers = usersData.data;
    console.log(`✅ Tổng số users: ${allUsers.length}`);
    console.log('');

    // 2. Phân tích duplicate theo email
    console.log('2. 📧 Phân tích duplicate theo email...');
    const usersByEmail = {};
    const duplicatesByEmail = [];

    allUsers.forEach(user => {
      const email = user.email ? user.email.trim().toLowerCase() : 'no-email';
      if (!usersByEmail[email]) {
        usersByEmail[email] = [];
      }
      usersByEmail[email].push(user);
    });

    // Tìm các email có nhiều hơn 1 user
    Object.keys(usersByEmail).forEach(email => {
      if (usersByEmail[email].length > 1) {
        duplicatesByEmail.push({
          email: email,
          count: usersByEmail[email].length,
          users: usersByEmail[email]
        });
      }
    });

    console.log(`🔍 Tìm thấy ${duplicatesByEmail.length} email bị duplicate:`);
    duplicatesByEmail.forEach((duplicate, index) => {
      console.log(`📧 ${index + 1}. "${duplicate.email}" (${duplicate.count} users)`);
      duplicate.users.forEach((user, userIndex) => {
        console.log(`   ${userIndex + 1}. ID: ${user.id} - Name: "${user.name}"`);
        console.log(`      - Role: ${user.role || 'undefined'}`);
        console.log(`      - Team: ${user.team_id || 'undefined'}`);
        console.log(`      - Location: ${user.location || 'undefined'}`);
        console.log(`      - Status: ${user.status || 'undefined'}`);
        console.log(`      - Created: ${user.created_at ? new Date(user.created_at._seconds * 1000).toLocaleString() : 'N/A'}`);
      });
      console.log('');
    });

    // 3. Phân tích duplicate theo name
    console.log('3. 👤 Phân tích duplicate theo name...');
    const usersByName = {};
    const duplicatesByName = [];

    allUsers.forEach(user => {
      const name = user.name ? user.name.trim() : 'no-name';
      if (!usersByName[name]) {
        usersByName[name] = [];
      }
      usersByName[name].push(user);
    });

    // Tìm các name có nhiều hơn 1 user
    Object.keys(usersByName).forEach(name => {
      if (usersByName[name].length > 1) {
        duplicatesByName.push({
          name: name,
          count: usersByName[name].length,
          users: usersByName[name]
        });
      }
    });

    console.log(`🔍 Tìm thấy ${duplicatesByName.length} tên bị duplicate:`);
    duplicatesByName.forEach((duplicate, index) => {
      console.log(`👤 ${index + 1}. "${duplicate.name}" (${duplicate.count} users)`);
      duplicate.users.forEach((user, userIndex) => {
        console.log(`   ${userIndex + 1}. ID: ${user.id} - Email: "${user.email}"`);
        console.log(`      - Role: ${user.role || 'undefined'}`);
        console.log(`      - Team: ${user.team_id || 'undefined'}`);
        console.log(`      - Created: ${user.created_at ? new Date(user.created_at._seconds * 1000).toLocaleString() : 'N/A'}`);
      });
      console.log('');
    });

    // 4. Phân tích users có dữ liệu thiếu
    console.log('4. ⚠️ Phân tích users có dữ liệu thiếu...');
    const incompleteUsers = allUsers.filter(user => 
      !user.role || 
      !user.team_id || 
      !user.location || 
      !user.department_type || 
      !user.status
    );

    console.log(`🔍 Tìm thấy ${incompleteUsers.length} users có dữ liệu thiếu:`);
    incompleteUsers.forEach((user, index) => {
      console.log(`⚠️ ${index + 1}. "${user.name}" (ID: ${user.id})`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role || '❌ THIẾU'}`);
      console.log(`   - Team: ${user.team_id || '❌ THIẾU'}`);
      console.log(`   - Location: ${user.location || '❌ THIẾU'}`);
      console.log(`   - Department: ${user.department_type || '❌ THIẾU'}`);
      console.log(`   - Status: ${user.status || '❌ THIẾU'}`);
      console.log('');
    });

    // 5. Thống kê tổng quan
    console.log('📊 THỐNG KÊ DUPLICATE USERS:');
    console.log('============================');
    console.log(`🔢 Tổng users: ${allUsers.length}`);
    console.log(`📧 Email duplicates: ${duplicatesByEmail.length} nhóm`);
    console.log(`👤 Name duplicates: ${duplicatesByName.length} nhóm`);
    console.log(`⚠️ Users thiếu dữ liệu: ${incompleteUsers.length}`);
    
    let totalEmailDuplicates = 0;
    duplicatesByEmail.forEach(dup => {
      totalEmailDuplicates += (dup.count - 1);
    });
    
    let totalNameDuplicates = 0;
    duplicatesByName.forEach(dup => {
      totalNameDuplicates += (dup.count - 1);
    });
    
    console.log(`❌ Users thừa (email): ${totalEmailDuplicates}`);
    console.log(`❌ Users thừa (name): ${totalNameDuplicates}`);
    console.log(`✅ Users unique (ước tính): ${allUsers.length - Math.max(totalEmailDuplicates, totalNameDuplicates)}`);
    console.log('');

    // 6. Tìm nguyên nhân duplicate
    console.log('6. 🔍 PHÂN TÍCH NGUYÊN NHÂN DUPLICATE:');
    console.log('=====================================');
    
    // Kiểm tra script tạo users
    console.log('📝 Có thể do các nguyên nhân sau:');
    console.log('1. Script setup-production-data.cjs chạy nhiều lần');
    console.log('2. Script create-users-teams.cjs chạy nhiều lần');
    console.log('3. Import dữ liệu từ nhiều nguồn khác nhau');
    console.log('4. Không có validation duplicate khi tạo user');
    console.log('5. Migration dữ liệu không đúng cách');
    console.log('');

    // 7. Xuất báo cáo
    const duplicateReport = {
      timestamp: new Date().toISOString(),
      total_users: allUsers.length,
      email_duplicates: duplicatesByEmail.length,
      name_duplicates: duplicatesByName.length,
      incomplete_users: incompleteUsers.length,
      duplicates_by_email: duplicatesByEmail,
      duplicates_by_name: duplicatesByName,
      incomplete_users: incompleteUsers
    };

    const fs = require('fs');
    const path = require('path');
    const reportFile = path.join(__dirname, 'duplicate-users-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(duplicateReport, null, 2));
    console.log(`✅ Báo cáo users đã được lưu: ${reportFile}`);
    console.log('');

    console.log('🎯 KHUYẾN NGHỊ:');
    console.log('===============');
    console.log('1. Xóa users duplicate (giữ lại user có dữ liệu đầy đủ nhất)');
    console.log('2. Cập nhật dữ liệu thiếu cho users incomplete');
    console.log('3. Thêm validation để tránh duplicate trong tương lai');
    console.log('4. Kiểm tra và vô hiệu hóa scripts tạo duplicate');

    return duplicateReport;

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra duplicate users:', error.message);
  }
}

// Chạy script
checkDuplicateUsers()
  .then(result => {
    if (result) {
      console.log('\n✅ HOÀN THÀNH KIỂM TRA DUPLICATE USERS!');
    }
  })
  .catch(console.error);
