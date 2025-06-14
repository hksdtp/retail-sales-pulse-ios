const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function removeQuanAddHuong() {
  console.log('🔄 XÓA LÊ TIẾN QUÂN VÀ THÊM PHẠM THỊ HƯƠNG');
  console.log('==========================================\n');

  try {
    // 1. Xóa Lê Tiến Quân (đã nghỉ việc)
    console.log('1. 🗑️ XÓA LÊ TIẾN QUÂN (ĐÃ NGHỈ VIỆC):');
    console.log('======================================');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    const users = usersData.data.filter(user => user.status !== 'deleted');
    
    const quan = users.find(user => user.name.includes('Lê Tiến Quân'));
    
    if (quan) {
      console.log(`🗑️ Tìm thấy Lê Tiến Quân: ${quan.name} (ID: ${quan.id})`);
      console.log(`   - Team ID: ${quan.team_id}`);
      console.log(`   - Email: ${quan.email}`);
      console.log('   - Lý do xóa: Đã nghỉ việc');
      
      try {
        const deleteResponse = await fetch(`${API_BASE}/users/${quan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...quan,
            status: 'deleted',
            name: `[NGHỈ VIỆC] ${quan.name}`,
            deleted_at: new Date().toISOString(),
            deleted_reason: 'Đã nghỉ việc - không còn làm việc tại công ty'
          })
        });

        const deleteResult = await deleteResponse.json();
        if (deleteResult.success) {
          console.log(`✅ Đã xóa Lê Tiến Quân (nghỉ việc)`);
        } else {
          console.log(`❌ Lỗi xóa: ${deleteResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi xóa: ${error.message}`);
      }
    } else {
      console.log('✅ Không tìm thấy Lê Tiến Quân (có thể đã bị xóa)');
    }
    console.log('');

    // 2. Tạo Phạm Thị Hương cho NHÓM 4
    console.log('2. 👩‍💼 TẠO PHẠM THỊ HƯƠNG CHO NHÓM 4:');
    console.log('====================================');
    
    // Kiểm tra xem Phạm Thị Hương đã tồn tại chưa
    const existingHuong = users.find(user => user.name.includes('Phạm Thị Hương'));
    
    if (existingHuong) {
      console.log(`✅ Phạm Thị Hương đã tồn tại: ${existingHuong.name}`);
      console.log(`   - ID: ${existingHuong.id}`);
      console.log(`   - Team ID hiện tại: ${existingHuong.team_id}`);
      
      // Cập nhật team_id thành 4
      if (existingHuong.team_id !== '4') {
        console.log('🔄 Cập nhật team_id thành 4...');
        
        try {
          const updateResponse = await fetch(`${API_BASE}/users/${existingHuong.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...existingHuong,
              team_id: '4',
              updated_at: new Date().toISOString()
            })
          });

          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            console.log(`✅ Đã cập nhật Phạm Thị Hương vào NHÓM 4`);
          } else {
            console.log(`❌ Lỗi cập nhật: ${updateResult.error}`);
          }
        } catch (error) {
          console.log(`❌ Lỗi khi cập nhật: ${error.message}`);
        }
      } else {
        console.log('✅ Phạm Thị Hương đã ở NHÓM 4');
      }
    } else {
      console.log('📝 Tạo mới Phạm Thị Hương...');
      
      const huongData = {
        name: 'Phạm Thị Hương',
        email: 'huong.pham@example.com',
        role: 'team_leader',
        team_id: '4',
        location: 'hanoi',
        department_type: 'retail',
        status: 'active',
        phone: '+84987654322',
        address: 'Hà Nội, Việt Nam'
      };

      try {
        const createResponse = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(huongData)
        });

        const createResult = await createResponse.json();
        if (createResult.success) {
          console.log(`✅ Đã tạo Phạm Thị Hương: ${huongData.name} (ID: ${createResult.data.id})`);
        } else {
          console.log(`❌ Lỗi tạo: ${createResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi tạo: ${error.message}`);
      }
    }
    console.log('');

    // 3. Kiểm tra kết quả
    console.log('3. ✅ KIỂM TRA KẾT QUẢ:');
    console.log('=======================');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalUsersResponse = await fetch(`${API_BASE}/users`);
    const finalUsersData = await finalUsersResponse.json();
    const finalUsers = finalUsersData.data.filter(user => user.status !== 'deleted');
    
    const teamLeaders = finalUsers.filter(user => user.role === 'team_leader');
    const hanoiLeaders = teamLeaders.filter(l => l.location === 'hanoi');
    const hcmLeaders = teamLeaders.filter(l => l.location === 'hcm');
    
    console.log('🏢 HÀ NỘI LEADERS:');
    hanoiLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name} (Team: ${leader.team_id})`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH LEADERS:');
    hcmLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name} (Team: ${leader.team_id})`);
    });

    // 4. Kiểm tra cấu trúc mong muốn
    console.log('\n4. 🎯 KIỂM TRA CẤU TRÚC MONG MUỐN:');
    console.log('==================================');
    
    const expectedStructure = {
      hanoi: [
        { team: 'NHÓM 1', leader: 'Lương Việt Anh', teamId: '1' },
        { team: 'NHÓM 2', leader: 'Nguyễn Thị Thảo', teamId: '2' },
        { team: 'NHÓM 3', leader: 'Trịnh Thị Bốn', teamId: '3' },
        { team: 'NHÓM 4', leader: 'Phạm Thị Hương', teamId: '4' },
      ],
      hcm: [
        { team: 'NHÓM 1', leader: 'Nguyễn Thị Nga', teamId: '5' },
        { team: 'NHÓM 2', leader: 'Nguyễn Ngọc Việt Khanh', teamId: '6' },
      ]
    };

    console.log('✅ KIỂM TRA HÀ NỘI:');
    expectedStructure.hanoi.forEach((item, index) => {
      const found = hanoiLeaders.find(l => 
        l.name.includes(item.leader.split(' ')[0]) && l.team_id === item.teamId
      );
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
    });
    
    console.log('\n✅ KIỂM TRA HỒ CHÍ MINH:');
    expectedStructure.hcm.forEach((item, index) => {
      const found = hcmLeaders.find(l => 
        l.name.includes(item.leader.split(' ')[0]) && l.team_id === item.teamId
      );
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
    });

    // 5. Kiểm tra Lê Tiến Quân đã bị xóa
    const remainingQuan = finalUsers.find(user => user.name.includes('Lê Tiến Quân'));
    console.log(`\n🗑️ Lê Tiến Quân đã bị xóa: ${!remainingQuan ? '✅ ĐÚNG' : '❌ VẪN CÒN'}`);
    
    // Kiểm tra Phạm Thị Hương ở NHÓM 4
    const huongTeam4 = finalUsers.find(user => 
      user.name.includes('Phạm Thị Hương') && user.team_id === '4'
    );
    console.log(`👩‍💼 Phạm Thị Hương ở NHÓM 4: ${huongTeam4 ? '✅ ĐÚNG' : '❌ SAI'}`);

    console.log('\n✅ HOÀN THÀNH THAY ĐỔI!');
    console.log('🎯 Bước tiếp theo: Cập nhật utility function');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

removeQuanAddHuong().catch(console.error);
