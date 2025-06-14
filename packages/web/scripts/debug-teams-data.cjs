const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function debugTeamsData() {
  console.log('🔍 DEBUG TEAMS DATA TRONG DATABASE');
  console.log('==================================\n');

  try {
    // 1. Lấy teams data
    console.log('1. 📋 TEAMS DATA:');
    console.log('=================');
    
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    const teamsData = await teamsResponse.json();
    const teams = teamsData.data;
    
    console.log(`✅ Tổng teams: ${teams.length}`);
    console.log('');
    
    teams.forEach((team, index) => {
      console.log(`Team ${index + 1}:`);
      console.log(`   - ID: ${team.id}`);
      console.log(`   - Name: "${team.name}"`);
      console.log(`   - Location: ${team.location}`);
      console.log(`   - Active: ${team.active}`);
      console.log(`   - Leader ID: ${team.leader_id}`);
      console.log('');
    });

    // 2. Lấy users data
    console.log('2. 👥 USERS DATA (TEAM LEADERS):');
    console.log('================================');
    
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    const users = usersData.data.filter(user => user.status !== 'deleted');
    
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    console.log(`✅ Team leaders: ${teamLeaders.length}`);
    console.log('');
    
    teamLeaders.forEach((leader, index) => {
      console.log(`Leader ${index + 1}:`);
      console.log(`   - ID: ${leader.id}`);
      console.log(`   - Name: "${leader.name}"`);
      console.log(`   - Team ID: ${leader.team_id}`);
      console.log(`   - Location: ${leader.location}`);
      console.log(`   - Email: ${leader.email}`);
      console.log('');
    });

    // 3. Test getUniqueTeams logic
    console.log('3. 🧪 TEST getUniqueTeams LOGIC:');
    console.log('================================');
    
    const desiredStructure = {
      hanoi: ['NHÓM 1', 'NHÓM 2', 'NHÓM 3', 'NHÓM 4'],
      hcm: ['NHÓM 1', 'NHÓM 2']
    };
    
    const uniqueTeams = [];
    
    Object.entries(desiredStructure).forEach(([location, teamNames]) => {
      console.log(`\n🏢 ${location.toUpperCase()}:`);
      
      teamNames.forEach(teamName => {
        console.log(`\n   Tìm "${teamName}" tại ${location}:`);
        
        // Tìm team phù hợp, ưu tiên team có tên cụ thể
        let team = teams.find(t => 
          t.location === location && 
          t.name === teamName &&
          t.active !== false
        );
        
        if (team) {
          console.log(`   ✅ Tìm thấy exact match: ${team.name} (ID: ${team.id})`);
          uniqueTeams.push(team);
        } else {
          // Nếu không tìm thấy, tìm team có chứa tên
          team = teams.find(t => 
            t.location === location && 
            t.name.includes(teamName) &&
            t.active !== false
          );
          
          if (team) {
            console.log(`   ✅ Tìm thấy partial match: ${team.name} (ID: ${team.id})`);
            uniqueTeams.push(team);
          } else {
            console.log(`   ❌ Không tìm thấy team "${teamName}" tại ${location}`);
            
            // Debug: hiển thị teams có sẵn tại location này
            const availableTeams = teams.filter(t => t.location === location);
            console.log(`   📋 Teams có sẵn tại ${location}:`);
            availableTeams.forEach(t => {
              console.log(`      - "${t.name}" (ID: ${t.id}, Active: ${t.active})`);
            });
          }
        }
      });
    });
    
    console.log(`\n📊 Kết quả getUniqueTeams: ${uniqueTeams.length} teams`);
    uniqueTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.location})`);
    });

    // 4. Test findTeamLeaderByPattern
    console.log('\n4. 🧪 TEST findTeamLeaderByPattern:');
    console.log('===================================');
    
    const teamLeaderMapping = {
      hanoi: {
        'NHÓM 1': 'Lương Việt Anh',
        'NHÓM 2': 'Nguyễn Thị Thảo',
        'NHÓM 3': 'Trịnh Thị Bốn',
        'NHÓM 4': 'Phạm Thị Hương',
      },
      hcm: {
        'NHÓM 1': 'Nguyễn Thị Nga',
        'NHÓM 2': 'Nguyễn Ngọc Việt Khanh',
      }
    };
    
    uniqueTeams.forEach(team => {
      console.log(`\n🔍 Team: ${team.name} (${team.location})`);
      
      const location = team.location === 'hcm' ? 'hcm' : 'hanoi';
      const locationMapping = teamLeaderMapping[location];
      
      let foundLeader = null;
      
      // Tìm pattern phù hợp
      for (const [pattern, leaderName] of Object.entries(locationMapping)) {
        if (team.name.includes(pattern)) {
          console.log(`   📋 Pattern match: "${pattern}" -> "${leaderName}"`);
          
          // Tìm leader theo tên
          const leader = users.find(user =>
            user.name === leaderName && user.role === 'team_leader'
          );
          
          if (leader) {
            console.log(`   ✅ Tìm thấy leader: ${leader.name} (ID: ${leader.id})`);
            foundLeader = leader;
            break;
          } else {
            console.log(`   ❌ Không tìm thấy leader: ${leaderName}`);
            
            // Fallback: tìm theo tên gần đúng
            const partialMatch = users.find(user =>
              user.role === 'team_leader' &&
              leaderName.split(' ').some(part => user.name.includes(part))
            );
            
            if (partialMatch) {
              console.log(`   ✅ Tìm thấy partial match: ${partialMatch.name}`);
              foundLeader = partialMatch;
              break;
            }
          }
        }
      }
      
      if (!foundLeader) {
        console.log(`   ❌ Không tìm thấy leader cho team ${team.name}`);
      }
    });

    // 5. Test getTeamsWithLeaderNames
    console.log('\n5. 🧪 TEST getTeamsWithLeaderNames:');
    console.log('==================================');
    
    const teamsWithLeaders = uniqueTeams.map((team) => {
      const location = team.location === 'hcm' ? 'hcm' : 'hanoi';
      const locationMapping = teamLeaderMapping[location];
      
      let leader = null;
      
      // Tìm pattern phù hợp
      for (const [pattern, leaderName] of Object.entries(locationMapping)) {
        if (team.name.includes(pattern)) {
          leader = users.find(user =>
            user.name === leaderName && user.role === 'team_leader'
          );
          
          if (!leader) {
            leader = users.find(user =>
              user.role === 'team_leader' &&
              leaderName.split(' ').some(part => user.name.includes(part))
            );
          }
          break;
        }
      }
      
      const displayName = leader ? `${team.name} - ${leader.name}` : team.name;
      
      return {
        id: team.id,
        name: team.name,
        displayName,
        leader: leader || undefined,
      };
    });
    
    console.log(`📋 Teams với leaders: ${teamsWithLeaders.length}`);
    teamsWithLeaders.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });

    // 6. Kết luận
    console.log('\n6. 🎯 KẾT LUẬN:');
    console.log('===============');
    
    if (uniqueTeams.length === 0) {
      console.log('❌ VẤN ĐỀ: getUniqueTeams trả về empty array');
      console.log('🔧 NGUYÊN NHÂN: Teams trong database không match với expected structure');
      console.log('💡 GIẢI PHÁP: Cần cập nhật logic hoặc data structure');
    } else if (teamsWithLeaders.filter(t => t.leader).length === 0) {
      console.log('❌ VẤN ĐỀ: Không có team nào có leader');
      console.log('🔧 NGUYÊN NHÂN: findTeamLeaderByPattern không hoạt động');
      console.log('💡 GIẢI PHÁP: Cần fix mapping logic');
    } else {
      console.log('✅ Logic hoạt động đúng');
      console.log(`📊 ${teamsWithLeaders.length} teams, ${teamsWithLeaders.filter(t => t.leader).length} có leaders`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

debugTeamsData().catch(console.error);
