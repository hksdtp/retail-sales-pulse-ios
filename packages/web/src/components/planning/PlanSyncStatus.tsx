import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Calendar,
  ListTodo
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { autoPlanSyncService } from '@/services/AutoPlanSyncService';

interface SyncStats {
  totalPlansChecked: number;
  plansConverted: number;
  plansFailed: number;
  lastSyncTime: string;
}

const PlanSyncStatus: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState(false);

  // Cập nhật stats định kỳ
  useEffect(() => {
    const updateStats = () => {
      // Mock stats cho AutoPlanSyncService
      const mockStats: SyncStats = {
        totalPlansChecked: 0,
        plansConverted: 0,
        plansFailed: 0,
        lastSyncTime: new Date().toISOString()
      };
      setStats(mockStats);
      setIsServiceActive(true); // AutoPlanSyncService luôn active
    };

    // Cập nhật ngay lập tức
    updateStats();

    // Cập nhật mỗi 30 giây
    const interval = setInterval(updateStats, 30000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý sync thủ công
  const handleManualSync = async () => {
    if (!currentUser?.id) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để thực hiện sync',
        variant: 'destructive'
      });
      return;
    }

    setIsManualSyncing(true);
    try {
      console.log('🔄 Bắt đầu sync thủ công...');
      const syncedCount = await autoPlanSyncService.manualSync(currentUser.id);

      // Cập nhật stats
      const updatedStats: SyncStats = {
        totalPlansChecked: stats?.totalPlansChecked || 0,
        plansConverted: (stats?.plansConverted || 0) + syncedCount,
        plansFailed: stats?.plansFailed || 0,
        lastSyncTime: new Date().toISOString()
      };
      setStats(updatedStats);

      if (syncedCount > 0) {
        toast({
          title: '✅ Sync thành công',
          description: `Đã chuyển ${syncedCount} kế hoạch thành công việc`,
        });
      } else {
        toast({
          title: '📋 Sync hoàn tất',
          description: 'Không có kế hoạch nào cần chuyển đổi',
        });
      }
    } catch (error) {
      console.error('❌ Lỗi khi sync:', error);
      toast({
        title: 'Lỗi sync',
        description: 'Không thể thực hiện sync. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Format thời gian
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (!stats) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Đang tải trạng thái sync...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Đồng bộ Kế hoạch → Công việc
            {isServiceActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Đang hoạt động
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-700">{stats.totalPlansChecked}</div>
              <div className="text-xs text-blue-600">Kế hoạch đã kiểm tra</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <ListTodo className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-700">{stats.plansConverted}</div>
              <div className="text-xs text-green-600">Đã chuyển thành công việc</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-700">{stats.plansFailed}</div>
              <div className="text-xs text-red-600">Lỗi chuyển đổi</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-gray-700">Sync cuối</div>
              <div className="text-xs text-gray-600">{formatTime(stats.lastSyncTime)}</div>
            </div>
          </div>

          {/* Nút sync thủ công */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              variant="outline"
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              {isManualSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang sync...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync thủ công
                </>
              )}
            </Button>
          </div>

          {/* Thông tin bổ sung */}
          <div className="text-xs text-gray-500 text-center border-t pt-3">
            <p>Hệ thống tự động kiểm tra kế hoạch đã đến hạn mỗi phút</p>
            <p>Kế hoạch sẽ được chuyển thành công việc khi đến thời gian bắt đầu</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlanSyncStatus;
