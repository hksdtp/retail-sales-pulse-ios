import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { getApiUrl } from '@/config/api';
import { LogLevel, isAdmin, isDirector, isTeamLeader, permissionLog } from '@/config/permissions';

import { Task } from '../components/tasks/types/TaskTypes';
import { useToast } from '../hooks/use-toast';
import { FirebaseService } from '../services/FirebaseService';
import { googleSheetsService } from '../services/GoogleSheetsService';
import { pushNotificationService } from '../services/pushNotificationService';
import { planToTaskSyncService } from '../services/PlanToTaskSyncService';
import { mockTasks, saveMockTasksToLocalStorage } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { TaskDataContext, TaskDataContextType, TaskFilters } from './TaskContext';

// Các helper function để làm việc với FirebaseService
const isFirebaseConfigured = () => FirebaseService.isConfigured();

const deleteTaskFromFirebase = async (taskId: string) => {
  try {
    const instance = FirebaseService.getInstance();
    await instance.deleteDocument('tasks', taskId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa task từ Firebase:', error);
    throw error;
  }
};

// Helper function để làm việc với API và Tasks
const getTasks = async (currentUser?: any, users?: any[]) => {
  try {
    const apiUrl = getApiUrl();
    let url = `${apiUrl}/tasks`;

    if (currentUser) {
      const params = new URLSearchParams();
      params.append('user_id', currentUser.id);
      params.append('role', currentUser.role);

      if (currentUser.team_id) {
        params.append('team_id', currentUser.team_id);
      }

      if (currentUser.department_type) {
        params.append('department', currentUser.department_type);
      }

      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data) {
      // Nếu là Retail Director, lọc thêm theo department ở frontend
      if (currentUser?.role === 'retail_director' && users) {
        return result.data.filter((task: any) => {
          if (task.assignedTo) {
            const assignedUser = users.find((u) => u.id === task.assignedTo);
            return assignedUser && assignedUser.department_type === 'retail';
          }
          return false;
        });
      }

      return result.data;
    } else {
      console.error('Lỗi khi lấy tasks từ API:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Lỗi khi lấy tasks từ API:', error);
    return [];
  }
};

const saveTask = async (task: Task) => {
  const firebaseService = FirebaseService.getInstance();
  try {
    await firebaseService.addDocument('tasks', task);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu task vào Firestore:', error);
    return false;
  }
};

const updateTaskInFirebase = async (task: Task) => {
  const firebaseService = FirebaseService.getInstance();
  try {
    await firebaseService.updateDocument('tasks', task.id, task);
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật task trong Firestore:', error);
    return false;
  }
};

const deleteTask = async (taskId: string) => {
  const firebaseService = FirebaseService.getInstance();
  try {
    await firebaseService.deleteDocument('tasks', taskId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa task từ Firestore:', error);
    return false;
  }
};

// Provider component
export const TaskDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, users, teams } = useAuth();

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
    return googleTasks.map((task) => {
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
        priority: task.priority || 'normal',
        progress: typeof task.progress === 'number' ? task.progress : 0,
        isNew: task.isNew === true,
        teamId: task.teamId || task.team_id || '',
        assignedTo: task.assignedTo || '',
      } as Task;
    });
  };

  // Hàm chuyển đổi dữ liệu từ Firebase sang định dạng Task
  const convertFirebaseTasks = (fbTasks: Record<string, unknown>[]): Task[] => {
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
        priority: task.priority || 'normal',
        progress: typeof task.progress === 'number' ? task.progress : 0,
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
        assignedTo: String(task.assignedTo || ''),
      };
    });
  };

  // Kiểm tra nếu type hợp lệ
  const isValidTaskType = (type: string): type is Task['type'] => {
    return ['meeting', 'call', 'task', 'report', 'other'].includes(type);
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
        // Chuyển đổi dữ liệu cũ sang định dạng mới nếu cần
        migrateOldData();

        let rawTasksData: Task[] = [];

        // Kiểm tra xem có dữ liệu thô trong localStorage không
        const localRawTasks = getRawTasks();

        // PRODUCTION MODE: Xóa tất cả và bắt đầu trống
        console.log('🗑️ PRODUCTION MODE: Xóa tất cả dữ liệu và bắt đầu trống...');
        localStorage.clear(); // Xóa toàn bộ localStorage
        sessionStorage.clear(); // Xóa session storage

        // Xóa tất cả dữ liệu từ API nếu có
        if (isFirebaseConfigured()) {
          try {
            console.log('🗑️ Đang xóa tất cả dữ liệu từ Firebase...');
            const allTasks = await getTasks();
            if (Array.isArray(allTasks) && allTasks.length > 0) {
              console.log(`🗑️ Tìm thấy ${allTasks.length} công việc, đang xóa...`);
              for (const task of allTasks) {
                try {
                  await deleteTaskFromFirebase(task.id);
                  console.log(`✅ Đã xóa: ${task.title}`);
                } catch (error) {
                  console.error(`❌ Lỗi xóa ${task.title}:`, error);
                }
              }
              console.log('🎉 Đã xóa tất cả dữ liệu từ Firebase');
            }
          } catch (error) {
            console.error('❌ Lỗi khi xóa dữ liệu từ Firebase:', error);
          }
        }

        // PRODUCTION MODE: Bắt đầu với dữ liệu trống
        console.log('🚀 PRODUCTION MODE: Bắt đầu dự án mới - không có dữ liệu mẫu');
        rawTasksData = [];

        // === START: LOGIC LỌC PHÂN QUYỀN MỚI SỬ DỤNG CONFIG ===
        let filteredTasksForRole: Task[] = [];
        if (currentUser && users && teams) {
          permissionLog(
            `Đang làm mới danh sách công việc cho người dùng: ${currentUser.name} (${currentUser.id}) - Vai trò: ${currentUser.role}`,
            LogLevel.BASIC,
          );
          const userRole = currentUser.role;
          const userId = currentUser.id;

          // Nếu là quản trị viên hoặc giám đốc - xem được tất cả công việc trong phòng ban
          if (isAdmin(userId) || isDirector(userRole)) {
            permissionLog(
              `Người dùng ${currentUser.name} là Admin/Director - xem tất cả công việc`,
              LogLevel.BASIC,
            );

            if (isAdmin(userId)) {
              // Admin xem tất cả công việc
              filteredTasksForRole = rawTasksData;
            } else {
              // Giám đốc chỉ xem công việc trong phòng ban của mình
              const directorDepartment = currentUser.department;
              filteredTasksForRole = rawTasksData.filter((task) => {
                if (task.assignedTo) {
                  const assignedUser = users.find((u) => u.id === task.assignedTo);
                  return assignedUser && assignedUser.department === directorDepartment;
                }
                if (task.teamId) {
                  const taskTeam = teams.find((t) => t.id === task.teamId);
                  return taskTeam && taskTeam.department === directorDepartment;
                }
                return false;
              });
            }
          }
          // Nếu là Trưởng nhóm
          else if (isTeamLeader(userRole)) {
            permissionLog(
              `Người dùng ${currentUser.name} là Trưởng nhóm - xem công việc của nhóm`,
              LogLevel.BASIC,
            );

            // Tìm các nhóm do người này quản lý
            const managedTeams = teams.filter((team) => team.leader_id === userId);
            const managedTeamIds = managedTeams.map((team) => team.id);

            // Tìm các thành viên trong nhóm
            const teamMemberIds = users
              .filter((user) => user.team_id && managedTeamIds.includes(user.team_id))
              .map((user) => user.id);

            permissionLog(
              `Trưởng nhóm quản lý ${managedTeamIds.length} nhóm với ${teamMemberIds.length} thành viên`,
              LogLevel.DETAILED,
            );

            // Lọc công việc theo tiêu chí:
            filteredTasksForRole = rawTasksData.filter((task) => {
              // 1. Công việc của bản thân
              if (task.assignedTo === userId || task.user_id === userId) {
                permissionLog(`Task ${task.id}: Được phân công cho trưởng nhóm`, LogLevel.DETAILED);
                return true;
              }

              // 2. Công việc của nhóm mình
              if (task.teamId && managedTeamIds.includes(task.teamId)) {
                permissionLog(`Task ${task.id}: Thuộc nhóm của trưởng nhóm`, LogLevel.DETAILED);
                return true;
              }

              // 3. Công việc được admin giao
              const creator = users.find((u) => u.id === task.user_id);
              if (creator && isAdmin(creator.id) && task.assignedTo === userId) {
                permissionLog(`Task ${task.id}: Được giao bởi Admin`, LogLevel.DETAILED);
                return true;
              }

              // 4. Người dùng được thêm làm người thực hiện cùng
              const extraAssignees = task.extraAssignees || [];
              if (Array.isArray(extraAssignees) && extraAssignees.includes(userId)) {
                permissionLog(
                  `Task ${task.id}: Trưởng nhóm là người thực hiện cùng`,
                  LogLevel.DETAILED,
                );
                return true;
              }

              return false;
            });
          }
          // Nếu là nhân viên thường
          else {
            permissionLog(
              `Người dùng ${currentUser.name} là nhân viên - xem công việc liên quan`,
              LogLevel.BASIC,
            );

            // Tìm thông tin nhóm của nhân viên
            const userTeamId = currentUser.team_id;

            // Lọc công việc theo tiêu chí:
            filteredTasksForRole = rawTasksData.filter((task) => {
              // 1. Công việc của bản thân
              if (task.assignedTo === userId || task.user_id === userId) {
                permissionLog(`Task ${task.id}: Được phân công cho nhân viên`, LogLevel.DETAILED);
                return true;
              }

              // 2. Công việc chung được chia sẻ (bởi admin hoặc director)
              const creator = users.find((u) => u.id === task.user_id);
              if (creator && (isAdmin(creator.id) || isDirector(creator.role)) && task.isShared) {
                permissionLog(
                  `Task ${task.id}: Công việc chung được chia sẻ bởi ${creator.role}`,
                  LogLevel.DETAILED,
                );
                return true;
              }

              // 3. Công việc trong nhóm (khi được chỉ định)
              if (
                task.teamId === userTeamId &&
                (task.isSharedWithTeam || // Nếu công việc được chia sẻ với cả nhóm
                  task.assignedTo === userId || // Hoặc được giao trực tiếp
                  (task.extraAssignees &&
                    Array.isArray(task.extraAssignees) &&
                    task.extraAssignees.includes(userId))) // Hoặc được thêm làm người thực hiện
              ) {
                permissionLog(
                  `Task ${task.id}: Công việc nhóm có liên quan đến nhân viên`,
                  LogLevel.DETAILED,
                );
                return true;
              }

              // 4. Người dùng được thêm làm người thực hiện cùng
              const extraAssignees = task.extraAssignees || [];
              if (Array.isArray(extraAssignees) && extraAssignees.includes(userId)) {
                permissionLog(
                  `Task ${task.id}: Nhân viên là người thực hiện cùng`,
                  LogLevel.DETAILED,
                );
                return true;
              }

              return false;
            });
          }

          permissionLog(
            `Tìm thấy ${filteredTasksForRole.length}/${rawTasksData.length} công việc phù hợp với quyền của người dùng`,
            LogLevel.BASIC,
          );
        } else if (!currentUser) {
          permissionLog(
            `Không có người dùng đăng nhập - không hiển thị công việc nào`,
            LogLevel.BASIC,
          );
          filteredTasksForRole = [];
        }
        // === END: LOGIC LỌC PHÂN QUYỀN MỚI ===

        // Lưu dữ liệu đã lọc phân quyền vào localStorage
        saveFilteredTasks(filteredTasksForRole);

        // Cập nhật state với dữ liệu đã lọc
        setTasks(filteredTasksForRole);

        // Check for push notifications
        if (currentUser?.id) {
          pushNotificationService.checkTaskNotifications(filteredTasksForRole, currentUser.id);
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu công việc:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu công việc. Vui lòng thử lại sau.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Khởi tạo PlanToTaskSyncService
    if (currentUser?.id) {
      console.log('🚀 Khởi tạo PlanToTaskSyncService cho user:', currentUser.name);
      planToTaskSyncService.startAutoSync(1); // Check mỗi 1 phút

      // Listen for plan-to-task conversion events
      const handlePlanToTaskConversion = (event: CustomEvent) => {
        const { task } = event.detail;
        console.log('📋 Nhận được task mới từ plan conversion:', task.title);

        // Thêm task mới vào danh sách hiện tại
        setTasks(prevTasks => {
          const updatedTasks = [...prevTasks, task];
          saveFilteredTasks(updatedTasks);
          return updatedTasks;
        });

        // Hiển thị thông báo
        toast({
          title: '📋 Kế hoạch đã chuyển thành công việc',
          description: `"${task.title}" đã được tự động thêm vào danh sách công việc`,
        });
      };

      window.addEventListener('planToTaskConverted', handlePlanToTaskConversion as EventListener);
    }

    // Thiết lập đồng bộ định kỳ mỗi 30 giây
    const syncInterval = setInterval(() => {
      if (isFirebaseConfigured() && !isLoading) {
        refreshTasks();
      }
    }, 30000); // 30 giây

    return () => {
      clearInterval(syncInterval);
      // Cleanup plan-to-task sync service
      planToTaskSyncService.stopAutoSync();
      window.removeEventListener('planToTaskConverted', handlePlanToTaskConversion as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, currentUser, users, teams]);

  // Thêm công việc mới
  const addTask = async (
    task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>,
  ): Promise<Task> => {
    // Kiểm tra quyền trước khi thêm công việc mới
    if (!currentUser) {
      throw new Error('Bạn cần đăng nhập để thêm công việc mới');
    }

    // Tạo ID duy nhất cho công việc mới
    const uniqueId = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Xây dựng đối tượng công việc đầy đủ thông tin
    const newTask: Task = {
      ...task,
      id: uniqueId,
      title: task.title,
      description: task.description,
      type: task.type,
      date: task.date,
      status: task.status,
      priority: task.priority || 'normal',
      progress: typeof task.progress === 'number' ? task.progress : 0,
      isNew: true,
      location: task.location || currentUser?.location || '',
      teamId: task.teamId || currentUser?.team_id || '',
      assignedTo: task.assignedTo || currentUser.id,
      user_id: currentUser.id,
      user_name: currentUser.name || '',
      created_at: new Date().toISOString(),
      time: task.time || '',
      // Mặc định không chia sẻ công việc trừ khi có chỉ định
      isShared: task.isShared || false,
      isSharedWithTeam: task.isSharedWithTeam || false,
      // Xử lý trường extraAssignees để tránh lỗi kiểu dữ liệu
      extraAssignees: task.extraAssignees ? JSON.stringify(task.extraAssignees) : '',
    };

    permissionLog(
      `Người dùng ${currentUser.name} (${currentUser.id}) đang thêm công việc mới ID: ${uniqueId}`,
      LogLevel.DETAILED,
    );
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
      if (isFirebaseConfigured()) {
        try {
          console.log('Bắt đầu lưu công việc vào Firebase...');
          await saveTask(newTask);
          console.log('Lưu công việc vào Firebase thành công');

          // Tự động làm mới dữ liệu sau khi thêm công việc mới thành công
          console.log('Bắt đầu làm mới dữ liệu từ Firebase...');
          setTimeout(async () => {
            try {
              const firestoreData = await getTasks();
              if (Array.isArray(firestoreData) && firestoreData.length > 0) {
                // Kiểm tra xem Firebase có được cấu hình đúng và đồng bộ thành công không
                // Lưu ý: Không phụ thuộc vào ID của task nữa mà dựa vào kết quả đồng bộ thực tế
                const firebaseConnected = isFirebaseConfigured() && firestoreData.length > 0;

                // Chỉ cập nhật khi Firebase được cấu hình đúng
                if (!firebaseConnected) {
                  console.log(`Đã tải ${firestoreData.length} công việc từ Firebase`);
                  const convertedTasks = convertFirebaseTasks(firestoreData);

                  // Đảm bảo công việc mới vẫn còn trong danh sách
                  if (!convertedTasks.some((t) => t.id === newTask.id)) {
                    convertedTasks.push(newTask);
                  }

                  setTasks(convertedTasks);
                  // Lưu vào bộ nhớ gốc
                  saveRawTasks(convertedTasks);
                  // Lưu vào bộ nhớ đã lọc
                  saveFilteredTasks(convertedTasks);
                  toast({
                    title: 'Đã thêm công việc mới',
                    description: 'Công việc đã được thêm và đồng bộ thành công với Firebase',
                  });
                } else {
                  console.log(
                    'Firebase chưa được cấu hình đúng hoặc không đồng bộ được, giữ nguyên công việc mới đã thêm',
                  );
                  toast({
                    title: 'Đã thêm công việc mới',
                    description: 'Công việc đã được thêm nhưng đang ở chế độ ngoại tuyến',
                  });
                }
              } else {
                console.warn('Không lấy được dữ liệu mới từ Firebase sau khi thêm');
              }
            } catch (refreshError) {
              console.error('Lỗi khi làm mới dữ liệu sau khi thêm:', refreshError);
              // Khi có lỗi, giữ nguyên công việc đã thêm
              toast({
                title: 'Lưu ý',
                description: 'Công việc đã được thêm nhưng chưa đồng bộ được với Firebase',
              });
            }
          }, 2000); // Chờ 2 giây để Google Sheets có thời gian xử lý
        } catch (error) {
          console.error('Lỗi khi lưu công việc vào Firebase:', error);
          toast({
            title: 'Cảnh báo',
            description: 'Công việc đã được lưu cục bộ nhưng chưa đồng bộ với Google Sheets.',
            variant: 'warning',
          });
        }
      }

      // Hiển thị thông báo thành công
      toast({
        title: 'Đã thêm công việc mới',
        description: 'Công việc đã được thêm thành công',
      });

      return newTask;
    } catch (error) {
      console.error('Lỗi khi thêm công việc mới:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể thêm công việc mới: ${error.message || 'Lỗi không xác định'}`,
        variant: 'destructive',
      });
      throw error;
    }

    return newTask;
  };

  // Cập nhật công việc
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    // Kiểm tra quyền trước khi cập nhật công việc
    if (!currentUser) {
      throw new Error('Bạn cần đăng nhập để cập nhật công việc');
    }

    // Tìm công việc cần cập nhật
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Không tìm thấy công việc để cập nhật');
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
      permissionLog(
        `Người dùng ${currentUser.name} (${userId}) không có quyền cập nhật công việc ID: ${id}`,
        LogLevel.DETAILED,
      );
      throw new Error('Bạn không có quyền cập nhật công việc này');
    }

    permissionLog(
      `Người dùng ${currentUser.name} (${userId}) đang cập nhật công việc ID: ${id}`,
      LogLevel.DETAILED,
    );

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
      if (isFirebaseConfigured()) {
        try {
          // Gọi hàm updateTaskInFirebase helper với đúng một tham số là Task
          await updateTaskInFirebase(updatedTask as Task);
          toast({
            title: 'Đã cập nhật công việc',
            description: 'Công việc đã được cập nhật và đồng bộ thành công',
          });
        } catch (error) {
          console.error('Lỗi khi cập nhật công việc vào Firebase:', error);
          toast({
            title: 'Cảnh báo',
            description: 'Công việc đã được cập nhật cục bộ nhưng chưa đồng bộ với Firebase.',
            variant: 'warning',
          });
        }
      } else {
        toast({
          title: 'Đã cập nhật công việc',
          description: 'Công việc đã được cập nhật thành công',
        });
      }

      return updatedTask;
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể cập nhật công việc: ${error.message || 'Lỗi không xác định'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Xóa công việc
  const deleteTask = async (id: string): Promise<boolean> => {
    // Kiểm tra quyền trước khi xóa công việc
    if (!currentUser) {
      throw new Error('Bạn cần đăng nhập để xóa công việc');
    }

    // Tìm công việc cần xóa
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) {
      throw new Error('Không tìm thấy công việc để xóa');
    }

    // Kiểm tra quyền xóa công việc
    const userRole = currentUser.role;
    const userId = currentUser.id;

    // Chỉ người tạo, trưởng nhóm, giám đốc hoặc admin mới có quyền xóa
    const isOwner = taskToDelete.user_id === userId;
    const isTeamLead = isTeamLeader(userRole) && taskToDelete.teamId === currentUser.team_id;
    const isDirectorOrAdmin = isDirector(userRole) || isAdmin(userId);

    if (!isOwner && !isTeamLead && !isDirectorOrAdmin) {
      permissionLog(
        `Người dùng ${currentUser.name} (${userId}) không có quyền xóa công việc ID: ${id}`,
        LogLevel.DETAILED,
      );
      throw new Error('Bạn không có quyền xóa công việc này');
    }

    permissionLog(
      `Người dùng ${currentUser.name} (${userId}) đang xóa công việc ID: ${id}`,
      LogLevel.DETAILED,
    );

    try {
      // Lọc công việc khỏi danh sách
      const updatedTasks = tasks.filter((task) => task.id !== id);

      // Cập nhật trạng thái và lưu trữ
      setTasks(updatedTasks);
      // Lưu vào bộ nhớ gốc
      saveRawTasks(updatedTasks);
      // Lưu vào bộ nhớ đã lọc
      saveFilteredTasks(updatedTasks);

      // Xóa từ Firebase nếu đã cấu hình
      if (isFirebaseConfigured()) {
        try {
          await deleteTask(id);
          toast({
            title: 'Đã xóa công việc',
            description: 'Công việc đã được xóa và đồng bộ thành công',
          });
        } catch (error) {
          console.error('Lỗi khi xóa công việc từ Firebase:', error);
          toast({
            title: 'Cảnh báo',
            description: 'Công việc đã được xóa cục bộ nhưng chưa đồng bộ với Firebase.',
            variant: 'warning',
          });
        }
      } else {
        toast({
          title: 'Đã xóa công việc',
          description: 'Công việc đã được xóa thành công',
        });
      }

      return true;
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể xóa công việc: ${error.message || 'Lỗi không xác định'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Cập nhật trạng thái công việc
  const updateTaskStatus = async (
    id: string,
    status: 'todo' | 'in-progress' | 'on-hold' | 'completed',
  ): Promise<Task> => {
    return await updateTask(id, { status });
  };

  // Làm mới danh sách công việc
  const refreshTasks = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Lấy dữ liệu gốc từ Firebase hoặc local storage
      let rawTasksData: Task[] = [];

      // Lấy dữ liệu từ API
      console.log('🚀 Loading tasks from API...');
      rawTasksData = await getTasks();

      // API đã lọc theo user_id rồi, không cần lọc phân quyền nữa
      permissionLog(
        `API đã trả về ${rawTasksData.length} công việc được lọc cho user ${currentUser?.name}`,
        LogLevel.BASIC,
      );

      // Lưu dữ liệu đã lọc
      saveFilteredTasks(rawTasksData);

      // Cập nhật state
      setTasks(rawTasksData);
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu công việc:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể làm mới dữ liệu công việc. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc công việc theo các tiêu chí
  const filterTasks = (filters: TaskFilters): Task[] => {
    // Cập nhật state filters
    setFilters(filters);

    // Lọc các task và cập nhật state filteredTasks
    const filtered = tasks.filter((task) => {
      // Lọc theo trạng thái
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Lọc theo tiến độ
      if (
        filters.progress !== null &&
        filters.progress !== undefined &&
        task.progress < filters.progress
      ) {
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

    // Cập nhật state filteredTasks với kết quả lọc
    setFilteredTasks(filtered);

    // Trả về mảng đã lọc
    return filtered;
  };

  // Khởi tạo state cho filteredTasks và filters
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});

  // Hàm lấy task theo ID
  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  // Hàm updateTaskStatus được định nghĩa ở trên nên bỏ phần này

  // Cung cấp giá trị cho context
  const contextValue: TaskDataContextType = {
    tasks,
    filteredTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    filterTasks,
    refreshTasks,
    updateTaskStatus,
    isLoading,
    filters,
  };

  return <TaskDataContext.Provider value={contextValue}>{children}</TaskDataContext.Provider>;
};
