import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, LogOut, Bell, Shield, HelpCircle } from 'lucide-react';

const AccountPage = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      icon: User,
      title: 'Thông tin cá nhân',
      description: 'Quản lý thông tin tài khoản',
      onClick: () => console.log('Profile clicked')
    },
    {
      icon: Settings,
      title: 'Cài đặt',
      description: 'Tùy chỉnh ứng dụng',
      onClick: () => console.log('Settings clicked')
    },
    {
      icon: Bell,
      title: 'Thông báo',
      description: 'Quản lý thông báo',
      onClick: () => console.log('Notifications clicked')
    },
    {
      icon: Shield,
      title: 'Bảo mật',
      description: 'Cài đặt bảo mật tài khoản',
      onClick: () => console.log('Security clicked')
    },
    {
      icon: HelpCircle,
      title: 'Trợ giúp',
      description: 'Hướng dẫn sử dụng',
      onClick: () => console.log('Help clicked')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentUser?.email || 'Người dùng'}
              </h1>
              <p className="text-sm text-gray-500">Quản lý tài khoản của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6 space-y-4">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="w-5 h-5 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>

      {/* App Info */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">Retail Sales Pulse</h3>
            <p className="text-sm text-gray-500">Phiên bản 1.0.0</p>
            <p className="text-xs text-gray-400 mt-2">© 2024 Retail Sales Pulse. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
