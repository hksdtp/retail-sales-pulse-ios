/**
 * Script để thêm Hà Nguyễn Thanh Tuyền vào team của Nguyễn Thị Nga
 * Chạy: node add-missing-team-member.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('➕ ADDING MISSING TEAM MEMBER');
console.log('=============================');
console.log('Adding Hà Nguyễn Thanh Tuyền to Nguyễn Thị Nga team (NHÓM 1 HCM)\n');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function addMissingTeamMember() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Kiểm tra team của Nguyễn Thị Nga
    console.log('\n📊 Checking Nguyễn Thị Nga team...');
    
    const { data: ngaUser, error: ngaError } = await supabase
      .from('users')
      .select('*')
      .eq('name', 'Nguyễn Thị Nga')
      .single();
    
    if (ngaError) {
      console.error('❌ Error fetching Nguyễn Thị Nga:', ngaError);
      return;
    }
    
    console.log(`✅ Found Nguyễn Thị Nga: team_id = ${ngaUser.team_id}`);
    
    // Kiểm tra team info
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', ngaUser.team_id)
      .single();
    
    if (teamError) {
      console.error('❌ Error fetching team:', teamError);
      return;
    }
    
    console.log(`✅ Team: ${team.name} (${team.location})`);
    
    // Kiểm tra current team members
    const { data: currentMembers, error: membersError } = await supabase
      .from('users')
      .select('*')
      .eq('team_id', ngaUser.team_id);
    
    if (membersError) {
      console.error('❌ Error fetching team members:', membersError);
      return;
    }
    
    console.log(`\n👥 Current team members (${currentMembers?.length || 0}):`);
    currentMembers?.forEach(member => {
      console.log(`- ${member.name} (${member.role})`);
    });
    
    // Thông tin user mới cần thêm
    const newUser = {
      id: 'ha_nguyen_thanh_tuyen_id',
      name: 'Hà Nguyễn Thanh Tuyền',
      email: 'thanhtuyen.ha@example.com',
      role: 'employee',
      team_id: ngaUser.team_id, // Cùng team với Nguyễn Thị Nga
      location: team.location, // Cùng location với team
      department_type: 'retail',
      password: '123456',
      password_changed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Kiểm tra xem user đã tồn tại chưa
    console.log('\n🔍 Checking if user already exists...');
    
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .or(`id.eq.${newUser.id},email.eq.${newUser.email},name.eq.${newUser.name}`)
      .single();
    
    if (existingUser) {
      console.log(`⚠️  User already exists:`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Team: ${existingUser.team_id}`);
      
      // Kiểm tra xem có cần update team không
      if (existingUser.team_id !== ngaUser.team_id) {
        console.log(`\n🔄 Updating user team from ${existingUser.team_id} to ${ngaUser.team_id}...`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            team_id: ngaUser.team_id,
            location: team.location,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error('❌ Error updating user team:', updateError);
        } else {
          console.log('✅ Updated user team assignment');
        }
      } else {
        console.log('✅ User is already in the correct team');
      }
    } else {
      // Thêm user mới
      console.log('\n➕ Adding new user...');
      console.log(`Name: ${newUser.name}`);
      console.log(`Email: ${newUser.email}`);
      console.log(`Role: ${newUser.role}`);
      console.log(`Team: ${team.name} (${newUser.team_id})`);
      console.log(`Location: ${newUser.location}`);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(newUser);
      
      if (insertError) {
        console.error('❌ Error adding user:', insertError);
        return;
      }
      
      console.log('✅ Successfully added Hà Nguyễn Thanh Tuyền!');
    }
    
    // Verify the result
    console.log('\n🔍 Verifying team membership...');
    
    const { data: updatedMembers, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('team_id', ngaUser.team_id)
      .order('name');
    
    if (verifyError) {
      console.error('❌ Error verifying team members:', verifyError);
      return;
    }
    
    console.log(`\n👥 Updated team members (${updatedMembers?.length || 0}):`);
    updatedMembers?.forEach(member => {
      const roleIcon = member.role === 'team_leader' ? '👑' : '👤';
      console.log(`${roleIcon} ${member.name} (${member.role})`);
    });
    
    // Summary
    console.log('\n🎉 TEAM MEMBER ADDITION COMPLETED!');
    console.log('==================================');
    console.log(`✅ Team: ${team.name}`);
    console.log(`✅ Leader: ${team.leader_id === ngaUser.id ? ngaUser.name : 'Nguyễn Thị Nga'}`);
    console.log(`✅ Location: ${team.location}`);
    console.log(`✅ Total members: ${updatedMembers?.length || 0}`);
    console.log(`✅ New member: Hà Nguyễn Thanh Tuyền added successfully`);
    
  } catch (error) {
    console.error('❌ Error adding team member:', error);
  }
}

// Hàm để kiểm tra tất cả teams và members
async function auditAllTeams() {
  try {
    console.log('\n\n📊 AUDITING ALL TEAMS AFTER UPDATE');
    console.log('===================================');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('id');
    
    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError);
      return;
    }
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log('\n🏢 COMPLETE TEAM BREAKDOWN:');
    console.log('===========================');
    
    teams?.forEach(team => {
      const members = users?.filter(u => u.team_id === team.id) || [];
      const leader = users?.find(u => u.id === team.leader_id);
      
      console.log(`\n🏢 ${team.name} (ID: ${team.id}) - ${team.location}`);
      console.log(`   Leader: ${leader?.name || 'UNKNOWN'}`);
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
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total teams: ${teams?.length || 0}`);
    console.log(`   Total users: ${users?.length || 0}`);
    
    // Check for any issues
    const usersWithoutTeam = users?.filter(u => !u.team_id) || [];
    const teamsWithoutMembers = teams?.filter(t => {
      const members = users?.filter(u => u.team_id === t.id) || [];
      return members.length === 0;
    }) || [];
    
    if (usersWithoutTeam.length > 0) {
      console.log(`   ⚠️  Users without team: ${usersWithoutTeam.length}`);
    }
    
    if (teamsWithoutMembers.length > 0) {
      console.log(`   ⚠️  Teams without members: ${teamsWithoutMembers.length}`);
    }
    
    if (usersWithoutTeam.length === 0 && teamsWithoutMembers.length === 0) {
      console.log(`   ✅ All users and teams properly configured`);
    }
    
  } catch (error) {
    console.error('❌ Error auditing teams:', error);
  }
}

// Main execution
async function main() {
  await addMissingTeamMember();
  await auditAllTeams();
}

main().catch(console.error);
