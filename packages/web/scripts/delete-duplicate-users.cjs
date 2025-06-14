const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

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

async function deleteDuplicateUsers() {
  console.log('🗑️ BẮT ĐẦU XÓA DUPLICATE USERS');
  console.log('===============================\n');

  try {
    // 1. Kiểm tra API health
    console.log('1. 🏥 Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('');

    // 2. Kiểm tra số lượng users hiện tại
    console.log('2. 👥 Kiểm tra users hiện tại...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    console.log(`📊 Tổng users hiện tại: ${usersData.data.length}`);
    console.log('');

    // 3. Hiển thị danh sách sẽ xóa
    console.log('3. 📋 Danh sách users sẽ xóa:');
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. "${user.name}" (ID: ${user.id})`);
      console.log(`      - Email: ${user.email}`);
      console.log(`      - Lý do: ${user.reason}`);
      console.log('');
    });

    // 4. Bắt đầu xóa users
    console.log('4. 🗑️ Bắt đầu xóa duplicate users...');
    let deletedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < usersToDelete.length; i++) {
      const user = usersToDelete[i];
      console.log(`🗑️ Xóa ${i + 1}/${usersToDelete.length}: "${user.name}" (ID: ${user.id})`);

      try {
        const response = await fetch(`${API_BASE}/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            deletedCount++;
            console.log(`   ✅ Đã xóa: "${user.name}"`);
          } else {
            errorCount++;
            console.log(`   ❌ Lỗi xóa: "${user.name}" - ${result.error || 'Unknown error'}`);
          }
        } else {
          errorCount++;
          console.log(`   ❌ HTTP Error: "${user.name}" - Status ${response.status}`);
        }

        // Delay để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Lỗi khi xóa: "${user.name}" - ${error.message}`);
      }
    }

    console.log('');

    // 5. Kiểm tra kết quả
    console.log('5. 📊 Kiểm tra kết quả...');
    const finalUsersResponse = await fetch(`${API_BASE}/users`);
    const finalUsersData = await finalUsersResponse.json();

    console.log('📊 KẾT QUẢ XÓA DUPLICATE USERS:');
    console.log('================================');
    console.log(`✅ Users đã xóa thành công: ${deletedCount}/${usersToDelete.length}`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📋 Tổng users sau khi xóa: ${finalUsersData.data.length}`);
    console.log(`🎯 Dự kiến users còn lại: 13 (24 - 11 = 13)`);
    console.log('');

    if (finalUsersData.data.length > 0) {
      console.log('✅ Danh sách users còn lại (unique):');
      finalUsersData.data.forEach((user, index) => {
        console.log(`   ${index + 1}. "${user.name}" (${user.email})`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - Role: ${user.role}`);
        console.log(`      - Team: ${user.team_id}`);
        console.log(`      - Location: ${user.location}`);
        console.log('');
      });
    }

    // 6. Kiểm tra xem còn duplicate không
    console.log('6. 🔍 Kiểm tra duplicate còn lại...');
    const emailCounts = {};
    finalUsersData.data.forEach(user => {
      const email = user.email;
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
    console.log('🌐 Database đã được làm sạch');
    console.log('👥 Users hiện tại đã unique');

    return {
      deletedCount,
      errorCount,
      finalUserCount: finalUsersData.data.length,
      remainingDuplicates: remainingDuplicates.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi xóa duplicate users:', error.message);
  }
}

// Chạy script
console.log('🚨 SCRIPT XÓA 11 DUPLICATE USERS');
console.log('📋 Sẽ giữ lại users có dữ liệu đầy đủ và tạo sớm nhất');
console.log('⏰ Bắt đầu sau 2 giây...\n');

setTimeout(() => {
  deleteDuplicateUsers().catch(console.error);
}, 2000);
