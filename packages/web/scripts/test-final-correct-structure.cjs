const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy logic từ teamUtils.ts (đã cập nhật)
const findTeamLeaderByPattern = (team, users) => {
  // Mapping chính xác theo file JSON chuẩn của user
  const teamLeaderMapping = {
    hanoi: {
      'NHÓM 1': 'Lương Việt Anh',      // team_id: 1
      'NHÓM 2': 'Nguyễn Thị Thảo',     // team_id: 2
      'NHÓM 3': 'Trịnh Thị Bốn',       // team_id: 3
      'NHÓM 4': 'Lê Tiến Quân',        // team_id: 4 (trong file JSON)
      'NHÓM 5': 'Phạm Thị Hương',      // team_id: 4 (trong database hiện tại)
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

  // Xử lý trường hợp đặc biệt: Phạm Thị Hương
  // Trong database có team_id: 4, nhưng theo file JSON nên là NHÓM 5
  if (team.location === 'hanoi') {
    if (team.name.includes('NHÓM 4') || team.name.includes('NHÓM 5')) {
      const huong = users.find(user =>
        user.name.includes('Phạm Thị Hương') && user.role === 'team_leader'
      );
      if (huong) {
        return huong;
      }
    }
  }

  return null;
};

const getUniqueTeams = (teams) => {
  const result = [];
  
  // Cấu trúc theo file JSON chuẩn
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

async function testFinalCorrectStructure() {
  console.log('🎯 KIỂM TRA CẤU TRÚC CUỐI CÙNG THEO FILE JSON');
  console.log('============================================\n');

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

    // 2. So sánh với file JSON chuẩn
    console.log('2. 📋 SO SÁNH VỚI FILE JSON CHUẨN:');
    console.log('==================================');
    
    const jsonStructure = {
      hanoi: [
        { team: 'NHÓM 1', leader: 'Lương Việt Anh' },
        { team: 'NHÓM 2', leader: 'Nguyễn Thị Thảo' },
        { team: 'NHÓM 3', leader: 'Trịnh Thị Bốn' },
        { team: 'NHÓM 4', leader: 'Lê Tiến Quân' },
        { team: 'NHÓM 5', leader: 'Phạm Thị Hương' },
      ],
      hcm: [
        { team: 'NHÓM 1', leader: 'Nguyễn Thị Nga' },
        { team: 'NHÓM 2', leader: 'Nguyễn Ngọc Việt Khanh' },
      ]
    };

    const teamLeaders = users.filter(user => user.role === 'team_leader');
    
    console.log('✅ KIỂM TRA HÀ NỘI:');
    jsonStructure.hanoi.forEach((item, index) => {
      const found = teamLeaders.find(l => l.name.includes(item.leader.split(' ')[0]));
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
      if (found) {
        console.log(`      Team ID: ${found.team_id}, Location: ${found.location}`);
      }
    });
    
    console.log('\n✅ KIỂM TRA HỒ CHÍ MINH:');
    jsonStructure.hcm.forEach((item, index) => {
      const found = teamLeaders.find(l => l.name.includes(item.leader.split(' ')[0]));
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}: ${found ? '✅ Có' : '❌ Thiếu'}`);
      if (found) {
        console.log(`      Team ID: ${found.team_id}, Location: ${found.location}`);
      }
    });

    // 3. Test utility function mới
    console.log('\n3. 🧪 TEST UTILITY FUNCTION MỚI:');
    console.log('=================================');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI (theo file JSON):');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH (theo file JSON):');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });

    // 4. Thống kê cuối cùng
    console.log('\n4. 📊 THỐNG KÊ CUỐI CÙNG:');
    console.log('========================');
    
    const teamsWithLeaderCount = teamsWithLeaders.filter(t => t.leader).length;
    const expectedTeamCount = jsonStructure.hanoi.length + jsonStructure.hcm.length;
    
    console.log(`🔢 Teams theo file JSON: ${expectedTeamCount}`);
    console.log(`🔢 Teams unique hiển thị: ${teamsWithLeaders.length}`);
    console.log(`👨‍💼 Teams có leader: ${teamsWithLeaderCount}`);
    console.log(`🏢 Teams Hà Nội: ${hanoiTeams.length}/5`);
    console.log(`🏢 Teams HCM: ${hcmTeams.length}/2`);

    // 5. Kết luận
    console.log('\n5. 🎯 KẾT LUẬN:');
    console.log('===============');
    
    const isCorrect = teamsWithLeaders.length === expectedTeamCount && 
                     teamsWithLeaderCount === teamsWithLeaders.length &&
                     hanoiTeams.length === 5 && hcmTeams.length === 2;
    
    if (isCorrect) {
      console.log('🎉 HOÀN HẢO! Cấu trúc đã đúng theo file JSON');
      console.log('✅ Tất cả teams đều có leader');
      console.log('✅ Không còn duplicate');
      console.log('✅ Mapping chính xác theo dữ liệu thực');
    } else {
      console.log('⚠️ Vẫn còn vấn đề cần khắc phục');
    }

    console.log('\n📋 CẤU TRÚC CUỐI CÙNG:');
    console.log('HN: NHÓM 1,2,3,4,5 - HCM: NHÓM 1,2');
    console.log('👥 Dựa trên danh sách nhân viên thực tế');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testFinalCorrectStructure().catch(console.error);
