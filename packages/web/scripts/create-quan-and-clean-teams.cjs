const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function createQuanAndCleanTeams() {
  console.log('🔧 TẠO LÊ TIẾN QUÂN VÀ DỌN DẸP TEAMS');
  console.log('====================================\n');

  try {
    // 1. Tạo user Lê Tiến Quân
    console.log('1. 👨‍💼 TẠO USER LÊ TIẾN QUÂN:');
    console.log('=============================');
    
    const quanData = {
      name: 'Lê Tiến Quân',
      email: 'quan.le@example.com',
      role: 'team_leader',
      team_id: '5',
      location: 'hanoi',
      department_type: 'retail',
      status: 'active',
      phone: '+84987654321',
      address: 'Hà Nội, Việt Nam'
    };

    console.log('📝 Tạo user Lê Tiến Quân...');
    try {
      const createUserResponse = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quanData)
      });

      const createUserResult = await createUserResponse.json();
      if (createUserResult.success) {
        console.log(`✅ Đã tạo user: ${quanData.name} (ID: ${createUserResult.data.id})`);
      } else {
        console.log(`❌ Lỗi tạo user: ${createUserResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Lỗi khi tạo user: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // 2. Lấy danh sách teams để xóa duplicate
    console.log('2. 🗑️ XÓA TEAMS DUPLICATE:');
    console.log('==========================');
    
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data;

    // Danh sách teams duplicate cần xóa (giữ lại team đầu tiên)
    const teamsToDelete = [
      's1rkdVvo11xUCyytFqki', // NHÓM 4 duplicate (Hà Nội)
      'mLrqhMcKaZ1OUV4fTksW', // NHÓM 2 duplicate (HCM)
      'xNiwgcK8snNg1m047vmD', // NHÓM 1 duplicate (HCM)
      'w9qvRm7gDUNlYpNU1rZE', // NHÓM 3 duplicate (Hà Nội)
    ];

    console.log('🗑️ Xóa teams duplicate...');
    for (const teamId of teamsToDelete) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        console.log(`🗑️ Xóa team: ${team.name} (${team.location}) - ID: ${teamId}`);
        
        try {
          // Vì không có DELETE endpoint, ta sẽ đánh dấu team là inactive
          const updateResponse = await fetch(`${API_BASE}/teams/${teamId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...team,
              name: `[DELETED] ${team.name}`,
              active: false,
              deleted_at: new Date().toISOString()
            })
          });

          const updateResult = await updateResponse.json();
          if (updateResult.success) {
            console.log(`   ✅ Đã đánh dấu xóa`);
          } else {
            console.log(`   ❌ Lỗi: ${updateResult.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.log(`   ❌ Lỗi khi xóa: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    console.log('');

    // 3. Tạo team cho Lê Tiến Quân nếu chưa có
    console.log('3. 🏢 TẠO TEAM CHO LÊ TIẾN QUÂN:');
    console.log('===============================');
    
    const existingTeam5 = teams.find(t => 
      t.name.includes('NHÓM 5') && t.location === 'hanoi'
    );
    
    if (!existingTeam5) {
      console.log('📝 Tạo NHÓM 5 cho Lê Tiến Quân...');
      
      const team5Data = {
        name: 'NHÓM 5',
        location: 'hanoi',
        department_type: 'retail',
        leader_id: null, // Sẽ cập nhật sau khi có ID của Quân
        active: true,
        description: 'Nhóm 5 - Lê Tiến Quân'
      };

      try {
        const createTeamResponse = await fetch(`${API_BASE}/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(team5Data)
        });

        const createTeamResult = await createTeamResponse.json();
        if (createTeamResult.success) {
          console.log(`✅ Đã tạo team: ${team5Data.name} (ID: ${createTeamResult.data.id})`);
        } else {
          console.log(`❌ Lỗi tạo team: ${createTeamResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Lỗi khi tạo team: ${error.message}`);
      }
    } else {
      console.log('✅ NHÓM 5 đã tồn tại');
    }
    console.log('');

    // 4. Kiểm tra kết quả
    console.log('4. ✅ KIỂM TRA KẾT QUẢ:');
    console.log('=======================');
    
    const [finalUsersResponse, finalTeamsResponse] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`)
    ]);

    const finalUsersData = await finalUsersResponse.json();
    const finalTeamsData = await finalTeamsResponse.json();

    const finalUsers = finalUsersData.data.filter(user => user.status !== 'deleted');
    const finalTeams = finalTeamsData.data.filter(team => team.active !== false);

    // Kiểm tra Lê Tiến Quân
    const quan = finalUsers.find(user => user.name.includes('Quân'));
    console.log(`👨‍💼 Lê Tiến Quân: ${quan ? '✅ Có' : '❌ Không có'}`);
    if (quan) {
      console.log(`   - ID: ${quan.id}`);
      console.log(`   - Team ID: ${quan.team_id}`);
    }

    // Kiểm tra cấu trúc teams
    const hanoiTeams = finalTeams.filter(t => t.location === 'hanoi');
    const hcmTeams = finalTeams.filter(t => t.location === 'hcm');
    
    console.log(`\n🏢 HÀ NỘI TEAMS: ${hanoiTeams.length}`);
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name}`);
    });
    
    console.log(`\n🏢 HỒ CHÍ MINH TEAMS: ${hcmTeams.length}`);
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name}`);
    });

    console.log('\n📊 THỐNG KÊ:');
    console.log(`🔢 Tổng users: ${finalUsers.length}`);
    console.log(`🔢 Tổng teams active: ${finalTeams.length}`);
    console.log(`👨‍💼 Team leaders: ${finalUsers.filter(u => u.role === 'team_leader').length}`);

    console.log('\n✅ HOÀN THÀNH TẠO QUÂN VÀ DỌN DẸP TEAMS!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

createQuanAndCleanTeams().catch(console.error);
