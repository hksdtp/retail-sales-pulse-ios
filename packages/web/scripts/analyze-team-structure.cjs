const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function analyzeTeamStructure() {
  console.log('🔍 PHÂN TÍCH CẤU TRÚC TEAMS');
  console.log('==========================\n');

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

    // 2. Phân tích team leaders
    console.log('2. 👨‍💼 PHÂN TÍCH TEAM LEADERS:');
    console.log('==============================');
    
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    teamLeaders.forEach(leader => {
      console.log(`👨‍💼 ${leader.name}`);
      console.log(`   - ID: ${leader.id}`);
      console.log(`   - Email: ${leader.email}`);
      console.log(`   - Team ID: ${leader.team_id}`);
      console.log(`   - Location: ${leader.location}`);
      console.log('');
    });

    // 3. Phân tích teams theo location
    console.log('3. 🏢 PHÂN TÍCH TEAMS THEO LOCATION:');
    console.log('===================================');
    
    const hanoiTeams = teams.filter(t => t.location === 'hanoi');
    const hcmTeams = teams.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI TEAMS:');
    hanoiTeams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id})`);
      console.log(`     Leader ID: ${team.leader_id}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH TEAMS:');
    hcmTeams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id})`);
      console.log(`     Leader ID: ${team.leader_id}`);
    });

    // 4. Mapping đúng theo yêu cầu
    console.log('\n4. 🎯 MAPPING ĐÚNG THEO YÊU CẦU:');
    console.log('================================');
    
    console.log('📋 Theo memory của user:');
    console.log('- Teams 5 và 6 should be reassigned to Teams 1 and 2 respectively for Ho Chi Minh location');
    console.log('- Thao should have her own Team 2');
    console.log('');

    // Mapping đúng
    const correctMapping = {
      // HÀ NỘI
      hanoi: {
        'NHÓM 1': 'Lương Việt Anh',      // team_id: 1
        'NHÓM 2': 'Nguyễn Thị Thảo',     // team_id: 2 - THẢO
        'NHÓM 3': 'Trịnh Thị Bốn',       // team_id: 3
        'NHÓM 4': 'Phạm Thị Hương',      // team_id: 4
      },
      // HỒ CHÍ MINH (Teams 5,6 -> 1,2)
      hcm: {
        'NHÓM 1': 'Nguyễn Thị Nga',      // team_id: 5 -> Team 1 HCM
        'NHÓM 2': 'Nguyễn Ngọc Việt Khanh', // team_id: 6 -> Team 2 HCM
      }
    };

    console.log('✅ MAPPING ĐÚNG:');
    console.log('🏢 HÀ NỘI:');
    Object.entries(correctMapping.hanoi).forEach(([team, leader]) => {
      console.log(`   ${team} -> ${leader}`);
    });
    
    console.log('🏢 HỒ CHÍ MINH:');
    Object.entries(correctMapping.hcm).forEach(([team, leader]) => {
      console.log(`   ${team} -> ${leader}`);
    });

    // 5. Kiểm tra teams hiện tại vs mapping đúng
    console.log('\n5. 🔍 KIỂM TRA TEAMS HIỆN TẠI:');
    console.log('==============================');
    
    teams.forEach(team => {
      console.log(`📋 ${team.name} (${team.location.toUpperCase()})`);
      
      let expectedLeader = null;
      if (team.location === 'hanoi') {
        if (team.name.includes('NHÓM 1')) expectedLeader = 'Lương Việt Anh';
        else if (team.name.includes('NHÓM 2')) expectedLeader = 'Nguyễn Thị Thảo';
        else if (team.name.includes('NHÓM 3')) expectedLeader = 'Trịnh Thị Bốn';
        else if (team.name.includes('NHÓM 4')) expectedLeader = 'Phạm Thị Hương';
      } else if (team.location === 'hcm') {
        if (team.name.includes('NHÓM 1') || team.name.includes('NHÓM 5')) expectedLeader = 'Nguyễn Thị Nga';
        else if (team.name.includes('NHÓM 2') || team.name.includes('NHÓM 6')) expectedLeader = 'Nguyễn Ngọc Việt Khanh';
      }
      
      console.log(`   Nên có leader: ${expectedLeader || 'Không xác định'}`);
      
      // Tìm leader thực tế
      const actualLeader = users.find(u => u.id === team.leader_id);
      if (actualLeader) {
        console.log(`   Leader hiện tại: ${actualLeader.name}`);
        console.log(`   ✅ ${actualLeader.name === expectedLeader ? 'ĐÚNG' : '❌ SAI'}`);
      } else {
        console.log(`   Leader hiện tại: Không có`);
        console.log(`   ❌ SAI`);
      }
      console.log('');
    });

    // 6. Đề xuất sửa
    console.log('6. 💡 ĐỀ XUẤT SỬA UTILITY FUNCTION:');
    console.log('===================================');
    console.log('Cần cập nhật logic trong teamUtils.ts để:');
    console.log('1. Phân biệt Thảo (team_id: 2, Hà Nội) vs Việt Khanh (team_id: 2, Hà Nội)');
    console.log('2. Mapping Teams 5,6 (HCM) thành Teams 1,2 (HCM)');
    console.log('3. Ưu tiên theo tên team cụ thể (VD: "NHÓM 2 - THẢO" -> Thảo)');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

analyzeTeamStructure().catch(console.error);
