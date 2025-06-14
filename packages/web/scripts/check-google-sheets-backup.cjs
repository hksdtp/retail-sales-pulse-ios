const fetch = require('node-fetch');

console.log('📊 KIỂM TRA CHI TIẾT GOOGLE SHEETS BACKUP');
console.log('=========================================\n');

async function checkGoogleSheetsBackup() {
  const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbxyy6s0Zoel6ZTfSoS21VnntyQ4JJ0ze4xfjeczj7xKsm3E4Hf5idY92agyvWti6_kq/exec';
  const sheetId = '1EdU2yxddERUV0QBCApGpsyobxnC4N4J4l-5sH4chUZQ';

  try {
    // 1. Thử các action khác nhau
    const actions = [
      'getTasks',
      'getAllTasks', 
      'listTasks',
      'exportTasks',
      'backup',
      'restore',
      'data'
    ];

    console.log('🔍 Thử các action khác nhau với Google Sheets...\n');

    for (const action of actions) {
      console.log(`📋 Thử action: ${action}`);
      
      try {
        const url = `${googleSheetsUrl}?action=${action}&sheetId=${sheetId}`;
        console.log(`   URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; TaskBackupChecker/1.0)'
          }
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`   Response length: ${text.length} chars`);
          
          // Kiểm tra nếu response có chứa dữ liệu tasks
          if (text.includes('task') || text.includes('Task') || text.includes('title') || text.includes('description')) {
            console.log('   🎉 CÓ THỂ chứa dữ liệu tasks!');
            console.log(`   Preview: ${text.substring(0, 200)}...`);
            
            // Thử parse JSON
            try {
              const data = JSON.parse(text);
              if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log(`   ✅ Tìm thấy ${data.data.length} items trong data!`);
                
                // Kiểm tra item đầu tiên
                const firstItem = data.data[0];
                if (firstItem.title || firstItem.description || firstItem.status) {
                  console.log('   🎯 ĐÚNG LÀ TASKS DATA!');
                  console.log(`   Sample task: ${firstItem.title || firstItem.name || 'No title'}`);
                  return { success: true, action, data: data.data, url };
                }
              }
            } catch (parseError) {
              console.log('   ⚠️ Không thể parse JSON, có thể là HTML hoặc text khác');
            }
          } else {
            console.log('   ❌ Không chứa dữ liệu tasks');
          }
        } else {
          console.log(`   ❌ HTTP Error: ${response.status}`);
        }
        
        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    // 2. Thử truy cập trực tiếp Google Sheets
    console.log('📊 Thử truy cập trực tiếp Google Sheets...');
    
    const directUrls = [
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`,
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
    ];

    for (const url of directUrls) {
      console.log(`📋 Thử URL: ${url.substring(0, 80)}...`);
      
      try {
        const response = await fetch(url);
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`   Response length: ${text.length} chars`);
          
          if (text.includes('task') || text.includes('Task') || text.includes('title')) {
            console.log('   🎉 CÓ THỂ chứa dữ liệu tasks!');
            console.log(`   Preview: ${text.substring(0, 300)}...`);
            
            // Lưu vào file để kiểm tra
            const fs = require('fs');
            const path = require('path');
            const fileName = `sheets-backup-${Date.now()}.txt`;
            const filePath = path.join(__dirname, fileName);
            fs.writeFileSync(filePath, text);
            console.log(`   💾 Đã lưu vào file: ${fileName}`);
            
            return { success: true, type: 'direct', data: text, url, file: fileName };
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('❌ KHÔNG TÌM THẤY DỮ LIỆU BACKUP TRONG GOOGLE SHEETS');
    return { success: false };

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra Google Sheets:', error.message);
    return { success: false, error: error.message };
  }
}

// Chạy script
checkGoogleSheetsBackup()
  .then(result => {
    console.log('\n📊 KẾT QUẢ KIỂM TRA GOOGLE SHEETS:');
    console.log('==================================');
    
    if (result.success) {
      console.log('🎉 THÀNH CÔNG! Tìm thấy dữ liệu backup!');
      console.log(`✅ Phương thức: ${result.action || result.type}`);
      console.log(`🔗 URL: ${result.url}`);
      
      if (result.file) {
        console.log(`📁 File đã lưu: ${result.file}`);
      }
      
      console.log('\n🚀 BƯỚC TIẾP THEO:');
      console.log('==================');
      console.log('1. Kiểm tra file đã lưu để xác nhận dữ liệu');
      console.log('2. Tạo script khôi phục từ Google Sheets');
      console.log('3. Import dữ liệu vào Firebase');
      
    } else {
      console.log('❌ KHÔNG TÌM THẤY dữ liệu backup');
      console.log('💡 Cần tạo lại tasks từ đầu');
    }
  })
  .catch(console.error);
