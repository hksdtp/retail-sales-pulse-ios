import React, { useState, useEffect, ReactNode } from 'react';
import { Task } from '../components/tasks/types/TaskTypes';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskDataContextType, TaskFilters } from './TaskContext';
import { getTasks, createTask, updateTask, deleteTask as deleteTaskApi } from '@/services/api';

// Provider component sử dụng API thật
export const ApiTaskDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Lấy dữ liệu từ API với phân quyền
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      console.log('🌐 Đang tải tasks từ API...');
      console.log('👤 Current user:', currentUser);

      if (!currentUser) {
        console.log('⚠️ Chưa có thông tin user, bỏ qua việc tải tasks');
        setTasks([]);
        setFilteredTasks([]);
        return;
      }

      // Gọi API với thông tin user để filter đúng
      const response = await getTasks(currentUser);

      if (response.success && response.data) {
        console.log(`✅ Đã tải ${response.count} tasks từ API cho user ${currentUser.name} (${currentUser.id})`);
        console.log('📊 Tasks data:', response.data);

        // Double check: Filter thêm ở frontend để đảm bảo an toàn
        const userTasks = response.data.filter(task => {
          // Chỉ hiển thị tasks được giao cho user hiện tại
          return task.assignedTo === currentUser.id || task.user_id === currentUser.id;
        });

        console.log(`🔒 Sau khi filter frontend: ${userTasks.length}/${response.data.length} tasks`);

        setTasks(userTasks);
        setFilteredTasks(userTasks);
      } else {
        console.error('❌ Lỗi khi tải tasks:', response.error);
        toast({
          title: "Lỗi",
          description: response.error || "Không thể tải dữ liệu công việc",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải tasks:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load dữ liệu ban đầu và khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]); // Reload khi user thay đổi

  // Thêm công việc mới
  const addTask = async (taskData: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>): Promise<Task> => {
    if (!currentUser) {
      throw new Error("Bạn cần đăng nhập để thêm công việc mới");
    }

    const newTaskData = {
      ...taskData,
      progress: taskData.progress || 0,
      user_id: currentUser.id,
      user_name: currentUser.name,
      team_id: currentUser.team_id || '',
      location: currentUser.location || '',
      assignedTo: taskData.assignedTo || currentUser.id,
      time: taskData.time || '',
      isNew: true
    };

    try {
      console.log('🌐 Đang tạo task mới qua API...');
      const response = await createTask(newTaskData);
      
      if (response.success && response.data) {
        console.log('✅ Đã tạo task thành công:', response.data);
        
        // Cập nhật state local
        const newTask = response.data;
        setTasks(prevTasks => [...prevTasks, newTask]);
        
        toast({
          title: "Thành công",
          description: "Đã thêm công việc mới"
        });
        
        return newTask;
      } else {
        throw new Error(response.error || "Không thể tạo công việc mới");
      }
    } catch (error) {
      console.error('❌ Lỗi khi tạo task:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo công việc mới",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Cập nhật công việc
  const updateTaskData = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      console.log('🌐 Đang cập nhật task qua API...');
      const response = await updateTask(taskId, updates);
      
      if (response.success && response.data) {
        console.log('✅ Đã cập nhật task thành công');
        
        // Cập nhật state local
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, ...response.data } : task
          )
        );
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật công việc"
        });
      } else {
        throw new Error(response.error || "Không thể cập nhật công việc");
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật task:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật công việc",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Xóa công việc
  const deleteTaskData = async (taskId: string): Promise<void> => {
    try {
      console.log('🌐 Đang xóa task qua API...');
      const response = await deleteTaskApi(taskId);
      
      if (response.success) {
        console.log('✅ Đã xóa task thành công');
        
        // Cập nhật state local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        toast({
          title: "Thành công",
          description: "Đã xóa công việc"
        });
      } else {
        throw new Error(response.error || "Không thể xóa công việc");
      }
    } catch (error) {
      console.error('❌ Lỗi khi xóa task:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa công việc",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Làm mới dữ liệu
  const refreshTasks = async (): Promise<void> => {
    await loadTasks();
  };

  // Filter tasks
  const filterTasks = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    let filtered = [...tasks];

    if (newFilters.status) {
      filtered = filtered.filter(task => task.status === newFilters.status);
    }
    if (newFilters.type) {
      filtered = filtered.filter(task => task.type === newFilters.type);
    }
    if (newFilters.search) {
      const search = newFilters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }
    if (newFilters.assignedTo) {
      filtered = filtered.filter(task => task.assignedTo === newFilters.assignedTo);
    }

    setFilteredTasks(filtered);
  };

  // Get task by ID
  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  // Update task status
  const updateTaskStatus = (id: string, status: Task['status']) => {
    updateTaskData(id, { status });
  };

  // Context value
  const contextValue: TaskDataContextType = {
    tasks,
    filteredTasks,
    setTasks,
    isLoading,
    filters,
    addTask,
    updateTask: updateTaskData,
    deleteTask: deleteTaskData,
    refreshTasks,
    filterTasks,
    getTaskById,
    updateTaskStatus
  };

  return (
    <TaskDataContext.Provider value={contextValue}>
      {children}
    </TaskDataContext.Provider>
  );
};
