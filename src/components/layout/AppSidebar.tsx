
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { PieChart, List, CalendarCheck, FileText, Users, User, LogOut, Menu, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const AUTO_HIDE_TIMEOUT = 3000; // 3 giây

const AppSidebar = () => {
  const {
    currentUser,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Reset autohide timer when sidebar is expanded
  useEffect(() => {
    if (state === 'expanded') {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
      
      const timer = setTimeout(() => {
        toggleSidebar();
      }, AUTO_HIDE_TIMEOUT);
      
      setAutoHideTimer(timer);
    }
    
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [state, toggleSidebar]);

  const menuItems = [{
    title: "Dashboard",
    icon: PieChart,
    url: "/"
  }, {
    title: "Quản lý công việc",
    icon: List,
    url: "/tasks"
  }, {
    title: "Kế hoạch",
    icon: CalendarCheck,
    url: "/calendar"
  }, {
    title: "KPI",
    icon: PieChart,
    url: "/kpi"
  }, {
    title: "Báo cáo",
    icon: FileText,
    url: "/reports"
  }, {
    title: "Nhân viên",
    icon: Users,
    url: "/employees"
  }];

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <span className="font-semibold text-xl text-ios-blue">Phòng Kinh Doanh</span>
            <div className="ml-auto lg:hidden">
              <SidebarTrigger />
            </div>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map(item => <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex items-center space-x-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <div className="mt-auto p-4 border-t border-gray-200">
            {currentUser && <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-ios-blue rounded-full flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
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
              </div>}
          </div>
        </div>
      </Sidebar>
      
      {/* Nút điều khiển ẩn hiện - hiển thị rõ ràng ở cả desktop và mobile */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 ${state === 'expanded' ? 'left-full' : 'left-[3rem]'} z-20`}
      >
        <div className="bg-ios-blue text-white p-2 rounded-r-lg shadow-md cursor-pointer hover:bg-blue-600 transition-colors" onClick={toggleSidebar}>
          {state === 'expanded' ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
