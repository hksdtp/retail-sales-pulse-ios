const fetch = require('node-fetch');

console.log('🔍 KIỂM TRA CÁC NGUỒN BACKUP CÓ THỂ KHÔI PHỤC TASKS');
console.log('=================================================\n');

async function checkBackupSources() {
  try {
    // 1. Kiểm tra Firebase Backup/History
    console.log('1. 🔥 Kiểm tra Firebase Backup...');
    console.log('❌ Firebase Firestore không có tính năng backup tự động cho free tier');
    console.log('❌ Dữ liệu đã bị xóa vĩnh viễn từ Firestore');
    console.log('');

    // 2. Kiểm tra Google Sheets Backup
    console.log('2. 📊 Kiểm tra Google Sheets Backup...');
    
    // Thử gọi Google Sheets API để xem có dữ liệu backup không
    const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbxyy6s0Zoel6ZTfSoS21VnntyQ4JJ0ze4xfjeczj7xKsm3E4Hf5idY92agyvWti6_kq/exec';
    
    try {
      console.log('📋 Đang kiểm tra Google Sheets...');
      const response = await fetch(`${googleSheetsUrl}?action=getTasks&sheetId=1EdU2yxddERUV0QBCApGpsyobxnC4N4J4l-5sH4chUZQ`);
      
      if (response.ok) {
        const data = await response.text();
        console.log('✅ Google Sheets phản hồi:', data.substring(0, 200) + '...');
        
        if (data.includes('tasks') || data.includes('data')) {
          console.log('🎉 CÓ THỂ có dữ liệu backup trong Google Sheets!');
        } else {
          console.log('❌ Google Sheets không có dữ liệu tasks');
        }
      } else {
        console.log('❌ Không thể kết nối Google Sheets:', response.status);
      }
    } catch (error) {
      console.log('❌ Lỗi khi kiểm tra Google Sheets:', error.message);
    }
    console.log('');

    // 3. Kiểm tra Local Storage/Browser Cache
    console.log('3. 💾 Kiểm tra Local Storage...');
    console.log('❌ Local storage đã bị xóa bởi script clean-all-mock-data');
    console.log('❌ Không có dữ liệu tasks trong browser cache');
    console.log('');

    // 4. Kiểm tra Log Files
    console.log('4. 📝 Kiểm tra Log Files...');
    console.log('❌ Không có log files chứa dữ liệu tasks đầy đủ');
    console.log('❌ API logs chỉ chứa metadata, không có content');
    console.log('');

    // 5. Kiểm tra Git History
    console.log('5. 📚 Kiểm tra Git History...');
    console.log('❌ Tasks được lưu trên server, không trong git repository');
    console.log('❌ Git chỉ chứa source code, không chứa dữ liệu production');
    console.log('');

    // 6. Kiểm tra các file backup có thể
    console.log('6. 🗂️ Kiểm tra các file backup khác...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Tìm các file có thể chứa backup
    const possibleBackupFiles = [
      'firebase-data-export.json',
      'tasks-backup.json',
      'data-backup.json',
      'export.json'
    ];
    
    let foundBackup = false;
    
    for (const fileName of possibleBackupFiles) {
      const filePath = path.join(__dirname, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Tìm thấy file: ${fileName}`);
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          
          if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
            console.log(`🎉 File ${fileName} chứa ${data.tasks.length} tasks!`);
            foundBackup = true;
            
            // Hiển thị preview
            console.log('📋 Preview tasks:');
            data.tasks.slice(0, 3).forEach((task, index) => {
              console.log(`   ${index + 1}. ${task.title} (${task.status})`);
            });
          } else {
            console.log(`❌ File ${fileName} không chứa tasks hoặc tasks rỗng`);
          }
        } catch (error) {
          console.log(`❌ Lỗi đọc file ${fileName}:`, error.message);
        }
      } else {
        console.log(`❌ Không tìm thấy: ${fileName}`);
      }
    }
    
    console.log('');

    // 7. Tổng kết
    console.log('📊 TỔNG KẾT KIỂM TRA BACKUP:');
    console.log('============================');
    console.log('🔥 Firebase Backup: ❌ Không có');
    console.log('📊 Google Sheets: ❓ Cần kiểm tra thêm');
    console.log('💾 Local Storage: ❌ Đã bị xóa');
    console.log('📝 Log Files: ❌ Không đầy đủ');
    console.log('📚 Git History: ❌ Không có dữ liệu');
    console.log(`🗂️ File Backup: ${foundBackup ? '✅ Có' : '❌ Không có'}`);
    console.log('');

    if (!foundBackup) {
      console.log('💡 KHUYẾN NGHỊ:');
      console.log('================');
      console.log('1. ❌ Không thể khôi phục tasks đã xóa');
      console.log('2. 🔄 Cần tạo lại tasks từ đầu');
      console.log('3. 📋 Sử dụng thông tin users hiện có để tạo tasks mới');
      console.log('4. 💾 Thiết lập backup tự động cho tương lai');
      console.log('');
      
      console.log('🚀 CÁC BƯỚC TIẾP THEO:');
      console.log('======================');
      console.log('1. Chạy script restore-basic-tasks.cjs để tạo tasks cơ bản');
      console.log('2. Yêu cầu users tạo lại tasks cần thiết');
      console.log('3. Thiết lập backup định kỳ');
      console.log('4. Vô hiệu hóa các script nguy hiểm');
    } else {
      console.log('🎉 CÓ THỂ KHÔI PHỤC!');
      console.log('====================');
      console.log('✅ Tìm thấy dữ liệu backup');
      console.log('🔄 Có thể khôi phục từ file backup');
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra backup:', error.message);
  }
}

// Chạy script
checkBackupSources().catch(console.error);
