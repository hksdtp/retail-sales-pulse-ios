const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function findMissingQuan() {
  console.log('🔍 TÌM LÊ TIẾN QUÂN VÀ SỬA CẤU TRÚC TEAMS');
  console.log('=========================================\n');

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

    // 2. Tìm Lê Tiến Quân
    console.log('2. 🔍 TÌM LÊ TIẾN QUÂN:');
    console.log('======================');
    
    const quan = users.find(user => user.name.includes('Quân'));
    if (quan) {
      console.log(`✅ Tìm thấy: ${quan.name}`);
      console.log(`   - ID: ${quan.id}`);
      console.log(`   - Email: ${quan.email}`);
      console.log(`   - Role: ${quan.role}`);
      console.log(`   - Team ID: ${quan.team_id}`);
      console.log(`   - Location: ${quan.location}`);
    } else {
      console.log('❌ KHÔNG tìm thấy Lê Tiến Quân trong users');
      console.log('🔍 Tìm kiếm tất cả users có tên chứa "Quân", "Quan", "Tiến":');
      
      const possibleQuan = users.filter(user => 
        user.name.toLowerCase().includes('quân') ||
        user.name.toLowerCase().includes('quan') ||
        user.name.toLowerCase().includes('tiến')
      );
      
      if (possibleQuan.length > 0) {
        possibleQuan.forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.log('   Không tìm thấy user nào có tên tương tự');
      }
    }
    console.log('');

    // 3. Phân tích team leaders hiện tại
    console.log('3. 👨‍💼 TEAM LEADERS HIỆN TẠI:');
    console.log('=============================');
    
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    teamLeaders.forEach(leader => {
      console.log(`👨‍💼 ${leader.name}`);
      console.log(`   - Team ID: ${leader.team_id}`);
      console.log(`   - Location: ${leader.location}`);
    });
    console.log('');

    // 4. Cấu trúc teams lý tưởng
    console.log('4. 🎯 CẤU TRÚC TEAMS LÝ TƯỞNG:');
    console.log('==============================');
    
    const idealStructure = {
      hanoi: [
        { team: 'NHÓM 1', leader: 'Lương Việt Anh', teamId: '1' },
        { team: 'NHÓM 2', leader: 'Nguyễn Thị Thảo', teamId: '2' },
        { team: 'NHÓM 3', leader: 'Trịnh Thị Bốn', teamId: '3' },
        { team: 'NHÓM 4', leader: 'Phạm Thị Hương', teamId: '4' },
        { team: 'NHÓM 5', leader: 'Lê Tiến Quân (?)', teamId: '?' },
      ],
      hcm: [
        { team: 'NHÓM 1', leader: 'Nguyễn Thị Nga', teamId: '5' },
        { team: 'NHÓM 2', leader: 'Nguyễn Ngọc Việt Khanh', teamId: '6' },
      ]
    };

    console.log('🏢 HÀ NỘI (nên có):');
    idealStructure.hanoi.forEach((item, index) => {
      const leader = teamLeaders.find(l => l.name.includes(item.leader.split(' ')[0]));
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}`);
      console.log(`      Status: ${leader ? '✅ Có' : '❌ Thiếu'}`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH (nên có):');
    idealStructure.hcm.forEach((item, index) => {
      const leader = teamLeaders.find(l => l.name.includes(item.leader.split(' ')[0]));
      console.log(`   ${index + 1}. ${item.team} - ${item.leader}`);
      console.log(`      Status: ${leader ? '✅ Có' : '❌ Thiếu'}`);
    });

    // 5. Phân tích teams hiện tại
    console.log('\n5. 📋 TEAMS HIỆN TẠI:');
    console.log('====================');
    
    const hanoiTeams = teams.filter(t => t.location === 'hanoi');
    const hcmTeams = teams.filter(t => t.location === 'hcm');
    
    console.log('🏢 HÀ NỘI TEAMS:');
    hanoiTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
    });
    
    console.log('\n🏢 HỒ CHÍ MINH TEAMS:');
    hcmTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
    });

    // 6. Đề xuất giải pháp
    console.log('\n6. 💡 ĐỀ XUẤT GIẢI PHÁP:');
    console.log('========================');
    
    if (!quan) {
      console.log('🔧 BƯỚC 1: Tạo user Lê Tiến Quân');
      console.log('   - Tên: Lê Tiến Quân');
      console.log('   - Role: team_leader');
      console.log('   - Team ID: 5 (hoặc số phù hợp)');
      console.log('   - Location: hanoi');
      console.log('');
    }
    
    console.log('🔧 BƯỚC 2: Xóa teams duplicate');
    console.log('   - Giữ lại 1 team cho mỗi nhóm');
    console.log('   - HN: NHÓM 1,2,3,4 (+ NHÓM 5 nếu có Quân)');
    console.log('   - HCM: NHÓM 1,2');
    console.log('');
    
    console.log('🔧 BƯỚC 3: Cập nhật utility function');
    console.log('   - Mapping đúng theo cấu trúc mới');
    console.log('   - Sắp xếp theo thứ tự 1,2,3,4,5,1,2');

    // 7. Kiểm tra teams duplicate
    console.log('\n7. 🔍 TEAMS DUPLICATE CẦN XÓA:');
    console.log('==============================');
    
    const teamGroups = {};
    teams.forEach(team => {
      const key = `${team.location}-${team.name}`;
      if (!teamGroups[key]) {
        teamGroups[key] = [];
      }
      teamGroups[key].push(team);
    });
    
    Object.entries(teamGroups).forEach(([key, teamList]) => {
      if (teamList.length > 1) {
        console.log(`🔄 Duplicate: ${key} (${teamList.length} teams)`);
        teamList.forEach((team, index) => {
          console.log(`   ${index + 1}. ID: ${team.id} - ${index === 0 ? '✅ Giữ' : '❌ Xóa'}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

findMissingQuan().catch(console.error);
