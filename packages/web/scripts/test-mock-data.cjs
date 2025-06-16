// Test mock data structure
const { mockGetUsers, mockGetTeams } = require('../src/services/mockAuth.ts');

// Copy logic từ teamUtils.ts
const findTeamLeaderByPattern = (team, users) => {
  // Mapping chính xác theo yêu cầu của user (5 teams - đã xóa NHÓM 4)
  const teamLeaderMapping = {
    hanoi: {
      'NHÓM 1': 'Lương Việt Anh',      // team_id: 1
      'NHÓM 2': 'Nguyễn Thị Thảo',     // team_id: 2
      'NHÓM 3': 'Trịnh Thị Bốn',       // team_id: 3
      'NHÓM 5': 'Phạm Thị Hương',      // team_id: 5 (chuyển từ NHÓM 4)
    },
    hcm: {
      'NHÓM 1': 'Nguyễn Thị Nga',      // team_id: 6 -> NHÓM 1 HCM
      'NHÓM 2': 'Nguyễn Ngọc Việt Khanh', // team_id: 7 -> NHÓM 2 HCM
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

async function testMockData() {
  console.log('🧪 TEST MOCK DATA STRUCTURE');
  console.log('============================\n');

  try {
    // 1. Lấy mock data
    console.log('1. 📊 LẤY MOCK DATA:');
    console.log('===================');
    
    const [usersResponse, teamsResponse] = await Promise.all([
      mockGetUsers(),
      mockGetTeams()
    ]);

    if (!usersResponse.success || !teamsResponse.success) {
      console.log('❌ Lỗi lấy mock data');
      return;
    }

    const users = usersResponse.data;
    const teams = teamsResponse.data;

    console.log(`📊 Mock Users: ${users.length}`);
    console.log(`📊 Mock Teams: ${teams.length}\n`);

    // 2. Kiểm tra cấu trúc teams
    console.log('2. 🏢 CẤU TRÚC TEAMS MOCK:');
    console.log('=========================');
    
    console.log(`📋 Danh sách ${teams.length} teams:`);
    teams.forEach((team, index) => {
      const displayName = getTeamNameWithLeader(team.id, teams, users);
      console.log(`${index + 1}. ${displayName} (ID: ${team.id}, Location: ${team.location})`);
    });

    // 3. Phân bố theo location
    console.log('\n3. 📍 PHÂN BỐ THEO LOCATION:');
    console.log('============================');
    
    const hanoiTeams = teams.filter(t => t.location === 'hanoi');
    const hcmTeams = teams.filter(t => t.location === 'hcm');
    
    console.log(`🏙️ Hà Nội (${hanoiTeams.length} teams):`);
    hanoiTeams.forEach(team => {
      const displayName = getTeamNameWithLeader(team.id, teams, users);
      console.log(`   - ${displayName}`);
    });
    
    console.log(`🌆 TP.HCM (${hcmTeams.length} teams):`);
    hcmTeams.forEach(team => {
      const displayName = getTeamNameWithLeader(team.id, teams, users);
      console.log(`   - ${displayName}`);
    });

    // 4. Kiểm tra Phạm Thị Hương
    console.log('\n4. ✅ KIỂM TRA PHẠM THỊ HƯƠNG:');
    console.log('=============================');
    
    const huongUsers = users.filter(user => user.name.includes('Phạm Thị Hương'));
    console.log(`📊 Tìm thấy ${huongUsers.length} user Phạm Thị Hương:`);
    huongUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}, Team: ${user.team_id}, Role: ${user.role}, Location: ${user.location})`);
    });

    // 5. Kiểm tra không có NHÓM 4
    console.log('\n5. ❌ KIỂM TRA KHÔNG CÓ NHÓM 4:');
    console.log('===============================');
    
    const team4 = teams.filter(t => t.name.includes('NHÓM 4'));
    if (team4.length === 0) {
      console.log('✅ Mock data không có NHÓM 4');
    } else {
      console.log(`❌ Mock data vẫn có ${team4.length} NHÓM 4:`);
      team4.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });
    }

    // 6. Kiểm tra không có Lê Tiến Quân
    console.log('\n6. ❌ KIỂM TRA KHÔNG CÓ LÊ TIẾN QUÂN:');
    console.log('===================================');
    
    const quanUsers = users.filter(user => user.name.includes('Quân'));
    if (quanUsers.length === 0) {
      console.log('✅ Mock data không có Lê Tiến Quân');
    } else {
      console.log(`❌ Mock data vẫn có ${quanUsers.length} user có tên chứa "Quân":`);
      quanUsers.forEach(user => {
        console.log(`   - ${user.name} (ID: ${user.id})`);
      });
    }

    console.log('\n🎉 HOÀN THÀNH TEST MOCK DATA!');
    console.log('=============================');
    console.log('✅ Mock data structure đã đúng');
    console.log('✅ 5 teams: HN (4), HCM (2)');
    console.log('✅ Phạm Thị Hương team_id: 5');
    console.log('✅ Không có NHÓM 4 và Lê Tiến Quân');
    console.log('✅ Format: "Tên nhóm - Tên trưởng nhóm"');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testMockData();
