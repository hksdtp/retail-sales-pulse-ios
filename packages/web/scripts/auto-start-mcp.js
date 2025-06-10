#!/usr/bin/env node

/**
 * Auto-start MCP servers when VSCode opens
 * This script runs automatically when the workspace is opened
 */

import MCPManager from './mcp-manager.js';

async function autoStart() {
  console.log('🔄 VSCode workspace opened - checking MCP servers...');
  
  const manager = new MCPManager();
  
  // Check current status
  const status = await manager.getStatus();
  console.log('📊 Current MCP Status:');
  console.table(status);
  
  // Auto-start servers that aren't running
  const serversToStart = [];
  
  for (const [name, info] of Object.entries(status)) {
    if (info.status === 'stopped') {
      serversToStart.push(name);
    }
  }
  
  if (serversToStart.length > 0) {
    console.log(`🚀 Auto-starting servers: ${serversToStart.join(', ')}`);
    
    for (const serverName of serversToStart) {
      await manager.startServer(serverName);
    }
    
    // Final status check
    const finalStatus = await manager.getStatus();
    console.log('✅ Final MCP Status:');
    console.table(finalStatus);
  } else {
    console.log('✅ All MCP servers are already running');
  }
}

// Run auto-start
autoStart().catch(error => {
  console.error('❌ Auto-start failed:', error);
  process.exit(1);
});
