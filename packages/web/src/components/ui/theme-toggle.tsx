import { Monitor, Moon, Sun } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'icon' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return actualTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'Hệ thống';
    }
    return actualTheme === 'dark' ? 'Tối' : 'Sáng';
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={toggleTheme}
        className="relative"
        title={`Chế độ hiện tại: ${getLabel()}`}
      >
        {getIcon()}
        {showLabel && <span className="ml-2">{getLabel()}</span>}
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Giao diện:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 mr-1.5" />
            Sáng
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 mr-1.5" />
            Tối
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              theme === 'system'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4 mr-1.5" />
            Hệ thống
          </button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      className="flex items-center space-x-2"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </Button>
  );
};

// Quick toggle component for header/navbar
export const QuickThemeToggle: React.FC = () => {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Chuyển sang chế độ ${actualTheme === 'dark' ? 'sáng' : 'tối'}`}
    >
      {actualTheme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

// Theme status indicator
export const ThemeIndicator: React.FC = () => {
  const { theme, actualTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
      {theme === 'system' ? (
        <>
          <Monitor className="w-3 h-3" />
          <span>Hệ thống ({actualTheme === 'dark' ? 'Tối' : 'Sáng'})</span>
        </>
      ) : (
        <>
          {actualTheme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          <span>{actualTheme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}</span>
        </>
      )}
    </div>
  );
};
