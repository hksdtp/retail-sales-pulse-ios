#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

class AugmentMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'augment-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_code',
          description: 'Analyze code for bugs, performance issues, and best practices',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Path to the file to analyze',
              },
              analysis_type: {
                type: 'string',
                enum: ['bugs', 'performance', 'security', 'style', 'all'],
                description: 'Type of analysis to perform',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'fix_issue',
          description: 'Suggest fixes for identified code issues',
          inputSchema: {
            type: 'object',
            properties: {
              issue_description: {
                type: 'string',
                description: 'Description of the issue to fix',
              },
              file_path: {
                type: 'string',
                description: 'Path to the file with the issue',
              },
              context: {
                type: 'string',
                description: 'Additional context about the issue',
              },
            },
            required: ['issue_description'],
          },
        },
        {
          name: 'search_codebase',
          description: 'Search for patterns, functions, or issues in the codebase',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description: 'Pattern to search for (regex supported)',
              },
              file_types: {
                type: 'array',
                items: { type: 'string' },
                description: 'File extensions to search in (e.g., [".ts", ".tsx"])',
              },
              directory: {
                type: 'string',
                description: 'Directory to search in (default: current)',
              },
            },
            required: ['pattern'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_code':
            return await this.analyzeCode(args);
          case 'fix_issue':
            return await this.fixIssue(args);
          case 'search_codebase':
            return await this.searchCodebase(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async analyzeCode(args: any) {
    const { file_path, analysis_type = 'all' } = args;
    
    if (!await fs.pathExists(file_path)) {
      throw new Error(`File not found: ${file_path}`);
    }

    const content = await fs.readFile(file_path, 'utf-8');
    const ext = path.extname(file_path);
    
    let analysis = `🔍 Code Analysis for ${file_path}\n`;
    analysis += `📁 File type: ${ext}\n`;
    analysis += `📏 Lines of code: ${content.split('\n').length}\n\n`;

    // Basic analysis patterns
    const issues = [];

    if (analysis_type === 'all' || analysis_type === 'bugs') {
      // Check for common bugs
      if (content.includes('console.log') && ext.includes('.ts')) {
        issues.push('🐛 Found console.log statements - consider removing for production');
      }
      if (content.includes('any') && ext.includes('.ts')) {
        issues.push('🐛 Found "any" type usage - consider using specific types');
      }
      if (content.includes('== ') || content.includes('!= ')) {
        issues.push('🐛 Found loose equality operators - consider using === or !==');
      }
    }

    if (analysis_type === 'all' || analysis_type === 'performance') {
      // Check for performance issues
      if (content.includes('useEffect') && !content.includes('dependencies')) {
        issues.push('⚡ useEffect without dependency array - may cause performance issues');
      }
      if (content.includes('map') && content.includes('filter')) {
        issues.push('⚡ Consider combining map and filter operations for better performance');
      }
    }

    if (analysis_type === 'all' || analysis_type === 'security') {
      // Check for security issues
      if (content.includes('innerHTML')) {
        issues.push('🔒 Found innerHTML usage - potential XSS vulnerability');
      }
      if (content.includes('eval(')) {
        issues.push('🔒 Found eval() usage - security risk');
      }
    }

    if (analysis_type === 'all' || analysis_type === 'style') {
      // Check for style issues
      if (content.includes('var ')) {
        issues.push('🎨 Found "var" declarations - consider using "let" or "const"');
      }
      if (content.split('\n').some(line => line.length > 120)) {
        issues.push('🎨 Found lines longer than 120 characters - consider breaking them up');
      }
    }

    if (issues.length === 0) {
      analysis += '✅ No issues found!';
    } else {
      analysis += `❌ Found ${issues.length} issues:\n\n`;
      issues.forEach((issue, index) => {
        analysis += `${index + 1}. ${issue}\n`;
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: analysis,
        },
      ],
    };
  }

  private async fixIssue(args: any) {
    const { issue_description, file_path, context } = args;
    
    let suggestion = `🔧 Fix Suggestion for: ${issue_description}\n\n`;
    
    if (file_path && await fs.pathExists(file_path)) {
      const content = await fs.readFile(file_path, 'utf-8');
      suggestion += `📁 File: ${file_path}\n`;
      suggestion += `📏 Current file size: ${content.split('\n').length} lines\n\n`;
    }

    // Provide specific suggestions based on issue description
    if (issue_description.toLowerCase().includes('member task filtering')) {
      suggestion += `🎯 Member Task Filtering Issues:\n\n`;
      suggestion += `1. Check selectedMember state management:\n`;
      suggestion += `   - Ensure selectedMember is properly set when user selects from dropdown\n`;
      suggestion += `   - Verify useEffect dependencies include selectedMember\n\n`;
      suggestion += `2. Verify data source usage:\n`;
      suggestion += `   - Use managerTasks for individual view instead of allRegularTasks\n`;
      suggestion += `   - Check if API returns correct data for selected member\n\n`;
      suggestion += `3. Debug filtering logic:\n`;
      suggestion += `   - Add console.logs to track filtering process\n`;
      suggestion += `   - Verify memberIds array contains correct user IDs\n`;
      suggestion += `   - Check both assignedTo and user_id fields\n\n`;
    }

    if (issue_description.toLowerCase().includes('mobile') || issue_description.toLowerCase().includes('layout')) {
      suggestion += `📱 Mobile Layout Issues:\n\n`;
      suggestion += `1. Bottom Navigation:\n`;
      suggestion += `   - Use flex-1 for equal distribution\n`;
      suggestion += `   - Add proper safe area handling\n`;
      suggestion += `   - Ensure z-index is high enough\n\n`;
      suggestion += `2. Content Protection:\n`;
      suggestion += `   - Add padding-bottom to main content\n`;
      suggestion += `   - Use calc() with safe-area-inset-bottom\n`;
      suggestion += `   - Test on different screen sizes\n\n`;
    }

    if (context) {
      suggestion += `📝 Additional Context:\n${context}\n\n`;
    }

    suggestion += `💡 General Recommendations:\n`;
    suggestion += `- Add comprehensive logging for debugging\n`;
    suggestion += `- Write unit tests to verify fixes\n`;
    suggestion += `- Test on multiple devices/browsers\n`;
    suggestion += `- Consider edge cases and error handling\n`;

    return {
      content: [
        {
          type: 'text',
          text: suggestion,
        },
      ],
    };
  }

  private async searchCodebase(args: any) {
    const { pattern, file_types = ['**/*'], directory = '.' } = args;
    
    try {
      const searchPattern = file_types.map((ext: string) =>
        path.join(directory, `**/*${ext.startsWith('.') ? ext : '.' + ext}`)
      );

      const files = await glob(searchPattern, { ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'] });
      const results: Array<{file: string, matches: Array<{line: number, content: string}>}> = [];

      for (const file of files.slice(0, 50)) { // Limit to 50 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          const matches: Array<{line: number, content: string}> = [];

          lines.forEach((line, index) => {
            if (line.match(new RegExp(pattern, 'i'))) {
              matches.push({
                line: index + 1,
                content: line.trim(),
              });
            }
          });

          if (matches.length > 0) {
            results.push({
              file,
              matches: matches.slice(0, 10), // Limit matches per file
            });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      let output = `🔍 Search Results for pattern: "${pattern}"\n`;
      output += `📁 Searched in: ${directory}\n`;
      output += `📄 File types: ${file_types.join(', ')}\n`;
      output += `🎯 Found ${results.length} files with matches\n\n`;
      
      results.forEach((result, index) => {
        output += `${index + 1}. 📄 ${result.file}\n`;
        result.matches.forEach(match => {
          output += `   Line ${match.line}: ${match.content}\n`;
        });
        output += '\n';
      });
      
      if (results.length === 0) {
        output += '❌ No matches found';
      }
      
      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Augment MCP server running on stdio');
  }
}

const server = new AugmentMCPServer();
server.run().catch(console.error);
