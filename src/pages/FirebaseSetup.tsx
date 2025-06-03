import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FirebaseService } from '@/services/FirebaseService';

const FirebaseSetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [configJson, setConfigJson] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem Firebase đã được cấu hình hay chưa
    const checkFirebaseConfig = () => {
      const config = localStorage.getItem('firebaseConfig');
      if (config) {
        try {
          const parsedConfig = JSON.parse(config);
          setApiKey(parsedConfig.apiKey || '');
          setAuthDomain(parsedConfig.authDomain || '');
          setProjectId(parsedConfig.projectId || '');
          setStorageBucket(parsedConfig.storageBucket || '');
          setMessagingSenderId(parsedConfig.messagingSenderId || '');
          setAppId(parsedConfig.appId || '');
          setIsConfigured(true);
        } catch (error) {
          console.error('Lỗi khi đọc cấu hình Firebase:', error);
        }
      }
    };

    checkFirebaseConfig();
  }, []);

  const handleManualSetup = () => {
    try {
      const config = {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId
      };

      localStorage.setItem('firebaseConfig', JSON.stringify(config));
      
      // Khởi tạo Firebase với cấu hình mới
      FirebaseService.initializeApp(config);
      
      toast({
        title: 'Cấu hình thành công',
        description: 'Cấu hình Firebase đã được lưu và khởi tạo thành công.',
      });
      
      setIsConfigured(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast({
        title: 'Lỗi cấu hình',
        description: 'Đã xảy ra lỗi khi cấu hình Firebase. Vui lòng kiểm tra lại thông tin.',
        variant: 'destructive',
      });
      console.error('Lỗi khi cấu hình Firebase:', error);
    }
  };

  const handleJsonSetup = () => {
    try {
      const config = JSON.parse(configJson);
      
      // Kiểm tra các trường bắt buộc
      if (!config.apiKey || !config.authDomain || !config.projectId) {
        throw new Error('Thiếu thông tin cấu hình cần thiết');
      }

      localStorage.setItem('firebaseConfig', JSON.stringify(config));
      
      // Khởi tạo Firebase với cấu hình mới
      FirebaseService.initializeApp(config);
      
      toast({
        title: 'Cấu hình thành công',
        description: 'Cấu hình Firebase đã được lưu và khởi tạo thành công.',
      });
      
      setIsConfigured(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast({
        title: 'Lỗi cấu hình',
        description: 'JSON không hợp lệ hoặc thiếu thông tin cấu hình cần thiết.',
        variant: 'destructive',
      });
      console.error('Lỗi khi cấu hình Firebase từ JSON:', error);
    }
  };

  const handleResetConfig = () => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình Firebase hiện tại không?')) {
      localStorage.removeItem('firebaseConfig');
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setConfigJson('');
      setIsConfigured(false);
      
      toast({
        title: 'Đã xóa cấu hình',
        description: 'Cấu hình Firebase đã được xóa. Bạn cần cấu hình lại để sử dụng các tính năng đồng bộ.',
      });
    }
  };

  const handleGoToApp = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Cấu hình Firebase</CardTitle>
          <CardDescription>
            Nhập thông tin cấu hình Firebase để kết nối ứng dụng với dịch vụ Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigured ? (
            <div className="space-y-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Firebase đã được cấu hình</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Ứng dụng đã được kết nối với Firebase Project: <strong>{projectId}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-id">Project ID</Label>
                  <Input id="project-id" value={projectId} disabled />
                </div>
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" value={apiKey} disabled />
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Nhập thủ công</TabsTrigger>
                <TabsTrigger value="json">Dán JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      placeholder="AIzaSyC..." 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authDomain">Auth Domain</Label>
                    <Input 
                      id="authDomain" 
                      placeholder="your-app.firebaseapp.com" 
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input 
                      id="projectId" 
                      placeholder="your-project-id" 
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storageBucket">Storage Bucket</Label>
                    <Input 
                      id="storageBucket" 
                      placeholder="your-app.appspot.com" 
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                    <Input 
                      id="messagingSenderId" 
                      placeholder="123456789" 
                      value={messagingSenderId}
                      onChange={(e) => setMessagingSenderId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appId">App ID</Label>
                    <Input 
                      id="appId" 
                      placeholder="1:123456789:web:abcdef" 
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleManualSetup} 
                  className="w-full"
                  disabled={!apiKey || !projectId || !authDomain}
                >
                  Lưu cấu hình
                </Button>
              </TabsContent>
              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="configJson">Cấu hình Firebase dạng JSON</Label>
                  <textarea
                    id="configJson"
                    className="min-h-[200px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder={`{\n  "apiKey": "AIzaSyC...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-project-id",\n  "storageBucket": "your-app.appspot.com",\n  "messagingSenderId": "123456789",\n  "appId": "1:123456789:web:abcdef"\n}`}
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleJsonSetup} 
                  className="w-full"
                  disabled={!configJson}
                >
                  Lưu cấu hình
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isConfigured ? (
            <>
              <Button variant="outline" onClick={handleResetConfig}>
                Xóa cấu hình
              </Button>
              <Button onClick={handleGoToApp}>
                Đi đến ứng dụng
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleGoToApp}>
              Quay lại
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FirebaseSetup;
