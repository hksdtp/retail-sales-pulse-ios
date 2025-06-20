#!/bin/bash

# Verify Data Source Configuration Script
echo "🔍 VERIFYING DATA SOURCE CONFIGURATION"
echo "======================================"

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
print_status "info" "1. CHECKING CURRENT CONFIGURATION"
echo "---------------------------------"

# Check which provider is being used in App.tsx
PROVIDER_CHECK=$(grep -n "TaskDataProvider" packages/web/src/App.tsx)
if [[ $PROVIDER_CHECK == *"FirebaseTaskDataProvider"* ]]; then
    print_status "success" "App.tsx is using: FirebaseTaskDataProvider"
    CURRENT_PROVIDER="Firebase"
elif [[ $PROVIDER_CHECK == *"ApiTaskDataProvider"* ]]; then
    print_status "info" "App.tsx is using: ApiTaskDataProvider"
    CURRENT_PROVIDER="MockAPI"
else
    print_status "error" "Cannot determine data provider in App.tsx"
    CURRENT_PROVIDER="Unknown"
fi

echo ""
print_status "info" "2. DATA SOURCE AVAILABILITY"
echo "---------------------------"

# Check Mock API Server
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    MOCK_TASKS=$(curl -s http://localhost:3003/tasks | jq '.data | length' 2>/dev/null || echo "0")
    print_status "success" "Mock API Server: Available ($MOCK_TASKS tasks)"
    MOCK_AVAILABLE=true
else
    print_status "error" "Mock API Server: Not available"
    MOCK_AVAILABLE=false
fi

# Check Firebase connection
print_status "info" "Testing Firebase connection..."
cd packages/web
FIREBASE_TEST=$(timeout 10s node ../../scripts/test-firebase-data.js 2>&1)
FIREBASE_EXIT_CODE=$?
cd ../..

if [ $FIREBASE_EXIT_CODE -eq 0 ] && [[ $FIREBASE_TEST == *"Found"* ]]; then
    FIREBASE_TASKS=$(echo "$FIREBASE_TEST" | grep -o "Found [0-9]* tasks" | grep -o "[0-9]*" | head -1)
    print_status "success" "Firebase Firestore: Available ($FIREBASE_TASKS tasks)"
    FIREBASE_AVAILABLE=true
else
    print_status "error" "Firebase Firestore: Connection failed"
    FIREBASE_AVAILABLE=false
fi

echo ""
print_status "info" "3. CONFIGURATION ANALYSIS"
echo "-------------------------"

if [ "$CURRENT_PROVIDER" = "Firebase" ] && [ "$FIREBASE_AVAILABLE" = true ]; then
    print_status "success" "OPTIMAL: Using Firebase with $FIREBASE_TASKS real tasks"
    RECOMMENDATION="Current setup is optimal for production use"
elif [ "$CURRENT_PROVIDER" = "MockAPI" ] && [ "$MOCK_AVAILABLE" = true ]; then
    print_status "warning" "DEVELOPMENT: Using Mock API with $MOCK_TASKS test tasks"
    RECOMMENDATION="Good for development, but switch to Firebase for production"
elif [ "$CURRENT_PROVIDER" = "Firebase" ] && [ "$FIREBASE_AVAILABLE" = false ]; then
    print_status "error" "BROKEN: Configured for Firebase but connection failed"
    RECOMMENDATION="Fix Firebase connection or switch back to Mock API"
elif [ "$CURRENT_PROVIDER" = "MockAPI" ] && [ "$MOCK_AVAILABLE" = false ]; then
    print_status "error" "BROKEN: Configured for Mock API but server not running"
    RECOMMENDATION="Start Mock API server or switch to Firebase"
else
    print_status "error" "UNKNOWN: Cannot determine proper configuration"
    RECOMMENDATION="Check configuration and data source availability"
fi

echo ""
print_status "info" "4. QUICK ACTIONS"
echo "---------------"

echo "Available commands:"
echo ""
echo "🔄 Switch to Firebase (production data):"
echo "   sed -i '' 's/ApiTaskDataProvider/FirebaseTaskDataProvider/g' packages/web/src/App.tsx"
echo ""
echo "🔄 Switch to Mock API (development data):"
echo "   sed -i '' 's/FirebaseTaskDataProvider/ApiTaskDataProvider/g' packages/web/src/App.tsx"
echo ""
echo "🚀 Start Mock API Server:"
echo "   cd packages/api-server && npm start"
echo ""
echo "🧪 Test Firebase connection:"
echo "   cd packages/web && node ../../scripts/test-firebase-data.js"

echo ""
print_status "info" "5. SUMMARY"
echo "---------"

echo "Current Status:"
echo "• Data Provider: $CURRENT_PROVIDER"
echo "• Mock API: $([ "$MOCK_AVAILABLE" = true ] && echo "Available ($MOCK_TASKS tasks)" || echo "Not available")"
echo "• Firebase: $([ "$FIREBASE_AVAILABLE" = true ] && echo "Available ($FIREBASE_TASKS tasks)" || echo "Not available")"
echo ""
echo "Recommendation: $RECOMMENDATION"

echo ""
if [ "$CURRENT_PROVIDER" = "Firebase" ] && [ "$FIREBASE_AVAILABLE" = true ]; then
    print_status "success" "✅ System is ready with Firebase production data!"
elif [ "$CURRENT_PROVIDER" = "MockAPI" ] && [ "$MOCK_AVAILABLE" = true ]; then
    print_status "warning" "⚠️  System is using development data. Consider switching to Firebase for production."
else
    print_status "error" "❌ System configuration needs attention!"
fi
