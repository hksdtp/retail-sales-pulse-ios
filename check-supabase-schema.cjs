const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseSchema() {
    console.log('🔍 Checking Supabase Schema...\n');
    
    // Supabase configuration
    const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Check if tasks table exists and get its structure
        console.log('📊 Checking tasks table...');
        
        // Try to get table info using RPC or direct query
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_info', { table_name: 'tasks' })
            .single();
            
        if (tableError) {
            console.log('❌ RPC error (expected):', tableError.message);
            
            // Alternative: Try to insert empty object to see what fields are required
            console.log('\n🔍 Testing with empty insert to discover required fields...');
            const { data: emptyTest, error: emptyError } = await supabase
                .from('tasks')
                .insert([{}]);
                
            if (emptyError) {
                console.log('📋 Required fields discovered from error:');
                console.log('   Error:', emptyError.message);
                console.log('   Code:', emptyError.code);
                console.log('   Details:', emptyError.details);
            }
        }
        
        // Try to get existing data structure
        console.log('\n📊 Checking existing data structure...');
        const { data: existingData, error: existingError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1);
            
        if (existingError) {
            console.log('❌ Error getting existing data:', existingError.message);
        } else {
            console.log('✅ Table exists, current record count:', existingData?.length || 0);
            if (existingData && existingData.length > 0) {
                console.log('📋 Sample record structure:');
                console.log(JSON.stringify(existingData[0], null, 2));
            }
        }
        
        // Try different field combinations
        console.log('\n🧪 Testing different field combinations...');
        
        const testCombinations = [
            {
                name: 'Basic fields',
                data: {
                    id: 'test-001',
                    title: 'Test Task',
                    description: 'Test Description'
                }
            },
            {
                name: 'With type field',
                data: {
                    id: 'test-002',
                    title: 'Test Task 2',
                    description: 'Test Description 2',
                    type: 'task'
                }
            },
            {
                name: 'With date and type',
                data: {
                    id: 'test-003',
                    title: 'Test Task 3',
                    description: 'Test Description 3',
                    type: 'task',
                    date: new Date().toISOString().split('T')[0]
                }
            },
            {
                name: 'Full fields',
                data: {
                    id: 'test-004',
                    title: 'Test Task 4',
                    description: 'Test Description 4',
                    type: 'task',
                    date: new Date().toISOString().split('T')[0],
                    status: 'pending',
                    priority: 'medium',
                    assigned_to: 'Test User'
                }
            }
        ];
        
        for (const test of testCombinations) {
            console.log(`\n🧪 Testing: ${test.name}`);
            const { data: testData, error: testError } = await supabase
                .from('tasks')
                .insert([test.data]);
                
            if (testError) {
                console.log(`   ❌ Failed: ${testError.message}`);
            } else {
                console.log(`   ✅ Success! Fields work: ${Object.keys(test.data).join(', ')}`);
                
                // Clean up successful test
                await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', test.data.id);
                    
                break; // Stop at first successful combination
            }
        }
        
        console.log('\n✅ Schema check completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔍 Full error:', error);
    }
}

// Run the check
checkSupabaseSchema().catch(console.error);
