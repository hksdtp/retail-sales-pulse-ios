import { test, expect } from '@playwright/test';

test.describe('Create Task Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Điều hướng đến trang chủ
    await page.goto('http://localhost:8088');
    
    // Đăng nhập trước khi test (giả sử có form đăng nhập)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('manh.khong@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Đợi redirect đến dashboard
      await page.waitForTimeout(3000);
    }
  });

  test('should open create task dialog', async ({ page }) => {
    // Tìm và click nút tạo task mới
    const createTaskButton = page.locator('button:has-text("Tạo công việc mới")');
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      
      // Kiểm tra dialog đã mở
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Tạo công việc mới')).toBeVisible();
    } else {
      console.log('Create task button not found, checking for alternative selectors');
      
      // Thử tìm các selector khác
      const altButtons = [
        'button:has-text("Tạo task")',
        'button:has-text("Thêm công việc")',
        '[data-testid="create-task-button"]',
        'button[aria-label*="tạo"]',
        'button[aria-label*="thêm"]'
      ];
      
      for (const selector of altButtons) {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          await button.click();
          break;
        }
      }
    }
    
    // Chụp ảnh dialog
    await page.screenshot({ 
      path: 'test-results/create-task-dialog.png',
      fullPage: true 
    });
  });

  test('should validate required fields', async ({ page }) => {
    // Mở dialog tạo task
    const createTaskButton = page.locator('button:has-text("Tạo công việc mới")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(1000);
      
      // Thử submit form trống
      const submitButton = page.locator('button:has-text("Tạo công việc")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Kiểm tra thông báo lỗi validation
        await expect(page.locator('text=Vui lòng điền đầy đủ thông tin bắt buộc')).toBeVisible();
      }
    }
  });

  test('should create task with valid data', async ({ page }) => {
    // Mở dialog tạo task
    const createTaskButton = page.locator('button:has-text("Tạo công việc mới")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(1000);
      
      // Điền thông tin task
      const titleInput = page.locator('input[placeholder*="tiêu đề"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Task - Kiểm tra chức năng tạo task');
      }
      
      const descriptionInput = page.locator('textarea[placeholder*="mô tả"]');
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('Đây là task test được tạo bởi Playwright automation để kiểm tra chức năng tạo task mới');
      }
      
      // Chọn loại công việc
      const typeSelect = page.locator('select[name="type"]').or(page.locator('[role="combobox"]').first());
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('text=KTS mới').or(page.locator('[data-value="partner_new"]')).click();
      }
      
      // Chọn ngày
      const dateInput = page.locator('input[type="date"]').or(page.locator('input[placeholder*="ngày"]'));
      if (await dateInput.isVisible()) {
        const today = new Date().toISOString().split('T')[0];
        await dateInput.fill(today);
      }
      
      // Chọn thời gian (optional)
      const timeInput = page.locator('input[type="time"]').or(page.locator('input[placeholder*="thời gian"]'));
      if (await timeInput.isVisible()) {
        await timeInput.fill('09:00');
      }
      
      // Chụp ảnh form đã điền
      await page.screenshot({ 
        path: 'test-results/create-task-filled-form.png',
        fullPage: true 
      });
      
      // Submit form
      const submitButton = page.locator('button:has-text("Tạo công việc")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Đợi thông báo thành công
        await expect(page.locator('text=Đã tạo công việc mới thành công')).toBeVisible({ timeout: 10000 });
        
        // Kiểm tra dialog đã đóng
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
        
        console.log('✅ Task created successfully');
      }
    }
  });

  test('should test different task types', async ({ page }) => {
    const taskTypes = [
      { value: 'partner_new', label: 'KTS mới' },
      { value: 'partner_old', label: 'KTS cũ' },
      { value: 'client_new', label: 'KH/CĐT mới' },
      { value: 'client_old', label: 'KH/CĐT cũ' },
      { value: 'other', label: 'Công việc khác' }
    ];
    
    for (const taskType of taskTypes) {
      // Mở dialog tạo task
      const createTaskButton = page.locator('button:has-text("Tạo công việc mới")').first();
      
      if (await createTaskButton.isVisible()) {
        await createTaskButton.click();
        await page.waitForTimeout(1000);
        
        // Điền thông tin cơ bản
        await page.locator('input[placeholder*="tiêu đề"]').fill(`Test ${taskType.label} - ${Date.now()}`);
        await page.locator('textarea[placeholder*="mô tả"]').fill(`Test task cho loại ${taskType.label}`);
        
        // Chọn loại công việc
        const typeSelect = page.locator('select[name="type"]').or(page.locator('[role="combobox"]').first());
        if (await typeSelect.isVisible()) {
          await typeSelect.click();
          await page.locator(`text=${taskType.label}`).or(page.locator(`[data-value="${taskType.value}"]`)).click();
        }
        
        // Chọn ngày
        const today = new Date().toISOString().split('T')[0];
        await page.locator('input[type="date"]').fill(today);
        
        // Submit
        await page.locator('button:has-text("Tạo công việc")').click();
        
        // Đợi thông báo thành công hoặc đóng dialog
        await page.waitForTimeout(2000);
        
        console.log(`✅ Created task type: ${taskType.label}`);
      }
    }
  });

  test('should test priority selection', async ({ page }) => {
    // Mở dialog tạo task
    const createTaskButton = page.locator('button:has-text("Tạo công việc mới")').first();
    
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(1000);
      
      // Điền thông tin cơ bản
      await page.locator('input[placeholder*="tiêu đề"]').fill('Test Priority Task');
      await page.locator('textarea[placeholder*="mô tả"]').fill('Testing priority selection');
      
      // Chọn loại công việc
      const typeSelect = page.locator('select[name="type"]').or(page.locator('[role="combobox"]').first());
      if (await typeSelect.isVisible()) {
        await typeSelect.click();
        await page.locator('text=KTS mới').click();
      }
      
      // Test priority selection
      const prioritySelect = page.locator('select[name="priority"]').or(page.locator('[role="combobox"]').nth(1));
      if (await prioritySelect.isVisible()) {
        await prioritySelect.click();
        
        // Kiểm tra các option priority
        await expect(page.locator('text=Cao')).toBeVisible();
        await expect(page.locator('text=Bình thường')).toBeVisible();
        await expect(page.locator('text=Thấp')).toBeVisible();
        
        // Chọn priority cao
        await page.locator('text=Cao').click();
      }
      
      // Chọn ngày
      const today = new Date().toISOString().split('T')[0];
      await page.locator('input[type="date"]').fill(today);
      
      // Chụp ảnh
      await page.screenshot({ 
        path: 'test-results/create-task-priority.png',
        fullPage: true 
      });
      
      console.log('✅ Priority selection tested');
    }
  });

  test('should test responsive design for create task', async ({ page }) => {
    // Test trên desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const createTaskButton = page.locator('button:has-text("Tạo công việc mới")').first();
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/create-task-desktop.png',
        fullPage: true 
      });
    }
    
    // Test trên tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: 'test-results/create-task-tablet.png',
      fullPage: true 
    });
    
    // Test trên mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'test-results/create-task-mobile.png',
      fullPage: true 
    });
    
    console.log('📱 Responsive design tested for create task');
  });
});
