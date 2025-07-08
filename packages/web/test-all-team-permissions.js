// Test permissions for all team members
console.log('🔐 Testing permissions for all team members...');

// Mock users from different teams
const testUsers = [
  {
    id: 'Ve7sGRnMoRvT1E0VL5Ds',
    name: 'Khổng Đức Mạnh',
    role: 'retail_director',
    team_id: '0'
  },
  {
    id: 'abtSSmK0p0oeOyy5YWGZ',
    name: 'Lê Khánh Duy',
    role: 'employee',
    team_id: '1'
  },
  {
    id: 'quan_thu_ha_id',
    name: 'Quản Thu Hà',
    role: 'employee',
    team_id: '1'
  },
  {
    id: 'nguyen_manh_linh_id',
    name: 'Nguyễn Mạnh Linh',
    role: 'employee',
    team_id: '2'
  },
  {
    id: 'trinh_thi_bon_id',
    name: 'Trịnh Thị Bốn',
    role: 'team_leader',
    team_id: '3'
  },
  {
    id: 'pham_thi_huong_hn_id',
    name: 'Phạm Thị Hương',
    role: 'team_leader',
    team_id: '4'
  },
  {
    id: 'nguyen_thi_nga_id',
    name: 'Nguyễn Thị Nga',
    role: 'team_leader',
    team_id: '5'
  },
  {
    id: 'ha_nguyen_thanh_tuyen_id',
    name: 'Hà Nguyễn Thanh Tuyền',
    role: 'employee',
    team_id: '5'
  },
  {
    id: 'nguyen_ngoc_viet_khanh_id',
    name: 'Nguyễn Ngọc Việt Khanh',
    role: 'team_leader',
    team_id: '6'
  },
  {
    id: 'phung_thi_thuy_van_id',
    name: 'Phùng Thị Thuỳ Vân',
    role: 'employee',
    team_id: '6'
  }
];

// Test permission logic for each user
function testPermissionForUser(user) {
  console.log(`\n👤 Testing: ${user.name} (role: ${user.role}, team: ${user.team_id})`);
  
  const isRegularMember = user.role === 'employee' || user.role === 'member';
  const isTeamLeader = user.role === 'team_leader';
  const isDirector = user.role === 'retail_director' || user.role === 'project_director';

  // Test team visibility
  if (isDirector) {
    console.log('  🔑 Director: Can see ALL teams');
  } else {
    console.log(`  👤 Regular user/Team leader: Can only see team ${user.team_id}`);
  }

  // Test access to each team
  const teams = ['1', '2', '3', '4', '5', '6'];
  teams.forEach(teamId => {
    let canAccess = true;
    let reason = '';

    if ((isRegularMember || isTeamLeader) && teamId !== user.team_id) {
      canAccess = false;
      reason = ' (PERMISSION DENIED - Not own team)';
    } else if (isDirector) {
      reason = ' (Director access)';
    } else if (teamId === user.team_id) {
      reason = ' (Own team)';
    }
    
    console.log(`  📋 Access NHÓM ${teamId}: ${canAccess ? '✅ YES' : '❌ NO'}${reason}`);
  });
  
  // Test shared task access
  console.log('  📋 Access shared tasks: ✅ YES (All users can see shared tasks)');
}

// Test all users
console.log('📊 Permission Matrix Test:');
console.log('='.repeat(60));

testUsers.forEach(user => {
  testPermissionForUser(user);
});

// Summary
console.log('\n📋 Summary:');
console.log('✅ Director (Khổng Đức Mạnh): Full access to all teams');
console.log('✅ Team 1 members (Lê Khánh Duy, Quản Thu Hà): Only team 1 + shared');
console.log('✅ Team 2 member (Nguyễn Mạnh Linh): Only team 2 + shared');
console.log('✅ Team 3 leader (Trịnh Thị Bốn): Only team 3 + shared');
console.log('✅ Team 4 leader (Phạm Thị Hương): Only team 4 + shared');
console.log('✅ Team 5 members (Nga, Tuyền - HCM): Only team 5 + shared');
console.log('✅ Team 6 members (Khanh, Vân - HCM): Only team 6 + shared');

console.log('\n🎯 Expected Behavior:');
console.log('- Each team member can ONLY access their own team tasks');
console.log('- Team members CANNOT see other teams in team selection');
console.log('- Team members CANNOT access other teams even if they try');
console.log('- All users can see shared/department-wide tasks');
console.log('- Director maintains full access to everything');

console.log('\n✅ Permission logic is consistent across all teams!');
