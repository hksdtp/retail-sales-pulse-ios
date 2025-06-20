#!/bin/bash

# Script dừng toàn bộ dự án
# Ninh ơi - Retail Sales Pulse iOS Project

echo "⏹️  Dừng tất cả services..."
echo "========================="

# Dừng API server
if [ -f .api.pid ]; then
    API_PID=$(cat .api.pid)
    if kill -0 $API_PID 2>/dev/null; then
        echo "🔌 Dừng API Server (PID: $API_PID)..."
        kill $API_PID
    fi
    rm -f .api.pid
fi

# Dừng web development server
if [ -f .web.pid ]; then
    WEB_PID=$(cat .web.pid)
    if kill -0 $WEB_PID 2>/dev/null; then
        echo "🌐 Dừng Web Development Server (PID: $WEB_PID)..."
        kill $WEB_PID
    fi
    rm -f .web.pid
fi

# Dừng MCP servers
echo "🔧 Dừng MCP Servers..."
./scripts/stop-mcp-servers.sh

# Backup: kill common development processes
echo "🧹 Dọn dẹp processes development..."
pkill -f "vite" 2>/dev/null || true
pkill -f "webpack" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true

echo ""
echo "✅ Tất cả services đã được dừng!"
echo "🎯 Dự án đã sẵn sàng cho lần khởi động tiếp theo."
