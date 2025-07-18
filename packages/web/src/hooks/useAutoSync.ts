/**
 * Auto Sync Hook - Hook để quản lý auto sync
 * Ninh ơi - Retail Sales Pulse iOS Project
 */

import { useState, useCallback, useRef } from 'react';
import { LocalToSupabaseAutoSync, SyncResult } from '@/services/LocalToSupabaseAutoSync';
import { useAuth } from '@/context/AuthContextSupabase';
import { useToast } from '@/hooks/use-toast';

export interface UseAutoSyncReturn {
  isRunning: boolean;
  lastSyncResult: SyncResult | null;
  manualSync: () => Promise<SyncResult | null>;
  getSyncStatus: () => { isRunning: boolean };
}

export const useAutoSync = (): UseAutoSyncReturn => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const autoSyncService = LocalToSupabaseAutoSync.getInstance();

  const manualSync = useCallback(async (): Promise<SyncResult | null> => {
    // Debounce để tránh spam clicks
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        if (!currentUser) {
          toast({
            title: 'Lỗi đồng bộ',
            description: 'Vui lòng đăng nhập để đồng bộ dữ liệu',
            variant: 'destructive',
          });
          resolve(null);
          return;
        }

        if (isRunning) {
          toast({
            title: 'Đang đồng bộ',
            description: 'Quá trình đồng bộ đang chạy, vui lòng đợi...',
            variant: 'default',
          });
          resolve(null);
          return;
        }

    setIsRunning(true);
    
    try {
      
      const result = await autoSyncService.manualSync(currentUser.id, currentUser.name);
      setLastSyncResult(result);

      if (result.success) {
        if (result.syncedCount > 0) {
          toast({
            title: 'Đồng bộ thành công',
            description: `Đã đồng bộ ${result.syncedCount} công việc lên cloud`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Không có dữ liệu mới',
            description: 'Tất cả công việc đã được đồng bộ',
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Đồng bộ thất bại',
          description: result.errors.length > 0 ? result.errors[0] : 'Có lỗi xảy ra khi đồng bộ',
          variant: 'destructive',
        });
      }

        resolve(result);
      } catch (error) {
      console.error('❌ Manual sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      toast({
        title: 'Đồng bộ thất bại',
        description: errorMessage,
        variant: 'destructive',
      });

      const failedResult: SyncResult = {
        success: false,
        syncedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [errorMessage],
        details: []
      };
      
        setLastSyncResult(failedResult);
        resolve(failedResult);
      } finally {
        setIsRunning(false);
      }
      }, 300); // 300ms debounce
    });
  }, [currentUser, isRunning, toast, autoSyncService]);

  const getSyncStatus = useCallback(() => {
    return autoSyncService.getSyncStatus();
  }, [autoSyncService]);

  return {
    isRunning,
    lastSyncResult,
    manualSync,
    getSyncStatus,
  };
};
