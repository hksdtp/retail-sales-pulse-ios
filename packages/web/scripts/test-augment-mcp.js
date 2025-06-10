#!/usr/bin/env node

/**
 * Test script for Augment MCP Server
 * Comprehensive testing of all Augment MCP features
 */

import http from 'http';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class AugmentMCPTester {
  constructor() {
    this.baseUrl = 'http://localhost:3002';
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runAllTests() {
    console.log('🧪 Starting Augment MCP Server Tests...\n');

    await this.testServerHealth();
    await this.testMCPProtocol();
    await this.testCodeAnalysis();
    await this.testTaskManagement();
    await this.testComponentGeneration();
    await this.testPerformanceMonitoring();
    await this.testSessionManagement();

    this.printSummary();
  }

  async testServerHealth() {
    console.log('🏥 Testing Server Health...');
    
    try {
      const response = await this.makeRequest('GET', '/');
      const data = JSON.parse(response);
      
      this.assert(data.name === 'Augment MCP Server', 'Server name correct');
      this.assert(data.status === 'running', 'Server status running');
      this.assert(Array.isArray(data.capabilities), 'Capabilities is array');
      this.assert(data.capabilities.length > 0, 'Has capabilities');
      this.assert(typeof data.uptime === 'number', 'Uptime is number');
      
      console.log(`✅ Server running with ${data.capabilities.length} capabilities`);
    } catch (error) {
      this.assert(false, `Server health check failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testMCPProtocol() {
    console.log('🔌 Testing MCP Protocol...');
    
    try {
      // Test initialize
      const initResponse = await this.makeRequest('POST', '/mcp', {
        method: 'initialize',
        params: {}
      });
      const initData = JSON.parse(initResponse);
      
      this.assert(initData.protocolVersion === '2024-11-05', 'Protocol version correct');
      this.assert(initData.capabilities && initData.capabilities.tools, 'Has tools capability');
      this.assert(initData.serverInfo.name === 'Augment MCP Server', 'Server info correct');
      
      // Test tools list
      const toolsResponse = await this.makeRequest('POST', '/mcp', {
        method: 'tools/list',
        params: {}
      });
      const toolsData = JSON.parse(toolsResponse);
      
      this.assert(Array.isArray(toolsData.tools), 'Tools list is array');
      this.assert(toolsData.tools.length > 0, 'Has tools');
      
      const expectedTools = ['analyze_code', 'manage_tasks', 'generate_component', 'query_database', 'monitor_performance'];
      expectedTools.forEach(toolName => {
        const tool = toolsData.tools.find(t => t.name === toolName);
        this.assert(tool !== undefined, `Tool ${toolName} exists`);
      });
      
      console.log(`✅ MCP Protocol working with ${toolsData.tools.length} tools`);
    } catch (error) {
      this.assert(false, `MCP Protocol test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testCodeAnalysis() {
    console.log('🔍 Testing Code Analysis...');
    
    try {
      const testCode = `function test() {
        console.log("Hello World");
        return true;
      }`;
      
      const response = await this.makeRequest('POST', '/tools/analyze_code', {
        code: testCode,
        language: 'javascript',
        analysis_type: 'all'
      });
      const data = JSON.parse(response);
      
      this.assert(data.success === true, 'Analysis successful');
      this.assert(data.result.language === 'javascript', 'Language correct');
      this.assert(data.result.analysis_type === 'all', 'Analysis type correct');
      this.assert(typeof data.result.metrics === 'object', 'Has metrics');
      this.assert(Array.isArray(data.result.suggestions), 'Has suggestions');
      this.assert(typeof data.result.score === 'number', 'Has score');
      
      console.log(`✅ Code analysis completed with score: ${data.result.score}`);
    } catch (error) {
      this.assert(false, `Code analysis test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testTaskManagement() {
    console.log('📋 Testing Task Management...');
    
    try {
      // Test create task
      const createResponse = await this.makeRequest('POST', '/tools/manage_tasks', {
        action: 'create',
        task_data: {
          title: 'Test Task',
          description: 'Test task description',
          status: 'pending',
          priority: 'high'
        }
      });
      const createData = JSON.parse(createResponse);
      
      this.assert(createData.success === true, 'Task creation successful');
      this.assert(createData.result.action === 'create', 'Create action correct');
      this.assert(typeof createData.result.task_id === 'string', 'Task ID generated');
      
      // Test list tasks
      const listResponse = await this.makeRequest('POST', '/tools/manage_tasks', {
        action: 'list',
        filters: {}
      });
      const listData = JSON.parse(listResponse);
      
      this.assert(listData.success === true, 'Task listing successful');
      this.assert(Array.isArray(listData.result.tasks), 'Tasks is array');
      
      console.log(`✅ Task management working with ${listData.result.tasks.length} sample tasks`);
    } catch (error) {
      this.assert(false, `Task management test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testComponentGeneration() {
    console.log('⚛️ Testing Component Generation...');
    
    try {
      const response = await this.makeRequest('POST', '/tools/generate_component', {
        component_name: 'TestComponent',
        component_type: 'functional',
        styling: 'tailwind',
        props: []
      });
      const data = JSON.parse(response);
      
      this.assert(data.success === true, 'Component generation successful');
      this.assert(data.result.name === 'TestComponent', 'Component name correct');
      this.assert(data.result.type === 'functional', 'Component type correct');
      this.assert(typeof data.result.code === 'string', 'Generated code is string');
      this.assert(data.result.code.includes('TestComponent'), 'Code contains component name');
      
      console.log(`✅ Component generation working - generated ${data.result.code.split('\n').length} lines`);
    } catch (error) {
      this.assert(false, `Component generation test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testPerformanceMonitoring() {
    console.log('📊 Testing Performance Monitoring...');
    
    try {
      const response = await this.makeRequest('POST', '/tools/monitor_performance', {
        metric_type: 'all',
        duration: 5,
        format: 'json'
      });
      const data = JSON.parse(response);
      
      this.assert(data.success === true, 'Performance monitoring successful');
      this.assert(data.result.metric_type === 'all', 'Metric type correct');
      this.assert(typeof data.result.data === 'object', 'Has performance data');
      this.assert(typeof data.result.data.load_time === 'number', 'Has load time');
      this.assert(typeof data.result.data.memory_usage === 'number', 'Has memory usage');
      this.assert(typeof data.result.data.network_requests === 'number', 'Has network requests');
      
      console.log(`✅ Performance monitoring working - Load: ${Math.round(data.result.data.load_time)}ms`);
    } catch (error) {
      this.assert(false, `Performance monitoring test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async testSessionManagement() {
    console.log('🔐 Testing Session Management...');
    
    try {
      // Create session
      const createResponse = await this.makeRequest('POST', '/sessions', {
        client_type: 'test',
        user_agent: 'AugmentMCPTester/1.0'
      });
      const createData = JSON.parse(createResponse);
      
      this.assert(typeof createData.session_id === 'string', 'Session ID created');
      this.assert(createData.session.id === createData.session_id, 'Session ID matches');
      
      const sessionId = createData.session_id;
      
      // Get session
      const getResponse = await this.makeRequest('GET', `/sessions/${sessionId}`);
      const getData = JSON.parse(getResponse);
      
      this.assert(getData.id === sessionId, 'Session retrieved correctly');
      this.assert(Array.isArray(getData.tools_used), 'Tools used is array');
      
      // Delete session
      const deleteResponse = await this.makeRequest('DELETE', `/sessions/${sessionId}`);
      const deleteData = JSON.parse(deleteResponse);
      
      this.assert(deleteData.success === true, 'Session deleted successfully');
      
      console.log(`✅ Session management working - Session ${sessionId.substring(0, 8)}...`);
    } catch (error) {
      this.assert(false, `Session management test failed: ${error.message}`);
    }
    
    console.log('');
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  assert(condition, message) {
    this.totalTests++;
    if (condition) {
      this.passedTests++;
      console.log(`  ✅ ${message}`);
    } else {
      console.log(`  ❌ ${message}`);
    }
    this.testResults.push({ condition, message });
  }

  printSummary() {
    console.log('📊 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 All tests passed! Augment MCP Server is working perfectly!');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the server configuration.');
      process.exit(1);
    }
  }
}

// Run tests if script is executed directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  const tester = new AugmentMCPTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export default AugmentMCPTester;
