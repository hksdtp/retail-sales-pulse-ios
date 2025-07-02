import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import SupabaseSetup from '@/components/supabase/SupabaseSetup';

const SupabaseSetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cấu hình Supabase
          </h1>
          <div /> {/* Spacer for centering */}
        </div>

        {/* Setup Component */}
        <div className="flex justify-center">
          <SupabaseSetup />
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-lg bg-white/50 dark:bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Hướng dẫn cấu hình Supabase
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <strong>1. Tạo project Supabase:</strong>
              <p>Truy cập <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.supabase.com</a> và tạo project mới</p>
            </div>
            <div>
              <strong>2. Lấy thông tin kết nối:</strong>
              <p>Vào Settings → API để lấy URL và Anon Key</p>
            </div>
            <div>
              <strong>3. Cấu hình database:</strong>
              <p>Tạo các bảng cần thiết: users, teams, tasks</p>
            </div>
            <div>
              <strong>4. Cấu hình Row Level Security (RLS):</strong>
              <p>Thiết lập policies để bảo mật dữ liệu</p>
            </div>
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="mt-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <h3 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
            💡 Sử dụng Environment Variables
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Để tự động cấu hình, tạo file <code>.env</code> với:
          </p>
          <pre className="mt-2 rounded bg-yellow-100 dark:bg-yellow-900/40 p-2 text-xs">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupPage;
