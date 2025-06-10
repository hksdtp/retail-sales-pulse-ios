const fetch = require('node-fetch');

const API_BASE = 'https://us-central1-appqlgd.cloudfunctions.net/api';

async function testTaskBadges() {
  try {
    console.log('🧪 Kiểm tra badge hiển thị cho tất cả tasks...');
    
    // Lấy tất cả tasks
    const response = await fetch(`${API_BASE}/tasks`);
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Lỗi khi lấy danh sách tasks:', result.error);
      return;
    }
    
    const tasks = result.data || [];
    console.log(`📋 Tìm thấy ${tasks.length} tasks`);
    
    console.log('\n📊 Thống kê badge:');
    console.log('='.repeat(50));
    
    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. Task: ${task.title}`);
      console.log(`   ID: ${task.id}`);
      console.log(`   Status: ${task.status || 'undefined'}`);
      console.log(`   Priority: ${task.priority || 'undefined'}`);
      console.log(`   Type: ${task.type || 'undefined'}`);
      
      // Kiểm tra các trường bắt buộc cho badge
      const statusValid = ['todo', 'in-progress', 'on-hold', 'completed'].includes(task.status);
      const priorityValid = ['high', 'normal', 'low'].includes(task.priority);
      const typeValid = [
        'partner_new', 'partner_old', 'architect_new', 'architect_old',
        'client_new', 'client_old', 'quote_new', 'quote_old',
        'report', 'training', 'meeting', 'inventory', 'other'
      ].includes(task.type);
      
      console.log(`   ✅ Status valid: ${statusValid}`);
      console.log(`   ✅ Priority valid: ${priorityValid}`);
      console.log(`   ✅ Type valid: ${typeValid}`);
      
      if (!statusValid || !priorityValid || !typeValid) {
        console.log(`   ⚠️  BADGE CÓ THỂ BỊ LỖI!`);
      } else {
        console.log(`   ✅ Badge sẽ hiển thị đúng`);
      }
    });
    
    console.log('\n📈 Tổng kết:');
    console.log('='.repeat(50));
    
    const statusStats = {};
    const priorityStats = {};
    const typeStats = {};
    
    tasks.forEach(task => {
      statusStats[task.status || 'undefined'] = (statusStats[task.status || 'undefined'] || 0) + 1;
      priorityStats[task.priority || 'undefined'] = (priorityStats[task.priority || 'undefined'] || 0) + 1;
      typeStats[task.type || 'undefined'] = (typeStats[task.type || 'undefined'] || 0) + 1;
    });
    
    console.log('Status distribution:', statusStats);
    console.log('Priority distribution:', priorityStats);
    console.log('Type distribution:', typeStats);
    
  } catch (error) {
    console.error('❌ Lỗi khi test badges:', error);
  }
}

// Chạy script
testTaskBadges();
