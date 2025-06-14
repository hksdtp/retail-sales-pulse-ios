const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function testTeamLeaderNames() {
  console.log('🧪 KIỂM TRA TÊN TRƯỞNG NHÓM TRONG TEAMS');
  console.log('=====================================\n');

  try {
    // 1. Lấy users và teams
    console.log('1. 📥 Lấy dữ liệu users và teams...');
    
    const [usersResponse, teamsResponse] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`)
    ]);

    const usersData = await usersResponse.json();
    const teamsData = await teamsResponse.json();

    if (!usersData.success || !teamsData.success) {
      console.log('❌ Lỗi khi lấy dữ liệu');
      return;
    }

    const users = usersData.data.filter(user => user.status !== 'deleted');
    const teams = teamsData.data;

    console.log(`✅ Users active: ${users.length}`);
    console.log(`✅ Teams: ${teams.length}`);
    console.log('');

    // 2. Phân tích teams và trưởng nhóm
    console.log('2. 👥 Phân tích teams và trưởng nhóm...');
    
    teams.forEach((team, index) => {
      console.log(`📋 ${index + 1}. Team: "${team.name}" (ID: ${team.id})`);
      console.log(`   - Location: ${team.location}`);
      console.log(`   - Leader ID: ${team.leader_id || 'undefined'}`);
      
      // Tìm trưởng nhóm theo leader_id
      let leader = users.find(user => user.id === team.leader_id);
      
      if (!leader) {
        // Fallback: tìm theo team_id và role
        leader = users.find(user => user.team_id === team.id && user.role === 'team_leader');
      }
      
      if (leader) {
        console.log(`   ✅ Trưởng nhóm: ${leader.name} (${leader.email})`);
        console.log(`   📝 Tên hiển thị: "${team.name} - ${leader.name}"`);
      } else {
        console.log(`   ❌ Không tìm thấy trưởng nhóm`);
        console.log(`   📝 Tên hiển thị: "${team.name}"`);
      }
      console.log('');
    });

    // 3. Kiểm tra team leaders trong users
    console.log('3. 👨‍💼 Danh sách team leaders trong users...');
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    
    teamLeaders.forEach((leader, index) => {
      console.log(`👨‍💼 ${index + 1}. ${leader.name} (ID: ${leader.id})`);
      console.log(`   - Email: ${leader.email}`);
      console.log(`   - Team ID: ${leader.team_id}`);
      
      const team = teams.find(t => t.id === leader.team_id);
      if (team) {
        console.log(`   - Team: ${team.name}`);
        console.log(`   - Là leader_id của team: ${team.leader_id === leader.id ? 'Có' : 'Không'}`);
      } else {
        console.log(`   - Team: Không tìm thấy`);
      }
      console.log('');
    });

    // 4. Tạo mapping teams với tên trưởng nhóm
    console.log('4. 🏷️ Mapping teams với tên trưởng nhóm...');
    
    const teamsWithLeaders = teams.map(team => {
      let leader = users.find(user => user.id === team.leader_id);
      
      if (!leader) {
        leader = users.find(user => user.team_id === team.id && user.role === 'team_leader');
      }
      
      const displayName = leader ? `${team.name} - ${leader.name}` : team.name;
      
      return {
        id: team.id,
        name: team.name,
        displayName,
        leader: leader ? leader.name : null,
        location: team.location
      };
    });

    console.log('📋 DANH SÁCH TEAMS VỚI TÊN TRƯỞNG NHÓM:');
    console.log('======================================');
    
    // Sắp xếp theo location
    const hanoiTeams = teamsWithLeaders.filter(t => t.location === 'hanoi');
    const hcmTeams = teamsWithLeaders.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI:');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH:');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.displayName}`);
    });

    // 5. Thống kê
    console.log('\n📊 THỐNG KÊ:');
    console.log('============');
    console.log(`🔢 Tổng teams: ${teams.length}`);
    console.log(`👨‍💼 Teams có trưởng nhóm: ${teamsWithLeaders.filter(t => t.leader).length}`);
    console.log(`❓ Teams chưa có trưởng nhóm: ${teamsWithLeaders.filter(t => !t.leader).length}`);
    console.log(`🏢 Teams Hà Nội: ${hanoiTeams.length}`);
    console.log(`🏢 Teams HCM: ${hcmTeams.length}`);
    
    const teamsWithoutLeader = teamsWithLeaders.filter(t => !t.leader);
    if (teamsWithoutLeader.length > 0) {
      console.log('\n⚠️ TEAMS CHƯA CÓ TRƯỞNG NHÓM:');
      teamsWithoutLeader.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });
    }

    console.log('\n✅ KIỂM TRA HOÀN TẤT!');
    console.log('🌐 Bây giờ các dropdown sẽ hiển thị: "Tên Team - Tên Trưởng Nhóm"');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
  }
}

// Chạy test
testTeamLeaderNames().catch(console.error);
