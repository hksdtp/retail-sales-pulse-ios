#!/usr/bin/env node

/**
 * Script để kiểm tra và fix missing columns trong Supabase
 * Ninh ơi - Kiểm tra từng column và thêm nếu thiếu
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Required columns for task creation
const requiredColumns = [
  'assignedTo',
  'assigned_to', 
  'user_id',
  'user_name',
  'created_by',
  'team_id',
  'visibility',
  'deadline',
  'time',
  'progress',
  'is_new',
  'is_shared',
  'is_shared_with_team',
  'types',
  'images',
  'shared_with',
  'location'
];

async function checkAndFixColumns() {
  console.log('🔍 Checking and fixing missing columns...');
  
  try {
    // Test each column by trying to select it
    const missingColumns = [];
    const existingColumns = [];
    
    for (const column of requiredColumns) {
      console.log(`🔍 Checking column: ${column}`);
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(column)
          .limit(1);
        
        if (error && error.message.includes('column')) {
          console.log(`❌ Column ${column} is missing`);
          missingColumns.push(column);
        } else {
          console.log(`✅ Column ${column} exists`);
          existingColumns.push(column);
        }
      } catch (testError) {
        console.log(`❌ Column ${column} test failed:`, testError.message);
        missingColumns.push(column);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Existing columns: ${existingColumns.length}`);
    console.log(`❌ Missing columns: ${missingColumns.length}`);
    
    if (existingColumns.length > 0) {
      console.log(`\n✅ Existing columns:`);
      existingColumns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
      });
    }
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns:`);
      missingColumns.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
      });
      
      console.log(`\n⚠️ These columns need to be added manually in Supabase dashboard:`);
      console.log(`   Go to: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/editor`);
      console.log(`   Select 'tasks' table and add these columns:`);
      
      missingColumns.forEach((col, index) => {
        let columnType = 'text';
        let defaultValue = '';
        
        switch (col) {
          case 'progress':
            columnType = 'integer';
            defaultValue = '0';
            break;
          case 'is_new':
          case 'is_shared':
          case 'is_shared_with_team':
            columnType = 'boolean';
            defaultValue = 'false';
            break;
          case 'types':
          case 'shared_with':
            columnType = 'text[]';
            break;
          case 'images':
            columnType = 'jsonb';
            break;
          case 'visibility':
            columnType = 'text';
            defaultValue = "'personal'";
            break;
          default:
            columnType = 'text';
        }
        
        console.log(`  ${index + 1}. ${col} (${columnType})${defaultValue ? ` DEFAULT ${defaultValue}` : ''}`);
      });
    }
    
    // Test task creation with existing columns only
    console.log(`\n🧪 Testing task creation with existing columns...`);
    
    const testTaskData = {
      id: `test_existing_${Date.now()}`,
      title: 'Test Task - Existing Columns',
      description: 'Test with existing columns only',
      type: 'test',
      status: 'todo',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add existing columns to test data
    existingColumns.forEach(col => {
      switch (col) {
        case 'user_id':
          testTaskData[col] = 'user_khanh_duy';
          break;
        case 'user_name':
          testTaskData[col] = 'Lê Khánh Duy';
          break;
        case 'visibility':
          testTaskData[col] = 'personal';
          break;
        case 'progress':
          testTaskData[col] = 0;
          break;
        case 'is_new':
        case 'is_shared':
        case 'is_shared_with_team':
          testTaskData[col] = false;
          break;
        default:
          if (col.includes('assigned') || col.includes('created_by') || col.includes('team_id')) {
            testTaskData[col] = 'user_khanh_duy';
          }
      }
    });
    
    console.log(`📋 Test task data:`, Object.keys(testTaskData));
    
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert([testTaskData])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Test task creation failed:', createError);
      
      // Identify which specific column is causing the issue
      if (createError.message.includes('column')) {
        const columnMatch = createError.message.match(/'([^']+)'/);
        if (columnMatch) {
          const problemColumn = columnMatch[1];
          console.log(`🎯 Problem column identified: ${problemColumn}`);
          
          if (!missingColumns.includes(problemColumn)) {
            console.log(`⚠️ This column was not in our missing list - adding it`);
            missingColumns.push(problemColumn);
          }
        }
      }
    } else {
      console.log('✅ Test task created successfully:', newTask.id);
      
      // Clean up test task
      await supabase
        .from('tasks')
        .delete()
        .eq('id', testTaskData.id);
      
      console.log('🧹 Test task cleaned up');
    }
    
    // Final recommendation
    if (missingColumns.length > 0) {
      console.log(`\n🔧 NEXT STEPS:`);
      console.log(`1. Go to Supabase dashboard: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/editor`);
      console.log(`2. Select 'tasks' table`);
      console.log(`3. Add the missing columns listed above`);
      console.log(`4. Run the task creation test again`);
    } else {
      console.log(`\n🎉 All required columns exist! Task creation should work now.`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkAndFixColumns().then(() => {
  console.log('\n🏁 Column check completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Column check failed:', error);
  process.exit(1);
});
