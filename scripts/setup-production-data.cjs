const admin = require('firebase-admin');

// Initialize Firebase Admin cho production
// Cần service account key file
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'appqlgd',
});

const db = admin.firestore();

// Sample data cho production
const sampleData = {
  users: [
    {
      id: '1',
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@example.com',
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
  ],

  teams: [
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
  ],

  settings: [
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Phiên bản ứng dụng hiện tại',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Chế độ bảo trì hệ thống',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      key: 'google_sheets_enabled',
      value: true,
      description: 'Kích hoạt đồng bộ Google Sheets',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
  ],
};

async function setupProductionDatabase() {
  try {
    console.log('🌐 Bắt đầu thiết lập database PRODUCTION...');

    // Tạo collections và thêm sample data
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      console.log(`📝 Đang tạo collection: ${collectionName}`);

      for (const doc of documents) {
        const docId = doc.id || admin.firestore().collection(collectionName).doc().id;
        delete doc.id; // Xóa id khỏi data để không lưu vào document

        await db.collection(collectionName).doc(docId).set(doc);
        console.log(`  ✅ Đã tạo document: ${docId}`);
      }
    }

    console.log('🎉 Thiết lập database PRODUCTION thành công!');
    console.log('📊 Collections đã tạo:');
    console.log('  - users (4 documents)');
    console.log('  - teams (3 documents)');
    console.log('  - settings (3 documents)');
    console.log('');
    console.log('🌐 Dữ liệu đã được lưu trên Firebase Cloud!');
    console.log('🔗 Xem tại: https://console.firebase.google.com/project/appqlgd/firestore');
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập database:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
setupProductionDatabase();
