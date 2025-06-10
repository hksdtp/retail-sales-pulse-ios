#!/usr/bin/env node

import http from 'http';

console.log('🧪 Kiểm tra MCP Server...');

// Test kết nối đến MCP server
function testMCPConnection() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/sse', (res) => {
      console.log('✅ MCP Server đang chạy');
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        console.log('📨 Received data:', chunk.toString());
      });
      
      res.on('end', () => {
        console.log('✅ Kết nối MCP thành công');
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Lỗi kết nối MCP:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout - nhưng đây là bình thường cho SSE endpoint');
      req.destroy();
      resolve('timeout');
    });
  });
}

// Test health check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/', (res) => {
      console.log(`🏥 Health check status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('🏥 Health check response:', data || 'No response body');
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Health check failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ Health check timeout');
      req.destroy();
      resolve('timeout');
    });
  });
}

// Main test function
async function runTests() {
  try {
    console.log('🔍 Bắt đầu kiểm tra MCP Server...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Kiểm tra health endpoint...');
    await testHealthCheck();
    console.log('');
    
    // Test 2: SSE endpoint
    console.log('2️⃣ Kiểm tra SSE endpoint...');
    await testMCPConnection();
    console.log('');
    
    console.log('🎉 Tất cả test đã hoàn thành!');
    console.log('');
    console.log('📋 Thông tin MCP Server:');
    console.log('   🌐 URL: http://localhost:3001');
    console.log('   📊 SSE: http://localhost:3001/sse');
    console.log('   🔗 MCP: http://localhost:3001/mcp');
    console.log('');
    console.log('💡 Để sử dụng trong client, thêm cấu hình:');
    console.log(JSON.stringify({
      mcpServers: {
        playwright: {
          url: "http://localhost:3001/sse"
        }
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Test thất bại:', error);
    process.exit(1);
  }
}

// Chạy tests
runTests();
