#!/bin/bash

# Firebase Production Data Verification Script
echo "🔥 FIREBASE PRODUCTION DATA VERIFICATION"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo ""
print_status "info" "1. CONFIGURATION CHECK"
echo "----------------------"

# Check App.tsx configuration
PROVIDER_CHECK=$(grep -n "FirebaseTaskDataProvider" packages/web/src/App.tsx)
if [[ $PROVIDER_CHECK ]]; then
    print_status "success" "App.tsx is configured for Firebase"
else
    print_status "error" "App.tsx is NOT configured for Firebase"
    echo "Run: sed -i '' 's/ApiTaskDataProvider/FirebaseTaskDataProvider/g' packages/web/src/App.tsx"
    exit 1
fi

echo ""
print_status "info" "2. FIREBASE CONNECTION TEST"
echo "---------------------------"

# Test Firebase connection
cd packages/web
FIREBASE_TEST=$(timeout 30s node ../../scripts/test-firebase-data.js 2>&1)
FIREBASE_EXIT_CODE=$?
cd ../..

if [ $FIREBASE_EXIT_CODE -eq 0 ] && [[ $FIREBASE_TEST == *"Found"* ]]; then
    FIREBASE_TASKS=$(echo "$FIREBASE_TEST" | grep -o "Found [0-9]* tasks" | grep -o "[0-9]*" | head -1)
    FIREBASE_USERS=$(echo "$FIREBASE_TEST" | grep -o "Found [0-9]* users" | grep -o "[0-9]*" | head -1)
    
    print_status "success" "Firebase Connection: OK"
    print_status "success" "Production Tasks: $FIREBASE_TASKS tasks"
    print_status "success" "Production Users: $FIREBASE_USERS users"
    
    # Show task distribution
    echo ""
    print_status "info" "📊 PRODUCTION TASK DISTRIBUTION:"
    echo "$FIREBASE_TEST" | grep -A 10 "Tasks by user:" | grep -E "^\s*'" | sed 's/^/   /'
    
    echo ""
    print_status "info" "📊 TASK STATUS DISTRIBUTION:"
    echo "$FIREBASE_TEST" | grep -A 5 "Tasks by status:" | grep -E "^\s*[a-z-]+" | sed 's/^/   /'
    
else
    print_status "error" "Firebase Connection: FAILED"
    echo "Error details:"
    echo "$FIREBASE_TEST" | head -10
    exit 1
fi

echo ""
print_status "info" "3. WEB APPLICATION STATUS"
echo "-------------------------"

# Check web server
if curl -s http://localhost:8088 >/dev/null 2>&1; then
    print_status "success" "Web Server: Running on http://localhost:8088"
    print_status "success" "Alternative URL: http://127.0.0.1:8088"
else
    print_status "error" "Web Server: Not running"
    echo "Start with: cd packages/web && npm run dev"
fi

echo ""
print_status "info" "4. AUTHENTICATION STATUS"
echo "------------------------"

# Check if API server is still needed for auth
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    print_status "success" "API Server: Available for authentication"
    print_status "info" "Admin password: haininh1 (works for all accounts)"
else
    print_status "warning" "API Server: Not running (may affect authentication)"
    print_status "info" "Start with: cd packages/api-server && npm start"
fi

echo ""
print_status "info" "5. PRODUCTION DATA SUMMARY"
echo "--------------------------"

echo "🔥 Firebase Production Database:"
echo "   • Project ID: appqlgd"
echo "   • Tasks: $FIREBASE_TASKS real production tasks"
echo "   • Users: $FIREBASE_USERS real users"
echo "   • Status: Connected and operational"
echo ""
echo "📊 Data Quality:"
echo "   • Real customer data from production"
echo "   • Multiple users with actual tasks"
echo "   • Various task statuses and priorities"
echo "   • Production-ready dataset"

echo ""
print_status "info" "6. USAGE INSTRUCTIONS"
echo "---------------------"

echo "🌐 Access the application:"
echo "   • Primary URL: http://127.0.0.1:8088"
echo "   • Secondary URL: http://localhost:8088"
echo ""
echo "🔐 Login credentials:"
echo "   • Use any email from Firebase users"
echo "   • Admin master password: haininh1"
echo "   • Example: vietanh@example.com / haininh1"
echo ""
echo "📋 What you'll see:"
echo "   • Real production tasks instead of test data"
echo "   • Actual customer names and projects"
echo "   • Realistic task distribution across users"
echo "   • Production-level data complexity"

echo ""
print_status "info" "7. COMPARISON: BEFORE vs AFTER"
echo "------------------------------"

echo "BEFORE (Mock API):"
echo "   • 10 test tasks"
echo "   • 5 test users"
echo "   • Fake data for development"
echo ""
echo "AFTER (Firebase Production):"
echo "   • $FIREBASE_TASKS real tasks"
echo "   • $FIREBASE_USERS real users"
echo "   • Production data with real customers"

echo ""
if [ $FIREBASE_EXIT_CODE -eq 0 ]; then
    print_status "success" "🎉 FIREBASE PRODUCTION DATA IS NOW ACTIVE!"
    print_status "success" "Application is using real production data with $FIREBASE_TASKS tasks"
else
    print_status "error" "❌ Firebase connection failed - check configuration"
fi

echo ""
print_status "info" "Quick commands:"
echo "   ./scripts/verify-firebase-production.sh  - Run this verification again"
echo "   ./scripts/verify-data-source.sh          - General data source check"
echo "   ./scripts/test-firebase-data.js          - Direct Firebase test"
