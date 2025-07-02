const { createClient } = require('@supabase/supabase-js');

async function testStatusValues() {
    console.log('🧪 Testing Status Values...\n');
    
    // Supabase configuration
    const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const statusValues = [
        'pending', 'in_progress', 'completed', 'cancelled',
        'todo', 'doing', 'done', 'blocked',
        'new', 'active', 'finished', 'archived'
    ];
    
    const priorityValues = [
        'low', 'medium', 'high', 'urgent',
        'normal', 'critical'
    ];
    
    try {
        console.log('🧪 Testing status values...');
        
        for (let i = 0; i < statusValues.length; i++) {
            const status = statusValues[i];
            const testTask = {
                id: `test-status-${i}`,
                title: `Test Status ${status}`,
                description: `Testing status: ${status}`,
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: status,
                priority: 'normal',
                assigned_to: 'Test User',
                user_id: 'test-user'
            };
            
            const { data, error } = await supabase
                .from('tasks')
                .insert([testTask]);
                
            if (error) {
                console.log(`   ❌ ${status}: ${error.message}`);
            } else {
                console.log(`   ✅ ${status}: SUCCESS`);
                
                // Clean up successful test
                await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', testTask.id);
            }
        }
        
        console.log('\n🧪 Testing priority values...');
        
        for (let i = 0; i < priorityValues.length; i++) {
            const priority = priorityValues[i];
            const testTask = {
                id: `test-priority-${i}`,
                title: `Test Priority ${priority}`,
                description: `Testing priority: ${priority}`,
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo', // Use known working status
                priority: priority,
                assigned_to: 'Test User',
                user_id: 'test-user'
            };
            
            const { data, error } = await supabase
                .from('tasks')
                .insert([testTask]);
                
            if (error) {
                console.log(`   ❌ ${priority}: ${error.message}`);
            } else {
                console.log(`   ✅ ${priority}: SUCCESS`);
                
                // Clean up successful test
                await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', testTask.id);
            }
        }
        
        console.log('\n✅ Testing completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testStatusValues().catch(console.error);
