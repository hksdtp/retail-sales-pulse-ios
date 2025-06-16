#!/usr/bin/env node

// 🔍 Static Code Analysis - Task Form Dialog
// Phân tích code để tìm lỗi tiềm ẩn

const fs = require('fs');
const path = require('path');

function analyzeTaskFormDialog() {
  console.log('🔍 Starting Static Code Analysis...');
  
  const results = {
    issues: [],
    warnings: [],
    suggestions: [],
    score: 0
  };
  
  try {
    // Read TaskFormDialog.tsx
    const taskFormPath = path.join(__dirname, 'src/components/tasks/TaskFormDialog.tsx');
    const taskFormContent = fs.readFileSync(taskFormPath, 'utf8');
    
    console.log('📄 Analyzing TaskFormDialog.tsx...');
    
    // Check 1: Dialog width classes
    console.log('✅ Check 1: Dialog Width Classes');
    if (taskFormContent.includes('w-[98vw]')) {
      console.log('✅ PASS: Found responsive width classes');
      results.score += 10;
    } else {
      results.issues.push('❌ Missing responsive width classes (w-[98vw])');
    }
    
    if (taskFormContent.includes('max-w-none')) {
      console.log('✅ PASS: Found max-width override');
      results.score += 10;
    } else {
      results.warnings.push('⚠️ Missing max-width override for full screen usage');
    }
    
    // Check 2: Grid layouts
    console.log('✅ Check 2: Grid Layouts');
    const gridMatches = taskFormContent.match(/grid-cols-1 lg:grid-cols-3/g);
    if (gridMatches && gridMatches.length > 0) {
      console.log('✅ PASS: Found 3-column grid for time fields');
      results.score += 15;
    } else {
      results.issues.push('❌ Missing 3-column grid layout for time fields');
    }
    
    const twoColGridMatches = taskFormContent.match(/grid-cols-1 lg:grid-cols-2/g);
    if (twoColGridMatches && twoColGridMatches.length > 0) {
      console.log('✅ PASS: Found 2-column grid for assignment/visibility');
      results.score += 15;
    } else {
      results.issues.push('❌ Missing 2-column grid layout for assignment/visibility');
    }
    
    // Check 3: Required field validation
    console.log('✅ Check 3: Required Field Validation');
    const requiredFields = ['title', 'description', 'date', 'deadline', 'visibility'];
    let requiredFieldsFound = 0;
    
    requiredFields.forEach(field => {
      if (taskFormContent.includes(`${field}`) && taskFormContent.includes('*')) {
        requiredFieldsFound++;
      }
    });
    
    if (requiredFieldsFound >= 4) {
      console.log('✅ PASS: Found required field indicators');
      results.score += 15;
    } else {
      results.issues.push('❌ Missing required field indicators (*)');
    }
    
    // Check 4: Form spacing
    console.log('✅ Check 4: Form Spacing');
    if (taskFormContent.includes('space-y-12')) {
      console.log('✅ PASS: Found increased form spacing');
      results.score += 10;
    } else {
      results.warnings.push('⚠️ Consider increasing form spacing for better UX');
    }
    
    // Check 5: Input heights
    console.log('✅ Check 5: Input Heights');
    if (taskFormContent.includes('h-14')) {
      console.log('✅ PASS: Found larger input heights');
      results.score += 10;
    } else {
      results.warnings.push('⚠️ Consider increasing input heights for better accessibility');
    }
    
    // Check 6: Date picker implementation
    console.log('✅ Check 6: Date Picker Implementation');
    if (taskFormContent.includes('Popover') && taskFormContent.includes('Calendar')) {
      console.log('✅ PASS: Found proper date picker implementation');
      results.score += 15;
    } else {
      results.issues.push('❌ Date picker implementation issues');
    }
    
    // Check 7: Responsive classes
    console.log('✅ Check 7: Responsive Classes');
    const responsiveClasses = ['lg:', 'md:', 'xl:'];
    let responsiveFound = 0;
    
    responsiveClasses.forEach(cls => {
      if (taskFormContent.includes(cls)) {
        responsiveFound++;
      }
    });
    
    if (responsiveFound >= 2) {
      console.log('✅ PASS: Found responsive breakpoint classes');
      results.score += 10;
    } else {
      results.issues.push('❌ Missing responsive breakpoint classes');
    }
    
    // Check CSS file
    const cssPath = path.join(__dirname, 'src/styles/task-form-dark-theme.css');
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      console.log('🎨 Analyzing CSS file...');
      
      // Check CSS overrides
      if (cssContent.includes('!important')) {
        console.log('✅ PASS: Found CSS overrides for dialog sizing');
        results.score += 5;
      } else {
        results.warnings.push('⚠️ Consider adding CSS overrides for better control');
      }
      
      if (cssContent.includes('@media')) {
        console.log('✅ PASS: Found responsive CSS media queries');
        results.score += 5;
      } else {
        results.warnings.push('⚠️ Missing responsive CSS media queries');
      }
    } else {
      results.warnings.push('⚠️ CSS theme file not found');
    }
    
  } catch (error) {
    results.issues.push(`💥 Critical error: ${error.message}`);
  }
  
  // Generate report
  console.log('\n📊 === STATIC ANALYSIS RESULTS ===');
  console.log(`🎯 Overall Score: ${results.score}/100`);
  
  if (results.score >= 80) {
    console.log('🎉 EXCELLENT: Code quality is very good!');
  } else if (results.score >= 60) {
    console.log('👍 GOOD: Code quality is acceptable with minor issues');
  } else if (results.score >= 40) {
    console.log('⚠️ FAIR: Code needs improvement');
  } else {
    console.log('❌ POOR: Code has significant issues');
  }
  
  if (results.issues.length > 0) {
    console.log('\n🐛 === CRITICAL ISSUES ===');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ === WARNINGS ===');
    results.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  if (results.suggestions.length > 0) {
    console.log('\n💡 === SUGGESTIONS ===');
    results.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }
  
  // Specific recommendations
  console.log('\n🎯 === SPECIFIC RECOMMENDATIONS ===');
  
  if (results.score < 80) {
    console.log('1. 📐 Ensure dialog uses 90-95% of screen width');
    console.log('2. 🔲 Implement proper 3-column layout for time fields');
    console.log('3. 📱 Add responsive breakpoints for mobile/tablet');
    console.log('4. ✅ Add proper form validation indicators');
    console.log('5. 🎨 Enhance CSS with media queries and overrides');
  }
  
  console.log('\n🔧 === QUICK FIXES ===');
  console.log('1. Add w-[95vw] class to dialog');
  console.log('2. Use grid-cols-1 lg:grid-cols-3 for time section');
  console.log('3. Add space-y-12 for better spacing');
  console.log('4. Increase input heights to h-14');
  console.log('5. Add CSS !important overrides');
  
  return results;
}

// Check if files exist
function checkFileStructure() {
  console.log('📁 Checking file structure...');
  
  const requiredFiles = [
    'src/components/tasks/TaskFormDialog.tsx',
    'src/styles/task-form-dark-theme.css',
    'package.json'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    return false;
  } else {
    console.log('✅ All required files found');
    return true;
  }
}

// Main function
function main() {
  console.log('🚀 Task Form Dialog - Static Code Analysis');
  console.log('==========================================\n');
  
  if (!checkFileStructure()) {
    console.log('❌ Cannot proceed - missing required files');
    return;
  }
  
  const results = analyzeTaskFormDialog();
  
  console.log('\n📋 === SUMMARY ===');
  console.log(`Issues: ${results.issues.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Score: ${results.score}/100`);
  
  if (results.issues.length === 0 && results.score >= 80) {
    console.log('\n🎉 Code analysis passed! Ready for testing.');
  } else {
    console.log('\n🔧 Please fix the issues above before testing.');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeTaskFormDialog, checkFileStructure };
