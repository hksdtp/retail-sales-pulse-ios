#!/bin/bash

# Script tạo aliases cho MCP commands
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🔧 Thiết lập aliases cho MCP commands..."
echo "======================================="

# Tạo file aliases
cat > ~/.mcp_aliases << 'EOF'
# MCP Aliases for Retail Sales Pulse iOS
# Ninh ơi - Auto-generated aliases

# Playwright MCP aliases
alias plw='node mcp-servers/playwright-mcp.js'
alias plw-test='plw test'
alias plw-debug='plw debug'

# Augment MCP aliases  
alias aug='node mcp-servers/augment-mcp.js'
alias aug-fix='aug fix'
alias aug-analyze='aug analyze'

# Project aliases
alias start-all='npm run start:all'
alias stop-all='npm run stop:all'
alias dev-web='cd packages/web && bun run dev'

echo "🎯 MCP Servers sẵn sàng!"
EOF

# Thêm vào shell profile
SHELL_PROFILE=""
if [ -f ~/.zshrc ]; then
    SHELL_PROFILE=~/.zshrc
elif [ -f ~/.bashrc ]; then
    SHELL_PROFILE=~/.bashrc
elif [ -f ~/.bash_profile ]; then
    SHELL_PROFILE=~/.bash_profile
fi

if [ -n "$SHELL_PROFILE" ]; then
    # Kiểm tra xem đã có source chưa
    if ! grep -q "source ~/.mcp_aliases" "$SHELL_PROFILE"; then
        echo "" >> "$SHELL_PROFILE"
        echo "# MCP Aliases for Retail Sales Pulse iOS" >> "$SHELL_PROFILE"
        echo "source ~/.mcp_aliases" >> "$SHELL_PROFILE"
        echo "✅ Đã thêm aliases vào $SHELL_PROFILE"
    else
        echo "✅ Aliases đã tồn tại trong $SHELL_PROFILE"
    fi
fi

# Source aliases ngay lập tức
source ~/.mcp_aliases

echo ""
echo "🎉 Aliases đã được thiết lập!"
echo "📋 Lệnh có sẵn:"
echo "  plw test <mô tả> - Test với Playwright"
echo "  aug fix <mô tả> - Fix code với Augment"
echo "  start-all - Khởi động tất cả services"
echo "  stop-all - Dừng tất cả services"
echo ""
echo "🔄 Khởi động lại terminal hoặc chạy: source ~/.mcp_aliases"
