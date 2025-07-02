#!/usr/bin/env node

/**
 * Script để sửa tất cả users có password_changed: true thành false
 * Để cho phép đăng nhập với mật khẩu mặc định 123456
 */

const fs = require('fs');

console.log('🔧 FIXING ALL USERS PASSWORD_CHANGED FLAGS');
console.log('='.repeat(60));

try {
  // Đọc file mockAuth.ts
  const filePath = './packages/web/src/services/mockAuth.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📋 Đang tìm và sửa password_changed: true...');
  
  // Đếm số lượng thay đổi
  let changeCount = 0;
  
  // Thay thế tất cả password_changed: true thành false (trừ comments)
  content = content.replace(/(\s+)password_changed:\s*true,(\s*(?:\/\/.*)?)/g, (match, indent, suffix) => {
    // Bỏ qua nếu là comment hoặc trong string
    if (suffix.includes('//') && suffix.includes('true')) {
      return match; // Giữ nguyên comments
    }
    
    changeCount++;
    console.log(`✅ Fixed password_changed: true → false (${changeCount})`);
    return `${indent}password_changed: false,${suffix} // FIXED: Allow default password login`;
  });
  
  // Ghi lại file
  fs.writeFileSync(filePath, content);
  
  console.log('\n📊 KẾT QUẢ:');
  console.log(`✅ Đã sửa ${changeCount} users`);
  console.log(`📁 File đã được cập nhật: ${filePath}`);
  
  console.log('\n🔍 KIỂM TRA KẾT QUẢ:');
  
  // Kiểm tra lại file
  const updatedContent = fs.readFileSync(filePath, 'utf8');
  const remainingTrueCount = (updatedContent.match(/password_changed:\s*true/g) || []).length;
  const falseCount = (updatedContent.match(/password_changed:\s*false/g) || []).length;
  
  console.log(`❌ Còn lại password_changed: true: ${remainingTrueCount}`);
  console.log(`✅ Tổng password_changed: false: ${falseCount}`);
  
  if (remainingTrueCount === 0) {
    console.log('\n🎉 HOÀN THÀNH: Tất cả users giờ có thể đăng nhập với mật khẩu mặc định 123456!');
  } else {
    console.log('\n⚠️ CẢNH BÁO: Vẫn còn một số users có password_changed: true');
    
    // Tìm và hiển thị các users còn lại
    const lines = updatedContent.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('password_changed: true')) {
        console.log(`   Line ${index + 1}: ${line.trim()}`);
      }
    });
  }
  
  console.log('\n🔧 BƯỚC TIẾP THEO:');
  console.log('1. Chạy test để verify tất cả users có thể đăng nhập');
  console.log('2. Kiểm tra không còn lỗ hổng bảo mật');
  console.log('3. Test với mật khẩu sai để đảm bảo bị chặn');
  
} catch (error) {
  console.error('❌ LỖI:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('🏁 SCRIPT HOÀN THÀNH');
console.log('='.repeat(60));
