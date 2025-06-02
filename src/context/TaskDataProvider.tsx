<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import { firebaseService } from '@/services/FirebaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext } from './TaskContext';
=======
import React, { useState, useEffect, ReactNode } from 'react';

import { isAdmin, isDirector, isTeamLeader, LogLevel, permissionLog } from '@/config/permissions';
import { Task } from '@/components/tasks/types/TaskTypes';
import { googleSheetsService } from '@/services/GoogleSheetsService';
import { firebaseService } from '@/services/FirebaseService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskFilters } from './TaskContext';
import { mockTasks, saveMockTasksToLocalStorage } from '@/utils/mockData';
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)

// Provider component
export const TaskDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, users, teams } = useAuth();

<<<<<<< HEAD
  // Hàm lấy dữ liệu từ local storage
  const getLocalTasks = () => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  };

  // Hàm lưu dữ liệu vào local storage
  const saveLocalTasks = (tasksData: any[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasksData));
  };
=======
  // === LOCAL STORAGE HELPERS ===
  // Lưu dữ liệu gốc (chưa lọc phân quyền)
  const saveRawTasks = (data: Task[]) => {
    localStorage.setItem('rawTasks', JSON.stringify(data));
  };

  // Lấy dữ liệu gốc từ local storage
  const getRawTasks = (): Task[] => {
    try {
      const storedTasks = localStorage.getItem('rawTasks');
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu gốc từ localStorage:', error);
      return [];
    }
  };

  // Lưu dữ liệu đã lọc phân quyền
  const saveFilteredTasks = (data: Task[]) => {
    localStorage.setItem('filteredTasks', JSON.stringify(data));
  };

  // Lấy dữ liệu đã lọc phân quyền
  const getFilteredTasks = (): Task[] => {
    try {
      const storedTasks = localStorage.getItem('filteredTasks');
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu đã lọc từ localStorage:', error);
      return [];
    }
  };

  // Chuyển đổi dữ liệu cũ sang format mới khi cần
  const migrateOldData = () => {
    try {
      // Kiểm tra xem có dữ liệu cũ không
      const oldData = localStorage.getItem('tasks');
      if (oldData && !localStorage.getItem('rawTasks')) {
        permissionLog('Đang chuyển đổi dữ liệu cũ sang dạng mới...', LogLevel.BASIC);
        // Lưu dữ liệu cũ vào dạng dữ liệu gốc
        localStorage.setItem('rawTasks', oldData);
        // Xóa dữ liệu cũ
        localStorage.removeItem('tasks');
      }
    } catch (error) {
      console.error('Lỗi khi chuyển đổi dữ liệu cũ:', error);
    }
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
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)

  // Hàm chuyển đổi dữ liệu từ Firebase sang định dạng Task
  const convertFirebaseTasks = (fbTasks: any[]) => {
    return fbTasks.map((task) => {
      // Đảm bảo trường type phù hợp với định nghĩa trong TaskTypes
      const taskType = task.type ? String(task.type) : 'other';
      const validType = isValidTaskType(taskType) ? taskType : 'other';
      
      // Đảm bảo trường status phù hợp
      const taskStatus = task.status ? String(task.status) : 'todo';
      const validStatus = isValidTaskStatus(taskStatus) ? taskStatus : 'todo';
      
      // Đảm bảo tất cả các trường bắt buộc có mặt trong đối tượng Task
      return {
        id: String(task.id || ''),
        title: String(task.title || ''),
        description: String(task.description || ''),
        date: String(task.date || new Date().toISOString()),
        type: validType,
        status: validStatus,
        progress: typeof task.progress === 'number' ? task.progress : 0,
<<<<<<< HEAD
        isNew: task.isNew === true,
        teamId: task.teamId || task.team_id || '',
        assignedTo: task.assignedTo || ''
=======
        isNew: Boolean(task.isNew),
        isShared: Boolean(task.isShared),
        isSharedWithTeam: Boolean(task.isSharedWithTeam),
        user_id: String(task.user_id || ''),
        // Các trường bắt buộc theo interface Task
        location: String(task.location || ''),
        created_at: String(task.created_at || new Date().toISOString()),
        // Xử lý các trường đặc biệt
        // Xử lý trường extraAssignees để tránh lỗi với index signature
        // Vì extraAssignees là một mảng, chúng ta chỉ lưu chuỗi JSON để tuân thủ yêu cầu kiểu
        extraAssignees: Array.isArray(task.extraAssignees) 
            ? JSON.stringify(task.extraAssignees) 
            : '',
        teamId: String(task.teamId || task.team_id || ''),
        assignedTo: String(task.assignedTo || '')
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
      };
    });
  };

  // Kiểm tra nếu type hợp lệ
<<<<<<< HEAD
  const isValidTaskType = (type: string) => {
    return ['partner_new', 'partner_old', 'architect_new', 'architect_old', 'client_new', 'client_old', 'quote_new', 'quote_old', 'other'].includes(type);
=======
  const isValidTaskType = (type: string): type is Task['type'] => {
    return ['meeting', 'call', 'task', 'report', 'other'].includes(type);
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
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
<<<<<<< HEAD
        let tasksData = [];
=======
        // Chuyển đổi dữ liệu cũ sang định dạng mới nếu cần
        migrateOldData();
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
        
        let rawTasksData: Task[] = [];
        
        // Kiểm tra xem có dữ liệu thô trong localStorage không
        const localRawTasks = getRawTasks();
        
        // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
        if (localRawTasks.length === 0) {
          console.log('Không tìm thấy dữ liệu gốc trong localStorage, sử dụng dữ liệu mẫu...');
          saveMockTasksToLocalStorage();
          rawTasksData = [...mockTasks];
          // Lưu dữ liệu gốc vào localStorage
          saveRawTasks(rawTasksData);
        } else {
          console.log('Đã tìm thấy dữ liệu gốc trong localStorage:', localRawTasks.length, 'công việc');
          rawTasksData = localRawTasks;
        }
        
        // Ưu tiên lấy dữ liệu mới nhất từ Firebase nếu được cấu hình
        if (firebaseService.isConfigured()) {
          try {
            console.log('Đang tải dữ liệu từ Firebase...');
            const firestoreData = await firebaseService.getTasks();
            if (Array.isArray(firestoreData) && firestoreData.length > 0) {
              console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
              const convertedTasks = convertFirebaseTasks(firestoreData);
<<<<<<< HEAD
              tasksData = convertedTasks;
=======
              rawTasksData = convertedTasks;
              // Lưu dữ liệu gốc từ Firebase
              saveRawTasks(rawTasksData);
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
            } else {
              console.log('Không có dữ liệu từ Firebase');
            }
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
          }
        }
<<<<<<< HEAD
        
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
=======

        // === START: LOGIC LỌC PHÂN QUYỀN MỚI SỬ DỤNG CONFIG ===
        let filteredTasksForRole: Task[] = [];
        if (currentUser && users && teams) {
          permissionLog(`Đang làm mới danh sách công việc cho người dùng: ${currentUser.name} (${currentUser.id}) - Vai trò: ${currentUser.role}`, LogLevel.BASIC);
          const userRole = currentUser.role;
          const userId = currentUser.id;

          // Nếu là quản trị viên hoặc giám đốc - xem được tất cả công việc trong phòng ban
          if (isAdmin(userId) || isDirector(userRole)) {
            permissionLog(`Người dùng ${currentUser.name} là Admin/Director - xem tất cả công việc`, LogLevel.BASIC);
            
            if (isAdmin(userId)) {
              // Admin xem tất cả công việc
              filteredTasksForRole = rawTasksData;
            } else {
              // Giám đốc chỉ xem công việc trong phòng ban của mình
              const directorDepartment = currentUser.department;
              filteredTasksForRole = rawTasksData.filter(task => {
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
            }
          } 
          // Nếu là Trưởng nhóm
          else if (isTeamLeader(userRole)) {
            permissionLog(`Người dùng ${currentUser.name} là Trưởng nhóm - xem công việc của nhóm`, LogLevel.BASIC);
            
            // Tìm các nhóm do người này quản lý
            const managedTeams = teams.filter(team => team.leader_id === userId);
            const managedTeamIds = managedTeams.map(team => team.id);
            
            // Tìm các thành viên trong nhóm
            const teamMemberIds = users
              .filter(user => user.team_id && managedTeamIds.includes(user.team_id))
              .map(user => user.id);
            
            permissionLog(`Trưởng nhóm quản lý ${managedTeamIds.length} nhóm với ${teamMemberIds.length} thành viên`, LogLevel.DETAILED);
            
            // Lọc công việc theo tiêu chí:
            filteredTasksForRole = rawTasksData.filter(task => {
              // 1. Công việc của bản thân
              if (task.assignedTo === userId || task.user_id === userId) {
                permissionLog(`Task ${task.id}: Được phân công cho trưởng nhóm`, LogLevel.DETAILED);
                return true;
              }
              
              // 2. Công việc của nhóm mình
              if (task.teamId && managedTeamIds.includes(task.teamId)) {
                permissionLog(`Task ${task.id}: Thuộc nhóm của trưởng nhóm`, LogLevel.DETAILED);
                return true;
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
              }
              
              // 3. Công việc được admin giao
              const creator = users.find(u => u.id === task.user_id);
              if (creator && isAdmin(creator.id) && task.assignedTo === userId) {
                permissionLog(`Task ${task.id}: Được giao bởi Admin`, LogLevel.DETAILED);
                return true;
              }
              
              // 4. Người dùng được thêm làm người thực hiện cùng
              const extraAssignees = task.extraAssignees || [];
              if (Array.isArray(extraAssignees) && extraAssignees.includes(userId)) {
                permissionLog(`Task ${task.id}: Trưởng nhóm là người thực hiện cùng`, LogLevel.DETAILED);
                return true;
              }
              
              return false;
            });
          } 
          // Nếu là nhân viên thường
          else {
            permissionLog(`Người dùng ${currentUser.name} là nhân viên - xem công việc liên quan`, LogLevel.BASIC);
            
            // Tìm thông tin nhóm của nhân viên
            const userTeamId = currentUser.team_id;
            
            // Lọc công việc theo tiêu chí:
            filteredTasksForRole = rawTasksData.filter(task => {
              // 1. Công việc của bản thân
              if (task.assignedTo === userId || task.user_id === userId) {
                permissionLog(`Task ${task.id}: Được phân công cho nhân viên`, LogLevel.DETAILED);
                return true;
              }
              
              // 2. Công việc chung được chia sẻ bởi admin
              const creator = users.find(u => u.id === task.user_id);
              if (creator && isAdmin(creator.id) && task.isShared) {
                permissionLog(`Task ${task.id}: Công việc chung được chia sẻ bởi Admin`, LogLevel.DETAILED);
                return true;
              }
              
              // 3. Công việc trong nhóm (khi được chỉ định)
              if (task.teamId === userTeamId && (
                task.isSharedWithTeam || // Nếu công việc được chia sẻ với cả nhóm
                task.assignedTo === userId || // Hoặc được giao trực tiếp
                (task.extraAssignees && Array.isArray(task.extraAssignees) && task.extraAssignees.includes(userId)) // Hoặc được thêm làm người thực hiện
              )) {
                permissionLog(`Task ${task.id}: Công việc nhóm có liên quan đến nhân viên`, LogLevel.DETAILED);
                return true;
              }
              
              // 4. Người dùng được thêm làm người thực hiện cùng
              const extraAssignees = task.extraAssignees || [];
              if (Array.isArray(extraAssignees) && extraAssignees.includes(userId)) {
                permissionLog(`Task ${task.id}: Nhân viên là người thực hiện cùng`, LogLevel.DETAILED);
                return true;
              }
              
              return false;
            });
          }
          
<<<<<<< HEAD
          tasksData = filteredTasksForRole;
=======
          permissionLog(`Tìm thấy ${filteredTasksForRole.length}/${rawTasksData.length} công việc phù hợp với quyền của người dùng`, LogLevel.BASIC);
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
        } else if (!currentUser) {
          permissionLog(`Không có người dùng đăng nhập - không hiển thị công việc nào`, LogLevel.BASIC);
          filteredTasksForRole = [];
        }
<<<<<<< HEAD
=======
        // === END: LOGIC LỌC PHÂN QUYỀN MỚI ===

        // Lưu dữ liệu đã lọc phân quyền vào localStorage
        saveFilteredTasks(filteredTasksForRole);
        
        // Cập nhật state với dữ liệu đã lọc
        setTasks(filteredTasksForRole);
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, currentUser, users, teams]);

  // Thêm công việc mới
<<<<<<< HEAD
  const addTask = async (task: any) => {
    const newTask = {
=======
  const addTask = async (task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>): Promise<Task> => {
    // Kiểm tra quyền trước khi thêm công việc mới
    if (!currentUser) {
      throw new Error("Bạn cần đăng nhập để thêm công việc mới");
    }
    
    // Tạo ID duy nhất cho công việc mới
    const uniqueId = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Xây dựng đối tượng công việc đầy đủ thông tin
    const newTask: Task = {
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
      ...task,
      id: uniqueId,
      title: task.title,
      description: task.description,
      type: task.type,
      date: task.date,
      status: task.status,
      progress: typeof task.progress === 'number' ? task.progress : 0,
      isNew: true,
<<<<<<< HEAD
      location: task.location || currentUser?.location || '',
      teamId: task.teamId || currentUser?.team_id || '',
      assignedTo: task.assignedTo || currentUser?.id || '',
      user_id: currentUser?.id || '',
      user_name: currentUser?.name || '',
=======
      location: task.location || (currentUser?.location || ''),
      teamId: task.teamId || (currentUser?.team_id || ''),
      assignedTo: task.assignedTo || currentUser.id,
      user_id: currentUser.id,
      user_name: currentUser.name || '',
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
      created_at: new Date().toISOString(),
      time: task.time || '',
      // Mặc định không chia sẻ công việc trừ khi có chỉ định
      isShared: task.isShared || false,
      isSharedWithTeam: task.isSharedWithTeam || false,
      // Xử lý trường extraAssignees để tránh lỗi kiểu dữ liệu
      extraAssignees: task.extraAssignees ? JSON.stringify(task.extraAssignees) : ''
    };
<<<<<<< HEAD

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
=======
    
    permissionLog(`Người dùng ${currentUser.name} (${currentUser.id}) đang thêm công việc mới ID: ${uniqueId}`, LogLevel.DETAILED);
    console.log('Thêm công việc mới:', newTask);
    
    try {
      // Cập nhật trạng thái và lưu trữ
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Lưu vào bộ nhớ gốc
      saveRawTasks(updatedTasks);
      // Lưu vào bộ nhớ đã lọc
      saveFilteredTasks(updatedTasks);
      
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
                  // Lưu vào bộ nhớ gốc
                  saveRawTasks(convertedTasks);
                  // Lưu vào bộ nhớ đã lọc
                  saveFilteredTasks(convertedTasks);
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
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
      }
      
      // Hiển thị thông báo thành công
      toast({
        title: "Đã thêm công việc mới",
        description: "Công việc đã được thêm thành công"
      });
      
      return newTask;
    } catch (error) {
      console.error('Lỗi khi thêm công việc mới:', error);
      toast({
        title: "Lỗi",
        description: `Không thể thêm công việc mới: ${error.message || 'Lỗi không xác định'}`,
        variant: "destructive"
      });
      throw error;
    }

    return newTask;
  };

  // Cập nhật công việc
<<<<<<< HEAD
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
=======
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    // Kiểm tra quyền trước khi cập nhật công việc
    if (!currentUser) {
      throw new Error("Bạn cần đăng nhập để cập nhật công việc");
    }
    
    // Tìm công việc cần cập nhật
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error("Không tìm thấy công việc để cập nhật");
    }
    
    const taskToUpdate = tasks[taskIndex];
    
    // Kiểm tra quyền cập nhật công việc
    const userRole = currentUser.role;
    const userId = currentUser.id;
    
    // Kiểm tra xem người dùng có quyền cập nhật không
    const isOwner = taskToUpdate.user_id === userId || taskToUpdate.assignedTo === userId;
    const isTeamLead = isTeamLeader(userRole) && taskToUpdate.teamId === currentUser.team_id;
    const isDirectorOrAdmin = isDirector(userRole) || isAdmin(userId);
    
    if (!isOwner && !isTeamLead && !isDirectorOrAdmin) {
      permissionLog(`Người dùng ${currentUser.name} (${userId}) không có quyền cập nhật công việc ID: ${id}`, LogLevel.DETAILED);
      throw new Error("Bạn không có quyền cập nhật công việc này");
    }
    
    permissionLog(`Người dùng ${currentUser.name} (${userId}) đang cập nhật công việc ID: ${id}`, LogLevel.DETAILED);
    
    try {
      // Xử lý extraAssignees nếu có trong cập nhật
      if (updates.extraAssignees && Array.isArray(updates.extraAssignees)) {
        updates.extraAssignees = JSON.stringify(updates.extraAssignees);
      }
      
      // Tạo bản sao cập nhật
      const updatedTask = { ...taskToUpdate, ...updates };
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      // Cập nhật trạng thái và lưu trữ
      setTasks(updatedTasks);
      // Lưu vào bộ nhớ gốc
      saveRawTasks(updatedTasks);
      // Lưu vào bộ nhớ đã lọc
      saveFilteredTasks(updatedTasks);
      
      // Cập nhật vào Firebase nếu đã cấu hình
      if (firebaseService.isConfigured()) {
        try {
          await firebaseService.updateTask(updatedTask);
          toast({
            title: "Đã cập nhật công việc",
            description: "Công việc đã được cập nhật và đồng bộ thành công"
          });
        } catch (error) {
          console.error('Lỗi khi cập nhật công việc vào Firebase:', error);
          toast({
            title: "Cảnh báo",
            description: "Công việc đã được cập nhật cục bộ nhưng chưa đồng bộ với Firebase.",
            variant: "warning"
          });
        }
      } else {
        toast({
          title: "Đã cập nhật công việc",
          description: "Công việc đã được cập nhật thành công"
        });
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error);
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật công việc: ${error.message || 'Lỗi không xác định'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Xóa công việc
  const deleteTask = async (id: string): Promise<boolean> => {
    // Kiểm tra quyền trước khi xóa công việc
    if (!currentUser) {
      throw new Error("Bạn cần đăng nhập để xóa công việc");
    }
    
    // Tìm công việc cần xóa
    const taskToDelete = tasks.find(task => task.id === id);
    
    if (!taskToDelete) {
      throw new Error("Không tìm thấy công việc để xóa");
    }
    
    // Kiểm tra quyền xóa công việc
    const userRole = currentUser.role;
    const userId = currentUser.id;
    
    // Chỉ người tạo, trưởng nhóm, giám đốc hoặc admin mới có quyền xóa
    const isOwner = taskToDelete.user_id === userId;
    const isTeamLead = isTeamLeader(userRole) && taskToDelete.teamId === currentUser.team_id;
    const isDirectorOrAdmin = isDirector(userRole) || isAdmin(userId);
    
    if (!isOwner && !isTeamLead && !isDirectorOrAdmin) {
      permissionLog(`Người dùng ${currentUser.name} (${userId}) không có quyền xóa công việc ID: ${id}`, LogLevel.DETAILED);
      throw new Error("Bạn không có quyền xóa công việc này");
    }
    
    permissionLog(`Người dùng ${currentUser.name} (${userId}) đang xóa công việc ID: ${id}`, LogLevel.DETAILED);
    
    try {
      // Lọc công việc khỏi danh sách
      const updatedTasks = tasks.filter(task => task.id !== id);
      
      // Cập nhật trạng thái và lưu trữ
      setTasks(updatedTasks);
      // Lưu vào bộ nhớ gốc
      saveRawTasks(updatedTasks);
      // Lưu vào bộ nhớ đã lọc
      saveFilteredTasks(updatedTasks);
      
      // Xóa từ Firebase nếu đã cấu hình
      if (firebaseService.isConfigured()) {
        try {
          await firebaseService.deleteTask(id);
          toast({
            title: "Đã xóa công việc",
            description: "Công việc đã được xóa và đồng bộ thành công"
          });
        } catch (error) {
          console.error('Lỗi khi xóa công việc từ Firebase:', error);
          toast({
            title: "Cảnh báo",
            description: "Công việc đã được xóa cục bộ nhưng chưa đồng bộ với Firebase.",
            variant: "warning"
          });
        }
      } else {
        toast({
          title: "Đã xóa công việc",
          description: "Công việc đã được xóa thành công"
        });
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error);
      toast({
        title: "Lỗi",
        description: `Không thể xóa công việc: ${error.message || 'Lỗi không xác định'}`,
        variant: "destructive"
      });
      return false;
    }
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
  };

  // Cập nhật trạng thái công việc
  const updateTaskStatus = async (id: string, status: string) => {
    return await updateTask(id, { status });
  };

  // Làm mới danh sách công việc
  const refreshTasks = async () => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      let tasksData = [];
      
      if (firebaseService.isConfigured()) {
        const firestoreData = await firebaseService.getTasks();
        if (Array.isArray(firestoreData) && firestoreData.length > 0) {
          const convertedTasks = convertFirebaseTasks(firestoreData);
          tasksData = convertedTasks;
=======
      // Lấy dữ liệu gốc từ Firebase hoặc local storage
      let rawTasksData: Task[] = [];
      
      // Ưu tiên lấy dữ liệu từ Firebase nếu được cấu hình
      if (firebaseService.isConfigured()) {
        try {
          console.log('Đang làm mới dữ liệu từ Firebase...');
          const firestoreData = await firebaseService.getTasks();
          if (Array.isArray(firestoreData) && firestoreData.length > 0) {
            console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
            const convertedTasks = convertFirebaseTasks(firestoreData);
            rawTasksData = convertedTasks;
            // Lưu dữ liệu gốc mới từ Firebase
            saveRawTasks(rawTasksData);
          } else {
            console.log('Không có dữ liệu từ Firebase, sử dụng dữ liệu local');
            // Lấy từ local storage nếu không có từ Firebase
            rawTasksData = getRawTasks();
          }
        } catch (error) {
          console.error('Lỗi khi làm mới dữ liệu từ Firebase:', error);
          // Lấy từ local storage nếu có lỗi
          rawTasksData = getRawTasks();
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
        }
      } else {
        // Nếu không có cấu hình Firebase, lấy từ local storage
        rawTasksData = getRawTasks();
      }
<<<<<<< HEAD

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
=======
      
      // === LỌC PHÂN QUYỀN ===
      let filteredTasksForRole: Task[] = [];
      
      if (currentUser && users && teams) {
        permissionLog(`Đang lọc phân quyền cho người dùng: ${currentUser.name} (${currentUser.id}) - Vai trò: ${currentUser.role}`, LogLevel.BASIC);
        const userRole = currentUser.role;
        const userId = currentUser.id;
        const userLocation = currentUser.location;

        // 1. Retail Director (xem tất cả công việc của công ty)
        if (userRole === 'retail_director' || isAdmin(userId)) {
          permissionLog(`Người dùng ${currentUser.name} là Retail Director hoặc Admin - xem tất cả công việc`, LogLevel.BASIC);
          // Admin hoặc Retail Director xem tất cả công việc
          filteredTasksForRole = rawTasksData;
        }
        // 2. Trưởng nhóm (Team Leader)
        else if (userRole === 'team_leader') {
          permissionLog(`Người dùng ${currentUser.name} là Trưởng nhóm - xem công việc của nhóm`, LogLevel.BASIC);
          
          // Tìm nhóm do người này quản lý
          const teamLedByUser = teams.find(team => team.leader_id === userId);
          if (teamLedByUser) {
            // Lấy ID của nhóm do người này quản lý
            const teamId = teamLedByUser.id;
            
            // Lấy danh sách thành viên trong nhóm (từ danh sách users với team_id phù hợp)
            const teamMemberIds = users
              .filter(user => user.team_id === teamId)
              .map(user => user.id);
            
            permissionLog(`Trưởng nhóm quản lý nhóm ${teamLedByUser.name} với ${teamMemberIds.length} thành viên`, LogLevel.DETAILED);
            
            // Lọc công việc theo tiêu chí:
            filteredTasksForRole = rawTasksData.filter(task => {
              // 1. Công việc của bản thân
              if (task.assignedTo === userId || task.user_id === userId) {
                permissionLog(`Task ${task.id}: Được phân công cho trưởng nhóm`, LogLevel.DETAILED);
                return true;
              }
              
              // 2. Công việc của nhóm mình
              if (task.teamId === teamId) {
                permissionLog(`Task ${task.id}: Thuộc nhóm của trưởng nhóm`, LogLevel.DETAILED);
                return true;
              }
              
              // 3. Công việc của thành viên trong nhóm
              if (task.user_id && teamMemberIds.includes(task.user_id)) {
                permissionLog(`Task ${task.id}: Tạo bởi thành viên trong nhóm`, LogLevel.DETAILED);
                return true;
              }
              
              if (task.assignedTo && teamMemberIds.includes(task.assignedTo)) {
                permissionLog(`Task ${task.id}: Giao cho thành viên trong nhóm`, LogLevel.DETAILED);
                return true;
              }
              
              // 4. Công việc được Retail Director giao
              const creator = users.find(u => u.id === task.user_id);
              if (creator && (creator.role === 'retail_director' || isAdmin(creator.id)) && task.assignedTo === userId) {
                permissionLog(`Task ${task.id}: Được giao bởi Retail Director hoặc Admin`, LogLevel.DETAILED);
                return true;
              }
              
              return false;
            });
          } else {
            permissionLog(`Không tìm thấy nhóm do người dùng ${currentUser.name} quản lý`, LogLevel.BASIC);
          }
        } 
        // 3. Nhân viên (Employee)
        else if (userRole === 'employee') {
          permissionLog(`Người dùng ${currentUser.name} là nhân viên - xem công việc liên quan`, LogLevel.BASIC);
          
          // Tìm thông tin nhóm của nhân viên
          const userTeam = teams.find(team => {
            // Tìm các user thuộc team này
            const teamMembers = users.filter(user => user.team_id === team.id);
            // Kiểm tra xem user hiện tại có trong team không
            return teamMembers.some(member => member.id === userId);
          });
          const userTeamId = userTeam?.id || '';
          const teamLeaderId = userTeam?.leader_id || '';
          
          permissionLog(`Nhân viên thuộc nhóm: ${userTeam?.name || 'Không có nhóm'}`, LogLevel.DETAILED);
          
          // Lọc công việc theo tiêu chí:
          filteredTasksForRole = rawTasksData.filter(task => {
            permissionLog(`Đang kiểm tra quyền xem Task ${task.id}...`, LogLevel.DETAILED);
            
            // 1. Công việc được giao cho nhân viên
            if (task.assignedTo === userId) {
              permissionLog(`Task ${task.id}: Được phân công cho nhân viên`, LogLevel.DETAILED);
              return true;
            }
            
            // 2. Công việc do nhân viên tạo
            if (task.user_id === userId) {
              permissionLog(`Task ${task.id}: Được tạo bởi nhân viên`, LogLevel.DETAILED);
              return true;
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
            }
            
            // 3. Công việc được Retail Director giao (và có đánh dấu chia sẻ)
            const creator = users.find(u => u.id === task.user_id);
            if (creator && creator.role === 'retail_director' && task.isShared === true) {
              permissionLog(`Task ${task.id}: Công việc chung được chia sẻ bởi Retail Director`, LogLevel.DETAILED);
              return true;
            }
            
            // 4. Công việc được Trưởng nhóm của mình giao
            if (teamLeaderId && task.user_id === teamLeaderId && task.assignedTo === userId) {
              permissionLog(`Task ${task.id}: Được giao bởi Trưởng nhóm`, LogLevel.DETAILED);
              return true;
            }
            
            // 5. Công việc được chia sẻ với nhóm (chỉ khi nhân viên thuộc nhóm đó và có đánh dấu chia sẻ)
            if (userTeamId && task.teamId === userTeamId && task.isSharedWithTeam === true) {
              permissionLog(`Task ${task.id}: Công việc được chia sẻ với nhóm của nhân viên`, LogLevel.DETAILED);
              return true;
            }
            
            permissionLog(`Task ${task.id}: Không đủ quyền xem`, LogLevel.DETAILED);
            return false;
          });
        }
<<<<<<< HEAD
        
        tasksData = filteredTasksForRole;
=======
        // Vai trò khác
        else {
          permissionLog(`Người dùng ${currentUser.name} có vai trò không xác định: ${userRole} - chỉ xem công việc cá nhân`, LogLevel.BASIC);
          
          // Chỉ xem công việc cá nhân
          filteredTasksForRole = rawTasksData.filter(task => 
            task.assignedTo === userId || task.user_id === userId
          );
        }
        
        permissionLog(`Tìm thấy ${filteredTasksForRole.length}/${rawTasksData.length} công việc phù hợp với quyền của người dùng`, LogLevel.BASIC);
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
      } else if (!currentUser) {
        permissionLog(`Không có người dùng đăng nhập - không hiển thị công việc nào`, LogLevel.BASIC);
        filteredTasksForRole = [];
      }
<<<<<<< HEAD

      setTasks(tasksData);
      saveLocalTasks(tasksData);
=======
      
      // Lưu dữ liệu đã lọc phân quyền
      saveFilteredTasks(filteredTasksForRole);
      
      // Cập nhật state
      setTasks(filteredTasksForRole);
      
>>>>>>> 7f510f7 (Cải thiện tính năng chia sẻ và hiển thị công việc: Thêm chức năng lọc công việc theo chế độ chia sẻ, hiển thị biểu tượng chia sẻ, và sửa logic kiểm soát quyền xem công việc)
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
