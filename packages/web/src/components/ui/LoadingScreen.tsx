import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Đang tải...", 
  showLogo = true 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      {/* Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
      
      {/* Loading content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Glass card container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 min-w-[300px]">
          
          {/* Logo section */}
          {showLogo && (
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                <img
                  src="/logo.webp"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </motion.div>
              
              <motion.h2
                className="text-xl font-bold text-gray-800 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Phòng Kinh Doanh
              </motion.h2>
              
              <motion.p
                className="text-sm text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Quản Lý Phòng Kinh Doanh Bán Lẻ
              </motion.p>
            </motion.div>
          )}

          {/* Loading message */}
          <motion.p
            className="text-gray-700 font-medium mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {message}
          </motion.p>

          {/* Modern spinner */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                className="w-12 h-12 rounded-full border-4 border-gray-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Gradient ring */}
              <motion.div
                className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent"
                style={{
                  borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6) 1',
                  borderTopColor: '#3b82f6',
                  borderRightColor: '#8b5cf6'
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Center pulse */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
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

          {/* Progress bar */}
          <motion.div
            className="mt-6 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1.5 h-1.5 bg-blue-400/30 rounded-full"
            style={{
              left: `${10 + index * 10}%`,
              top: `${20 + (index % 3) * 20}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2.5 + index * 0.3,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
