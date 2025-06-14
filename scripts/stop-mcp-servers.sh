#!/bin/bash

# Script dừng MCP servers
# Ninh ơi - Retail Sales Pulse iOS Project

echo "⏹️  Dừng MCP Servers..."
echo "====================="

# Dừng processes bằng PID files
if [ -f .playwright.pid ]; then
    PLAYWRIGHT_PID=$(cat .playwright.pid)
    if kill -0 $PLAYWRIGHT_PID 2>/dev/null; then
        echo "🎭 Dừng MCP Playwright Server (PID: $PLAYWRIGHT_PID)..."
        kill $PLAYWRIGHT_PID
    fi
    rm -f .playwright.pid
fi

if [ -f .augment.pid ]; then
    AUGMENT_PID=$(cat .augment.pid)
    if kill -0 $AUGMENT_PID 2>/dev/null; then
        echo "🔧 Dừng MCP Augment Server (PID: $AUGMENT_PID)..."
        kill $AUGMENT_PID
    fi
    rm -f .augment.pid
fi

# Backup: kill by process name
echo "🧹 Dọn dẹp processes còn lại..."
pkill -f "server-playwright" 2>/dev/null || true
pkill -f "server-augment" 2>/dev/null || true

echo "✅ Tất cả MCP Servers đã được dừng!"
