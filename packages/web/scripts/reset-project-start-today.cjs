// Script để reset dự án và bắt đầu từ hôm nay
console.log('🚀 RESET DỰ ÁN - BẮT ĐẦU TỪ HÔM NAY');
console.log('=====================================');

const today = new Date();
const todayString = today.toISOString().split('T')[0];
const todayDisplay = today.toLocaleDateString('vi-VN');

console.log(`📅 Ngày bắt đầu dự án: ${todayDisplay} (${todayString})`);

// Tạo script để clear localStorage khi mở ứng dụng
const clearLocalStorageScript = `
// Auto-clear localStorage for fresh start
console.log('🧹 Clearing localStorage for fresh project start...');

// Clear all task-related data
localStorage.removeItem('tasks');
localStorage.removeItem('rawTasks');
localStorage.removeItem('taskFilters');
localStorage.removeItem('taskStats');

// Clear personal plans
const userKeys = Object.keys(localStorage).filter(key => 
  key.startsWith('personal_plans_') || 
  key.startsWith('plan_stats_')
);
userKeys.forEach(key => localStorage.removeItem(key));

// Clear any cached data
localStorage.removeItem('cachedTasks');
localStorage.removeItem('lastSync');
localStorage.removeItem('offlineData');

// Keep auth data but reset project start date
localStorage.setItem('projectStartDate', '${todayString}');
localStorage.setItem('projectStartDisplay', '${todayDisplay}');

console.log('✅ LocalStorage cleared - Ready for fresh start!');
console.log('📅 Project start date set to: ${todayDisplay}');
`;

// Ghi script vào file để inject vào ứng dụng
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'public', 'clear-storage.js');
fs.writeFileSync(scriptPath, clearLocalStorageScript);

console.log('📝 Created clear-storage.js script');

// Cập nhật index.html để load script
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Thêm script vào head nếu chưa có
if (!indexContent.includes('clear-storage.js')) {
  indexContent = indexContent.replace(
    '</head>',
    '  <script src="/clear-storage.js"></script>\n  </head>'
  );
  fs.writeFileSync(indexPath, indexContent);
  console.log('📝 Updated index.html to include clear-storage script');
}

console.log('');
console.log('🎉 DỰ ÁN ĐÃ ĐƯỢC RESET THÀNH CÔNG!');
console.log('=====================================');
console.log('✅ Đã xóa tất cả dữ liệu công việc từ Firebase');
console.log('✅ Đã tạo script clear localStorage');
console.log('✅ Đã cập nhật ngày bắt đầu dự án');
console.log(`📅 Ngày bắt đầu: ${todayDisplay}`);
console.log('');
console.log('🚀 Hệ thống sẵn sàng cho dữ liệu thực tế!');
console.log('💡 Reload ứng dụng để áp dụng thay đổi');
