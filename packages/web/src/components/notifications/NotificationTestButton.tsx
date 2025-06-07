import { Bell, Edit, Plus, RefreshCw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import notificationService from '@/services/notificationService';

const NotificationTestButton: React.FC = () => {
  const { currentUser } = useAuth();

  const createTestNotifications = () => {
    if (!currentUser) return;

    // Test notification 1: Task created
    notificationService.createTaskNotification(
      'test_task_1',
      'Báo cáo doanh số tháng 12',
      currentUser.id,
      currentUser.name,
    );

    // Test notification 2: Status change
    notificationService.statusChangeNotification(
      'test_task_2',
      'Cập nhật thông tin khách hàng ABC',
      currentUser.id,
      currentUser.name,
      'todo',
      'in-progress',
    );

    // Test notification 3: Priority change
    notificationService.priorityChangeNotification(
      'test_task_3',
      'Họp với đối tác XYZ',
      currentUser.id,
      currentUser.name,
      'normal',
      'high',
    );

    // Test notification 4: Task updated
    notificationService.updateTaskNotification(
      'test_task_4',
      'Kiểm tra kho hàng',
      currentUser.id,
      currentUser.name,
      'tiêu đề, mô tả',
    );

    alert('Đã tạo 4 thông báo test! Kiểm tra icon chuông ở góc phải.');
  };

  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
    alert('Đã xóa tất cả thông báo!');
  };

  // Chỉ hiển thị cho manager
  const shouldShow =
    currentUser?.role === 'retail_director' ||
    currentUser?.role === 'project_director' ||
    currentUser?.role === 'team_leader';

  if (!shouldShow) return null;

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={createTestNotifications}
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Bell className="w-4 h-4 mr-2" />
        Test Thông báo
      </Button>

      <Button
        onClick={clearAllNotifications}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Xóa tất cả
      </Button>
    </div>
  );
};

export default NotificationTestButton;
