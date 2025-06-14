const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function analyzeRealEmployees() {
  console.log('👥 PHÂN TÍCH DANH SÁCH NHÂN VIÊN THỰC TẾ');
  console.log('========================================\n');

  try {
    // 1. Lấy danh sách nhân viên từ API
    console.log('1. 📥 LẤY DANH SÁCH NHÂN VIÊN:');
    console.log('=============================');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    
    if (!usersData.success) {
      console.log('❌ Lỗi lấy users:', usersData.error);
      return;
    }

    const allUsers = usersData.data;
    const activeUsers = allUsers.filter(user => user.status !== 'deleted');
    
    console.log(`📊 Tổng users: ${allUsers.length}`);
    console.log(`✅ Users active: ${activeUsers.length}`);
    console.log(`🗑️ Users deleted: ${allUsers.length - activeUsers.length}`);
    console.log('');

    // 2. Phân tích theo role
    console.log('2. 👔 PHÂN TÍCH THEO ROLE:');
    console.log('=========================');
    
    const roleGroups = {};
    activeUsers.forEach(user => {
      const role = user.role || 'undefined';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(user);
    });

    Object.entries(roleGroups).forEach(([role, users]) => {
      console.log(`👔 ${role.toUpperCase()}: ${users.length} người`);
      users.forEach(user => {
        console.log(`   - ${user.name} (Team: ${user.team_id || 'N/A'}, Location: ${user.location || 'N/A'})`);
      });
      console.log('');
    });

    // 3. Phân tích team leaders
    console.log('3. 👨‍💼 TEAM LEADERS HIỆN TẠI:');
    console.log('============================');
    
    const teamLeaders = activeUsers.filter(user => user.role === 'team_leader');
    console.log(`📊 Tổng team leaders: ${teamLeaders.length}`);
    console.log('');

    // Nhóm theo location
    const hanoiLeaders = teamLeaders.filter(l => l.location === 'hanoi');
    const hcmLeaders = teamLeaders.filter(l => l.location === 'hcm');
    
    console.log('🏢 HÀ NỘI LEADERS:');
    hanoiLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name}`);
      console.log(`      - Team ID: ${leader.team_id}`);
      console.log(`      - Email: ${leader.email}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH LEADERS:');
    hcmLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name}`);
      console.log(`      - Team ID: ${leader.team_id}`);
      console.log(`      - Email: ${leader.email}`);
    });

    // 4. Phân tích theo team_id
    console.log('\n4. 🏢 PHÂN TÍCH THEO TEAM_ID:');
    console.log('=============================');
    
    const teamGroups = {};
    activeUsers.forEach(user => {
      const teamId = user.team_id || 'no-team';
      if (!teamGroups[teamId]) {
        teamGroups[teamId] = [];
      }
      teamGroups[teamId].push(user);
    });

    Object.entries(teamGroups).forEach(([teamId, members]) => {
      console.log(`🏢 TEAM ${teamId}: ${members.length} thành viên`);
      
      const leader = members.find(m => m.role === 'team_leader');
      if (leader) {
        console.log(`   👨‍💼 Leader: ${leader.name} (${leader.location})`);
      } else {
        console.log(`   ❌ Không có leader`);
      }
      
      const employees = members.filter(m => m.role === 'employee');
      if (employees.length > 0) {
        console.log(`   👥 Employees: ${employees.length}`);
        employees.forEach(emp => {
          console.log(`      - ${emp.name} (${emp.location})`);
        });
      }
      console.log('');
    });

    // 5. Cấu trúc lý tưởng dựa trên dữ liệu thực
    console.log('5. 🎯 CẤU TRÚC LÝ TƯỞNG DỰA TRÊN DỮ LIỆU THỰC:');
    console.log('===============================================');
    
    console.log('📋 Dựa trên team leaders hiện có:');
    console.log('🏢 HÀ NỘI:');
    hanoiLeaders.forEach((leader, index) => {
      console.log(`   NHÓM ${leader.team_id} - ${leader.name}`);
    });
    
    console.log('🏢 HỒ CHÍ MINH:');
    hcmLeaders.forEach((leader, index) => {
      const displayTeamId = leader.team_id === '5' ? '1' : leader.team_id === '6' ? '2' : leader.team_id;
      console.log(`   NHÓM ${displayTeamId} - ${leader.name} (team_id: ${leader.team_id})`);
    });

    // 6. So sánh với cấu trúc hiện tại
    console.log('\n6. 🔍 SO SÁNH VỚI YÊU CẦU:');
    console.log('===========================');
    
    const expectedStructure = {
      hanoi: ['Lương Việt Anh', 'Nguyễn Thị Thảo', 'Trịnh Thị Bốn', 'Phạm Thị Hương'],
      hcm: ['Nguyễn Thị Nga', 'Nguyễn Ngọc Việt Khanh']
    };

    console.log('✅ KIỂM TRA HÀ NỘI:');
    expectedStructure.hanoi.forEach((expectedName, index) => {
      const found = hanoiLeaders.find(l => l.name.includes(expectedName.split(' ')[0]));
      console.log(`   NHÓM ${index + 1}: ${expectedName} - ${found ? '✅ Có' : '❌ Thiếu'}`);
    });
    
    console.log('\n✅ KIỂM TRA HỒ CHÍ MINH:');
    expectedStructure.hcm.forEach((expectedName, index) => {
      const found = hcmLeaders.find(l => l.name.includes(expectedName.split(' ')[0]));
      console.log(`   NHÓM ${index + 1}: ${expectedName} - ${found ? '✅ Có' : '❌ Thiếu'}`);
    });

    // 7. Kết luận
    console.log('\n7. 💡 KẾT LUẬN:');
    console.log('===============');
    console.log('🎯 CÁCH ĐÚNG: Dựa vào danh sách nhân viên hiện có');
    console.log('❌ SAI LẦM: Tạo thêm user/team không cần thiết');
    console.log('✅ GIẢI PHÁP: Mapping utility function theo dữ liệu thực');
    
    if (teamLeaders.length >= 6) {
      console.log('✅ Đã có đủ team leaders, chỉ cần mapping đúng');
    } else {
      console.log('⚠️ Thiếu team leaders, cần kiểm tra kỹ hơn');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

analyzeRealEmployees().catch(console.error);
