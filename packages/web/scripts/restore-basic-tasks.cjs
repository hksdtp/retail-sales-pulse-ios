const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Dữ liệu tasks cơ bản để khôi phục
const basicTasks = [
  {
    title: 'Báo cáo doanh thu tháng hiện tại',
    description: 'Tổng hợp và phân tích doanh thu bán lẻ tháng hiện tại',
    type: 'report',
    status: 'todo',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    progress: 0,
    assignedTo: 'Ve7sGRnMoRvT1E0VL5Ds', // Khổng Đức Mạnh
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds',
    user_name: 'Khổng Đức Mạnh',
    team_id: '0',
    teamId: '0',
    location: 'hanoi',
    department_type: 'retail',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  },
  {
    title: 'Liên hệ khách hàng tiềm năng',
    description: 'Gọi điện và tư vấn cho khách hàng mới về sản phẩm',
    type: 'customer_new',
    status: 'in-progress',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    progress: 30,
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
    user_id: 'Ve7sGRnMoRvT1E0VL5Ds', // Khổng Đức Mạnh tạo
    user_name: 'Khổng Đức Mạnh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  },
  {
    title: 'Chuẩn bị báo giá dự án ABC',
    description: 'Lập báo giá chi tiết cho dự án ABC của khách hàng',
    type: 'quote_new',
    status: 'todo',
    priority: 'normal',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ngày mai
    time: '14:00',
    progress: 0,
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ', // Lê Khánh Duy
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh tạo
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  },
  {
    title: 'Họp nhóm tuần',
    description: 'Họp tổng kết công việc tuần và lên kế hoạch tuần tới',
    type: 'meeting',
    status: 'completed',
    priority: 'normal',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hôm qua
    time: '16:00',
    progress: 100,
    assignedTo: 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail',
    isNew: false,
    isShared: false,
    isSharedWithTeam: true, // Shared với team
    extraAssignees: ''
  },
  {
    title: 'Chăm sóc khách hàng VIP',
    description: 'Follow up và chăm sóc khách hàng VIP trong tháng',
    type: 'customer_care',
    status: 'in-progress',
    priority: 'high',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    progress: 60,
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo tạo
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail',
    isNew: false,
    isShared: false,
    isSharedWithTeam: false,
    extraAssignees: ''
  }
];

async function restoreBasicTasks() {
  console.log('🔄 BẮT ĐẦU KHÔI PHỤC DỮ LIỆU TASKS CƠ BẢN...\n');

  try {
    // Kiểm tra API health
    console.log('1. Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('');

    // Kiểm tra tasks hiện tại
    console.log('2. Kiểm tra tasks hiện tại...');
    const currentTasksResponse = await fetch(`${API_BASE}/tasks`);
    const currentTasksData = await currentTasksResponse.json();
    console.log(`📊 Tasks hiện tại: ${currentTasksData.count} tasks`);
    console.log('');

    // Tạo tasks cơ bản
    console.log('3. Tạo tasks cơ bản...');
    let createdCount = 0;
    let errorCount = 0;

    for (let i = 0; i < basicTasks.length; i++) {
      const task = basicTasks[i];
      console.log(`📝 Đang tạo task ${i + 1}/${basicTasks.length}: ${task.title}`);

      try {
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        });

        const result = await response.json();

        if (result.success) {
          createdCount++;
          console.log(`   ✅ Đã tạo: ${task.title}`);
        } else {
          errorCount++;
          console.log(`   ❌ Lỗi tạo: ${task.title} - ${result.error}`);
        }

        // Delay để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Lỗi khi tạo task: ${task.title} - ${error.message}`);
      }
    }

    console.log('');

    // Kiểm tra kết quả
    console.log('4. Kiểm tra kết quả...');
    const finalTasksResponse = await fetch(`${API_BASE}/tasks`);
    const finalTasksData = await finalTasksResponse.json();

    console.log('📊 KẾT QUẢ KHÔI PHỤC:');
    console.log(`✅ Tasks đã tạo thành công: ${createdCount}`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📋 Tổng tasks hiện tại: ${finalTasksData.count}`);
    console.log('');

    if (finalTasksData.count > 0) {
      console.log('✅ Danh sách tasks đã khôi phục:');
      finalTasksData.data.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title} (${task.status}) - ${task.user_name}`);
      });
    }

    console.log('');
    console.log('🎉 HOÀN THÀNH KHÔI PHỤC DỮ LIỆU TASKS CƠ BẢN!');
    console.log('🌐 Dữ liệu đã được lưu trên server');
    console.log('🔗 Kiểm tra tại web app: http://localhost:8088');

  } catch (error) {
    console.error('❌ Lỗi khi khôi phục dữ liệu:', error.message);
  }
}

// Chạy script
console.log('🚨 SCRIPT KHÔI PHỤC DỮ LIỆU TASKS CƠ BẢN');
console.log('📋 Sẽ tạo 5 tasks mẫu với dữ liệu thật');
console.log('⏰ Bắt đầu sau 2 giây...\n');

setTimeout(() => {
  restoreBasicTasks().catch(console.error);
}, 2000);
