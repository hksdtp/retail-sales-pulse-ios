#!/usr/bin/env node

/**
 * COMPREHENSIVE CLEANUP SCRIPT
 * Ninh ơi - Dọn dẹp toàn bộ file rác, code dư thừa, mock data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 COMPREHENSIVE CLEANUP - RETAIL SALES PULSE');
console.log('==============================================');

// Files to delete completely
const filesToDelete = [
  // Debug & Test Files
  'debug-api-url.js',
  'debug-webapp-console.js',
  'test-api-fix.js',
  'test-server.js',
  'packages/web/debug-user-attribution.js',
  'packages/web/test-task-filters.js',
  'packages/web/debug-task-deletion.js',
  'packages/web/clear-all-tasks.js',
  'packages/web/clear-supabase-tasks.js',
  'packages/web/comprehensive-system-audit.js',
  'packages/web/add-missing-team-member.js',
  'packages/web/fix-director-team.js',
  'packages/web/fix-missing-users.js',
  'packages/web/fix-password-sync.js',
  
  // Public Debug Files
  'packages/web/public/debug-api.js',
  'packages/web/public/clear-tasks.js',
  
  // Old/Unused Context Files
  'packages/web/src/context/TaskDataProvider.old.tsx',
  'packages/web/src/context/ApiTaskDataProvider.tsx',
  
  // Mock Data Files
  'packages/web/src/utils/mockData.ts',
  'packages/web/src/data/mockTasks.ts',
  
  // Test Results
  'packages/web/test-results/',
  'packages/web/playwright-report/',
  
  // Cache Files
  'packages/web/public/supabase-data-converted.json',
  'packages/web/dist/supabase-data-converted.json',
  'packages/web/src/data/cachedTasks.json',
  
  // Augment MCP (if not needed)
  'augment-mcp/',
  'scripts/augment-server.js',
  'aug',
];

// Directories to clean
const directoriesToClean = [
  'packages/web/test-results',
  'packages/web/playwright-report',
  'packages/web/node_modules/.cache',
  'packages/web/dist',
  'packages/web/.next',
];

// Files to clean content (remove mock data, debug code)
const filesToClean = [
  {
    path: 'packages/web/src/utils/index.ts',
    removeLines: ['mockData', 'testUtils', 'debugPlans']
  }
];

// Console.log patterns to remove
const consoleLogPatterns = [
  /console\.log\(['"`]🔍.*?['"`].*?\);?/g,
  /console\.log\(['"`]📋.*?['"`].*?\);?/g,
  /console\.log\(['"`]🔧.*?['"`].*?\);?/g,
  /console\.log\(['"`]✅.*?['"`].*?\);?/g,
  /console\.log\(['"`]❌.*?['"`].*?\);?/g,
  /console\.log\(['"`]🚀.*?['"`].*?\);?/g,
  /console\.log\(['"`]DEBUG.*?['"`].*?\);?/g,
  /console\.debug\(.*?\);?/g,
];

async function deleteFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️ Deleted directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Deleted file: ${filePath}`);
      }
      return true;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message);
  }
  return false;
}

async function cleanConsoleLogsInFile(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalLength = content.length;
      
      // Remove console.log statements
      consoleLogPatterns.forEach(pattern => {
        content = content.replace(pattern, '');
      });
      
      // Remove empty lines left by console.log removal
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`🧹 Cleaned console.logs in: ${filePath}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
  return false;
}

async function findAndCleanAllFiles() {
  const srcDir = path.resolve(__dirname, 'packages/web/src');
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  function scanDirectory(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...scanDirectory(fullPath));
        } else if (stats.isFile() && extensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
    return files;
  }
  
  if (fs.existsSync(srcDir)) {
    const allFiles = scanDirectory(srcDir);
    console.log(`\n🔍 Found ${allFiles.length} source files to clean...`);
    
    let cleanedCount = 0;
    for (const file of allFiles) {
      const relativePath = path.relative(__dirname, file);
      if (await cleanConsoleLogsInFile(relativePath)) {
        cleanedCount++;
      }
    }
    
    console.log(`✅ Cleaned console.logs in ${cleanedCount} files`);
  }
}

async function cleanLocalStorage() {
  const cleanupScript = `
// Clear all task-related localStorage
const keysToRemove = Object.keys(localStorage).filter(key => 
  key.includes('task') || 
  key.includes('rawTasks') || 
  key.includes('filteredTasks') ||
  key.includes('mockTasks') ||
  key.includes('debugTasks') ||
  key.includes('testTasks') ||
  key.startsWith('user_tasks_') ||
  key.startsWith('personal_plans_')
);

keysToRemove.forEach(key => localStorage.removeItem(key));
console.log('🧹 Cleared', keysToRemove.length, 'localStorage keys');
`;

  const scriptPath = path.resolve(__dirname, 'packages/web/public/cleanup-storage.js');
  fs.writeFileSync(scriptPath, cleanupScript, 'utf8');
  console.log('📝 Created cleanup script: packages/web/public/cleanup-storage.js');
}

async function removeUnusedImports() {
  console.log('\n🔍 Removing unused imports...');
  
  const filesToCheck = [
    'packages/web/src/pages/Tasks.tsx',
    'packages/web/src/components/tasks/TaskManagementView.tsx',
    'packages/web/src/utils/index.ts'
  ];
  
  for (const filePath of filesToCheck) {
    const fullPath = path.resolve(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove unused imports (basic patterns)
      const unusedImports = [
        /import.*mockData.*from.*;\n/g,
        /import.*testUtils.*from.*;\n/g,
        /import.*debugPlans.*from.*;\n/g,
        /import.*ExportDialog.*from.*;\n/g,
        /import.*RefreshButton.*from.*;\n/g,
        /import.*Download.*from.*;\n/g,
      ];
      
      unusedImports.forEach(pattern => {
        content = content.replace(pattern, '');
      });
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`🧹 Cleaned imports in: ${filePath}`);
    }
  }
}

async function main() {
  console.log('\n🗑️ Step 1: Deleting unnecessary files...');
  let deletedCount = 0;
  
  for (const file of filesToDelete) {
    if (await deleteFile(file)) {
      deletedCount++;
    }
  }
  
  console.log(`✅ Deleted ${deletedCount} files/directories`);
  
  console.log('\n🧹 Step 2: Cleaning console.log statements...');
  await findAndCleanAllFiles();
  
  console.log('\n📦 Step 3: Creating localStorage cleanup script...');
  await cleanLocalStorage();
  
  console.log('\n🔧 Step 4: Removing unused imports...');
  await removeUnusedImports();
  
  console.log('\n🎉 CLEANUP COMPLETED!');
  console.log('====================');
  console.log('✅ Deleted debug/test files');
  console.log('✅ Cleaned console.log statements');
  console.log('✅ Removed mock data files');
  console.log('✅ Cleaned unused imports');
  console.log('✅ Created localStorage cleanup script');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Run: git add . && git commit -m "🧹 Comprehensive cleanup"');
  console.log('2. Open browser console and run: cleanup-storage.js');
  console.log('3. Refresh your app to see clean codebase');
}

main().catch(console.error);
