// 🐛 Debug Script - Task Form Dialog
// Chạy script này trong browser console để tìm lỗi

console.log('🚀 Starting Task Form Debug...');

// 1. Kiểm tra dialog elements
function checkDialogElements() {
  console.log('📋 Checking Dialog Elements...');
  
  const results = {
    dialog: !!document.querySelector('[data-radix-dialog-content]'),
    title: !!document.querySelector('input[name="title"]'),
    description: !!document.querySelector('textarea[name="description"]'),
    dateButton: !!document.querySelector('button:has-text("Chọn ngày thực hiện")'),
    deadlineButton: !!document.querySelector('button:has-text("Chọn hạn chót")'),
    timeInput: !!document.querySelector('input[type="time"]'),
    visibilityButtons: document.querySelectorAll('button:has-text("Cá nhân"), button:has-text("Nhóm"), button:has-text("Chung")').length,
    submitButton: !!document.querySelector('button:has-text("Tạo công việc")'),
  };
  
  console.table(results);
  return results;
}

// 2. Kiểm tra layout
function checkLayout() {
  console.log('📐 Checking Layout...');
  
  const dialog = document.querySelector('[data-radix-dialog-content]');
  if (!dialog) {
    console.error('❌ Dialog not found!');
    return;
  }
  
  const rect = dialog.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  const layoutInfo = {
    dialogWidth: rect.width,
    dialogHeight: rect.height,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    widthPercentage: ((rect.width / viewport.width) * 100).toFixed(1) + '%',
    heightPercentage: ((rect.height / viewport.height) * 100).toFixed(1) + '%',
    isWideEnough: rect.width > viewport.width * 0.85,
    isTallEnough: rect.height > viewport.height * 0.75
  };
  
  console.table(layoutInfo);
  
  if (!layoutInfo.isWideEnough) {
    console.warn('⚠️ Dialog width is too small!');
  }
  if (!layoutInfo.isTallEnough) {
    console.warn('⚠️ Dialog height is too small!');
  }
  
  return layoutInfo;
}

// 3. Kiểm tra grid layouts
function checkGridLayouts() {
  console.log('🔲 Checking Grid Layouts...');
  
  const grids = document.querySelectorAll('.grid');
  const gridInfo = Array.from(grids).map((grid, index) => {
    const computedStyle = window.getComputedStyle(grid);
    return {
      index,
      gridTemplateColumns: computedStyle.gridTemplateColumns,
      gap: computedStyle.gap,
      className: grid.className
    };
  });
  
  console.table(gridInfo);
  return gridInfo;
}

// 4. Kiểm tra form validation
function checkFormValidation() {
  console.log('✅ Checking Form Validation...');
  
  const titleInput = document.querySelector('input[name="title"]');
  const descInput = document.querySelector('textarea[name="description"]');
  const submitButton = document.querySelector('button:has-text("Tạo công việc")');
  
  const validationInfo = {
    titleRequired: titleInput?.hasAttribute('required'),
    descRequired: descInput?.hasAttribute('required'),
    submitDisabled: submitButton?.disabled,
    titleValue: titleInput?.value || 'empty',
    descValue: descInput?.value || 'empty'
  };
  
  console.table(validationInfo);
  return validationInfo;
}

// 5. Kiểm tra CSS classes
function checkCSSClasses() {
  console.log('🎨 Checking CSS Classes...');
  
  const dialog = document.querySelector('[data-radix-dialog-content]');
  if (!dialog) return;
  
  const cssInfo = {
    hasTaskFormClass: dialog.classList.contains('task-form-dialog'),
    hasWidthClass: dialog.className.includes('w-['),
    hasMaxWidthClass: dialog.className.includes('max-w-'),
    hasHeightClass: dialog.className.includes('h-['),
    allClasses: dialog.className
  };
  
  console.table(cssInfo);
  return cssInfo;
}

// 6. Kiểm tra responsive
function checkResponsive() {
  console.log('📱 Checking Responsive...');
  
  const breakpoints = [
    { name: 'Mobile', width: 375 },
    { name: 'Tablet', width: 768 },
    { name: 'Desktop', width: 1024 },
    { name: 'Large', width: 1280 },
    { name: 'XL', width: 1920 }
  ];
  
  const currentWidth = window.innerWidth;
  const currentBreakpoint = breakpoints.find(bp => currentWidth >= bp.width) || breakpoints[0];
  
  console.log(`📏 Current breakpoint: ${currentBreakpoint.name} (${currentWidth}px)`);
  
  return {
    currentWidth,
    currentBreakpoint: currentBreakpoint.name,
    isMobile: currentWidth < 768,
    isTablet: currentWidth >= 768 && currentWidth < 1024,
    isDesktop: currentWidth >= 1024
  };
}

// 7. Kiểm tra errors trong console
function checkConsoleErrors() {
  console.log('🚨 Checking Console Errors...');
  
  // Override console.error để catch errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.warn('❌ Found errors:', errors);
    } else {
      console.log('✅ No console errors found');
    }
  }, 1000);
}

// 8. Main debug function
function debugTaskForm() {
  console.log('🔍 === TASK FORM DEBUG REPORT ===');
  
  const results = {
    elements: checkDialogElements(),
    layout: checkLayout(),
    grids: checkGridLayouts(),
    validation: checkFormValidation(),
    css: checkCSSClasses(),
    responsive: checkResponsive()
  };
  
  checkConsoleErrors();
  
  console.log('📊 === DEBUG SUMMARY ===');
  console.log('Copy this report and send to developer:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Auto-run if dialog is open
if (document.querySelector('[data-radix-dialog-content]')) {
  debugTaskForm();
} else {
  console.log('ℹ️ Dialog not open. Open the task form dialog first, then run: debugTaskForm()');
}

// Export functions to global scope
window.debugTaskForm = debugTaskForm;
window.checkDialogElements = checkDialogElements;
window.checkLayout = checkLayout;
window.checkGridLayouts = checkGridLayouts;
