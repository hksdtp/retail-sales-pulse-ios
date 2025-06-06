import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getApiUrl } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  children: React.ReactNode;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ children }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      const response = await fetch(`${getApiUrl()}/export/csv`);

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Thành công',
        description: 'Đã xuất file CSV thành công',
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Export CSV error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất file CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncGoogleSheets = async () => {
    try {
      setIsExporting(true);

      const response = await fetch(`${getApiUrl()}/sync/sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync Google Sheets');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Thành công',
          description: `Đã chuẩn bị dữ liệu cho Google Sheets (${result.data.totalTasks} công việc)`,
        });

        // Hiển thị hướng dẫn cho user
        console.log('Google Sheets Data:', result.data.sheetsData);

        // Có thể mở Google Sheets hoặc hiển thị hướng dẫn
        toast({
          title: 'Hướng dẫn',
          description: 'Dữ liệu đã được chuẩn bị. Kiểm tra console để xem chi tiết.',
        });
      } else {
        throw new Error(result.error || 'Sync failed');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Google Sheets sync error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đồng bộ với Google Sheets',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Xuất dữ liệu
          </DialogTitle>
          <DialogDescription>Chọn định dạng để xuất dữ liệu công việc</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full justify-start"
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Xuất file CSV
          </Button>

          <Button
            onClick={handleSyncGoogleSheets}
            disabled={isExporting}
            className="w-full justify-start"
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Đồng bộ Google Sheets
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• CSV: Tải xuống file để mở bằng Excel</p>
          <p>• Google Sheets: Chuẩn bị dữ liệu để import vào Google Sheets</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
