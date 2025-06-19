
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PieChart,
  List,
  CalendarCheck,
  Users,
  User,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import AccountSettings from '@/components/account/AccountSettings';


// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // Light haptic feedback
  }
};

const BottomNavigation = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    title: "Khách hàng",
    icon: UserCheck,
    url: "/customers"
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







  return (
    <>
      <div className="bottom-nav-mobile fixed bottom-0 left-0 right-0 z-[9999] macos-glass border-t border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70">
        {/* Enhanced mobile navigation with better touch targets */}
        <div className="flex items-center justify-around px-1 py-2 min-h-[70px] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={triggerHapticFeedback}
              className={cn(
                // Enhanced touch targets (min 44px as per Apple HIG)
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ease-out relative group min-h-[44px] min-w-[44px]",
                // Active state with better visual feedback
                isActive(item.url)
                  ? "text-ios-blue bg-blue-50/80 shadow-md border border-blue-200/50 transform scale-[1.02] backdrop-blur-sm"
                  : "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/60 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100/50 active:scale-[0.98] active:bg-blue-100/60"
              )}
            >
              {/* Larger icons for better touch experience */}
              <item.icon className={cn("w-6 h-6 mb-1 flex-shrink-0 transition-colors duration-200", isActive(item.url) && "text-ios-blue")} />
              <span className="text-[10px] font-medium text-center whitespace-nowrap leading-tight">{item.title}</span>

              {/* Active indicator dot */}
              {isActive(item.url) && (
                <div className="absolute -top-1 w-1 h-1 bg-ios-blue rounded-full animate-pulse" />
              )}
            </Link>
          ))}

          {/* Account Menu with enhanced touch target */}
          <div className="relative" ref={dropdownRef}>
            <Link
              to="/account"
              onClick={triggerHapticFeedback}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ease-out relative group min-h-[44px] min-w-[44px]",
                location.pathname === "/account"
                  ? "text-ios-blue bg-blue-50/80 shadow-md border border-blue-200/50 transform scale-[1.02] backdrop-blur-sm"
                  : "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/60 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100/50 active:scale-[0.98] active:bg-blue-100/60"
              )}
            >
              <User className={cn("w-6 h-6 mb-1 flex-shrink-0 transition-colors duration-200", location.pathname === "/account" && "text-ios-blue")} />
              <span className="text-[10px] font-medium text-center whitespace-nowrap leading-tight">Tài khoản</span>

              {/* Active indicator dot */}
              {location.pathname === "/account" && (
                <div className="absolute -top-1 w-1 h-1 bg-ios-blue rounded-full animate-pulse" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
