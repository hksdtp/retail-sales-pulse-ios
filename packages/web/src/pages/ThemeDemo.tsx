import { Moon, Palette, Sun } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { ThemeToggle, QuickThemeToggle, ThemeIndicator } from '@/components/ui/theme-toggle';
import { useTheme } from '@/context/ThemeContext';

const ThemeDemo: React.FC = () => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 Theme Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test chức năng chuyển đổi giao diện sáng/tối
          </p>
        </div>

        {/* Current Theme Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thông tin chế độ hiện tại
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Chế độ đã chọn</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {theme === 'system' ? 'Hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Chế độ thực tế</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {actualTheme === 'dark' ? 'Tối' : 'Sáng'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Trạng thái</p>
              <ThemeIndicator />
            </div>
          </div>
        </div>

        {/* Theme Toggle Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Theme Toggle
              </h3>
              <div className="flex items-center space-x-4">
                <QuickThemeToggle />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Toggle nhanh giữa sáng/tối
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Icon Theme Toggle
              </h3>
              <div className="flex items-center space-x-4">
                <ThemeToggle variant="icon" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Toggle với icon
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Button Theme Toggle
              </h3>
              <div className="flex items-center space-x-4">
                <ThemeToggle variant="default" showLabel={true} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Button với label
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dropdown Theme Toggle
              </h3>
              <ThemeToggle variant="dropdown" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Manual Controls
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setTheme('light')}
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="w-full justify-start"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Chế độ sáng
                </Button>
                <Button
                  onClick={() => setTheme('dark')}
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="w-full justify-start"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Chế độ tối
                </Button>
                <Button
                  onClick={() => setTheme('system')}
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="w-full justify-start"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Theo hệ thống
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Demo Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Card 1</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Nội dung demo với màu xanh
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100">Card 2</h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Nội dung demo với màu xanh lá
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Card 3</h4>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Nội dung demo với màu tím
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Theme được lưu tự động trong localStorage
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
