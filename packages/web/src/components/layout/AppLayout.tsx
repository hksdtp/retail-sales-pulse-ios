import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import PlanToTaskNotification from '@/components/notifications/PlanToTaskNotification';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPlanNotification, setShowPlanNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    planTitle: string;
    taskTitle: string;
  } | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Enable swipe navigation on mobile
  useSwipeNavigation({
    threshold: 60,
    velocity: 0.3,
    preventScroll: true
  });

  // Listen for plan-to-task conversion events
  useEffect(() => {
    const handlePlanToTaskConversion = (event: CustomEvent) => {
      const { task, plan } = event.detail;
      console.log('🔔 AppLayout nhận được plan-to-task conversion:', { task, plan });

      setNotificationData({
        planTitle: plan.title,
        taskTitle: task.title
      });
      setShowPlanNotification(true);
    };

    window.addEventListener('planToTaskConverted', handlePlanToTaskConversion as EventListener);

    return () => {
      window.removeEventListener('planToTaskConverted', handlePlanToTaskConversion as EventListener);
    };
  }, []);

  const handleCloseNotification = () => {
    setShowPlanNotification(false);
    setNotificationData(null);
  };

  const handleViewTask = () => {
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* macOS style gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f6f6f6] to-[#e9edf1] dark:from-[#232324] dark:to-[#1a1a1c] -z-10"></div>

      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZmZmZjAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgZmlsbD0iI2YyZjJmMjA5Ij48L3JlY3Q+Cjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMDAwMDAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgZmlsbD0iI2ZmZmZmZjA1Ij48L3JlY3Q+Cjwvc3ZnPg==')] opacity-30 -z-10"></div>

      <div className="flex h-screen">
        {/* Desktop Sidebar - Hidden on mobile */}
        {!isMobile && <Sidebar onCollapseChange={setIsSidebarCollapsed} />}

        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col relative z-0 h-screen overflow-hidden transition-all duration-300",
          // Desktop: no margin needed as sidebar is in flex layout
          !isMobile && "ml-0",
          // Mobile: no margin, add bottom padding for bottom nav
          isMobile && "ml-0"
        )}>
          <div className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "p-1 md:p-2",
            // Mobile: Minimal bottom padding
            isMobile && "pb-[50px]"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      {isMobile && <BottomNavigation />}

      <Toaster />
      <Sonner />

      {/* Plan to Task Notification */}
      {notificationData && (
        <PlanToTaskNotification
          isVisible={showPlanNotification}
          planTitle={notificationData.planTitle}
          taskTitle={notificationData.taskTitle}
          onClose={handleCloseNotification}
          onViewTask={handleViewTask}
        />
      )}

    </div>
  );
};

export default AppLayout;
