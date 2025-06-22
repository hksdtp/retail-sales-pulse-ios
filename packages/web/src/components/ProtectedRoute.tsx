import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

import ChangePasswordForm from './ChangePasswordForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    isFirstLogin,
    currentUser,
    requirePasswordChange,
    blockAppAccess
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem người dùng đã xác thực chưa sau khi trang được tải
    // Chỉ redirect về login nếu thực sự không có user và không phải trường hợp cần đổi mật khẩu
    if (!isLoading && !currentUser && !requirePasswordChange) {
      navigate('/login');
    }
  }, [isLoading, currentUser, requirePasswordChange, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Đang xác thực người dùng..." />;
  }

  // Nếu có user nhưng cần đổi mật khẩu (first login), hiển thị form đổi mật khẩu
  if (currentUser && (isFirstLogin || requirePasswordChange)) {
    return <ChangePasswordForm />;
  }

  // Nếu không có user và không phải trường hợp đổi mật khẩu, redirect về login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có user nhưng bị block (không nên xảy ra sau khi sửa logic trên)
  if (blockAppAccess) {
    return <ChangePasswordForm />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
