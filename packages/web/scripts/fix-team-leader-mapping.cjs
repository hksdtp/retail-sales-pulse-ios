const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function fixTeamLeaderMapping() {
  console.log('🔧 SỬA MAPPING TEAM LEADERS');
  console.log('===========================\n');

  try {
    // 1. Lấy dữ liệu hiện tại
    console.log('1. 📥 Lấy dữ liệu users và teams...');
    
    const [usersResponse, teamsResponse] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`)
    ]);

    const usersData = await usersResponse.json();
    const teamsData = await teamsResponse.json();

    const users = usersData.data.filter(user => user.status !== 'deleted');
    const teams = teamsData.data;

    console.log(`✅ Users active: ${users.length}`);
    console.log(`✅ Teams: ${teams.length}`);
    console.log('');

    // 2. Phân tích mapping hiện tại
    console.log('2. 🔍 Phân tích mapping hiện tại...');
    
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    console.log('👨‍💼 Team Leaders hiện tại:');
    teamLeaders.forEach(leader => {
      console.log(`   - ${leader.name} (ID: ${leader.id}) -> Team ID: ${leader.team_id}`);
    });
    console.log('');

    console.log('🏢 Teams hiện tại:');
    teams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id}) -> Leader ID: ${team.leader_id}`);
    });
    console.log('');

    // 3. Tạo mapping mới dựa trên team_id của users
    console.log('3. 🔄 Tạo mapping mới...');
    
    const teamMapping = {
      '1': 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
      '2': 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo  
      '3': 'k030JV0tAobf5rMvdzG4', // Trịnh Thị Bốn
      '4': 'ACKzl2RISqrx5ca9QDM6', // Phạm Thị Hương
      '5': 'pzSa30JeZR0UoOoKhZ7l', // Nguyễn Thị Nga
      '6': '0AzCiDnWxcCMzIAwLA9D', // Nguyễn Ngọc Việt Khanh
    };

    console.log('📋 Mapping mới:');
    Object.entries(teamMapping).forEach(([teamId, leaderId]) => {
      const leader = users.find(u => u.id === leaderId);
      console.log(`   Team ${teamId} -> ${leader ? leader.name : 'Unknown'} (${leaderId})`);
    });
    console.log('');

    // 4. Cập nhật teams với leader_id đúng
    console.log('4. 🔄 Cập nhật teams...');
    
    for (const team of teams) {
      // Tìm team leader dựa trên team name pattern
      let newLeaderId = null;
      
      if (team.name.includes('NHÓM 1')) {
        newLeaderId = teamMapping['1']; // Lương Việt Anh
      } else if (team.name.includes('NHÓM 2')) {
        if (team.location === 'hanoi') {
          newLeaderId = teamMapping['2']; // Nguyễn Thị Thảo
        } else {
          newLeaderId = teamMapping['2']; // Nguyễn Thị Thảo (HCM cũng dùng chung)
        }
      } else if (team.name.includes('NHÓM 3')) {
        newLeaderId = teamMapping['3']; // Trịnh Thị Bốn
      } else if (team.name.includes('NHÓM 4')) {
        newLeaderId = teamMapping['4']; // Phạm Thị Hương
      }

      if (newLeaderId && newLeaderId !== team.leader_id) {
        console.log(`🔄 Cập nhật team "${team.name}" (${team.id})`);
        console.log(`   Từ leader_id: ${team.leader_id} -> ${newLeaderId}`);
        
        try {
          const updateResponse = await fetch(`${API_BASE}/teams/${team.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...team,
              leader_id: newLeaderId
            })
          });

          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            console.log(`   ✅ Đã cập nhật thành công`);
          } else {
            console.log(`   ❌ Lỗi cập nhật: ${updateResult.error}`);
          }
        } catch (error) {
          console.log(`   ❌ Lỗi khi cập nhật: ${error.message}`);
        }
        
        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 5. Kiểm tra kết quả
    console.log('\n5. ✅ Kiểm tra kết quả...');
    
    const finalTeamsResponse = await fetch(`${API_BASE}/teams`);
    const finalTeamsData = await finalTeamsResponse.json();
    const finalTeams = finalTeamsData.data;

    console.log('📋 TEAMS SAU KHI CẬP NHẬT:');
    finalTeams.forEach(team => {
      const leader = users.find(u => u.id === team.leader_id);
      const displayName = leader ? `${team.name} - ${leader.name}` : team.name;
      console.log(`   - ${displayName}`);
    });

    console.log('\n🎉 HOÀN THÀNH SỬA MAPPING!');
    console.log('🌐 Bây giờ dropdown sẽ hiển thị tên trưởng nhóm đúng');

  } catch (error) {
    console.error('❌ Lỗi khi sửa mapping:', error.message);
  }
}

// Chạy script
fixTeamLeaderMapping().catch(console.error);
