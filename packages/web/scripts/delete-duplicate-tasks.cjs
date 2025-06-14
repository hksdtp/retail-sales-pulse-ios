
const fetch = require('node-fetch');
const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

const tasksToDelete = [
  {
    "id": "mrxnrblvqce46xuhBL69",
    "title": "Liên Hệ với chị Phương-Vihome"
  },
  {
    "id": "iXuzRM4U4PTFxwOhd8n8",
    "title": "Xử lý đơn hàng Someser"
  },
  {
    "id": "ibmhJM6a6h4xdAqFcQ1j",
    "title": "KH-CT CHỊ THẢO-SOMMERSET"
  },
  {
    "id": "tXINKujBKbtZyoTgiasR",
    "title": "KH Chị Hà- Dương Nội"
  },
  {
    "id": "r3VcBeYBeXNvY8MNhIxv",
    "title": "Liên hệ KTS Hiếu THHOME"
  },
  {
    "id": "jj3txMKgaHdTXlsQm7tP",
    "title": "ĐT - EM MẠNH EVERYGOLF"
  },
  {
    "id": "peoDJ6w1mnlshWs0fp8m",
    "title": "Lên đơn cắt nhà anh Dương Lò Đúc"
  },
  {
    "id": "wnX8933zwYZylqt0wlDd",
    "title": "Báo giá chị Hiền Khai Sơn"
  }
];

async function deleteDuplicateTasks() {
  console.log('🗑️ BẮT ĐẦU XÓA DUPLICATE TASKS...');
  console.log('==================================\n');
  
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const task of tasksToDelete) {
    console.log(`🗑️ Xóa: "${task.title}" (ID: ${task.id})`);
    
    try {
      const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        deletedCount++;
        console.log(`   ✅ Đã xóa: "${task.title}"`);
      } else {
        errorCount++;
        console.log(`   ❌ Lỗi xóa: "${task.title}" - ${result.error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      errorCount++;
      console.log(`   ❌ Lỗi: "${task.title}" - ${error.message}`);
    }
  }
  
  console.log(`\n📊 KẾT QUẢ: Đã xóa ${deletedCount}/${tasksToDelete.length} duplicate tasks`);
}

deleteDuplicateTasks().catch(console.error);
