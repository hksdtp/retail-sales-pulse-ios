const { createClient } = require('@supabase/supabase-js');

async function fixEmptySupabaseData() {
    console.log('🔧 Fixing Empty Supabase Data...\n');
    
    // Supabase configuration
    const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // 1. Check current data
        console.log('📊 Checking current data...');
        
        const { data: currentTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*');
            
        console.log(`📋 Current tasks count: ${currentTasks?.length || 0}`);
        
        if (tasksError) {
            console.log('❌ Tasks error:', tasksError.message);
            console.log('🔍 Error details:', tasksError);
        }
        
        // 2. Check table schema first
        console.log('\n🔍 Checking table schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1);

        if (schemaError) {
            console.log('❌ Schema error:', schemaError.message);
        }

        // 3. If data is empty, insert simple sample data
        if (!currentTasks || currentTasks.length === 0) {
            console.log('\n🔄 Inserting simple sample tasks data...');

            const sampleTasks = [
                {
                    id: 'task-001',
                    title: 'Báo cáo doanh số tuần',
                    description: 'Tổng hợp báo cáo doanh số bán hàng tuần này',
                    status: 'todo',
                    priority: 'urgent',
                    type: 'personal',
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                    assigned_to: 'Lê Khánh Duy',
                    user_id: 'user-001'
                },
                {
                    id: 'task-002',
                    title: 'Liên hệ khách hàng mới',
                    description: 'Gọi điện và giới thiệu sản phẩm cho danh sách khách hàng mới',
                    status: 'doing',
                    priority: 'normal',
                    type: 'personal',
                    date: new Date().toISOString().split('T')[0],
                    assigned_to: 'Quản Thu Hà',
                    user_id: 'user-002'
                },
                {
                    id: 'task-003',
                    title: 'Cập nhật thông tin sản phẩm',
                    description: 'Cập nhật giá và thông tin mới nhất cho catalog sản phẩm',
                    status: 'done',
                    priority: 'low',
                    type: 'personal',
                    date: new Date().toISOString().split('T')[0],
                    assigned_to: 'Nguyễn Mạnh Linh',
                    user_id: 'user-003'
                }
            ];

            const { data: insertedTasks, error: insertError } = await supabase
                .from('tasks')
                .insert(sampleTasks);

            if (insertError) {
                console.log('❌ Error inserting tasks:', insertError.message);
                console.log('🔍 Error details:', insertError);

                // Try with even simpler data
                console.log('\n🔄 Trying with minimal data...');
                const minimalTask = {
                    id: 'task-minimal-001',
                    title: 'Test Task',
                    description: 'Test Description',
                    type: 'personal',
                    date: new Date().toISOString().split('T')[0],
                    status: 'todo',
                    priority: 'normal',
                    assigned_to: 'Test User',
                    user_id: 'user-test'
                };

                const { data: minimalInsert, error: minimalError } = await supabase
                    .from('tasks')
                    .insert([minimalTask]);

                if (minimalError) {
                    console.log('❌ Minimal insert error:', minimalError.message);
                } else {
                    console.log('✅ Minimal task inserted successfully!');
                }
            } else {
                console.log('✅ Successfully inserted sample tasks!');
            }
        }
        
        // 4. Verify data after insertion
        console.log('\n📊 Verifying data after insertion...');
        
        const { data: finalTasks, error: finalError } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (finalError) {
            console.log('❌ Error fetching final data:', finalError.message);
        } else {
            console.log(`✅ Final tasks count: ${finalTasks?.length || 0}`);
            
            if (finalTasks && finalTasks.length > 0) {
                console.log('\n📋 Sample tasks:');
                finalTasks.slice(0, 3).forEach((task, index) => {
                    console.log(`   ${index + 1}. ${task.title} - ${task.status} (${task.assigned_to})`);
                });
            }
        }
        
        console.log('\n✅ Data fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔍 Full error:', error);
    }
}

// Run the fix
fixEmptySupabaseData().catch(console.error);
