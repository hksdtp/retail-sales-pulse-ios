
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PieChart,
  List,
  CalendarCheck,
  FileText,
  Users,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import AccountSettings from '@/components/account/AccountSettings';

const BottomNavigation = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [{
    title: "Dashboard",
    icon: PieChart,
    url: "/"
  }, {
    title: "Công việc",
    icon: List,
    url: "/tasks"
  }, {
    title: "Kế hoạch",
    icon: CalendarCheck,
    url: "/calendar"
  }, {
    title: "Rèm AI",
    icon: Sparkles,
    url: "/curtain-design"
  }, {
    title: "Nhân viên",
    icon: Users,
    url: "/employees"
  }];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="bottom-nav-mobile fixed bottom-0 left-0 right-0 z-[9999] macos-glass border-t border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70 safe-area-inset-bottom">
        <div className="flex items-center justify-between px-2 py-2 pb-safe">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center px-1 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex-1 min-h-[56px] mx-0.5",
                isActive(item.url)
                  ? "text-ios-blue bg-white/90 shadow-md border border-blue-100/50 scale-105"
                  : "text-gray-500 hover:text-ios-blue hover:bg-white/60 hover:scale-105 hover:-translate-y-0.5"
              )}
            >
              <item.icon className={cn("h-4 w-4 mb-1 flex-shrink-0", isActive(item.url) && "text-ios-blue")} />
              <span className="text-[7px] font-medium leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{item.title}</span>
            </Link>
          ))}

          {/* Account Menu */}
          <div className="relative flex-1 mx-0.5" ref={dropdownRef}>
            <button
              className="flex flex-col items-center justify-center px-1 py-2 text-xs font-medium text-gray-500 hover:text-ios-blue hover:bg-white/60 hover:scale-105 hover:-translate-y-0.5 rounded-xl transition-all duration-200 w-full min-h-[56px]"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="h-4 w-4 mb-1 flex-shrink-0" />
              <span className="text-[7px] font-medium leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">Tài khoản</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[60]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentUser?.name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowAccountSettings(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Cài đặt tài khoản</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-400" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings
          isOpen={showAccountSettings}
          onClose={() => setShowAccountSettings(false)}
        />
      )}
    </>
  );
};

export default BottomNavigation;
