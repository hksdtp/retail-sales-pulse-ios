/**
 * Script để debug user attribution và team filtering issues
 * Chạy: node debug-user-attribution.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔍 DEBUGGING USER ATTRIBUTION & TEAM FILTERING');
console.log('==============================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugUserAttribution() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Kiểm tra users và teams data
    console.log('\n📊 Step 1: Checking users and teams data...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError);
      return;
    }
    
    console.log('\n👥 USERS DATA:');
    console.log('==============');
    users?.forEach(user => {
      console.log(`- ${user.name} (${user.id})`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Team ID: ${user.team_id}`);
      console.log(`  Location: ${user.location}`);
      console.log('');
    });
    
    console.log('\n🏢 TEAMS DATA:');
    console.log('==============');
    teams?.forEach(team => {
      console.log(`- ${team.name} (${team.id})`);
      console.log(`  Leader ID: ${team.leader_id}`);
      console.log(`  Location: ${team.location}`);
      console.log('');
    });
    
    // 2. Kiểm tra tasks data
    console.log('\n📋 Step 2: Checking tasks data...');
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      return;
    }
    
    console.log('\n📝 RECENT TASKS:');
    console.log('================');
    tasks?.forEach(task => {
      console.log(`- "${task.title}"`);
      console.log(`  ID: ${task.id}`);
      console.log(`  User ID: ${task.user_id}`);
      console.log(`  User Name: ${task.user_name}`);
      console.log(`  Assigned To: ${task.assigned_to}`);
      console.log(`  Team ID: ${task.team_id}`);
      console.log(`  Is Shared: ${task.is_shared}`);
      console.log(`  Is Shared With Team: ${task.is_shared_with_team}`);
      console.log(`  Created: ${task.created_at}`);
      console.log('');
    });
    
    // 3. Phân tích team mapping
    console.log('\n🔍 Step 3: Analyzing team mapping...');
    
    const userTeamMap = {};
    users?.forEach(user => {
      if (!userTeamMap[user.team_id]) {
        userTeamMap[user.team_id] = [];
      }
      userTeamMap[user.team_id].push(user);
    });
    
    console.log('\n👥 TEAM MEMBERSHIP:');
    console.log('===================');
    Object.entries(userTeamMap).forEach(([teamId, teamUsers]) => {
      const team = teams?.find(t => t.id === teamId);
      console.log(`\n🏢 Team: ${team?.name || 'Unknown'} (${teamId})`);
      teamUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.role})`);
      });
    });
    
    // 4. Kiểm tra tasks theo team
    console.log('\n📊 Step 4: Analyzing tasks by team...');
    
    const taskTeamMap = {};
    tasks?.forEach(task => {
      if (!taskTeamMap[task.team_id]) {
        taskTeamMap[task.team_id] = [];
      }
      taskTeamMap[task.team_id].push(task);
    });
    
    console.log('\n📋 TASKS BY TEAM:');
    console.log('=================');
    Object.entries(taskTeamMap).forEach(([teamId, teamTasks]) => {
      const team = teams?.find(t => t.id === teamId);
      console.log(`\n🏢 Team: ${team?.name || 'Unknown'} (${teamId})`);
      console.log(`   Tasks count: ${teamTasks.length}`);
      teamTasks.forEach(task => {
        console.log(`  - "${task.title}" by ${task.user_name}`);
      });
    });
    
    // 5. Kiểm tra shared tasks
    console.log('\n🔍 Step 5: Analyzing shared tasks...');
    
    const sharedTasks = tasks?.filter(task => 
      task.is_shared === true || 
      task.is_shared_with_team === true ||
      task.type === 'shared'
    );
    
    console.log('\n🌐 SHARED TASKS:');
    console.log('================');
    if (sharedTasks && sharedTasks.length > 0) {
      sharedTasks.forEach(task => {
        console.log(`- "${task.title}"`);
        console.log(`  Created by: ${task.user_name}`);
        console.log(`  Is Shared: ${task.is_shared}`);
        console.log(`  Is Shared With Team: ${task.is_shared_with_team}`);
        console.log(`  Type: ${task.type}`);
        console.log('');
      });
    } else {
      console.log('No shared tasks found.');
    }
    
    // 6. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    
    // Check for attribution issues
    const attributionIssues = tasks?.filter(task => 
      !task.user_id || !task.user_name || !task.team_id
    );
    
    if (attributionIssues && attributionIssues.length > 0) {
      console.log(`⚠️  Found ${attributionIssues.length} tasks with attribution issues:`);
      attributionIssues.forEach(task => {
        console.log(`   - "${task.title}": missing user_id=${!task.user_id}, user_name=${!task.user_name}, team_id=${!task.team_id}`);
      });
    } else {
      console.log('✅ No attribution issues found.');
    }
    
    // Check for team consistency
    const teamInconsistencies = [];
    tasks?.forEach(task => {
      const user = users?.find(u => u.id === task.user_id);
      if (user && user.team_id !== task.team_id) {
        teamInconsistencies.push({
          task: task.title,
          taskTeamId: task.team_id,
          userTeamId: user.team_id,
          userName: user.name
        });
      }
    });
    
    if (teamInconsistencies.length > 0) {
      console.log(`⚠️  Found ${teamInconsistencies.length} team inconsistencies:`);
      teamInconsistencies.forEach(issue => {
        console.log(`   - "${issue.task}" by ${issue.userName}: task.team_id=${issue.taskTeamId}, user.team_id=${issue.userTeamId}`);
      });
    } else {
      console.log('✅ No team inconsistencies found.');
    }
    
    console.log('\n🎉 DEBUG ANALYSIS COMPLETED!');
    
  } catch (error) {
    console.error('❌ Error during debug analysis:', error);
  }
}

// Hàm để fix attribution issues
async function fixAttributionIssues() {
  try {
    console.log('🔧 FIXING ATTRIBUTION ISSUES...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get all tasks and users
    const { data: tasks } = await supabase.from('tasks').select('*');
    const { data: users } = await supabase.from('users').select('*');
    
    if (!tasks || !users) {
      console.error('❌ Could not fetch tasks or users');
      return;
    }
    
    let fixedCount = 0;
    
    for (const task of tasks) {
      let needsUpdate = false;
      const updates = {};
      
      // Find user by user_id
      const user = users.find(u => u.id === task.user_id);
      
      if (user) {
        // Fix team_id if inconsistent
        if (task.team_id !== user.team_id) {
          updates.team_id = user.team_id;
          needsUpdate = true;
          console.log(`🔧 Fixing team_id for "${task.title}": ${task.team_id} → ${user.team_id}`);
        }
        
        // Fix user_name if missing or incorrect
        if (task.user_name !== user.name) {
          updates.user_name = user.name;
          needsUpdate = true;
          console.log(`🔧 Fixing user_name for "${task.title}": "${task.user_name}" → "${user.name}"`);
        }
      }
      
      if (needsUpdate) {
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', task.id);
        
        if (error) {
          console.error(`❌ Error updating task ${task.id}:`, error);
        } else {
          fixedCount++;
        }
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} attribution issues!`);
    
  } catch (error) {
    console.error('❌ Error fixing attribution issues:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'fix') {
    await fixAttributionIssues();
  } else {
    await debugUserAttribution();
    console.log('\n💡 To fix attribution issues, run: node debug-user-attribution.js fix');
  }
}

main().catch(console.error);
