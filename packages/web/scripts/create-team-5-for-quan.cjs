const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function createTeam5ForQuan() {
  console.log('🏢 TẠO NHÓM 5 CHO LÊ TIẾN QUÂN');
  console.log('==============================\n');

  try {
    // 1. Kiểm tra Lê Tiến Quân
    console.log('1. 👨‍💼 KIỂM TRA LÊ TIẾN QUÂN:');
    console.log('============================');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    const users = usersData.data.filter(user => user.status !== 'deleted');
    
    const quan = users.find(user => user.name.includes('Quân'));
    if (quan) {
      console.log(`✅ Tìm thấy: ${quan.name}`);
      console.log(`   - ID: ${quan.id}`);
      console.log(`   - Team ID: ${quan.team_id}`);
      console.log(`   - Location: ${quan.location}`);
    } else {
      console.log('❌ Không tìm thấy Lê Tiến Quân');
      return;
    }
    console.log('');

    // 2. Kiểm tra NHÓM 5 đã tồn tại chưa
    console.log('2. 🏢 KIỂM TRA NHÓM 5:');
    console.log('=====================');
    
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data;
    
    const existingTeam5 = teams.find(t => 
      t.name.includes('NHÓM 5') && t.location === 'hanoi'
    );
    
    if (existingTeam5) {
      console.log(`✅ NHÓM 5 đã tồn tại: ${existingTeam5.name} (ID: ${existingTeam5.id})`);
      console.log('   Không cần tạo mới');
      return;
    } else {
      console.log('❌ NHÓM 5 chưa tồn tại, cần tạo mới');
    }
    console.log('');

    // 3. Tạo NHÓM 5
    console.log('3. 🏗️ TẠO NHÓM 5:');
    console.log('=================');
    
    const team5Data = {
      name: 'NHÓM 5',
      location: 'hanoi',
      department_type: 'retail',
      leader_id: quan.id,
      active: true,
      description: 'Nhóm 5 - Lê Tiến Quân',
      created_at: new Date().toISOString()
    };

    console.log('📝 Tạo NHÓM 5...');
    console.log(`   - Tên: ${team5Data.name}`);
    console.log(`   - Location: ${team5Data.location}`);
    console.log(`   - Leader: ${quan.name} (${quan.id})`);
    
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
        console.log(`✅ Đã tạo team: ${team5Data.name}`);
        console.log(`   - Team ID: ${createTeamResult.data.id}`);
        console.log(`   - Leader ID: ${createTeamResult.data.leader_id}`);
      } else {
        console.log(`❌ Lỗi tạo team: ${createTeamResult.error}`);
        
        // Thử tạo với dữ liệu tối thiểu
        console.log('🔄 Thử tạo với dữ liệu tối thiểu...');
        const minimalTeamData = {
          name: 'NHÓM 5',
          leader_id: quan.id
        };
        
        const retryResponse = await fetch(`${API_BASE}/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(minimalTeamData)
        });

        const retryResult = await retryResponse.json();
        if (retryResult.success) {
          console.log(`✅ Đã tạo team (retry): ${minimalTeamData.name}`);
          console.log(`   - Team ID: ${retryResult.data.id}`);
        } else {
          console.log(`❌ Lỗi tạo team (retry): ${retryResult.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ Lỗi khi tạo team: ${error.message}`);
    }
    console.log('');

    // 4. Kiểm tra kết quả
    console.log('4. ✅ KIỂM TRA KẾT QUẢ:');
    console.log('=======================');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalTeamsResponse = await fetch(`${API_BASE}/teams`);
    const finalTeamsData = await finalTeamsResponse.json();
    const finalTeams = finalTeamsData.data;
    
    const newTeam5 = finalTeams.find(t => 
      t.name.includes('NHÓM 5') && t.location === 'hanoi'
    );
    
    if (newTeam5) {
      console.log(`✅ NHÓM 5 đã được tạo: ${newTeam5.name}`);
      console.log(`   - ID: ${newTeam5.id}`);
      console.log(`   - Leader ID: ${newTeam5.leader_id}`);
      console.log(`   - Location: ${newTeam5.location}`);
    } else {
      console.log('❌ NHÓM 5 vẫn chưa tồn tại');
    }

    // Thống kê teams Hà Nội
    const hanoiTeams = finalTeams.filter(t => t.location === 'hanoi');
    console.log(`\n📊 Teams Hà Nội: ${hanoiTeams.length}`);
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
    });

    console.log('\n✅ HOÀN THÀNH TẠO NHÓM 5!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

createTeam5ForQuan().catch(console.error);
