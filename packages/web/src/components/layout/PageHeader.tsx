import { motion } from 'framer-motion';
import React from 'react';

import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { QuickThemeToggle } from '@/components/ui/theme-toggle';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onTaskClick?: (taskId: string) => void;
}

const PageHeader = ({ title, subtitle, actions, onTaskClick }: PageHeaderProps) => {
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
        {/* Theme Toggle */}
        <QuickThemeToggle />

        {/* Notification Center */}
        <NotificationCenter onTaskClick={onTaskClick || (() => {})} />

        {/* Actions */}
        {actions}
      </motion.div>
    </motion.div>
  );
};

export default PageHeader;
