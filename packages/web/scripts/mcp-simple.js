#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Khởi động MCP Server (Simple Mode)...');

// Cấu hình đơn giản
const args = [
  '@playwright/mcp',
  '--port', '3001',
  '--host', '0.0.0.0',
  '--headless',
  '--caps', 'tabs,wait,files',
  '--output-dir', './test-results'
];

console.log(`🔧 Lệnh: npx ${args.join(' ')}`);

// Khởi động server
const server = spawn('npx', args, {
  stdio: 'inherit',
  cwd: process.cwd()
});

server.on('error', (error) => {
  console.error('❌ Lỗi:', error);
});

server.on('exit', (code) => {
  console.log(`🔚 Server dừng với mã: ${code}`);
});

// Xử lý Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Đang dừng server...');
  server.kill('SIGINT');
  process.exit(0);
});
