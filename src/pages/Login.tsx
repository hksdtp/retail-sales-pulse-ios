import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Store, Building2, ArrowLeft } from 'lucide-react';
import '../styles/login-theme.css';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const departmentType = 'retail'; // Cố định là phòng bán lẻ

  useEffect(() => {
    // Kiểm tra nếu người dùng đã xác thực, chuyển hướng đến trang chủ
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const deptInfo = {
    title: 'Phòng Kinh Doanh Bán Lẻ',
    icon: Store,
    color: 'text-[#6c5ce7]'
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #6c5ce7, #a66efa, #ff6b6b, #4ecdc4)',
          backgroundSize: '400% 400%',
          animation: 'gradient-animation 15s ease infinite'
        }}
      >
        <div
          className="absolute inset-0 animate-float"
          style={{
            opacity: 0.3,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* Form đăng nhập trực tiếp */}
      <div className="login-form-container">
        <motion.div
          className="login-form-content px-5 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="login-form-wrapper backdrop-blur-lg p-6 md:p-8 rounded-[20px] border bg-white/95 border-white/30 shadow-[0_10px_25px_rgba(108,92,231,0.5)] w-full"
            whileHover={{
              translateY: -5,
              boxShadow: '0 15px 35px rgba(108, 92, 231, 0.6)',
              transition: { duration: 0.4 }
            }}
          >
          {/* Header với logo và title - compact */}
          <div className="text-center mb-6">
            <motion.div
              className="mb-4"
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.5 }
              }}
            >
              <deptInfo.icon size={50} className={`${deptInfo.color} mx-auto filter drop-shadow-lg`} />
            </motion.div>

            <h1 className="text-[#2d3436] font-bold text-xl md:text-2xl mb-3 uppercase tracking-wide">
              {deptInfo.title}
            </h1>
            <p className="text-[#636e72] text-sm font-medium">
              Vui lòng đăng nhập để tiếp tục
            </p>
          </div>

          <LoginForm departmentType={departmentType} />

          <div className="flex justify-between mt-5">
            <a href="#" className="text-[#636e72] text-sm transition-all duration-300 px-3 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </span>
              Quên mật khẩu?
            </a>
            <a href="#" className="text-[#636e72] text-sm transition-all duration-300 px-3 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              </span>
              Trợ giúp
            </a>
          </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
