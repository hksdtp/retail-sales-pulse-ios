import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LocalStorageSyncService } from '@/services/LocalStorageSyncService';
import {
  SyncButton,
  RefreshButton,
  ActionButton,
  DeleteButton
} from '@/components/ui/ActionButton';
import { Database, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

        {/* Action Buttons - Grouped by Function */}
        <div className="space-y-4">
          {/* Data Operations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Thao tác dữ liệu</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SyncButton
                onClick={handleSyncAll}
                disabled={isSyncing || syncStats.pending === 0}
                loading={isSyncing}
                className="w-full"
                title={`Đồng bộ ${syncStats.pending} tasks lên Firebase`}
              >
                Đồng bộ tất cả ({syncStats.pending})
              </SyncButton>

              <RefreshButton
                type="ui"
                onClick={loadSyncStats}
                disabled={isSyncing}
                className="w-full"
                variant="outline"
                title="Làm mới thống kê từ localStorage"
              >
                Làm mới thống kê
              </RefreshButton>
            </div>
          </div>

          {/* State Management */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Quản lý trạng thái</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ActionButton
                iconType="reset-state"
                onClick={handleResetSync}
                disabled={isSyncing || syncStats.total === 0}
                className="w-full"
                variant="outline"
                title="Đặt lại tất cả tasks về trạng thái chờ đồng bộ"
              >
                Đặt lại để sync lại
              </ActionButton>

              <ActionButton
                iconType="success"
                onClick={handleCleanup}
                disabled={isSyncing || syncStats.synced === 0}
                className="w-full"
                variant="outline"
                title={`Xóa ${syncStats.synced} tasks đã đồng bộ khỏi localStorage`}
              >
                Dọn dẹp đã hoàn thành ({syncStats.synced})
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-200 pt-4">
          <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
            ⚠️ Vùng nguy hiểm
          </h4>
          <DeleteButton
            onClick={handleClearAll}
            disabled={isSyncing}
            size="sm"
            className="w-full"
            title="Xóa hoàn toàn tất cả dữ liệu tasks trong localStorage"
          >
            Xóa tất cả dữ liệu local
          </DeleteButton>
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
