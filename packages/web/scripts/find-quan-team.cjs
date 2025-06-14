const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function findQuanTeam() {
  console.log('🔍 TÌM NHÓM CỦA QUÂN');
  console.log('====================\n');

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

    // 2. Tìm Quân
    console.log('2. 🔍 TÌM QUÂN:');
    console.log('===============');
    
    const quan = users.find(user => user.name.toLowerCase().includes('quân'));
    if (quan) {
      console.log(`👨‍💼 Tìm thấy: ${quan.name}`);
      console.log(`   - ID: ${quan.id}`);
      console.log(`   - Email: ${quan.email}`);
      console.log(`   - Role: ${quan.role}`);
      console.log(`   - Team ID: ${quan.team_id}`);
      console.log(`   - Location: ${quan.location}`);
      console.log('');
      
      // Tìm team của Quân
      const quanTeam = teams.find(t => t.id === quan.team_id);
      if (quanTeam) {
        console.log(`🏢 Team của Quân: ${quanTeam.name}`);
        console.log(`   - Team ID: ${quanTeam.id}`);
        console.log(`   - Location: ${quanTeam.location}`);
        console.log(`   - Leader ID: ${quanTeam.leader_id}`);
      } else {
        console.log(`❌ Không tìm thấy team với ID: ${quan.team_id}`);
      }
    } else {
      console.log('❌ Không tìm thấy Quân trong danh sách users');
      
      // Tìm tất cả users có tên chứa "qu"
      const possibleQuan = users.filter(user => 
        user.name.toLowerCase().includes('qu') || 
        user.name.toLowerCase().includes('quan')
      );
      
      if (possibleQuan.length > 0) {
        console.log('🔍 Có thể là Quân:');
        possibleQuan.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
        });
      }
    }

    // 3. Liệt kê tất cả team leaders
    console.log('\n3. 👨‍💼 TẤT CẢ TEAM LEADERS:');
    console.log('============================');
    
    const teamLeaders = users.filter(user => user.role === 'team_leader');
    teamLeaders.forEach((leader, index) => {
      console.log(`${index + 1}. ${leader.name}`);
      console.log(`   - Team ID: ${leader.team_id}`);
      console.log(`   - Location: ${leader.location}`);
      
      const team = teams.find(t => t.id === leader.team_id);
      if (team) {
        console.log(`   - Team: ${team.name}`);
      }
      console.log('');
    });

    // 4. Cấu trúc đúng theo yêu cầu
    console.log('4. 📋 CẤU TRÚC ĐÚNG THEO YÊU CẦU:');
    console.log('=================================');
    console.log('HÀ NỘI:');
    console.log('   1. NHÓM 1 - Lương Việt Anh');
    console.log('   2. NHÓM 2 - Nguyễn Thị Thảo');
    console.log('   3. NHÓM 3 - Trịnh Thị Bốn');
    console.log('   4. NHÓM 4 - Phạm Thị Hương');
    console.log('   5. NHÓM 5 - [QUÂN?]');
    console.log('');
    console.log('HỒ CHÍ MINH:');
    console.log('   1. NHÓM 1 - Nguyễn Thị Nga (từ team_id: 5)');
    console.log('   2. NHÓM 2 - Nguyễn Ngọc Việt Khanh (từ team_id: 6)');

    // 5. Tìm team leaders thiếu
    console.log('\n5. 🔍 TÌM TEAM LEADERS THIẾU:');
    console.log('=============================');
    
    const expectedLeaders = [
      'Lương Việt Anh',
      'Nguyễn Thị Thảo', 
      'Trịnh Thị Bốn',
      'Phạm Thị Hương',
      'Nguyễn Thị Nga',
      'Nguyễn Ngọc Việt Khanh'
    ];
    
    const foundLeaders = teamLeaders.map(l => l.name);
    const missingLeaders = expectedLeaders.filter(name => 
      !foundLeaders.some(found => found.includes(name.split(' ').pop()))
    );
    
    console.log('✅ Có sẵn:', foundLeaders);
    console.log('❌ Thiếu:', missingLeaders);
    
    // Tìm users có thể là team leader
    const potentialLeaders = users.filter(user => 
      user.role !== 'team_leader' && 
      user.role !== 'retail_director' &&
      !user.name.includes('Deleted')
    );
    
    if (potentialLeaders.length > 0) {
      console.log('\n🤔 Users có thể là team leader:');
      potentialLeaders.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - Team: ${user.team_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

findQuanTeam().catch(console.error);
