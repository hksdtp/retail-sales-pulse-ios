#!/usr/bin/env node

/**
 * Script để fix Supabase schema - thêm missing columns
 * Ninh ơi - Sửa database schema để task creation hoạt động
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('🔧 Fixing Supabase schema...');
  
  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'fix-supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL content loaded');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement) continue;
      
      console.log(`\n${i + 1}. Executing: ${statement.substring(0, 100)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          
          // Try alternative approach for ALTER TABLE
          if (statement.includes('ALTER TABLE')) {
            console.log('🔄 Trying alternative approach for ALTER TABLE...');
            
            // Extract column additions
            const alterMatches = statement.match(/ADD COLUMN IF NOT EXISTS (\w+) ([^,]+)/g);
            
            if (alterMatches) {
              for (const match of alterMatches) {
                const columnMatch = match.match(/ADD COLUMN IF NOT EXISTS (\w+) (.+)/);
                if (columnMatch) {
                  const [, columnName, columnType] = columnMatch;
                  console.log(`  Adding column: ${columnName} ${columnType}`);
                  
                  // Try direct column addition
                  const { error: colError } = await supabase
                    .from('tasks')
                    .select(columnName)
                    .limit(1);
                  
                  if (colError && colError.message.includes('column')) {
                    console.log(`    Column ${columnName} doesn't exist, needs manual addition`);
                  } else {
                    console.log(`    Column ${columnName} already exists`);
                  }
                }
              }
            }
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          if (data) {
            console.log('   Result:', data);
          }
        }
      } catch (execError) {
        console.error(`❌ Execution error in statement ${i + 1}:`, execError);
      }
    }
    
    console.log('\n📊 Checking current table structure...');
    
    // Check table structure
    const { data: columns, error: structError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'tasks')
      .order('ordinal_position');
    
    if (structError) {
      console.error('❌ Error checking table structure:', structError);
    } else {
      console.log('\n📋 Current tasks table structure:');
      columns?.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable}`);
      });
    }
    
    // Test task creation with minimal data
    console.log('\n🧪 Testing task creation...');
    
    const testTask = {
      id: `test_schema_fix_${Date.now()}`,
      title: 'Schema Fix Test Task',
      description: 'Test task to verify schema fix',
      type: 'test',
      status: 'todo',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user_khanh_duy',
      user_name: 'Lê Khánh Duy',
      visibility: 'personal',
      progress: 0,
      is_new: true,
      is_shared: false,
      is_shared_with_team: false
    };
    
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert([testTask])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Test task creation failed:', createError);
      
      // Show which columns are missing
      if (createError.message.includes('column')) {
        console.log('🔍 Missing columns detected in error message');
      }
    } else {
      console.log('✅ Test task created successfully:', newTask.id);
      
      // Clean up test task
      await supabase
        .from('tasks')
        .delete()
        .eq('id', testTask.id);
      
      console.log('🧹 Test task cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
fixSchema().then(() => {
  console.log('\n🏁 Schema fix completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Schema fix failed:', error);
  process.exit(1);
});
