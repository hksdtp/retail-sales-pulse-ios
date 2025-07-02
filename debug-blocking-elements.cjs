const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUG BLOCKING ELEMENTS');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    // Setup fake session
    await page.goto('http://localhost:8088/login', { waitUntil: 'networkidle' });
    
    await page.evaluate(() => {
      const fakeUser = {
        id: '1b',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@example.com',
        role: 'retail_director',
        password_changed: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(fakeUser));
      localStorage.setItem('authToken', 'fake-token');
      localStorage.setItem('loginType', 'standard');
    });
    
    // Navigate to tasks
    await page.goto('http://localhost:8088/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Debug blocking elements
    const blockingInfo = await page.evaluate(() => {
      // Find all elements with fixed inset-0
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = getComputedStyle(el);
        return style.position === 'fixed' && 
               (el.className.includes('inset-0') || 
                (style.top === '0px' && style.left === '0px' && style.right === '0px' && style.bottom === '0px'));
      });
      
      const blockingElements = fixedElements.filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' &&
               style.opacity !== '0';
      });
      
      return {
        totalFixed: fixedElements.length,
        totalBlocking: blockingElements.length,
        blockingDetails: blockingElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          innerHTML: el.innerHTML.substring(0, 200),
          zIndex: getComputedStyle(el).zIndex,
          position: getComputedStyle(el).position,
          display: getComputedStyle(el).display,
          visibility: getComputedStyle(el).visibility,
          opacity: getComputedStyle(el).opacity
        }))
      };
    });
    
    console.log('📊 Blocking Elements Analysis:');
    console.log(`Total fixed elements: ${blockingInfo.totalFixed}`);
    console.log(`Total blocking elements: ${blockingInfo.totalBlocking}`);
    
    console.log('\n🔍 Blocking Elements Details:');
    blockingInfo.blockingDetails.forEach((el, index) => {
      console.log(`\n${index + 1}. ${el.tagName}`);
      console.log(`   Class: ${el.className}`);
      console.log(`   ID: ${el.id}`);
      console.log(`   Z-Index: ${el.zIndex}`);
      console.log(`   Position: ${el.position}`);
      console.log(`   Display: ${el.display}`);
      console.log(`   Visibility: ${el.visibility}`);
      console.log(`   Opacity: ${el.opacity}`);
      console.log(`   Content: ${el.innerHTML.substring(0, 100)}...`);
    });
    
    // Check for loading text
    const loadingTextCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const hasLoadingText = bodyText.includes('Đang khởi tạo') || bodyText.includes('Đang tải');
      
      // Find elements with loading text
      const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Đang khởi tạo') || text.includes('Đang tải');
      });
      
      return {
        hasLoadingText,
        loadingElements: loadingElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 100),
          isVisible: el.offsetParent !== null
        }))
      };
    });
    
    console.log('\n📝 Loading Text Analysis:');
    console.log(`Has loading text: ${loadingTextCheck.hasLoadingText}`);
    console.log('Loading elements:');
    loadingTextCheck.loadingElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className}`);
      console.log(`   Text: ${el.textContent}`);
      console.log(`   Visible: ${el.isVisible}`);
    });
    
    // Check for interactive elements
    const interactiveCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        !btn.disabled && btn.offsetParent !== null
      );
      
      const inputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(input => 
        !input.disabled && input.offsetParent !== null
      );
      
      return {
        interactiveButtons: buttons.length,
        interactiveInputs: inputs.length,
        buttonTexts: buttons.slice(0, 5).map(btn => btn.textContent?.trim())
      };
    });
    
    console.log('\n🎮 Interactive Elements:');
    console.log(`Interactive buttons: ${interactiveCheck.interactiveButtons}`);
    console.log(`Interactive inputs: ${interactiveCheck.interactiveInputs}`);
    console.log('Button texts:', interactiveCheck.buttonTexts);
    
    console.log('\n⏳ Waiting 15 seconds for observation...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
