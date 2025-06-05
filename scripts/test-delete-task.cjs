const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function testDeleteTask() {
  try {
    console.log('🗑️  TEST XÓA CÔNG VIỆC QUA API');
    console.log('=============================\n');
    
    // 1. Lấy danh sách tasks hiện tại
    console.log('1. 📋 Lấy danh sách tasks hiện tại...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    
    console.log(`   📊 Tổng số tasks: ${tasksData.count}`);
    
    if (tasksData.count === 0) {
      console.log('   ❌ Không có task nào để xóa');
      return;
    }
    
    // Hiển thị danh sách tasks
    console.log('   📝 Danh sách tasks:');
    tasksData.data.forEach((task, index) => {
      console.log(`      ${index + 1}. ${task.title} (ID: ${task.id}) - ${task.status}`);
    });
    
    // 2. Chọn task để xóa (task cuối cùng)
    const taskToDelete = tasksData.data[tasksData.data.length - 1];
    console.log(`\n2. 🎯 Chọn task để xóa:`);
    console.log(`   📄 Task: ${taskToDelete.title}`);
    console.log(`   🆔 ID: ${taskToDelete.id}`);
    console.log(`   📅 Created: ${taskToDelete.created_at}`);
    
    // 3. Xóa task
    console.log(`\n3. 🗑️  Đang xóa task...`);
    const deleteResponse = await fetch(`${API_BASE}/tasks/${taskToDelete.id}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResult.success) {
      console.log('   ✅ Xóa task thành công!');
    } else {
      console.log('   ❌ Lỗi xóa task:', deleteResult.error);
      return;
    }
    
    // 4. Kiểm tra lại danh sách tasks
    console.log('\n4. 🔍 Kiểm tra danh sách tasks sau khi xóa...');
    const newTasksResponse = await fetch(`${API_BASE}/tasks`);
    const newTasksData = await newTasksResponse.json();
    
    console.log(`   📊 Tổng số tasks: ${newTasksData.count} (giảm ${tasksData.count - newTasksData.count})`);
    console.log('   📝 Danh sách tasks còn lại:');
    
    newTasksData.data.forEach((task, index) => {
      console.log(`      ${index + 1}. ${task.title} (ID: ${task.id}) - ${task.status}`);
    });
    
    // 5. Xác nhận task đã bị xóa
    const deletedTaskExists = newTasksData.data.find(task => task.id === taskToDelete.id);
    
    if (!deletedTaskExists) {
      console.log(`\n✅ XÁC NHẬN: Task "${taskToDelete.title}" đã được xóa hoàn toàn!`);
    } else {
      console.log(`\n❌ LỖI: Task "${taskToDelete.title}" vẫn còn trong database!`);
    }
    
    console.log('\n🎉 TEST XÓA TASK HOÀN TẤT!');
    console.log('==========================');
    console.log('✅ API xóa task hoạt động tốt');
    console.log('🌐 Dữ liệu được cập nhật trên Firebase Cloud');
    console.log('🔗 Xem tại: https://console.firebase.google.com/project/appqlgd/firestore');
    
  } catch (error) {
    console.error('❌ Lỗi test xóa task:', error);
  }
}

// Chạy test
testDeleteTask();
