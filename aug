#!/bin/bash

# Augment MCP Command Wrapper
# Usage: ./aug [command] [args...]
# Examples:
#   ./aug analyze codebase
#   ./aug search "function name"
#   ./aug fix "error message"

# Setup environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to interact with Augment MCP
send_augment_request() {
    local method="$1"
    local params="$2"

    echo "🔍 Executing Augment MCP request..."
    echo "Method: $method"
    echo ""

    case "$method" in
        "codebase/search")
            echo "🔍 Searching codebase..."
            find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | head -20 | while read file; do
                if grep -l "$params" "$file" 2>/dev/null; then
                    echo "📁 Found in: $file"
                    grep -n "$params" "$file" | head -3
                    echo ""
                fi
            done
            ;;
        "file/read")
            echo "📖 Reading file: $params"
            if [ -f "$params" ]; then
                echo "✅ File content:"
                head -50 "$params"
            else
                echo "❌ File not found: $params"
            fi
            ;;
        "codebase/analyze")
            echo "🔍 Analyzing codebase for: $params"
            echo "📊 Project structure:"
            find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \) | head -20
            echo ""
            echo "🔍 Searching for pattern: $params"
            grep -r "$params" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" . | head -10
            ;;
        "employees/analyze")
            echo "👥 Analyzing employees menu..."
            echo "🔍 Looking for employee-related files..."
            find . -name "*employee*" -o -name "*Employee*" -o -name "*user*" -o -name "*User*" | head -10
            ;;
        *)
            echo "❌ Unknown method: $method"
            return 1
            ;;
    esac
}

# Parse command and arguments
COMMAND="$1"
shift
ARGS="$*"

case "$COMMAND" in
    "analyze"|"analyse")
        echo "🔍 Analyzing codebase..."
        send_augment_request "codebase/analyze" "{\"query\":\"$ARGS\"}"
        ;;
    "search")
        echo "🔍 Searching codebase for: $ARGS"
        send_augment_request "codebase/search" "{\"pattern\":\"$ARGS\"}"
        ;;
    "read")
        echo "📖 Reading file: $ARGS"
        send_augment_request "file/read" "{\"filePath\":\"$ARGS\"}"
        ;;
    "employees")
        echo "👥 Analyzing employees menu..."
        send_augment_request "employees/analyze" "{}"
        ;;
    "fix")
        echo "🔧 Analyzing issue: $ARGS"
        echo "Searching for related code..."
        send_augment_request "codebase/search" "{\"pattern\":\"$ARGS\"}"
        ;;
    "help"|"--help"|"-h"|"")
        echo "🤖 Augment MCP Command Wrapper"
        echo ""
        echo "Usage: ./aug [command] [args...]"
        echo ""
        echo "Commands:"
        echo "  analyze [query]     - Analyze codebase with query"
        echo "  search [pattern]    - Search for pattern in codebase"
        echo "  read [file]         - Read specific file"
        echo "  employees          - Analyze employees menu"
        echo "  fix [error]        - Search for code related to error"
        echo "  help               - Show this help"
        echo ""
        echo "Examples:"
        echo "  ./aug analyze \"React components\""
        echo "  ./aug search \"useState\""
        echo "  ./aug read \"src/App.tsx\""
        echo "  ./aug fix \"TypeError: Cannot read property\""
        echo ""
        echo "💡 Make sure Augment MCP server is running: bun run aug"
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "💡 Use './aug help' to see available commands"
        exit 1
        ;;
esac
