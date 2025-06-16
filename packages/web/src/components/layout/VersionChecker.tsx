import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VersionManager, AppVersion } from '@/utils/versionManager';

interface VersionCheckerProps {
  onVersionUpdate?: () => void;
}

const VersionChecker: React.FC<VersionCheckerProps> = ({ onVersionUpdate }) => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<AppVersion | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Kiểm tra version khi component mount
    const checkVersion = () => {
      const hasUpdate = VersionManager.checkVersion();
      if (hasUpdate) {
        setCurrentVersion(VersionManager.getCurrentVersion());
        setShowUpdateNotification(true);
        onVersionUpdate?.();
      }
    };

    checkVersion();

    // Kiểm tra version định kỳ (mỗi 5 phút)
    const interval = setInterval(checkVersion, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [onVersionUpdate]);

  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      VersionManager.forceRefresh();
    }, 1000);
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification || !currentVersion) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 right-4 z-[9999] max-w-sm"
      >
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Cập nhật thành công!</h3>
                  <p className="text-xs text-blue-100">Version {currentVersion.version}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 rounded-lg h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tính năng mới:
              </h4>
              <ul className="space-y-1">
                {currentVersion.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-xs text-blue-100 flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-200 rounded-full mt-1.5 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
                {currentVersion.features.length > 3 && (
                  <li className="text-xs text-blue-200 italic">
                    +{currentVersion.features.length - 3} tính năng khác...
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-100">
                <strong>Lưu ý:</strong> Nếu bạn vẫn thấy giao diện cũ, hãy nhấn "Làm mới" để cập nhật hoàn toàn.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 h-9 text-xs border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              >
                Đóng
              </Button>
              <Button
                onClick={handleForceRefresh}
                disabled={isRefreshing}
                className="flex-1 h-9 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isRefreshing ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Đang làm mới...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3" />
                    Làm mới
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Build info */}
          <div className="px-4 py-2 bg-black/20 border-t border-white/10">
            <p className="text-xs text-blue-200 text-center">
              Build: {new Date(currentVersion.buildTime).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionChecker;
