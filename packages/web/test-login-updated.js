// Test script để kiểm tra hệ thống login đã cập nhật
// Ninh ơi - Test Login với cấu trúc nhóm mới

const { mockGetUsers, mockGetTeams, mockLogin } = require('./src/services/mockAuth.ts');

async function testLoginSystem() {
  console.log('🧪 KIỂM TRA HỆ THỐNG LOGIN ĐÃ CẬP NHẬT');
  console.log('=====================================');

  try {
    // Test 1: Lấy danh sách users
    console.log('\n📋 Test 1: Lấy danh sách users...');
    const usersResponse = await mockGetUsers();
    
    if (usersResponse.success && usersResponse.data) {
      console.log(`✅ Thành công! Tìm thấy ${usersResponse.data.length} users`);
      
      // Hiển thị cấu trúc users theo nhóm
      const usersByLocation = usersResponse.data.reduce((acc, user) => {
        if (!acc[user.location]) acc[user.location] = [];
        acc[user.location].push(user);
        return acc;
      }, {});

      Object.keys(usersByLocation).forEach(location => {
        console.log(`\n📍 ${location}:`);
        usersByLocation[location].forEach(user => {
          console.log(`   - ${user.name} (${user.position}) - Team ${user.team_id}`);
        });
      });
    } else {
      console.log('❌ Lỗi khi lấy danh sách users:', usersResponse.error);
    }

    // Test 2: Lấy danh sách teams
    console.log('\n📋 Test 2: Lấy danh sách teams...');
    const teamsResponse = await mockGetTeams();
    
    if (teamsResponse.success && teamsResponse.data) {
      console.log(`✅ Thành công! Tìm thấy ${teamsResponse.data.length} teams`);
      
      teamsResponse.data.forEach(team => {
        console.log(`   - ${team.name} (${team.location}) - Leader: ${team.leader_id}`);
      });
    } else {
      console.log('❌ Lỗi khi lấy danh sách teams:', teamsResponse.error);
    }

    // Test 3: Test login với các users khác nhau
    console.log('\n🔐 Test 3: Test login...');
    
    const testUsers = [
      { email: 'manh.khong@example.com', name: 'Khổng Đức Mạnh (Trưởng phòng)' },
      { email: 'vietanh@example.com', name: 'Lương Việt Anh (Trưởng nhóm 1 HN)' },
      { email: 'thao.nguyen@example.com', name: 'Nguyễn Thị Thảo (Trưởng nhóm 2 HN)' },
      { email: 'nga.nguyen@example.com', name: 'Nguyễn Thị Nga (Trưởng nhóm 1 HCM)' },
      { email: 'vietkhanh@example.com', name: 'Nguyễn Ngọc Việt Khanh (Trưởng nhóm 2 HCM)' },
      { email: 'khanhduy@example.com', name: 'Lê Khánh Duy (Nhân viên)' }
    ];

    for (const testUser of testUsers) {
      try {
        const loginResponse = await mockLogin(testUser.email, '123456');
        if (loginResponse.success) {
          console.log(`   ✅ ${testUser.name}: Đăng nhập thành công`);
        } else {
          console.log(`   ❌ ${testUser.name}: ${loginResponse.error}`);
        }
      } catch (error) {
        console.log(`   ❌ ${testUser.name}: Lỗi - ${error.message}`);
      }
    }

    // Test 4: Kiểm tra cấu trúc nhóm
    console.log('\n🏢 Test 4: Kiểm tra cấu trúc nhóm...');
    
    if (usersResponse.success && teamsResponse.success) {
      const users = usersResponse.data;
      const teams = teamsResponse.data;
      
      console.log('\n📊 Thống kê cấu trúc tổ chức:');
      
      // Thống kê theo location
      const locationStats = users.reduce((acc, user) => {
        if (!acc[user.location]) {
          acc[user.location] = { total: 0, leaders: 0, employees: 0 };
        }
        acc[user.location].total++;
        if (user.role === 'team_leader') acc[user.location].leaders++;
        if (user.role === 'employee') acc[user.location].employees++;
        return acc;
      }, {});

      Object.keys(locationStats).forEach(location => {
        const stats = locationStats[location];
        console.log(`   📍 ${location}: ${stats.total} người (${stats.leaders} trưởng nhóm, ${stats.employees} nhân viên)`);
      });

      // Kiểm tra teams có leader không
      console.log('\n🔍 Kiểm tra teams và leaders:');
      teams.forEach(team => {
        const leader = users.find(user => user.id === team.leader_id);
        if (leader) {
          console.log(`   ✅ ${team.name}: ${leader.name}`);
        } else {
          console.log(`   ❌ ${team.name}: Không tìm thấy leader với ID ${team.leader_id}`);
        }
      });
    }

    console.log('\n🎉 HOÀN THÀNH KIỂM TRA!');
    console.log('======================');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  }
}

// Chạy test
testLoginSystem();
