
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  PieChart, 
  List, 
  CalendarCheck, 
  FileText, 
  Users, 
  User, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    title: "Báo cáo",
    icon: FileText,
    url: "/reports"
  }, {
    title: "Nhân viên",
    icon: Users,
    url: "/employees"
  }];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg backdrop-blur-md bg-opacity-90">
      <div className="flex justify-between items-center px-2 py-1">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 text-xs font-medium rounded-md transition-colors",
              isActive(item.url)
                ? "text-ios-blue"
                : "text-gray-500 hover:text-ios-blue"
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-1", isActive(item.url) && "text-ios-blue")} />
            <span>{item.title}</span>
          </Link>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center justify-center px-2 py-1 text-xs font-medium text-gray-500 hover:text-ios-blue rounded-md transition-colors">
              <User className="h-5 w-5 mb-1" />
              <span>Tài khoản</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            {currentUser && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-ios-blue rounded-full flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs text-gray-500">{currentUser.position || currentUser.role}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BottomNavigation;
