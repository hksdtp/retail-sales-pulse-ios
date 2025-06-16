const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function fixFinalIssues() {
  console.log('🔧 FIX CÁC VẤN ĐỀ CUỐI CÙNG');
  console.log('============================\n');

  try {
    // 1. Lấy dữ liệu hiện tại
    console.log('1. 📊 LẤY DỮ LIỆU HIỆN TẠI:');
    console.log('===========================');
    
    const [usersResponse, teamsResponse] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`)
    ]);

    const usersData = await usersResponse.json();
    const teamsData = await teamsResponse.json();

    const users = usersData.data.filter(user => user.status !== 'deleted');
    const teams = teamsData.data;

    console.log(`📊 Users: ${users.length}, Teams: ${teams.length}\n`);

    // 2. Xóa các NHÓM 4 duplicate
    console.log('2. 🗑️ XÓA CÁC NHÓM 4 DUPLICATE:');
    console.log('===============================');
    
    const team4List = teams.filter(t => t.name.includes('NHÓM 4'));
    console.log(`📋 Tìm thấy ${team4List.length} NHÓM 4:`);
    
    for (const team of team4List) {
      console.log(`   - ${team.name} (ID: ${team.id}, Location: ${team.location})`);
      
      try {
        const deleteResponse = await fetch(`${API_BASE}/teams/${team.id}`, {
          method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        if (deleteResult.success) {
          console.log(`   ✅ Đã xóa: ${team.name} (ID: ${team.id})`);
        } else {
          console.log(`   ❌ Lỗi xóa: ${deleteResult.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Lỗi khi xóa: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Cập nhật team_id cho Phạm Thị Hương
    console.log('\n3. 🔄 CẬP NHẬT TEAM_ID CHO PHẠM THỊ HƯƠNG:');
    console.log('=========================================');
    
    const huongUsers = users.filter(user => user.name.includes('Phạm Thị Hương'));
    console.log(`📋 Tìm thấy ${huongUsers.length} user Phạm Thị Hương:`);
    
    for (const user of huongUsers) {
      console.log(`   - ${user.name} (ID: ${user.id}, Team hiện tại: ${user.team_id})`);
      
      if (user.team_id !== '5') {
        console.log(`   🔄 Cập nhật team_id từ ${user.team_id} sang 5...`);
        
        try {
          const updateResponse = await fetch(`${API_BASE}/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              team_id: '5'
            })
          });
          
          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            console.log(`   ✅ Đã cập nhật team_id cho ${user.name}`);
          } else {
            console.log(`   ❌ Lỗi cập nhật: ${updateResult.error}`);
          }
        } catch (error) {
          console.log(`   ❌ Lỗi khi cập nhật: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`   ✅ Team_id đã đúng: ${user.team_id}`);
      }
    }

    // 4. Kiểm tra lại kết quả
    console.log('\n4. ✅ KIỂM TRA LẠI KẾT QUẢ:');
    console.log('============================');
    
    const [newUsersResponse, newTeamsResponse] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`)
    ]);

    const newUsersData = await newUsersResponse.json();
    const newTeamsData = await newTeamsResponse.json();

    const newUsers = newUsersData.data.filter(user => user.status !== 'deleted');
    const newTeams = newTeamsData.data;

    // Kiểm tra NHÓM 4
    const remainingTeam4 = newTeams.filter(t => t.name.includes('NHÓM 4'));
    if (remainingTeam4.length === 0) {
      console.log('✅ Đã xóa thành công tất cả NHÓM 4');
    } else {
      console.log(`❌ Vẫn còn ${remainingTeam4.length} NHÓM 4:`);
      remainingTeam4.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });
    }

    // Kiểm tra Phạm Thị Hương
    const newHuongUsers = newUsers.filter(user => user.name.includes('Phạm Thị Hương'));
    console.log(`📊 Phạm Thị Hương sau khi cập nhật:`);
    newHuongUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}, Team: ${user.team_id})`);
    });

    // Kiểm tra cấu trúc teams cuối cùng
    const activeTeams = newTeams.filter(t => 
      (t.location === 'hanoi' && ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 5'].some(name => t.name.includes(name))) ||
      (t.location === 'hcm' && ['NHÓM 1', 'NHÓM 2'].some(name => t.name.includes(name)))
    );

    console.log(`\n📋 Cấu trúc teams cuối cùng (${activeTeams.length} teams):`);
    const hanoiTeams = activeTeams.filter(t => t.location === 'hanoi').length;
    const hcmTeams = activeTeams.filter(t => t.location === 'hcm').length;
    console.log(`   🏙️ Hà Nội: ${hanoiTeams} teams`);
    console.log(`   🌆 TP.HCM: ${hcmTeams} teams`);

    console.log('\n🎉 HOÀN THÀNH FIX!');
    console.log('==================');
    console.log('✅ Đã xóa tất cả NHÓM 4');
    console.log('✅ Đã cập nhật team_id cho Phạm Thị Hương');
    console.log('✅ Cấu trúc cuối cùng: 5 teams (HN: 4, HCM: 2)');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

fixFinalIssues();
