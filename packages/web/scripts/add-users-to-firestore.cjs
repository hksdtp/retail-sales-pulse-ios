const admin = require('firebase-admin');

// Initialize Firebase Admin với emulator
// Kết nối tới Firebase Emulator thay vì production
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  // projectId: 'appqlgd',
  projectId: 'dccxx-dev',
});

const db = admin.firestore();

// Sample users data
const sampleUsers = [
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
    password_changed: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
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
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: '3',
    location: 'hanoi',
    description: 'Nhóm kinh doanh 2 Hà Nội',
    department: 'retail',
    department_type: 'retail',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: '3',
    name: 'NHÓM 1 - NAM',
    leader_id: '4',
    location: 'hcm',
    description: 'Nhóm kinh doanh 1 Hồ Chí Minh',
    department: 'retail',
    department_type: 'retail',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function addUsersAndTeams() {
  try {
    console.log('🚀 Bắt đầu thêm Users và Teams vào Firebase Emulator...\n');
    console.log('🔧 Kết nối tới Firestore Emulator: localhost:8080\n');

    // Thêm users
    console.log('1. Thêm users...');
    for (const user of sampleUsers) {
      const { id, ...userData } = user;
      await db.collection('users').doc(id).set(userData);
      console.log(`   ✅ Đã thêm user: ${user.name} (${user.email})`);
    }

    console.log('');

    // Thêm teams
    console.log('2. Thêm teams...');
    for (const team of sampleTeams) {
      const { id, ...teamData } = team;
      await db.collection('teams').doc(id).set(teamData);
      console.log(`   ✅ Đã thêm team: ${team.name}`);
    }

    console.log('');
    console.log('🎉 Hoàn thành thêm dữ liệu vào Firebase Emulator!');
    console.log('📊 Đã thêm:');
    console.log(`   - ${sampleUsers.length} users`);
    console.log(`   - ${sampleTeams.length} teams`);
    console.log('');
    console.log('🔗 Kiểm tra tại Firebase Emulator UI: http://localhost:4000');
    console.log('📱 Hoặc truy cập Firestore Emulator trực tiếp: http://localhost:8080');
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
addUsersAndTeams();
