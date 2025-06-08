import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import React from 'react';

const LoginLoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #6c5ce7, #a66efa, #ff6b6b, #4ecdc4)',
          backgroundSize: '400% 400%',
          animation: 'gradient-animation 15s ease infinite',
        }}
      >
        <div
          className="absolute inset-0 animate-float"
          style={{
            opacity: 0.3,
          }}
        ></div>
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        <motion.div
          className="backdrop-blur-lg p-8 rounded-[20px] border bg-white/95 border-white/30 shadow-[0_10px_25px_rgba(108,92,231,0.5)]"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo với animation */}
          <motion.div
            className="mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              duration: 0.5, 
              type: "spring", 
              stiffness: 200 
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] flex items-center justify-center shadow-lg"
            >
              <Store size={32} className="text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-[#2d3436] font-bold text-xl md:text-2xl mb-2 uppercase tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Phòng Kinh Doanh Bán Lẻ
          </motion.h1>

          {/* Loading text với animation */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.p
              className="text-[#636e72] text-sm font-medium mb-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Đang khởi tạo hệ thống...
            </motion.p>
          </motion.div>

          {/* Loading spinner hiện đại */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                className="w-12 h-12 rounded-full border-4 border-gray-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              {/* Inner ring */}
              <motion.div
                className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-[#6c5ce7] border-r-[#a66efa]"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              {/* Center dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] rounded-full transform -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            className="flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              />
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="mt-6 w-full bg-gray-200 rounded-full h-1 overflow-hidden"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#a66efa] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + (index % 2) * 40}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              delay: index * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginLoadingScreen;
