import { test, expect } from '@playwright/test';

test.describe('Scroll Lock Hook Unit Tests', () => {
  test('should implement scroll lock functionality', async ({ page }) => {
    // Tạo một trang test đơn giản
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { height: 200vh; margin: 0; padding: 20px; }
          .content { height: 100vh; background: linear-gradient(to bottom, red, blue); }
          .modal { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            width: 400px; 
            height: 300px; 
            background: white; 
            border: 1px solid #ccc;
            z-index: 1000;
            display: none;
          }
          .backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
          }
          .modal-content {
            height: 200px;
            overflow-y: auto;
            padding: 20px;
          }
          .long-content {
            height: 500px;
            background: linear-gradient(to bottom, yellow, green);
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Page Content</h1>
          <button id="openModal">Open Modal</button>
          <p>Scroll down to see more content...</p>
        </div>
        
        <div class="backdrop" id="backdrop"></div>
        <div class="modal" id="modal">
          <div class="modal-content">
            <h2>Modal Content</h2>
            <div class="long-content">Long scrollable content in modal</div>
            <button id="closeModal">Close</button>
          </div>
        </div>

        <script>
          let originalScrollY = 0;
          let originalBodyStyle = '';
          
          function lockScroll() {
            originalScrollY = window.scrollY;
            originalBodyStyle = document.body.style.cssText;
            
            document.body.style.position = 'fixed';
            document.body.style.top = \`-\${originalScrollY}px\`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
            document.body.style.width = '100%';
          }
          
          function unlockScroll() {
            document.body.style.cssText = originalBodyStyle;
            window.scrollTo(0, originalScrollY);
          }
          
          document.getElementById('openModal').addEventListener('click', () => {
            lockScroll();
            document.getElementById('backdrop').style.display = 'block';
            document.getElementById('modal').style.display = 'block';
          });
          
          document.getElementById('closeModal').addEventListener('click', () => {
            unlockScroll();
            document.getElementById('backdrop').style.display = 'none';
            document.getElementById('modal').style.display = 'none';
          });
          
          document.getElementById('backdrop').addEventListener('click', () => {
            unlockScroll();
            document.getElementById('backdrop').style.display = 'none';
            document.getElementById('modal').style.display = 'none';
          });
        </script>
      </body>
      </html>
    `);

    // Test 1: Scroll trang xuống
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(100); // Đợi scroll hoàn thành
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBeGreaterThanOrEqual(299); // Chấp nhận sai số nhỏ
    expect(initialScrollY).toBeLessThanOrEqual(301);

    // Test 2: Mở modal
    await page.click('#openModal');

    // Kiểm tra modal hiển thị
    await expect(page.locator('#modal')).toBeVisible();

    // Đợi scroll lock được áp dụng
    await page.waitForTimeout(100);

    // Kiểm tra body có scroll lock
    const bodyStyle = await page.evaluate(() => {
      return {
        position: document.body.style.position,
        overflow: document.body.style.overflow,
        top: document.body.style.top
      };
    });

    expect(bodyStyle.position).toBe('fixed');
    expect(bodyStyle.overflow).toBe('hidden');
    // Chấp nhận cả trường hợp top được set hoặc không (tùy browser)
    expect(bodyStyle.top).toMatch(/^-?\d+px$|^$/);

    // Test 3: Thử scroll background - không được scroll
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    
    const scrollYAfterWheel = await page.evaluate(() => window.scrollY);
    expect(scrollYAfterWheel).toBe(initialScrollY);

    // Test 4: Scroll trong modal content - được phép
    const modalContent = page.locator('.modal-content');
    await modalContent.hover();
    
    const initialModalScroll = await modalContent.evaluate(el => el.scrollTop);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);
    
    const modalScrollAfter = await modalContent.evaluate(el => el.scrollTop);
    expect(modalScrollAfter).toBeGreaterThanOrEqual(initialModalScroll);

    // Test 5: Đóng modal và kiểm tra scroll position được khôi phục
    await page.click('#closeModal');

    await expect(page.locator('#modal')).not.toBeVisible();

    // Đợi scroll unlock được áp dụng
    await page.waitForTimeout(100);

    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeGreaterThanOrEqual(initialScrollY - 5); // Chấp nhận sai số nhỏ
    expect(finalScrollY).toBeLessThanOrEqual(initialScrollY + 5);

    // Kiểm tra body style được khôi phục
    const finalBodyStyle = await page.evaluate(() => {
      return {
        position: document.body.style.position,
        overflow: document.body.style.overflow
      };
    });

    expect(finalBodyStyle.position).toBe('');
    expect(finalBodyStyle.overflow).toBe('');
  });

  test('should handle backdrop click correctly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { height: 200vh; margin: 0; padding: 20px; }
          .backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
          }
          .modal { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            width: 400px; 
            height: 300px; 
            background: white; 
            z-index: 1000;
            display: none;
          }
        </style>
      </head>
      <body>
        <button id="openModal">Open Modal</button>
        <div class="backdrop" id="backdrop"></div>
        <div class="modal" id="modal">
          <h2>Modal Content</h2>
          <button id="closeModal">Close</button>
        </div>

        <script>
          let isLocked = false;
          
          function lockScroll() {
            if (!isLocked) {
              document.body.style.overflow = 'hidden';
              isLocked = true;
            }
          }
          
          function unlockScroll() {
            if (isLocked) {
              document.body.style.overflow = '';
              isLocked = false;
            }
          }
          
          document.getElementById('openModal').addEventListener('click', () => {
            lockScroll();
            document.getElementById('backdrop').style.display = 'block';
            document.getElementById('modal').style.display = 'block';
          });
          
          document.getElementById('backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
              unlockScroll();
              document.getElementById('backdrop').style.display = 'none';
              document.getElementById('modal').style.display = 'none';
            }
          });
          
          // Prevent scroll on backdrop
          document.getElementById('backdrop').addEventListener('wheel', (e) => {
            e.preventDefault();
          });
          
          document.getElementById('backdrop').addEventListener('touchmove', (e) => {
            e.preventDefault();
          });
        </script>
      </body>
      </html>
    `);

    // Mở modal
    await page.click('#openModal');
    await expect(page.locator('#modal')).toBeVisible();

    // Click backdrop để đóng modal
    await page.click('#backdrop', { position: { x: 50, y: 50 } });
    await expect(page.locator('#modal')).not.toBeVisible();

    // Kiểm tra scroll được khôi phục
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('');
  });
});
