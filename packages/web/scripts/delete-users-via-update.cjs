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

async function markUsersAsDeleted() {
  console.log('🗑️ ĐÁNH DẤU DUPLICATE USERS LÀ ĐÃ XÓA');
  console.log('=====================================\n');

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

    // 3. Đánh dấu users là deleted thay vì xóa thật
    console.log('3. 🏷️ Đánh dấu users duplicate là DELETED...');
    let markedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < usersToDelete.length; i++) {
      const user = usersToDelete[i];
      console.log(`🏷️ Đánh dấu ${i + 1}/${usersToDelete.length}: "${user.name}" (ID: ${user.id})`);

      try {
        // Cập nhật user với status = 'deleted' và ẩn khỏi danh sách
        const updateData = {
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_reason: user.reason,
          name: `[DELETED] ${user.name}`,
          email: `deleted_${user.id}@deleted.com`,
          active: false
        };

        const response = await fetch(`${API_BASE}/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            markedCount++;
            console.log(`   ✅ Đã đánh dấu: "${user.name}"`);
          } else {
            errorCount++;
            console.log(`   ❌ Lỗi đánh dấu: "${user.name}" - ${result.error || 'Unknown error'}`);
          }
        } else {
          errorCount++;
          console.log(`   ❌ HTTP Error: "${user.name}" - Status ${response.status}`);
        }

        // Delay để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Lỗi khi đánh dấu: "${user.name}" - ${error.message}`);
      }
    }

    console.log('');

    // 4. Kiểm tra kết quả
    console.log('4. 📊 Kiểm tra kết quả...');
    const finalUsersResponse = await fetch(`${API_BASE}/users`);
    const finalUsersData = await finalUsersResponse.json();

    // Lọc ra users active (không bị deleted)
    const activeUsers = finalUsersData.data.filter(user => user.status !== 'deleted');
    const deletedUsers = finalUsersData.data.filter(user => user.status === 'deleted');

    console.log('📊 KẾT QUẢ ĐÁNH DẤU DUPLICATE USERS:');
    console.log('===================================');
    console.log(`✅ Users đã đánh dấu deleted: ${markedCount}/${usersToDelete.length}`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📋 Tổng users trong DB: ${finalUsersData.data.length}`);
    console.log(`✅ Users active: ${activeUsers.length}`);
    console.log(`🗑️ Users deleted: ${deletedUsers.length}`);
    console.log('');

    if (activeUsers.length > 0) {
      console.log('✅ Danh sách users ACTIVE (unique):');
      activeUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. "${user.name}" (${user.email})`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - Role: ${user.role || 'undefined'}`);
        console.log(`      - Team: ${user.team_id || 'undefined'}`);
        console.log(`      - Status: ${user.status || 'undefined'}`);
        console.log('');
      });
    }

    if (deletedUsers.length > 0) {
      console.log('🗑️ Danh sách users DELETED:');
      deletedUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. "${user.name}" - ${user.deleted_reason || 'No reason'}`);
      });
      console.log('');
    }

    // 5. Kiểm tra duplicate trong users active
    console.log('5. 🔍 Kiểm tra duplicate trong users active...');
    const emailCounts = {};
    activeUsers.forEach(user => {
      const email = user.email || 'no-email';
      if (!email.startsWith('deleted_')) {
        emailCounts[email] = (emailCounts[email] || 0) + 1;
      }
    });

    const remainingDuplicates = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ HOÀN HẢO! Không còn duplicate users trong danh sách active');
    } else {
      console.log(`⚠️ Còn ${remainingDuplicates.length} email bị duplicate trong users active:`);
      remainingDuplicates.forEach(email => {
        console.log(`   - ${email}: ${emailCounts[email]} users`);
      });
    }

    console.log('');
    console.log('🎉 HOÀN THÀNH ĐÁNH DẤU DUPLICATE USERS!');
    console.log('📋 Users duplicate đã được ẩn khỏi hệ thống');
    console.log('✅ Chỉ còn users unique trong danh sách active');
    console.log('🌐 Web app sẽ chỉ hiển thị users active');

    return {
      markedCount,
      errorCount,
      totalUsers: finalUsersData.data.length,
      activeUsers: activeUsers.length,
      deletedUsers: deletedUsers.length,
      remainingDuplicates: remainingDuplicates.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi đánh dấu duplicate users:', error.message);
  }
}

// Chạy script
console.log('🚨 SCRIPT ĐÁNH DẤU 11 DUPLICATE USERS LÀ DELETED');
console.log('📋 Thay vì xóa thật, sẽ đánh dấu status = deleted');
console.log('✅ Users active sẽ unique, users deleted sẽ ẩn');
console.log('⏰ Bắt đầu sau 2 giây...\n');

setTimeout(() => {
  markUsersAsDeleted().catch(console.error);
}, 2000);
