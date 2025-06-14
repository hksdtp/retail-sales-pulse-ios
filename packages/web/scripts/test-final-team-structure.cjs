const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy logic từ teamUtils.ts
const findTeamLeaderByPattern = (team, users) => {
  // Mapping chính xác theo yêu cầu của user
  const teamLeaderMapping = {
    hanoi: {
      'NHÓM 1': 'Lương Việt Anh',
      'NHÓM 2': 'Nguyễn Thị Thảo',
      'NHÓM 3': 'Trịnh Thị Bốn',
      'NHÓM 4': 'Phạm Thị Hương',
      'NHÓM 5': 'Lê Tiến Quân',
    },
    hcm: {
      'NHÓM 1': 'Nguyễn Thị Nga',      // team_id: 5 -> NHÓM 1 HCM
      'NHÓM 2': 'Nguyễn Ngọc Việt Khanh', // team_id: 6 -> NHÓM 2 HCM
    }
  };

  const location = team.location === 'hcm' ? 'hcm' : 'hanoi';
  const locationMapping = teamLeaderMapping[location];

  // Tìm pattern phù hợp
  for (const [pattern, leaderName] of Object.entries(locationMapping)) {
    if (team.name.includes(pattern)) {
      // Tìm leader theo tên
      const leader = users.find(user =>
        user.name === leaderName && user.role === 'team_leader'
      );

      if (leader) {
        return leader;
      }

      // Fallback: tìm theo tên gần đúng
      const partialMatch = users.find(user =>
        user.role === 'team_leader' &&
        leaderName.split(' ').some(part => user.name.includes(part))
      );

      if (partialMatch) {
        return partialMatch;
      }
    }
  }

  return null;
};

const getUniqueTeams = (teams) => {
  const result = [];
  
  // Cấu trúc mong muốn
  const desiredStructure = {
    hanoi: ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 4', 'NHÓM 5'],
    hcm: ['NHÓM 1', 'NHÓM 2']
  };

  // Lọc teams theo cấu trúc mong muốn
  Object.entries(desiredStructure).forEach(([location, teamNames]) => {
    teamNames.forEach(teamName => {
      // Tìm team phù hợp, ưu tiên team có tên cụ thể
      let team = teams.find(t => 
        t.location === location && 
        t.name === teamName &&
        t.active !== false
      );
      
      // Nếu không tìm thấy, tìm team có chứa tên
      if (!team) {
        team = teams.find(t => 
          t.location === location && 
          t.name.includes(teamName) &&
          t.active !== false
        );
      }
      
      if (team) {
        result.push(team);
      }
    });
  });

  return result;
};

const getTeamsWithLeaderNames = (teams, users) => {
  // Lọc ra teams unique (loại bỏ duplicate)
  const uniqueTeams = getUniqueTeams(teams);
  
  return uniqueTeams.map((team) => {
    const leader = findTeamLeaderByPattern(team, users);
    const displayName = leader ? `${team.name} - ${leader.name}` : team.name;
    
    return {
      id: team.id,
      name: team.name,
      displayName,
      leader: leader ? leader.name : null,
      location: team.location
    };
  });
};

async function testFinalTeamStructure() {
  console.log('🎯 KIỂM TRA CẤU TRÚC TEAMS CUỐI CÙNG');
  console.log('===================================\n');

  try {
    // 1. Lấy dữ liệu
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

    // 2. Kiểm tra Lê Tiến Quân
    console.log('2. 👨‍💼 KIỂM TRA LÊ TIẾN QUÂN:');
    console.log('============================');
    
    const quan = users.find(user => user.name.includes('Quân'));
    if (quan) {
      console.log(`✅ Lê Tiến Quân: ${quan.name}`);
      console.log(`   - ID: ${quan.id}`);
      console.log(`   - Role: ${quan.role}`);
      console.log(`   - Team ID: ${quan.team_id}`);
      console.log(`   - Location: ${quan.location}`);
    } else {
      console.log('❌ Lê Tiến Quân không tồn tại');
    }
    console.log('');

    // 3. Test cấu trúc teams mới
    console.log('3. 🏗️ CẤU TRÚC TEAMS MỚI (UNIQUE):');
    console.log('==================================');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    // Sắp xếp theo location và thứ tự
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI (theo thứ tự 1,2,3,4,5):');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
      if (team.leader) {
        console.log(`      ✅ Leader: ${team.leader}`);
      } else {
        console.log(`      ❌ Không có leader`);
      }
    });
    
    console.log('\n🏢 HỒ CHÍ MINH (theo thứ tự 1,2):');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
      if (team.leader) {
        console.log(`      ✅ Leader: ${team.leader}`);
      } else {
        console.log(`      ❌ Không có leader`);
      }
    });

    // 4. Kiểm tra các yêu cầu cụ thể
    console.log('\n4. ✅ KIỂM TRA YÊU CẦU CỤ THỂ:');
    console.log('==============================');
    
    // Kiểm tra Thảo có NHÓM 2 riêng
    const thaoTeam = hanoiTeams.find(t => t.leader === 'Nguyễn Thị Thảo');
    console.log(`👩‍💼 Thảo có NHÓM 2: ${thaoTeam ? '✅ CÓ' : '❌ KHÔNG'}`);
    if (thaoTeam) {
      console.log(`   Team: ${thaoTeam.displayName}`);
    }
    
    // Kiểm tra Quân có NHÓM 5
    const quanTeam = hanoiTeams.find(t => t.leader === 'Lê Tiến Quân');
    console.log(`👨‍💼 Quân có NHÓM 5: ${quanTeam ? '✅ CÓ' : '❌ KHÔNG'}`);
    if (quanTeam) {
      console.log(`   Team: ${quanTeam.displayName}`);
    }
    
    // Kiểm tra HCM có đúng 2 teams
    console.log(`🏢 HCM có đúng 2 teams: ${hcmTeams.length === 2 ? '✅ ĐÚNG' : '❌ SAI'}`);
    
    // Kiểm tra HN có đúng 5 teams
    console.log(`🏢 HN có đúng 5 teams: ${hanoiTeams.length === 5 ? '✅ ĐÚNG' : '❌ SAI'}`);

    // 5. Thống kê cuối cùng
    console.log('\n5. 📊 THỐNG KÊ CUỐI CÙNG:');
    console.log('========================');
    
    const teamsWithLeaderCount = teamsWithLeaders.filter(t => t.leader).length;
    const teamsWithoutLeaderCount = teamsWithLeaders.filter(t => !t.leader).length;
    
    console.log(`🔢 Tổng teams unique: ${teamsWithLeaders.length}`);
    console.log(`👨‍💼 Teams có leader: ${teamsWithLeaderCount}`);
    console.log(`❓ Teams chưa có leader: ${teamsWithoutLeaderCount}`);
    console.log(`🏢 Teams Hà Nội: ${hanoiTeams.length}`);
    console.log(`🏢 Teams HCM: ${hcmTeams.length}`);
    console.log(`👨‍💼 Team leaders: ${users.filter(u => u.role === 'team_leader').length}`);

    console.log('\n✅ KIỂM TRA HOÀN TẤT!');
    if (teamsWithLeaderCount === teamsWithLeaders.length && teamsWithLeaders.length === 7) {
      console.log('🎉 CẤU TRÚC TEAMS HOÀN HẢO!');
      console.log('📋 HN: 1,2,3,4,5 - HCM: 1,2');
      console.log('👥 Tất cả teams đều có leader');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testFinalTeamStructure().catch(console.error);
