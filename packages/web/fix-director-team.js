/**
 * Script để sửa team assignment cho Khổng Đức Mạnh (retail_director)
 * Chạy: node fix-director-team.js
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔧 FIXING DIRECTOR TEAM ASSIGNMENT');
console.log('==================================');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function fixDirectorTeamAssignment() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Tạo team đặc biệt cho Director hoặc gán vào team phù hợp
    console.log('\n📊 Analyzing current team structure...');
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('id');
    
    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError);
      return;
    }
    
    console.log('Current teams:');
    teams?.forEach(team => {
      console.log(`- ${team.name} (ID: ${team.id}) - ${team.location}`);
    });
    
    // Option 1: Tạo team "PHÒNG KINH DOANH" cho Director
    console.log('\n➕ Creating PHÒNG KINH DOANH team for Director...');
    
    const directorTeam = {
      id: '0', // Sử dụng ID 0 cho Director team
      name: 'PHÒNG KINH DOANH',
      leader_id: 'Ve7sGRnMoRvT1E0VL5Ds', // Khổng Đức Mạnh ID
      location: 'Toàn quốc',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Kiểm tra xem team đã tồn tại chưa
    const existingTeam = teams?.find(t => t.id === '0' || t.name === 'PHÒNG KINH DOANH');
    
    if (existingTeam) {
      console.log('⚠️  PHÒNG KINH DOANH team already exists, updating...');
      
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          name: 'PHÒNG KINH DOANH',
          leader_id: 'Ve7sGRnMoRvT1E0VL5Ds',
          location: 'Toàn quốc',
          updated_at: new Date().toISOString()
        })
        .eq('id', '0');
      
      if (updateError) {
        console.error('❌ Error updating team:', updateError);
      } else {
        console.log('✅ Updated PHÒNG KINH DOANH team');
      }
    } else {
      console.log('➕ Creating new PHÒNG KINH DOANH team...');
      
      const { error: insertError } = await supabase
        .from('teams')
        .insert(directorTeam);
      
      if (insertError) {
        console.error('❌ Error creating team:', insertError);
        
        // Fallback: Assign director to team 1 (NHÓM 1)
        console.log('🔄 Fallback: Assigning director to NHÓM 1...');
        
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            team_id: '1',
            updated_at: new Date().toISOString()
          })
          .eq('id', 'Ve7sGRnMoRvT1E0VL5Ds');
        
        if (userUpdateError) {
          console.error('❌ Error updating user team:', userUpdateError);
        } else {
          console.log('✅ Assigned Khổng Đức Mạnh to NHÓM 1');
        }
      } else {
        console.log('✅ Created PHÒNG KINH DOANH team');
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .select('id, name, team_id')
      .eq('id', 'Ve7sGRnMoRvT1E0VL5Ds')
      .single();
    
    if (userError) {
      console.error('❌ Error fetching updated user:', userError);
    } else {
      console.log(`✅ Khổng Đức Mạnh team_id: ${updatedUser.team_id}`);
      
      const { data: userTeam, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', updatedUser.team_id)
        .single();
      
      if (teamError) {
        console.error('❌ Error fetching user team:', teamError);
      } else {
        console.log(`✅ Team: ${userTeam.name} (${userTeam.location})`);
      }
    }
    
    console.log('\n🎉 DIRECTOR TEAM ASSIGNMENT FIX COMPLETED!');
    
  } catch (error) {
    console.error('❌ Error fixing director team assignment:', error);
  }
}

// Run the fix
fixDirectorTeamAssignment();
