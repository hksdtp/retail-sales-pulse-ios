import { motion } from 'framer-motion';
import { Check, Eye, EyeOff, Key, Lock, X, CheckCircle, XCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChangePasswordModalProps {
  isOpen: boolean;
  userName: string;
  onPasswordChange: (newPassword: string) => void;
  onCancel: () => void;
  isFirstLogin?: boolean;
  blockAppAccess?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  userName,
  onPasswordChange,
  onCancel,
  isFirstLogin = true,
  blockAppAccess = false,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Enhanced password requirements
  const passwordRequirements = [
    {
      text: 'Ít nhất 6 ký tự',
      met: newPassword.length >= 6,
      icon: newPassword.length >= 6 ? CheckCircle : XCircle
    },
    {
      text: 'Không được để trống',
      met: newPassword.length > 0,
      icon: newPassword.length > 0 ? CheckCircle : XCircle
    },
    {
      text: 'Mật khẩu khớp nhau',
      met: newPassword === confirmPassword && newPassword.length > 0,
      icon: (newPassword === confirmPassword && newPassword.length > 0) ? CheckCircle : XCircle
    },
  ];

  const isValidPassword = passwordRequirements.every((req) => req.met);

  // Debug validation - ENHANCED LOGGING
  useEffect(() => {
    console.log('🔍 ChangePasswordModal: Validation state changed:', {
      newPassword: newPassword ? `***${newPassword.length} chars` : 'empty',
      confirmPassword: confirmPassword ? `***${confirmPassword.length} chars` : 'empty',
      passwordsMatch: newPassword === confirmPassword,
      requirements: passwordRequirements.map(req => ({ text: req.text, met: req.met })),
      isValidPassword,
      isSubmitting,
      buttonDisabled: !isValidPassword || isSubmitting,
      buttonShouldBeEnabled: isValidPassword && !isSubmitting
    });
  }, [newPassword, confirmPassword, isValidPassword, isSubmitting, passwordRequirements]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 6) strength += 25;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 15;
    if (/[a-z]/.test(newPassword)) strength += 15;
    if (/\d/.test(newPassword)) strength += 20;
    setPasswordStrength(Math.min(strength, 100));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔄 ChangePasswordModal: Form submitted!', {
      newPassword: newPassword ? `***${newPassword.length} chars` : 'empty',
      confirmPassword: confirmPassword ? `***${confirmPassword.length} chars` : 'empty',
      isValidPassword,
      isSubmitting,
      passwordsMatch: newPassword === confirmPassword,
      requirements: passwordRequirements.map(req => ({ text: req.text, met: req.met }))
    });

    if (!isValidPassword) {
      console.log('❌ ChangePasswordModal: Form validation failed');
      alert('Vui lòng kiểm tra lại yêu cầu mật khẩu');
      return;
    }

    if (isSubmitting) {
      console.log('❌ ChangePasswordModal: Already submitting');
      return;
    }

    console.log('🔄 ChangePasswordModal: Starting password change...');
    setIsSubmitting(true);

    try {
      console.log('🔄 ChangePasswordModal: Calling onPasswordChange callback...');
      await onPasswordChange(newPassword);
      console.log('✅ ChangePasswordModal: Password change successful!');

      // Reset form
      setNewPassword('');
      setConfirmPassword('');

      console.log('✅ ChangePasswordModal: Form reset completed');
    } catch (error) {
      console.error('❌ ChangePasswordModal: Password change failed:', error);
      alert('Lỗi đổi mật khẩu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
      console.log('🔄 ChangePasswordModal: Submit process completed');
    }
  };

  const handleCancel = () => {
    console.log('🚫 ChangePasswordModal: Cancel button clicked', {
      blockAppAccess,
      userName,
      isSubmitting
    });

    if (blockAppAccess) {
      // If app access is blocked, user cannot cancel - show message
      console.log('🚫 ChangePasswordModal: Cancel blocked due to blockAppAccess');
      alert('Bạn phải đổi mật khẩu để tiếp tục sử dụng ứng dụng');
      return;
    }

    console.log('🚫 ChangePasswordModal: Calling onCancel callback');
    try {
      onCancel();
      console.log('✅ ChangePasswordModal: onCancel callback executed successfully');
    } catch (error) {
      console.error('❌ ChangePasswordModal: Error in onCancel callback:', error);
    }
  };

  if (!isOpen) return null;

  // Render modal using portal to ensure it's at the top level
  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      data-testid="change-password-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
        style={{ zIndex: 10000, position: 'relative' }}
        data-testid="change-password-modal-content"
      >
        {/* Header */}
        <div className={`p-6 text-white ${
          blockAppAccess
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="w-6 h-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">
                  {blockAppAccess ? 'Bắt buộc đổi mật khẩu' : 'Đổi mật khẩu'}
                </h2>
                <p className={`text-sm ${
                  blockAppAccess ? 'text-red-100' : 'text-blue-100'
                }`}>
                  {isFirstLogin ? 'Lần đăng nhập đầu tiên' : 'Cập nhật mật khẩu'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2">
              Xin chào <span className="font-semibold text-gray-900">{userName}</span>!
            </p>
            {blockAppAccess ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm font-medium">
                  🔒 Bạn phải đổi mật khẩu để tiếp tục sử dụng ứng dụng
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Vì lý do bảo mật, bạn không thể sử dụng mật khẩu mặc định.
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                {isFirstLogin
                  ? 'Vì đây là lần đăng nhập đầu tiên, vui lòng đặt mật khẩu mới để bảo mật tài khoản.'
                  : 'Vui lòng đặt mật khẩu mới để cập nhật bảo mật tài khoản.'
                }
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Yêu cầu mật khẩu:</h4>
              <div className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center">
                    {req.met ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 mr-2" />
                    )}
                    <span className={`text-sm ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* DEBUG INFO */}
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div><strong>🔍 Debug Info:</strong></div>
                <div>Password Length: {newPassword.length}</div>
                <div>Confirm Length: {confirmPassword.length}</div>
                <div>Passwords Match: {newPassword === confirmPassword ? '✅' : '❌'}</div>
                <div>Is Valid: {isValidPassword ? '✅' : '❌'}</div>
                <div>Is Submitting: {isSubmitting ? '✅' : '❌'}</div>
                <div>Button Should Be Enabled: {isValidPassword && !isSubmitting ? '✅' : '❌'}</div>
              </div>
            </div>



            {/* Actions */}
            <div className="space-y-3 pt-4">
              {/* Debug Force Submit Button */}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={() => {
                    console.log('🚨 FORCE SUBMIT - Bypassing validation');
                    handleSubmit({ preventDefault: () => {}, stopPropagation: () => {} } as any);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs"
                  disabled={isSubmitting}
                >
                  🚨 Force Submit (Debug)
                </Button>
              </div>

              {/* Normal Buttons */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                  data-testid="cancel-password-change-button"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 ${
                    !isValidPassword || isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                  disabled={!isValidPassword || isSubmitting}
                  data-testid="submit-password-change-button"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Đổi mật khẩu
                      {(!isValidPassword || isSubmitting) && (
                        <span className="ml-2 text-xs">🔒</span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
