#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AugmentMCP {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.setupStdio();
  }

  setupStdio() {
    // Setup MCP protocol over stdio
    process.stdin.setEncoding('utf8');
    // Note: process.stdout.setEncoding is not available in Bun, but stdout is already UTF-8 by default
    
    let buffer = '';
    
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      
      // Process complete messages (assuming JSON-RPC format)
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      }
    });
  }

  async handleMessage(message) {
    try {
      if (message.method === 'codebase/analyze') {
        const result = await this.analyzeCodebase(message.params);
        this.sendResponse(message.id, result);
      } else if (message.method === 'codebase/search') {
        const result = await this.searchCodebase(message.params);
        this.sendResponse(message.id, result);
      } else if (message.method === 'file/read') {
        const result = await this.readFile(message.params);
        this.sendResponse(message.id, result);
      } else if (message.method === 'employees/analyze') {
        const result = await this.analyzeEmployeesMenu();
        this.sendResponse(message.id, result);
      } else {
        this.sendError(message.id, 'Method not found');
      }
    } catch (error) {
      this.sendError(message.id, error.message);
    }
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  sendError(id, error) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: { code: -1, message: error }
    };
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  async analyzeEmployeesMenu() {
    try {
      // Tìm và phân tích các file liên quan đến menu nhân viên
      const employeeFiles = await this.findEmployeeRelatedFiles();
      const analysis = {
        files: employeeFiles,
        issues: [],
        recommendations: []
      };

      // Phân tích từng file
      for (const file of employeeFiles) {
        const content = await this.readFileContent(file);
        const fileAnalysis = this.analyzeEmployeeFile(file, content);
        analysis.issues.push(...fileAnalysis.issues);
        analysis.recommendations.push(...fileAnalysis.recommendations);
      }

      return analysis;
    } catch (error) {
      throw new Error(`Error analyzing employees menu: ${error.message}`);
    }
  }

  async findEmployeeRelatedFiles() {
    const files = [];
    const searchPaths = [
      'packages/web/src/pages/Employees.tsx',
      'packages/web/src/components/employees',
      'packages/web/src/services/mockAuth.ts',
      'packages/web/src/context/AuthContext.tsx'
    ];

    for (const searchPath of searchPaths) {
      const fullPath = path.join(this.projectRoot, searchPath);
      if (await this.fileExists(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          const dirFiles = await this.getFilesInDirectory(fullPath);
          files.push(...dirFiles);
        } else {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  analyzeEmployeeFile(filePath, content) {
    const issues = [];
    const recommendations = [];
    const fileName = path.basename(filePath);

    // Phân tích các vấn đề phổ biến
    if (content.includes('mock') || content.includes('Mock')) {
      issues.push({
        file: fileName,
        type: 'mock_data',
        message: 'File contains mock data that should be replaced with real data'
      });
      recommendations.push({
        file: fileName,
        type: 'data_integration',
        message: 'Replace mock data with real API integration or database connection'
      });
    }

    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push({
        file: fileName,
        type: 'incomplete',
        message: 'File contains TODO or FIXME comments indicating incomplete implementation'
      });
    }

    if (!content.includes('interface') && !content.includes('type') && fileName.endsWith('.tsx')) {
      recommendations.push({
        file: fileName,
        type: 'typescript',
        message: 'Consider adding TypeScript interfaces for better type safety'
      });
    }

    if (content.includes('console.log')) {
      issues.push({
        file: fileName,
        type: 'debug_code',
        message: 'File contains console.log statements that should be removed in production'
      });
    }

    // Kiểm tra performance issues
    if (content.includes('useState') && !content.includes('useCallback') && !content.includes('useMemo')) {
      recommendations.push({
        file: fileName,
        type: 'performance',
        message: 'Consider using useCallback or useMemo for performance optimization'
      });
    }

    return { issues, recommendations };
  }

  async analyzeCodebase(params) {
    const { query } = params;
    
    // Tìm kiếm trong codebase
    const results = await this.searchInFiles(query);
    
    return {
      query,
      results: results.slice(0, 10), // Giới hạn 10 kết quả
      total: results.length
    };
  }

  async searchCodebase(params) {
    const { pattern, fileTypes = ['.tsx', '.ts', '.js', '.jsx'] } = params;
    
    const results = [];
    const searchDir = path.join(this.projectRoot, 'packages/web/src');
    
    await this.searchInDirectory(searchDir, pattern, fileTypes, results);
    
    return {
      pattern,
      results: results.slice(0, 20),
      total: results.length
    };
  }

  async searchInDirectory(dir, pattern, fileTypes, results) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          await this.searchInDirectory(fullPath, pattern, fileTypes, results);
        } else if (stat.isFile() && fileTypes.some(ext => item.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            const lines = content.split('\n');
            const matchingLines = lines
              .map((line, index) => ({ line: line.trim(), number: index + 1 }))
              .filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()))
              .slice(0, 3);
            
            results.push({
              file: path.relative(this.projectRoot, fullPath),
              matches: matchingLines
            });
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  async searchInFiles(query) {
    const results = [];
    const searchDir = path.join(this.projectRoot, 'packages/web/src');
    
    await this.searchInDirectory(searchDir, query, ['.tsx', '.ts', '.js', '.jsx'], results);
    
    return results;
  }

  async readFile(params) {
    const { filePath } = params;
    const fullPath = path.join(this.projectRoot, filePath);
    
    if (!await this.fileExists(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      filePath,
      content,
      size: content.length,
      lines: content.split('\n').length
    };
  }

  async readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFilesInDirectory(dirPath) {
    const files = [];
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return files;
  }

  start() {
    console.log('🔍 Augment MCP Server started');
    console.log('📁 Project root:', this.projectRoot);
    console.log('🎯 Ready to analyze codebase');
    
    // Send initial capabilities
    this.sendResponse(null, {
      capabilities: [
        'codebase/analyze',
        'codebase/search', 
        'file/read',
        'employees/analyze'
      ],
      version: '1.0.0'
    });
  }
}

// Start the server
const augmentMCP = new AugmentMCP();
augmentMCP.start();
