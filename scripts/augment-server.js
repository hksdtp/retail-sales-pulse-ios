#!/usr/bin/env node

/**
 * Augment Code Server
 * Ninh ơi - Retail Sales Pulse iOS Project
 * 
 * Server wrapper cho code analysis và fixing với REST API interface
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3002;

class AugmentServer {
  constructor() {
    this.server = null;
    this.projectRoot = path.join(__dirname, '..');
  }

  async start() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    
    this.server.listen(PORT, () => {
      console.log(`🔧 Augment Code Server running on http://localhost:${PORT}`);
      console.log('📋 Available endpoints:');
      console.log('  GET  /health - Health check');
      console.log('  POST /analyze - Analyze code file');
      console.log('  POST /search - Search codebase');
      console.log('  POST /fix - Fix code issues');
      console.log('  GET  /files - List project files');
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
      } else if (method === 'POST' && pathname === '/analyze') {
        await this.handleAnalyze(req, res);
      } else if (method === 'POST' && pathname === '/search') {
        await this.handleSearch(req, res);
      } else if (method === 'POST' && pathname === '/fix') {
        await this.handleFix(req, res);
      } else if (method === 'GET' && pathname === '/files') {
        await this.handleListFiles(req, res);
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
      service: 'augment-server',
      port: PORT,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      projectRoot: this.projectRoot
    }));
  }

  async handleAnalyze(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { filePath, content } = JSON.parse(body || '{}');
        
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filePath is required' }));
          return;
        }

        const fullPath = path.join(this.projectRoot, filePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }

        // Read file content if not provided
        const fileContent = content || fs.readFileSync(fullPath, 'utf8');
        
        // Basic code analysis
        const analysis = this.analyzeCode(fileContent, filePath);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          filePath,
          analysis
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request: ' + error.message }));
      }
    });
  }

  async handleSearch(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { pattern, fileTypes = ['.js', '.ts', '.tsx', '.jsx'] } = JSON.parse(body || '{}');
        
        if (!pattern) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'pattern is required' }));
          return;
        }

        const results = await this.searchCodebase(pattern, fileTypes);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          pattern,
          results
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request: ' + error.message }));
      }
    });
  }

  async handleFix(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { filePath, issues, description } = JSON.parse(body || '{}');
        
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'filePath is required' }));
          return;
        }

        const suggestions = this.generateFixSuggestions(filePath, issues, description);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          filePath,
          suggestions
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request: ' + error.message }));
      }
    });
  }

  async handleListFiles(req, res) {
    try {
      const files = this.getProjectFiles();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        files,
        count: files.length
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  analyzeCode(content, filePath) {
    const lines = content.split('\n');
    const analysis = {
      lineCount: lines.length,
      fileType: path.extname(filePath),
      issues: [],
      suggestions: [],
      metrics: {}
    };

    // Basic analysis
    analysis.metrics.emptyLines = lines.filter(line => line.trim() === '').length;
    analysis.metrics.commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
    analysis.metrics.codeLines = lines.length - analysis.metrics.emptyLines - analysis.metrics.commentLines;

    // Check for common issues
    if (content.includes('console.log')) {
      analysis.issues.push('Contains console.log statements');
    }
    if (content.includes('TODO') || content.includes('FIXME')) {
      analysis.issues.push('Contains TODO/FIXME comments');
    }
    if (analysis.metrics.codeLines > 300) {
      analysis.suggestions.push('Consider breaking down large file into smaller modules');
    }

    return analysis;
  }

  async searchCodebase(pattern, fileTypes) {
    return new Promise((resolve, reject) => {
      const command = `grep -r "${pattern}" --include="*{${fileTypes.join(',')}}" ${this.projectRoot}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error && error.code !== 1) { // code 1 means no matches found
          reject(error);
          return;
        }

        const results = stdout.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [filePath, ...contentParts] = line.split(':');
            return {
              file: filePath.replace(this.projectRoot + '/', ''),
              content: contentParts.join(':').trim()
            };
          });

        resolve(results);
      });
    });
  }

  generateFixSuggestions(filePath, issues, description) {
    const suggestions = [];
    
    if (issues && issues.includes('console.log')) {
      suggestions.push({
        type: 'remove',
        description: 'Remove console.log statements',
        pattern: 'console.log',
        replacement: '// console.log'
      });
    }

    if (description && description.includes('performance')) {
      suggestions.push({
        type: 'optimize',
        description: 'Consider using React.memo for performance optimization',
        pattern: 'export default function',
        replacement: 'export default React.memo(function'
      });
    }

    return suggestions;
  }

  getProjectFiles() {
    const files = [];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next'];
    
    const scanDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (excludeDirs.includes(item)) continue;
        
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath, relPath);
        } else if (['.js', '.ts', '.tsx', '.jsx', '.json'].includes(path.extname(item))) {
          files.push(relPath);
        }
      }
    };
    
    scanDir(this.projectRoot);
    return files;
  }
}

// Start server
const server = new AugmentServer();
server.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Augment server...');
  process.exit(0);
});
