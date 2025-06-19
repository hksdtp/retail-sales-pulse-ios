#!/usr/bin/env node

/**
 * Dashboard Performance Check Script
 * Kiểm tra performance của dashboard components theo tiêu chuẩn iOS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds theo tiêu chuẩn iOS
const PERFORMANCE_THRESHOLDS = {
  bundleSize: 200 * 1024, // 200KB
  cssSize: 50 * 1024,     // 50KB
  animationDuration: 500,  // 500ms max
  targetFPS: 60,
  frameTime: 16.67,       // 1000/60 ms
};

// iOS Design System requirements
const IOS_REQUIREMENTS = {
  colors: [
    'ios-blue', 'ios-green', 'ios-orange', 'ios-purple', 'ios-red'
  ],
  spacing: [
    'ios-1', 'ios-2', 'ios-3', 'ios-4', 'ios-5', 'ios-6'
  ],
  typography: [
    'ios-title-1', 'ios-title-2', 'ios-title-3', 
    'ios-headline', 'ios-body', 'ios-caption-1'
  ],
  animations: [
    'ios-bounce', 'ios-fade-in', 'ios-slide-up'
  ],
  components: [
    'ios-card', 'ios-button-primary', 'ios-vibrancy-light'
  ]
};

class PerformanceChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(type, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message, details };
    
    this.results.details.push(logEntry);
    
    const colors = {
      pass: '\x1b[32m✅',
      fail: '\x1b[31m❌', 
      warn: '\x1b[33m⚠️',
      info: '\x1b[36mℹ️'
    };
    
    console.log(`${colors[type]} ${message}\x1b[0m`);
    if (details) {
      console.log(`   ${JSON.stringify(details, null, 2)}`);
    }
  }

  pass(message, details) {
    this.results.passed++;
    this.log('pass', message, details);
  }

  fail(message, details) {
    this.results.failed++;
    this.log('fail', message, details);
  }

  warn(message, details) {
    this.results.warnings++;
    this.log('warn', message, details);
  }

  info(message, details) {
    this.log('info', message, details);
  }

  // Kiểm tra file sizes
  checkBundleSize() {
    this.info('🔍 Checking bundle sizes...');
    
    const distPath = path.join(__dirname, '../dist');
    if (!fs.existsSync(distPath)) {
      this.warn('Dist folder not found. Run build first.');
      return;
    }

    try {
      const files = fs.readdirSync(distPath, { recursive: true });
      let totalSize = 0;
      let cssSize = 0;

      files.forEach(file => {
        const filePath = path.join(distPath, file);
        if (fs.statSync(filePath).isFile()) {
          const size = fs.statSync(filePath).size;
          totalSize += size;
          
          if (file.endsWith('.css')) {
            cssSize += size;
          }
        }
      });

      if (totalSize <= PERFORMANCE_THRESHOLDS.bundleSize) {
        this.pass(`Bundle size: ${(totalSize / 1024).toFixed(2)}KB (under ${PERFORMANCE_THRESHOLDS.bundleSize / 1024}KB)`);
      } else {
        this.fail(`Bundle size: ${(totalSize / 1024).toFixed(2)}KB (exceeds ${PERFORMANCE_THRESHOLDS.bundleSize / 1024}KB)`);
      }

      if (cssSize <= PERFORMANCE_THRESHOLDS.cssSize) {
        this.pass(`CSS size: ${(cssSize / 1024).toFixed(2)}KB (under ${PERFORMANCE_THRESHOLDS.cssSize / 1024}KB)`);
      } else {
        this.fail(`CSS size: ${(cssSize / 1024).toFixed(2)}KB (exceeds ${PERFORMANCE_THRESHOLDS.cssSize / 1024}KB)`);
      }

    } catch (error) {
      this.fail('Error checking bundle size', error.message);
    }
  }

  // Kiểm tra iOS Design System implementation
  checkIOSDesignSystem() {
    this.info('🎨 Checking iOS Design System implementation...');
    
    const cssFile = path.join(__dirname, '../src/styles/ios-design-system.css');
    
    if (!fs.existsSync(cssFile)) {
      this.fail('iOS Design System CSS file not found');
      return;
    }

    try {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      
      // Check for iOS colors
      IOS_REQUIREMENTS.colors.forEach(color => {
        if (cssContent.includes(`--${color}:`)) {
          this.pass(`iOS color variable found: ${color}`);
        } else {
          this.fail(`iOS color variable missing: ${color}`);
        }
      });

      // Check for iOS spacing
      IOS_REQUIREMENTS.spacing.forEach(spacing => {
        if (cssContent.includes(`--ios-spacing-${spacing.split('-')[1]}:`)) {
          this.pass(`iOS spacing found: ${spacing}`);
        } else {
          this.fail(`iOS spacing missing: ${spacing}`);
        }
      });

      // Check for iOS components
      IOS_REQUIREMENTS.components.forEach(component => {
        if (cssContent.includes(`.${component}`)) {
          this.pass(`iOS component class found: ${component}`);
        } else {
          this.fail(`iOS component class missing: ${component}`);
        }
      });

    } catch (error) {
      this.fail('Error reading iOS Design System CSS', error.message);
    }
  }

  // Kiểm tra component implementation
  checkComponentImplementation() {
    this.info('🧩 Checking component implementation...');
    
    const componentsToCheck = [
      '../src/components/dashboard/KpiCard.tsx',
      '../src/components/dashboard/KpiDashboard.tsx'
    ];

    componentsToCheck.forEach(componentPath => {
      const fullPath = path.join(__dirname, componentPath);
      
      if (!fs.existsSync(fullPath)) {
        this.fail(`Component not found: ${componentPath}`);
        return;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for SF Symbol usage
        if (content.includes('SFSymbol') || content.includes('sf-symbol')) {
          this.pass(`SF Symbol implementation found in ${path.basename(componentPath)}`);
        } else {
          this.warn(`SF Symbol implementation not found in ${path.basename(componentPath)}`);
        }

        // Check for iOS classes
        const iosClassCount = (content.match(/ios-\w+/g) || []).length;
        if (iosClassCount > 0) {
          this.pass(`iOS classes found in ${path.basename(componentPath)}: ${iosClassCount} instances`);
        } else {
          this.fail(`No iOS classes found in ${path.basename(componentPath)}`);
        }

        // Check for performance optimizations
        if (content.includes('translateZ(0)') || content.includes('will-change')) {
          this.pass(`Hardware acceleration found in ${path.basename(componentPath)}`);
        } else {
          this.warn(`Hardware acceleration not found in ${path.basename(componentPath)}`);
        }

      } catch (error) {
        this.fail(`Error reading component: ${componentPath}`, error.message);
      }
    });
  }

  // Kiểm tra animation performance
  checkAnimationPerformance() {
    this.info('🎬 Checking animation performance...');
    
    const tailwindConfig = path.join(__dirname, '../tailwind.config.ts');
    
    if (!fs.existsSync(tailwindConfig)) {
      this.fail('Tailwind config not found');
      return;
    }

    try {
      const content = fs.readFileSync(tailwindConfig, 'utf8');
      
      // Check for iOS animation timing
      if (content.includes('cubic-bezier(0.25, 0.46, 0.45, 0.94)')) {
        this.pass('iOS animation timing found in Tailwind config');
      } else {
        this.fail('iOS animation timing not found in Tailwind config');
      }

      // Check for animation duration limits
      const durationMatches = content.match(/duration.*?(\d+(?:\.\d+)?)/g) || [];
      let longAnimations = 0;
      
      durationMatches.forEach(match => {
        const duration = parseFloat(match.match(/(\d+(?:\.\d+)?)/)[1]);
        if (duration > PERFORMANCE_THRESHOLDS.animationDuration) {
          longAnimations++;
        }
      });

      if (longAnimations === 0) {
        this.pass('All animations under 500ms duration limit');
      } else {
        this.warn(`${longAnimations} animations exceed 500ms duration limit`);
      }

    } catch (error) {
      this.fail('Error checking animation performance', error.message);
    }
  }

  // Kiểm tra accessibility
  checkAccessibility() {
    this.info('♿ Checking accessibility implementation...');
    
    const sfSymbolComponent = path.join(__dirname, '../src/components/ui/sf-symbol.tsx');
    
    if (!fs.existsSync(sfSymbolComponent)) {
      this.fail('SF Symbol component not found');
      return;
    }

    try {
      const content = fs.readFileSync(sfSymbolComponent, 'utf8');
      
      // Check for ARIA labels
      if (content.includes('aria-label')) {
        this.pass('ARIA labels found in SF Symbol component');
      } else {
        this.fail('ARIA labels missing in SF Symbol component');
      }

      // Check for role attributes
      if (content.includes('role="img"')) {
        this.pass('Proper role attributes found in SF Symbol component');
      } else {
        this.warn('Role attributes not found in SF Symbol component');
      }

    } catch (error) {
      this.fail('Error checking accessibility', error.message);
    }
  }

  // Chạy tất cả checks
  async runAllChecks() {
    console.log('🚀 Starting Dashboard Performance Check...\n');
    
    this.checkIOSDesignSystem();
    this.checkComponentImplementation();
    this.checkAnimationPerformance();
    this.checkAccessibility();
    this.checkBundleSize();
    
    console.log('\n📊 Performance Check Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    const totalChecks = this.results.passed + this.results.failed;
    const successRate = totalChecks > 0 ? (this.results.passed / totalChecks * 100).toFixed(1) : 0;
    
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All critical checks passed! Dashboard is optimized for iOS standards.');
    } else {
      console.log('\n🔧 Some checks failed. Please review the issues above.');
    }
    
    // Save results to file
    const resultsFile = path.join(__dirname, '../performance-check-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    
    return this.results.failed === 0;
  }
}

// Run the performance check
const checker = new PerformanceChecker();
checker.runAllChecks().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error running performance check:', error);
  process.exit(1);
});

export default PerformanceChecker;
