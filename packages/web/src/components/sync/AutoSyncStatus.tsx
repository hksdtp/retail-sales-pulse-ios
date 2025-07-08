/**
 * Auto Sync Status Component
 * Hiển thị trạng thái đồng bộ và cho phép manual sync
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useAuth } from '@/context/AuthContextSupabase';

interface AutoSyncStatusProps {
  showDetails?: boolean;
  compact?: boolean;
}

const AutoSyncStatus: React.FC<AutoSyncStatusProps> = ({ 
  showDetails = false, 
  compact = false 
}) => {
  const { currentUser } = useAuth();
  const { isRunning, lastSyncResult, manualSync } = useAutoSync();

  if (!currentUser) {
    return null;
  }

  const handleManualSync = async () => {
    await manualSync();
  };

  const getSyncStatusIcon = () => {
    if (isRunning) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (!lastSyncResult) {
      return <Cloud className="h-4 w-4" />;
    }

    if (lastSyncResult.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }

    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getSyncStatusText = () => {
    if (isRunning) {
      return 'Đang đồng bộ...';
    }
    
    if (!lastSyncResult) {
      return 'Chưa đồng bộ';
    }

    if (lastSyncResult.success) {
      if (lastSyncResult.syncedCount > 0) {
        return `Đã đồng bộ ${lastSyncResult.syncedCount} công việc`;
      }
      return 'Đã đồng bộ (không có dữ liệu mới)';
    }

    return `Lỗi: ${lastSyncResult.errors[0] || 'Không xác định'}`;
  };

  const getSyncStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isRunning) return "secondary";
    if (!lastSyncResult) return "outline";
    return lastSyncResult.success ? "default" : "destructive";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 transition-all duration-300 ease-in-out hover:scale-105">
        <Badge
          variant={getSyncStatusVariant()}
          className="flex items-center gap-1 transition-all duration-200 ease-in-out backdrop-blur-sm bg-white/90 shadow-lg border-0"
        >
          <div className="transition-transform duration-200 ease-in-out">
            {getSyncStatusIcon()}
          </div>
          <span className="text-xs font-medium">{getSyncStatusText()}</span>
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleManualSync}
          disabled={isRunning}
          className="h-6 w-6 p-0 transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-110 backdrop-blur-sm"
        >
          <RefreshCw className={`h-3 w-3 transition-transform duration-300 ease-in-out ${isRunning ? 'animate-spin' : 'hover:rotate-180'}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full transition-all duration-300 ease-in-out hover:shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm transition-colors duration-200">
          <div className="transition-transform duration-200 ease-in-out">
            {getSyncStatusIcon()}
          </div>
          Đồng bộ dữ liệu
        </CardTitle>
        <CardDescription className="text-xs">
          Tự động đồng bộ công việc từ thiết bị lên cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={getSyncStatusVariant()}>
              {getSyncStatusText()}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={isRunning}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
              Đồng bộ ngay
            </Button>
          </div>

          {showDetails && lastSyncResult && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="font-medium text-green-600">{lastSyncResult.syncedCount}</div>
                  <div>Đã đồng bộ</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">{lastSyncResult.skippedCount}</div>
                  <div>Đã bỏ qua</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{lastSyncResult.errorCount}</div>
                  <div>Lỗi</div>
                </div>
              </div>

              {lastSyncResult.details.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Chi tiết:</div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {lastSyncResult.details.slice(0, 3).map((detail, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {detail}
                      </div>
                    ))}
                    {lastSyncResult.details.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... và {lastSyncResult.details.length - 3} mục khác
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lastSyncResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1 text-red-600">Lỗi:</div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {lastSyncResult.errors.slice(0, 2).map((error, index) => (
                      <div key={index} className="text-xs text-red-600">
                        • {error}
                      </div>
                    ))}
                    {lastSyncResult.errors.length > 2 && (
                      <div className="text-xs text-red-600">
                        ... và {lastSyncResult.errors.length - 2} lỗi khác
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoSyncStatus;
