const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function fixTaskPriority() {
  try {
    console.log('🔧 Bắt đầu sửa lỗi priority cho tất cả tasks...');
    
    // Lấy tất cả tasks
    const response = await fetch(`${API_BASE}/tasks`);
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Lỗi khi lấy danh sách tasks:', result.error);
      return;
    }
    
    const tasks = result.data || [];
    console.log(`📋 Tìm thấy ${tasks.length} tasks`);
    
    let updatedCount = 0;
    
    for (const task of tasks) {
      // Kiểm tra nếu task chưa có priority hoặc priority không hợp lệ
      if (!task.priority || !['high', 'normal', 'low'].includes(task.priority)) {
        console.log(`🔄 Cập nhật priority cho task: ${task.title} (ID: ${task.id})`);
        
        try {
          const updateResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priority: 'normal', // Đặt mặc định là normal
              updated_at: new Date().toISOString(),
            }),
          });
          
          const updateResult = await updateResponse.json();
          
          if (updateResult.success) {
            console.log(`✅ Đã cập nhật priority cho task ${task.id}`);
            updatedCount++;
          } else {
            console.error(`❌ Lỗi khi cập nhật task ${task.id}:`, updateResult.error);
          }
        } catch (error) {
          console.error(`❌ Lỗi khi cập nhật task ${task.id}:`, error.message);
        }
        
        // Delay nhỏ để tránh spam API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`🎉 Hoàn thành! Đã cập nhật ${updatedCount} tasks`);
    
  } catch (error) {
    console.error('❌ Lỗi khi sửa priority:', error);
  }
}

// Chạy script
fixTaskPriority();
