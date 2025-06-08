import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true); // Bắt đầu ở trạng thái collapsed
  const [isHovered, setIsHovered] = useState(false); // Trạng thái hover
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  // Auto-hide/show logic
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
    if (isCollapsed) {
      onCollapseChange?.(false); // Temporarily expand for hover
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Delay before collapsing to avoid flickering
    hoverTimeoutRef.current = setTimeout(() => {
      if (isCollapsed && !isDropdownOpen) {
        onCollapseChange?.(true); // Collapse back
      }
    }, 300);
  };

  // Determine if sidebar should be visually expanded
  const isVisuallyExpanded = !isCollapsed || isHovered;

  // Handle click outside to close dropdown and cleanup timeout
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
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
        ref={sidebarRef}
        className={cn(
          "sidebar-desktop fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r border-gray-200 shadow-lg bg-white",
          isVisuallyExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isVisuallyExpanded ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">QLPKDBL</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <PieChart className="w-4 h-4 text-white" />
            </div>
          )}

          {isVisuallyExpanded && (
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "Tự động ẩn khi không hover" : "Thu nhỏ sidebar"}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {!isVisuallyExpanded && (
            <button
              onClick={handleToggleCollapse}
              className="absolute top-4 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title="Mở rộng sidebar"
            >
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 relative group",
                !isVisuallyExpanded ? "justify-center px-3 py-3" : "space-x-3 px-3 py-3",
                isActive(item.url)
                  ? "text-ios-blue bg-blue-50 shadow-sm border border-blue-100"
                  : "text-gray-600 hover:text-ios-blue hover:bg-gray-50 hover:shadow-sm"
              )}
              title={!isVisuallyExpanded ? item.title : undefined}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive(item.url) && "text-ios-blue"
              )} />
              {isVisuallyExpanded && (
                <span className="font-medium">{item.title}</span>
              )}

              {/* Tooltip for collapsed state */}
              {!isVisuallyExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Account Section */}
        <div className="p-4 border-t border-gray-200 relative" ref={dropdownRef}>
          <button
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 relative group",
              !isVisuallyExpanded ? "justify-center px-3 py-3" : "space-x-3 px-3 py-3",
              "text-gray-600 hover:text-ios-blue hover:bg-gray-50 hover:shadow-sm"
            )}
            onClick={() => {
              console.log('Avatar clicked, current state:', isDropdownOpen);
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
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
            {isVisuallyExpanded && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
            )}

            {/* Tooltip for collapsed state */}
            {!isVisuallyExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {currentUser?.name}
              </div>
            )}
          </button>

          {/* Custom Dropdown Menu */}
          {isDropdownOpen && (
            <div className={cn(
              "absolute z-[1000] w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden",
              !isVisuallyExpanded
                ? "left-full ml-2 bottom-0"
                : "left-4 right-4 bottom-full mb-2"
            )}>
              {/* User Info Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
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
                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
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
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Logout clicked');
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  <span>Thoát tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav-mobile fixed bottom-0 left-0 right-0 z-50 macos-glass border-t border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70">
        <div className="flex justify-center items-center px-4 py-2 space-x-4">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium rounded-xl transition-all",
                isActive(item.url)
                  ? "text-ios-blue bg-white/80 shadow-sm border border-gray-100/20"
                  : "text-gray-500 hover:text-ios-blue hover:bg-white/50 hover:-translate-y-0.5"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive(item.url) && "text-ios-blue")} />
              <span>{item.title}</span>
            </Link>
          ))}

          {/* Account Menu for Mobile */}
          <div className="relative">
            <button
              className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium text-gray-500 hover:text-ios-blue hover:bg-white/50 hover:-translate-y-0.5 rounded-xl transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <User className="h-5 w-5 mb-1" />
              <span>Tài khoản</span>
            </button>

            {/* Mobile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[1000]">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
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
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
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
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-500" />
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
