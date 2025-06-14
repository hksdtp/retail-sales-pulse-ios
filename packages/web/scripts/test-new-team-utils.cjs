const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy utility functions từ teamUtils.ts
const findTeamLeaderByPattern = (team, users) => {
  // Mapping dựa trên team name pattern
  const teamPatterns = [
    { pattern: /NHÓM 1/i, teamId: '1' },
    { pattern: /NHÓM 2/i, teamId: '2' },
    { pattern: /NHÓM 3/i, teamId: '3' },
    { pattern: /NHÓM 4/i, teamId: '4' },
    { pattern: /NHÓM 5/i, teamId: '5' },
    { pattern: /NHÓM 6/i, teamId: '6' },
  ];

  // Tìm pattern phù hợp
  const matchedPattern = teamPatterns.find(p => p.pattern.test(team.name));
  
  if (matchedPattern) {
    // Tìm team leader có team_id tương ứng
    const leader = users.find(
      user => user.team_id === matchedPattern.teamId && user.role === 'team_leader'
    );
    
    if (leader) {
      return leader;
    }
  }

  // Fallback: tìm theo leader_id nếu có
  if (team.leader_id) {
    const leader = users.find(user => user.id === team.leader_id);
    if (leader) {
      return leader;
    }
  }

  return null;
};

const getTeamNameWithLeader = (teamId, teams, users) => {
  if (!teamId || teamId === '0') {
    return 'Chưa có nhóm';
  }

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return `Nhóm ${teamId}`;
  }

  // Tìm trưởng nhóm theo team name pattern và location
  const teamLeader = findTeamLeaderByPattern(team, users);
  
  if (teamLeader) {
    return `${team.name} - ${teamLeader.name}`;
  }

  return team.name;
};

const getTeamsWithLeaderNames = (teams, users) => {
  return teams.map(team => {
    const leader = findTeamLeaderByPattern(team, users);
    const displayName = leader ? `${team.name} - ${leader.name}` : team.name;
    
    return {
      id: team.id,
      name: team.name,
      displayName,
      leader: leader || undefined,
    };
  });
};

async function testNewTeamUtils() {
  console.log('🧪 KIỂM TRA UTILITY FUNCTIONS MỚI');
  console.log('==================================\n');

  try {
    // 1. Lấy dữ liệu
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

    // 2. Test utility functions
    console.log('2. 🧪 Test utility functions...');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    console.log('📋 KẾT QUẢ TEAMS VỚI TÊN TRƯỞNG NHÓM:');
    console.log('====================================');
    
    teamsWithLeaders.forEach((team, index) => {
      console.log(`${index + 1}. ${team.displayName}`);
      if (team.leader) {
        console.log(`   ✅ Leader: ${team.leader.name} (Team ID: ${team.leader.team_id})`);
      } else {
        console.log(`   ❌ Không có leader`);
      }
    });

    // 3. Thống kê
    console.log('\n📊 THỐNG KÊ:');
    console.log('============');
    const teamsWithLeaderCount = teamsWithLeaders.filter(t => t.leader).length;
    const teamsWithoutLeaderCount = teamsWithLeaders.filter(t => !t.leader).length;
    
    console.log(`🔢 Tổng teams: ${teams.length}`);
    console.log(`👨‍💼 Teams có trưởng nhóm: ${teamsWithLeaderCount}`);
    console.log(`❓ Teams chưa có trưởng nhóm: ${teamsWithoutLeaderCount}`);

    // 4. Sắp xếp theo location
    console.log('\n🏢 TEAMS THEO LOCATION:');
    console.log('=======================');
    
    const hanoiTeams = teamsWithLeaders.filter(t => {
      const originalTeam = teams.find(ot => ot.id === t.id);
      return originalTeam?.location === 'hanoi';
    });
    
    const hcmTeams = teamsWithLeaders.filter(t => {
      const originalTeam = teams.find(ot => ot.id === t.id);
      return originalTeam?.location === 'hcm';
    });

    console.log('🏢 HÀ NỘI:');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH:');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });

    // 5. Test individual team lookup
    console.log('\n🔍 TEST INDIVIDUAL TEAM LOOKUP:');
    console.log('===============================');
    
    const sampleTeamIds = teams.slice(0, 3).map(t => t.id);
    sampleTeamIds.forEach(teamId => {
      const result = getTeamNameWithLeader(teamId, teams, users);
      console.log(`Team ID ${teamId}: "${result}"`);
    });

    console.log('\n✅ KIỂM TRA HOÀN TẤT!');
    console.log('🌐 Utility functions đã hoạt động với pattern matching');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
  }
}

// Chạy test
testNewTeamUtils().catch(console.error);
