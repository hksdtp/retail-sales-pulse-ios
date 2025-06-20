import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageSyncService } from '@/services/LocalStorageSyncService';
import { Loader2, Upload, Database, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SyncStats {
  total: number;
  pending: number;
  synced: number;
  failed: number;
  lastSync: string | null;
}

export const LocalStorageSyncPanel: React.FC = () => {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    pending: 0,
    synced: 0,
    failed: 0,
    lastSync: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();
  
  const syncService = LocalStorageSyncService.getInstance();

  // Load sync stats
  const loadSyncStats = () => {
    const stats = syncService.getSyncStats();
    setSyncStats(stats);
  };

  useEffect(() => {
    loadSyncStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadSyncStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync all tasks to Firebase
  const handleSyncAll = async () => {
    if (syncStats.pending === 0) {
      toast({
        title: 'Không có dữ liệu cần đồng bộ',
        description: 'Tất cả tasks đã được đồng bộ lên Firebase',
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      toast({
        title: 'Bắt đầu đồng bộ',
        description: `Đang đồng bộ ${syncStats.pending} tasks lên Firebase...`,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await syncService.syncAllToFirebase();
      
      clearInterval(progressInterval);
      setSyncProgress(100);

      if (result.success) {
        toast({
          title: 'Đồng bộ thành công! 🎉',
          description: `Đã đồng bộ ${result.synced} tasks lên Firebase`,
        });
      } else {
        toast({
          title: 'Đồng bộ hoàn tất với lỗi',
          description: `Thành công: ${result.synced}, Thất bại: ${result.failed}`,
          variant: 'destructive',
        });
      }

      // Show detailed errors if any
      if (result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
        toast({
          title: 'Chi tiết lỗi',
          description: result.errors.slice(0, 3).join(', '),
          variant: 'destructive',
        });
      }

    } catch (error) {
      toast({
        title: 'Lỗi đồng bộ',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
      loadSyncStats();
    }
  };

  // Reset all tasks for re-sync
  const handleResetSync = () => {
    syncService.resetAllTasksForSync();
    loadSyncStats();
    toast({
      title: 'Đã reset trạng thái sync',
      description: 'Tất cả tasks sẽ được đồng bộ lại trong lần sync tiếp theo',
    });
  };

  // Cleanup synced tasks
  const handleCleanup = () => {
    const cleanedCount = syncService.cleanupSyncedTasks();
    loadSyncStats();
    toast({
      title: 'Dọn dẹp hoàn tất',
      description: `Đã xóa ${cleanedCount} tasks đã đồng bộ khỏi localStorage`,
    });
  };

  // Clear all local data
  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa TẤT CẢ dữ liệu local? Hành động này không thể hoàn tác!')) {
      syncService.clearAllLocalData();
      loadSyncStats();
      toast({
        title: 'Đã xóa tất cả dữ liệu local',
        description: 'localStorage đã được làm sạch hoàn toàn',
        variant: 'destructive',
      });
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Chưa đồng bộ';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Đồng bộ dữ liệu LocalStorage → Firebase
        </CardTitle>
        <CardDescription>
          Quản lý và đồng bộ các tasks đã nhập từ trình duyệt lên Firebase cho toàn bộ người dùng
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sync Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{syncStats.total}</div>
            <div className="text-sm text-blue-600">Tổng tasks</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{syncStats.pending}</div>
            <div className="text-sm text-orange-600">Chờ đồng bộ</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
            <div className="text-sm text-green-600">Đã đồng bộ</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
            <div className="text-sm text-red-600">Thất bại</div>
          </div>
        </div>

        {/* Last Sync Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Lần đồng bộ cuối:</span>
          </div>
          <Badge variant="outline">
            {formatLastSync(syncStats.lastSync)}
          </Badge>
        </div>

        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đang đồng bộ...</span>
              <span className="text-sm text-gray-500">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleSyncAll}
            disabled={isSyncing || syncStats.pending === 0}
            className="w-full"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Đồng bộ tất cả ({syncStats.pending})
          </Button>

          <Button
            onClick={loadSyncStats}
            variant="outline"
            disabled={isSyncing}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>

          <Button
            onClick={handleResetSync}
            variant="outline"
            disabled={isSyncing || syncStats.total === 0}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset trạng thái sync
          </Button>

          <Button
            onClick={handleCleanup}
            variant="outline"
            disabled={isSyncing || syncStats.synced === 0}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Dọn dẹp đã sync ({syncStats.synced})
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-red-600 mb-2">Vùng nguy hiểm</h4>
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
            disabled={isSyncing}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa tất cả dữ liệu local
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-orange-500" />
            <span>Chờ đồng bộ</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Đã đồng bộ</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-red-500" />
            <span>Thất bại</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
