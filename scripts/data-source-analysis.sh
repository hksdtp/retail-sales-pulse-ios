#!/bin/bash

# Comprehensive Data Source Analysis Script
echo "📊 COMPREHENSIVE DATA SOURCE ANALYSIS"
echo "====================================="

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
print_status "info" "1. CURRENT DATA SOURCE CONFIGURATION"
echo "------------------------------------"

# Check which provider is being used
PROVIDER=$(grep -r "ApiTaskDataProvider\|FirebaseTaskDataProvider" packages/web/src/App.tsx | head -1)
if [[ $PROVIDER == *"ApiTaskDataProvider"* ]]; then
    print_status "info" "Frontend is using: ApiTaskDataProvider (Mock API Server)"
elif [[ $PROVIDER == *"FirebaseTaskDataProvider"* ]]; then
    print_status "info" "Frontend is using: FirebaseTaskDataProvider (Firebase Firestore)"
else
    print_status "warning" "Cannot determine data provider"
fi

# Check environment configuration
print_status "info" "Environment: Development mode (VITE_DEV=true)"
print_status "info" "API URL: Vite proxy (/api → localhost:3003)"

echo ""
print_status "info" "2. DATA SOURCE COMPARISON"
echo "-------------------------"

# Mock API Server data
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    MOCK_TASKS=$(curl -s http://localhost:3003/tasks | jq '.data | length' 2>/dev/null || echo "0")
    print_status "success" "Mock API Server: $MOCK_TASKS tasks available"
    
    # Show task distribution
    echo "   📊 Mock API Task Distribution:"
    curl -s http://localhost:3003/tasks | jq -r '.data | group_by(.user_name) | map("      - " + .[0].user_name + ": " + (length | tostring) + " tasks") | .[]' 2>/dev/null || echo "      - Unable to fetch details"
else
    print_status "error" "Mock API Server: Not accessible"
fi

# Firebase Firestore data
print_status "info" "Firebase Firestore: Testing connection..."
cd packages/web
FIREBASE_RESULT=$(node ../../scripts/test-firebase-data.js 2>&1)
cd ../..

if [[ $FIREBASE_RESULT == *"Found"* ]]; then
    FIREBASE_TASKS=$(echo "$FIREBASE_RESULT" | grep -o "Found [0-9]* tasks" | grep -o "[0-9]*")
    FIREBASE_USERS=$(echo "$FIREBASE_RESULT" | grep -o "Found [0-9]* users" | grep -o "[0-9]*")
    print_status "success" "Firebase Firestore: $FIREBASE_TASKS tasks, $FIREBASE_USERS users"
    
    echo "   📊 Firebase Task Distribution:"
    echo "$FIREBASE_RESULT" | grep -A 10 "Tasks by user:" | grep -E "^\s*'" | sed 's/^/      /'
else
    print_status "warning" "Firebase Firestore: Connection issues or no data"
fi

echo ""
print_status "info" "3. ANALYSIS SUMMARY"
echo "-------------------"

print_status "warning" "DISCREPANCY DETECTED:"
echo "   • Mock API Server: $MOCK_TASKS tasks (test data)"
echo "   • Firebase Firestore: $FIREBASE_TASKS tasks (real production data)"
echo "   • Current app shows Mock API data, not Firebase data"

echo ""
print_status "info" "4. ROOT CAUSE ANALYSIS"
echo "----------------------"

print_status "info" "Why app shows Mock API data instead of Firebase:"
echo "   1. App.tsx uses ApiTaskDataProvider (not FirebaseTaskDataProvider)"
echo "   2. Development mode (VITE_DEV=true) routes to Mock API Server"
echo "   3. Vite proxy configuration: /api → localhost:3003"
echo "   4. Firebase is configured but not actively used for tasks"

echo ""
print_status "info" "5. RECOMMENDATIONS"
echo "------------------"

print_status "success" "FOR DEVELOPMENT:"
echo "   • Keep using Mock API Server for consistent development"
echo "   • Mock data is faster and doesn't require internet"
echo "   • Good for testing without affecting production data"

print_status "success" "FOR PRODUCTION:"
echo "   • Switch to FirebaseTaskDataProvider in App.tsx"
echo "   • Set VITE_DEV=false in production environment"
echo "   • Use Firebase Firestore with real user data"

print_status "success" "FOR DATA SYNCHRONIZATION:"
echo "   • Create migration script to sync Mock → Firebase"
echo "   • Implement dual-mode support (dev/prod data sources)"
echo "   • Add environment-based provider switching"

echo ""
print_status "info" "6. NEXT STEPS"
echo "-------------"

echo "Choose your preferred approach:"
echo ""
echo "A) Keep Mock API for development (RECOMMENDED)"
echo "   - No changes needed"
echo "   - Fast development cycle"
echo "   - Isolated from production data"
echo ""
echo "B) Switch to Firebase for development"
echo "   - Change App.tsx to use FirebaseTaskDataProvider"
echo "   - Work with real production data"
echo "   - Requires internet connection"
echo ""
echo "C) Implement hybrid approach"
echo "   - Environment-based provider switching"
echo "   - Mock API for dev, Firebase for prod"
echo "   - Best of both worlds"

echo ""
print_status "success" "Analysis completed! Choose your preferred approach."
