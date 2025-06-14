#!/bin/bash

# Keep Alive Script - Retail Sales Pulse iOS
# Ninh ơi - Script này sẽ tự động khởi động lại server nếu bị ngắt

echo "🔄 Keep Alive Script - Retail Sales Pulse iOS"
echo "============================================="

# Function to check if server is running
check_server() {
    curl -s http://localhost:8088/ > /dev/null 2>&1
    return $?
}

# Function to start server
start_server() {
    echo "🚀 Khởi động server..."
    cd /Users/nih/Bán\ lẻ/retail-sales-pulse-ios/packages/web
    npm run dev > /dev/null 2>&1 &
    sleep 5
}

# Main loop
while true; do
    if check_server; then
        echo "✅ $(date): Server đang hoạt động bình thường"
    else
        echo "❌ $(date): Server bị ngắt kết nối - Đang khởi động lại..."
        start_server
        
        # Wait and check again
        sleep 10
        if check_server; then
            echo "✅ $(date): Server đã được khởi động lại thành công"
        else
            echo "❌ $(date): Không thể khởi động lại server"
        fi
    fi
    
    # Check every 30 seconds
    sleep 30
done
