
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PieChart,
  List,
  CalendarCheck,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();

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
    <div className="fixed bottom-0 left-0 right-0 z-50 macos-glass border-t border-white/10 dark:border-white/5 shadow-lg backdrop-blur-xl bg-white/80 dark:bg-black/70">
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
      </div>
    </div>
  );
};

export default BottomNavigation;
