
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isFirstLogin } = useAuth();
  
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
