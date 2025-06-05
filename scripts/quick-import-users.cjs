const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Dữ liệu users để import
const usersData = [
  {
    id: '1',
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
    password_changed: true
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
    password_changed: true
  }
];

const teamsData = [
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: '2',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 1 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '3',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    department: 'retail',
    department_type: 'retail'
  }
];

async function quickImport() {
  console.log('🚀 QUICK IMPORT - Thêm Users và Teams nhanh...\n');
  
  console.log('📋 COPY-PASTE DATA CHO FIREBASE CONSOLE:');
  console.log('=====================================\n');
  
  console.log('🔥 1. MỞ FIREBASE CONSOLE:');
  console.log('   https://console.firebase.google.com/project/appqlgd/firestore\n');
  
  console.log('👤 2. TẠO COLLECTION "users" VÀ THÊM CÁC DOCUMENTS:');
  console.log('---------------------------------------------------');
  
  usersData.forEach((user, index) => {
    console.log(`\n📄 Document ID: ${user.id}`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log('📋 Copy JSON này:');
    const { id, ...userData } = user;
    console.log(JSON.stringify(userData, null, 2));
    console.log('---');
  });
  
  console.log('\n\n👥 3. TẠO COLLECTION "teams" VÀ THÊM CÁC DOCUMENTS:');
  console.log('---------------------------------------------------');
  
  teamsData.forEach((team, index) => {
    console.log(`\n📄 Document ID: ${team.id}`);
    console.log(`👥 Team: ${team.name}`);
    console.log('📋 Copy JSON này:');
    const { id, ...teamData } = team;
    console.log(JSON.stringify(teamData, null, 2));
    console.log('---');
  });
  
  console.log('\n\n🎯 4. HƯỚNG DẪN NHANH:');
  console.log('=====================');
  console.log('1. Mở Firebase Console');
  console.log('2. Click "Start collection" → nhập "users"');
  console.log('3. Với mỗi user ở trên:');
  console.log('   - Document ID: copy số ID');
  console.log('   - Fields: copy toàn bộ JSON và paste');
  console.log('4. Tương tự với collection "teams"');
  console.log('5. Test login: manh.khong@example.com / 123456');
  
  console.log('\n\n🔐 5. TEST LOGIN SAU KHI IMPORT:');
  console.log('================================');
  console.log('Email: manh.khong@example.com');
  console.log('Password: 123456');
  
  console.log('\n✅ Sau khi import xong, tất cả tính năng sẽ hoạt động!');
}

// Chạy script
quickImport();
