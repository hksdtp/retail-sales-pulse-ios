
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface GoogleSheetsConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
}

const GoogleSheetsConfig = ({ open, onOpenChange, onConfigSaved }: GoogleSheetsConfigProps) => {
  const { toast } = useToast();
  const [sheetId, setSheetId] = useState('');
  const [serviceAccountJSON, setServiceAccountJSON] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // Lấy cấu hình hiện tại khi mở dialog
  useEffect(() => {
    if (open) {
      const config = googleSheetsService.getConfig();
      setSheetId(config.sheetId || '');
      setServiceAccountJSON(config.serviceAccountJson || '');
      setIsConfigured(googleSheetsService.isConfigured());
    }
  }, [open]);

  // Lưu cấu hình
  const handleSaveConfig = () => {
    try {
      if (!sheetId.trim()) {
        toast({
          title: "Lỗi",
          description: "ID Google Sheet không được để trống",
          variant: "destructive",
        });
        return;
      }

      if (!serviceAccountJSON.trim()) {
        toast({
          title: "Lỗi",
          description: "Thông tin Service Account JSON không được để trống",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra định dạng JSON của Service Account
      try {
        JSON.parse(serviceAccountJSON.trim());
      } catch (e) {
        toast({
          title: "Lỗi",
          description: "Service Account JSON không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      googleSheetsService.setConfig(sheetId.trim(), serviceAccountJSON.trim());
      toast({
        title: "Thành công",
        description: "Cấu hình Google Sheets đã được lưu",
      });

      if (onConfigSaved) {
        onConfigSaved();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình Google Sheets",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Cấu hình Google Sheets</DialogTitle>
          <DialogDescription>
            Nhập thông tin để kết nối với Google Sheets API
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Google Sheets API yêu cầu xác thực bằng Service Account thay vì API Key đơn giản. 
              Bạn cần tạo Service Account và chia sẻ quyền biên tập Google Sheet cho email của Service Account đó.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label htmlFor="sheetId">Google Sheet ID</Label>
            <Input
              id="sheetId"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
            <p className="text-xs text-muted-foreground">
              ID của Google Sheet nằm trong URL: https://docs.google.com/spreadsheets/d/<span className="font-medium">ID_SHEET</span>/edit
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="serviceAccountJSON">Service Account JSON</Label>
            <Textarea
              id="serviceAccountJSON"
              value={serviceAccountJSON}
              onChange={(e) => setServiceAccountJSON(e.target.value)}
              placeholder='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
  "client_id": "client-id",
  ...
}'
              className="font-mono text-sm min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Dán toàn bộ nội dung file JSON của Service Account từ Google Cloud Console.
              Đảm bảo đã chia sẻ quyền chỉnh sửa Google Sheet cho email của Service Account.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveConfig}>
            {isConfigured ? 'Cập nhật cấu hình' : 'Lưu cấu hình'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSheetsConfig;
