import { AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { googleSheetsService } from '@/services/GoogleSheetsService';

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
  const [currentTab, setCurrentTab] = useState<string>('general');

  // Lấy cấu hình hiện tại khi mở dialog
  useEffect(() => {
    if (open) {
      const config = googleSheetsService.getConfig();
      let displaySheetId = config.sheetId || '';
      const serviceAccount = config.serviceAccountJson || '';

      // Nếu service account chưa được cấu hình qua dialog (còn rỗng),
      // thử đọc lại sheetId trực tiếp từ localStorage để ưu tiên giá trị từ setup-sheets.js
      if (!serviceAccount) {
        const sheetIdFromLocalStorage = localStorage.getItem('googleSheetId');
        if (sheetIdFromLocalStorage) {
          displaySheetId = sheetIdFromLocalStorage;
        }
      }

      setSheetId(displaySheetId);
      setServiceAccountJSON(serviceAccount);
      setIsConfigured(googleSheetsService.isConfigured());
    }
  }, [open]);

  // Lưu cấu hình
  const handleSaveConfig = () => {
    try {
      if (!sheetId.trim()) {
        toast({
          title: 'Lỗi',
          description: 'ID Google Sheet không được để trống',
          variant: 'destructive',
        });
        return;
      }

      if (!serviceAccountJSON.trim()) {
        toast({
          title: 'Lỗi',
          description: 'Thông tin Service Account JSON không được để trống',
          variant: 'destructive',
        });
        return;
      }

      // Kiểm tra định dạng JSON của Service Account
      try {
        JSON.parse(serviceAccountJSON.trim());
      } catch (e) {
        toast({
          title: 'Lỗi',
          description: 'Service Account JSON không hợp lệ',
          variant: 'destructive',
        });
        return;
      }

      googleSheetsService.setConfig(sheetId.trim(), serviceAccountJSON.trim());
      toast({
        title: 'Thành công',
        description: 'Cấu hình Google Sheets đã được lưu',
      });

      if (onConfigSaved) {
        onConfigSaved();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cấu hình Google Sheets',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Cấu hình Google Sheets</DialogTitle>
          <DialogDescription>Nhập thông tin để kết nối với Google Sheets API</DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
            <TabsTrigger value="guide">Hướng dẫn chi tiết</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {isConfigured && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="flex items-center">
                  Google Sheets đã được cấu hình và sẵn sàng sử dụng!
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="sheetId">Google Sheet ID</Label>
              <Input
                id="sheetId"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
              <p className="text-xs text-muted-foreground">
                ID của Google Sheet nằm trong URL: https://docs.google.com/spreadsheets/d/
                <span className="font-medium">ID_SHEET</span>/edit
              </p>
              <div className="flex items-center text-xs text-blue-600">
                <ExternalLink className="h-3 w-3 mr-1" />
                <a
                  href="https://docs.google.com/spreadsheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Mở Google Sheets
                </a>
              </div>
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
                <b className="text-red-500">
                  {' '}
                  Đảm bảo đã chia sẻ quyền chỉnh sửa Google Sheet cho email của Service Account.
                </b>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-base">Các bước tạo Service Account:</h3>
              <ol className="list-decimal pl-4 space-y-2 text-sm">
                <li>
                  <p>
                    <a
                      href="https://console.cloud.google.com/projectcreate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Tạo dự án Google Cloud mới
                    </a>{' '}
                    hoặc chọn dự án hiện có
                  </p>
                </li>
                <li>
                  <p>
                    <a
                      href="https://console.cloud.google.com/apis/library/sheets.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Kích hoạt Google Sheets API
                    </a>{' '}
                    cho dự án của bạn
                  </p>
                </li>
                <li>
                  <p>
                    <a
                      href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Tạo Service Account
                    </a>{' '}
                    với quyền "Editor"
                  </p>
                </li>
                <li>
                  <p>Tạo khóa cho Service Account (Chọn định dạng JSON)</p>
                </li>
                <li>
                  <p>Tải xuống file JSON khóa và sao chép nội dung vào ô trên</p>
                </li>
                <li>
                  <p>
                    <a
                      href="https://docs.google.com/spreadsheets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Tạo Google Sheet mới
                    </a>
                  </p>
                </li>
                <li>
                  <p>
                    Chia sẻ Google Sheet với email của Service Account (có dạng{' '}
                    <span className="font-mono">name@project-id.iam.gserviceaccount.com</span>) với
                    quyền Editor
                  </p>
                </li>
                <li>
                  <p>
                    Sao chép ID của Sheet (phần giữa /d/ và /edit trong URL) và dán vào ô Sheet ID ở
                    tab Cài đặt chung
                  </p>
                </li>
              </ol>

              <Alert className="bg-blue-50 border-blue-200 text-blue-800 mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Lưu ý quan trọng:</p>
                  <p className="mt-1">Nếu gặp lỗi khi sử dụng Service Account, bạn cần đảm bảo:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Đã bật Google Sheets API trong dự án Google Cloud</li>
                    <li>Đã chia sẻ Google Sheet với đúng email của Service Account</li>
                    <li>Service Account có quyền Editor trên Google Sheet</li>
                    <li>Tệp JSON đã được sao chép đầy đủ (kiểm tra dấu ngoặc {'{...}'})</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

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
