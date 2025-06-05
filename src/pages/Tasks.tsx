
import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Plus, Users, UserRound, Download, Trash2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import TaskFormDialog from '../components/tasks/TaskFormDialog';
import { ExportDialog } from '../components/export/ExportDialog';
import { useAuth } from '../context/AuthContext';
import FirebaseConfig from '../components/settings/FirebaseConfig';
import { FirebaseService } from '../services/FirebaseService';
import { Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import TaskList from './TaskList';
import { useTaskData } from '../hooks/use-task-data';
import { getApiUrl } from '@/config/api';
import AutoFirebaseSetup from '../components/firebase/AutoFirebaseSetup';
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
} from "../components/ui/alert-dialog";

const Tasks = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [taskFormType, setTaskFormType] = useState<'self' | 'team' | 'individual'>('self');
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0); // Trigger để kích hoạt làm mới danh sách công việc
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const { currentUser, teams } = useAuth();
  const { toast } = useToast();
  const { tasks } = useTaskData();
  
  // Hàm để kích hoạt làm mới danh sách công việc
  const handleTaskCreated = () => {
    // Tăng giá trị trigger để kích hoạt useEffect trong TaskList
    setTaskUpdateTrigger(prev => prev + 1);
    toast({
      title: "Đã làm mới dữ liệu",
      description: "Danh sách công việc đã được cập nhật với công việc mới"
    });
  };

  // Hàm xóa toàn bộ công việc
  const handleDeleteAllTasks = async () => {
    setIsDeleting(true);
    try {
      if (!currentUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('Deleting tasks for user:', currentUser.id);

      // TẠMTHỜI TẮT API - CHỈ DÙNG FIREBASE ĐỂ DEBUG
      console.log('🔥 SKIPPING API - USING FIREBASE DIRECT FOR DEBUGGING');

      // Fallback: Xóa trực tiếp qua Firebase
      let firebaseService = FirebaseService.getInstance();
      let db = firebaseService.getFirestore();

      if (!db) {
        console.log('Firebase chưa được khởi tạo, đang khởi tạo từ localStorage...');
        const initResult = FirebaseService.initializeFromLocalStorage();
        if (initResult) {
          firebaseService = initResult;
          db = firebaseService.getFirestore();
        }
      }

      if (!db) {
        throw new Error('Firebase chưa được cấu hình. Vui lòng cấu hình Firebase trước khi sử dụng tính năng này.');
      }

      // Debug: Xem cấu trúc tasks trong Firebase
      const { collection, query, where, getDocs, deleteDoc, doc, limit } = await import('firebase/firestore');

      // Lấy TẤT CẢ tasks để xem cấu trúc
      const allTasksRef = collection(db, 'tasks');
      const allTasksSnapshot = await getDocs(allTasksRef);

      console.log('=== ALL TASKS IN DATABASE ===');
      console.log(`Total tasks in database: ${allTasksSnapshot.size}`);
      allTasksSnapshot.docs.forEach((taskDoc, index) => {
        const data = taskDoc.data();
        console.log(`Task ${index} (ID: ${taskDoc.id}):`, data);
        console.log(`  - assignedTo: ${data.assignedTo} (type: ${typeof data.assignedTo})`);
        console.log(`  - user_id: ${data.user_id} (type: ${typeof data.user_id})`);
        console.log(`  - userId: ${data.userId} (type: ${typeof data.userId})`);
        console.log(`  - assigned_to: ${data.assigned_to} (type: ${typeof data.assigned_to})`);
      });

      console.log(`=== CURRENT USER INFO ===`);
      console.log(`Current user ID: ${currentUser.id} (type: ${typeof currentUser.id})`);
      console.log(`Current user name: ${currentUser.name}`);

      // Thử nhiều field có thể chứa user ID
      const possibleFields = ['assignedTo', 'user_id', 'userId', 'assigned_to'];
      let tasksToDelete: any[] = [];
      let foundField = '';

      for (const field of possibleFields) {
        try {
          const tasksRef = collection(db, 'tasks');
          const q = query(tasksRef, where(field, '==', currentUser.id));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.size > 0) {
            console.log(`Found ${querySnapshot.size} tasks with field "${field}"`);
            tasksToDelete = querySnapshot.docs;
            foundField = field;
            break;
          }
        } catch (error) {
          console.log(`Field "${field}" not found:`, error);
        }
      }

      // Thử với string conversion
      if (tasksToDelete.length === 0) {
        const userIdStr = String(currentUser.id);
        for (const field of possibleFields) {
          try {
            const tasksRef = collection(db, 'tasks');
            const q = query(tasksRef, where(field, '==', userIdStr));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.size > 0) {
              console.log(`Found ${querySnapshot.size} tasks with field "${field}" as string`);
              tasksToDelete = querySnapshot.docs;
              foundField = field;
              break;
            }
          } catch (error) {
            console.log(`Field "${field}" string search error:`, error);
          }
        }
      }

      console.log(`Final result: ${tasksToDelete.length} tasks to delete using field "${foundField}"`);

      if (tasksToDelete.length === 0) {
        toast({
          title: "Thông báo",
          description: "Không có công việc nào để xóa. Kiểm tra console để xem cấu trúc tasks."
        });
        return;
      }

      // Xóa từng task
      const deletePromises = tasksToDelete.map(taskDoc =>
        deleteDoc(doc(db, 'tasks', taskDoc.id))
      );

      await Promise.all(deletePromises);

      toast({
        title: "Thành công!",
        description: `Đã xóa ${tasksToDelete.length} công việc qua Firebase (field: ${foundField}).`
      });

      // Trigger refresh
      setTaskUpdateTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Lỗi khi xóa toàn bộ công việc:', error);
      toast({
        title: "Lỗi",
        description: `Không thể xóa toàn bộ công việc: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Kiểm tra và khởi tạo Firebase khi trang được tải
  useEffect(() => {
    let isConfigured = FirebaseService.isConfigured();

    if (!isConfigured) {
      // Thử khởi tạo từ localStorage
      const initResult = FirebaseService.initializeFromLocalStorage();
      if (initResult) {
        isConfigured = true;
        console.log('Firebase đã được khởi tạo từ localStorage');
      }
    }

    if (isConfigured) {
      toast({
        title: "Đã sẵn sàng",
        description: "Firebase đã được cấu hình và đang hoạt động",
        duration: 3000
      });
    } else {
      setShowFirebaseSetup(true);
      toast({
        title: "Cần cấu hình Firebase",
        description: "Vui lòng cấu hình Firebase để sử dụng đầy đủ tính năng",
        variant: "destructive",
        duration: 5000
      });
    }
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
    const userTeam = teams.find(team => team.leader_id === currentUser.id);
    subtitle = `Theo dõi và quản lý công việc của ${userTeam?.name || 'nhóm'} - ${locationName}`;
  } else {
    subtitle = `Theo dõi công việc được giao - ${locationName}`;
    headerTitle = 'Công việc của tôi';
  }

  // Tất cả người dùng đều có thể tạo công việc mới, nhân viên chỉ có thể tạo công việc cho chính mình
  const canCreateTask = true; // Cho phép tất cả người dùng tạo công việc

  // Hiển thị Firebase setup nếu cần
  if (showFirebaseSetup) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <AutoFirebaseSetup />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={headerTitle}
        subtitle={subtitle}
        actions={
          <div className="flex space-x-2">
            <ExportDialog>
              <Button
                variant="outline"
                size="icon"
                title="Xuất dữ liệu"
                className="text-blue-600 border-blue-200 bg-blue-50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </ExportDialog>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFirebaseConfigOpen(true)}
              title="Cấu hình Firebase"
              className="text-green-600 border-green-200 bg-green-50"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Nút xóa toàn bộ công việc */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Xóa toàn bộ công việc"
                  className="text-red-600 border-red-200 bg-red-50"
                  disabled={tasks.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa toàn bộ công việc?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa toàn bộ {tasks.length} công việc của mình?
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllTasks}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa tất cả"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Tất cả vai trò đều có nút này */}
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5 bg-white/80 hover:bg-white/90 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 shadow-sm"
              onClick={() => {
                setTaskFormType('self');
                setIsFormOpen(true);
              }}
            >
              <UserRound className="h-4 w-4" />
              <span>Tạo công việc cho bản thân</span>
            </Button>

            {/* Nếu là Retail Director hoặc Project Director */}
            {(currentUser?.role === 'retail_director' || currentUser?.role === 'project_director') && (
              <Button 
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] text-white shadow-md hover:opacity-90"
                onClick={() => {
                  setTaskFormType('team');
                  setIsFormOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
                <span>Giao việc cho Nhóm/Cá nhân</span>
              </Button>
            )}

            {/* Nếu là Trưởng nhóm và không phải Khổng Đức Mạnh */}
            {currentUser?.role === 'team_leader' && currentUser?.name !== 'Khổng Đức Mạnh' && (
              <Button 
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#4ecdc4] text-white shadow-md hover:opacity-90"
                onClick={() => {
                  setTaskFormType('individual');
                  setIsFormOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
                <span>Giao việc cho thành viên</span>
              </Button>
            )}
            
          </div>
        }
      />
      
      <div>
        <div className="mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Thông tin người dùng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Tên:</span> {currentUser?.name}
            </div>
            <div>
              <span className="font-medium">Vai trò:</span> {
                currentUser?.role === 'retail_director' ? 'Trưởng Phòng Kinh doanh bán lẻ' :
                currentUser?.role === 'project_director' ? 'Trưởng Phòng Kinh Doanh Dự Án' :
                currentUser?.role === 'team_leader' ? 'Trưởng nhóm' : 'Nhân viên'
              }
            </div>
            <div>
              <span className="font-medium">Khu vực:</span> {locationName}
            </div>
          </div>
        </div>
        
        {/* Hiển thị danh sách công việc */}
        <ErrorBoundary>
          <TaskList key={taskUpdateTrigger} />
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
            title: "Cấu hình thành công",
            description: "Firebase đã được cấu hình thành công. Dữ liệu sẽ được lưu trữ an toàn trên Cloud Firestore."
          });
        }}
      />
    </AppLayout>
  );
};

export default Tasks;
