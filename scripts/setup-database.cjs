const admin = require('firebase-admin');

// Initialize Firebase Admin với emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'appqlgd'
});

const db = admin.firestore();

// Sample data cho collections
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
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
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
      updated_at: admin.firestore.FieldValue.serverTimestamp()
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
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  
  tasks: [
    {
      title: 'Báo cáo doanh thu tháng 6',
      description: 'Tổng hợp doanh thu bán lẻ tháng 6 theo từng cửa hàng',
      type: 'report',
      status: 'todo',
      date: '2025-06-04',
      time: '09:00',
      progress: 0,
      user_id: '2',
      user_name: 'Lương Việt Anh',
      team_id: '1',
      location: 'hanoi',
      assignedTo: '2',
      isNew: true,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      title: 'Liên hệ khách hàng mới',
      description: 'Gọi điện và xác nhận lịch gặp mặt với khách hàng ABC',
      type: 'client_new',
      status: 'in-progress',
      date: '2025-06-04',
      time: '14:00',
      progress: 50,
      user_id: '3',
      user_name: 'Nguyễn Thị Thảo',
      team_id: '2',
      location: 'hanoi',
      assignedTo: '3',
      isNew: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  
  settings: [
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Phiên bản ứng dụng hiện tại',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Chế độ bảo trì hệ thống',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function setupDatabase() {
  try {
    console.log('🚀 Bắt đầu thiết lập database schema...');
    
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
    
    console.log('🎉 Thiết lập database thành công!');
    console.log('📊 Collections đã tạo:');
    console.log('  - users (3 documents)');
    console.log('  - teams (2 documents)');
    console.log('  - tasks (2 documents)');
    console.log('  - settings (2 documents)');
    
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập database:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
setupDatabase();
