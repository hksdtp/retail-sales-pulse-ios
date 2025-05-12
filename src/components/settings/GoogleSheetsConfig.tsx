
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface GoogleSheetsConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
}

const GoogleSheetsConfig = ({ open, onOpenChange, onConfigSaved }: GoogleSheetsConfigProps) => {
  const { toast } = useToast();
  const [sheetId, setSheetId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // Lấy cấu hình hiện tại khi mở dialog
  useEffect(() => {
    if (open) {
      const config = googleSheetsService.getConfig();
      setSheetId(config.sheetId || '');
      setApiKey(config.apiKey || '');
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

      if (!apiKey.trim()) {
        toast({
          title: "Lỗi",
          description: "API Key không được để trống",
          variant: "destructive",
        });
        return;
      }

      googleSheetsService.setConfig(sheetId.trim(), apiKey.trim());
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
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Cấu hình Google Sheets</DialogTitle>
          <DialogDescription>
            Nhập thông tin để kết nối với Google Sheets API
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
            <Label htmlFor="apiKey">Google API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập Google API Key"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              API Key từ Google Cloud Console với quyền truy cập Google Sheets API
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
