#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🚀 Khởi động MCP Server Playwright...');

// Cấu hình MCP server với timeout và retry
const config = {
  port: 3001,
  host: '0.0.0.0', // Bind tất cả interfaces
  headless: true,
  capabilities: ['tabs', 'pdf', 'history', 'wait', 'files'],
  outputDir: './test-results',
  saveTrace: true,
  timeout: 30000, // 30 giây timeout
  retries: 3
};

// Tạo thư mục output nếu chưa có
const outputDir = path.resolve(config.outputDir);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Đã tạo thư mục output: ${outputDir}`);
}

// Kiểm tra port có sẵn không
function checkPort(port, host) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

// Xây dựng lệnh khởi động
const args = [
  '@playwright/mcp',
  '--port', config.port.toString(),
  '--host', config.host,
  '--caps', config.capabilities.join(','),
  '--output-dir', config.outputDir,
  '--save-trace',
  '--no-sandbox' // Thêm để tránh sandbox issues
];

if (config.headless) {
  args.push('--headless');
}

console.log(`🔧 Lệnh khởi động: npx ${args.join(' ')}`);

// Khởi động MCP server với retry logic
async function startMCPServer(attempt = 1) {
  console.log(`🔄 Thử khởi động lần ${attempt}/${config.retries}...`);

  // Kiểm tra port trước khi khởi động
  const portAvailable = await checkPort(config.port, config.host);
  if (!portAvailable && attempt === 1) {
    console.log(`⚠️  Port ${config.port} đang được sử dụng, thử dừng process cũ...`);
    // Có thể thêm logic kill process cũ ở đây
  }

  const mcpServer = spawn('npx', args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  return mcpServer;
}

// Main function để khởi động server
async function main() {
  try {
    const mcpServer = await startMCPServer();

    // Xử lý output
    mcpServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);

      // Kiểm tra server đã sẵn sàng
      if (output.includes('Listening on')) {
        console.log('✅ MCP Server đã khởi động thành công!');
        console.log(`🌐 Server URL: http://${config.host}:${config.port}`);
        console.log(`📊 SSE Endpoint: http://localhost:${config.port}/sse`);
        console.log(`🔗 MCP Endpoint: http://localhost:${config.port}/mcp`);

        // Cập nhật file cấu hình
        updateConfig('running');
      }
    });

    mcpServer.stderr.on('data', (data) => {
      console.error('⚠️ MCP Server stderr:', data.toString());
    });

    mcpServer.on('error', (error) => {
      console.error('❌ Lỗi khi khởi động MCP Server:', error);
      process.exit(1);
    });

    mcpServer.on('exit', (code) => {
      console.log(`🔚 MCP Server đã dừng với mã: ${code}`);
      updateConfig('stopped');
    });

    // Xử lý tín hiệu dừng
    process.on('SIGINT', () => {
      console.log('\n🛑 Đang dừng MCP Server...');
      mcpServer.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Đang dừng MCP Server...');
      mcpServer.kill('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Không thể khởi động MCP Server:', error);
    process.exit(1);
  }
}

// Hàm cập nhật cấu hình
function updateConfig(status) {
  const configPath = path.resolve('./mcp-config.json');
  const mcpConfig = {
    mcpServers: {
      playwright: {
        url: `http://localhost:${config.port}/sse`,
        description: "Playwright MCP Server for automated testing",
        capabilities: config.capabilities,
        config: config
      }
    },
    endpoints: {
      sse: `http://localhost:${config.port}/sse`,
      mcp: `http://localhost:${config.port}/mcp`,
      traceViewer: "http://localhost:49997/trace/index.html?trace=test-results/traces/trace.json"
    },
    status: status,
    startedAt: status === 'running' ? new Date().toISOString() : undefined,
    stoppedAt: status === 'stopped' ? new Date().toISOString() : undefined
  };

  fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
  console.log(`💾 Đã cập nhật cấu hình: ${configPath}`);
}

// Khởi động main function
main();
