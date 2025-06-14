#!/bin/bash

# Augment MCP Wrapper Script
# Usage: aug fix "description of issue to fix"

if [ $# -eq 0 ]; then
    echo "🔧 Augment MCP Server"
    echo "Usage: aug [command] \"description\""
    echo "Commands:"
    echo "  fix \"issue description\" - Get fix suggestions"
    echo "  analyze \"file_path\" - Analyze code"
    echo "  search \"pattern\" - Search codebase"
    echo ""
    echo "Examples:"
    echo "  aug fix \"member task filtering not working\""
    echo "  aug analyze \"packages/web/src/components/tasks/TaskManagementView.tsx\""
    echo "  aug search \"selectedMember\""
    exit 1
fi

COMMAND="$1"
shift
DESCRIPTION="$*"

case "$COMMAND" in
    "fix")
        echo "🔧 Augment Fix: $DESCRIPTION"
        echo "📍 Project: Retail Sales Pulse iOS"
        echo ""

        # Provide fix suggestions directly
        echo "🎯 Member Task Filtering Issues:"
        echo ""
        echo "1. Check selectedMember state management:"
        echo "   - Ensure selectedMember is properly set when user selects from dropdown"
        echo "   - Verify useEffect dependencies include selectedMember"
        echo ""
        echo "2. Verify data source usage:"
        echo "   - Use managerTasks for individual view instead of allRegularTasks"
        echo "   - Check if API returns correct data for selected member"
        echo ""
        echo "3. Debug filtering logic:"
        echo "   - Add console.logs to track filtering process"
        echo "   - Verify memberIds array contains correct user IDs"
        echo "   - Check both assignedTo and user_id fields"
        echo ""
        echo "4. Mock data for testing:"
        echo "   - Add test tasks with both mock ID ('7') and real API ID"
        echo "   - Ensure tasks are injected into data source"
        echo ""
        echo "💡 Recent fixes applied:"
        echo "   - Added useMemo for selectedMemberForHook"
        echo "   - Enhanced debug logging with special highlighting"
        echo "   - Added 4 mock tasks for Phạm Thị Hương testing"
        echo "   - Improved data source selection logic"
        ;;
    "analyze")
        echo "🔍 Augment Analyze: $DESCRIPTION"
        echo ""

        if [ -f "$DESCRIPTION" ]; then
            echo "📁 File: $DESCRIPTION"
            echo "📏 Lines: $(wc -l < "$DESCRIPTION")"
            echo "📊 Size: $(wc -c < "$DESCRIPTION") bytes"
            echo ""
            echo "🔍 Quick Analysis:"

            # Check for common issues
            if grep -q "console.log" "$DESCRIPTION"; then
                echo "🐛 Found console.log statements - consider removing for production"
            fi

            if grep -q ": any" "$DESCRIPTION"; then
                echo "🐛 Found 'any' type usage - consider using specific types"
            fi

            if grep -q "== " "$DESCRIPTION" || grep -q "!= " "$DESCRIPTION"; then
                echo "🐛 Found loose equality operators - consider using === or !=="
            fi

            if grep -q "useEffect" "$DESCRIPTION" && ! grep -q "dependencies" "$DESCRIPTION"; then
                echo "⚡ useEffect found - check dependency arrays"
            fi

            if grep -q "selectedMember" "$DESCRIPTION"; then
                echo "🎯 Found selectedMember usage - relevant to current issue"
                echo "   Lines with selectedMember:"
                grep -n "selectedMember" "$DESCRIPTION" | head -5
            fi

            echo ""
            echo "✅ Analysis complete"
        else
            echo "❌ File not found: $DESCRIPTION"
        fi
        ;;
    "search")
        echo "🔍 Augment Search: $DESCRIPTION"
        echo ""

        echo "🔍 Searching for pattern: '$DESCRIPTION'"
        echo "📁 Directory: packages/web/src"
        echo ""

        # Search in TypeScript/JavaScript files
        MATCHING_FILES=$(find packages/web/src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "$DESCRIPTION" 2>/dev/null || true)

        if [ -n "$MATCHING_FILES" ]; then
            echo "$MATCHING_FILES" | while IFS= read -r file; do
                echo "📄 Found in: $file"
                grep -n "$DESCRIPTION" "$file" | head -3 | while IFS= read -r line; do
                    echo "   $line"
                done
                echo ""
            done
        else
            echo "❌ No matches found for '$DESCRIPTION'"
        fi

        echo "✅ Search complete"
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Available commands: fix, analyze, search"
        exit 1
        ;;
esac
