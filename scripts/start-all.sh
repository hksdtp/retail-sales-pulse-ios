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

# Check và kill processes trên ports cần thiết
echo "🧹 Dọn dẹp ports cũ..."
lsof -ti:8088,3001,3002,3003 | xargs kill -9 2>/dev/null || true
sleep 2

# Khởi động API Server trước
echo "🔧 Khởi động API Server..."
if [ -d "packages/api-server" ]; then
    cd packages/api-server
    if [ ! -d "node_modules" ]; then
        echo "📦 Cài đặt dependencies cho API server..."
        npm install
    fi

    # Check if port 3003 is available
    if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port 3003 đang được sử dụng"
        exit 1
    fi

    npm start &
    API_PID=$!
    echo "$API_PID" > ../../.api.pid
    cd ../..

    # Wait for API server to start
    echo "⏳ Đợi API server khởi động..."
    for i in {1..10}; do
        if curl -s http://localhost:3003/health >/dev/null 2>&1; then
            echo "✅ API Server khởi động thành công trên port 3003"
            break
        fi
        sleep 1
    done
else
    echo "⚠️  Không tìm thấy API server, tạo mock server..."
fi

# Khởi động MCP Servers
echo "🔧 Khởi động MCP Servers..."
./scripts/start-mcp-servers.sh

# Đợi servers khởi động
echo "⏳ Đợi servers khởi động..."
sleep 5

# Khởi động web development server
echo "🌐 Khởi động Web Development Server..."

# Check if port 8088 is available
if lsof -Pi :8088 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 8088 đang được sử dụng"
    exit 1
fi

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

# Wait for web server to start
echo "⏳ Đợi web server khởi động..."
for i in {1..15}; do
    if curl -s http://localhost:8088 >/dev/null 2>&1; then
        echo "✅ Web Server khởi động thành công trên port 8088"
        break
    fi
    sleep 1
done

echo ""
echo "🎉 Tất cả services đã khởi động!"
echo "================================"
echo "📋 Services đang chạy:"
echo "  🌐 Web App: http://localhost:8088"
echo "  🔌 API Server: http://localhost:3003"
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
echo "📱 Mở trình duyệt và truy cập http://localhost:8088"

# Mở trình duyệt (tùy chọn)
if command -v open &> /dev/null; then
    echo "🌐 Mở trình duyệt..."
    sleep 5
    open http://localhost:8088
fi
