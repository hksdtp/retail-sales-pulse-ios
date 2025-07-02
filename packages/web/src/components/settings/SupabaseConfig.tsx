import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SupabaseService } from '@/services/SupabaseService';

interface SupabaseConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ open, onOpenChange, onConfigSaved }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [configJson, setConfigJson] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Kiểm tra xem Supabase đã được cấu hình hay chưa
      const checkSupabaseConfig = () => {
        const config = localStorage.getItem('supabaseConfig');
        if (config) {
          try {
            const parsedConfig = JSON.parse(config);
            setUrl(parsedConfig.url || '');
            setAnonKey(parsedConfig.anonKey || '');
            setIsConfigured(true);
          } catch (error) {
            console.error('Lỗi khi đọc cấu hình Supabase:', error);
          }
        } else {
          // Check environment variables
          const envUrl = import.meta.env.VITE_SUPABASE_URL;
          const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          if (envUrl && envAnonKey && envUrl !== 'https://your-project.supabase.co' && envAnonKey !== 'your-anon-key-here') {
            setUrl(envUrl);
            setAnonKey(envAnonKey);
            setIsConfigured(true);
          }
        }
      };

      checkSupabaseConfig();
    }
  }, [open]);

  const handleManualSetup = () => {
    try {
      const config = {
        url,
        anonKey,
      };

      localStorage.setItem('supabaseConfig', JSON.stringify(config));

      // Khởi tạo Supabase với cấu hình mới
      const supabaseService = SupabaseService.getInstance();
      supabaseService.initialize(config);

      toast({
        title: 'Cấu hình thành công',
        description: 'Cấu hình Supabase đã được lưu và khởi tạo thành công.',
      });

      setIsConfigured(true);
      if (onConfigSaved) {
        onConfigSaved();
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Lỗi cấu hình',
        description: 'Đã xảy ra lỗi khi cấu hình Supabase. Vui lòng kiểm tra lại thông tin.',
        variant: 'destructive',
      });
      console.error('Lỗi khi cấu hình Supabase:', error);
    }
  };

  const handleJsonSetup = () => {
    try {
      const config = JSON.parse(configJson);

      // Kiểm tra các trường bắt buộc
      if (!config.url || !config.anonKey) {
        throw new Error('Thiếu thông tin cấu hình cần thiết');
      }

      localStorage.setItem('supabaseConfig', JSON.stringify(config));

      // Khởi tạo Supabase với cấu hình mới
      const supabaseService = SupabaseService.getInstance();
      supabaseService.initialize(config);

      toast({
        title: 'Cấu hình thành công',
        description: 'Cấu hình Supabase đã được lưu và khởi tạo thành công.',
      });

      setIsConfigured(true);
      if (onConfigSaved) {
        onConfigSaved();
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Lỗi cấu hình',
        description: 'JSON không hợp lệ hoặc thiếu thông tin cấu hình cần thiết.',
        variant: 'destructive',
      });
      console.error('Lỗi khi cấu hình Supabase từ JSON:', error);
    }
  };

  const handleResetConfig = () => {
    if (confirm('Bạn có chắc chắn muốn xóa cấu hình Supabase hiện tại không?')) {
      localStorage.removeItem('supabaseConfig');
      setUrl('');
      setAnonKey('');
      setConfigJson('');
      setIsConfigured(false);

      toast({
        title: 'Đã xóa cấu hình',
        description:
          'Cấu hình Supabase đã được xóa. Bạn cần cấu hình lại để sử dụng các tính năng đồng bộ.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cấu hình Supabase</DialogTitle>
          <DialogDescription>
            Nhập thông tin cấu hình Supabase để kết nối ứng dụng với dịch vụ Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isConfigured ? (
            <div className="space-y-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Supabase đã được cấu hình
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Ứng dụng đã được kết nối với Supabase Project: <strong>{url}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input id="supabase-url" value={url} disabled />
                </div>
                <div>
                  <Label htmlFor="anon-key">Anon Key</Label>
                  <Input id="anon-key" value={anonKey} disabled type="password" />
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
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      type="password"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleManualSetup}
                  className="w-full"
                  disabled={!url || !anonKey}
                >
                  Lưu cấu hình
                </Button>
              </TabsContent>
              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="configJson">Cấu hình Supabase dạng JSON</Label>
                  <textarea
                    id="configJson"
                    className="min-h-[200px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder={`{\n  "url": "https://your-project.supabase.co",\n  "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n}`}
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                  />
                </div>
                <Button onClick={handleJsonSetup} className="w-full" disabled={!configJson}>
                  Lưu cấu hình
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {isConfigured ? (
            <Button variant="destructive" onClick={handleResetConfig}>
              Xóa cấu hình
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupabaseConfig;
