import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContextSupabase';
import InlineLoadingSpinner from '@/components/ui/InlineLoadingSpinner';

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

  console.log('🛡️ ProtectedRoute: Checking access', {
    isLoading,
    currentUser: currentUser?.name,
    isAuthenticated,
    isFirstLogin,
    requirePasswordChange,
    blockAppAccess,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    // Chỉ redirect về login nếu không đang loading và thực sự không có user
    if (!isLoading && !currentUser) {
      console.log('🔄 ProtectedRoute: No user found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isLoading, currentUser, navigate]);

  // Hiển thị loading screen khi đang xác thực
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Loading authentication...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <InlineLoadingSpinner message="Đang xác thực người dùng..." size="lg" />
      </div>
    );
  }

  // Nếu không có user, redirect về login
  if (!currentUser) {
    
    return <Navigate to="/login" replace />;
  }

  // Nếu có user nhưng cần đổi mật khẩu (first login hoặc required change)
  if (currentUser && (isFirstLogin || requirePasswordChange || blockAppAccess)) {
    console.log('🔐 ProtectedRoute: Password change required, showing form');
    return <ChangePasswordForm />;
  }

  // Nếu user đã xác thực và không cần đổi mật khẩu, cho phép truy cập
  
  return <>{children}</>;
};

export default ProtectedRoute;
