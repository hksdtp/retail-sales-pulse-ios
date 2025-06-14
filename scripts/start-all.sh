#!/bin/bash

# Script khởi động toàn bộ dự án với MCP servers
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🚀 Khởi động Retail Sales Pulse iOS với MCP Servers"
echo "=================================================="

# Kiểm tra thư mục dự án
if [ ! -f "package.json" ] && [ ! -f "packages/web/package.json" ]; then
    echo "❌ Không tìm thấy package.json. Hãy chạy từ thư mục gốc của dự án."
    exit 1
fi

# Khởi động MCP Servers trước
echo "🔧 Khởi động MCP Servers..."
./scripts/start-mcp-servers.sh

# Đợi MCP servers khởi động
echo "⏳ Đợi MCP servers khởi động..."
sleep 3

# Khởi động web development server
echo "🌐 Khởi động Web Development Server..."

# Kiểm tra xem có phải monorepo không
if [ -d "packages/web" ]; then
    echo "📦 Phát hiện monorepo structure..."
    cd packages/web
    
    # Kiểm tra package manager
    if [ -f "yarn.lock" ]; then
        echo "🧶 Sử dụng Yarn..."
        yarn dev &
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "📦 Sử dụng PNPM..."
        pnpm dev &
    else
        echo "📦 Sử dụng NPM..."
        npm run dev &
    fi
    
    WEB_PID=$!
    cd ../..
else
    echo "📦 Single package structure..."
    
    # Kiểm tra package manager
    if [ -f "yarn.lock" ]; then
        echo "🧶 Sử dụng Yarn..."
        yarn dev &
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "📦 Sử dụng PNPM..."
        pnpm dev &
    else
        echo "📦 Sử dụng NPM..."
        npm run dev &
    fi
    
    WEB_PID=$!
fi

# Lưu PID của web server
echo "$WEB_PID" > .web.pid

echo ""
echo "🎉 Tất cả services đã khởi động!"
echo "================================"
echo "📋 Services đang chạy:"
echo "  🌐 Web App: http://localhost:3000"
echo "  🎭 MCP Playwright: http://localhost:3001"
echo "  🔧 MCP Augment: http://localhost:3002"
echo ""
echo "🔧 Lệnh có sẵn:"
echo "  ./plw test <mô tả> - Test với Playwright"
echo "  ./aug fix <mô tả> - Fix code với Augment"
echo "  ./aug analyze <file_path> - Analyze code"
echo "  ./aug search <pattern> - Search codebase"
echo ""
echo "⏹️  Để dừng tất cả: npm run stop:all"
echo ""
echo "📱 Mở trình duyệt và truy cập http://localhost:3000"

# Mở trình duyệt (tùy chọn)
if command -v open &> /dev/null; then
    echo "🌐 Mở trình duyệt..."
    sleep 5
    open http://localhost:3000
fi
