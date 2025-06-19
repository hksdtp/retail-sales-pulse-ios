#!/usr/bin/env node

/**
 * Playwright Test Server
 * Ninh ơi - Retail Sales Pulse iOS Project
 * 
 * Server wrapper cho Playwright testing với REST API interface
 */

const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

class PlaywrightServer {
  constructor() {
    this.server = null;
    this.runningTests = new Map();
  }

  async start() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    
    this.server.listen(PORT, () => {
      console.log(`🎭 Playwright Test Server running on http://localhost:${PORT}`);
      console.log('📋 Available endpoints:');
      console.log('  GET  /health - Health check');
      console.log('  POST /test - Run Playwright test');
      console.log('  GET  /test/:id - Get test status');
      console.log('  GET  /tests - List all tests');
    });
  }

  async handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const method = req.method;
    const pathname = url.pathname;

    try {
      if (method === 'GET' && pathname === '/health') {
        await this.handleHealth(req, res);
      } else if (method === 'POST' && pathname === '/test') {
        await this.handleRunTest(req, res);
      } else if (method === 'GET' && pathname.startsWith('/test/')) {
        await this.handleGetTest(req, res, pathname);
      } else if (method === 'GET' && pathname === '/tests') {
        await this.handleListTests(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      console.error('Request error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  async handleHealth(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'playwright-server',
      port: PORT,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
  }

  async handleRunTest(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { description, url: testUrl, selector, action = 'click' } = JSON.parse(body || '{}');
        
        if (!description) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Description is required' }));
          return;
        }

        const testId = Date.now().toString();
        const testResult = {
          id: testId,
          description,
          status: 'running',
          startTime: new Date().toISOString(),
          logs: []
        };

        this.runningTests.set(testId, testResult);

        // Run Playwright test asynchronously
        this.runPlaywrightTest(testId, { description, url: testUrl, selector, action });

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          testId,
          message: 'Test started',
          status: 'running'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
  }

  async handleGetTest(req, res, pathname) {
    const testId = pathname.split('/')[2];
    const test = this.runningTests.get(testId);
    
    if (!test) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Test not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(test));
  }

  async handleListTests(req, res) {
    const tests = Array.from(this.runningTests.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tests }));
  }

  async runPlaywrightTest(testId, { description, url, selector, action }) {
    const test = this.runningTests.get(testId);
    
    try {
      test.logs.push(`Starting test: ${description}`);
      
      // Generate Playwright test code
      const testCode = this.generateTestCode({ description, url, selector, action });
      const testFile = path.join(__dirname, `../temp/test-${testId}.spec.js`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(testFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write test file
      fs.writeFileSync(testFile, testCode);
      test.logs.push(`Test file created: ${testFile}`);
      
      // Run Playwright
      const playwrightProcess = spawn('npx', ['playwright', 'test', testFile], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });

      let output = '';
      playwrightProcess.stdout.on('data', (data) => {
        const log = data.toString();
        output += log;
        test.logs.push(log.trim());
      });

      playwrightProcess.stderr.on('data', (data) => {
        const log = data.toString();
        output += log;
        test.logs.push(`ERROR: ${log.trim()}`);
      });

      playwrightProcess.on('close', (code) => {
        test.status = code === 0 ? 'passed' : 'failed';
        test.endTime = new Date().toISOString();
        test.exitCode = code;
        test.output = output;
        
        // Clean up test file
        try {
          fs.unlinkSync(testFile);
        } catch (e) {
          // Ignore cleanup errors
        }
        
        test.logs.push(`Test completed with exit code: ${code}`);
      });

    } catch (error) {
      test.status = 'error';
      test.error = error.message;
      test.endTime = new Date().toISOString();
      test.logs.push(`ERROR: ${error.message}`);
    }
  }

  generateTestCode({ description, url, selector, action }) {
    return `
const { test, expect } = require('@playwright/test');

test('${description}', async ({ page }) => {
  ${url ? `await page.goto('${url}');` : '// No URL specified'}
  
  ${selector ? `
  const element = page.locator('${selector}');
  await expect(element).toBeVisible();
  
  ${action === 'click' ? `await element.click();` : ''}
  ${action === 'fill' ? `await element.fill('test value');` : ''}
  ${action === 'hover' ? `await element.hover();` : ''}
  ` : '// No selector specified'}
  
  // Take screenshot
  await page.screenshot({ path: 'temp/test-screenshot-${Date.now()}.png' });
});
`;
  }
}

// Start server
const server = new PlaywrightServer();
server.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Playwright server...');
  process.exit(0);
});
