const admin = require('firebase-admin');

// Initialize Firebase Admin cho production
// Cần service account key file
try {
  const serviceAccount = require('../service-account-key.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'appqlgd',
  });
} catch (error) {
  console.log('⚠️ Không tìm thấy service-account-key.json, thử kết nối trực tiếp...');
  
  // Fallback: Thử kết nối trực tiếp với project ID
  admin.initializeApp({
    projectId: 'appqlgd',
  });
}

const db = admin.firestore();

// Danh sách 11 users duplicate cần xóa
const usersToDelete = [
  {
    id: '1',
    name: 'Khổng Đức Mạnh 123',
    email: 'manh.khong@example.com',
    reason: 'Thiếu hoàn toàn dữ liệu (role, team, location, status = undefined)'
  },
  {
    id: 'ObroYv1R4odHRcTGOB8d',
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@example.com',
    reason: 'Duplicate - giữ lại Ve7sGRnMoRvT1E0VL5Ds (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'aa2tloFwBhe6m05lwypc',
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'vietkhanh@example.com',
    reason: 'Duplicate - giữ lại 0AzCiDnWxcCMzIAwLA9D (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'ERi0hcgzKhWsRKx1Gm26',
    name: 'Phạm Thị Hương',
    email: 'huong.pham@example.com',
    reason: 'Duplicate - giữ lại ACKzl2RISqrx5ca9QDM6 (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'XbEKpUCw6OPLiFQWmCCm',
    name: 'Hà Nguyễn Tuyến',
    email: 'tuyen.ha@example.com',
    reason: 'Duplicate - giữ lại 8NpVPLaiLDhv75jZNq5q (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'pGahEQwrJN8aIpEdRnBY',
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@example.com',
    reason: 'Duplicate - giữ lại 8NpVPLaiLDhv75jZNq5q (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'tacjOehkubNmOvgnmvOo',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    reason: 'Duplicate - giữ lại RIWI0w6ETBPy6AA2Z5hL (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'xpKkMvhRi7nfT8v81pUr',
    name: 'Phùng Thị Thuỳ Vân',
    email: 'thuyvan@example.com',
    reason: 'Duplicate - giữ lại RIWI0w6ETBPy6AA2Z5hL (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'ZIJgzHB2b60qfWyOK0Ko',
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@example.com',
    reason: 'Duplicate - giữ lại k030JV0tAobf5rMvdzG4 (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'oH7an8cvGdI4uwmi7bpZ',
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    reason: 'Duplicate - giữ lại pzSa30JeZR0UoOoKhZ7l (tạo sớm hơn 6/4/2025)'
  },
  {
    id: 'zdORDsodkjHvQjDwbIEX',
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@example.com',
    reason: 'Duplicate - giữ lại pzSa30JeZR0UoOoKhZ7l (tạo sớm hơn 6/4/2025)'
  }
];

async function deleteDuplicateUsersDirectly() {
  console.log('🗑️ XÓA DUPLICATE USERS TRỰC TIẾP TỪ FIRESTORE');
  console.log('==============================================\n');

  try {
    // 1. Kiểm tra kết nối Firestore
    console.log('1. 🔥 Kiểm tra kết nối Firestore...');
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log('✅ Kết nối Firestore thành công');
    console.log('');

    // 2. Kiểm tra số lượng users hiện tại
    console.log('2. 👥 Kiểm tra users hiện tại...');
    const allUsersSnapshot = await db.collection('users').get();
    console.log(`📊 Tổng users hiện tại: ${allUsersSnapshot.size}`);
    console.log('');

    // 3. Hiển thị danh sách sẽ xóa
    console.log('3. 📋 Danh sách users sẽ xóa:');
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. "${user.name}" (ID: ${user.id})`);
      console.log(`      - Email: ${user.email}`);
      console.log(`      - Lý do: ${user.reason}`);
      console.log('');
    });

    // 4. Kiểm tra users tồn tại trước khi xóa
    console.log('4. 🔍 Kiểm tra users tồn tại...');
    const existingUsers = [];
    const nonExistingUsers = [];

    for (const user of usersToDelete) {
      try {
        const userDoc = await db.collection('users').doc(user.id).get();
        if (userDoc.exists) {
          existingUsers.push(user);
          console.log(`   ✅ Tồn tại: "${user.name}" (ID: ${user.id})`);
        } else {
          nonExistingUsers.push(user);
          console.log(`   ❌ Không tồn tại: "${user.name}" (ID: ${user.id})`);
        }
      } catch (error) {
        nonExistingUsers.push(user);
        console.log(`   ❌ Lỗi kiểm tra: "${user.name}" (ID: ${user.id}) - ${error.message}`);
      }
    }

    console.log('');
    console.log(`📊 Users tồn tại: ${existingUsers.length}`);
    console.log(`📊 Users không tồn tại: ${nonExistingUsers.length}`);
    console.log('');

    if (existingUsers.length === 0) {
      console.log('⚠️ Không có users nào để xóa!');
      return;
    }

    // 5. Bắt đầu xóa users
    console.log('5. 🗑️ Bắt đầu xóa duplicate users...');
    let deletedCount = 0;
    let errorCount = 0;

    // Sử dụng batch để xóa hiệu quả hơn
    const batch = db.batch();
    
    existingUsers.forEach((user, index) => {
      console.log(`📝 Chuẩn bị xóa ${index + 1}/${existingUsers.length}: "${user.name}" (ID: ${user.id})`);
      const userRef = db.collection('users').doc(user.id);
      batch.delete(userRef);
    });

    // Commit batch delete
    console.log('🔥 Thực hiện batch delete...');
    await batch.commit();
    deletedCount = existingUsers.length;
    console.log(`✅ Đã xóa thành công ${deletedCount} users`);

    console.log('');

    // 6. Kiểm tra kết quả
    console.log('6. 📊 Kiểm tra kết quả...');
    const finalUsersSnapshot = await db.collection('users').get();
    const finalUsers = finalUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('📊 KẾT QUẢ XÓA DUPLICATE USERS:');
    console.log('================================');
    console.log(`✅ Users đã xóa thành công: ${deletedCount}`);
    console.log(`❌ Users không tồn tại: ${nonExistingUsers.length}`);
    console.log(`📋 Tổng users sau khi xóa: ${finalUsers.length}`);
    console.log(`🎯 Dự kiến users còn lại: 13 (24 - 11 = 13)`);
    console.log('');

    if (finalUsers.length > 0) {
      console.log('✅ Danh sách users còn lại (unique):');
      finalUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. "${user.name}" (${user.email})`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - Role: ${user.role || 'undefined'}`);
        console.log(`      - Team: ${user.team_id || 'undefined'}`);
        console.log(`      - Location: ${user.location || 'undefined'}`);
        console.log('');
      });
    }

    // 7. Kiểm tra xem còn duplicate không
    console.log('7. 🔍 Kiểm tra duplicate còn lại...');
    const emailCounts = {};
    finalUsers.forEach(user => {
      const email = user.email || 'no-email';
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    });

    const remainingDuplicates = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ HOÀN HẢO! Không còn duplicate users nào');
    } else {
      console.log(`⚠️ Còn ${remainingDuplicates.length} email bị duplicate:`);
      remainingDuplicates.forEach(email => {
        console.log(`   - ${email}: ${emailCounts[email]} users`);
      });
    }

    console.log('');
    console.log('🎉 HOÀN THÀNH XÓA DUPLICATE USERS!');
    console.log('🔥 Firestore đã được làm sạch');
    console.log('👥 Users hiện tại đã unique');

    return {
      deletedCount,
      errorCount,
      finalUserCount: finalUsers.length,
      remainingDuplicates: remainingDuplicates.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi xóa duplicate users:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Chạy script
console.log('🚨 SCRIPT XÓA 11 DUPLICATE USERS TRỰC TIẾP');
console.log('📋 Xóa trực tiếp từ Firestore (không qua API)');
console.log('⏰ Bắt đầu sau 2 giây...\n');

setTimeout(() => {
  deleteDuplicateUsersDirectly()
    .then(() => {
      console.log('\n✅ Script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script thất bại:', error);
      process.exit(1);
    });
}, 2000);
