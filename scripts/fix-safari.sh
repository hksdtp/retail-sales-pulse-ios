#!/bin/bash

# Comprehensive Safari & Development Server Fix Script
echo "🔧 PHÂN TÍCH VÀ FIX SAFARI CONNECTION ISSUES"
echo "=============================================="

# Function to check service status
check_service() {
    local url=$1
    local name=$2
    if curl -s "$url" >/dev/null 2>&1; then
        echo "✅ $name: OK"
        return 0
    else
        echo "❌ $name: FAILED"
        return 1
    fi
}

# 1. CHẨN ĐOÁN HỆ THỐNG
echo ""
echo "📊 1. CHẨN ĐOÁN HỆ THỐNG:"
echo "------------------------"

# Check API Server (CRITICAL)
if ! check_service "http://localhost:3003/health" "API Server (port 3003)"; then
    echo "🚨 NGUYÊN NHÂN CHÍNH: API Server không chạy!"
    echo "🚀 Khởi động API Server..."
    cd packages/api-server && npm start &
    API_PID=$!
    cd ../..
    echo "⏳ Đợi API server khởi động..."
    sleep 5
    check_service "http://localhost:3003/health" "API Server (retry)"
fi

# Check Web Server
if ! check_service "http://localhost:8088" "Web Server (port 8088)"; then
    echo "🚀 Khởi động Web server..."
    cd packages/web && npm run dev &
    WEB_PID=$!
    cd ../..
    sleep 5
    check_service "http://localhost:8088" "Web Server (retry)"
fi

# Check Vite Proxy
check_service "http://localhost:8088/api/health" "Vite Proxy to API"

# 2. PHÂN TÍCH NGUYÊN NHÂN
echo ""
echo "🔍 2. PHÂN TÍCH NGUYÊN NHÂN:"
echo "-------------------------"

# Check DNS resolution
echo "🌐 DNS Resolution:"
nslookup localhost | grep -A2 "Non-authoritative answer:"

# Check port binding
echo ""
echo "🔌 Port Binding Analysis:"
lsof -i :8088,3003 | head -10

# Check network interfaces
echo ""
echo "🌍 Network Interfaces:"
ifconfig | grep -E "(inet |inet6)" | head -5

# 3. TRIỂN KHAI GIẢI PHÁP
echo ""
echo "🚀 3. TRIỂN KHAI GIẢI PHÁP:"
echo "-------------------------"

# Test multiple URLs
echo "🧪 Testing Multiple URLs:"
check_service "http://localhost:8088" "localhost:8088"
check_service "http://127.0.0.1:8088" "127.0.0.1:8088"

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ ! -z "$NETWORK_IP" ]; then
    echo "🌐 Network IP: $NETWORK_IP:8088"
    check_service "http://$NETWORK_IP:8088" "$NETWORK_IP:8088"
fi

# 4. SAFARI-SPECIFIC FIXES
echo ""
echo "🦁 4. SAFARI-SPECIFIC FIXES:"
echo "---------------------------"
echo "✅ Recommended URLs to try:"
echo "   1. http://127.0.0.1:8088 (Primary)"
echo "   2. http://localhost:8088 (Secondary)"
if [ ! -z "$NETWORK_IP" ]; then
    echo "   3. http://$NETWORK_IP:8088 (Network)"
fi

echo ""
echo "🔧 Safari Troubleshooting Steps:"
echo "   1. Clear Safari Cache: Safari > Develop > Empty Caches"
echo "   2. Reset Safari: Safari > Preferences > Privacy > Manage Website Data > Remove All"
echo "   3. Disable Extensions: Safari > Preferences > Extensions > Disable All"
echo "   4. Enable Develop Menu: Safari > Preferences > Advanced > Show Develop menu"
echo "   5. Disable Security (temporary): Develop > Disable Cross-Origin Restrictions"

# 5. OPEN BROWSERS
echo ""
echo "🌐 5. OPENING BROWSERS:"
echo "---------------------"
if command -v open &> /dev/null; then
    echo "Opening primary URL: http://127.0.0.1:8088"
    open http://127.0.0.1:8088
    sleep 2
    echo "Opening secondary URL: http://localhost:8088"
    open http://localhost:8088
    if [ ! -z "$NETWORK_IP" ]; then
        sleep 2
        echo "Opening network URL: http://$NETWORK_IP:8088"
        open http://$NETWORK_IP:8088
    fi
fi

# 6. FINAL STATUS
echo ""
echo "🎉 6. FINAL STATUS:"
echo "-----------------"
echo "✅ Script completed successfully!"
echo "📱 If Safari still can't connect:"
echo "   → Try Chrome or Firefox to verify the issue is Safari-specific"
echo "   → Check Safari Console (Develop > Show Web Inspector > Console)"
echo "   → Restart Safari completely"
echo "   → Restart your Mac if all else fails"

echo ""
echo "🔧 Quick Commands:"
echo "   ./scripts/fix-safari.sh  - Run this script again"
echo "   npm run start:all        - Restart all services"
echo "   npm run stop:all         - Stop all services"
