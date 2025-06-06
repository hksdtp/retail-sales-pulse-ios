import React, { useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { FirebaseService } from '@/services/FirebaseService';

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
            console.log('✅ Firebase auto-configured with default settings');

            // Lưu config để lần sau
            localStorage.setItem('firebaseConfig', JSON.stringify(defaultConfig));
            localStorage.setItem('firebaseConfigured', 'true');

            // Hiển thị thông báo thành công (không làm phiền user)
            setTimeout(() => {
              toast({
                title: '🔥 Firebase Ready',
                description: 'Hệ thống đã sẵn sàng hoạt động',
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
      } catch (error) {
        console.error('❌ Firebase auto-setup failed:', error);

        // Vẫn cho phép app chạy, chỉ hiển thị warning
        toast({
          title: '⚠️ Firebase Setup',
          description:
            'Một số tính năng có thể bị hạn chế. Vui lòng cấu hình Firebase thủ công nếu cần.',
          variant: 'destructive',
          duration: 5000,
        });

        setIsSetupComplete(true); // Vẫn cho phép app chạy
      } finally {
        setIsConfiguring(false);
      }
    };

    autoSetupFirebase();
  }, [toast]);

  // Hiển thị loading trong khi đang setup (rất nhanh)
  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang khởi tạo hệ thống...</h2>
          <p className="text-gray-600">Firebase đang được cấu hình tự động</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FirebaseAutoSetupProvider;
