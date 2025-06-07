import React from 'react';

import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import TaskList from '@/pages/TaskList';

import BottomNavigation from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full fixed inset-0 overflow-auto">
      {/* macOS style gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#f6f6f6] to-[#e9edf1] dark:from-[#232324] dark:to-[#1a1a1c] -z-10"></div>

      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZmZmZjAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgZmlsbD0iI2YyZjJmMjA5Ij48L3JlY3Q+Cjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMDAwMDAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgZmlsbD0iI2ZmZmZmZjA1Ij48L3JlY3Q+Cjwvc3ZnPg==')] opacity-30 -z-10"></div>

      <main className="flex-1 flex flex-col overflow-hidden pb-16 relative z-10">
        {/* macOS style subtle top bar shine */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50 dark:bg-white/10"></div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </main>

      {/* Bottom Navigation with macOS glass effect */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* macOS style subtle shadow above navbar */}
        <div className="h-[1px] bg-gradient-to-r from-black/0 via-black/5 to-black/0 dark:from-black/0 dark:via-white/5 dark:to-black/0"></div>
        <BottomNavigation />
      </div>

      <Toaster />
      <Sonner />
    </div>
  );
};

export default AppLayout;
