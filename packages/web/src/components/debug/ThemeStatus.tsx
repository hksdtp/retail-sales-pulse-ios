import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeStatusProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  show?: boolean;
}

export const ThemeStatus: React.FC<ThemeStatusProps> = ({ 
  position = 'bottom-right',
  show = process.env.NODE_ENV === 'development'
}) => {
  const { theme, actualTheme } = useTheme();

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-3 h-3" />;
    }
    return actualTheme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />;
  };

  const getStatusColor = () => {
    if (theme === 'system') {
      return 'bg-blue-500';
    }
    return actualTheme === 'dark' ? 'bg-gray-800' : 'bg-yellow-500';
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className={`
        ${getStatusColor()} 
        text-white text-xs px-2 py-1 rounded-full 
        flex items-center space-x-1 shadow-lg
        transition-all duration-200
      `}>
        {getIcon()}
        <span className="font-medium">
          {theme === 'system' ? `System (${actualTheme})` : theme}
        </span>
      </div>
    </div>
  );
};

export default ThemeStatus;
