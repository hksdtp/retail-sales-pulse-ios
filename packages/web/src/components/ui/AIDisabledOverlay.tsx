import { Lock } from 'lucide-react';
import React from 'react';

interface AIDisabledOverlayProps {
  children: React.ReactNode;
  className?: string;
  message?: string;
}

const AIDisabledOverlay: React.FC<AIDisabledOverlayProps> = ({ 
  children, 
  className = '',
  message = 'Tạm khóa để phát triển tiếp'
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Original content with grayscale filter */}
      <div className="filter grayscale opacity-50 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIDisabledOverlay;
