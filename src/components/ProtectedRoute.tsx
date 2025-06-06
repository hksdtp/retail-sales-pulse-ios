
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isFirstLogin, currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Kiểm tra xem người dùng đã xác thực chưa sau khi trang được tải
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu đây là lần đăng nhập đầu tiên, hiển thị form đổi mật khẩu
  if (isFirstLogin) {
    return <ChangePasswordForm />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
