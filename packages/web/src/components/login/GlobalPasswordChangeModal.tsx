import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContextSupabase';
import ChangePasswordModal from './ChangePasswordModal';
import { useToast } from '@/hooks/use-toast';

/**
 * Global Password Change Modal
 * 
 * This component renders globally and shows the password change modal
 * when a user needs to change their password, regardless of which page they're on.
 * 
 * This fixes the issue where the modal was only available on the login page,
 * but users could be redirected to the main app after refresh while still
 * needing to change their password.
 */
const GlobalPasswordChangeModal: React.FC = () => {
  console.log('🌍 GlobalPasswordChangeModal: Component rendered');

  const {
    currentUser,
    isFirstLogin,
    requirePasswordChange,
    changePassword,
    logout
  } = useAuth();

  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log('🌍 GlobalPasswordChangeModal: showModal state changed:', showModal);
  }, [showModal]);

  console.log('🌍 GlobalPasswordChangeModal: Initial state', {
    currentUser: currentUser?.name,
    isFirstLogin,
    requirePasswordChange,
    showModal
  });

  // Debug logging
  useEffect(() => {
    console.log('🌍 GlobalPasswordChangeModal: Auth state changed', {
      currentUser: currentUser?.name,
      isFirstLogin,
      requirePasswordChange,
      showModal,
      currentUrl: window.location.href
    });
  }, [currentUser, isFirstLogin, requirePasswordChange, showModal]);

  // Show modal when ANY USER needs to change password - ENHANCED LOGIC WITH ADMIN CHECK
  useEffect(() => {
    // Admin users should never see password change modal
    const isAdmin = currentUser?.role === 'admin' || currentUser?.name === 'Khổng Đức Mạnh';
    const shouldShowModal = currentUser && (isFirstLogin || requirePasswordChange) && !isAdmin;

    console.log('🌍 GlobalPasswordChangeModal: DETAILED CHECK for modal display:', {
      currentUser: currentUser?.name,
      userRole: currentUser?.role,
      userPasswordChanged: currentUser?.password_changed,
      isAdmin,
      isFirstLogin,
      requirePasswordChange,
      shouldShowModal,
      currentShowModal: showModal,
      currentUrl: window.location.href,
      calculation: {
        hasCurrentUser: !!currentUser,
        isAdminUser: isAdmin,
        isFirstLoginCheck: isFirstLogin,
        requirePasswordChangeCheck: requirePasswordChange,
        finalShouldShow: shouldShowModal
      }
    });

    if (shouldShowModal && !showModal) {
      console.log('🔄 GlobalPasswordChangeModal: OPENING modal for user:', currentUser.name);
      setShowModal(true);
    } else if (!shouldShowModal && showModal) {
      console.log('🔄 GlobalPasswordChangeModal: CLOSING modal');
      setShowModal(false);
    } else if (shouldShowModal && showModal) {
      console.log('✅ GlobalPasswordChangeModal: Modal already open - no action needed');
    } else {
      console.log('ℹ️ GlobalPasswordChangeModal: No modal needed', {
        reason: isAdmin ? 'admin user' : 'password already changed',
        isAdmin,
        passwordChanged: currentUser?.password_changed
      });
    }
  }, [currentUser, isFirstLogin, requirePasswordChange, showModal]);

  // Handle password change - ENHANCED WITH BETTER STATE MANAGEMENT
  const handlePasswordChange = async (newPassword: string) => {
    try {
      console.log('🔄 GlobalPasswordChangeModal: Handling password change for user:', currentUser?.name);
      console.log('🔄 GlobalPasswordChangeModal: New password length:', newPassword?.length);
      console.log('🔄 GlobalPasswordChangeModal: Current auth states before change:', {
        isFirstLogin,
        requirePasswordChange,
        showModal
      });

      console.log('🔄 GlobalPasswordChangeModal: Calling changePassword from AuthContext...');
      await changePassword(newPassword);

      console.log('✅ GlobalPasswordChangeModal: Password change successful');
      console.log('✅ GlobalPasswordChangeModal: Auth states after change:', {
        isFirstLogin,
        requirePasswordChange,
        showModal
      });

      // Force close modal immediately
      setShowModal(false);

      toast({
        title: 'Đổi mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật.',
      });

      // Small delay before redirect to ensure state is updated
      setTimeout(() => {
        console.log('🔄 GlobalPasswordChangeModal: Final auth states after timeout:', {
          isFirstLogin,
          requirePasswordChange,
          showModal
        });

        // If we're on login page, redirect to main app
        if (window.location.pathname === '/login') {
          console.log('🔄 GlobalPasswordChangeModal: Redirecting from login page to main app');
          window.location.href = '/';
        } else {
          console.log('✅ GlobalPasswordChangeModal: Password change completed, staying on current page');
        }
      }, 500); // Increased timeout to ensure state updates

    } catch (error) {
      console.error('❌ GlobalPasswordChangeModal: Password change failed:', error);
      console.error('❌ GlobalPasswordChangeModal: Error details:', error);
      toast({
        title: 'Lỗi đổi mật khẩu',
        description: 'Không thể đổi mật khẩu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel - logout user since password change is required
  const handleCancel = () => {
    console.log('🚫 GlobalPasswordChangeModal: User cancelled password change - logging out');
    
    setShowModal(false);
    
    toast({
      title: 'Đăng xuất',
      description: 'Bạn cần đổi mật khẩu để tiếp tục sử dụng hệ thống.',
      variant: 'default',
    });

    // Logout user since password change is mandatory
    setTimeout(() => {
      logout();
    }, 1000);
  };

  // Don't render anything if modal shouldn't be shown to avoid duplicates
  if (!showModal || !currentUser) {
    console.log('🌍 GlobalPasswordChangeModal: Not rendering modal:', {
      showModal,
      hasCurrentUser: !!currentUser,
      currentUser: currentUser?.name
    });
    return null;
  }

  return (
    <div data-testid="global-password-change-modal-wrapper" key={`global-modal-${currentUser.id}`}>
      <ChangePasswordModal
        key={`change-password-modal-${currentUser.id}`}
        isOpen={showModal}
        onPasswordChange={handlePasswordChange}
        onCancel={handleCancel}
        userName={currentUser.name}
        blockAppAccess={true} // Always block app access for global modal
      />
    </div>
  );
};

export default GlobalPasswordChangeModal;
