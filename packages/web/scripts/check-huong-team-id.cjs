const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function checkHuongTeamId() {
  console.log('🔍 KIỂM TRA TEAM_ID CỦA PHẠM THỊ HƯƠNG');
  console.log('====================================\n');

  try {
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    const users = usersData.data.filter(user => user.status !== 'deleted');
    
    console.log('👥 TẤT CẢ TEAM LEADERS:');
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    teamLeaders.forEach((leader, index) => {
      console.log(`   ${index + 1}. ${leader.name}`);
      console.log(`      - Team ID: ${leader.team_id}`);
      console.log(`      - Location: ${leader.location}`);
      console.log(`      - Email: ${leader.email}`);
      console.log('');
    });

    console.log('🔍 TÌM PHẠM THỊ HƯƠNG:');
    const huongUsers = users.filter(user => user.name.includes('Phạm Thị Hương'));
    
    if (huongUsers.length > 0) {
      huongUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name}`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - Team ID: ${user.team_id}`);
        console.log(`      - Role: ${user.role}`);
        console.log(`      - Location: ${user.location}`);
        console.log(`      - Email: ${user.email}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Không tìm thấy Phạm Thị Hương');
    }

    // Kiểm tra teams có NHÓM 4
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data;
    
    console.log('🏢 TEAMS CÓ NHÓM 4:');
    const team4s = teams.filter(t => t.name.includes('NHÓM 4') && t.location === 'hanoi');
    team4s.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
      console.log(`      - Leader ID: ${team.leader_id}`);
      console.log(`      - Location: ${team.location}`);
      console.log('');
    });

    // Mapping logic test
    console.log('🧪 TEST MAPPING LOGIC:');
    if (team4s.length > 0 && huongUsers.length > 0) {
      const team4 = team4s[0];
      const huong = huongUsers[0];
      
      console.log(`Team: ${team4.name}`);
      console.log(`Huong team_id: ${huong.team_id}`);
      console.log(`Match: ${team4.name.includes('NHÓM 4') && huong.team_id === '4'}`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

checkHuongTeamId().catch(console.error);
