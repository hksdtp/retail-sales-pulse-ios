#!/usr/bin/env node

/**
 * MCP Manager - Smart MCP Server Management
 * Handles starting, stopping, and monitoring MCP servers
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

class MCPManager {
  constructor() {
    this.servers = {
      playwright: {
        name: 'Playwright MCP',
        port: 3001,
        command: 'npx',
        args: ['@playwright/mcp', '--port', '3001', '--host', 'localhost', '--headless', '--caps', 'tabs,wait,files', '--output-dir', './test-results'],
        process: null,
        status: 'stopped'
      },
      augment: {
        name: 'Augment MCP',
        port: 3002,
        command: 'node',
        args: ['scripts/augment-mcp-server.js'],
        process: null,
        status: 'stopped'
      }
    };
    
    this.autoStart = process.env.MCP_AUTO_START?.split(',') || ['augment'];
  }

  async checkPort(port) {
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

  async startServer(serverName) {
    const server = this.servers[serverName];
    if (!server) {
      console.error(`❌ Unknown server: ${serverName}`);
      return false;
    }

    if (server.status === 'running') {
      console.log(`✅ ${server.name} is already running`);
      return true;
    }

    // Check if port is already in use
    const portInUse = await this.checkPort(server.port);
    if (portInUse) {
      console.log(`⚠️ Port ${server.port} is already in use, assuming ${server.name} is running`);
      server.status = 'running';
      return true;
    }

    console.log(`🚀 Starting ${server.name} on port ${server.port}...`);
    
    try {
      server.process = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'development',
          AUGMENT_MCP_PORT: '3002',
          AUGMENT_MCP_HOST: 'localhost'
        }
      });

      server.process.stdout.on('data', (data) => {
        console.log(`[${server.name}] ${data.toString().trim()}`);
      });

      server.process.stderr.on('data', (data) => {
        console.log(`[${server.name}] ${data.toString().trim()}`);
      });

      server.process.on('close', (code) => {
        console.log(`[${server.name}] Process exited with code ${code}`);
        server.status = 'stopped';
        server.process = null;
      });

      server.process.on('error', (error) => {
        console.error(`[${server.name}] Error: ${error.message}`);
        server.status = 'error';
      });

      // Wait a bit and check if server started successfully
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isRunning = await this.checkPort(server.port);
      if (isRunning) {
        server.status = 'running';
        console.log(`✅ ${server.name} started successfully on port ${server.port}`);
        return true;
      } else {
        server.status = 'error';
        console.error(`❌ ${server.name} failed to start on port ${server.port}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to start ${server.name}: ${error.message}`);
      server.status = 'error';
      return false;
    }
  }

  async stopServer(serverName) {
    const server = this.servers[serverName];
    if (!server) {
      console.error(`❌ Unknown server: ${serverName}`);
      return false;
    }

    if (server.status === 'stopped') {
      console.log(`✅ ${server.name} is already stopped`);
      return true;
    }

    console.log(`🛑 Stopping ${server.name}...`);
    
    if (server.process) {
      server.process.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (server.process && !server.process.killed) {
        server.process.kill('SIGKILL');
      }
    }

    // Also try to kill by port
    try {
      await execAsync(`lsof -ti:${server.port} | xargs kill -9`);
    } catch (error) {
      // Ignore errors - port might not be in use
    }

    server.status = 'stopped';
    server.process = null;
    console.log(`✅ ${server.name} stopped`);
    return true;
  }

  async restartServer(serverName) {
    await this.stopServer(serverName);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.startServer(serverName);
  }

  async getStatus() {
    const status = {};
    
    for (const [name, server] of Object.entries(this.servers)) {
      const isRunning = await this.checkPort(server.port);
      status[name] = {
        name: server.name,
        port: server.port,
        status: isRunning ? 'running' : 'stopped',
        url: `http://localhost:${server.port}`
      };
    }
    
    return status;
  }

  async startAll() {
    console.log('🚀 Starting all MCP servers...');
    const results = [];
    
    for (const serverName of Object.keys(this.servers)) {
      const result = await this.startServer(serverName);
      results.push({ server: serverName, success: result });
    }
    
    return results;
  }

  async stopAll() {
    console.log('🛑 Stopping all MCP servers...');
    const results = [];
    
    for (const serverName of Object.keys(this.servers)) {
      const result = await this.stopServer(serverName);
      results.push({ server: serverName, success: result });
    }
    
    return results;
  }

  async autoStartServers() {
    console.log(`🔄 Auto-starting servers: ${this.autoStart.join(', ')}`);
    
    for (const serverName of this.autoStart) {
      if (this.servers[serverName]) {
        await this.startServer(serverName);
      }
    }
  }

  async interactive() {
    const { createInterface } = await import('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('\n🎛️ MCP Manager Interactive Mode');
    console.log('Available commands:');
    console.log('  1. Start Playwright MCP');
    console.log('  2. Start Augment MCP');
    console.log('  3. Start Both');
    console.log('  4. Stop All');
    console.log('  5. Status');
    console.log('  6. Exit');

    while (true) {
      const choice = await question('\nEnter your choice (1-6): ');
      
      switch (choice) {
        case '1':
          await this.startServer('playwright');
          break;
        case '2':
          await this.startServer('augment');
          break;
        case '3':
          await this.startAll();
          break;
        case '4':
          await this.stopAll();
          break;
        case '5':
          const status = await this.getStatus();
          console.table(status);
          break;
        case '6':
          console.log('👋 Goodbye!');
          rl.close();
          return;
        default:
          console.log('❌ Invalid choice');
      }
    }
  }
}

// CLI Interface
const manager = new MCPManager();

const command = process.argv[2];
const serverName = process.argv[3];

switch (command) {
  case 'start':
    if (serverName) {
      manager.startServer(serverName);
    } else {
      manager.autoStartServers();
    }
    break;
    
  case 'stop':
    if (serverName) {
      manager.stopServer(serverName);
    } else {
      manager.stopAll();
    }
    break;
    
  case 'restart':
    if (serverName) {
      manager.restartServer(serverName);
    } else {
      manager.stopAll().then(() => manager.autoStartServers());
    }
    break;
    
  case 'status':
    manager.getStatus().then(status => console.table(status));
    break;
    
  case 'interactive':
  case 'i':
    manager.interactive();
    break;
    
  default:
    console.log(`
🎛️ MCP Manager - Smart MCP Server Management

Usage:
  node scripts/mcp-manager.js <command> [server]

Commands:
  start [server]    Start server(s) (default: auto-start servers)
  stop [server]     Stop server(s) (default: all)
  restart [server]  Restart server(s)
  status           Show server status
  interactive      Interactive mode

Servers:
  playwright       Playwright MCP Server (port 3001)
  augment         Augment MCP Server (port 3002)

Examples:
  node scripts/mcp-manager.js start augment
  node scripts/mcp-manager.js stop
  node scripts/mcp-manager.js status
  node scripts/mcp-manager.js interactive
`);
}

export default MCPManager;
