#!/usr/bin/env node

/**
 * Remote MCP Server Example
 * Ninh ơi - Retail Sales Pulse iOS Project
 * 
 * Example of using Claude's Remote MCP Connector API
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in .env file');
    console.log('Please add your Anthropic API key to .env:');
    console.log('ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
}

/**
 * Example: Using Remote MCP Connector
 */
async function testRemoteMCP() {
    console.log('🌐 Testing Remote MCP Connector...');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'mcp-client-2025-04-04'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user', 
                        content: 'What MCP tools do you have available? Please list them.'
                    }
                ],
                mcp_servers: [
                    {
                        type: 'url',
                        url: 'https://example-server.modelcontextprotocol.io/sse',
                        name: 'example-remote-server',
                        tool_configuration: {
                            enabled: true,
                            allowed_tools: ['example_tool']
                        }
                        // authorization_token: 'YOUR_TOKEN' // Add if needed
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Remote MCP Response:');
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('❌ Remote MCP Error:', error.message);
    }
}

/**
 * Example: Multiple Remote MCP Servers
 */
async function testMultipleRemoteMCP() {
    console.log('🌐 Testing Multiple Remote MCP Servers...');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'mcp-client-2025-04-04'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: 'Use tools from multiple MCP servers to help me with development tasks.'
                    }
                ],
                mcp_servers: [
                    {
                        type: 'url',
                        url: 'https://mcp-server-1.example.com/sse',
                        name: 'development-tools',
                        tool_configuration: {
                            enabled: true
                        }
                    },
                    {
                        type: 'url', 
                        url: 'https://mcp-server-2.example.com/sse',
                        name: 'testing-tools',
                        tool_configuration: {
                            enabled: true,
                            allowed_tools: ['run_test', 'generate_test']
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Multiple Remote MCP Response:');
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('❌ Multiple Remote MCP Error:', error.message);
    }
}

/**
 * Example: Local MCP Server Integration
 */
async function testLocalMCPIntegration() {
    console.log('🔧 Testing Local MCP Integration...');
    
    // This demonstrates how you might integrate local MCP servers
    // with remote API calls (for custom workflows)
    
    const localMCPServers = [
        'sequential-thinking',
        'filesystem', 
        'memory',
        'brave-search',
        'fetch',
        'git',
        'time'
    ];
    
    console.log('📋 Available Local MCP Servers:');
    localMCPServers.forEach(server => {
        console.log(`  ✅ ${server}`);
    });
    
    console.log('\n💡 These servers are available in Claude Code conversations');
    console.log('💡 Use them by starting: claude');
}

/**
 * Example: OAuth Authentication Setup
 */
function showOAuthSetup() {
    console.log('🔐 OAuth Authentication Setup:');
    console.log('================================');
    console.log('');
    console.log('1. Install MCP Inspector:');
    console.log('   npx @modelcontextprotocol/inspector');
    console.log('');
    console.log('2. Configure OAuth in Inspector:');
    console.log('   - Select "SSE" or "Streamable HTTP"');
    console.log('   - Enter MCP server URL');
    console.log('   - Click "Open Auth Settings"');
    console.log('   - Click "Quick OAuth Flow"');
    console.log('   - Complete authorization');
    console.log('   - Copy access_token');
    console.log('');
    console.log('3. Use token in Remote MCP config:');
    console.log('   authorization_token: "YOUR_ACCESS_TOKEN"');
    console.log('');
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Remote MCP Examples');
    console.log('======================');
    console.log('');
    
    // Show local MCP integration
    await testLocalMCPIntegration();
    console.log('');
    
    // Show OAuth setup
    showOAuthSetup();
    console.log('');
    
    // Test remote MCP (commented out as it needs real servers)
    console.log('🌐 Remote MCP API Examples:');
    console.log('(Uncomment to test with real servers)');
    console.log('');
    
    // Uncomment these when you have real remote MCP servers:
    // await testRemoteMCP();
    // await testMultipleRemoteMCP();
    
    console.log('✨ Examples completed!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Add ANTHROPIC_API_KEY to .env');
    console.log('2. Find Remote MCP servers to connect to');
    console.log('3. Setup OAuth if needed');
    console.log('4. Uncomment and run real tests');
    console.log('');
    console.log('🔧 For local MCP servers, use: claude');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export {
    testRemoteMCP,
    testMultipleRemoteMCP,
    testLocalMCPIntegration,
    showOAuthSetup
};
