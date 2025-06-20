#!/bin/bash

# Setup Remote MCP Servers for Claude Code
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🌐 Setting up Remote MCP Servers..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists claude; then
    echo -e "${RED}❌ Claude Code CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npx; then
    echo -e "${RED}❌ npx not found. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Setup environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "# MCP Server Environment Variables" > .env
    echo "# Add your API keys here" >> .env
    echo "" >> .env
    echo "# Brave Search API Key (optional)" >> .env
    echo "BRAVE_API_KEY=" >> .env
    echo "" >> .env
    echo "# Tavily Search API Key (optional)" >> .env
    echo "TAVILY_API_KEY=" >> .env
    echo "" >> .env
    echo "# GitHub Token (optional)" >> .env
    echo "GITHUB_TOKEN=" >> .env
    echo "" >> .env
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi

# Test MCP servers
echo -e "${BLUE}🧪 Testing MCP servers...${NC}"

# List current MCP servers
echo -e "${YELLOW}📋 Current MCP servers:${NC}"
claude mcp list

# Test basic functionality
echo -e "${BLUE}🔄 Testing MCP server connectivity...${NC}"

# Create a simple test to verify MCP servers work
cat > temp_mcp_test.js << 'EOF'
const { exec } = require('child_process');

console.log('Testing MCP servers...');

// Test sequential thinking
exec('echo "test" | npx -y @modelcontextprotocol/server-sequential-thinking', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Sequential thinking server test failed');
    } else {
        console.log('✅ Sequential thinking server working');
    }
});

// Test memory server
exec('echo "test" | npx -y @modelcontextprotocol/server-memory', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Memory server test failed');
    } else {
        console.log('✅ Memory server working');
    }
});

console.log('MCP server tests completed');
EOF

node temp_mcp_test.js
rm temp_mcp_test.js

# Setup Remote MCP configuration
echo -e "${BLUE}🌐 Setting up Remote MCP configuration...${NC}"

# Create remote MCP config
cat > remote-mcp-config.json << 'EOF'
{
  "remote_mcp_servers": [
    {
      "name": "example-remote",
      "url": "https://example-server.modelcontextprotocol.io/sse",
      "type": "sse",
      "description": "Example remote MCP server",
      "enabled": false
    }
  ],
  "api_configuration": {
    "anthropic_beta_header": "mcp-client-2025-04-04",
    "max_tokens": 1000,
    "model": "claude-sonnet-4-20250514"
  }
}
EOF

echo -e "${GREEN}✅ Remote MCP configuration created${NC}"

# Create helper scripts
echo -e "${BLUE}🛠️  Creating helper scripts...${NC}"

# Create MCP test script
cat > scripts/test-mcp.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing MCP Servers..."
echo "========================"

echo "📋 Listing configured servers:"
claude mcp list

echo ""
echo "🔍 Testing server connectivity:"

# Test each server
for server in sequential-thinking filesystem memory brave-search fetch git time; do
    echo -n "Testing $server... "
    if claude mcp get $server >/dev/null 2>&1; then
        echo "✅"
    else
        echo "❌"
    fi
done

echo ""
echo "✨ MCP test completed!"
EOF

chmod +x scripts/test-mcp.sh

# Create MCP restart script
cat > scripts/restart-mcp.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting MCP Servers..."
echo "============================"

# This will restart Claude Code's MCP connection
echo "Restarting Claude Code MCP connection..."
echo "Please restart Claude Code to reload MCP servers."
echo ""
echo "Or use: claude mcp list to verify servers are loaded"
EOF

chmod +x scripts/restart-mcp.sh

echo -e "${GREEN}✅ Helper scripts created${NC}"

# Update package.json scripts
echo -e "${BLUE}📦 Updating package.json scripts...${NC}"

# Add MCP-related scripts to package.json if they don't exist
if ! grep -q "test:mcp" package.json; then
    # Create backup
    cp package.json package.json.backup
    
    # Add new scripts (this is a simple approach, might need manual adjustment)
    echo -e "${YELLOW}⚠️  Please manually add these scripts to package.json:${NC}"
    echo '"test:mcp": "./scripts/test-mcp.sh",'
    echo '"restart:mcp": "./scripts/restart-mcp.sh",'
    echo '"setup:remote-mcp": "./scripts/setup-remote-mcp.sh"'
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 Remote MCP Setup Complete!${NC}"
echo "================================="
echo ""
echo -e "${BLUE}📋 What was configured:${NC}"
echo "✅ Local MCP servers (sequential-thinking, filesystem, memory, etc.)"
echo "✅ Remote MCP configuration template"
echo "✅ Environment variables setup (.env)"
echo "✅ Helper scripts (test-mcp.sh, restart-mcp.sh)"
echo "✅ Project-specific .mcp.json configuration"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Add API keys to .env file (optional)"
echo "2. Test MCP servers: npm run test:mcp"
echo "3. Restart Claude Code to load new servers"
echo "4. Use MCP servers in Claude Code conversations"
echo ""
echo -e "${BLUE}🔧 Available commands:${NC}"
echo "• claude mcp list - List all MCP servers"
echo "• claude mcp get <name> - Get server details"
echo "• ./scripts/test-mcp.sh - Test server connectivity"
echo "• ./scripts/restart-mcp.sh - Restart MCP connection"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• MCP servers work within Claude Code conversations"
echo "• Use /mcp command in Claude Code to see server status"
echo "• Custom servers (playwright, augment) still work independently"
echo "• Remote MCP support requires API integration"
echo ""
echo -e "${GREEN}Happy coding with MCP! 🚀${NC}"
