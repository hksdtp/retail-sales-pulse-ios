const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function clearAllTasks() {
  console.log('🗑️ Bắt đầu xóa TẤT CẢ dữ liệu công việc...');

  try {
    // Lấy tất cả tasks hiện có
    console.log('📋 Đang lấy danh sách tất cả công việc...');
    const response = await fetch(`${API_BASE}/tasks`);
    const result = await response.json();

    if (!result.success || !result.data) {
      console.log('ℹ️ Không có dữ liệu để xóa hoặc lỗi khi lấy dữ liệu');
      return;
    }

    const tasks = result.data;
    console.log(`📊 Tìm thấy ${tasks.length} công việc cần xóa`);

    if (tasks.length === 0) {
      console.log('✅ Không có công việc nào để xóa');
      return;
    }

    // Xóa từng task
    let deletedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      try {
        console.log(`🗑️ Đang xóa (${i + 1}/${tasks.length}): ${task.title} (ID: ${task.id})`);

        const deleteResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: 'DELETE',
        });

        const deleteResult = await deleteResponse.json();

        if (deleteResult.success) {
          deletedCount++;
          console.log(`✅ Đã xóa: ${task.title}`);
        } else {
          errorCount++;
          console.error(`❌ Lỗi xóa: ${task.title} - ${deleteResult.error}`);
        }

        // Delay để tránh rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error(`❌ Lỗi khi xóa task ${task.title}:`, error.message);
      }
    }

    console.log('\n📊 KẾT QUẢ XÓA DỮ LIỆU:');
    console.log(`✅ Đã xóa thành công: ${deletedCount} công việc`);
    console.log(`❌ Lỗi: ${errorCount} công việc`);
    console.log(`📋 Tổng cộng: ${tasks.length} công việc`);

    if (deletedCount === tasks.length) {
      console.log('🎉 ĐÃ XÓA THÀNH CÔNG TẤT CẢ DỮ LIỆU!');
      console.log('🚀 Hệ thống đã sẵn sàng cho dữ liệu mới');
    } else {
      console.log('⚠️ Một số dữ liệu chưa được xóa hoàn toàn');
    }
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu:', error.message);
  }
}

// Script đã bị vô hiệu hóa để tránh xóa nhầm dữ liệu thật
console.log('🚨 SCRIPT ĐÃ BỊ VÔ HIỆU HÓA!');
console.log('❌ Script này có thể xóa dữ liệu thật trên production server');
console.log('💡 Nếu cần xóa dữ liệu, hãy liên hệ admin để được hướng dẫn an toàn');
console.log('🔒 Script đã được disable để bảo vệ dữ liệu');

// Không chạy function clearAllTasks()
// setTimeout(() => {
//   clearAllTasks().catch(console.error);
// }, 3000);
