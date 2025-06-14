#!/bin/bash

# Script cài đặt MCP Playwright và MCP Augment servers
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🚀 Cài đặt MCP Servers cho Retail Sales Pulse iOS"
echo "=================================================="

# Kiểm tra và cài đặt Node.js nếu chưa có
if ! command -v node &> /dev/null; then
    echo "📦 Node.js chưa được cài đặt. Đang cài đặt..."
    
    # Cài đặt Homebrew nếu chưa có
    if ! command -v brew &> /dev/null; then
        echo "🍺 Cài đặt Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Thêm Homebrew vào PATH
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    # Cài đặt Node.js
    echo "📦 Cài đặt Node.js..."
    brew install node
else
    echo "✅ Node.js đã được cài đặt: $(node --version)"
fi

# Kiểm tra npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm không khả dụng"
    exit 1
else
    echo "✅ npm đã sẵn sàng: $(npm --version)"
fi

# Cài đặt MCP servers
echo "📦 Cài đặt MCP Playwright Server..."
npm install -g @modelcontextprotocol/server-playwright

echo "📦 Cài đặt MCP Augment Server..."
npm install -g @modelcontextprotocol/server-augment

# Tạo thư mục config nếu chưa có
mkdir -p ~/.config/mcp

# Tạo file cấu hình MCP
echo "⚙️ Tạo file cấu hình MCP..."
cat > ~/.config/mcp/config.json << 'EOF'
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "~/.cache/ms-playwright"
      }
    },
    "augment": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-augment"],
      "env": {
        "AUGMENT_API_KEY": "${AUGMENT_API_KEY}"
      }
    }
  }
}
EOF

# Cài đặt Playwright browsers
echo "🎭 Cài đặt Playwright browsers..."
npx playwright install

echo "✅ Cài đặt hoàn tất!"
echo ""
echo "📋 Các lệnh có sẵn:"
echo "  plw - MCP Playwright commands"
echo "  aug - MCP Augment commands"
echo ""
echo "🔧 Để sử dụng, hãy chạy:"
echo "  npm run start:all"
