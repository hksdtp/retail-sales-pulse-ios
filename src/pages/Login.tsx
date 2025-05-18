
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, Store } from 'lucide-react';
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
        className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#4ecdc4] to-[#6c5ce7] bg-[length:400%_400%] animate-gradient-animation"
      >
        <div className="absolute inset-0 opacity-30 bg-pattern animate-float"></div>
      </div>
      
      {!showLoginForm ? (
        // Hiển thị hai phân vùng khi chưa chọn
        <motion.div 
          className="w-full h-full flex flex-col md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Phòng Dự án - Phân vùng trái */}
          <motion.div 
            id="left-section"
            className={`w-full md:w-1/2 h-full flex items-center justify-center p-5 cursor-pointer transition-all duration-500 ${hoveredDepartment === 'retail' ? 'department-dimmed' : ''}`}
            initial={{ opacity: 0.9 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            onHoverStart={() => setHoveredDepartment('project')}
            onHoverEnd={() => setHoveredDepartment(null)}
            onClick={() => handleDepartmentSelection('project')}
          >
            <div className="login-glass p-10 text-center max-w-md mx-auto transition-all duration-300 group">
              <Building size={80} className="text-white mx-auto mb-6 group-hover:text-white" />
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">Phòng Dự Án</h2>
              <p className="text-white/80 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Quản lý và theo dõi toàn bộ dự án của công ty</p>
              
              <motion.button
                className="login-button mt-8 w-full"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Đăng nhập
              </motion.button>
            </div>
          </motion.div>
          
          {/* Phòng Bán lẻ - Phân vùng phải */}
          <motion.div 
            id="right-section"
            className={`w-full md:w-1/2 h-full flex items-center justify-center p-5 cursor-pointer transition-all duration-500 ${hoveredDepartment === 'project' ? 'department-dimmed' : ''}`}
            initial={{ opacity: 0.9 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            onHoverStart={() => setHoveredDepartment('retail')}
            onHoverEnd={() => setHoveredDepartment(null)}
            onClick={() => handleDepartmentSelection('retail')}
          >
            <div className="login-glass p-10 text-center max-w-md mx-auto transition-all duration-300 group">
              <Store size={80} className="text-white mx-auto mb-6 group-hover:text-white" />
              <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">Phòng Bán Lẻ</h2>
              <p className="text-white/80 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Quản lý và theo dõi hoạt động kinh doanh bán lẻ</p>
              
              <motion.button
                className="login-button mt-8 w-full"
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
            className="bg-white/95 backdrop-blur-lg p-8 md:p-10 rounded-[20px] border border-white/30 shadow-[0_10px_25px_rgba(108,92,231,0.5)] dark:shadow-[0_10px_25px_rgba(108,92,231,0.3)]"
            whileHover={{ translateY: -5, boxShadow: '0 15px 35px rgba(108, 92, 231, 0.6)', transition: { duration: 0.4 } }}
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
            
            <div className="text-center mt-8 text-[#636e72] text-sm md:text-base">
              Chưa có tài khoản? 
              <a href="#" className="text-[#6c5ce7] font-bold ml-1 relative group">
                Đăng ký ngay
                <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-[#6c5ce7] group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
