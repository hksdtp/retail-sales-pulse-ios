import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  X,
  Clock,
  AlertTriangle,
  Users,
  Calendar
} from 'lucide-react';
import { pushNotificationService, TaskNotificationRule } from '@/services/pushNotificationService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface PushNotificationManagerProps {
  className?: string;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [rules, setRules] = useState<TaskNotificationRule[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setPermission(pushNotificationService.getPermissionStatus());
    setRules(pushNotificationService.getRules());
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        // Schedule daily notifications
        pushNotificationService.scheduleDailyNotifications();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    pushNotificationService.updateRule(ruleId, { enabled });
    setRules(pushNotificationService.getRules());
  };

  const sendTestNotification = () => {
    pushNotificationService.sendNotification({
      title: '🧪 Thông báo thử nghiệm',
      body: 'Hệ thống thông báo đang hoạt động tốt!',
      tag: 'test',
      data: { url: '/tasks' }
    });
  };

  const getRuleIcon = (ruleId: string) => {
    switch (ruleId) {
      case 'high_priority_immediate': return AlertTriangle;
      case 'due_in_2_hours': return Clock;
      case 'overdue_tasks': return AlertTriangle;
      case 'daily_summary': return Calendar;
      case 'team_urgent': return Users;
      default: return Bell;
    }
  };

  const getRuleColor = (ruleId: string) => {
    switch (ruleId) {
      case 'high_priority_immediate': return 'text-red-600 bg-red-100';
      case 'due_in_2_hours': return 'text-orange-600 bg-orange-100';
      case 'overdue_tasks': return 'text-red-600 bg-red-100';
      case 'daily_summary': return 'text-blue-600 bg-blue-100';
      case 'team_urgent': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!pushNotificationService.isSupported()) {
    return (
      <div className={cn("bg-yellow-50 border border-yellow-200 rounded-xl p-4", className)}>
        <div className="flex items-center space-x-3">
          <BellOff className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Trình duyệt không hỗ trợ</h3>
            <p className="text-sm text-yellow-700">Trình duyệt của bạn không hỗ trợ push notifications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-xl",
              permission === 'granted' ? 'bg-green-100' : 'bg-gray-100'
            )}>
              {permission === 'granted' ? (
                <Bell className="w-6 h-6 text-green-600" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🔔 Push Notifications</h3>
              <p className="text-sm text-gray-600">
                {permission === 'granted' ? 'Đã bật thông báo' : 'Chưa bật thông báo'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Permission Request */}
      {permission !== 'granted' && (
        <div className="p-6 border-b border-gray-100">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Bật thông báo push</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Nhận thông báo về các công việc quan trọng, deadline và cập nhật từ nhóm.
                </p>
                <button
                  onClick={handleRequestPermission}
                  disabled={isRequesting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRequesting ? 'Đang xin quyền...' : 'Bật thông báo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Rules */}
      {permission === 'granted' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Quy tắc thông báo</h4>
            <button
              onClick={sendTestNotification}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Thử nghiệm
            </button>
          </div>
          
          <div className="space-y-3">
            {rules.map((rule) => {
              const Icon = getRuleIcon(rule.id);
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-lg", getRuleColor(rule.id))}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">{rule.name}</h5>
                      <p className="text-xs text-gray-600">
                        {rule.timing.immediate && 'Thông báo ngay'}
                        {rule.timing.beforeDue && `${rule.timing.beforeDue} giờ trước hạn`}
                        {rule.timing.daily && `Hàng ngày lúc ${rule.timing.daily}`}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5",
                      rule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    )} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && permission === 'granted' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 p-6"
        >
          <h4 className="font-medium text-gray-900 mb-4">Cài đặt nâng cao</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Âm thanh thông báo</h5>
                <p className="text-xs text-gray-600">Phát âm thanh khi có thông báo mới</p>
              </div>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Rung khi thông báo</h5>
                <p className="text-xs text-gray-600">Rung thiết bị khi có thông báo quan trọng</p>
              </div>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 translate-x-6" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900 text-sm">Thông báo cuối tuần</h5>
                <p className="text-xs text-gray-600">Nhận thông báo vào thứ 7 và chủ nhật</p>
              </div>
              <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PushNotificationManager;
