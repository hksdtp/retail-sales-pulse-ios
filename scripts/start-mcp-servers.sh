#!/bin/bash

# Script khởi động MCP servers
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🚀 Khởi động MCP Servers..."
echo "=========================="

# Kiểm tra port có đang được sử dụng không
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port đang được sử dụng"
        return 1
    else
        echo "✅ Port $port sẵn sàng"
        return 0
    fi
}

# Kill existing MCP processes
echo "🧹 Dọn dẹp processes cũ..."
pkill -f "server-playwright" 2>/dev/null || true
pkill -f "server-augment" 2>/dev/null || true

# Đợi một chút để processes tắt hoàn toàn
sleep 2

# Khởi động Playwright Test Server
echo "🎭 Khởi động Playwright Test Server..."
if check_port 3001; then
    # Sử dụng dedicated Playwright server
    node ./scripts/playwright-server.js &
    PLAYWRIGHT_PID=$!
    echo "✅ Playwright Test Server đang chạy (PID: $PLAYWRIGHT_PID, Port: 3001)"
else
    echo "❌ Không thể khởi động Playwright Test Server - port 3001 đang được sử dụng"
fi

# Khởi động Augment Code Server
echo "🔧 Khởi động Augment Code Server..."
if check_port 3002; then
    # Sử dụng dedicated Augment server
    node ./scripts/augment-server.js &
    AUGMENT_PID=$!
    echo "✅ Augment Code Server đang chạy (PID: $AUGMENT_PID, Port: 3002)"
else
    echo "❌ Không thể khởi động Augment Code Server - port 3002 đang được sử dụng"
fi

# Tạo file PID để track processes
echo "$PLAYWRIGHT_PID" > .playwright.pid
echo "$AUGMENT_PID" > .augment.pid

echo ""
echo "🎉 Development Servers đã khởi động!"
echo "📋 Thông tin:"
echo "  - Playwright Test Server: http://localhost:3001"
echo "  - Augment Code Server: http://localhost:3002"
echo ""
echo "🔧 Sử dụng:"
echo "  ./plw test <description> - Chạy Playwright tests"
echo "  ./aug fix <description> - Sử dụng Augment để fix code"
echo "  curl http://localhost:3001/health - Test Playwright server"
echo "  curl http://localhost:3002/health - Test Augment server"
echo ""
echo "⏹️  Để dừng servers: npm run stop:mcp"
