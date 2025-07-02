import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Bell, Palette, Globe, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContextSupabase';
import { useNavigate } from 'react-router-dom';
import AccountSettings from '@/components/account/AccountSettings';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Account = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const handleLogout = async () => {
    console.log('🚪 Account page logout clicked');
    try {
      await logout();
      // Don't navigate here - logout function handles redirect
    } catch (error) {
      console.error('❌ Logout error in Account page:', error);
      // Fallback: force emergency logout
      (window as any).emergencyLogout?.();
    }
  };

  const menuItems = [
    {
      icon: Settings,
      title: 'Cài đặt tài khoản',
      description: 'Thông tin cá nhân, mật khẩu',
      onClick: () => setShowAccountSettings(true),
      color: 'text-blue-600'
    },
    {
      icon: Bell,
      title: 'Thông báo',
      description: 'Cài đặt thông báo và nhắc nhở',
      onClick: () => {},
      color: 'text-green-600'
    },
    {
      icon: Palette,
      title: 'Giao diện',
      description: 'Chế độ sáng/tối, màu sắc',
      onClick: () => {},
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Bảo mật',
      description: 'Quyền riêng tư và bảo mật',
      onClick: () => {},
      color: 'text-orange-600'
    },
    {
      icon: Globe,
      title: 'Ngôn ngữ',
      description: 'Tiếng Việt, English',
      onClick: () => {},
      color: 'text-indigo-600'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Tài khoản
            </h1>
          </div>
        </div>
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg md:text-2xl font-bold">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                {currentUser?.name || 'Người dùng'}
              </h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                {currentUser?.email || ''}
              </p>
              <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
                {currentUser?.role || 'Nhân viên'} • {currentUser?.department || 'Phòng ban'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 md:p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings
          isOpen={showAccountSettings}
          onClose={() => setShowAccountSettings(false)}
        />
      )}
    </AppLayout>
  );
};

export default Account;
