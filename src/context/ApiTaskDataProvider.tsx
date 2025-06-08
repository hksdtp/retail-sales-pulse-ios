
import React, { useState, useEffect, ReactNode } from 'react';
import { Task } from '../components/tasks/types/TaskTypes';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskDataContextType, TaskFilters } from './TaskContext';
import { getTasks, createTask, updateTask, deleteTask as deleteTaskApi } from '@/services/api';

export const ApiTaskDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const { toast } = useToast();
  const { currentUser } = useAuth();

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

      const response = await getTasks(currentUser);

      if (response.success && response.data) {
        console.log(`✅ Đã tải ${response.count} tasks từ API cho user ${currentUser.name} (${currentUser.id})`);
        console.log('📊 Tasks data:', response.data);

        // Map API tasks to internal task format
        const mappedTasks: Task[] = response.data.map(apiTask => ({
          ...apiTask,
          teamId: apiTask.team_id || apiTask.teamId || '',
          team_id: apiTask.team_id || '',
          created_at: apiTask.created_at || new Date().toISOString(),
          isNew: apiTask.isNew || false,
          isShared: apiTask.isShared || false,
          isSharedWithTeam: apiTask.isSharedWithTeam || false
        }));

        const userTasks = mappedTasks.filter(task => {
          return task.assignedTo === currentUser.id || task.user_id === currentUser.id;
        });

        console.log(`🔒 Sau khi filter frontend: ${userTasks.length}/${mappedTasks.length} tasks`);

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

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

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
      teamId: currentUser.team_id || '',
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
        
        const mappedTask: Task = {
          ...response.data,
          teamId: response.data.team_id || response.data.teamId || '',
          created_at: response.data.created_at || new Date().toISOString(),
          isNew: response.data.isNew || false,
          isShared: response.data.isShared || false,
          isSharedWithTeam: response.data.isSharedWithTeam || false
        };
        
        setTasks(prevTasks => [...prevTasks, mappedTask]);
        
        toast({
          title: "Thành công",
          description: "Đã thêm công việc mới"
        });
        
        return mappedTask;
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

  const updateTaskData = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    try {
      console.log('🌐 Đang cập nhật task qua API...');
      const response = await updateTask(taskId, updates);
      
      if (response.success && response.data) {
        console.log('✅ Đã cập nhật task thành công');
        
        const mappedTask: Task = {
          ...response.data,
          teamId: response.data.team_id || response.data.teamId || '',
          created_at: response.data.created_at || new Date().toISOString(),
          isNew: response.data.isNew || false,
          isShared: response.data.isShared || false,
          isSharedWithTeam: response.data.isSharedWithTeam || false
        };
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, ...mappedTask } : task
          )
        );
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật công việc"
        });

        return mappedTask;
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

  const deleteTaskData = async (taskId: string): Promise<boolean> => {
    try {
      console.log('🌐 Đang xóa task qua API...');
      const response = await deleteTaskApi(taskId);
      
      if (response.success) {
        console.log('✅ Đã xóa task thành công');
        
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        toast({
          title: "Thành công",
          description: "Đã xóa công việc"
        });

        return true;
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
      return false;
    }
  };

  const refreshTasks = async (): Promise<void> => {
    await loadTasks();
  };

  const filterTasksFunc = (newFilters: TaskFilters): Task[] => {
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
    return filtered;
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  const updateTaskStatus = async (id: string, status: Task['status']): Promise<Task> => {
    return updateTaskData(id, { status });
  };

  const contextValue: TaskDataContextType = {
    tasks,
    filteredTasks,
    isLoading,
    filters,
    addTask,
    updateTask: updateTaskData,
    deleteTask: deleteTaskData,
    refreshTasks,
    filterTasks: filterTasksFunc,
    getTaskById,
    updateTaskStatus
  };

  return (
    <TaskDataContext.Provider value={contextValue}>
      {children}
    </TaskDataContext.Provider>
  );
};
