import React from 'react';
import { motion } from 'framer-motion';

interface InlineLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  className?: string;
}

const InlineLoadingSpinner: React.FC<InlineLoadingSpinnerProps> = ({ 
  message = "Đang tải...", 
  size = 'md',
  showMessage = true,
  className = ""
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className="text-center">
        {/* Modern spinner */}
        <motion.div
          className="flex justify-center mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Gradient ring */}
            <motion.div
              className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-blue-600 border-r-purple-600`}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Center pulse */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Loading message */}
        {showMessage && (
          <motion.p
            className="text-gray-600 font-medium text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}

        {/* Loading dots */}
        <motion.div
          className="flex justify-center space-x-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity,
                delay: index * 0.15
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default InlineLoadingSpinner;
