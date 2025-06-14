const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function deleteDuplicateQuanAndFixMapping() {
  console.log('🗑️ XÓA LÊ TIẾN QUÂN DUPLICATE VÀ SỬA MAPPING');
  console.log('============================================\n');

  try {
    // 1. Tìm và xóa Lê Tiến Quân duplicate (vừa tạo)
    console.log('1. 🔍 TÌM LÊ TIẾN QUÂN DUPLICATE:');
    console.log('=================================');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    const users = usersData.data.filter(user => user.status !== 'deleted');
    
    const quanUsers = users.filter(user => user.name.includes('Quân'));
    console.log(`📊 Tìm thấy ${quanUsers.length} user có tên chứa "Quân":`);
    
    quanUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
      console.log(`      - Email: ${user.email}`);
      console.log(`      - Team ID: ${user.team_id}`);
      console.log(`      - Created: ${user.created_at ? new Date(user.created_at._seconds * 1000).toLocaleString() : 'N/A'}`);
    });
    console.log('');

    // Tìm user vừa tạo (có email quan.le@example.com)
    const duplicateQuan = quanUsers.find(user => user.email === 'quan.le@example.com');
    
    if (duplicateQuan) {
      console.log(`🗑️ Xóa Lê Tiến Quân duplicate: ${duplicateQuan.name} (ID: ${duplicateQuan.id})`);
      
      try {
        const deleteResponse = await fetch(`${API_BASE}/users/${duplicateQuan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...duplicateQuan,
            status: 'deleted',
            name: `[DELETED] ${duplicateQuan.name}`,
            deleted_at: new Date().toISOString(),
            deleted_reason: 'Duplicate user - không cần thiết'
          })
        });

        const deleteResult = await deleteResponse.json();
        if (deleteResult.success) {
          console.log(`✅ Đã xóa duplicate Quân`);
        } else {
          console.log(`❌ Lỗi xóa: ${deleteResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi xóa: ${error.message}`);
      }
    } else {
      console.log('✅ Không tìm thấy duplicate Quân cần xóa');
    }
    console.log('');

    // 2. Xóa NHÓM 5 không cần thiết
    console.log('2. 🗑️ XÓA NHÓM 5 KHÔNG CẦN THIẾT:');
    console.log('=================================');
    
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data;
    
    const team5 = teams.find(t => t.name === 'NHÓM 5' && t.location === 'hanoi');
    
    if (team5) {
      console.log(`🗑️ Xóa NHÓM 5: ${team5.name} (ID: ${team5.id})`);
      
      try {
        const deleteTeamResponse = await fetch(`${API_BASE}/teams/${team5.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...team5,
            name: `[DELETED] ${team5.name}`,
            active: false,
            deleted_at: new Date().toISOString()
          })
        });

        const deleteTeamResult = await deleteTeamResponse.json();
        if (deleteTeamResult.success) {
          console.log(`✅ Đã xóa NHÓM 5`);
        } else {
          console.log(`❌ Lỗi xóa team: ${deleteTeamResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi xóa team: ${error.message}`);
      }
    } else {
      console.log('✅ Không tìm thấy NHÓM 5 cần xóa');
    }
    console.log('');

    // 3. Kiểm tra cấu trúc sau khi xóa
    console.log('3. ✅ KIỂM TRA CẤU TRÚC SAU KHI XÓA:');
    console.log('===================================');
    
    const finalUsersResponse = await fetch(`${API_BASE}/users`);
    const finalUsersData = await finalUsersResponse.json();
    const finalUsers = finalUsersData.data.filter(user => user.status !== 'deleted');
    
    const teamLeaders = finalUsers.filter(user => user.role === 'team_leader');
    
    console.log(`📊 Team leaders còn lại: ${teamLeaders.length}`);
    
    const hanoiLeaders = teamLeaders.filter(l => l.location === 'hanoi');
    const hcmLeaders = teamLeaders.filter(l => l.location === 'hcm');
    
    console.log('\n🏢 HÀ NỘI LEADERS:');
    hanoiLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name} (Team: ${leader.team_id})`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH LEADERS:');
    hcmLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name} (Team: ${leader.team_id})`);
    });

    // 4. Mapping theo file JSON chuẩn
    console.log('\n4. 🎯 MAPPING THEO FILE JSON CHUẨN:');
    console.log('==================================');
    
    const correctMapping = {
      hanoi: {
        'NHÓM 1': 'Lương Việt Anh',
        'NHÓM 2': 'Nguyễn Thị Thảo', 
        'NHÓM 3': 'Trịnh Thị Bốn',
        'NHÓM 4': 'Lê Tiến Quân',     // Quân có sẵn
        'NHÓM 5': 'Phạm Thị Hương',   // Hương team 5
      },
      hcm: {
        'NHÓM 1': 'Nguyễn Thị Nga',
        'NHÓM 2': 'Nguyễn Ngọc Việt Khanh',
      }
    };

    console.log('✅ MAPPING ĐÚNG THEO FILE JSON:');
    console.log('🏢 HÀ NỘI:');
    Object.entries(correctMapping.hanoi).forEach(([team, leader]) => {
      const found = hanoiLeaders.find(l => l.name.includes(leader.split(' ')[0]));
      console.log(`   ${team} - ${leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
    });
    
    console.log('🏢 HỒ CHÍ MINH:');
    Object.entries(correctMapping.hcm).forEach(([team, leader]) => {
      const found = hcmLeaders.find(l => l.name.includes(leader.split(' ')[0]));
      console.log(`   ${team} - ${leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
    });

    console.log('\n✅ HOÀN THÀNH XÓA DUPLICATE VÀ CHUẨN BỊ MAPPING!');
    console.log('🎯 Bước tiếp theo: Cập nhật utility function theo cấu trúc chuẩn');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

deleteDuplicateQuanAndFixMapping().catch(console.error);
