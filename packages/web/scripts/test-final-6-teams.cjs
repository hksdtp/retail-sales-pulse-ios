const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy logic từ teamUtils.ts (đã cập nhật)
const findTeamLeaderByPattern = (team, users) => {
  // Mapping chính xác theo dữ liệu thực tế (6 teams)
  const teamLeaderMapping = {
    hanoi: {
      'NHÓM 1': 'Lương Việt Anh',      // team_id: 1
      'NHÓM 2': 'Nguyễn Thị Thảo',     // team_id: 2
      'NHÓM 3': 'Trịnh Thị Bốn',       // team_id: 3
      'NHÓM 4': 'Lê Tiến Quân',        // team_id: 4 (có sẵn trong DB)
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

  // Xử lý trường hợp đặc biệt: Lê Tiến Quân (NHÓM 4)
  if (team.location === 'hanoi' && team.name.includes('NHÓM 4')) {
    const quan = users.find(user =>
      user.name.includes('Lê Tiến Quân') &&
      user.role === 'team_leader' &&
      user.team_id === '4'
    );
    if (quan) {
      return quan;
    }
  }

  return null;
};

const getUniqueTeams = (teams) => {
  const result = [];
  
  // Cấu trúc mong muốn (6 teams)
  const desiredStructure = {
    hanoi: ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 4'],
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

async function testFinal6Teams() {
  console.log('🎯 KIỂM TRA CẤU TRÚC CUỐI CÙNG (6 TEAMS)');
  console.log('=======================================\n');

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

    // 2. Test cấu trúc 6 teams
    console.log('2. 🏗️ CẤU TRÚC 6 TEAMS:');
    console.log('=======================');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI (4 teams):');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH (2 teams):');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });

    // 3. Kiểm tra yêu cầu cụ thể
    console.log('\n3. ✅ KIỂM TRA YÊU CẦU:');
    console.log('======================');
    
    const expectedStructure = {
      hanoi: [
        'NHÓM 1 - Lương Việt Anh',
        'NHÓM 2 - Nguyễn Thị Thảo',
        'NHÓM 3 - Trịnh Thị Bốn',
        'NHÓM 4 - Lê Tiến Quân'
      ],
      hcm: [
        'NHÓM 1 - Nguyễn Thị Nga',
        'NHÓM 2 - Nguyễn Ngọc Việt Khanh'
      ]
    };

    console.log('✅ KIỂM TRA HÀ NỘI:');
    expectedStructure.hanoi.forEach((expected, index) => {
      const actual = hanoiTeams[index]?.displayName;
      const match = actual === expected;
      console.log(`   ${index + 1}. ${expected}: ${match ? '✅ ĐÚNG' : '❌ SAI'}`);
      if (!match && actual) {
        console.log(`      Thực tế: ${actual}`);
      }
    });
    
    console.log('\n✅ KIỂM TRA HỒ CHÍ MINH:');
    expectedStructure.hcm.forEach((expected, index) => {
      const actual = hcmTeams[index]?.displayName;
      const match = actual === expected;
      console.log(`   ${index + 1}. ${expected}: ${match ? '✅ ĐÚNG' : '❌ SAI'}`);
      if (!match && actual) {
        console.log(`      Thực tế: ${actual}`);
      }
    });

    // 4. Thống kê cuối cùng
    console.log('\n4. 📊 THỐNG KÊ CUỐI CÙNG:');
    console.log('========================');
    
    const teamsWithLeaderCount = teamsWithLeaders.filter(t => t.leader).length;
    
    console.log(`🔢 Teams unique hiển thị: ${teamsWithLeaders.length}`);
    console.log(`👨‍💼 Teams có leader: ${teamsWithLeaderCount}`);
    console.log(`🏢 Teams Hà Nội: ${hanoiTeams.length}/4`);
    console.log(`🏢 Teams HCM: ${hcmTeams.length}/2`);
    console.log(`❌ Phạm Thị Hương duplicate: ${teamsWithLeaders.filter(t => t.leader === 'Phạm Thị Hương').length > 1 ? 'CÓ' : 'KHÔNG'}`);

    // 5. Kết luận
    console.log('\n5. 🎯 KẾT LUẬN:');
    console.log('===============');
    
    const isCorrect = teamsWithLeaders.length === 6 && 
                     teamsWithLeaderCount === 6 &&
                     hanoiTeams.length === 4 && 
                     hcmTeams.length === 2 &&
                     teamsWithLeaders.filter(t => t.leader === 'Phạm Thị Hương').length === 1;
    
    if (isCorrect) {
      console.log('🎉 HOÀN HẢO! Cấu trúc 6 teams đã đúng');
      console.log('✅ Không còn Phạm Thị Hương duplicate');
      console.log('✅ Tất cả teams đều có leader');
      console.log('✅ Cấu trúc: HN 4 teams, HCM 2 teams');
    } else {
      console.log('⚠️ Vẫn còn vấn đề cần khắc phục');
    }

    console.log('\n📋 CẤU TRÚC CUỐI CÙNG:');
    console.log('HN: NHÓM 1,2,3,4 - HCM: NHÓM 1,2');
    console.log('👥 Phạm Thị Hương chỉ có 1 nhóm (gần đây sử dụng)');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testFinal6Teams().catch(console.error);
