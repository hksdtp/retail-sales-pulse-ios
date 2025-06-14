const fetch = require('node-fetch');

const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

async function checkDuplicateTasks() {
  console.log('🔍 KIỂM TRA TASKS BỊ DUPLICATE');
  console.log('==============================\n');

  try {
    // 1. Lấy tất cả tasks từ API
    console.log('1. 📋 Lấy tất cả tasks từ API...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    
    if (!tasksData.success) {
      console.log('❌ Lỗi khi lấy tasks:', tasksData.error);
      return;
    }

    const allTasks = tasksData.data;
    console.log(`✅ Tổng số tasks: ${allTasks.length}`);
    console.log('');

    // 2. Phân tích duplicate theo title
    console.log('2. 🔍 Phân tích duplicate theo title...');
    const tasksByTitle = {};
    const duplicates = [];

    allTasks.forEach(task => {
      const title = task.title.trim();
      if (!tasksByTitle[title]) {
        tasksByTitle[title] = [];
      }
      tasksByTitle[title].push(task);
    });

    // Tìm các title có nhiều hơn 1 task
    Object.keys(tasksByTitle).forEach(title => {
      if (tasksByTitle[title].length > 1) {
        duplicates.push({
          title: title,
          count: tasksByTitle[title].length,
          tasks: tasksByTitle[title]
        });
      }
    });

    console.log(`🔍 Tìm thấy ${duplicates.length} nhóm tasks bị duplicate:`);
    console.log('');

    // 3. Hiển thị chi tiết duplicates
    duplicates.forEach((duplicate, index) => {
      console.log(`📋 ${index + 1}. "${duplicate.title}" (${duplicate.count} bản)`);
      duplicate.tasks.forEach((task, taskIndex) => {
        console.log(`   ${taskIndex + 1}. ID: ${task.id}`);
        console.log(`      - Assigned to: ${task.user_name} (${task.assignedTo})`);
        console.log(`      - Status: ${task.status}`);
        console.log(`      - Created: ${task.created_at ? new Date(task.created_at._seconds * 1000).toLocaleString() : 'N/A'}`);
        console.log(`      - Team: ${task.team_id}`);
      });
      console.log('');
    });

    // 4. Thống kê tổng quan
    console.log('📊 THỐNG KÊ DUPLICATE:');
    console.log('======================');
    console.log(`🔢 Tổng tasks: ${allTasks.length}`);
    console.log(`🔄 Nhóm bị duplicate: ${duplicates.length}`);
    
    let totalDuplicateCount = 0;
    duplicates.forEach(dup => {
      totalDuplicateCount += (dup.count - 1); // Trừ 1 vì 1 bản là gốc
    });
    
    console.log(`❌ Tasks thừa cần xóa: ${totalDuplicateCount}`);
    console.log(`✅ Tasks unique (sau khi xóa duplicate): ${allTasks.length - totalDuplicateCount}`);
    console.log('');

    // 5. Tạo danh sách tasks cần xóa (giữ lại task có created_at sớm nhất)
    console.log('5. 📝 Tạo danh sách tasks cần xóa...');
    const tasksToDelete = [];

    duplicates.forEach(duplicate => {
      // Sắp xếp theo created_at (giữ lại task cũ nhất)
      const sortedTasks = duplicate.tasks.sort((a, b) => {
        const timeA = a.created_at ? a.created_at._seconds : 0;
        const timeB = b.created_at ? b.created_at._seconds : 0;
        return timeA - timeB;
      });

      // Thêm các task từ vị trí thứ 2 trở đi vào danh sách xóa
      for (let i = 1; i < sortedTasks.length; i++) {
        tasksToDelete.push(sortedTasks[i]);
      }
    });

    console.log(`🗑️ Sẽ xóa ${tasksToDelete.length} tasks duplicate:`);
    tasksToDelete.forEach((task, index) => {
      console.log(`   ${index + 1}. "${task.title}" (ID: ${task.id}) - ${task.user_name}`);
    });
    console.log('');

    // 6. Xuất danh sách ra file JSON
    console.log('6. 💾 Xuất danh sách ra file...');
    const fs = require('fs');
    const path = require('path');
    
    const duplicateReport = {
      timestamp: new Date().toISOString(),
      total_tasks: allTasks.length,
      duplicate_groups: duplicates.length,
      tasks_to_delete: tasksToDelete.length,
      unique_tasks_after_cleanup: allTasks.length - tasksToDelete.length,
      duplicates: duplicates,
      tasks_to_delete: tasksToDelete.map(task => ({
        id: task.id,
        title: task.title,
        user_name: task.user_name,
        assignedTo: task.assignedTo,
        created_at: task.created_at
      }))
    };

    const reportFile = path.join(__dirname, 'duplicate-tasks-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(duplicateReport, null, 2));
    console.log(`✅ Báo cáo đã được lưu: ${reportFile}`);
    console.log('');

    // 7. Tạo script xóa duplicate
    const deleteScript = `
const fetch = require('node-fetch');
const API_BASE = 'https://api-adwc442mha-uc.a.run.app';

const tasksToDelete = ${JSON.stringify(tasksToDelete.map(t => ({ id: t.id, title: t.title })), null, 2)};

async function deleteDuplicateTasks() {
  console.log('🗑️ BẮT ĐẦU XÓA DUPLICATE TASKS...');
  console.log('==================================\\n');
  
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const task of tasksToDelete) {
    console.log(\`🗑️ Xóa: "\${task.title}" (ID: \${task.id})\`);
    
    try {
      const response = await fetch(\`\${API_BASE}/tasks/\${task.id}\`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        deletedCount++;
        console.log(\`   ✅ Đã xóa: "\${task.title}"\`);
      } else {
        errorCount++;
        console.log(\`   ❌ Lỗi xóa: "\${task.title}" - \${result.error}\`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      errorCount++;
      console.log(\`   ❌ Lỗi: "\${task.title}" - \${error.message}\`);
    }
  }
  
  console.log(\`\\n📊 KẾT QUẢ: Đã xóa \${deletedCount}/\${tasksToDelete.length} duplicate tasks\`);
}

deleteDuplicateTasks().catch(console.error);
`;

    const deleteScriptFile = path.join(__dirname, 'delete-duplicate-tasks.cjs');
    fs.writeFileSync(deleteScriptFile, deleteScript);
    console.log(`✅ Script xóa duplicate đã được tạo: ${deleteScriptFile}`);
    console.log('');

    console.log('🎯 HƯỚNG DẪN TIẾP THEO:');
    console.log('=======================');
    console.log('1. Kiểm tra file duplicate-tasks-report.json để xem chi tiết');
    console.log('2. Chạy: node delete-duplicate-tasks.cjs để xóa duplicates');
    console.log('3. Kiểm tra lại kết quả sau khi xóa');
    console.log('');

    return {
      totalTasks: allTasks.length,
      duplicateGroups: duplicates.length,
      tasksToDelete: tasksToDelete.length,
      uniqueTasksAfter: allTasks.length - tasksToDelete.length
    };

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra duplicate:', error.message);
  }
}

// Chạy script
checkDuplicateTasks()
  .then(result => {
    if (result) {
      console.log('✅ HOÀN THÀNH KIỂM TRA DUPLICATE TASKS!');
    }
  })
  .catch(console.error);
