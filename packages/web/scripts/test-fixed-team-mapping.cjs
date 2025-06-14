const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Copy logic mới từ teamUtils.ts
const findTeamLeaderByPattern = (team, users) => {
  // 1. Ưu tiên tìm theo tên team cụ thể
  if (team.name.includes('THẢO')) {
    const thao = users.find(user => 
      user.name.includes('Thảo') && user.role === 'team_leader'
    );
    if (thao) return thao;
  }

  if (team.name.includes('VIỆT ANH')) {
    const vietAnh = users.find(user => 
      user.name.includes('Việt Anh') && user.role === 'team_leader'
    );
    if (vietAnh) return vietAnh;
  }

  // 2. Mapping theo location và team pattern
  const teamMapping = {
    hanoi: {
      'NHÓM 1': '1', // Lương Việt Anh
      'NHÓM 2': '2', // Nguyễn Thị Thảo (ưu tiên)
      'NHÓM 3': '3', // Trịnh Thị Bốn
      'NHÓM 4': '4', // Phạm Thị Hương
    },
    hcm: {
      'NHÓM 1': '5', // Nguyễn Thị Nga (team_id: 5 -> Team 1 HCM)
      'NHÓM 2': '6', // Nguyễn Ngọc Việt Khanh (team_id: 6 -> Team 2 HCM)
      'NHÓM 5': '5', // Nguyễn Thị Nga (legacy)
      'NHÓM 6': '6', // Nguyễn Ngọc Việt Khanh (legacy)
    }
  };

  const location = team.location === 'hcm' ? 'hcm' : 'hanoi';
  const locationMapping = teamMapping[location];

  // Tìm pattern phù hợp
  for (const [pattern, teamId] of Object.entries(locationMapping)) {
    if (team.name.includes(pattern)) {
      // Tìm team leader theo team_id và location
      let leader = users.find(
        user => user.team_id === teamId && 
                 user.role === 'team_leader' &&
                 user.location === team.location
      );
      
      // Nếu không tìm thấy theo location, tìm theo team_id
      if (!leader) {
        leader = users.find(
          user => user.team_id === teamId && user.role === 'team_leader'
        );
      }

      // Xử lý trường hợp đặc biệt cho team_id: 2 (Hà Nội)
      if (teamId === '2' && team.location === 'hanoi') {
        // Nếu team name có "THẢO" -> chọn Thảo
        if (team.name.includes('THẢO')) {
          leader = users.find(user => 
            user.name.includes('Thảo') && user.role === 'team_leader'
          );
        } else {
          // Ngược lại, ưu tiên Thảo cho NHÓM 2 thông thường
          leader = users.find(user => 
            user.name.includes('Thảo') && user.role === 'team_leader'
          ) || users.find(user => 
            user.team_id === '2' && user.role === 'team_leader'
          );
        }
      }
      
      if (leader) {
        return leader;
      }
    }
  }

  // 3. Fallback: tìm theo leader_id nếu có
  if (team.leader_id) {
    const leader = users.find(user => user.id === team.leader_id);
    if (leader) {
      return leader;
    }
  }

  return null;
};

const getTeamsWithLeaderNames = (teams, users) => {
  return teams.map(team => {
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

async function testFixedTeamMapping() {
  console.log('🧪 KIỂM TRA LOGIC MAPPING MỚI');
  console.log('==============================\n');

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

    // 2. Test logic mới
    console.log('2. 🧪 TEST LOGIC MAPPING MỚI:');
    console.log('=============================');
    
    const teamsWithLeaders = getTeamsWithLeaderNames(teams, users);
    
    // Sắp xếp theo location
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI:');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
      if (team.leader) {
        console.log(`      ✅ Leader: ${team.leader}`);
      } else {
        console.log(`      ❌ Không có leader`);
      }
    });
    
    console.log('\n🏢 HỒ CHÍ MINH:');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
      if (team.leader) {
        console.log(`      ✅ Leader: ${team.leader}`);
      } else {
        console.log(`      ❌ Không có leader`);
      }
    });

    // 3. Kiểm tra các trường hợp đặc biệt
    console.log('\n3. 🎯 KIỂM TRA CÁC TRƯỜNG HỢP ĐẶC BIỆT:');
    console.log('======================================');
    
    // Tìm team "NHÓM 2 - THẢO"
    const thaoTeam = teams.find(t => t.name.includes('THẢO'));
    if (thaoTeam) {
      const thaoLeader = findTeamLeaderByPattern(thaoTeam, users);
      console.log(`📋 Team "${thaoTeam.name}"`);
      console.log(`   Leader: ${thaoLeader ? thaoLeader.name : 'Không có'}`);
      console.log(`   ✅ ${thaoLeader && thaoLeader.name.includes('Thảo') ? 'ĐÚNG - Thảo' : '❌ SAI'}`);
    }
    
    // Tìm team "NHÓM 1 - VIỆT ANH"
    const vietAnhTeam = teams.find(t => t.name.includes('VIỆT ANH'));
    if (vietAnhTeam) {
      const vietAnhLeader = findTeamLeaderByPattern(vietAnhTeam, users);
      console.log(`📋 Team "${vietAnhTeam.name}"`);
      console.log(`   Leader: ${vietAnhLeader ? vietAnhLeader.name : 'Không có'}`);
      console.log(`   ✅ ${vietAnhLeader && vietAnhLeader.name.includes('Việt Anh') ? 'ĐÚNG - Việt Anh' : '❌ SAI'}`);
    }
    
    // Kiểm tra teams HCM (5,6 -> 1,2)
    const hcmTeam1 = hcmTeams.find(t => t.name.includes('NHÓM 1'));
    const hcmTeam2 = hcmTeams.find(t => t.name.includes('NHÓM 2'));
    
    if (hcmTeam1) {
      console.log(`📋 HCM Team 1: "${hcmTeam1.name}"`);
      console.log(`   Leader: ${hcmTeam1.leader || 'Không có'}`);
      console.log(`   ✅ ${hcmTeam1.leader === 'Nguyễn Thị Nga' ? 'ĐÚNG - Nga' : '❌ SAI'}`);
    }
    
    if (hcmTeam2) {
      console.log(`📋 HCM Team 2: "${hcmTeam2.name}"`);
      console.log(`   Leader: ${hcmTeam2.leader || 'Không có'}`);
      console.log(`   ✅ ${hcmTeam2.leader === 'Nguyễn Ngọc Việt Khanh' ? 'ĐÚNG - Việt Khanh' : '❌ SAI'}`);
    }

    // 4. Thống kê kết quả
    console.log('\n4. 📊 THỐNG KÊ KẾT QUẢ:');
    console.log('=======================');
    
    const teamsWithLeaderCount = teamsWithLeaders.filter(t => t.leader).length;
    const teamsWithoutLeaderCount = teamsWithLeaders.filter(t => !t.leader).length;
    
    console.log(`🔢 Tổng teams: ${teams.length}`);
    console.log(`👨‍💼 Teams có leader: ${teamsWithLeaderCount}`);
    console.log(`❓ Teams chưa có leader: ${teamsWithoutLeaderCount}`);
    console.log(`🏢 Teams Hà Nội: ${hanoiTeams.length}`);
    console.log(`🏢 Teams HCM: ${hcmTeams.length}`);
    
    // Kiểm tra Thảo có team riêng không
    const thaoHasOwnTeam = teamsWithLeaders.some(t => 
      t.leader === 'Nguyễn Thị Thảo' && t.name.includes('THẢO')
    );
    console.log(`👩‍💼 Thảo có team riêng: ${thaoHasOwnTeam ? '✅ CÓ' : '❌ KHÔNG'}`);

    console.log('\n✅ KIỂM TRA HOÀN TẤT!');
    if (teamsWithLeaderCount === teams.length) {
      console.log('🎉 TẤT CẢ TEAMS ĐÃ CÓ LEADER!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testFixedTeamMapping().catch(console.error);
