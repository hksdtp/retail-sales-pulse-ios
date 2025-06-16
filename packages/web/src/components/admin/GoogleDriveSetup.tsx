import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Key, 
  Folder, 
  Upload,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleDriveSetup } from '@/services/GoogleDriveSetup';
import { useToast } from '@/hooks/use-toast';

const GoogleDriveSetupComponent: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState(GoogleDriveSetup.getSetupStatus());
  const [folderId, setFolderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check status on mount
    setSetupStatus(GoogleDriveSetup.getSetupStatus());
  }, []);

  const handleSetup = async () => {
    if (!apiKey.trim() || !clientId.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập đầy đủ API Key và Client ID',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await GoogleDriveSetup.autoSetup({
        apiKey: apiKey.trim(),
        clientId: clientId.trim()
      });

      if (result.success) {
        setFolderId(result.folderId || null);
        setSetupStatus(GoogleDriveSetup.getSetupStatus());
        
        toast({
          title: 'Thành công!',
          description: result.message,
        });
      } else {
        toast({
          title: 'Lỗi setup',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi setup Google Drive API',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUpload = async () => {
    setIsLoading(true);
    
    try {
      const success = await GoogleDriveSetup.testUpload();
      
      if (success) {
        toast({
          title: 'Test thành công!',
          description: 'Upload ảnh đã sẵn sàng sử dụng',
        });
      } else {
        toast({
          title: 'Test thất bại',
          description: 'Kiểm tra lại cấu hình Google Drive',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi test',
        description: 'Có lỗi xảy ra khi test upload',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã copy!',
      description: 'Đã copy vào clipboard',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Google Drive API Setup
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cấu hình API để upload ảnh lên Google Drive
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                setupStatus.initialized ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {setupStatus.initialized ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">API Initialized</p>
                <p className="text-xs text-gray-500">
                  {setupStatus.initialized ? 'Đã khởi tạo' : 'Chưa khởi tạo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                setupStatus.signedIn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {setupStatus.signedIn ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">Signed In</p>
                <p className="text-xs text-gray-500">
                  {setupStatus.signedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                folderId ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">TaskImages Folder</p>
                <p className="text-xs text-gray-500">
                  {folderId ? 'Đã tạo' : 'Chưa tạo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Hướng dẫn Setup
          </CardTitle>
          <CardDescription>
            Làm theo các bước sau để cấu hình Google Drive API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">1. Tạo Google Cloud Project</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
              <li>Vào <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>Tạo project mới hoặc chọn project hiện tại</li>
              <li>Enable Google Drive API trong APIs & Services → Library</li>
            </ol>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">2. Tạo Credentials</h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
              <li>APIs & Services → Credentials</li>
              <li>Create Credentials → API Key (copy API Key)</li>
              <li>Create Credentials → OAuth 2.0 Client ID (copy Client ID)</li>
              <li>Thêm domain vào Authorized origins</li>
            </ol>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">3. Authorized Origins</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">http://localhost:8091</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard('http://localhost:8091')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">https://yourdomain.com</code>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard('https://yourdomain.com')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình API</CardTitle>
          <CardDescription>
            Nhập API Key và Client ID từ Google Cloud Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">OAuth 2.0 Client ID</label>
            <Input
              type="password"
              placeholder="123456789-..."
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSetup}
              disabled={isLoading || !apiKey.trim() || !clientId.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang setup...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Google Drive
                </>
              )}
            </Button>

            {setupStatus.initialized && setupStatus.signedIn && (
              <Button
                variant="outline"
                onClick={handleTestUpload}
                disabled={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Test Upload
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      {setupStatus.instructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {setupStatus.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  {instruction.startsWith('✅') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="text-sm">{instruction}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folder ID Display */}
      {folderId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              TaskImages Folder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded flex-1 text-sm">
                {folderId}
              </code>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(folderId)}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a 
                  href={`https://drive.google.com/drive/folders/${folderId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoogleDriveSetupComponent;
