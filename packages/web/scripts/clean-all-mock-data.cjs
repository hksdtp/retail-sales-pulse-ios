/**
 * Script để xóa tất cả dữ liệu mock/fake/test trong dự án
 * Bao gồm: localStorage, sessionStorage, và các dữ liệu tạm thời
 */

console.log('🧹 BẮT ĐẦU XÓA TẤT CẢ DỮ LIỆU MOCK/FAKE/TEST...\n');

// Danh sách các key localStorage cần xóa
const localStorageKeysToRemove = [
  'rawTasks',
  'tasks', 
  'mockTasks',
  'testTasks',
  'sampleTasks',
  'demoTasks',
  'tempTasks',
  'cachedTasks',
  'localTasks',
  'taskCache',
  'taskData',
  'testData',
  'mockData',
  'sampleData',
  'demoData',
  'fakeData',
  'tempData'
];

// Danh sách các key sessionStorage cần xóa
const sessionStorageKeysToRemove = [
  'rawTasks',
  'tasks',
  'mockTasks', 
  'testTasks',
  'sampleTasks',
  'demoTasks',
  'tempTasks',
  'taskCache',
  'testData',
  'mockData',
  'sampleData',
  'demoData',
  'fakeData',
  'tempData'
];

console.log('📋 Danh sách localStorage keys sẽ xóa:');
localStorageKeysToRemove.forEach((key, index) => {
  console.log(`   ${index + 1}. ${key}`);
});

console.log('\n📋 Danh sách sessionStorage keys sẽ xóa:');
sessionStorageKeysToRemove.forEach((key, index) => {
  console.log(`   ${index + 1}. ${key}`);
});

console.log('\n🗑️ Bắt đầu xóa dữ liệu...');

// Tạo HTML để chạy cleanup trong browser
const cleanupHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Clean Mock Data</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        .warning { color: orange; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Xóa Dữ Liệu Mock/Fake/Test</h1>
        <div id="output"></div>
        <button onclick="cleanAllData()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
            🗑️ XÓA TẤT CẢ DỮ LIỆU MOCK
        </button>
    </div>

    <script>
        function log(message, type = 'info') {
            const output = document.getElementById('output');
            const div = document.createElement('div');
            div.className = type;
            div.innerHTML = message;
            output.appendChild(div);
            console.log(message);
        }

        function cleanAllData() {
            log('🧹 Bắt đầu xóa tất cả dữ liệu mock/fake/test...', 'info');
            
            // Xóa localStorage
            const localStorageKeys = ${JSON.stringify(localStorageKeysToRemove)};
            let localStorageRemoved = 0;
            
            log('\\n📱 Xóa localStorage:', 'info');
            localStorageKeys.forEach(key => {
                if (localStorage.getItem(key) !== null) {
                    localStorage.removeItem(key);
                    localStorageRemoved++;
                    log(\`   ✅ Đã xóa: \${key}\`, 'success');
                } else {
                    log(\`   ⚪ Không tồn tại: \${key}\`, 'info');
                }
            });
            
            // Xóa sessionStorage
            const sessionStorageKeys = ${JSON.stringify(sessionStorageKeysToRemove)};
            let sessionStorageRemoved = 0;
            
            log('\\n💾 Xóa sessionStorage:', 'info');
            sessionStorageKeys.forEach(key => {
                if (sessionStorage.getItem(key) !== null) {
                    sessionStorage.removeItem(key);
                    sessionStorageRemoved++;
                    log(\`   ✅ Đã xóa: \${key}\`, 'success');
                } else {
                    log(\`   ⚪ Không tồn tại: \${key}\`, 'info');
                }
            });
            
            // Xóa tất cả cache có thể
            log('\\n🗂️ Xóa các cache khác:', 'info');
            try {
                // Xóa tất cả localStorage keys có chứa 'task', 'mock', 'test', 'sample', 'demo', 'fake'
                const allLocalStorageKeys = Object.keys(localStorage);
                const suspiciousKeys = allLocalStorageKeys.filter(key => 
                    key.toLowerCase().includes('task') ||
                    key.toLowerCase().includes('mock') ||
                    key.toLowerCase().includes('test') ||
                    key.toLowerCase().includes('sample') ||
                    key.toLowerCase().includes('demo') ||
                    key.toLowerCase().includes('fake') ||
                    key.toLowerCase().includes('temp')
                );
                
                suspiciousKeys.forEach(key => {
                    localStorage.removeItem(key);
                    log(\`   ✅ Đã xóa suspicious key: \${key}\`, 'success');
                });
                
                // Tương tự cho sessionStorage
                const allSessionStorageKeys = Object.keys(sessionStorage);
                const suspiciousSessionKeys = allSessionStorageKeys.filter(key => 
                    key.toLowerCase().includes('task') ||
                    key.toLowerCase().includes('mock') ||
                    key.toLowerCase().includes('test') ||
                    key.toLowerCase().includes('sample') ||
                    key.toLowerCase().includes('demo') ||
                    key.toLowerCase().includes('fake') ||
                    key.toLowerCase().includes('temp')
                );
                
                suspiciousSessionKeys.forEach(key => {
                    sessionStorage.removeItem(key);
                    log(\`   ✅ Đã xóa suspicious session key: \${key}\`, 'success');
                });
                
            } catch (error) {
                log(\`   ❌ Lỗi khi xóa cache: \${error.message}\`, 'error');
            }
            
            // Báo cáo kết quả
            log('\\n📊 KẾT QUẢ XÓA DỮ LIỆU:', 'info');
            log(\`✅ LocalStorage keys đã xóa: \${localStorageRemoved}\`, 'success');
            log(\`✅ SessionStorage keys đã xóa: \${sessionStorageRemoved}\`, 'success');
            log('🎉 ĐÃ XÓA THÀNH CÔNG TẤT CẢ DỮ LIỆU MOCK!', 'success');
            log('🚀 Hệ thống đã sẵn sàng cho dữ liệu thật', 'success');
            
            // Reload trang để áp dụng thay đổi
            setTimeout(() => {
                log('\\n🔄 Đang reload trang để áp dụng thay đổi...', 'info');
                window.location.reload();
            }, 2000);
        }
        
        // Tự động chạy khi trang load
        window.onload = function() {
            log('🌐 Trang đã sẵn sàng. Nhấn nút để xóa dữ liệu mock.', 'info');
        };
    </script>
</body>
</html>
`;

// Ghi file HTML
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'clean-mock-data.html');
fs.writeFileSync(htmlPath, cleanupHTML);

console.log('✅ Đã tạo file HTML cleanup:', htmlPath);
console.log('🌐 Mở file này trong trình duyệt để xóa dữ liệu mock trong localStorage/sessionStorage');
console.log('📂 File path:', htmlPath);

console.log('\n🎯 HƯỚNG DẪN SỬ DỤNG:');
console.log('1. Mở file clean-mock-data.html trong trình duyệt');
console.log('2. Nhấn nút "XÓA TẤT CẢ DỮ LIỆU MOCK"');
console.log('3. Kiểm tra console để xem kết quả');
console.log('4. Trang sẽ tự động reload sau khi xóa xong');

console.log('\n✅ HOÀN THÀNH TẠO SCRIPT XÓA DỮ LIỆU MOCK!');
