
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import BottomNavigation from './BottomNavigation';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-ios-gray to-white fixed inset-0 overflow-auto">
        <main className="flex-1 flex flex-col overflow-hidden pb-16">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
        </main>
        <BottomNavigation />
        <Toaster />
        <Sonner />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
