/**
 * Comprehensive System Audit - Kiểm tra toàn diện tính nhất quán hệ thống
 * Chạy: node comprehensive-system-audit.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔍 COMPREHENSIVE SYSTEM AUDIT');
console.log('==============================');
console.log('Kiểm tra toàn diện users, teams, tasks và logic phân quyền\n');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

let auditResults = {
  users: [],
  teams: [],
  tasks: [],
  issues: [],
  recommendations: []
};

async function auditUsersAndTeams() {
  console.log('📊 STEP 1: AUDITING USERS AND TEAMS');
  console.log('===================================');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('id');
    
    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError);
      return;
    }
    
    auditResults.users = users || [];
    auditResults.teams = teams || [];
    
    // Display comprehensive users table
    console.log('\n👥 USERS COMPREHENSIVE TABLE:');
    console.log('==============================');
    console.log('| Name                    | ID                       | Email                    | Role           | Team ID | Location      |');
    console.log('|-------------------------|--------------------------|--------------------------|----------------|---------|---------------|');
    
    users?.forEach(user => {
      const team = teams?.find(t => t.id === user.team_id);
      const teamName = team ? team.name : 'UNKNOWN';
      
      console.log(`| ${user.name.padEnd(23)} | ${user.id.padEnd(24)} | ${user.email.padEnd(24)} | ${user.role.padEnd(14)} | ${user.team_id.padEnd(7)} | ${user.location.padEnd(13)} |`);
      
      // Check for issues - team_id '0' is valid for Director
      if (!user.team_id) {
        auditResults.issues.push({
          type: 'USER_NO_TEAM',
          user: user.name,
          issue: 'User has no valid team_id',
          severity: 'HIGH'
        });
      }
      
      if (!team) {
        auditResults.issues.push({
          type: 'USER_INVALID_TEAM',
          user: user.name,
          issue: `User references non-existent team_id: ${user.team_id}`,
          severity: 'HIGH'
        });
      }
    });
    
    // Display teams table
    console.log('\n🏢 TEAMS COMPREHENSIVE TABLE:');
    console.log('=============================');
    console.log('| Team Name        | ID | Leader ID                | Leader Name             | Location      | Members |');
    console.log('|------------------|----|--------------------------|-----------------------|---------------|---------|');
    
    teams?.forEach(team => {
      const leader = users?.find(u => u.id === team.leader_id);
      const leaderName = leader ? leader.name : 'UNKNOWN';
      const members = users?.filter(u => u.team_id === team.id) || [];
      
      console.log(`| ${team.name.padEnd(16)} | ${team.id.padEnd(2)} | ${team.leader_id.padEnd(24)} | ${leaderName.padEnd(21)} | ${team.location.padEnd(13)} | ${members.length.toString().padEnd(7)} |`);
      
      // Check for issues
      if (!leader) {
        auditResults.issues.push({
          type: 'TEAM_INVALID_LEADER',
          team: team.name,
          issue: `Team references non-existent leader_id: ${team.leader_id}`,
          severity: 'HIGH'
        });
      }
      
      if (members.length === 0) {
        auditResults.issues.push({
          type: 'TEAM_NO_MEMBERS',
          team: team.name,
          issue: 'Team has no members',
          severity: 'MEDIUM'
        });
      }
    });
    
    // Team membership breakdown
    console.log('\n👥 TEAM MEMBERSHIP BREAKDOWN:');
    console.log('=============================');
    
    teams?.forEach(team => {
      const members = users?.filter(u => u.team_id === team.id) || [];
      console.log(`\n🏢 ${team.name} (ID: ${team.id}) - ${team.location}`);
      console.log(`   Leader: ${users?.find(u => u.id === team.leader_id)?.name || 'UNKNOWN'}`);
      console.log(`   Members (${members.length}):`);
      
      members.forEach(member => {
        const roleIcon = member.role === 'team_leader' ? '👑' : 
                        member.role === 'retail_director' ? '🏢' : '👤';
        console.log(`     ${roleIcon} ${member.name} (${member.role})`);
      });
      
      if (members.length === 0) {
        console.log('     ⚠️  No members found');
      }
    });
    
  } catch (error) {
    console.error('❌ Error in users/teams audit:', error);
  }
}

async function auditTasks() {
  console.log('\n\n📋 STEP 2: AUDITING TASKS DATA');
  console.log('==============================');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Fetch all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      return;
    }
    
    auditResults.tasks = tasks || [];
    
    console.log(`\n📊 TASKS SUMMARY: ${tasks?.length || 0} total tasks`);
    
    // Validate each task
    let validTasks = 0;
    let invalidTasks = 0;
    
    console.log('\n🔍 TASK VALIDATION RESULTS:');
    console.log('===========================');
    
    tasks?.forEach((task, index) => {
      const user = auditResults.users.find(u => u.id === task.user_id);
      const assignedUser = auditResults.users.find(u => u.id === task.assigned_to);
      const team = auditResults.teams.find(t => t.id === task.team_id);
      
      let taskValid = true;
      let taskIssues = [];
      
      // Check user_id validity
      if (!task.user_id) {
        taskIssues.push('Missing user_id');
        taskValid = false;
      } else if (!user) {
        taskIssues.push(`Invalid user_id: ${task.user_id}`);
        taskValid = false;
      }
      
      // Check user_name consistency
      if (!task.user_name) {
        taskIssues.push('Missing user_name');
        taskValid = false;
      } else if (user && task.user_name !== user.name) {
        taskIssues.push(`user_name mismatch: "${task.user_name}" vs "${user.name}"`);
        taskValid = false;
      }
      
      // Check team_id validity
      if (!task.team_id) {
        taskIssues.push('Missing team_id');
        taskValid = false;
      } else if (!team) {
        taskIssues.push(`Invalid team_id: ${task.team_id}`);
        taskValid = false;
      }
      
      // Check team consistency
      if (user && task.team_id !== user.team_id) {
        taskIssues.push(`team_id mismatch: task=${task.team_id}, user=${user.team_id}`);
        taskValid = false;
      }
      
      // Check assigned_to validity
      if (task.assigned_to && !assignedUser) {
        taskIssues.push(`Invalid assigned_to: ${task.assigned_to}`);
        taskValid = false;
      }
      
      // Check for placeholder IDs
      const placeholderPatterns = ['user_', 'team_leader_', '_id'];
      placeholderPatterns.forEach(pattern => {
        if (task.user_id?.includes(pattern) || task.assigned_to?.includes(pattern)) {
          taskIssues.push(`Contains placeholder ID pattern: ${pattern}`);
          taskValid = false;
        }
      });
      
      if (taskValid) {
        validTasks++;
      } else {
        invalidTasks++;
        console.log(`❌ Task ${index + 1}: "${task.title}"`);
        taskIssues.forEach(issue => console.log(`   - ${issue}`));
        
        auditResults.issues.push({
          type: 'TASK_VALIDATION',
          task: task.title,
          taskId: task.id,
          issues: taskIssues,
          severity: 'HIGH'
        });
      }
    });
    
    console.log(`\n📊 TASK VALIDATION SUMMARY:`);
    console.log(`✅ Valid tasks: ${validTasks}`);
    console.log(`❌ Invalid tasks: ${invalidTasks}`);
    console.log(`📈 Validation rate: ${tasks?.length ? Math.round((validTasks / tasks.length) * 100) : 0}%`);
    
  } catch (error) {
    console.error('❌ Error in tasks audit:', error);
  }
}

async function auditPermissionsLogic() {
  console.log('\n\n🔐 STEP 3: AUDITING PERMISSIONS LOGIC');
  console.log('=====================================');
  
  // Test scenarios for each user type
  const testScenarios = [
    {
      user: 'Khổng Đức Mạnh',
      role: 'retail_director',
      expectedAccess: ['individual', 'team', 'department'],
      description: 'Should see all tabs and all team members tasks'
    },
    {
      user: 'Nguyễn Thị Thảo',
      role: 'team_leader',
      expectedAccess: ['team', 'department'],
      description: 'Should see team and department tabs, own team tasks'
    },
    {
      user: 'Nguyễn Mạnh Linh',
      role: 'employee',
      expectedAccess: ['department'],
      description: 'Should only see department tab and own tasks'
    }
  ];
  
  console.log('\n🧪 PERMISSION TEST SCENARIOS:');
  console.log('=============================');
  
  testScenarios.forEach(scenario => {
    const user = auditResults.users.find(u => u.name === scenario.user);
    if (!user) {
      console.log(`❌ Test user not found: ${scenario.user}`);
      return;
    }
    
    console.log(`\n👤 ${scenario.user} (${scenario.role}):`);
    console.log(`   Expected access: ${scenario.expectedAccess.join(', ')}`);
    console.log(`   Team: ${auditResults.teams.find(t => t.id === user.team_id)?.name || 'UNKNOWN'}`);
    console.log(`   Description: ${scenario.description}`);
    
    // Check if user has proper team assignment - team_id '0' is valid for Director
    if (!user.team_id) {
      auditResults.issues.push({
        type: 'PERMISSION_ISSUE',
        user: scenario.user,
        issue: 'User has no valid team assignment for permissions',
        severity: 'HIGH'
      });
    }
  });
}

async function generateRecommendations() {
  console.log('\n\n💡 STEP 4: GENERATING RECOMMENDATIONS');
  console.log('=====================================');
  
  // Analyze issues and generate recommendations
  const issueTypes = {};
  auditResults.issues.forEach(issue => {
    if (!issueTypes[issue.type]) {
      issueTypes[issue.type] = [];
    }
    issueTypes[issue.type].push(issue);
  });
  
  console.log('\n📊 ISSUES SUMMARY:');
  console.log('==================');
  Object.entries(issueTypes).forEach(([type, issues]) => {
    console.log(`${type}: ${issues.length} issues`);
    issues.forEach(issue => {
      const severity = issue.severity === 'HIGH' ? '🔴' : 
                      issue.severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`  ${severity} ${issue.issue}`);
    });
  });
  
  // Generate specific recommendations
  console.log('\n🔧 RECOMMENDATIONS:');
  console.log('===================');
  
  if (auditResults.issues.length === 0) {
    console.log('✅ No issues found! System is consistent and properly configured.');
    auditResults.recommendations.push('System is healthy - continue regular monitoring');
  } else {
    // High priority recommendations
    const highIssues = auditResults.issues.filter(i => i.severity === 'HIGH');
    if (highIssues.length > 0) {
      console.log(`🔴 HIGH PRIORITY (${highIssues.length} issues):`);
      highIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. Fix ${issue.type}: ${issue.issue}`);
      });
      auditResults.recommendations.push('Address all HIGH priority issues immediately');
    }
    
    // Medium priority recommendations
    const mediumIssues = auditResults.issues.filter(i => i.severity === 'MEDIUM');
    if (mediumIssues.length > 0) {
      console.log(`🟡 MEDIUM PRIORITY (${mediumIssues.length} issues):`);
      mediumIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. Review ${issue.type}: ${issue.issue}`);
      });
      auditResults.recommendations.push('Plan to address MEDIUM priority issues in next sprint');
    }
  }
  
  // System health recommendations
  console.log('\n🏥 SYSTEM HEALTH RECOMMENDATIONS:');
  console.log('=================================');
  console.log('1. ✅ Implement regular data validation checks');
  console.log('2. ✅ Add user creation validation to prevent placeholder IDs');
  console.log('3. ✅ Set up automated consistency checks');
  console.log('4. ✅ Monitor task attribution accuracy');
  console.log('5. ✅ Regular team membership audits');
}

async function generateFixScript() {
  console.log('\n\n🔧 STEP 5: GENERATING FIX SCRIPT');
  console.log('================================');
  
  const highIssues = auditResults.issues.filter(i => i.severity === 'HIGH');
  
  if (highIssues.length === 0) {
    console.log('✅ No critical issues found - no fix script needed');
    return;
  }
  
  console.log('📝 Auto-generated fix script:');
  console.log('```javascript');
  console.log('// Auto-generated fix script based on audit results');
  console.log('async function fixCriticalIssues() {');
  console.log('  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);');
  console.log('  let fixedCount = 0;');
  console.log('');
  
  highIssues.forEach(issue => {
    switch (issue.type) {
      case 'TASK_VALIDATION':
        console.log(`  // Fix task: ${issue.task}`);
        console.log(`  // Issues: ${issue.issues.join(', ')}`);
        console.log(`  // TODO: Implement specific fixes for task ID: ${issue.taskId}`);
        console.log('');
        break;
      case 'USER_NO_TEAM':
      case 'USER_INVALID_TEAM':
        console.log(`  // Fix user team assignment: ${issue.user}`);
        console.log(`  // Issue: ${issue.issue}`);
        console.log('');
        break;
    }
  });
  
  console.log('  console.log(`Fixed ${fixedCount} critical issues`);');
  console.log('}');
  console.log('```');
}

// Main audit function
async function runComprehensiveAudit() {
  try {
    await auditUsersAndTeams();
    await auditTasks();
    await auditPermissionsLogic();
    await generateRecommendations();
    await generateFixScript();
    
    console.log('\n\n🎉 COMPREHENSIVE AUDIT COMPLETED');
    console.log('================================');
    console.log(`📊 Summary:`);
    console.log(`   Users: ${auditResults.users.length}`);
    console.log(`   Teams: ${auditResults.teams.length}`);
    console.log(`   Tasks: ${auditResults.tasks.length}`);
    console.log(`   Issues found: ${auditResults.issues.length}`);
    console.log(`   Recommendations: ${auditResults.recommendations.length}`);
    
    const healthScore = auditResults.issues.length === 0 ? 100 : 
                       Math.max(0, 100 - (auditResults.issues.length * 10));
    console.log(`   System Health Score: ${healthScore}%`);
    
    if (healthScore >= 90) {
      console.log('   Status: 🟢 EXCELLENT');
    } else if (healthScore >= 70) {
      console.log('   Status: 🟡 GOOD - Minor issues to address');
    } else {
      console.log('   Status: 🔴 NEEDS ATTENTION - Critical issues found');
    }
    
  } catch (error) {
    console.error('❌ Error during comprehensive audit:', error);
  }
}

// Run the audit
runComprehensiveAudit();
