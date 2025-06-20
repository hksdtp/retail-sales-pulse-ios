#!/bin/bash

# Safari Troubleshooting Automation Script
# Tự động fix các vấn đề thường gặp với Safari

echo "🦁 SAFARI TROUBLESHOOTING AUTOMATION"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $message${NC}" ;;
    esac
}

# Function to check service
check_service() {
    local url=$1
    local name=$2
    if curl -s "$url" >/dev/null 2>&1; then
        print_status "success" "$name is running"
        return 0
    else
        print_status "error" "$name is not running"
        return 1
    fi
}

# 1. Quick Health Check
echo ""
print_status "info" "1. QUICK HEALTH CHECK"
echo "----------------------"

API_OK=false
WEB_OK=false

if check_service "http://localhost:3003/health" "API Server (port 3003)"; then
    API_OK=true
fi

if check_service "http://localhost:8088" "Web Server (port 8088)"; then
    WEB_OK=true
fi

# 2. Auto-fix missing services
echo ""
print_status "info" "2. AUTO-FIX MISSING SERVICES"
echo "-----------------------------"

if [ "$API_OK" = false ]; then
    print_status "warning" "Starting API Server..."
    cd packages/api-server && npm start &
    cd ../..
    sleep 5
    check_service "http://localhost:3003/health" "API Server (retry)"
fi

if [ "$WEB_OK" = false ]; then
    print_status "warning" "Starting Web Server..."
    cd packages/web && npm run dev &
    cd ../..
    sleep 5
    check_service "http://localhost:8088" "Web Server (retry)"
fi

# 3. Safari-specific fixes
echo ""
print_status "info" "3. SAFARI-SPECIFIC FIXES"
echo "-------------------------"

# Clear Safari cache via command line (if possible)
if command -v osascript &> /dev/null; then
    print_status "info" "Attempting to clear Safari cache..."
    osascript -e 'tell application "Safari" to activate' 2>/dev/null || true
    sleep 1
fi

# 4. Test multiple URLs
echo ""
print_status "info" "4. TESTING MULTIPLE URLS"
echo "-------------------------"

URLS=(
    "http://localhost:8088"
    "http://127.0.0.1:8088"
)

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ ! -z "$NETWORK_IP" ]; then
    URLS+=("http://$NETWORK_IP:8088")
fi

for url in "${URLS[@]}"; do
    if check_service "$url" "$url"; then
        print_status "success" "✅ Working URL: $url"
    fi
done

# 5. Open browsers with fallback URLs
echo ""
print_status "info" "5. OPENING BROWSERS"
echo "-------------------"

if command -v open &> /dev/null; then
    for url in "${URLS[@]}"; do
        if check_service "$url" "$url"; then
            print_status "info" "Opening: $url"
            open "$url"
            sleep 1
            break
        fi
    done
fi

# 6. Final recommendations
echo ""
print_status "info" "6. MANUAL SAFARI FIXES (if needed)"
echo "-----------------------------------"
echo "If Safari still can't connect, try these steps:"
echo ""
echo "🔧 Safari Menu Actions:"
echo "   • Safari > Develop > Empty Caches"
echo "   • Safari > History > Clear History..."
echo "   • Safari > Preferences > Privacy > Manage Website Data > Remove All"
echo ""
echo "🔧 Safari Developer Tools:"
echo "   • Safari > Preferences > Advanced > Show Develop menu"
echo "   • Develop > Disable Cross-Origin Restrictions (temporary)"
echo "   • Develop > Show Web Inspector > Console (check for errors)"
echo ""
echo "🔧 Alternative Browsers:"
echo "   • Try Chrome: open -a 'Google Chrome' http://localhost:8088"
echo "   • Try Firefox: open -a Firefox http://localhost:8088"
echo ""
echo "🔧 System-level fixes:"
echo "   • Restart Safari completely"
echo "   • Check macOS firewall settings"
echo "   • Restart your Mac if all else fails"

echo ""
print_status "success" "Safari troubleshooting completed!"
print_status "info" "Run this script again anytime: ./scripts/safari-troubleshoot.sh"
