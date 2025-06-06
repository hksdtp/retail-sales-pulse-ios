const fetch = require('node-fetch');

// DANH SÁCH CHÍNH XÁC THEO YÊU CẦU
const exactEmployeeData = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    password: '123456',
    role: 'retail_director',
    team_id: '0', // Chưa có nhóm
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng phòng kinh doanh bán lẻ',
    status: 'active',
    password_changed: true,
  },
  {
    id: '2',
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
    password_changed: true,
  },
  {
    id: '3',
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
    password_changed: true,
  },
  {
    id: '4',
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
    password_changed: true,
  },
  {
    id: '5',
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
    password_changed: true,
  },
  {
    id: '6',
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
    password_changed: true,
  },
  {
    id: '7',
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
    password_changed: true,
  },
  {
    id: '8',
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
    password_changed: true,
  },
  {
    id: '9',
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
    password_changed: true,
  },
  {
    id: '10',
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
    password_changed: true,
  },
  {
    id: '11',
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
    password_changed: true,
  },
];

const exactTeamsData = [
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '4',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: '6',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 3 Hà Nội',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '4',
    name: 'NHÓM 4',
    leader_id: '7',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 4 Hà Nội',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '5',
    name: 'NHÓM 1',
    leader_id: '8',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '6',
    name: 'NHÓM 2',
    leader_id: '10',
    location: 'hcm',
    description: 'Nhóm kinh doanh 2 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail',
  },
];

function displayImportInstructions() {
  console.log('🚀 IMPORT CHÍNH XÁC THEO DANH SÁCH NHÂN VIÊN');
  console.log('===========================================\n');

  console.log('🔥 1. MỞ FIREBASE CONSOLE:');
  console.log('   https://console.firebase.google.com/project/appqlgd/firestore\n');

  console.log('👤 2. TẠO COLLECTION "users" - 11 NHÂN VIÊN:');
  console.log('============================================');

  exactEmployeeData.forEach((user, index) => {
    console.log(`\n📄 Document ID: ${user.id}`);
    console.log(
      `👤 ${user.name} - ${user.role === 'retail_director' ? 'Giám đốc' : user.role === 'team_leader' ? 'Trưởng nhóm' : 'Nhân viên'}`,
    );
    console.log(`📧 ${user.email} | 📍 ${user.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}`);
    console.log('📋 Copy JSON này:');
    const { id, ...userData } = user;
    console.log(JSON.stringify(userData, null, 2));
    console.log('---');
  });

  console.log('\n\n👥 3. TẠO COLLECTION "teams" - 6 NHÓM:');
  console.log('=====================================');

  exactTeamsData.forEach((team, index) => {
    console.log(`\n📄 Document ID: ${team.id}`);
    console.log(`👥 ${team.name} | 📍 ${team.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}`);
    console.log('📋 Copy JSON này:');
    const { id, ...teamData } = team;
    console.log(JSON.stringify(teamData, null, 2));
    console.log('---');
  });

  console.log('\n\n📊 4. TỔNG KẾT:');
  console.log('===============');
  console.log(`✅ Tổng cộng: ${exactEmployeeData.length} nhân viên`);
  console.log('📍 Hà Nội: 7 người (1 Giám đốc + 4 Trưởng nhóm + 2 Nhân viên)');
  console.log('📍 Hồ Chí Minh: 4 người (2 Trưởng nhóm + 2 Nhân viên)');
  console.log(`👥 Tổng cộng: ${exactTeamsData.length} nhóm`);

  console.log('\n\n🔐 5. THÔNG TIN ĐĂNG NHẬP:');
  console.log('=========================');
  console.log('Tất cả nhân viên đều có password: 123456');
  console.log('');
  console.log('Test với Giám đốc:');
  console.log('Email: manh.khong@example.com');
  console.log('Password: 123456');
  console.log('');
  console.log('Test với Trưởng nhóm:');
  console.log('Email: vietanh@example.com');
  console.log('Password: 123456');

  console.log('\n✅ CHÍNH XÁC 100% theo danh sách bạn cung cấp!');
}

// Chạy script
displayImportInstructions();
