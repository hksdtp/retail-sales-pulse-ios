import React, { useState, useEffect, ReactNode } from 'react';
import { Task } from '@/components/tasks/types/TaskTypes';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { firebaseService } from '@/services/FirebaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskFilters } from './TaskContext';

// Provider component
export const TaskDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, users, teams } = useAuth();

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
      const taskType = task.type ? String(task.type) : 'other';
      const validType = isValidTaskType(taskType) ? taskType : 'other';
      
      // Đảm bảo trường status phù hợp
      const taskStatus = task.status ? String(task.status) : 'todo';
      const validStatus = isValidTaskStatus(taskStatus) ? taskStatus : 'todo';
      
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

  // Hàm chuyển đổi dữ liệu từ Firebase sang định dạng Task
  const convertFirebaseTasks = (fbTasks: Record<string, unknown>[]): Task[] => {
    return fbTasks.map(task => {
      // Đảm bảo trường type phù hợp với định nghĩa trong TaskTypes
      const taskType = task.type ? String(task.type) : 'other';
      const validType = isValidTaskType(taskType) ? taskType : 'other';
      
      // Đảm bảo trường status phù hợp
      const taskStatus = task.status ? String(task.status) : 'todo';
      const validStatus = isValidTaskStatus(taskStatus) ? taskStatus : 'todo';
      
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
        
        // Ưu tiên lấy dữ liệu mới nhất từ Firebase
        if (firebaseService.isConfigured()) {
          try {
            console.log('Đang tải dữ liệu từ Firebase...');
            const firestoreData = await firebaseService.getTasks();
            if (Array.isArray(firestoreData) && firestoreData.length > 0) {
              console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
              const convertedTasks = convertFirebaseTasks(firestoreData);
              tasksData = convertedTasks;
              // saveLocalTasks(convertedTasks); // Sẽ lưu sau khi lọc
            } else {
              console.log('Không có dữ liệu từ Firebase');
            }
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
          }
        }
        
        // Nếu không lấy được dữ liệu từ Google Sheets, thử lấy từ local storage
        if (tasksData.length === 0) {
          console.log('Đang tải dữ liệu từ localStorage...');
          const localTasks = getLocalTasks(); // Lấy task thô từ local storage
          if (localTasks.length > 0) {
            console.log(`Đã tải ${localTasks.length} công việc từ localStorage`);
            tasksData = localTasks;
          } else {
            console.log('Không có dữ liệu trong localStorage');
          }
        }

        // === START: LOGIC LỌC PHÂN QUYỀN ===
        let filteredTasksForRole: Task[] = [];
        if (currentUser && users && teams) { 
          const userRole = currentUser.role;
          const userId = currentUser.id;

          if (userRole === 'employee') {
            filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
          } else if (userRole === 'team_leader') {
            const managedTeams = teams.filter(team => team.leader_id === userId);
            const managedTeamIds = managedTeams.map(team => team.id);
            const teamMemberIds = users
              .filter(user => user.team_id && managedTeamIds.includes(user.team_id))
              .map(user => user.id);
            const allVisibleUserIds = [...new Set([userId, ...teamMemberIds])];
            filteredTasksForRole = tasksData.filter(task =>
              (task.assignedTo && allVisibleUserIds.includes(task.assignedTo)) ||
              (task.teamId && managedTeamIds.includes(task.teamId))
            );
          } else if (userRole === 'retail_director' || userRole === 'project_director') {
            const directorDepartment = currentUser.department;
            filteredTasksForRole = tasksData.filter(task => {
              if (task.assignedTo) { 
                const assignedUser = users.find(u => u.id === task.assignedTo);
                return assignedUser && assignedUser.department === directorDepartment;
              }
              if (task.teamId) { 
                const taskTeam = teams.find(t => t.id === task.teamId);
                return taskTeam && taskTeam.department === directorDepartment;
              }
              return false;
            });
          } else {
            filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
          }
          tasksData = filteredTasksForRole; 
        } else if (!currentUser) {
          tasksData = [];
        }
        // === END: LOGIC LỌC PHÂN QUYỀN ===

        setTasks(tasksData); // Cập nhật state với dữ liệu đã lọc
        saveLocalTasks(tasksData); // Lưu dữ liệu đã lọc vào local storage

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
      if (firebaseService.isConfigured() && !isLoading) {
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
    
    // Lưu vào Firebase nếu đã cấu hình
    if (firebaseService.isConfigured()) {
      try {
        console.log('Bắt đầu lưu công việc vào Firebase...');
        await firebaseService.saveTask(newTask);
        console.log('Lưu công việc vào Firebase thành công');
        
        // Tự động làm mới dữ liệu sau khi thêm công việc mới thành công
        console.log('Bắt đầu làm mới dữ liệu từ Firebase...');
        setTimeout(async () => {
          try {
            const firestoreData = await firebaseService.getTasks();
            if (Array.isArray(firestoreData) && firestoreData.length > 0) {
              // Kiểm tra xem dữ liệu có phải là dữ liệu mẫu không
              const isMockData = firestoreData.some(task => 
                String(task.id)?.includes('task_1') || 
                String(task.id)?.includes('task_2') || 
                String(task.id)?.includes('task_3')
              );
              
              // Chỉ cập nhật khi không phải là dữ liệu mẫu
              if (!isMockData) {
                console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
                const convertedTasks = convertFirebaseTasks(firestoreData);
                
                // Đảm bảo công việc mới vẫn còn trong danh sách
                if (!convertedTasks.some(t => t.id === newTask.id)) {
                  convertedTasks.push(newTask);
                }
                
                setTasks(convertedTasks);
                saveLocalTasks(convertedTasks);
                toast({
                  title: "Đã thêm công việc mới",
                  description: "Công việc đã được thêm và đồng bộ thành công với Firebase"
                });
              } else {
                console.log('Đang sử dụng dữ liệu mẫu, giữ nguyên công việc mới đã thêm');
                toast({
                  title: "Đã thêm công việc mới",
                  description: "Công việc đã được thêm nhưng đang ở chế độ ngoại tuyến"
                });
              }
            } else {
              console.warn('Không lấy được dữ liệu mới từ Firebase sau khi thêm');
            }
          } catch (refreshError) {
            console.error('Lỗi khi làm mới dữ liệu sau khi thêm:', refreshError);
            // Khi có lỗi, giữ nguyên công việc đã thêm
            toast({
              title: "Lưu ý",
              description: "Công việc đã được thêm nhưng chưa đồng bộ được với Firebase"
            });
          }
        }, 2000); // Chờ 2 giây để Google Sheets có thời gian xử lý
      } catch (error) {
        console.error('Lỗi khi lưu công việc vào Firebase:', error);
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
    if (firebaseService.isConfigured()) {
      try {
        await firebaseService.updateTask(updatedTask);
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
    if (firebaseService.isConfigured()) {
      try {
        await firebaseService.deleteTask(id);
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
      let tasksData: Task[] = []; // Khởi tạo tasksData
      if (firebaseService.isConfigured()) {
        const firestoreData = await firebaseService.getTasks();
        if (Array.isArray(firestoreData) && firestoreData.length > 0) {
          const convertedTasks = convertFirebaseTasks(firestoreData);
          // setTasks(convertedTasks);
          // saveLocalTasks(convertedTasks);
          tasksData = convertedTasks; // Gán dữ liệu thô vào tasksData
          // toast({
          //   title: "Làm mới thành công",
          //   description: "Dữ liệu công việc đã được cập nhật từ Google Sheets"
          // });
          // return;
        } else {
          // Nếu không có data từ sheet, vẫn có thể có từ local
        }
      }
      
      // Nếu không lấy được từ Google Sheets hoặc sheets không có data, lấy từ local storage
      if (tasksData.length === 0) {
          const localTasks = getLocalTasks();
          tasksData = localTasks; // Gán dữ liệu thô từ local
      }

      // === START: LOGIC LỌC PHÂN QUYỀN (Tương tự như trong initialize) ===
      let filteredTasksForRole: Task[] = [];
      if (currentUser && users && teams) { 
        const userRole = currentUser.role;
        const userId = currentUser.id;

        if (userRole === 'employee') {
          filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
        } else if (userRole === 'team_leader') {
          const managedTeams = teams.filter(team => team.leader_id === userId);
          const managedTeamIds = managedTeams.map(team => team.id);
          const teamMemberIds = users
            .filter(user => user.team_id && managedTeamIds.includes(user.team_id))
            .map(user => user.id);
          const allVisibleUserIds = [...new Set([userId, ...teamMemberIds])];
          filteredTasksForRole = tasksData.filter(task =>
            (task.assignedTo && allVisibleUserIds.includes(task.assignedTo)) ||
            (task.teamId && managedTeamIds.includes(task.teamId))
          );
        } else if (userRole === 'retail_director' || userRole === 'project_director') {
          const directorDepartment = currentUser.department;
          filteredTasksForRole = tasksData.filter(task => {
            if (task.assignedTo) { 
              const assignedUser = users.find(u => u.id === task.assignedTo);
              return assignedUser && assignedUser.department === directorDepartment;
            }
            if (task.teamId) { 
              const taskTeam = teams.find(t => t.id === task.teamId);
              return taskTeam && taskTeam.department === directorDepartment;
            }
            return false;
          });
        } else {
          filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
        }
        tasksData = filteredTasksForRole; 
      } else if (!currentUser) {
        tasksData = [];
      }
      // === END: LOGIC LỌC PHÂN QUYỀN ===

      setTasks(tasksData); // Cập nhật state với dữ liệu đã lọc
      saveLocalTasks(tasksData); // Lưu dữ liệu đã lọc

      toast({
        title: "Làm mới thành công",
        description: "Dữ liệu công việc đã được cập nhật và lọc theo quyền của bạn."
      });

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
