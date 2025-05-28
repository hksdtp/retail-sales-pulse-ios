import React, { useState, useEffect, ReactNode } from 'react';
import { Task } from '@/components/tasks/types/TaskTypes';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskFilters } from './TaskContext';

// Provider component
export const TaskDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Hàm lấy dữ liệu từ local storage
  const getLocalTasks = (): Task[] => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  };

  // Hàm lưu dữ liệu vào local storage
  const saveLocalTasks = (tasksData: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasksData));
  };
  
  // Hàm chuyển đổi dữ liệu từ GoogleSheetsTask sang Task
  const convertGoogleSheetsTasks = (googleTasks: Task[]): Task[] => {
    return googleTasks.map(task => {
      // Đảm bảo trường type phù hợp với định nghĩa trong TaskTypes
      const validType = isValidTaskType(task.type) ? task.type : 'other';
      
      // Đảm bảo trường status phù hợp
      const validStatus = isValidTaskStatus(task.status) ? task.status : 'todo';
      
      // Chuyển đổi sang Task đúng định dạng
      return {
        ...task,
        type: validType,
        status: validStatus,
        progress: typeof task.progress === 'number' ? task.progress : 0,
        isNew: task.isNew === true,
        teamId: task.teamId || task.team_id || '',
        assignedTo: task.assignedTo || ''
      } as Task;
    });
  };
  
  // Kiểm tra nếu type hợp lệ
  const isValidTaskType = (type: string): type is Task['type'] => {
    return [
      'partner_new', 'partner_old', 'architect_new', 'architect_old',
      'client_new', 'client_old', 'quote_new', 'quote_old', 'other'
    ].includes(type);
  };
  
  // Kiểm tra nếu status hợp lệ
  const isValidTaskStatus = (status: string): status is Task['status'] => {
    return ['todo', 'in-progress', 'on-hold', 'completed'].includes(status);
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        let tasksData: Task[] = [];
        
        // Ưu tiên lấy dữ liệu mới nhất từ Google Sheets
        if (googleSheetsService.isConfigured()) {
          try {
            console.log('Đang tải dữ liệu từ Google Sheets...');
            const sheetsData = await googleSheetsService.getTasks();
            if (Array.isArray(sheetsData) && sheetsData.length > 0) {
              console.log(`Đã tải ${sheetsData.length} công việc từ Google Sheets`);
              const convertedTasks = convertGoogleSheetsTasks(sheetsData);
              tasksData = convertedTasks;
              saveLocalTasks(convertedTasks); // Cập nhật localStorage với dữ liệu mới
            } else {
              console.log('Không có dữ liệu từ Google Sheets');
            }
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ Google Sheets:', error);
          }
        } else {
          console.log('Google Sheets chưa được cấu hình, không thể đồng bộ');
        }
        
        // Nếu không lấy được dữ liệu từ Google Sheets, thử lấy từ local storage
        if (tasksData.length === 0) {
          console.log('Đang tải dữ liệu từ localStorage...');
          const localTasks = getLocalTasks();
          if (localTasks.length > 0) {
            console.log(`Đã tải ${localTasks.length} công việc từ localStorage`);
            tasksData = localTasks;
          } else {
            console.log('Không có dữ liệu trong localStorage');
          }
        }
        
        setTasks(tasksData);
      } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu công việc:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu công việc. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
    
    // Thiết lập đồng bộ định kỳ mỗi 30 giây
    const syncInterval = setInterval(() => {
      if (googleSheetsService.isConfigured() && !isLoading) {
        refreshTasks();
      }
    }, 30000); // 30 giây
    
    return () => clearInterval(syncInterval);
  }, [toast]);

  // Thêm công việc mới
  const addTask = async (task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>): Promise<Task> => {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: task.title,
      description: task.description,
      type: task.type,
      date: task.date,
      status: task.status,
      progress: typeof task.progress === 'number' ? task.progress : 0,
      isNew: true,
      location: task.location || (currentUser?.location || ''),
      teamId: task.teamId || (currentUser?.team_id || ''),
      assignedTo: task.assignedTo || currentUser?.id || '',
      user_id: currentUser?.id || '',
      user_name: currentUser?.name || '',
      created_at: new Date().toISOString(),
      time: task.time || ''
    };
    
    console.log('Thêm công việc mới:', newTask);
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);
    
    // Lưu vào Google Sheets nếu đã cấu hình
    if (googleSheetsService.isConfigured()) {
      try {
        console.log('Bắt đầu lưu công việc vào Google Sheets...');
        await googleSheetsService.saveTask(newTask);
        console.log('Lưu công việc vào Google Sheets thành công');
        
        // Tự động làm mới dữ liệu sau khi thêm công việc mới thành công
        console.log('Bắt đầu làm mới dữ liệu từ Google Sheets...');
        setTimeout(async () => {
          try {
            const sheetsData = await googleSheetsService.getTasks();
            if (Array.isArray(sheetsData) && sheetsData.length > 0) {
              // Kiểm tra xem dữ liệu có phải là dữ liệu mẫu không
              const isMockData = sheetsData.some(task => 
                task.id?.includes('task_1') || 
                task.id?.includes('task_2') || 
                task.id?.includes('task_3')
              );
              
              // Chỉ cập nhật khi không phải là dữ liệu mẫu
              if (!isMockData) {
                console.log(`Đã tải ${sheetsData.length} công việc từ Google Sheets`);
                const convertedTasks = convertGoogleSheetsTasks(sheetsData);
                
                // Đảm bảo công việc mới vẫn còn trong danh sách
                if (!convertedTasks.some(t => t.id === newTask.id)) {
                  convertedTasks.push(newTask);
                }
                
                setTasks(convertedTasks);
                saveLocalTasks(convertedTasks);
                toast({
                  title: "Đã thêm công việc mới",
                  description: "Công việc đã được thêm và đồng bộ thành công"
                });
              } else {
                console.log('Đang sử dụng dữ liệu mẫu, giữ nguyên công việc mới đã thêm');
                toast({
                  title: "Đã thêm công việc mới",
                  description: "Công việc đã được thêm nhưng đang ở chế độ ngoại tuyến"
                });
              }
            } else {
              console.warn('Không lấy được dữ liệu mới từ Google Sheets sau khi thêm');
            }
          } catch (refreshError) {
            console.error('Lỗi khi làm mới dữ liệu sau khi thêm:', refreshError);
            // Khi có lỗi, giữ nguyên công việc đã thêm
            toast({
              title: "Lưu ý",
              description: "Công việc đã được thêm nhưng chưa đồng bộ được với Google Sheets"
            });
          }
        }, 2000); // Chờ 2 giây để Google Sheets có thời gian xử lý
      } catch (error) {
        console.error('Lỗi khi lưu công việc vào Google Sheets:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được lưu cục bộ nhưng chưa đồng bộ với Google Sheets.",
          variant: "warning"
        });
      }
    }
    
    return newTask;
  };

  // Cập nhật công việc
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error("Không tìm thấy công việc để cập nhật");
    }
    
    const updatedTask = { ...tasks[taskIndex], ...updates };
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);
    
    // Cập nhật vào Google Sheets nếu đã cấu hình
    if (googleSheetsService.isConfigured()) {
      try {
        await googleSheetsService.updateTask(updatedTask);
      } catch (error) {
        console.error('Lỗi khi cập nhật công việc vào Google Sheets:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được cập nhật cục bộ nhưng chưa đồng bộ với Google Sheets.",
          variant: "warning"
        });
      }
    }
    
    return updatedTask;
  };

  // Xóa công việc
  const deleteTask = async (id: string): Promise<boolean> => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);
    
    // Xóa từ Google Sheets nếu đã cấu hình
    if (googleSheetsService.isConfigured()) {
      try {
        await googleSheetsService.deleteTask(id);
      } catch (error) {
        console.error('Lỗi khi xóa công việc từ Google Sheets:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được xóa cục bộ nhưng chưa đồng bộ với Google Sheets.",
          variant: "warning"
        });
      }
    }
    
    return true;
  };

  // Cập nhật trạng thái công việc
  const updateTaskStatus = async (id: string, status: 'todo' | 'in-progress' | 'on-hold' | 'completed'): Promise<Task> => {
    return await updateTask(id, { status });
  };

  // Làm mới danh sách công việc
  const refreshTasks = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (googleSheetsService.isConfigured()) {
        const sheetsData = await googleSheetsService.getTasks();
        if (Array.isArray(sheetsData) && sheetsData.length > 0) {
          const convertedTasks = convertGoogleSheetsTasks(sheetsData);
          setTasks(convertedTasks);
          saveLocalTasks(convertedTasks);
          toast({
            title: "Làm mới thành công",
            description: "Dữ liệu công việc đã được cập nhật từ Google Sheets"
          });
          return;
        }
      }
      
      // Nếu không lấy được từ Google Sheets, lấy từ local storage
      const localTasks = getLocalTasks();
      setTasks(localTasks);
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu công việc:', error);
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu công việc. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc công việc theo các tiêu chí
  const filterTasks = (filters: TaskFilters): Task[] => {
    return tasks.filter(task => {
      // Lọc theo trạng thái
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      
      // Lọc theo tiến độ
      if (filters.progress !== null && filters.progress !== undefined && task.progress < filters.progress) {
        return false;
      }
      
      // Lọc theo khoảng ngày cụ thể
      if (filters.startDate && filters.endDate) {
        const taskDate = new Date(task.date);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        
        if (taskDate < start || taskDate > end) {
          return false;
        }
      }
      // Lọc theo phạm vi thời gian
      else if (filters.dateRange) {
        const taskDate = new Date(task.date);
        const today = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            if (taskDate.toDateString() !== today.toDateString()) {
              return false;
            }
            break;
          case 'week': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            if (taskDate < weekStart || taskDate > weekEnd) {
              return false;
            }
            break;
          }
          case 'month':
            if (
              taskDate.getMonth() !== today.getMonth() ||
              taskDate.getFullYear() !== today.getFullYear()
            ) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
  };

  const value = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refreshTasks,
    filterTasks
  };

  return (
    <TaskDataContext.Provider value={value}>
      {children}
    </TaskDataContext.Provider>
  );
};
