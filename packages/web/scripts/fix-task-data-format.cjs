const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

// Mapping để sửa status
const statusMapping = {
  'in_progress': 'in-progress',
  'on_hold': 'on-hold',
  // Các status đúng format
  'todo': 'todo',
  'in-progress': 'in-progress',
  'on-hold': 'on-hold',
  'completed': 'completed'
};

// Mapping để sửa type
const typeMapping = {
  'kts_new': 'architect_new',
  'kts_old': 'architect_old',
  'kh_cdt_new': 'client_new',
  'kh_cdt_old': 'client_old',
  'sbg_new': 'quote_new',
  'sbg_old': 'quote_old',
  // Các type đúng format
  'partner_new': 'partner_new',
  'partner_old': 'partner_old',
  'architect_new': 'architect_new',
  'architect_old': 'architect_old',
  'client_new': 'client_new',
  'client_old': 'client_old',
  'quote_new': 'quote_new',
  'quote_old': 'quote_old',
  'report': 'report',
  'training': 'training',
  'meeting': 'meeting',
  'inventory': 'inventory',
  'other': 'other'
};

async function fixTaskDataFormat() {
  try {
    console.log('🔧 Bắt đầu sửa lỗi format dữ liệu cho tất cả tasks...');
    
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
      let needsUpdate = false;
      const updates = {};
      
      // Kiểm tra và sửa status
      if (task.status && statusMapping[task.status] && statusMapping[task.status] !== task.status) {
        updates.status = statusMapping[task.status];
        needsUpdate = true;
        console.log(`🔄 Sửa status: ${task.status} → ${updates.status} cho task: ${task.title}`);
      }
      
      // Kiểm tra và sửa type
      if (task.type && typeMapping[task.type] && typeMapping[task.type] !== task.type) {
        updates.type = typeMapping[task.type];
        needsUpdate = true;
        console.log(`🔄 Sửa type: ${task.type} → ${updates.type} cho task: ${task.title}`);
      }
      
      // Kiểm tra và thêm priority nếu thiếu
      if (!task.priority || !['high', 'normal', 'low'].includes(task.priority)) {
        updates.priority = 'normal';
        needsUpdate = true;
        console.log(`🔄 Thêm priority: normal cho task: ${task.title}`);
      }
      
      if (needsUpdate) {
        try {
          updates.updated_at = new Date().toISOString();
          
          const updateResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          const updateResult = await updateResponse.json();
          
          if (updateResult.success) {
            console.log(`✅ Đã cập nhật task ${task.id}: ${task.title}`);
            updatedCount++;
          } else {
            console.error(`❌ Lỗi khi cập nhật task ${task.id}:`, updateResult.error);
          }
        } catch (error) {
          console.error(`❌ Lỗi khi cập nhật task ${task.id}:`, error.message);
        }
        
        // Delay nhỏ để tránh spam API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`🎉 Hoàn thành! Đã cập nhật ${updatedCount} tasks`);
    
    // Kiểm tra lại sau khi sửa
    console.log('\n🧪 Kiểm tra lại sau khi sửa...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const checkResponse = await fetch(`${API_BASE}/tasks`);
    const checkResult = await checkResponse.json();
    
    if (checkResult.success) {
      const updatedTasks = checkResult.data || [];
      let errorCount = 0;
      
      updatedTasks.forEach(task => {
        const statusValid = ['todo', 'in-progress', 'on-hold', 'completed'].includes(task.status);
        const priorityValid = ['high', 'normal', 'low'].includes(task.priority);
        const typeValid = [
          'partner_new', 'partner_old', 'architect_new', 'architect_old',
          'client_new', 'client_old', 'quote_new', 'quote_old',
          'report', 'training', 'meeting', 'inventory', 'other'
        ].includes(task.type);
        
        if (!statusValid || !priorityValid || !typeValid) {
          console.log(`⚠️  Task vẫn có lỗi: ${task.title} (${task.id})`);
          console.log(`   Status: ${task.status} (valid: ${statusValid})`);
          console.log(`   Priority: ${task.priority} (valid: ${priorityValid})`);
          console.log(`   Type: ${task.type} (valid: ${typeValid})`);
          errorCount++;
        }
      });
      
      if (errorCount === 0) {
        console.log('✅ Tất cả tasks đã có format đúng!');
      } else {
        console.log(`⚠️  Vẫn còn ${errorCount} tasks có lỗi format`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi sửa format dữ liệu:', error);
  }
}

// Chạy script
fixTaskDataFormat();
