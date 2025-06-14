const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function removeDuplicateTasks() {
  console.log('🔍 KIỂM TRA VÀ XÓA TASKS TRÙNG LẶP');
  console.log('==================================\n');

  try {
    // 1. Lấy tất cả tasks hiện tại
    console.log('1. Lấy danh sách tất cả tasks...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();

    if (!tasksData.success) {
      console.log('❌ Lỗi khi lấy tasks:', tasksData.error);
      return;
    }

    const allTasks = tasksData.data;
    console.log(`📋 Tổng số tasks hiện tại: ${allTasks.length}`);
    console.log('');

    // 2. Tìm tasks trùng lặp
    console.log('2. Tìm tasks trùng lặp...');
    const taskGroups = {};
    const duplicates = [];

    // Nhóm tasks theo title và assignedTo
    allTasks.forEach(task => {
      const key = `${task.title.trim()}_${task.assignedTo}`;
      
      if (!taskGroups[key]) {
        taskGroups[key] = [];
      }
      taskGroups[key].push(task);
    });

    // Tìm các nhóm có nhiều hơn 1 task (trùng lặp)
    Object.keys(taskGroups).forEach(key => {
      const group = taskGroups[key];
      if (group.length > 1) {
        console.log(`🔍 Tìm thấy ${group.length} tasks trùng lặp: "${group[0].title}"`);
        console.log(`   Assigned to: ${group[0].user_name || group[0].assignedTo}`);
        
        // Giữ lại task đầu tiên (created_at sớm nhất), xóa các task còn lại
        const sortedGroup = group.sort((a, b) => {
          const timeA = a.created_at?._seconds || 0;
          const timeB = b.created_at?._seconds || 0;
          return timeA - timeB;
        });

        // Thêm các task cần xóa vào danh sách (trừ task đầu tiên)
        for (let i = 1; i < sortedGroup.length; i++) {
          duplicates.push(sortedGroup[i]);
          console.log(`   🗑️ Sẽ xóa: ID ${sortedGroup[i].id}`);
        }
        console.log('');
      }
    });

    console.log(`📊 Tổng kết: Tìm thấy ${duplicates.length} tasks trùng lặp cần xóa`);
    console.log('');

    if (duplicates.length === 0) {
      console.log('✅ Không có tasks trùng lặp nào!');
      return;
    }

    // 3. Xóa các tasks trùng lặp
    console.log('3. Xóa các tasks trùng lặp...');
    let deletedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < duplicates.length; i++) {
      const task = duplicates[i];
      console.log(`🗑️ Xóa ${i + 1}/${duplicates.length}: "${task.title}" (ID: ${task.id})`);

      try {
        const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();

        if (result.success) {
          deletedCount++;
          console.log(`   ✅ Đã xóa: "${task.title}"`);
        } else {
          errorCount++;
          console.log(`   ❌ Lỗi xóa: "${task.title}" - ${result.error}`);
        }

        // Delay để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Lỗi khi xóa: "${task.title}" - ${error.message}`);
      }
    }

    console.log('');

    // 4. Kiểm tra kết quả cuối cùng
    console.log('4. Kiểm tra kết quả...');
    const finalTasksResponse = await fetch(`${API_BASE}/tasks`);
    const finalTasksData = await finalTasksResponse.json();

    console.log('📊 KẾT QUẢ XÓA DUPLICATE:');
    console.log('=========================');
    console.log(`🗑️ Tasks trùng lặp đã xóa: ${deletedCount}`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📋 Tổng tasks còn lại: ${finalTasksData.count}`);
    console.log(`📉 Đã giảm: ${allTasks.length - finalTasksData.count} tasks`);
    console.log('');

    // 5. Hiển thị danh sách tasks sau khi làm sạch
    if (finalTasksData.success && finalTasksData.count > 0) {
      console.log('✅ Danh sách tasks sau khi xóa duplicate:');
      
      // Nhóm theo user để dễ xem
      const tasksByUser = {};
      finalTasksData.data.forEach(task => {
        const userName = task.user_name || task.assignedTo;
        if (!tasksByUser[userName]) {
          tasksByUser[userName] = [];
        }
        tasksByUser[userName].push(task);
      });

      Object.keys(tasksByUser).forEach(userName => {
        console.log(`\n👤 ${userName} (${tasksByUser[userName].length} tasks):`);
        tasksByUser[userName].forEach((task, index) => {
          console.log(`   ${index + 1}. "${task.title}" (${task.status})`);
        });
      });
    }

    console.log('');
    console.log('🎉 HOÀN THÀNH XÓA TASKS TRÙNG LẶP!');
    console.log('🌐 Dữ liệu đã được làm sạch trên server');
    console.log('🔗 Kiểm tra tại web app: http://localhost:8088');

  } catch (error) {
    console.error('❌ Lỗi khi xóa duplicate tasks:', error.message);
  }
}

// Chạy script
console.log('🚨 SCRIPT XÓA TASKS TRÙNG LẶP');
console.log('📋 Sẽ giữ lại task đầu tiên, xóa các bản sao');
console.log('⏰ Bắt đầu sau 2 giây...\n');

setTimeout(() => {
  removeDuplicateTasks().catch(console.error);
}, 2000);
