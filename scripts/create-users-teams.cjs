const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Sample users data
const sampleUsers = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    password: '123456', // Trong production nên hash
    role: 'retail_director',
    team_id: '0',
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
    id: '4',
    name: 'Trần Văn Nam',
    email: 'nam.tran@example.com',
    password: '123456',
    role: 'team_leader',
    team_id: '3',
    location: 'hcm',
    department: 'retail',
    department_type: 'retail',
    position: 'Trưởng nhóm',
    status: 'active',
    password_changed: true,
  },
  {
    id: '5',
    name: 'Phạm Thị Lan',
    email: 'lan.pham@example.com',
    password: '123456',
    role: 'employee',
    team_id: '1',
    location: 'hanoi',
    department: 'retail',
    department_type: 'retail',
    position: 'Nhân viên bán hàng',
    status: 'active',
    password_changed: true,
  },
];

// Sample teams data
const sampleTeams = [
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
    leader_id: '3',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    department: 'retail',
    department_type: 'retail',
  },
  {
    id: '3',
    name: 'NHÓM 1 - NAM',
    leader_id: '4',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail',
  },
];

async function createUsersAndTeams() {
  try {
    console.log('🚀 Bắt đầu tạo Users và Teams...\n');

    // Test API health
    console.log('1. Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('');

    // Tạo users trực tiếp trong Firestore (vì chưa có POST API cho users)
    console.log('2. Tạo users...');
    console.log('   ℹ️  Lưu ý: Users sẽ được tạo trực tiếp trong Firestore Console');
    console.log('   🔗 Truy cập: https://console.firebase.google.com/project/appqlgd/firestore');
    console.log('   📝 Tạo collection "users" và thêm các documents sau:');
    console.log('');

    sampleUsers.forEach((user, index) => {
      console.log(`   User ${index + 1}:`);
      console.log(`   - Document ID: ${user.id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Location: ${user.location}`);
      console.log('');
    });

    console.log('3. Tạo teams...');
    console.log('   ℹ️  Lưu ý: Teams sẽ được tạo trực tiếp trong Firestore Console');
    console.log('   📝 Tạo collection "teams" và thêm các documents sau:');
    console.log('');

    sampleTeams.forEach((team, index) => {
      console.log(`   Team ${index + 1}:`);
      console.log(`   - Document ID: ${team.id}`);
      console.log(`   - Name: ${team.name}`);
      console.log(`   - Leader ID: ${team.leader_id}`);
      console.log(`   - Location: ${team.location}`);
      console.log('');
    });

    // Test existing APIs
    console.log('4. Test APIs hiện có...');

    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    console.log(`✅ Users API: ${usersData.count} users found`);

    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    console.log(`✅ Teams API: ${teamsData.count} teams found`);

    console.log('');
    console.log('🎉 Hoàn thành kiểm tra APIs!');
    console.log('📋 Bước tiếp theo:');
    console.log('   1. Truy cập Firebase Console');
    console.log('   2. Tạo collections "users" và "teams"');
    console.log('   3. Thêm dữ liệu mẫu như đã liệt kê ở trên');
    console.log('   4. Test lại APIs để xác nhận dữ liệu');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Chạy script
createUsersAndTeams();
