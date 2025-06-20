#!/bin/bash

# Demo Claude Code với MCP Tools
# Ninh ơi - Retail Sales Pulse iOS Project

echo "🚀 Demo Claude Code với MCP Tools"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 MCP Servers có sẵn:${NC}"
claude mcp list
echo ""

echo -e "${BLUE}🎯 Demo Cases:${NC}"
echo ""

echo -e "${YELLOW}1. Filesystem MCP - Phân tích project structure${NC}"
echo "Command: claude --print \"Analyze project structure using filesystem tools\""
echo ""

echo -e "${YELLOW}2. Git MCP - Kiểm tra repository status${NC}"
echo "Command: claude --print \"Check git status and suggest next development steps\""
echo ""

echo -e "${YELLOW}3. Memory MCP - Store và retrieve context${NC}"
echo "Command: claude --print \"Store current project context in memory for future reference\""
echo ""

echo -e "${YELLOW}4. Sequential Thinking - Problem solving${NC}"
echo "Command: claude --print \"Use sequential thinking to plan mobile UI optimization\""
echo ""

echo -e "${YELLOW}5. Time MCP - Date/time operations${NC}"
echo "Command: claude --print \"Calculate project timeline and milestones using time tools\""
echo ""

echo -e "${GREEN}🚀 Interactive Mode:${NC}"
echo "Command: claude"
echo ""
echo "Trong interactive mode, bạn có thể:"
echo "• Chat với Claude và MCP tools sẽ tự động available"
echo "• Sử dụng /mcp để xem MCP server status"
echo "• Ask Claude to use specific MCP tools"
echo ""

echo -e "${BLUE}💡 Example Interactive Commands:${NC}"
echo ""
echo "\"Please use filesystem tools to read my Login.tsx file and suggest improvements\""
echo ""
echo "\"Use git tools to show me the diff of recent changes\""
echo ""
echo "\"Store the current conversation context in memory for later reference\""
echo ""
echo "\"Use sequential thinking to help me debug the mobile calendar layout issue\""
echo ""

echo -e "${RED}⚠️  Important Notes:${NC}"
echo "• MCP tools work automatically trong Claude Code conversations"
echo "• Custom servers (playwright, augment) vẫn chạy độc lập trên ports 3001, 3002"
echo "• Để sử dụng search tools, cần add BRAVE_API_KEY vào .env"
echo ""

echo -e "${GREEN}🎉 Ready to start!${NC}"
echo "Run: claude"
echo ""

# Offer to start interactive session
read -p "Bạn có muốn start Claude Code interactive session ngay không? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 Starting Claude Code...${NC}"
    echo ""
    claude
else
    echo -e "${YELLOW}💡 Bạn có thể start bất cứ lúc nào với: claude${NC}"
fi
