const { createClient } = require('@supabase/supabase-js');

async function addMoreSampleTasks() {
    console.log('📋 Adding More Sample Tasks...\n');
    
    // Supabase configuration
    const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Check current count
        const { data: currentTasks, error: countError } = await supabase
            .from('tasks')
            .select('*');
            
        console.log(`📊 Current tasks count: ${currentTasks?.length || 0}`);
        
        // Add more sample tasks with working format
        const moreTasks = [
            {
                id: 'task-sample-001',
                title: 'Báo cáo doanh số tuần',
                description: 'Tổng hợp báo cáo doanh số bán hàng tuần này',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'high',
                assigned_to: 'Lê Khánh Duy',
                user_id: 'user-001'
            },
            {
                id: 'task-sample-002',
                title: 'Liên hệ khách hàng mới',
                description: 'Gọi điện và giới thiệu sản phẩm cho danh sách khách hàng mới',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'normal',
                assigned_to: 'Quản Thu Hà',
                user_id: 'user-002'
            },
            {
                id: 'task-sample-003',
                title: 'Cập nhật thông tin sản phẩm',
                description: 'Cập nhật giá và thông tin mới nhất cho catalog sản phẩm',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'completed',
                priority: 'low',
                assigned_to: 'Nguyễn Mạnh Linh',
                user_id: 'user-003'
            },
            {
                id: 'task-sample-004',
                title: 'Họp team tuần',
                description: 'Họp đánh giá kết quả tuần và lên kế hoạch tuần tới',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'normal',
                assigned_to: 'Hà Nguyễn Thanh Tuyền',
                user_id: 'user-004'
            },
            {
                id: 'task-sample-005',
                title: 'Phân tích đối thủ cạnh tranh',
                description: 'Nghiên cứu và phân tích chiến lược của đối thủ cạnh tranh',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'urgent',
                assigned_to: 'Phùng Thị Thuỳ Vân',
                user_id: 'user-005'
            },
            {
                id: 'task-sample-006',
                title: 'Chuẩn bị báo cáo tháng',
                description: 'Tổng hợp và phân tích dữ liệu bán hàng tháng',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'normal',
                assigned_to: 'Lương Việt Anh',
                user_id: 'user-006'
            },
            {
                id: 'task-sample-007',
                title: 'Training nhân viên mới',
                description: 'Đào tạo quy trình bán hàng cho nhân viên mới',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'todo',
                priority: 'normal',
                assigned_to: 'Nguyễn Thị Thảo',
                user_id: 'user-007'
            },
            {
                id: 'task-sample-008',
                title: 'Kiểm tra kho hàng',
                description: 'Kiểm tra tồn kho và đặt hàng bổ sung',
                type: 'personal',
                date: new Date().toISOString().split('T')[0],
                status: 'completed',
                priority: 'low',
                assigned_to: 'Trịnh Thị Bốn',
                user_id: 'user-008'
            }
        ];
        
        console.log(`\n🔄 Adding ${moreTasks.length} sample tasks...`);
        
        const { data: insertedTasks, error: insertError } = await supabase
            .from('tasks')
            .insert(moreTasks);
            
        if (insertError) {
            console.log('❌ Error inserting tasks:', insertError.message);
            console.log('🔍 Error details:', insertError);
        } else {
            console.log('✅ Successfully inserted sample tasks!');
        }
        
        // Verify final count
        const { data: finalTasks, error: finalError } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (finalError) {
            console.log('❌ Error fetching final data:', finalError.message);
        } else {
            console.log(`\n✅ Final tasks count: ${finalTasks?.length || 0}`);
            
            if (finalTasks && finalTasks.length > 0) {
                console.log('\n📋 Recent tasks:');
                finalTasks.slice(0, 5).forEach((task, index) => {
                    console.log(`   ${index + 1}. ${task.title} - ${task.status} (${task.assigned_to})`);
                });
            }
        }
        
        console.log('\n✅ Sample tasks added successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('🔍 Full error:', error);
    }
}

// Run the script
addMoreSampleTasks().catch(console.error);
