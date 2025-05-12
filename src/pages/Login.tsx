
import React from 'react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/login/LoginForm';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#4ecdc4] to-[#6c5ce7] bg-[length:400%_400%] animate-gradient-animation"
      >
        <div className="absolute inset-0 opacity-30 bg-pattern animate-float"></div>
      </div>
      
      <motion.div 
        className="w-full max-w-md mx-auto px-5 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-lg p-8 md:p-10 rounded-[20px] border border-white/30 shadow-xl"
          whileHover={{ translateY: -5, rotate: 1, transition: { duration: 0.4 } }}
        >
          <div className="text-center mb-8">
            <h1 className="text-[#2d3436] font-bold text-2xl md:text-3xl mb-2 uppercase tracking-wide">
              Chào Mừng Trở Lại
            </h1>
            <p className="text-[#636e72] text-sm md:text-base font-medium">
              Vui lòng đăng nhập để tiếp tục
            </p>
          </div>

          <LoginForm />
          
          <div className="flex justify-between mt-7">
            <a href="#" className="text-[#636e72] text-sm md:text-base transition-all duration-300 px-4 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              </span>
              Quên mật khẩu?
            </a>
            <a href="#" className="text-[#636e72] text-sm md:text-base transition-all duration-300 px-4 py-2 rounded-lg hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/10 hover:-translate-y-0.5 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
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
    </div>
  );
};

export default Login;
