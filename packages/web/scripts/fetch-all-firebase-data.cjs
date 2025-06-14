const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function fetchAllFirebaseData() {
  console.log('🔍 KIỂM TRA TẤT CẢ DỮ LIỆU TRÊN SERVER FIREBASE');
  console.log('================================================\n');

  try {
    // 1. Kiểm tra API health
    console.log('1. 🏥 Kiểm tra API Health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('📅 Timestamp:', healthData.timestamp);
    console.log('🔧 Service:', healthData.service);
    console.log('');

    // 2. Lấy tất cả Tasks
    console.log('2. 📋 Lấy tất cả Tasks...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    
    if (tasksData.success) {
      console.log(`✅ Tổng số Tasks: ${tasksData.count}`);
      if (tasksData.count > 0) {
        console.log('📋 Danh sách Tasks:');
        tasksData.data.forEach((task, index) => {
          console.log(`   ${index + 1}. "${task.title}"`);
          console.log(`      - ID: ${task.id}`);
          console.log(`      - Status: ${task.status}`);
          console.log(`      - Priority: ${task.priority}`);
          console.log(`      - Assigned to: ${task.user_name} (${task.assignedTo})`);
          console.log(`      - Team: ${task.team_id}`);
          console.log(`      - Date: ${task.date} ${task.time || ''}`);
          console.log(`      - Progress: ${task.progress}%`);
          console.log(`      - Created: ${task.created_at ? new Date(task.created_at._seconds * 1000).toLocaleString() : 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Không có Tasks nào trong database');
      }
    } else {
      console.log('❌ Lỗi khi lấy Tasks:', tasksData.error);
    }
    console.log('');

    // 3. Lấy tất cả Users
    console.log('3. 👥 Lấy tất cả Users...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    
    if (usersData.success) {
      console.log(`✅ Tổng số Users: ${usersData.count || usersData.data?.length || 0}`);
      if (usersData.data && usersData.data.length > 0) {
        console.log('👥 Danh sách Users:');
        usersData.data.forEach((user, index) => {
          console.log(`   ${index + 1}. "${user.name}"`);
          console.log(`      - ID: ${user.id}`);
          console.log(`      - Email: ${user.email}`);
          console.log(`      - Role: ${user.role}`);
          console.log(`      - Team: ${user.team_id}`);
          console.log(`      - Location: ${user.location}`);
          console.log(`      - Department: ${user.department_type || user.department}`);
          console.log(`      - Status: ${user.status}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Không có Users nào trong database');
      }
    } else {
      console.log('❌ Lỗi khi lấy Users:', usersData.error);
    }
    console.log('');

    // 4. Lấy tất cả Teams
    console.log('4. 🏢 Lấy tất cả Teams...');
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    
    if (teamsData.success) {
      console.log(`✅ Tổng số Teams: ${teamsData.count || teamsData.data?.length || 0}`);
      if (teamsData.data && teamsData.data.length > 0) {
        console.log('🏢 Danh sách Teams:');
        teamsData.data.forEach((team, index) => {
          console.log(`   ${index + 1}. "${team.name}"`);
          console.log(`      - ID: ${team.id}`);
          console.log(`      - Leader: ${team.leader_id}`);
          console.log(`      - Location: ${team.location}`);
          console.log(`      - Department: ${team.department_type || team.department}`);
          console.log(`      - Description: ${team.description}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Không có Teams nào trong database');
      }
    } else {
      console.log('❌ Lỗi khi lấy Teams:', teamsData.error);
    }
    console.log('');

    // 5. Thử lấy Reports (nếu có)
    console.log('5. 📊 Lấy tất cả Reports...');
    try {
      const reportsResponse = await fetch(`${API_BASE}/reports`);
      const reportsData = await reportsResponse.json();
      
      if (reportsData.success) {
        console.log(`✅ Tổng số Reports: ${reportsData.count || reportsData.data?.length || 0}`);
        if (reportsData.data && reportsData.data.length > 0) {
          console.log('📊 Danh sách Reports:');
          reportsData.data.forEach((report, index) => {
            console.log(`   ${index + 1}. "${report.title || report.name}"`);
            console.log(`      - ID: ${report.id}`);
            console.log(`      - Type: ${report.type}`);
            console.log(`      - Created: ${report.created_at}`);
            console.log('');
          });
        } else {
          console.log('⚠️ Không có Reports nào trong database');
        }
      } else {
        console.log('❌ Endpoint Reports không khả dụng hoặc trống');
      }
    } catch (error) {
      console.log('❌ Endpoint Reports không tồn tại hoặc lỗi:', error.message);
    }
    console.log('');

    // 6. Tổng kết
    console.log('📊 TỔNG KẾT DỮ LIỆU FIREBASE:');
    console.log('============================');
    console.log(`🏥 API Status: ${healthData.status}`);
    console.log(`📋 Tasks: ${tasksData.success ? tasksData.count : 'Lỗi'}`);
    console.log(`👥 Users: ${usersData.success ? (usersData.count || usersData.data?.length || 0) : 'Lỗi'}`);
    console.log(`🏢 Teams: ${teamsData.success ? (teamsData.count || teamsData.data?.length || 0) : 'Lỗi'}`);
    console.log('');

    // 7. Xuất dữ liệu ra file JSON
    console.log('💾 Xuất dữ liệu ra file JSON...');
    const allData = {
      timestamp: new Date().toISOString(),
      api_health: healthData,
      tasks: tasksData.success ? tasksData.data : [],
      users: usersData.success ? usersData.data : [],
      teams: teamsData.success ? teamsData.data : [],
      summary: {
        total_tasks: tasksData.success ? tasksData.count : 0,
        total_users: usersData.success ? (usersData.count || usersData.data?.length || 0) : 0,
        total_teams: teamsData.success ? (teamsData.count || teamsData.data?.length || 0) : 0
      }
    };

    const fs = require('fs');
    const path = require('path');
    
    const outputFile = path.join(__dirname, 'firebase-data-export.json');
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
    
    console.log(`✅ Dữ liệu đã được xuất ra: ${outputFile}`);
    console.log('');

    console.log('🎉 HOÀN THÀNH KIỂM TRA DỮ LIỆU FIREBASE!');
    console.log('📁 File JSON đã được tạo để backup dữ liệu');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu Firebase:', error.message);
  }
}

// Chạy script
console.log('🚀 BẮT ĐẦU KIỂM TRA DỮ LIỆU FIREBASE...\n');
fetchAllFirebaseData().catch(console.error);
