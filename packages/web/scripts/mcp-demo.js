#!/usr/bin/env node

/**
 * MCP Demo - Interactive demonstration of MCP features
 */

import { createInterface } from 'readline';
import http from 'http';

class MCPDemo {
  constructor() {
    this.servers = {
      playwright: { name: 'Playwright MCP', port: 3001, status: 'unknown' },
      augment: { name: 'Augment MCP', port: 3002, status: 'unknown' }
    };
  }

  async checkServer(port) {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        method: 'GET',
        timeout: 2000
      }, (res) => {
        resolve(true);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.end();
    });
  }

  async updateStatus() {
    for (const [name, server] of Object.entries(this.servers)) {
      const isRunning = await this.checkServer(server.port);
      server.status = isRunning ? 'running' : 'stopped';
    }
  }

  displayStatus() {
    console.log('\n📊 MCP Servers Status:');
    console.log('┌─────────────────┬──────┬───────────┬─────────────────────────┐');
    console.log('│ Server          │ Port │ Status    │ URL                     │');
    console.log('├─────────────────┼──────┼───────────┼─────────────────────────┤');
    
    for (const [name, server] of Object.entries(this.servers)) {
      const statusIcon = server.status === 'running' ? '🟢' : '🔴';
      const status = server.status === 'running' ? 'Running' : 'Stopped';
      const url = `http://localhost:${server.port}`;
      
      console.log(`│ ${server.name.padEnd(15)} │ ${server.port} │ ${statusIcon} ${status.padEnd(7)} │ ${url.padEnd(23)} │`);
    }
    
    console.log('└─────────────────┴──────┴───────────┴─────────────────────────┘');
  }

  async showMenu() {
    console.log('\n🎛️ MCP Manager - Interactive Mode');
    console.log('═══════════════════════════════════════');
    console.log('1. 🎭 Start Playwright MCP (Testing)');
    console.log('2. 🚀 Start Augment MCP (AI Features)');
    console.log('3. 🎯 Start Both Servers');
    console.log('4. 🛑 Stop All Servers');
    console.log('5. 📊 Check Status');
    console.log('6. 🧪 Test Servers');
    console.log('7. 📚 Show Documentation');
    console.log('8. 🚪 Exit');
    console.log('═══════════════════════════════════════');
  }

  async startPlaywright() {
    console.log('\n🎭 Starting Playwright MCP Server...');
    console.log('Command: npx @playwright/mcp --port 3001 --host localhost');
    console.log('Features: Browser automation, UI testing, E2E testing');
    console.log('URL: http://localhost:3001');
    console.log('SSE: http://localhost:3001/sse');
    console.log('\n💡 To actually start: npm run mcp:server');
  }

  async startAugment() {
    console.log('\n🚀 Starting Augment MCP Server...');
    console.log('Command: node scripts/augment-mcp-server.js');
    console.log('Features: Code analysis, Task management, Component generation');
    console.log('URL: http://localhost:3002');
    console.log('SSE: http://localhost:3002/sse');
    console.log('\n💡 To actually start: npm run augment:start');
  }

  async startBoth() {
    console.log('\n🎯 Starting Both MCP Servers...');
    await this.startPlaywright();
    await this.startAugment();
    console.log('\n💡 To actually start both: npm run mcp:all');
  }

  async stopAll() {
    console.log('\n🛑 Stopping All MCP Servers...');
    console.log('Killing processes on ports 3001 and 3002...');
    console.log('\n💡 To actually stop: npm run mcp:stop-smart');
  }

  async testServers() {
    console.log('\n🧪 Testing MCP Servers...');
    await this.updateStatus();
    
    for (const [name, server] of Object.entries(this.servers)) {
      console.log(`\nTesting ${server.name}...`);
      const isRunning = await this.checkServer(server.port);
      
      if (isRunning) {
        console.log(`✅ ${server.name} is responding on port ${server.port}`);
      } else {
        console.log(`❌ ${server.name} is not running on port ${server.port}`);
      }
    }
    
    console.log('\n💡 To run comprehensive tests: npm run mcp:test-all');
  }

  showDocumentation() {
    console.log('\n📚 MCP Documentation & Commands:');
    console.log('═══════════════════════════════════════');
    console.log('\n🎭 Playwright MCP:');
    console.log('  Start: npm run mcp:server');
    console.log('  Test:  npm run mcp:test');
    console.log('  URL:   http://localhost:3001');
    
    console.log('\n🚀 Augment MCP:');
    console.log('  Start: npm run augment:start');
    console.log('  Test:  npm run augment:test');
    console.log('  URL:   http://localhost:3002');
    
    console.log('\n🎯 Combined Commands:');
    console.log('  Start Both: npm run mcp:all');
    console.log('  Test All:   npm run mcp:test-all');
    console.log('  Status:     npm run mcp:status-smart');
    
    console.log('\n📁 Configuration Files:');
    console.log('  mcp-config.json       - MCP configuration');
    console.log('  .vscode/tasks.json    - VSCode tasks');
    console.log('  .vscode/launch.json   - Debug configs');
    
    console.log('\n📖 Documentation:');
    console.log('  MCP-VSCODE-SETUP.md   - VSCode integration guide');
    console.log('  AUGMENT-MCP-README.md - Augment MCP features');
    console.log('  MCP-COMPLETE-SETUP.md - Complete setup guide');
  }

  async run() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('🎉 Welcome to MCP Manager Demo!');
    console.log('This is a demonstration of MCP server management capabilities.');
    
    // Initial status check
    await this.updateStatus();
    this.displayStatus();

    while (true) {
      await this.showMenu();
      const choice = await question('\n👉 Enter your choice (1-8): ');

      switch (choice.trim()) {
        case '1':
          await this.startPlaywright();
          break;
        case '2':
          await this.startAugment();
          break;
        case '3':
          await this.startBoth();
          break;
        case '4':
          await this.stopAll();
          break;
        case '5':
          await this.updateStatus();
          this.displayStatus();
          break;
        case '6':
          await this.testServers();
          break;
        case '7':
          this.showDocumentation();
          break;
        case '8':
          console.log('\n👋 Thank you for using MCP Manager!');
          console.log('💡 Remember: Use npm run commands to actually control servers');
          rl.close();
          return;
        default:
          console.log('\n❌ Invalid choice. Please enter 1-8.');
      }

      // Pause before showing menu again
      await question('\n⏸️  Press Enter to continue...');
    }
  }
}

// Run demo if script is executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  const demo = new MCPDemo();
  demo.run().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export default MCPDemo;
