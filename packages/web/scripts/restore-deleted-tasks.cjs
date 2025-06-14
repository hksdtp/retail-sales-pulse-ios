const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

// Danh sách 32 tasks thật đã bị xóa - KHÔI PHỤC NGAY
const deletedTasks = [
  {
    title: 'KH-CT CHỊ LINH-QUẢNG AN',
    description: 'Liên hệ khách hàng chị Linh tại Quảng An',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'ACKzl2RISqrx5ca9QDM6', // Phạm Thị Hương
    user_id: 'ACKzl2RISqrx5ca9QDM6',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Liên hệ KTS Hiếu THHOME',
    description: 'Liên hệ kiến trúc sư Hiếu tại THHOME',
    type: 'partner_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Xử lý đơn hàng Someser',
    description: 'Xử lý và theo dõi đơn hàng của khách hàng Someser',
    type: 'order_processing',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'MO7N4Trk6mASlHpIcjME', // Nguyễn Thị Thảo
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐÀO TẠO AI',
    description: 'Tham gia khóa đào tạo về AI và ứng dụng trong công việc',
    type: 'training',
    status: 'todo',
    priority: 'high',
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Đi ctrinh a Long, a Quang, a Hưng ở Thanh Hoá cùng nhóm đối tác',
    description: 'Công tác tại Thanh Hoá cùng đối tác',
    type: 'business_trip',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ', // Lương Việt Anh
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐT - CHỊ HƯƠNG TBVS VÀ CHỊ DIỆP CỬA NHÔM',
    description: 'Điện thoại liên hệ chị Hương TBVS và chị Diệp về cửa nhôm',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐT- Gặp mặt',
    description: 'Điện thoại sắp xếp cuộc gặp mặt',
    type: 'meeting',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ', // Lê Khánh Duy
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Học AI về SP Hunter',
    description: 'Học về AI và ứng dụng SP Hunter',
    type: 'training',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ', // Lê Khánh Duy
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐT - EM VIỆT THANG MÁY OTIS',
    description: 'Điện thoại liên hệ em Việt về thang máy OTIS',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq', // Nguyễn Mạnh Linh
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH-CT ANH TIẾN-XUÂN PHƯƠNG',
    description: 'Liên hệ khách hàng anh Tiến tại Xuân Phương',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'ACKzl2RISqrx5ca9QDM6', // Phạm Thị Hương
    user_id: 'ACKzl2RISqrx5ca9QDM6',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'hanoi',
    department_type: 'retail'
  }
];

// Tiếp tục với 22 tasks còn lại
const remainingTasks = [
  {
    title: 'Liên Hệ với chị Phương-Vihome',
    description: 'Liên hệ chị Phương tại Vihome',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'MO7N4Trk6mASlHpIcjME',
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH- CHỊ HẰNG - ROYAL',
    description: 'Khách hàng chị Hằng tại Royal',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH Chị Hà- Dương Nội',
    description: 'Khách hàng chị Hà tại Dương Nội',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ',
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐT - EM MẠNH EVERYGOLF',
    description: 'Điện thoại liên hệ em Mạnh tại Everygolf',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH-CT ANH THÁI CHỊ TUYẾN OCEANPARK',
    description: 'Khách hàng anh Thái chị Tuyến tại Oceanpark',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'ACKzl2RISqrx5ca9QDM6',
    user_id: 'ACKzl2RISqrx5ca9QDM6',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'ĐT - CHỊ HUYỀN NỘI THẤT NORDIC',
    description: 'Điện thoại chị Huyền về nội thất Nordic',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH A Nga- Chị Hải',
    description: 'Khách hàng anh Nga và chị Hải',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ',
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Kết nối bên thiết kế Sunjinvietnam',
    description: 'Kết nối với đội ngũ thiết kế Sunjinvietnam',
    type: 'partner_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH-CT CHỊ THẢO-SOMMERSET',
    description: 'Khách hàng chị Thảo tại Somerset',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'ACKzl2RISqrx5ca9QDM6',
    user_id: 'ACKzl2RISqrx5ca9QDM6',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Gặp kh chị Linh, chị Dung Hải Phòng',
    description: 'Gặp khách hàng chị Linh và chị Dung tại Hải Phòng',
    type: 'customer_meeting',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KTS-CHỊ DUYÊN THIẾT KẾ A+',
    description: 'Kiến trúc sư chị Duyên thiết kế A+',
    type: 'partner_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'ACKzl2RISqrx5ca9QDM6',
    user_id: 'ACKzl2RISqrx5ca9QDM6',
    user_name: 'Phạm Thị Hương',
    team_id: '4',
    teamId: '4',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Báo giá chị Hiền Khai Sơn',
    description: 'Lập báo giá cho chị Hiền tại Khai Sơn',
    type: 'quote_new',
    status: 'todo',
    priority: 'high',
    assignedTo: 'MO7N4Trk6mASlHpIcjME',
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH C Nhung Lưu',
    description: 'Khách hàng cô Nhung Lưu',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ',
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Kh Chị Thủy- Mỹ Đình',
    description: 'Khách hàng chị Thủy tại Mỹ Đình',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ',
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Lên đơn cắt nhà anh Dương Lò Đúc',
    description: 'Lập đơn cắt nhà cho anh Dương tại Lò Đúc',
    type: 'order_processing',
    status: 'todo',
    priority: 'high',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Tham gia hội thảo Đệm Xinh',
    description: 'Tham gia hội thảo của Đệm Xinh',
    type: 'training',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Gặp a Mẫn M+',
    description: 'Gặp anh Mẫn tại M+',
    type: 'partner_meeting',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_id: 'Ue4vzSj1KDg4vZyXwlHJ',
    user_name: 'Lương Việt Anh',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Liên hệ chị Trang - Vinhome',
    description: 'Liên hệ chị Trang tại Vinhome',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: '76ui8I1vw3wiJLyvwFjq',
    user_id: '76ui8I1vw3wiJLyvwFjq',
    user_name: 'Nguyễn Mạnh Linh',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'KH Minh- NTT',
    description: 'Khách hàng Minh tại NTT',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'abtSSmK0p0oeOyy5YWGZ',
    user_id: 'abtSSmK0p0oeOyy5YWGZ',
    user_name: 'Lê Khánh Duy',
    team_id: '1',
    teamId: '1',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Chị Hà Hải Phòng',
    description: 'Liên hệ chị Hà tại Hải Phòng',
    type: 'customer_contact',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'MO7N4Trk6mASlHpIcjME',
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  },
  {
    title: 'Hỗ trợ nhân viên nhóm',
    description: 'Hỗ trợ và training nhân viên trong nhóm',
    type: 'training',
    status: 'todo',
    priority: 'normal',
    assignedTo: 'MO7N4Trk6mASlHpIcjME',
    user_id: 'MO7N4Trk6mASlHpIcjME',
    user_name: 'Nguyễn Thị Thảo',
    team_id: '2',
    teamId: '2',
    location: 'hanoi',
    department_type: 'retail'
  }
];

// Tổng hợp tất cả tasks
const allTasksToRestore = [...deletedTasks, ...remainingTasks];

async function restoreDeletedTasks() {
  console.log('🔄 BẮT ĐẦU KHÔI PHỤC 32 TASKS ĐÃ BỊ XÓA');
  console.log('=====================================\n');

  try {
    console.log('1. Kiểm tra API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ API Status:', healthData.status);
    console.log('');

    console.log('2. Bắt đầu khôi phục tasks...');
    let restoredCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allTasksToRestore.length; i++) {
      const task = allTasksToRestore[i];
      console.log(`📝 Khôi phục ${i + 1}/${allTasksToRestore.length}: "${task.title}"`);

      // Thêm các field bắt buộc
      const taskData = {
        ...task,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        progress: 0,
        isNew: false,
        isShared: false,
        isSharedWithTeam: false,
        extraAssignees: '',
        created_at: new Date().toISOString()
      };

      try {
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        const result = await response.json();

        if (result.success) {
          restoredCount++;
          console.log(`   ✅ Đã khôi phục: "${task.title}"`);
        } else {
          errorCount++;
          console.log(`   ❌ Lỗi khôi phục: "${task.title}" - ${result.error}`);
        }

        // Delay để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Lỗi khi khôi phục: "${task.title}" - ${error.message}`);
      }
    }

    console.log('');
    console.log('3. Kiểm tra kết quả...');
    const finalTasksResponse = await fetch(`${API_BASE}/tasks`);
    const finalTasksData = await finalTasksResponse.json();

    console.log('📊 KẾT QUẢ KHÔI PHỤC:');
    console.log('=====================');
    console.log(`✅ Tasks đã khôi phục thành công: ${restoredCount}/32`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📋 Tổng tasks hiện tại trên server: ${finalTasksData.count}`);
    console.log('');

    if (finalTasksData.count > 0) {
      console.log('✅ Danh sách tasks hiện tại:');
      finalTasksData.data.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}" - ${task.user_name} (${task.status})`);
      });
    }

    console.log('');
    console.log('🎉 HOÀN THÀNH KHÔI PHỤC TASKS!');
    console.log('🌐 Dữ liệu thật đã được khôi phục trên server');
    console.log('🔗 Kiểm tra tại web app: http://localhost:8088');

  } catch (error) {
    console.error('❌ Lỗi khi khôi phục tasks:', error.message);
  }
}

// Chạy script
console.log('🚨 SCRIPT KHÔI PHỤC 32 TASKS THẬT ĐÃ BỊ XÓA');
console.log('📋 Đây là dữ liệu thật từ log đã bị xóa');
console.log('⏰ Bắt đầu khôi phục sau 2 giây...\n');

setTimeout(() => {
  restoreDeletedTasks().catch(console.error);
}, 2000);
