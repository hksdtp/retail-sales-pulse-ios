import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import '../styles/login-theme.css';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  
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
            : 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #6c5ce7, #a66efa, #ff6b6b, #4ecdc4)',
          backgroundSize: '400% 400%',
          animation: 'gradient-animation 15s ease infinite'
        }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-1000 animate-float"
          style={{
            opacity: 0.3,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        ></div>
      </div>
      
      {!showLoginForm ? (
        // Hiển thị phòng bán lẻ duy nhất
        <motion.div
          className="w-full h-full flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          {/* Phòng Bán lẻ - Toàn màn hình */}
          <motion.div
            id="retail-section"
            className="w-full h-full flex items-center justify-center p-5 cursor-pointer transition-all duration-500 relative"
            style={{
              background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #6c5ce7, #a66efa, #ff6b6b, #4ecdc4)',
              backgroundSize: '400% 400%',
              animation: 'gradient-animation 15s ease infinite'
            }}
            initial={{ opacity: 0.9 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            onClick={() => handleDepartmentSelection('retail')}
          >
            {/* Colorful overlay pattern */}
            <div className="absolute inset-0 opacity-30 bg-pattern animate-float"></div>

            <div className="relative z-10 bg-white/15 backdrop-blur-lg border border-white/20 p-12 text-center max-w-lg mx-auto transition-all duration-300 group rounded-3xl">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
                className="mb-8"
              >
                <Store size={100} className="text-white mx-auto filter drop-shadow-lg" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                Retail Sales Pulse
              </h1>
              <h2 className="text-2xl font-semibold text-white/90 mb-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Hệ thống quản lý bán lẻ
              </h2>
              <p className="text-white/80 text-lg mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Quản lý và theo dõi hoạt động kinh doanh bán lẻ một cách hiệu quả và chuyên nghiệp
              </p>

              {/* Active status indicator */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                ></motion.div>
                <span className="text-white/90 text-lg font-medium">Hệ thống đang hoạt động</span>
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                ></motion.div>
              </div>

              <motion.button
                className="login-button w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Bắt đầu sử dụng
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
