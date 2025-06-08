import React, { useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { FirebaseService } from '@/services/FirebaseService';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface FirebaseAutoSetupProviderProps {
  children: React.ReactNode;
}

const FirebaseAutoSetupProvider: React.FC<FirebaseAutoSetupProviderProps> = ({ children }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const autoSetupFirebase = async () => {
      try {
        // Skip Firebase setup to avoid CORS issues
        console.log('🔧 Skipping Firebase auto-setup to avoid CORS issues');
        console.log('📊 App will use mock data for users and teams');

        // Set as complete immediately without Firebase
        setIsSetupComplete(true);
        setIsConfiguring(false);
        return;

        // Commented out Firebase setup to avoid CORS errors
        /*
        console.log('🔥 Starting Firebase auto-setup...');

        // Kiểm tra xem đã cấu hình chưa
        let isConfigured = FirebaseService.isConfigured();

        if (isConfigured) {
          console.log('✅ Firebase already configured');
          setIsSetupComplete(true);
          setIsConfiguring(false);
          return;
        }

        // Thử khởi tạo từ localStorage
        console.log('🔍 Checking localStorage for Firebase config...');
        const savedConfig = localStorage.getItem('firebaseConfig');

        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            console.log('🔧 Initializing Firebase from localStorage...');

            const firebaseService = FirebaseService.initializeApp(config);
            if (firebaseService) {
              console.log('✅ Firebase initialized from localStorage');
              isConfigured = true;
            }
          } catch (error) {
            console.warn('⚠️ Failed to parse saved config, using default');
          }
        }

        // Nếu vẫn chưa cấu hình, dùng config mặc định
        if (!isConfigured) {
          console.log('🔧 Using default Firebase config...');

          const defaultConfig = {
            apiKey: 'AIzaSyDXQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ',
            authDomain: 'appqlgd.firebaseapp.com',
            projectId: 'appqlgd',
            storageBucket: 'appqlgd.appspot.com',
            messagingSenderId: '123456789012',
            appId: '1:123456789012:web:abcdefghijklmnop',
          };

          const firebaseService = FirebaseService.initializeApp(defaultConfig);

          if (firebaseService) {
            const isUsingEmulators = FirebaseService.isUsingEmulators();
            const isDev = FirebaseService.isDevelopmentMode();

            console.log('✅ Firebase auto-configured with default settings');
            if (isDev) {
              console.log(`🔥 Development mode: ${isUsingEmulators ? 'Using emulators' : 'Using cloud services'}`);
            }

            // Lưu config để lần sau
            localStorage.setItem('firebaseConfig', JSON.stringify(defaultConfig));
            localStorage.setItem('firebaseConfigured', 'true');

            // Hiển thị thông báo thành công (không làm phiền user)
            setTimeout(() => {
              toast({
                title: '🔥 Firebase Ready',
                description: isDev && isUsingEmulators
                  ? 'Hệ thống đã sẵn sàng (Emulator mode)'
                  : 'Hệ thống đã sẵn sàng hoạt động',
                duration: 3000,
              });
            }, 1000);

            isConfigured = true;
          }
        }

        if (!isConfigured) {
          throw new Error('Failed to configure Firebase');
        }

        setIsSetupComplete(true);
        */
      } catch (error) {
        console.error('❌ Firebase auto-setup failed:', error);

        // Vẫn cho phép app chạy với mock data
        setIsSetupComplete(true);
      } finally {
        setIsConfiguring(false);
      }
    };

    autoSetupFirebase();
  }, [toast]);

  // Hiển thị loading trong khi đang setup (rất nhanh)
  if (isConfiguring) {
    return <LoadingScreen message="Đang khởi tạo hệ thống..." />;
  }

  return <>{children}</>;
};

export default FirebaseAutoSetupProvider;
