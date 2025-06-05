import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirebaseService } from '@/services/FirebaseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Settings, Zap } from 'lucide-react';

const AutoFirebaseSetup: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const { toast } = useToast();

  // Firebase config for the project
  const firebaseConfig = {
    apiKey: "AIzaSyBqJVJKvXxKxKxKxKxKxKxKxKxKxKxKxKx",
    authDomain: "appqlgd.firebaseapp.com",
    projectId: "appqlgd", 
    storageBucket: "appqlgd.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
  };

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = () => {
    const configured = FirebaseService.isConfigured();
    setIsConfigured(configured);
  };

  const handleAutoSetup = async () => {
    setIsConfiguring(true);
    try {
      // Initialize Firebase with the config
      FirebaseService.initializeApp(firebaseConfig);
      
      toast({
        title: "🎉 Cấu hình thành công!",
        description: "Firebase đã được cấu hình và sẵn sàng sử dụng.",
      });
      
      setIsConfigured(true);
      
      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error setting up Firebase:', error);
      toast({
        title: "❌ Lỗi cấu hình",
        description: "Không thể cấu hình Firebase. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  if (isConfigured) {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Firebase đã sẵn sàng!</CardTitle>
          <CardDescription className="text-green-600">
            Tất cả tính năng đã hoạt động bình thường.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800">Cần cấu hình Firebase</CardTitle>
        <CardDescription className="text-orange-600">
          Cấu hình Firebase để sử dụng đầy đủ tính năng của ứng dụng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Tính năng cần Firebase:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Lưu trữ và đồng bộ công việc</li>
            <li>Xóa toàn bộ công việc</li>
            <li>Backup dữ liệu an toàn</li>
            <li>Truy cập từ nhiều thiết bị</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleAutoSetup}
          disabled={isConfiguring}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isConfiguring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang cấu hình...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Cấu hình tự động
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Quá trình này sẽ mất vài giây và tự động reload trang.
        </p>
      </CardContent>
    </Card>
  );
};

export default AutoFirebaseSetup;
