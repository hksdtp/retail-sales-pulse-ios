const { chromium } = require('playwright');

(async () => {
  console.log('🚀 SIMPLE TEST - KIỂM TRA TRANG LOGIN');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n📋 BƯỚC 1: Điều hướng đến trang login');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    console.log('✅ Trang đã load, đang kiểm tra elements...');
    
    // Kiểm tra các elements cơ bản
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    
    console.log(`📊 Elements tìm thấy:`);
    console.log(`   - Email input: ${emailInput}`);
    console.log(`   - Password input: ${passwordInput}`);
    console.log(`   - Submit button: ${submitButton}`);
    
    if (emailInput > 0 && passwordInput > 0 && submitButton > 0) {
      console.log('✅ Trang login có đầy đủ elements cần thiết');
      
      // Test đăng nhập
      console.log('\n📋 BƯỚC 2: Test đăng nhập với Khổng Đức Mạnh');
      await page.fill('input[type="email"]', 'manh.khong@example.com');
      await page.fill('input[type="password"]', '123456');
      
      console.log('✅ Đã điền thông tin đăng nhập');
      
      await page.click('button[type="submit"]');
      console.log('✅ Đã click nút đăng nhập');
      
      // Đợi và kiểm tra kết quả
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      console.log(`📍 URL hiện tại: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        console.log('⚠️ Vẫn ở trang login - có thể có lỗi đăng nhập');
      } else {
        console.log('✅ Đã chuyển khỏi trang login - đăng nhập thành công');
        
        // Kiểm tra có yêu cầu đổi mật khẩu không
        const hasPasswordChangeForm = await page.locator('form').filter({ hasText: 'Đổi mật khẩu' }).count();
        const hasPasswordChangeText = await page.locator('text=Đổi mật khẩu').count();
        
        console.log(`📊 Kiểm tra đổi mật khẩu:`);
        console.log(`   - Form đổi mật khẩu: ${hasPasswordChangeForm}`);
        console.log(`   - Text đổi mật khẩu: ${hasPasswordChangeText}`);
        
        if (hasPasswordChangeForm > 0 || hasPasswordChangeText > 0) {
          console.log('✅ Hệ thống yêu cầu đổi mật khẩu (đúng logic)');
        } else {
          console.log('⚠️ Không yêu cầu đổi mật khẩu - có thể đã đổi rồi');
        }
      }
      
    } else {
      console.log('❌ Trang login thiếu elements cần thiết');
    }
    
    // Đợi 10 giây để quan sát
    console.log('\n⏳ Đợi 10 giây để quan sát...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Test hoàn thành');
  }
})();
