#!/bin/bash

# Setup aliases for MCP commands
# Run this script to add aliases to your shell profile

echo "🔧 Setting up MCP command aliases..."

# Get current directory
CURRENT_DIR="$(pwd)"

# Determine shell profile file
if [ -n "$ZSH_VERSION" ]; then
    PROFILE_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    PROFILE_FILE="$HOME/.bash_profile"
    [ ! -f "$PROFILE_FILE" ] && PROFILE_FILE="$HOME/.bashrc"
else
    PROFILE_FILE="$HOME/.profile"
fi

echo "📝 Adding aliases to: $PROFILE_FILE"

# Create backup
cp "$PROFILE_FILE" "$PROFILE_FILE.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null

# Add aliases
cat >> "$PROFILE_FILE" << EOF

# MCP Augment and Playwright aliases
alias aug="$CURRENT_DIR/aug"
alias plw="$CURRENT_DIR/plw"

# Quick MCP commands
alias aug-search="$CURRENT_DIR/aug search"
alias aug-analyze="$CURRENT_DIR/aug analyze"
alias aug-fix="$CURRENT_DIR/aug fix"
alias plw-test="$CURRENT_DIR/plw test"
alias plw-open="$CURRENT_DIR/plw open"
alias plw-status="$CURRENT_DIR/plw status"

EOF

echo "✅ Aliases added successfully!"
echo ""
echo "🔄 To use the aliases, either:"
echo "   1. Restart your terminal, or"
echo "   2. Run: source $PROFILE_FILE"
echo ""
echo "📋 Available commands:"
echo "   aug [command]     - Augment MCP commands"
echo "   plw [command]     - Playwright MCP commands"
echo ""
echo "📋 Quick aliases:"
echo "   aug-search [term] - Search codebase"
echo "   aug-analyze [query] - Analyze codebase"
echo "   aug-fix [error]   - Find code related to error"
echo "   plw-test [desc]   - Run test scenario"
echo "   plw-open [url]    - Open URL in browser"
echo "   plw-status        - Check Playwright status"
echo ""
echo "💡 Examples:"
echo "   aug search 'useState'"
echo "   aug fix 'TypeError: Cannot read property'"
echo "   plw test 'login functionality'"
echo "   plw open 'http://localhost:8088'"
