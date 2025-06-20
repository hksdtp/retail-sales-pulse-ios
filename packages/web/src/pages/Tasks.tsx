import { Download, Plus, Trash2, UserRound, Users, RefreshCw } from 'lucide-react';
import { Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getApiUrl } from '@/config/api';

import ErrorBoundary from '../components/ErrorBoundary';
import { ExportDialog } from '../components/export/ExportDialog';
import AutoFirebaseSetup from '../components/firebase/AutoFirebaseSetup';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import NotificationCenter from '../components/notifications/NotificationCenter';
import FirebaseConfig from '../components/settings/FirebaseConfig';
import MemberTaskSelector from '../components/tasks/MemberTaskSelector';
import SimpleTaskView from '../components/tasks/SimpleTaskView';
import TaskFormDialog from '../components/tasks/TaskFormDialog';
import TaskManagementView from '../components/tasks/TaskManagementView';
import TaskViewSelector from '../components/tasks/TaskViewSelector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { RefreshButton, ExportButton } from '../components/ui/ActionButton';
import { useAuth } from '../context/AuthContext';
import { TaskViewLevel, useManagerTaskData } from '../hooks/use-manager-task-data';
import { useTaskData } from '../hooks/use-task-data';
import { useToast } from '../hooks/use-toast';
import { FirebaseService } from '../services/FirebaseService';
import TaskList from './TaskList';


const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [taskFormType, setTaskFormType] = useState<'self' | 'team' | 'individual'>('self');
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0); // Trigger để kích hoạt làm mới danh sách công việc
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [viewLevel, setViewLevel] = useState<TaskViewLevel>('personal');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { currentUser, teams } = useAuth();
  const { toast } = useToast();

  // Kiểm tra xem user có phải manager không
  const isManager =
    currentUser?.role === 'retail_director' ||
    currentUser?.role === 'project_director' ||
    currentUser?.role === 'team_leader';

  // Sử dụng hook phù hợp dựa trên role
  const regularTaskData = useTaskData();
  const managerTaskData = useManagerTaskData(viewLevel, selectedMemberId);

  // Chọn data source dựa trên role và view level
  const tasks =
    isManager && viewLevel !== 'personal' ? managerTaskData.tasks : regularTaskData.tasks;

  // Hàm để kích hoạt làm mới danh sách công việc
  const handleTaskCreated = () => {
    // Tăng giá trị trigger để kích hoạt useEffect trong TaskList
    setTaskUpdateTrigger((prev) => prev + 1);
    toast({
      title: 'Đã làm mới dữ liệu',
      description: 'Danh sách công việc đã được cập nhật với công việc mới',
    });
  };

  // Hàm xóa toàn bộ công việc
  const handleDeleteAllTasks = async () => {
    console.log('🚀 === DELETE ALL TASKS STARTED ===');
    console.log('Current user:', currentUser);

    setIsDeleting(true);
    try {
      if (!currentUser?.id) {
        console.error('❌ No current user ID');
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('✅ User ID found:', currentUser.id, 'Type:', typeof currentUser.id);

      // SỬ DỤNG FIRESTORE REST API THAY VÌ SDK
      console.log('🔥 USING FIRESTORE REST API FOR DEBUGGING');

      const projectId = 'appqlgd';
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

      console.log('🔧 Fetching tasks via REST API...');

      try {
        // Lấy tất cả tasks qua REST API
        const response = await fetch(`${baseUrl}/tasks`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ REST API response:', data);

        const tasks = data.documents || [];
        console.log(`📊 Total tasks found: ${tasks.length}`);

        // Debug: Xem cấu trúc tasks
        tasks.forEach((task, index) => {
          console.log(`Task ${index}:`, task);
          const fields = task.fields || {};
          console.log(
            `  - assignedTo: ${fields.assignedTo?.stringValue || fields.assignedTo?.integerValue || 'undefined'}`,
          );
          console.log(
            `  - user_id: ${fields.user_id?.stringValue || fields.user_id?.integerValue || 'undefined'}`,
          );
          console.log(`  - title: ${fields.title?.stringValue || 'undefined'}`);
        });

        console.log(`=== CURRENT USER INFO ===`);
        console.log(`Current user ID: ${currentUser.id} (type: ${typeof currentUser.id})`);

        // Tìm tasks của user hiện tại
        const userTasks = tasks.filter((task) => {
          const fields = task.fields || {};
          const assignedTo = fields.assignedTo?.stringValue || fields.assignedTo?.integerValue;
          const user_id = fields.user_id?.stringValue || fields.user_id?.integerValue;

          return assignedTo == currentUser.id || user_id == currentUser.id;
        });

        console.log(`🎯 Found ${userTasks.length} tasks for current user`);

        if (userTasks.length === 0) {
          toast({
            title: 'Thông báo',
            description: `Không có công việc nào để xóa. Tìm thấy ${tasks.length} tasks tổng cộng nhưng không có task nào thuộc về user ${currentUser.id}.`,
          });
          return;
        }

        // Xóa tasks qua REST API
        console.log('🗑️ Deleting tasks via REST API...');
        const deletePromises = userTasks.map(async (task) => {
          const taskPath = task.name; // Full path của document
          const deleteResponse = await fetch(`https://firestore.googleapis.com/v1/${taskPath}`, {
            method: 'DELETE',
          });
          return deleteResponse.ok;
        });

        const deleteResults = await Promise.all(deletePromises);
        const successCount = deleteResults.filter((result) => result).length;

        toast({
          title: 'Thành công!',
          description: `Đã xóa ${successCount}/${userTasks.length} công việc qua REST API.`,
        });

        // Trigger refresh
        setTaskUpdateTrigger((prev) => prev + 1);
        return;
      } catch (error) {
        console.error('❌ REST API error:', error);
        throw error;
      }

      // Fallback: Nếu REST API không hoạt động, thông báo lỗi
      console.log('❌ All methods failed');
    } catch (error) {
      console.error('Lỗi khi xóa toàn bộ công việc:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể xóa toàn bộ công việc: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Firebase đã được auto-setup trong App.tsx, không cần manual setup nữa
  useEffect(() => {
    const isConfigured = FirebaseService.isConfigured();

    if (isConfigured) {
      console.log('✅ Firebase is ready');
    } else {
      console.log('⚠️ Firebase not configured, some features may be limited');
    }
  }, []);

  // Listen for auto-sync events
  useEffect(() => {
    const handleTasksUpdated = (event: CustomEvent) => {
      console.log('📡 Tasks page received tasks-updated event:', event.detail);

      // Force refresh tasks
      console.log('🔄 Tasks page refreshing due to auto-sync...');
      setTaskUpdateTrigger((prev) => prev + 1);

      // Show toast notification
      if (event.detail?.taskTitle) {
        toast({
          title: '🎉 Công việc mới được đồng bộ',
          description: `Kế hoạch "${event.detail.taskTitle}" đã được tự động chuyển thành công việc`,
        });
      }
    };

    const handleTasksRefreshed = (event: CustomEvent) => {
      console.log('📡 Tasks page received tasks-refreshed event:', event.detail);

      // Additional UI refresh
      console.log('🔄 Tasks page additional refresh due to tasks-refreshed event...');
      setTaskUpdateTrigger((prev) => prev + 1);
    };

    // Add event listeners
    window.addEventListener('tasks-updated', handleTasksUpdated as EventListener);
    window.addEventListener('tasks-refreshed', handleTasksRefreshed as EventListener);
    console.log('📡 Tasks page added event listeners');

    // Cleanup
    return () => {
      window.removeEventListener('tasks-updated', handleTasksUpdated as EventListener);
      window.removeEventListener('tasks-refreshed', handleTasksRefreshed as EventListener);
      console.log('📡 Tasks page removed event listeners');
    };
  }, [toast]);

  // Xác định vị trí và tiêu đề phù hợp với vai trò
  const locationName = currentUser?.location === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh';

  let subtitle = '';
  let headerTitle = 'Quản lý công việc';

  if (currentUser?.role === 'retail_director') {
    subtitle = 'Theo dõi và quản lý tất cả công việc của phòng kinh doanh bán lẻ';
  } else if (currentUser?.role === 'project_director') {
    subtitle = 'Theo dõi và quản lý tất cả công việc của phòng kinh doanh dự án';
  } else if (currentUser?.role === 'team_leader') {
    const userTeam = teams.find((team) => team.leader_id === currentUser.id);
    subtitle = `Theo dõi và quản lý công việc của ${userTeam?.name || 'nhóm'} - ${locationName}`;
  } else {
    subtitle = `Theo dõi công việc được giao - ${locationName}`;
    headerTitle = 'Công việc của tôi';
  }

  // Tất cả người dùng đều có thể tạo công việc mới, nhân viên chỉ có thể tạo công việc cho chính mình
  const canCreateTask = true; // Cho phép tất cả người dùng tạo công việc

  // Firebase auto-setup đã được xử lý trong App.tsx

  return (
    <AppLayout>
      <PageHeader
        title={headerTitle}
        subtitle={subtitle}
        onTaskClick={(taskId) => {
          console.log('Clicked on task:', taskId);
          // TODO: Implement task navigation
          alert(`Mở công việc: ${taskId}`);
        }}
        actions={
          <div className="flex space-x-2">
            <ExportDialog>
              <ExportButton
                size="icon"
                title="Xuất dữ liệu tasks"
                className="text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900/20"
              >
                <span className="sr-only">Xuất dữ liệu</span>
              </ExportButton>
            </ExportDialog>

            {/* Data refresh button */}
            <RefreshButton
              type="data"
              size="icon"
              variant="outline"
              title="Tải lại dữ liệu từ Firebase"
              className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/20"
              onClick={() => {
                console.log('🔄 Data refresh triggered');
                setTaskUpdateTrigger((prev) => prev + 1);
                toast({
                  title: '🔄 Đang tải lại',
                  description: 'Dữ liệu công việc đang được tải lại từ Firebase...',
                });
              }}
            >
              <span className="sr-only">Tải lại dữ liệu</span>
            </RefreshButton>

            {/* Nút tạo công việc gộp */}
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] text-white shadow-md hover:opacity-90"
              onClick={() => {
                // Mặc định mở form với type phù hợp với role
                if (
                  currentUser?.role === 'retail_director' ||
                  currentUser?.role === 'project_director'
                ) {
                  setTaskFormType('team');
                } else if (currentUser?.role === 'team_leader') {
                  setTaskFormType('individual');
                } else {
                  setTaskFormType('self');
                }
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-5 w-5" />
              <span>Tạo công việc</span>
            </Button>
          </div>
        }
      />

      <div>
        {/* Giao diện quản lý công việc thống nhất */}
        <ErrorBoundary>
          <TaskManagementView
            viewLevel={viewLevel}
            selectedMemberId={selectedMemberId}
            onViewLevelChange={setViewLevel}
            onSelectedMemberChange={setSelectedMemberId}
            onCreateTask={() => {
              if (
                currentUser?.role === 'retail_director' ||
                currentUser?.role === 'project_director'
              ) {
                setTaskFormType('team');
              } else if (currentUser?.role === 'team_leader') {
                setTaskFormType('individual');
              } else {
                setTaskFormType('self');
              }
              setIsFormOpen(true);
            }}
          />
        </ErrorBoundary>
      </div>

      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        formType={taskFormType}
        onTaskCreated={handleTaskCreated}
      />
      <FirebaseConfig
        open={isFirebaseConfigOpen}
        onOpenChange={setIsFirebaseConfigOpen}
        onConfigSaved={() => {
          toast({
            title: 'Cấu hình thành công',
            description:
              'Firebase đã được cấu hình thành công. Dữ liệu sẽ được lưu trữ an toàn trên Cloud Firestore.',
          });
        }}
      />
    </AppLayout>
  );
};

export default Tasks;
