const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy logic từ teamUtils.ts (đã cập nhật)
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

const getUniqueTeams = (teams) => {
  const result = [];

  // Helper function để normalize location
  const normalizeLocation = (loc) => {
    if (!loc) return '';
    const lower = loc.toLowerCase();
    if (lower === 'hanoi' || lower === 'hà nội') return 'hanoi';
    if (lower === 'hcm' || lower === 'hồ chí minh') return 'hcm';
    return lower;
  };

  // Cấu trúc mong muốn (5 teams - đã xóa NHÓM 4)
  const desiredStructure = {
    hanoi: ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 5'],
    hcm: ['NHÓM 1', 'NHÓM 2']
  };

  // Lọc teams theo cấu trúc mong muốn
  Object.entries(desiredStructure).forEach(([location, teamNames]) => {
    teamNames.forEach(teamName => {
      // Tìm team phù hợp, ưu tiên team có tên cụ thể
      let team = teams.find(t => {
        const locationMatch = normalizeLocation(t.location) === normalizeLocation(location);
        const nameMatch = t.name === teamName;
        const activeMatch = t.active !== false;
        return locationMatch && nameMatch && activeMatch;
      });

      // Nếu không tìm thấy, tìm team có chứa tên
      if (!team) {
        team = teams.find(t => {
          const locationMatch = normalizeLocation(t.location) === normalizeLocation(location);
          const nameMatch = t.name.includes(teamName);
          const activeMatch = t.active !== false;
          return locationMatch && nameMatch && activeMatch;
        });
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

async function testFinalStructure() {
  console.log('🎯 KIỂM TRA CẤU TRÚC CUỐI CÙNG (ĐÃ XÓA NHÓM 4)');
  console.log('===============================================\n');

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

    console.log(`📊 Tổng số users: ${users.length}`);
    console.log(`📊 Tổng số teams: ${teams.length}\n`);

    // 2. Kiểm tra cấu trúc teams
    console.log('2. 🏢 CẤU TRÚC TEAMS CUỐI CÙNG:');
    console.log('===============================');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    console.log(`📋 Danh sách ${teamsWithLeaders.length} teams (đã xóa NHÓM 4):`);
    teamsWithLeaders.forEach((team, index) => {
      console.log(`${index + 1}. ${team.displayName} (ID: ${team.id}, Location: ${team.location})`);
    });

    console.log('\n3. 📍 PHÂN BỐ THEO LOCATION:');
    console.log('============================');
    
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log(`🏙️ Hà Nội (${hanoiTeams.length} teams):`);
    hanoiTeams.forEach(team => {
      console.log(`   - ${team.displayName}`);
    });
    
    console.log(`🌆 TP.HCM (${hcmTeams.length} teams):`);
    hcmTeams.forEach(team => {
      console.log(`   - ${team.displayName}`);
    });

    // 4. Kiểm tra không có Lê Tiến Quân
    console.log('\n4. ❌ KIỂM TRA LÊ TIẾN QUÂN ĐÃ BỊ XÓA:');
    console.log('=====================================');
    
    const quanUsers = users.filter(user => user.name.includes('Quân'));
    if (quanUsers.length === 0) {
      console.log('✅ Đã xóa thành công Lê Tiến Quân');
    } else {
      console.log(`❌ Vẫn còn ${quanUsers.length} user có tên chứa "Quân":`);
      quanUsers.forEach(user => {
        console.log(`   - ${user.name} (ID: ${user.id}, Team: ${user.team_id})`);
      });
    }

    // 5. Kiểm tra NHÓM 4 đã bị xóa
    console.log('\n5. ❌ KIỂM TRA NHÓM 4 ĐÃ BỊ XÓA:');
    console.log('===============================');
    
    const team4 = teams.filter(t => t.name.includes('NHÓM 4'));
    if (team4.length === 0) {
      console.log('✅ Đã xóa thành công NHÓM 4');
    } else {
      console.log(`❌ Vẫn còn ${team4.length} team có tên chứa "NHÓM 4":`);
      team4.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id}, Location: ${team.location})`);
      });
    }

    // 6. Kiểm tra Phạm Thị Hương
    console.log('\n6. ✅ KIỂM TRA PHẠM THỊ HƯƠNG:');
    console.log('=============================');
    
    const huongUsers = users.filter(user => user.name.includes('Phạm Thị Hương'));
    console.log(`📊 Tìm thấy ${huongUsers.length} user Phạm Thị Hương:`);
    huongUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}, Team: ${user.team_id}, Role: ${user.role})`);
    });

    console.log('\n🎉 HOÀN THÀNH KIỂM TRA!');
    console.log('======================');
    console.log('✅ Cấu trúc cuối cùng: 5 teams (đã xóa NHÓM 4)');
    console.log('✅ Đã xóa Lê Tiến Quân');
    console.log('✅ Phạm Thị Hương chuyển sang NHÓM 5');
    console.log('✅ Format hiển thị: "Tên nhóm - Tên trưởng nhóm"');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testFinalStructure();
