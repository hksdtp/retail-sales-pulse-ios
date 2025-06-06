const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Sample data
const sampleTasks = [
  {
    title: 'Báo cáo doanh thu tháng 6',
    description: 'Tổng hợp doanh thu bán lẻ tháng 6 theo từng cửa hàng',
    type: 'report',
    status: 'todo',
    date: '2025-06-04',
    time: '09:00',
    progress: 0,
    user_id: '2',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    location: 'hanoi',
    assignedTo: '2',
    isNew: true,
  },
  {
    title: 'Liên hệ khách hàng mới',
    description: 'Gọi điện và xác nhận lịch gặp mặt với khách hàng ABC',
    type: 'client_new',
    status: 'in-progress',
    date: '2025-06-04',
    time: '14:00',
    progress: 50,
    user_id: '3',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    location: 'hanoi',
    assignedTo: '3',
    isNew: false,
  },
  {
    title: 'Kiểm tra kho hàng',
    description: 'Kiểm tra tồn kho và cập nhật hệ thống',
    type: 'inventory',
    status: 'todo',
    date: '2025-06-05',
    time: '10:00',
    progress: 0,
    user_id: '4',
    user_name: 'Trần Văn Nam',
    team_id: '3',
    location: 'hcm',
    assignedTo: '4',
    isNew: true,
  },
  {
    title: 'Họp team tuần',
    description: 'Họp tổng kết công việc tuần và lên kế hoạch tuần tới',
    type: 'meeting',
    status: 'completed',
    date: '2025-06-03',
    time: '16:00',
    progress: 100,
    user_id: '2',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    location: 'hanoi',
    assignedTo: '2',
    isNew: false,
  },
  {
    title: 'Training nhân viên mới',
    description: 'Đào tạo quy trình bán hàng cho nhân viên mới',
    type: 'training',
    status: 'in-progress',
    date: '2025-06-04',
    time: '13:00',
    progress: 75,
    user_id: '3',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    location: 'hanoi',
    assignedTo: '3',
    isNew: false,
  },
];

async function createSampleData() {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu mẫu...\n');

    // Test API health
    console.log('1. Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('');

    // Create sample tasks
    console.log('2. Tạo tasks mẫu...');
    for (let i = 0; i < sampleTasks.length; i++) {
      const task = sampleTasks[i];
      console.log(`   Đang tạo task ${i + 1}/${sampleTasks.length}: ${task.title}`);

      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`   ✅ Đã tạo task: ${task.title}`);
      } else {
        console.log(`   ❌ Lỗi tạo task: ${result.error}`);
      }

      // Delay để tránh rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('');

    // Verify data
    console.log('3. Kiểm tra dữ liệu đã tạo...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();

    console.log(`✅ Tổng số tasks: ${tasksData.count}`);
    console.log('✅ Danh sách tasks:');
    tasksData.data.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.status})`);
    });

    console.log('');
    console.log('🎉 Hoàn thành tạo dữ liệu mẫu!');
    console.log('🌐 Dữ liệu đã được lưu trên Firebase Cloud');
    console.log('🔗 Xem tại: https://console.firebase.google.com/project/appqlgd/firestore');
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  }
}

// Chạy script
createSampleData();
