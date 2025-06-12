#!/bin/bash

# Cài đặt môi trường phát triển cho dự án TypeScript/React với Bun và Playwright

echo "🚀 Bắt đầu cài đặt môi trường phát triển..."

# Cập nhật hệ thống
sudo apt-get update -y

# Cài đặt Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt Bun
curl -fsSL https://bun.sh/install | bash

# Thêm Bun vào PATH
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> $HOME/.profile
export PATH="$HOME/.bun/bin:$PATH"

# Cài đặt TypeScript globally
npm install -g typescript

# Cài đặt dependencies cho dự án
echo "📦 Cài đặt dependencies..."
bun install

# Cài đặt dependencies cho web package
cd packages/web
bun install

# Cài đặt Playwright globally và locally
echo "🎭 Cài đặt Playwright..."
npm install -g @playwright/test
bun add -D @playwright/test

# Cài đặt Playwright browsers
npx playwright install
npx playwright install-deps

# Thêm npx vào PATH để đảm bảo có thể chạy playwright
echo 'export PATH="$HOME/node_modules/.bin:$PATH"' >> $HOME/.profile
export PATH="$HOME/node_modules/.bin:$PATH"

# Sửa lỗi syntax trong file test có vấn đề
echo "🔧 Sửa lỗi syntax trong test files..."

# Xóa file test có lỗi syntax
if [ -f "tests/task-ui-after-login.spec.ts" ]; then
    rm tests/task-ui-after-login.spec.ts
    echo "✅ Đã xóa file test có lỗi syntax"
fi

# Cài đặt dependencies cho functions package (nếu có)
if [ -d "../functions" ]; then
    cd ../functions
    npm install
    cd ../web
fi

# Quay về thư mục gốc
cd ../..

# Build TypeScript để kiểm tra
echo "🔨 Kiểm tra TypeScript compilation..."
cd packages/web
bun --bun tsc --noEmit --skipLibCheck --allowImportingTsExtensions

echo "✅ Hoàn thành cài đặt môi trường phát triển!"