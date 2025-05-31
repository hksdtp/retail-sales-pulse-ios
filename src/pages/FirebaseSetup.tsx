
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { firebaseService } from '@/services/FirebaseService';
import { useNavigate } from 'react-router-dom';

const FirebaseSetup = () => {
  const [configJson, setConfigJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSaveConfig = async () => {
    setIsLoading(true);
    
    try {
      let config;
      
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

      const success = firebaseService.configure(config);
      
      if (success) {
        toast({
          title: "Cấu hình thành công",
          description: "Firebase đã được cấu hình thành công."
        });
        navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cấu hình Firebase</CardTitle>
          <CardDescription>
            Thiết lập kết nối Firebase để lưu trữ dữ liệu công việc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="configJson">Cấu hình Firebase JSON</Label>
            <Textarea
              id="configJson"
              placeholder='Dán cấu hình Firebase config object vào đây, ví dụ:
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

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseSetup;
