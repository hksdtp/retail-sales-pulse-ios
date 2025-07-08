#!/usr/bin/env node

/**
 * Script để kiểm tra constraint tasks_type_check
 * Ninh ơi - Tìm hiểu constraint đang block task creation
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  console.log('🔍 Checking tasks table constraints...');
  
  try {
    // Check existing tasks and their types
    console.log('\n📊 Existing tasks and their types:');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, type')
      .limit(10);
    
    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
    } else {
      const uniqueTypes = [...new Set(tasks.map(t => t.type))];
      console.log(`📋 Found ${tasks.length} tasks with ${uniqueTypes.length} unique types:`);
      
      uniqueTypes.forEach((type, index) => {
        const count = tasks.filter(t => t.type === type).length;
        console.log(`  ${index + 1}. "${type}" (${count} tasks)`);
      });
    }
    
    // Test different type values to find which ones are allowed
    console.log('\n🧪 Testing different type values:');
    
    const testTypes = [
      'work',
      'personal', 
      'meeting',
      'report',
      'other',
      'khac',
      'kts_moi',
      'kh_cdt_moi',
      'bao_cao',
      'hop',
      'test',
      'task',
      'todo'
    ];
    
    const allowedTypes = [];
    const rejectedTypes = [];
    
    for (const testType of testTypes) {
      console.log(`🔍 Testing type: "${testType}"`);
      
      const testTask = {
        id: `test_type_${testType}_${Date.now()}`,
        title: `Test Type ${testType}`,
        description: `Test task for type ${testType}`,
        type: testType,
        status: 'todo',
        priority: 'normal',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test_user',
        user_name: 'Test User',
        assigned_to: 'test_user',
        team_id: '1',
        location: 'hanoi',
        time: '09:00',
        progress: 0,
        is_new: true,
        is_shared: false,
        is_shared_with_team: false
      };
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([testTask])
          .select()
          .single();
        
        if (error) {
          console.log(`  ❌ "${testType}" rejected: ${error.message}`);
          rejectedTypes.push(testType);
        } else {
          console.log(`  ✅ "${testType}" accepted`);
          allowedTypes.push(testType);
          
          // Clean up test task
          await supabase
            .from('tasks')
            .delete()
            .eq('id', testTask.id);
        }
      } catch (testError) {
        console.log(`  ❌ "${testType}" failed: ${testError.message}`);
        rejectedTypes.push(testType);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Allowed types (${allowedTypes.length}):`);
    allowedTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. "${type}"`);
    });
    
    console.log(`\n❌ Rejected types (${rejectedTypes.length}):`);
    rejectedTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. "${type}"`);
    });
    
    // Try to get constraint definition (might not work with current permissions)
    console.log('\n🔍 Attempting to get constraint definition...');
    try {
      const { data: constraints, error: constraintError } = await supabase
        .from('information_schema.check_constraints')
        .select('constraint_name, check_clause')
        .eq('constraint_name', 'tasks_type_check');
      
      if (constraintError) {
        console.log('❌ Cannot access constraint definition (permission denied)');
      } else {
        console.log('✅ Constraint definition:');
        constraints?.forEach(constraint => {
          console.log(`  Name: ${constraint.constraint_name}`);
          console.log(`  Clause: ${constraint.check_clause}`);
        });
      }
    } catch (constraintCheckError) {
      console.log('❌ Cannot check constraints:', constraintCheckError.message);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (allowedTypes.length > 0) {
      console.log('1. Use only allowed types in your application:');
      allowedTypes.forEach(type => {
        console.log(`   - "${type}"`);
      });
      
      console.log('\n2. Update TaskTypeSelector to use allowed types only');
      console.log('3. Map UI type selections to allowed database types');
    } else {
      console.log('1. All test types were rejected - constraint might be very restrictive');
      console.log('2. Check existing tasks to see what types are currently used');
      console.log('3. Consider updating the constraint or using existing valid types');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkConstraints().then(() => {
  console.log('\n🏁 Constraint check completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Constraint check failed:', error);
  process.exit(1);
});
