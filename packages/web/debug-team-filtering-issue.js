// Debug team filtering issue for Nguyễn Mạnh Linh
console.log('🔍 Debug team filtering issue...');

// Test data from API
const mockUser = {
  id: 'nguyen_manh_linh_id',
  name: 'Nguyễn Mạnh Linh',
  role: 'employee',
  team_id: '2',
  location: 'Hà Nội',
  department_type: 'retail'
};

const mockTeams = [
  {
    id: '1',
    name: 'NHÓM 1 - VIỆT ANH',
    leader_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    location: 'Hà Nội'
  },
  {
    id: '2',
    name: 'NHÓM 2 - THẢO',
    leader_id: 'nguyen_thi_thao_id',
    location: 'Hà Nội'
  },
  {
    id: '3',
    name: 'NHÓM 3',
    leader_id: 'trinh_thi_bon_id',
    location: 'Hà Nội'
  }
];

// Simulate the filtering logic from TeamCardsView
function testTeamFiltering() {
  console.log('\n👤 Testing for user:', mockUser.name);
  console.log('📋 User details:', {
    name: mockUser.name,
    team_id: mockUser.team_id,
    role: mockUser.role,
    location: mockUser.location
  });
  
  // Check if user is director
  const isDirector = mockUser.name === 'Khổng Đức Mạnh' || mockUser.role === 'retail_director';
  console.log('🔑 Is director:', isDirector);
  
  if (isDirector) {
    console.log('✅ Director: Should see ALL teams');
    return mockTeams;
  } else {
    console.log('👤 Regular user: Should only see own team');
    
    // Filter teams by user's team_id
    const userTeamId = String(mockUser.team_id);
    console.log('🎯 User team_id:', userTeamId);
    
    const filteredTeams = mockTeams.filter(team => {
      const teamId = String(team.id);
      const match = teamId === userTeamId;
      
      console.log(`  📋 Team ${team.name}: id="${teamId}", match=${match}`);
      return match;
    });
    
    console.log('📊 Filtered teams:', filteredTeams.map(t => t.name));
    return filteredTeams;
  }
}

// Test the logic
const result = testTeamFiltering();

console.log('\n📊 Expected Result:');
console.log('✅ Should see: NHÓM 2 - THẢO');
console.log('❌ Should NOT see: NHÓM 1 - VIỆT ANH');

console.log('\n📊 Actual Result:');
if (result.length === 1 && result[0].name === 'NHÓM 2 - THẢO') {
  console.log('✅ CORRECT: Only showing NHÓM 2 - THẢO');
} else if (result.length === 1 && result[0].name === 'NHÓM 1 - VIỆT ANH') {
  console.log('❌ BUG: Showing NHÓM 1 instead of NHÓM 2');
} else if (result.length > 1) {
  console.log('❌ BUG: Showing multiple teams:', result.map(t => t.name));
} else {
  console.log('❌ BUG: No teams showing');
}

console.log('\n🔍 Debugging checklist:');
console.log('1. Check if currentUser.team_id is correctly set to "2"');
console.log('2. Check if teams data has correct IDs');
console.log('3. Check if String() conversion is working correctly');
console.log('4. Check if there are any hardcoded overrides');

console.log('\n✅ Logic test completed!');
