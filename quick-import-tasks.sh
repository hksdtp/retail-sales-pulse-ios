#!/bin/bash

# Quick Import Script cho Supabase Tasks Migration
# Chạy script này để import nhanh vào Supabase

echo "🚀 STARTING SUPABASE TASKS MIGRATION..."
echo "========================================"

# Kiểm tra file SQL
if [ ! -f "supabase-tasks-migration.sql" ]; then
    echo "❌ Không tìm thấy file supabase-tasks-migration.sql"
    exit 1
fi

echo "📁 File SQL found: supabase-tasks-migration.sql"
echo "📊 File size: $(du -h supabase-tasks-migration.sql | cut -f1)"

echo ""
echo "🔧 HƯỚNG DẪN IMPORT VÀO SUPABASE:"
echo "1. Mở Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Chọn project: fnakxavwxubnbucfoujd"
echo "3. Vào SQL Editor"
echo "4. Copy nội dung file supabase-tasks-migration.sql"
echo "5. Paste vào SQL Editor và click Run"
echo ""
echo "📋 EXPECTED RESULTS:"
echo "   - 12 teams imported"
echo "   - 24 users imported"
echo "   - 31 tasks imported"
echo "   - Indexes created"
echo "   - RLS policies enabled"
echo ""
echo "✅ Ready for import!"
