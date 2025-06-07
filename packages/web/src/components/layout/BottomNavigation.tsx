import {
  CalendarCheck,
  FileText,
  List,
  LogOut,
  PieChart,
  Settings,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import AccountSettings from '@/components/account/AccountSettings';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: PieChart,
      url: '/',
    },
    {
      title: 'Công việc',
      icon: List,
      url: '/tasks',
    },
    {
      title: 'Kế hoạch',
      icon: CalendarCheck,
      url: '/calendar',
    },
    {
      title: 'Báo cáo',
      icon: FileText,
      url: '/reports',
    },
    {
      title: 'Nhân viên',
      icon: Users,
      url: '/employees',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 macos-glass border-t border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70">
      <div className="flex justify-between items-center px-4 py-2">
        {menuItems.slice(0, 5).map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 text-xs font-medium rounded-xl transition-all',
              isActive(item.url)
                ? 'text-ios-blue bg-white/80 shadow-sm border border-gray-100/20'
                : 'text-gray-500 hover:text-ios-blue hover:bg-white/50 hover:-translate-y-0.5',
            )}
          >
            <item.icon className={cn('h-5 w-5 mb-1', isActive(item.url) && 'text-ios-blue')} />
            <span>{item.title}</span>
          </Link>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium text-gray-500 hover:text-ios-blue hover:bg-white/50 hover:-translate-y-0.5 rounded-xl transition-all">
              <User className="h-5 w-5 mb-1" />
              <span>Tài khoản</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-4 macos-glass backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20 shadow-xl rounded-xl"
            align="end"
            sideOffset={10}
          >
            {currentUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-[#0078d4] to-[#3a96dd] rounded-full flex items-center justify-center text-white shadow-md">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium">{currentUser.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.position || currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200/50 dark:via-white/10 to-transparent"></div>

                <div className="pt-1 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 macos-btn rounded-xl bg-white/80 hover:bg-white/90 dark:bg-black/40 dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm transition-all h-10"
                    onClick={() => setShowAccountSettings(true)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt tài khoản</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 macos-btn rounded-xl bg-white/80 hover:bg-white/90 dark:bg-black/40 dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm transition-all h-10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Account Settings Modal */}
      <AccountSettings isOpen={showAccountSettings} onClose={() => setShowAccountSettings(false)} />
    </div>
  );
};

export default BottomNavigation;
