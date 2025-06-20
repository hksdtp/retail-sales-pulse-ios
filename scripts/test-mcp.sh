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
