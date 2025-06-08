import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GoogleLoginButtonProps {
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { users } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // Kiểm tra xem Google API có sẵn không
      if (!window.google) {
        throw new Error('Google API chưa được tải');
      }

      // Khởi tạo Google Sign-In
      await new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id:
            process.env.REACT_APP_GOOGLE_CLIENT_ID ||
            '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
          callback: (response: any) => {
            try {
              // Decode JWT token để lấy thông tin user
              const payload = JSON.parse(atob(response.credential.split('.')[1]));

              // Tìm user trong hệ thống dựa trên email
              const user = users.find((u) => u.email === payload.email);

              if (!user) {
                toast({
                  title: 'Đăng nhập thất bại',
                  description: 'Email này chưa được đăng ký trong hệ thống',
                  variant: 'destructive',
                });
                reject(new Error('User not found'));
                return;
              }

              // Lưu thông tin user vào localStorage
              localStorage.setItem('currentUser', JSON.stringify(user));
              localStorage.setItem('googleAuth', 'true');

              toast({
                title: 'Đăng nhập thành công',
                description: `Chào mừng ${user.name}!`,
              });

              // Chuyển hướng về trang chính
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);

              resolve(response);
            } catch (error) {
              console.error('Lỗi khi xử lý Google login:', error);
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Hiển thị popup đăng nhập
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback: Hiển thị One Tap nếu popup không hiển thị
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'signin_with',
                shape: 'rectangular',
              },
            );
          }
        });
      });
    } catch (error) {
      console.error('Lỗi Google Login:', error);
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="w-full"
    >
      {/* Google Sign-In Button Container */}
      <div id="google-signin-button" className="w-full mb-4"></div>

      {/* Custom Google Login Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-3"></span>
            Đang đăng nhập...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập bằng Google
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default GoogleLoginButton;
