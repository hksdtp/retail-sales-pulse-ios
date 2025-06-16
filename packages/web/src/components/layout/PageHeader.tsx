import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { CacheHelper } from '@/utils/cacheHelper';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onTaskClick?: (taskId: string) => void;
}

const PageHeader = ({ title, subtitle, actions, onTaskClick }: PageHeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      CacheHelper.forceReload();
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between py-6 px-6 md:px-8 border-b border-white/20 dark:border-gray-700/50 backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-[20px] mb-6 shadow-sm"
    >
      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-[#2d3436] dark:text-white tracking-wide"
          data-testid="page-title"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-sm text-[#636e72] dark:text-gray-300 mt-2 font-medium"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="mt-4 md:mt-0 flex items-center space-x-3 relative"
      >
        {/* Force Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          disabled={isRefreshing}
          className="border-orange-500 text-orange-600 hover:bg-orange-50 hidden sm:flex"
          title="Force refresh nếu thấy giao diện cũ"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
        </Button>

        {/* Notification Center */}
        <NotificationCenter onTaskClick={onTaskClick || (() => {})} />

        {/* Actions */}
        {actions}
      </motion.div>
    </motion.div>
  );
};

export default PageHeader;
