
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  PieChart, 
  List, 
  CalendarCheck, 
  FileText,
  Users,
  User
} from 'lucide-react';

const AppSidebar = () => {
  const menuItems = [
    {
      title: "Dashboard",
      icon: PieChart,
      url: "/"
    },
    {
      title: "Quản lý công việc",
      icon: List,
      url: "/tasks"
    },
    {
      title: "Kế hoạch",
      icon: CalendarCheck,
      url: "/calendar"
    },
    {
      title: "KPI",
      icon: PieChart,
      url: "/kpi"
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

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <span className="font-semibold text-xl text-ios-blue">RetailSalesPulse</span>
          <div className="ml-auto lg:hidden">
            <SidebarTrigger />
          </div>
        </div>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-ios-blue rounded-full flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Giám đốc Kinh doanh</span>
              <span className="text-xs text-gray-500">Quản lý</span>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
