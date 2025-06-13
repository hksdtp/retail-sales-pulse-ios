import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  PieChart,
  List,
  CalendarCheck,
  FileText,
  Users,
  User,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AccountSettings from '@/components/account/AccountSettings';

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const { actualTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  // Handle click outside to close dropdown
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
    navigate('/login');
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: PieChart,
      url: "/"
    },
    {
      title: "Công việc",
      icon: List,
      url: "/tasks"
    },
    {
      title: "Kế hoạch",
      icon: CalendarCheck,
      url: "/calendar"
    },
    {
      title: "Báo cáo",
      icon: FileText,
      url: "/reports"
    },
    {
      title: "Nhân viên",
      icon: Users,
      url: "/employees"
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <div
        className={cn(
          "sidebar-desktop fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r shadow-lg",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{
          backgroundColor: actualTheme === 'dark' ? 'rgb(17, 24, 39)' : 'white',
          borderColor: actualTheme === 'dark' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
          color: actualTheme === 'dark' ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: actualTheme === 'dark' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)'
          }}
        >
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-semibold text-sm"
                style={{
                  color: actualTheme === 'dark' ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)'
                }}
              >
                Phòng Kinh Doanh
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-sm">
              <PieChart className="w-4 h-4 text-white" />
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {isCollapsed && (
            <button
              onClick={handleToggleCollapse}
              className="absolute top-4 right-2 p-1 rounded-lg hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 relative group font-medium",
                isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-3 py-3"
              )}
              style={{
                color: isActive(item.url)
                  ? (actualTheme === 'dark' ? 'rgb(96, 165, 250)' : 'rgb(37, 99, 235)')
                  : (actualTheme === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'),
                backgroundColor: isActive(item.url)
                  ? (actualTheme === 'dark' ? 'rgba(30, 58, 138, 0.25)' : 'rgb(239, 246, 255)')
                  : 'transparent',
                borderWidth: isActive(item.url) ? '1px' : '0',
                borderColor: isActive(item.url)
                  ? (actualTheme === 'dark' ? 'rgba(30, 58, 138, 0.4)' : 'rgb(191, 219, 254)')
                  : 'transparent'
              }}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive(item.url)
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
              )} />
              {!isCollapsed && (
                <span className="text-sm">{item.title}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-700 dark:border-gray-600">
                  {item.title}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Account Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative" ref={dropdownRef}>
          <button
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 relative group",
              isCollapsed ? "justify-center px-3 py-3" : "space-x-3 px-3 py-3",
              "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm"
            )}
            onClick={() => {
              console.log('Avatar clicked, current state:', isDropdownOpen);
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0 shadow-sm">
              {localStorage.getItem(`avatar_${currentUser?.id}`) ? (
                <img
                  src={localStorage.getItem(`avatar_${currentUser?.id}`)!}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.email}
                </p>
              </div>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-700 dark:border-gray-600">
                {currentUser?.name}
              </div>
            )}
          </button>

          {/* Custom Dropdown Menu */}
          {isDropdownOpen && (
            <div className={cn(
              "absolute z-[1000] w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm",
              isCollapsed
                ? "left-full ml-2 bottom-0"
                : "left-4 right-4 bottom-full mb-2"
            )}>
              {/* User Info Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shadow-sm">
                    {localStorage.getItem(`avatar_${currentUser?.id}`) ? (
                      <img
                        src={localStorage.getItem(`avatar_${currentUser?.id}`)!}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    console.log('Settings clicked');
                    setShowAccountSettings(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Logout clicked');
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" />
                  <span>Thoát tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav-mobile fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex justify-center items-center px-4 py-2 space-x-4">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium rounded-xl transition-all",
                isActive(item.url)
                  ? "text-ios-blue dark:text-blue-400 bg-white/80 dark:bg-blue-900/25 shadow-sm border border-gray-100/20 dark:border-blue-800/40"
                  : "text-gray-600 dark:text-gray-400 hover:text-ios-blue dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-white/8 hover:-translate-y-0.5"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                isActive(item.url)
                  ? "text-ios-blue dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>{item.title}</span>
            </Link>
          ))}

          {/* Account Menu for Mobile */}
          <div className="relative">
            <button
              className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-ios-blue dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-white/8 hover:-translate-y-0.5 rounded-xl transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="h-5 w-5 mb-1" />
              <span>Tài khoản</span>
            </button>

            {/* Mobile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[1000] backdrop-blur-sm">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shadow-sm">
                      {localStorage.getItem(`avatar_${currentUser?.id}`) ? (
                        <img
                          src={localStorage.getItem(`avatar_${currentUser?.id}`)!}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
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
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    <span>Cài đặt tài khoản</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" />
                    <span>Thoát tài khoản</span>
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

export default Sidebar;
