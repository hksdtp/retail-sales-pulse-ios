
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from '@/services/FirebaseService';

interface FirebaseConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
}

const FirebaseConfig = ({ open, onOpenChange, onConfigSaved }: FirebaseConfigProps) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [configJson, setConfigJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = async () => {
    setIsLoading(true);
    
    try {
      let config;
      
      if (configJson.trim()) {
        try {
          config = JSON.parse(configJson);
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "JSON cấu hình không hợp lệ",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } else {
        config = {
          apiKey,
          authDomain,
          projectId,
          storageBucket,
          messagingSenderId,
          appId
        };
      }

      const success = firebaseService.configure(config);
      
      if (success) {
        toast({
          title: "Cấu hình thành công",
          description: "Firebase đã được cấu hình thành công. Dữ liệu sẽ được lưu trữ thực tế trên Firebase Firestore."
        });
        onConfigSaved?.();
        onOpenChange(false);
        
        // Reset form
        setApiKey('');
        setAuthDomain('');
        setProjectId('');
        setStorageBucket('');
        setMessagingSenderId('');
        setAppId('');
        setConfigJson('');
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cấu hình Firebase. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cấu hình Firebase.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cấu hình Firebase</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn cấu hình Firebase</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Truy cập Firebase Console và tạo project mới</li>
              <li>Thêm web app vào project</li>
              <li>Copy thông tin cấu hình và dán vào form bên dưới</li>
              <li>Tạo Firestore database trong project</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="configJson">Cấu hình JSON (Khuyến nghị)</Label>
              <Textarea
                id="configJson"
                placeholder='Dán toàn bộ cấu hình Firebase config object vào đây, ví dụ:
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}'
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="text-center text-sm text-gray-500">
              HOẶC nhập từng trường riêng lẻ:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                />
              </div>

              <div>
                <Label htmlFor="authDomain">Auth Domain</Label>
                <Input
                  id="authDomain"
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="your-project.firebaseapp.com"
                />
              </div>

              <div>
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="your-project-id"
                />
              </div>

              <div>
                <Label htmlFor="storageBucket">Storage Bucket</Label>
                <Input
                  id="storageBucket"
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="your-project.appspot.com"
                />
              </div>

              <div>
                <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                <Input
                  id="messagingSenderId"
                  type="text"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="123456789"
                />
              </div>

              <div>
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123:web:abc123"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirebaseConfig;
