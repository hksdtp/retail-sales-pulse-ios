import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAutoSetup } from '@/hooks/use-supabase-auto-setup';
import { Database, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const SupabaseSetup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [configJson, setConfigJson] = useState('');
  const { toast } = useToast();
  const { isConfigured, isLoading, error, manualSetup, testConnection } = useSupabaseAutoSetup();

  const handleManualSetup = async () => {
    if (!url || !anonKey) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ URL và Anon Key.',
        variant: 'destructive',
      });
      return;
    }

    const success = await manualSetup(url, anonKey);
    if (success) {
      toast({
        title: 'Cấu hình thành công',
        description: 'Supabase đã được cấu hình và sẵn sàng sử dụng.',
      });
    } else {
      toast({
        title: 'Lỗi cấu hình',
        description: 'Không thể kết nối đến Supabase. Vui lòng kiểm tra lại thông tin.',
        variant: 'destructive',
      });
    }
  };

  const handleJsonSetup = async () => {
    try {
      const config = JSON.parse(configJson);

      if (!config.url || !config.anonKey) {
        throw new Error('Thiếu thông tin cấu hình cần thiết');
      }

      const success = await manualSetup(config.url, config.anonKey);
      if (success) {
        toast({
          title: 'Cấu hình thành công',
          description: 'Supabase đã được cấu hình từ JSON và sẵn sàng sử dụng.',
        });
      } else {
        throw new Error('Không thể khởi tạo Supabase');
      }
    } catch (error) {
      toast({
        title: 'Lỗi cấu hình',
        description: 'JSON không hợp lệ hoặc thiếu thông tin cấu hình cần thiết.',
        variant: 'destructive',
      });
      console.error('Lỗi khi cấu hình Supabase từ JSON:', error);
    }
  };

  const handleTestConnection = async () => {
    const isConnected = await testConnection();
    toast({
      title: isConnected ? 'Kết nối thành công' : 'Kết nối thất bại',
      description: isConnected 
        ? 'Supabase đang hoạt động bình thường.' 
        : 'Không thể kết nối đến Supabase.',
      variant: isConnected ? 'default' : 'destructive',
    });
  };

  if (isConfigured) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Supabase đã được cấu hình
          </CardTitle>
          <CardDescription>
            Supabase đang hoạt động và sẵn sàng sử dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestConnection} className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Kiểm tra kết nối
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cấu hình Supabase
        </CardTitle>
        <CardDescription>
          Cấu hình kết nối đến Supabase để sử dụng các tính năng của ứng dụng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Cấu hình thủ công</TabsTrigger>
            <TabsTrigger value="json">Từ JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Supabase URL</Label>
              <Input
                id="url"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anonKey">Anon Key</Label>
              <Input
                id="anonKey"
                placeholder="your-anon-key-here"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                type="password"
              />
            </div>
            <Button 
              onClick={handleManualSetup} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang cấu hình...' : 'Cấu hình Supabase'}
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="config">Cấu hình JSON</Label>
              <Textarea
                id="config"
                placeholder={`{
  "url": "https://your-project.supabase.co",
  "anonKey": "your-anon-key-here"
}`}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={6}
              />
            </div>
            <Button 
              onClick={handleJsonSetup} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang cấu hình...' : 'Cấu hình từ JSON'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SupabaseSetup;
