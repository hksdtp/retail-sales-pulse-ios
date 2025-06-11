// Script để xóa tất cả kế hoạch cá nhân mẫu
console.log('🗑️ CLEARING ALL PERSONAL PLANS DATA');
console.log('=====================================');

// Tạo script để clear localStorage cho personal plans
const clearPersonalPlansScript = `
// Auto-clear personal plans localStorage for fresh start
console.log('🧹 Clearing personal plans localStorage...');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);

// Find and remove personal plans keys
const personalPlanKeys = allKeys.filter(key => 
  key.startsWith('personal_plans_') || 
  key.startsWith('plan_stats_')
);

console.log('Found personal plan keys:', personalPlanKeys);

// Remove all personal plan data
personalPlanKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('Removed:', key);
});

console.log('✅ Personal plans localStorage cleared!');
console.log('📅 Ready for real data input');
`;

// Ghi script vào file để inject vào ứng dụng
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'public', 'clear-personal-plans.js');
fs.writeFileSync(scriptPath, clearPersonalPlansScript);

console.log('📝 Created clear-personal-plans.js script');

// Cập nhật index.html để load script
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Thêm script vào head nếu chưa có
if (!indexContent.includes('clear-personal-plans.js')) {
  indexContent = indexContent.replace(
    '</head>',
    '  <script src="/clear-personal-plans.js"></script>\n  </head>'
  );
  fs.writeFileSync(indexPath, indexContent);
  console.log('📝 Updated index.html to include clear-personal-plans script');
}

console.log('');
console.log('🎉 PERSONAL PLANS DATA CLEARED!');
console.log('=====================================');
console.log('✅ Đã tạo script clear localStorage cho personal plans');
console.log('✅ Đã cập nhật index.html');
console.log('');
console.log('🚀 Kế hoạch cá nhân sẵn sàng cho dữ liệu thật!');
console.log('💡 Reload ứng dụng để áp dụng thay đổi');
