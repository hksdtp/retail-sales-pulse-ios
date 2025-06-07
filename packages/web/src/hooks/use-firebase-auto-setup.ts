import { useEffect, useState } from 'react';

import { FirebaseService } from '@/services/FirebaseService';

interface FirebaseAutoSetupResult {
  isConfigured: boolean;
  isConfiguring: boolean;
  error: string | null;
}

export const useFirebaseAutoSetup = (): FirebaseAutoSetupResult => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoSetupFirebase = async () => {
      try {
        // Kiểm tra xem Firebase đã được cấu hình chưa
        const alreadyConfigured = FirebaseService.isConfigured();

        if (alreadyConfigured) {
          console.log('🔥 Firebase already configured');
          setIsConfigured(true);
          return;
        }

        console.log('🔧 Auto-configuring Firebase...');
        setIsConfiguring(true);

        // Thử khởi tạo từ localStorage trước
        const fromLocalStorage = FirebaseService.initializeFromLocalStorage();
        if (fromLocalStorage) {
          console.log('✅ Firebase initialized from localStorage');
          setIsConfigured(true);
          setIsConfiguring(false);
          return;
        }

        // Nếu không có trong localStorage, sử dụng config mặc định
        const defaultConfig = {
          apiKey: 'AIzaSyDXQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ',
          authDomain: 'appqlgd.firebaseapp.com',
          projectId: 'appqlgd',
          storageBucket: 'appqlgd.appspot.com',
          messagingSenderId: '123456789012',
          appId: '1:123456789012:web:abcdefghijklmnop',
        };

        console.log('🔧 Initializing Firebase with default config...');

        // Khởi tạo Firebase với config mặc định
        const firebaseService = FirebaseService.initializeApp(defaultConfig);

        if (firebaseService) {
          console.log('✅ Firebase auto-configured successfully');
          setIsConfigured(true);

          // Lưu vào localStorage để lần sau không cần setup lại
          localStorage.setItem('firebaseConfig', JSON.stringify(defaultConfig));
          localStorage.setItem('firebaseConfigured', 'true');
        } else {
          throw new Error('Failed to initialize Firebase');
        }
      } catch (err) {
        console.error('❌ Firebase auto-setup failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsConfiguring(false);
      }
    };

    // Chạy auto-setup ngay khi component mount
    autoSetupFirebase();
  }, []);

  return {
    isConfigured,
    isConfiguring,
    error,
  };
};
