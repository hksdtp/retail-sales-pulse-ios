#!/usr/bin/env node

// MCP Interactive Mode - Simple CLI để tương tác với MCP servers
import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPInteractive {
  constructor() {
    this.servers = {
      'aug': {
        name: 'Augment MCP',
        command: 'node',
        args: [join(__dirname, 'mcp-servers/augment-mcp.js')],
        description: 'Augment codebase context và retrieval'
      },
      'plw': {
        name: 'Playwright MCP', 
        command: 'node',
        args: [join(__dirname, 'mcp-servers/playwright-mcp.js')],
        description: 'Playwright testing và automation'
      }
    };
    
    this.activeServer = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  showWelcome() {
    console.log('\n🚀 MCP Interactive Mode');
    console.log('========================');
    console.log('Available servers:');
    Object.entries(this.servers).forEach(([key, server]) => {
      console.log(`  ${key}: ${server.name} - ${server.description}`);
    });
    console.log('\nCommands:');
    console.log('  start <server>  - Start MCP server (aug/plw)');
    console.log('  stop           - Stop current server');
    console.log('  status         - Show server status');
    console.log('  help           - Show this help');
    console.log('  exit           - Exit interactive mode');
    console.log('');
  }

  async startServer(serverKey) {
    if (this.activeServer) {
      console.log('⚠️  Server already running. Stop it first.');
      return;
    }

    const server = this.servers[serverKey];
    if (!server) {
      console.log(`❌ Unknown server: ${serverKey}`);
      return;
    }

    console.log(`🔄 Starting ${server.name}...`);
    
    try {
      this.activeServer = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: __dirname
      });

      this.activeServer.stdout.on('data', (data) => {
        console.log(`📤 ${server.name}: ${data.toString().trim()}`);
      });

      this.activeServer.stderr.on('data', (data) => {
        console.log(`🔴 ${server.name} Error: ${data.toString().trim()}`);
      });

      this.activeServer.on('close', (code) => {
        console.log(`🔴 ${server.name} exited with code ${code}`);
        this.activeServer = null;
      });

      this.activeServer.on('error', (error) => {
        console.log(`❌ Failed to start ${server.name}: ${error.message}`);
        this.activeServer = null;
      });

      // Wait a bit to see if it starts successfully
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.activeServer) {
        console.log(`✅ ${server.name} started successfully`);
        console.log(`📡 Server listening on stdio`);
      }
    } catch (error) {
      console.log(`❌ Error starting server: ${error.message}`);
    }
  }

  stopServer() {
    if (!this.activeServer) {
      console.log('⚠️  No server running');
      return;
    }

    console.log('🔄 Stopping server...');
    this.activeServer.kill();
    this.activeServer = null;
    console.log('✅ Server stopped');
  }

  showStatus() {
    if (this.activeServer) {
      console.log('✅ Server Status: Running');
      console.log(`📡 PID: ${this.activeServer.pid}`);
    } else {
      console.log('⚠️  Server Status: Not running');
    }
  }

  showHelp() {
    console.log('\n📖 MCP Interactive Help');
    console.log('========================');
    console.log('Commands:');
    console.log('  start aug      - Start Augment MCP server');
    console.log('  start plw      - Start Playwright MCP server');
    console.log('  stop           - Stop current server');
    console.log('  status         - Show server status');
    console.log('  send <message> - Send JSON-RPC message to server');
    console.log('  help           - Show this help');
    console.log('  exit           - Exit interactive mode');
    console.log('');
    console.log('Examples:');
    console.log('  start aug');
    console.log('  send {"jsonrpc":"2.0","id":1,"method":"tools/list"}');
    console.log('  stop');
    console.log('');
  }

  async sendMessage(message) {
    if (!this.activeServer) {
      console.log('⚠️  No server running. Start a server first.');
      return;
    }

    try {
      const jsonMessage = JSON.parse(message);
      this.activeServer.stdin.write(JSON.stringify(jsonMessage) + '\n');
      console.log('📤 Message sent to server');
    } catch (error) {
      console.log(`❌ Invalid JSON: ${error.message}`);
    }
  }

  async processCommand(input) {
    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'start':
        if (args.length === 0) {
          console.log('⚠️  Usage: start <server> (aug/plw)');
        } else {
          await this.startServer(args[0]);
        }
        break;
      
      case 'stop':
        this.stopServer();
        break;
      
      case 'status':
        this.showStatus();
        break;
      
      case 'send':
        if (args.length === 0) {
          console.log('⚠️  Usage: send <json-message>');
        } else {
          await this.sendMessage(args.join(' '));
        }
        break;
      
      case 'help':
        this.showHelp();
        break;
      
      case 'exit':
      case 'quit':
        this.exit();
        break;
      
      default:
        console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
    }
  }

  async start() {
    this.showWelcome();
    
    const prompt = () => {
      this.rl.question('mcp> ', async (input) => {
        if (input.trim()) {
          await this.processCommand(input);
        }
        prompt();
      });
    };
    
    prompt();
  }

  exit() {
    console.log('\n👋 Goodbye!');
    if (this.activeServer) {
      this.activeServer.kill();
    }
    this.rl.close();
    process.exit(0);
  }
}

// Start interactive mode
const mcp = new MCPInteractive();
mcp.start().catch(console.error);

// Handle Ctrl+C
process.on('SIGINT', () => {
  mcp.exit();
});
