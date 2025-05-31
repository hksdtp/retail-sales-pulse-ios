
import React, { useState, useEffect } from 'react';
import { firebaseService } from '@/services/FirebaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext } from './TaskContext';

// Provider component
export const TaskDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, users, teams } = useAuth();

  // Hàm lấy dữ liệu từ local storage
  const getLocalTasks = () => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  };

  // Hàm lưu dữ liệu vào local storage
  const saveLocalTasks = (tasksData: any[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasksData));
  };

  // Hàm chuyển đổi dữ liệu từ Firebase sang định dạng Task
  const convertFirebaseTasks = (fbTasks: any[]) => {
    return fbTasks.map((task) => {
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
      };
    });
  };

  // Kiểm tra nếu type hợp lệ
  const isValidTaskType = (type: string) => {
    return ['partner_new', 'partner_old', 'architect_new', 'architect_old', 'client_new', 'client_old', 'quote_new', 'quote_old', 'other'].includes(type);
  };

  // Kiểm tra nếu status hợp lệ
  const isValidTaskStatus = (status: string) => {
    return ['todo', 'in-progress', 'on-hold', 'completed'].includes(status);
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        let tasksData = [];
        
        // Ưu tiên lấy dữ liệu mới nhất từ Firebase
        if (firebaseService.isConfigured()) {
          try {
            console.log('Đang tải dữ liệu từ Firebase...');
            const firestoreData = await firebaseService.getTasks();
            if (Array.isArray(firestoreData) && firestoreData.length > 0) {
              console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
              const convertedTasks = convertFirebaseTasks(firestoreData);
              tasksData = convertedTasks;
            } else {
              console.log('Không có dữ liệu từ Firebase');
            }
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
          }
        }
        
        // Nếu không lấy được dữ liệu từ Firebase, thử lấy từ local storage
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

        // Logic lọc phân quyền
        let filteredTasksForRole = [];
        if (currentUser && users && teams) {
          const userRole = currentUser.role;
          const userId = currentUser.id;
          
          if (userRole === 'employee') {
            filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
          } else if (userRole === 'team_leader') {
            const managedTeams = teams.filter(team => team.leader_id === userId);
            const managedTeamIds = managedTeams.map(team => team.id);
            const teamMemberIds = users.filter(user => user.team_id && managedTeamIds.includes(user.team_id)).map(user => user.id);
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

        setTasks(tasksData);
        saveLocalTasks(tasksData);
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
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [toast]);

  // Thêm công việc mới
  const addTask = async (task: any) => {
    const newTask = {
      ...task,
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: task.title,
      description: task.description,
      type: task.type,
      date: task.date,
      status: task.status,
      progress: typeof task.progress === 'number' ? task.progress : 0,
      isNew: true,
      location: task.location || currentUser?.location || '',
      teamId: task.teamId || currentUser?.team_id || '',
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
      } catch (error) {
        console.error('Lỗi khi lưu công việc vào Firebase:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được lưu cục bộ nhưng chưa đồng bộ với Firebase.",
          variant: "warning"
        });
      }
    }

    return newTask;
  };

  // Cập nhật công việc
  const updateTask = async (id: string, updates: any) => {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new Error("Không tìm thấy công việc để cập nhật");
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);

    // Cập nhật vào Firebase nếu đã cấu hình
    if (firebaseService.isConfigured()) {
      try {
        await firebaseService.updateTask(updatedTask);
      } catch (error) {
        console.error('Lỗi khi cập nhật công việc vào Firebase:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được cập nhật cục bộ nhưng chưa đồng bộ với Firebase.",
          variant: "warning"
        });
      }
    }

    return updatedTask;
  };

  // Xóa công việc
  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveLocalTasks(updatedTasks);

    // Xóa từ Firebase nếu đã cấu hình
    if (firebaseService.isConfigured()) {
      try {
        await firebaseService.deleteTask(id);
      } catch (error) {
        console.error('Lỗi khi xóa công việc từ Firebase:', error);
        toast({
          title: "Cảnh báo",
          description: "Công việc đã được xóa cục bộ nhưng chưa đồng bộ với Firebase.",
          variant: "warning"
        });
      }
    }

    return true;
  };

  // Cập nhật trạng thái công việc
  const updateTaskStatus = async (id: string, status: string) => {
    return await updateTask(id, { status });
  };

  // Làm mới danh sách công việc
  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      let tasksData = [];
      
      if (firebaseService.isConfigured()) {
        const firestoreData = await firebaseService.getTasks();
        if (Array.isArray(firestoreData) && firestoreData.length > 0) {
          const convertedTasks = convertFirebaseTasks(firestoreData);
          tasksData = convertedTasks;
        }
      }

      if (tasksData.length === 0) {
        const localTasks = getLocalTasks();
        tasksData = localTasks;
      }

      // Áp dụng logic lọc phân quyền tương tự như initialize
      let filteredTasksForRole = [];
      if (currentUser && users && teams) {
        const userRole = currentUser.role;
        const userId = currentUser.id;
        
        if (userRole === 'employee') {
          filteredTasksForRole = tasksData.filter(task => task.assignedTo === userId);
        } else if (userRole === 'team_leader') {
          const managedTeams = teams.filter(team => team.leader_id === userId);
          const managedTeamIds = managedTeams.map(team => team.id);
          const teamMemberIds = users.filter(user => user.team_id && managedTeamIds.includes(user.team_id)).map(user => user.id);
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

      setTasks(tasksData);
      saveLocalTasks(tasksData);
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refreshTasks,
    currentUser
  };

  return (
    <TaskDataContext.Provider value={contextValue}>
      {children}
    </TaskDataContext.Provider>
  );
};
