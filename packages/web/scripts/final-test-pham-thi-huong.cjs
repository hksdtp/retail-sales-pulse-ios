#!/usr/bin/env node

/**
 * Script test cuối cùng để verify phân quyền của Phạm Thị Hương
 */

const API_BASE = 'http://localhost:3003';

async function finalTest() {
  console.log('🎯 FINAL TEST - PHẠM THỊ HƯƠNG PERMISSION');
  console.log('='.repeat(60));

  try {
    // 1. Verify API data
    console.log('\n1. 📊 VERIFY API DATA:');
    console.log('-'.repeat(40));
    
    const [usersRes, teamsRes, tasksRes] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/teams`),
      fetch(`${API_BASE}/tasks`)
    ]);

    const [users, teams, tasks] = await Promise.all([
      usersRes.json(),
      teamsRes.json(),
      tasksRes.json()
    ]);

    console.log(`👥 Users: ${users.data?.length || 0}`);
    console.log(`🏢 Teams: ${teams.data?.length || 0}`);
    console.log(`📋 Tasks: ${tasks.data?.length || 0}`);

    // 2. Find Phạm Thị Hương
    const huongUser = users.data?.find(u => u.name.includes('Phạm Thị Hương'));
    if (!huongUser) {
      console.log('❌ Không tìm thấy Phạm Thị Hương trong users');
      return;
    }

    console.log(`\n✅ Phạm Thị Hương:`);
    console.log(`   - ID: ${huongUser.id}`);
    console.log(`   - Role: ${huongUser.role}`);
    console.log(`   - Team ID: ${huongUser.team_id}`);
    console.log(`   - Location: ${huongUser.location}`);

    // 3. Find her team
    const huongTeam = teams.data?.find(t => t.leader_id === huongUser.id);
    if (!huongTeam) {
      console.log('❌ Không tìm thấy team của Phạm Thị Hương');
      return;
    }

    console.log(`\n✅ Team của Phạm Thị Hương:`);
    console.log(`   - Team ID: ${huongTeam.id}`);
    console.log(`   - Team Name: ${huongTeam.name}`);
    console.log(`   - Leader ID: ${huongTeam.leader_id}`);

    // 4. Analyze tasks permissions
    console.log('\n2. 🔍 PHÂN TÍCH PHÂN QUYỀN TASKS:');
    console.log('-'.repeat(40));

    const allTasks = tasks.data || [];
    
    // Tasks Phạm Thị Hương SHOULD see (theo logic phân quyền)
    const shouldSeeTasks = allTasks.filter(task => {
      // 1. Tasks của bản thân
      if (task.assignedTo === huongUser.id || task.user_id === huongUser.id) {
        return true;
      }
      
      // 2. Tasks của team mình (team 5)
      if (task.teamId === huongTeam.id) {
        return true;
      }
      
      // 3. Tasks được admin giao và isShared
      if (task.isShared && task.assignedTo === huongUser.id) {
        return true;
      }
      
      return false;
    });

    // Tasks Phạm Thị Hương should NOT see
    const shouldNotSeeTasks = allTasks.filter(task => {
      return !shouldSeeTasks.includes(task);
    });

    console.log(`✅ Tasks Phạm Thị Hương SHOULD see: ${shouldSeeTasks.length}`);
    shouldSeeTasks.forEach(task => {
      console.log(`   - "${task.title}" (Team: ${task.teamId}, Status: ${task.status})`);
    });

    console.log(`\n❌ Tasks Phạm Thị Hương should NOT see: ${shouldNotSeeTasks.length}`);
    shouldNotSeeTasks.forEach(task => {
      console.log(`   - "${task.title}" (Team: ${task.teamId}, Assigned: ${task.assignedTo})`);
    });

    // 5. Test login
    console.log('\n3. 🔐 TEST LOGIN:');
    console.log('-'.repeat(40));

    try {
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'huong.pham@example.com',
          password: 'haininh1'
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResult.success) {
        console.log('✅ Login thành công với admin master password');
        console.log(`   - User: ${loginResult.data.user.name}`);
        console.log(`   - Login Type: ${loginResult.data.loginType}`);
      } else {
        console.log(`❌ Login failed: ${loginResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Login error: ${error.message}`);
    }

    // 6. Summary và hướng dẫn
    console.log('\n4. 📋 SUMMARY & NEXT STEPS:');
    console.log('-'.repeat(40));
    
    console.log('✅ API Data Ready:');
    console.log(`   - Phạm Thị Hương: ${huongUser.id} (team_leader, team_id: ${huongUser.team_id})`);
    console.log(`   - Team 5: ${huongTeam.name} (leader: ${huongTeam.leader_id})`);
    console.log(`   - Tasks for team 5: ${shouldSeeTasks.length}`);
    console.log(`   - Tasks for other teams: ${shouldNotSeeTasks.length}`);

    console.log('\n🧪 Manual Testing Steps:');
    console.log('1. Open browser: http://localhost:8088');
    console.log('2. Open DevTools Console (F12)');
    console.log('3. Run this script to clear Firebase data:');
    console.log(`
// Clear Firebase config to force API mode
localStorage.removeItem('firebaseConfig');
localStorage.removeItem('firebase_initialized');
localStorage.removeItem('rawTasks');
localStorage.removeItem('tasks');
localStorage.removeItem('filteredTasks');
localStorage.removeItem('users');
localStorage.removeItem('teams');
localStorage.removeItem('currentUser');
console.log('✅ Cleared localStorage - refresh page');
    `);
    console.log('4. Refresh page (F5)');
    console.log('5. Login with:');
    console.log('   - Email: huong.pham@example.com');
    console.log('   - Password: haininh1');
    console.log('6. Check Tasks page:');
    console.log(`   - Should see ${shouldSeeTasks.length} tasks (team 5 only)`);
    console.log(`   - Should NOT see ${shouldNotSeeTasks.length} tasks (other teams)`);

    console.log('\n🎯 Expected Results:');
    console.log('✅ "Công việc của tôi": Show personal tasks');
    console.log('✅ "Công việc của Nhóm": Show only team 5 tasks');
    console.log('❌ Should NOT show team 1 tasks');
    console.log('❌ Should NOT show tasks from other teams');

    console.log('\n🔧 If Issues Found:');
    console.log('- Check browser console for permission logs');
    console.log('- Verify TaskDataProvider logic is using API data');
    console.log('- Check team.leader_id matches user.id');
    console.log('- Verify task.teamId filtering logic');

    console.log('\n✅ TEST SETUP COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error in final test:', error);
  }
}

// Run test
finalTest().catch(console.error);
