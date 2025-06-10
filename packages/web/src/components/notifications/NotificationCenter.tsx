import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Eye, Clock, CheckCircle, AlertCircle, Plus, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'task_created' | 'task_updated' | 'status_changed' | 'priority_changed';
  title: string;
  message: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    oldPriority?: string;
    newPriority?: string;
  };
}

interface NotificationCenterProps {
  onTaskClick: (taskId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onTaskClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  // Chỉ hiển thị cho Trưởng phòng và Trưởng bộ phận
  const shouldShowNotifications = currentUser?.role === 'retail_director' || 
                                  currentUser?.role === 'project_director' ||
                                  currentUser?.role === 'team_leader';

  // Load notifications từ localStorage
  useEffect(() => {
    if (!shouldShowNotifications) return;

    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, [shouldShowNotifications]);

  // Lưu notifications vào localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.isRead).length);
  };

  // Đánh dấu đã đọc
  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  // Xóa thông báo
  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updated);
  };

  // Xử lý click vào thông báo
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    onTaskClick(notification.taskId);
    setIsOpen(false);
  };

  // Icon cho từng loại thông báo
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'task_updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'status_changed':
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case 'priority_changed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  // Màu cho từng loại thông báo
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'task_created':
        return 'border-l-green-500 bg-green-50';
      case 'task_updated':
        return 'border-l-blue-500 bg-blue-50';
      case 'status_changed':
        return 'border-l-orange-500 bg-orange-50';
      case 'priority_changed':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!shouldShowNotifications) return null;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel - Using Portal */}
      {isOpen && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop - Invisible, only for click detection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              style={{ zIndex: 2147483646, background: 'transparent' }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-16 right-4 w-80 sm:w-96 md:right-6 lg:right-8 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden"
              style={{ zIndex: 2147483647 }}
              data-notification="center"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Đánh dấu tất cả
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-blue-600 font-medium truncate">
                                📋 {notification.taskTitle}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(new Date(notification.timestamp), {
                                    addSuffix: true,
                                    locale: vi
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>


            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default NotificationCenter;
