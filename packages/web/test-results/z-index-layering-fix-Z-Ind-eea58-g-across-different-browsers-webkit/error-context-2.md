# Test info

- Name: Z-Index Layering Fix - TaskFormDialog Dropdowns >> should maintain proper layering across different browsers
- Location: /Users/nih/Bán lẻ/retail-sales-pulse-ios/packages/web/tests/z-index-layering-fix.spec.ts:222:3

# Error details

```
Error: browserContext._wrapApiCall: Test ended.
Browser logs:

<launching> /Users/nih/Library/Caches/ms-playwright/webkit-2158/pw_run.sh --inspector-pipe --no-startup-window
<launched> pid=51064
[pid=51064] <gracefully close start>
[pid=51064] <process did exit: exitCode=0, signal=null>
[pid=51064] starting temporary directories cleanup
```

# Test source

```ts
  122 |     await page.click('text=Hôm nay');
  123 |     
  124 |     // Date should be selected
  125 |     await expect(dateButton).not.toHaveText('Chọn ngày thực hiện');
  126 |   });
  127 |
  128 |   test('should handle multiple dropdowns open simultaneously', async ({ page }) => {
  129 |     // Open team task creation dialog
  130 |     await page.click('button:has-text("Giao việc cho Nhóm")');
  131 |     await page.waitForSelector('[role="dialog"]');
  132 |     
  133 |     // Fill required fields
  134 |     await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Multi-dropdown test');
  135 |     await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing multiple dropdowns');
  136 |     
  137 |     // Open task type dropdown (if using dropdown layout)
  138 |     const taskTypeSection = page.locator('text=Loại công việc');
  139 |     if (await taskTypeSection.isVisible()) {
  140 |       // Try to find dropdown trigger for task types
  141 |       const taskTypeDropdown = page.locator('button:has-text("Chọn loại công việc")');
  142 |       if (await taskTypeDropdown.isVisible()) {
  143 |         await taskTypeDropdown.click();
  144 |         await page.waitForTimeout(200);
  145 |       }
  146 |     }
  147 |     
  148 |     // Open user picker dropdown
  149 |     const userPickerTrigger = page.locator('text=Chọn người được giao việc');
  150 |     await userPickerTrigger.click();
  151 |     
  152 |     // Both dropdowns should be functional
  153 |     const userSearchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
  154 |     if (await userSearchInput.isVisible()) {
  155 |       await userSearchInput.fill('test');
  156 |       await expect(userSearchInput).toHaveValue('test');
  157 |     }
  158 |   });
  159 |
  160 |   test('should work correctly on mobile viewport', async ({ page }) => {
  161 |     // Set mobile viewport
  162 |     await page.setViewportSize({ width: 375, height: 667 });
  163 |     
  164 |     // Open task creation dialog
  165 |     await page.click('button:has-text("Tạo công việc")');
  166 |     await page.waitForSelector('[role="dialog"]');
  167 |     
  168 |     // Fill required fields
  169 |     await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Mobile test');
  170 |     await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing on mobile viewport');
  171 |     
  172 |     // Select task type
  173 |     await page.click('button:has-text("KTS mới")');
  174 |     
  175 |     // Scroll to assignment section
  176 |     const assignmentSection = page.locator('text=Giao cho ai');
  177 |     await assignmentSection.scrollIntoViewIfNeeded();
  178 |     
  179 |     // Open user picker
  180 |     const userPickerTrigger = page.locator('text=Chọn người được giao việc');
  181 |     await userPickerTrigger.click();
  182 |     
  183 |     // Dropdown should be visible and functional on mobile
  184 |     const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
  185 |     if (await searchInput.isVisible()) {
  186 |       await expect(searchInput).toBeVisible();
  187 |       await searchInput.fill('mobile');
  188 |       await expect(searchInput).toHaveValue('mobile');
  189 |     }
  190 |   });
  191 |
  192 |   test('should work correctly when form is scrolled', async ({ page }) => {
  193 |     // Open task creation dialog
  194 |     await page.click('button:has-text("Tạo công việc")');
  195 |     await page.waitForSelector('[role="dialog"]');
  196 |     
  197 |     // Fill required fields
  198 |     await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', 'Scroll test');
  199 |     await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Testing dropdown when form is scrolled');
  200 |     
  201 |     // Scroll to bottom of form
  202 |     const imageUploadSection = page.locator('text=Hình ảnh đính kèm');
  203 |     await imageUploadSection.scrollIntoViewIfNeeded();
  204 |     
  205 |     // Scroll back to assignment section
  206 |     const assignmentSection = page.locator('text=Giao cho ai');
  207 |     await assignmentSection.scrollIntoViewIfNeeded();
  208 |     
  209 |     // Open user picker
  210 |     const userPickerTrigger = page.locator('text=Chọn người được giao việc');
  211 |     await userPickerTrigger.click();
  212 |     
  213 |     // Dropdown should still work correctly after scrolling
  214 |     const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
  215 |     if (await searchInput.isVisible()) {
  216 |       await expect(searchInput).toBeVisible();
  217 |       await searchInput.fill('scroll');
  218 |       await expect(searchInput).toHaveValue('scroll');
  219 |     }
  220 |   });
  221 |
> 222 |   test('should maintain proper layering across different browsers', async ({ page, browserName }) => {
      |   ^ Error: browserContext._wrapApiCall: Test ended.
  223 |     // This test will run on Chrome, Firefox, and Safari
  224 |     console.log(`Testing z-index layering on ${browserName}`);
  225 |     
  226 |     // Open team task creation dialog
  227 |     await page.click('button:has-text("Giao việc cho Nhóm")');
  228 |     await page.waitForSelector('[role="dialog"]');
  229 |     
  230 |     // Fill required fields
  231 |     await page.fill('input[placeholder*="Nhập tiêu đề công việc"]', `Browser test - ${browserName}`);
  232 |     await page.fill('textarea[placeholder*="Mô tả chi tiết"]', `Testing z-index on ${browserName}`);
  233 |     
  234 |     // Select task type
  235 |     await page.click('button:has-text("KTS mới")');
  236 |     
  237 |     // Open user picker
  238 |     const userPickerTrigger = page.locator('text=Chọn người được giao việc');
  239 |     await userPickerTrigger.click();
  240 |     
  241 |     // Verify dropdown works on this browser
  242 |     const searchInput = page.locator('input[placeholder*="Tìm kiếm người dùng"]');
  243 |     if (await searchInput.isVisible()) {
  244 |       await expect(searchInput).toBeVisible();
  245 |       
  246 |       // Test typing
  247 |       await searchInput.fill(browserName);
  248 |       await expect(searchInput).toHaveValue(browserName);
  249 |       
  250 |       // Test that dropdown doesn't disappear when clicking inside it
  251 |       await searchInput.click();
  252 |       await expect(searchInput).toBeVisible();
  253 |     }
  254 |   });
  255 | });
  256 |
```