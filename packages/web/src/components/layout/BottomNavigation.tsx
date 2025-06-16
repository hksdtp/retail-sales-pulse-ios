
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
        <div className="flex items-center justify-around px-2 py-2 min-h-[70px]">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={triggerHapticFeedback}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-300 ease-out relative group",
                isActive(item.url)
                  ? "text-ios-blue bg-blue-50 shadow-md border border-blue-200 transform scale-[1.02]"
                  : "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100"
              )}
            >
              <item.icon className={cn("w-5 h-5 mb-1 flex-shrink-0", isActive(item.url) && "text-ios-blue")} />
              <span className="text-xs font-medium text-center whitespace-nowrap">{item.title}</span>
            </Link>
          ))}

          {/* Account Menu */}
          <div className="relative" ref={dropdownRef}>
            <Link
              to="/account"
              onClick={triggerHapticFeedback}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-300 ease-out relative group",
                location.pathname === "/account"
                  ? "text-ios-blue bg-blue-50 shadow-md border border-blue-200 transform scale-[1.02]"
                  : "text-gray-600 hover:text-ios-blue hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:transform hover:scale-[1.02] hover:border hover:border-blue-100"
              )}
            >
              <User className={cn("w-5 h-5 mb-1 flex-shrink-0", location.pathname === "/account" && "text-ios-blue")} />
              <span className="text-xs font-medium text-center whitespace-nowrap">Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
