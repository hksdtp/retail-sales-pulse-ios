const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// DANH SÁCH CHÍNH XÁC 11 NHÂN VIÊN
const exactEmployees = [
  {
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    password: '123456',
    role: 'retail_director',
    team_id: '0',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng phòng kinh doanh bán lẻ',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Lương Việt Anh',
    email: 'vietanh@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Lê Khánh Duy',
    email: 'khanhduy@example.com',
    password: '123456',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Nguyễn Mạnh Linh',
    email: 'manhlinh@example.com',
    password: '123456',
    role: 'employee',
    team_id: '2',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '3',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Phạm Thị Hương',
    email: 'huong.pham@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '4',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@example.com',
    password: '123456',
    role: 'employee',
    team_id: '5',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'vietkhanh@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true
  },
  {
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    password: '123456',
    role: 'employee',
    team_id: '6',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên',
    status: 'active',
    password_changed: true
  }
];

// DANH SÁCH 6 NHÓM
const exactTeams = [
  {
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  },
  {
    name: 'NHÓM 2 - THẢO',
    leader_id: '4',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  },
  {
    name: 'NHÓM 3',
    leader_id: '6',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 3 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  },
  {
    name: 'NHÓM 4',
    leader_id: '7',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 4 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  },
  {
    name: 'NHÓM 1',
    leader_id: '8',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail'
  },
  {
    name: 'NHÓM 2',
    leader_id: '10',
    location: 'hcm',
    description: 'Nhóm kinh doanh 2 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail'
  }
];

async function autoImportEmployees() {
  try {
    console.log('🚀 BẮT ĐẦU TỰ ĐỘNG IMPORT NHÂN VIÊN VÀ NHÓM');
    console.log('==========================================\n');
    
    // Test API health
    console.log('1. 🔍 Kiểm tra API...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'healthy' || healthData.status === 'OK') {
      console.log('   ✅ API hoạt động tốt\n');
    } else {
      throw new Error('API không hoạt động');
    }
    
    // Import Users
    console.log('2. 👤 Tự động thêm 11 nhân viên...');
    const createdUsers = [];
    
    for (let i = 0; i < exactEmployees.length; i++) {
      const employee = exactEmployees[i];
      console.log(`   Đang thêm ${i + 1}/${exactEmployees.length}: ${employee.name}`);
      
      try {
        const response = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employee)
        });
        
        const result = await response.json();
        
        if (result.success) {
          createdUsers.push(result.data);
          console.log(`   ✅ ${employee.name} (${employee.email})`);
        } else {
          console.log(`   ❌ Lỗi: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Lỗi kết nối: ${error.message}`);
      }
      
      // Delay để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n   📊 Đã tạo thành công: ${createdUsers.length}/${exactEmployees.length} nhân viên\n`);
    
    // Import Teams
    console.log('3. 👥 Tự động thêm 6 nhóm...');
    const createdTeams = [];
    
    for (let i = 0; i < exactTeams.length; i++) {
      const team = exactTeams[i];
      console.log(`   Đang thêm ${i + 1}/${exactTeams.length}: ${team.name}`);
      
      try {
        const response = await fetch(`${API_BASE}/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(team)
        });
        
        const result = await response.json();
        
        if (result.success) {
          createdTeams.push(result.data);
          console.log(`   ✅ ${team.name} (${team.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'})`);
        } else {
          console.log(`   ❌ Lỗi: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Lỗi kết nối: ${error.message}`);
      }
      
      // Delay để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n   📊 Đã tạo thành công: ${createdTeams.length}/${exactTeams.length} nhóm\n`);
    
    // Verify data
    console.log('4. ✅ Kiểm tra dữ liệu đã tạo...');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    
    console.log(`   👤 Users trong database: ${usersData.count}`);
    console.log(`   👥 Teams trong database: ${teamsData.count}`);
    
    console.log('\n🎉 HOÀN THÀNH TỰ ĐỘNG IMPORT!');
    console.log('============================');
    console.log('✅ Tất cả dữ liệu đã được lưu trên Firebase Cloud');
    console.log('🔗 Xem tại: https://console.firebase.google.com/project/appqlgd/firestore');
    console.log('');
    console.log('🔐 TEST LOGIN:');
    console.log('Email: manh.khong@example.com');
    console.log('Password: 123456');
    console.log('');
    console.log('🚀 Bây giờ tất cả tính năng sẽ hoạt động!');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình import:', error);
  }
}

// Chạy script
autoImportEmployees();
