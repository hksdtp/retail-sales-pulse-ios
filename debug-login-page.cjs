const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG TRANG LOGIN - KIỂM TRA CHI TIẾT');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n📋 Điều hướng đến trang login');
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    console.log('✅ Trang đã load, đang phân tích...');
    
    // Kiểm tra tất cả input fields
    const allInputs = await page.locator('input').count();
    console.log(`📊 Tổng số input fields: ${allInputs}`);
    
    // Kiểm tra từng loại input
    const inputTypes = ['email', 'text', 'password', 'submit'];
    for (const type of inputTypes) {
      const count = await page.locator(`input[type="${type}"]`).count();
      console.log(`   - input[type="${type}"]: ${count}`);
    }
    
    // Kiểm tra input có placeholder
    const emailPlaceholder = await page.locator('input[placeholder*="email" i]').count();
    const emailPlaceholder2 = await page.locator('input[placeholder*="Email" i]').count();
    console.log(`   - input với placeholder email: ${emailPlaceholder + emailPlaceholder2}`);
    
    // Kiểm tra tất cả buttons
    const allButtons = await page.locator('button').count();
    const submitButtons = await page.locator('button[type="submit"]').count();
    console.log(`📊 Buttons:`);
    console.log(`   - Tổng số buttons: ${allButtons}`);
    console.log(`   - Submit buttons: ${submitButtons}`);
    
    // Lấy HTML của form để debug
    console.log('\n📋 HTML của form login:');
    const formHTML = await page.locator('form').first().innerHTML().catch(() => 'Không tìm thấy form');
    console.log(formHTML);
    
    // Thử các selector khác nhau cho email
    const emailSelectors = [
      'input[type="email"]',
      'input[type="text"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email"]',
      'input[id*="email"]',
      'input[class*="email"]'
    ];
    
    console.log('\n📋 Thử các selector cho email field:');
    for (const selector of emailSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ ${selector}: ${count} elements`);
        // Thử điền email
        try {
          await page.fill(selector, 'manh.khong@example.com');
          console.log(`   ✅ Đã điền email thành công với selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`   ❌ Không thể điền email với selector: ${selector}`);
        }
      } else {
        console.log(`❌ ${selector}: 0 elements`);
      }
    }
    
    // Thử điền password
    console.log('\n📋 Thử điền password:');
    try {
      await page.fill('input[type="password"]', '123456');
      console.log('✅ Đã điền password thành công');
    } catch (error) {
      console.log('❌ Không thể điền password:', error.message);
    }
    
    // Đợi để quan sát
    console.log('\n⏳ Đợi 15 giây để quan sát trang...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ LỖI:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Debug hoàn thành');
  }
})();
