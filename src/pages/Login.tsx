import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, Store, Lock, Clock } from 'lucide-react';
import '../styles/login-theme.css';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);
  
  useEffect(() => {
    // Kiểm tra nếu người dùng đã xác thực, chuyển hướng đến trang chủ
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleDepartmentSelection = (department: string) => {
    setSelectedDepartment(department);
    setShowLoginForm(true);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: showLoginForm && selectedDepartment === 'retail'
            ? 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #6c5ce7, #a66efa, #ff6b6b, #4ecdc4)'
            : showLoginForm && selectedDepartment === 'project'
            ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #0f0f0f 100%)',
          backgroundSize: showLoginForm && selectedDepartment === 'retail' ? '400% 400%' : '400% 400%',
          animation: showLoginForm && selectedDepartment === 'retail'
            ? 'gradient-animation 15s ease infinite'
            : 'gradient-animation 25s ease infinite'
        }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-1000 animate-float"
          style={{
            opacity: showLoginForm && selectedDepartment === 'retail' ? 0.3 : 0.2,
            backgroundImage: showLoginForm && selectedDepartment === 'retail'
              ? `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
              : `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.05) 20px,
                  rgba(255,255,255,0.05) 40px
                )`
          }}
        ></div>
      </div>
      
      {!showLoginForm ? (
        // Hiển thị hai phân vùng khi chưa chọn
        <motion.div 
          className="w-full h-full flex flex-col md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Phòng Dự án - Phân vùng trái (Tạm khóa - Màu đen trắng) */}
          <motion.div
            id="left-section"
            className={`w-full md:w-1/2 h-full flex items-center justify-center p-5 cursor-not-allowed transition-all duration-500 relative`}
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
              filter: 'grayscale(100%) contrast(1.2)',
            }}
            initial={{ opacity: 0.9 }}
            onHoverStart={() => setHoveredDepartment('project')}
            onHoverEnd={() => setHoveredDepartment(null)}
          >
            {/* Overlay pattern để tạo hiệu ứng locked */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`
            }}></div>

            {/* Scan line effect */}
            <div className="scan-line"></div>

            <motion.div
              className="relative z-10 bg-black/40 backdrop-blur-sm border border-white/20 p-10 text-center max-w-md mx-auto transition-all duration-300 group rounded-2xl"
              whileHover={{
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated building icon */}
              <motion.div
                animate={{
                  rotateY: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Building size={80} className="text-gray-300 mx-auto mb-6 group-hover:text-white transition-colors filter drop-shadow-lg" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-gray-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                Phòng Dự Án
              </h2>
              <p className="text-gray-400 group-hover:text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mb-4">
                Quản lý và theo dõi toàn bộ dự án của công ty
              </p>

              {/* Status indicators with animation */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                ></motion.div>
                <span className="text-gray-300 text-sm flex items-center gap-1">
                  <Clock size={14} />
                  Đang phát triển
                </span>
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                ></motion.div>
              </div>

              <motion.button
                className="w-full py-3 px-6 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 cursor-not-allowed transition-all duration-300 hover:bg-gray-600 hover:text-white flex items-center justify-center gap-2"
                disabled
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Lock size={16} />
                Tạm khóa
              </motion.button>

              {/* Lock icon overlay */}
              <div className="absolute top-4 right-4 text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                </svg>
              </div>

              {/* Coming soon badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-xs px-3 py-1 rounded-full border border-gray-600">
                Sắp ra mắt
              </div>

              {/* Progress indicator with animation */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Tiến độ phát triển</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    25%
                  </motion.span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-gray-500 to-gray-400 h-1 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '25%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Phòng Bán lẻ - Phân vùng phải */}
          <motion.div
            id="right-section"
            className={`w-full md:w-1/2 h-full flex items-center justify-center p-5 cursor-pointer transition-all duration-500 relative ${hoveredDepartment === 'project' ? 'department-dimmed' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #6c5ce7 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradient-animation 15s ease infinite'
            }}
            initial={{ opacity: 0.9 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            onHoverStart={() => setHoveredDepartment('retail')}
            onHoverEnd={() => setHoveredDepartment(null)}
            onClick={() => handleDepartmentSelection('retail')}
          >
            {/* Colorful overlay pattern */}
            <div className="absolute inset-0 opacity-30 bg-pattern animate-float"></div>

            <div className="relative z-10 bg-white/15 backdrop-blur-lg border border-white/20 p-10 text-center max-w-md mx-auto transition-all duration-300 group rounded-2xl">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <Store size={80} className="text-white mx-auto mb-6 group-hover:text-white filter drop-shadow-lg" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                Phòng Bán Lẻ
              </h2>
              <p className="text-white/90 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] mb-6">
                Quản lý và theo dõi hoạt động kinh doanh bán lẻ
              </p>

              {/* Active status indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                ></motion.div>
                <span className="text-white/90 text-sm">Đang hoạt động</span>
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                ></motion.div>
              </div>

              <motion.button
                className="login-button mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Đăng nhập
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        // Hiển thị form đăng nhập sau khi đã chọn phòng ban
        <motion.div
          className="w-full max-w-md mx-auto px-5 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`backdrop-blur-lg p-8 md:p-10 rounded-[20px] border transition-all duration-1000 ${
              selectedDepartment === 'retail'
                ? 'bg-white/95 border-white/30 shadow-[0_10px_25px_rgba(108,92,231,0.5)]'
                : 'bg-white/95 border-white/30 shadow-[0_10px_25px_rgba(108,92,231,0.5)]'
            }`}
            whileHover={{
              translateY: -5,
              boxShadow: selectedDepartment === 'retail'
                ? '0 15px 35px rgba(108, 92, 231, 0.6)'
                : '0 15px 35px rgba(108, 92, 231, 0.6)',
              transition: { duration: 0.4 }
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setShowLoginForm(false)}
                className="text-[#636e72] hover:text-[#6c5ce7] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </button>
              <div className="flex items-center">
                {selectedDepartment === 'project' ? (
                  <>
                    <Building size={24} className="text-[#6c5ce7] mr-2" />
                    <span className="text-[#2d3436] font-semibold">Phòng Dự Án</span>
                  </>
                ) : (
                  <>
                    <Store size={24} className="text-[#6c5ce7] mr-2" />
                    <span className="text-[#2d3436] font-semibold">Phòng Bán Lẻ</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-[#2d3436] font-bold text-2xl md:text-3xl mb-2 uppercase tracking-wide">
                Chào Mừng Trở Lại
              </h1>
              <p className="text-[#636e72] text-sm md:text-base font-medium">
                Vui lòng đăng nhập để tiếp tục
              </p>
            </div>

            <LoginForm departmentType={selectedDepartment} />
            
            <div className="flex justify-between mt-7">
              <a href="#" className="text-[#636e72] text-sm md:text-base transition-all duration-300 px-4 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                  </svg>
                </span>
                Quên mật khẩu?
              </a>
              <a href="#" className="text-[#636e72] text-sm md:text-base transition-all duration-300 px-4 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </span>
                Trợ giúp
              </a>
            </div>
            
            {/* Đã xóa phần đăng ký tài khoản theo yêu cầu */}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
