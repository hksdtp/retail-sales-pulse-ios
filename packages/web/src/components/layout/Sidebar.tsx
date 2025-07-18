import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContextSupabase';
import {
  PieChart,
  List,
  CalendarCheck,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AccountSettings from '@/components/account/AccountSettings';
import { SettingsButton } from '@/components/ui/ActionButton';

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const { currentUser, logout } = useAuth();

  // Debug: Log currentUser changes
  useEffect(() => {
    
  }, [currentUser]);
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

  // Auto-hide/show logic với animation mượt mà
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Delay ngắn hơn để responsive hơn
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isDropdownOpen) {
        setIsHovered(false);
      }
    }, 150);
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

  const handleLogout = async () => {
    console.log('🚪 Sidebar logout clicked');
    try {
      await logout();
      // Don't navigate here - logout function handles redirect
    } catch (error) {
      console.error('❌ Logout error in Sidebar:', error);
      // Fallback: force emergency logout
      (window as any).emergencyLogout?.();
    }
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
      title: "Khách hàng",
      icon: UserCheck,
      url: "/customers"
    },
    {
      title: "Báo cáo",
      icon: FileText,
      url: "/reports",
      requiresDirectorRole: true // Chỉ cho phép retail_director xem
    },
    {
      title: "Nhân viên",
      icon: Users,
      url: "/employees"
    }
  ];

  // Lọc menu items dựa trên vai trò người dùng
  const getFilteredMenuItems = () => {
    return menuItems.filter(item => {
      // Nếu item yêu cầu quyền director và user không phải retail_director thì ẩn
      if (item.requiresDirectorRole && currentUser?.role !== 'retail_director') {
        return false;
      }
      return true;
    });
  };

  const filteredMenuItems = getFilteredMenuItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className="sidebar-desktop h-full z-40 macos-glass border-r border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70 overflow-hidden flex-shrink-0"
        style={{
          width: isVisuallyExpanded ? '256px' : '64px',
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-white/5 min-h-[72px]">
          <div className="flex items-center space-x-3">
            <img
              src="/ict1.png"
              alt="ICT Logo"
              className="w-10 h-10 object-cover rounded-xl shadow-md flex-shrink-0"
            />
            <div
              className="overflow-hidden transition-all duration-300 ease-out"
              style={{
                width: isVisuallyExpanded ? '180px' : '0px',
                opacity: isVisuallyExpanded ? 1 : 0,
                transform: isVisuallyExpanded ? 'translateX(0)' : 'translateX(-10px)',
              }}
            >
              <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">Phòng Kinh Doanh</span>
            </div>
          </div>

          {isVisuallyExpanded && (
            <button
              onClick={handleToggleCollapse}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
              title={isCollapsed ? "Tự động ẩn khi không hover" : "Thu nhỏ sidebar"}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {!isVisuallyExpanded && (
            <button
              onClick={handleToggleCollapse}
              className="absolute top-4 right-2 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
              title="Mở rộng sidebar"
            >
              <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-300 ease-out relative group px-3 py-3",
                  !isVisuallyExpanded ? "justify-center" : "space-x-3",
                  isActive(item.url)
                    ? "text-ios-blue bg-blue-50 shadow-md border border-blue-200 transform scale-[1.02] z-10"
                    : "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100 hover:z-10"
                )}
                title={!isVisuallyExpanded ? item.title : undefined}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive(item.url) && "text-ios-blue"
                )} />
                <div
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    width: isVisuallyExpanded ? '150px' : '0px',
                    opacity: isVisuallyExpanded ? 1 : 0,
                    transform: isVisuallyExpanded ? 'translateX(0)' : 'translateX(-8px)',
                  }}
                >
                  <span className="font-medium whitespace-nowrap">{item.title}</span>
                </div>

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
        <div className="p-4 border-t border-white/10 dark:border-white/5 relative" ref={dropdownRef} key={currentUser?.id || 'no-user'}>
          <button
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-300 ease-out relative group px-3 py-3",
              !isVisuallyExpanded ? "justify-center" : "space-x-3",
              "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100"
            )}
            onClick={() => {

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
                currentUser?.name ?
                  currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) :
                  'U'
              )}
            </div>
            <div
              className="overflow-hidden transition-all duration-300 ease-out flex-1 text-left min-w-0"
              style={{
                width: isVisuallyExpanded ? '150px' : '0px',
                opacity: isVisuallyExpanded ? 1 : 0,
                transform: isVisuallyExpanded ? 'translateX(0)' : 'translateX(-8px)',
              }}
            >
              <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">
                {currentUser?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500 truncate whitespace-nowrap">
                {currentUser?.email || 'No email'}
              </p>
            </div>

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
                <Link
                  to="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                      <path d="M12 2v2"/>
                      <path d="M12 20v2"/>
                      <path d="m4.93 4.93 1.41 1.41"/>
                      <path d="m17.66 17.66 1.41 1.41"/>
                      <path d="M2 12h2"/>
                      <path d="M20 12h2"/>
                      <path d="m6.34 17.66-1.41 1.41"/>
                      <path d="m19.07 4.93-1.41 1.41"/>
                    </svg>
                  </div>
                  <span>Quản lý hệ thống</span>
                </Link>

                <button
                  onClick={() => {
                    console.log('Account Settings clicked');
                    setShowAccountSettings(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-4 h-4 mr-3 text-gray-400 group-hover:text-green-500 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <span>Hồ sơ cá nhân</span>
                </button>

                <button
                  onClick={() => {
                    console.log('🚪 Logout button clicked in dropdown');
                    setIsDropdownOpen(false);
                    handleLogout();
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
