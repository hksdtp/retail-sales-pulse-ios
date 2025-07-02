import React, { useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';
import InlineLoadingSpinner from '@/components/ui/InlineLoadingSpinner';

interface SupabaseAutoSetupProviderProps {
  children: React.ReactNode;
}

const SupabaseAutoSetupProvider: React.FC<SupabaseAutoSetupProviderProps> = ({ children }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const autoSetupSupabase = async () => {
      try {
        console.log('🚀 Starting Supabase auto-setup...');

        // Check if already configured
        let isConfigured = SupabaseService.isConfigured();

        if (isConfigured) {
          console.log('✅ Supabase already configured');
          setIsSetupComplete(true);
          setIsConfiguring(false);
          return;
        }

        // Try to initialize from localStorage first
        const fromLocalStorage = SupabaseService.initializeFromLocalStorage();
        if (fromLocalStorage) {
          console.log('✅ Supabase initialized from localStorage');
          setIsSetupComplete(true);
          setIsConfiguring(false);
          return;
        }

        // Try to initialize from environment variables
        const envUrl = import.meta.env.VITE_SUPABASE_URL;
        const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (envUrl && envAnonKey && 
            envUrl !== 'https://your-project.supabase.co' && 
            envAnonKey !== 'your-anon-key-here') {
          
          console.log('🔧 Initializing Supabase with environment config...');
          
          const supabaseService = SupabaseService.initializeApp({
            url: envUrl,
            anonKey: envAnonKey
          });

          if (supabaseService) {
            const isDev = SupabaseService.isDevelopmentMode();
            const isLocal = SupabaseService.isUsingLocalSupabase();

            console.log('✅ Supabase auto-configured with environment settings');
            if (isDev) {
              console.log(`🚀 Development mode: ${isLocal ? 'Using local Supabase' : 'Using cloud services'}`);
            }

            // Save config for next time
            localStorage.setItem('supabaseConfig', JSON.stringify({
              url: envUrl,
              anonKey: envAnonKey
            }));
            localStorage.setItem('supabaseConfigured', 'true');

            // Show success notification (non-intrusive)
            setTimeout(() => {
              toast({
                title: '🚀 Supabase Ready',
                description: isDev && isLocal
                  ? 'Hệ thống đã sẵn sàng (Local mode)'
                  : 'Hệ thống đã sẵn sàng hoạt động',
                duration: 3000,
              });
            }, 1000);

            isConfigured = true;
          }
        }

        if (!isConfigured) {
          console.log('⚠️ Supabase not configured - app will use mock data');
          console.log('📊 App will continue with limited functionality');
        }

        setIsSetupComplete(true);
        setIsConfiguring(false);
      } catch (error) {
        console.error('❌ Supabase auto-setup failed:', error);
        
        // Don't block the app, just log the error
        console.log('📊 App will continue with mock data due to setup failure');
        setIsSetupComplete(true);
        setIsConfiguring(false);
        
        // Show error notification
        toast({
          title: '⚠️ Supabase Setup Warning',
          description: 'Không thể kết nối Supabase. Ứng dụng sẽ sử dụng dữ liệu mẫu.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };

    // Run auto-setup when component mounts
    autoSetupSupabase();
  }, [toast]);

  // Show loading screen while configuring
  if (isConfiguring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <InlineLoadingSpinner
          message="Đang khởi tạo Supabase..."
          size="lg"
        />
      </div>
    );
  }

  // Render children when setup is complete
  return <>{children}</>;
};

export default SupabaseAutoSetupProvider;
