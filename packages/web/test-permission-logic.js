// Test permission logic directly
console.log('🔐 Testing permission logic...');

// Mock data
const mockUsers = [
  {
    id: 'Ve7sGRnMoRvT1E0VL5Ds',
    name: 'Khổng Đức Mạnh',
    role: 'retail_director',
    team_id: '0'
  },
  {
    id: 'Ue4vzSj1KDg4vZyXwlHJ',
    name: 'Lương Việt Anh',
    role: 'team_leader',
    team_id: '1'
  },
  {
    id: 'abtSSmK0p0oeOyy5YWGZ',
    name: 'Lê Khánh Duy',
    role: 'employee',
    team_id: '1'
  }
];

const mockTasks = [
  {
    id: 'task-team1-1',
    title: 'Task của NHÓM 1 - VIỆT ANH',
    team_id: '1',
    teamId: '1',
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ'
  },
  {
    id: 'task-team2-1',
    title: 'Task của NHÓM 2 - THẢO',
    team_id: '2',
    teamId: '2',
    user_id: 'user-thao-id'
  }
];

// Test permission logic
function testPermissionLogic() {
  console.log('\n📝 Testing permission logic for different users:');
  
  mockUsers.forEach(user => {
    console.log(`\n👤 Testing user: ${user.name} (role: ${user.role}, team: ${user.team_id})`);
    
    // Test team visibility
    const canSeeAllTeams = user.name === 'Khổng Đức Mạnh' || user.role === 'retail_director';
    console.log(`  🔍 Can see all teams: ${canSeeAllTeams ? 'YES' : 'NO'}`);
    
    if (!canSeeAllTeams) {
      console.log(`  🔍 Can only see team: ${user.team_id}`);
    }
    
    // Test task access for each team
    ['1', '2', '3', '4'].forEach(teamId => {
      const isRegularMember = user.role === 'employee' || user.role === 'member';
      const currentUserTeamId = user.team_id;
      
      let canAccessTeam = true;
      
      if (isRegularMember && teamId !== currentUserTeamId) {
        canAccessTeam = false;
      }
      
      console.log(`  📋 Can access NHÓM ${teamId}: ${canAccessTeam ? 'YES' : 'NO'} ${!canAccessTeam ? '(PERMISSION DENIED)' : ''}`);
    });
  });
}

// Test task filtering
function testTaskFiltering() {
  console.log('\n📊 Testing task filtering logic:');
  
  const testUser = mockUsers.find(u => u.name === 'Lê Khánh Duy');
  console.log(`\n👤 Testing as: ${testUser.name} (team: ${testUser.team_id})`);
  
  mockTasks.forEach(task => {
    const taskTeamId = String(task.team_id || task.teamId || '');
    const userTeamId = String(testUser.team_id);
    const isRegularMember = testUser.role === 'employee' || testUser.role === 'member';
    
    const directTeamMatch = taskTeamId === userTeamId;
    const canSeeTask = !isRegularMember || directTeamMatch;
    
    console.log(`  📋 Task "${task.title}": team=${taskTeamId}, canSee=${canSeeTask ? 'YES' : 'NO'} ${!canSeeTask ? '(FILTERED OUT)' : ''}`);
  });
}

testPermissionLogic();
testTaskFiltering();

console.log('\n✅ Permission logic test completed!');
