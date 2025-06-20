import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Task } from '../components/tasks/types/TaskTypes';
import { useToast } from '../hooks/use-toast';
import { FirebaseService } from '../services/FirebaseService';
import { TaskDataContext } from './TaskContext';

interface FirebaseTaskDataContextType {
  syncWithFirebase: () => Promise<boolean>;
  fetchTasksFromFirebase: () => Promise<Task[]>;
  isSyncing: boolean;
}

const FirebaseTaskDataContext = createContext<FirebaseTaskDataContextType | undefined>(undefined);

export const useFirebaseTaskData = () => {
  const context = useContext(FirebaseTaskDataContext);
  if (!context) {
    throw new Error('useFirebaseTaskData must be used within a FirebaseTaskDataProvider');
  }
  return context;
};

interface FirebaseTaskDataProviderProps {
  children: ReactNode;
}

export const FirebaseTaskDataProvider: React.FC<FirebaseTaskDataProviderProps> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Kiểm tra kết nối Firebase và load data khi provider được tải
  useEffect(() => {
    const initializeFirebaseAndLoadData = async () => {
      const isConfigured = FirebaseService.isConfigured();

      if (isConfigured) {
        try {
          // Khởi tạo Firebase từ cấu hình đã lưu
          FirebaseService.initializeFromLocalStorage();
          console.log('Firebase đã được kết nối từ cấu hình đã lưu');

          // Load tasks từ Firebase
          await loadTasksFromFirebase();
        } catch (error) {
          console.error('Lỗi khi khởi tạo Firebase:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeFirebaseAndLoadData();
  }, []);

  // Đồng bộ dữ liệu với Firebase
  const syncWithFirebase = async (): Promise<boolean> => {
    if (!FirebaseService.isConfigured()) {
      toast({
        title: 'Chưa cấu hình Firebase',
        description: 'Vui lòng cấu hình Firebase trước khi đồng bộ dữ liệu',
        variant: 'destructive',
      });
      return false;
    }

    setIsSyncing(true);

    try {
      // Lấy instance Firebase
      const instance = FirebaseService.getInstance();
      const db = instance.getFirestore();

      if (!db) {
        throw new Error('Không thể kết nối đến Firestore');
      }

      // Lấy danh sách công việc từ state
      const currentTasks = tasks;

      // Đẩy mỗi công việc lên Firebase
      for (const task of currentTasks) {
        // Kiểm tra xem task.id có phải là ID mockup hay không
        const isMockId =
          typeof task.id === 'string' &&
          (task.id.includes('task_1') || task.id.includes('task_2') || task.id.includes('task_3'));

        if (isMockId) {
          // Đối với dữ liệu mockup, tạo mới trên Firebase
          const taskData = {
            ...task,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Xóa id cũ để Firebase tạo id mới
          delete taskData.id;

          await instance.addDocument('tasks', taskData);
        } else {
          // Đối với dữ liệu có id Firebase, cập nhật
          const taskData = {
            ...task,
            updated_at: new Date().toISOString(),
          };

          await instance.updateDocument('tasks', task.id.toString(), taskData);
        }
      }

      toast({
        title: 'Đồng bộ thành công',
        description: 'Dữ liệu đã được đồng bộ lên Firebase',
      });

      setIsSyncing(false);
      return true;
    } catch (error) {
      console.error('Lỗi khi đồng bộ dữ liệu:', error);

      toast({
        title: 'Lỗi đồng bộ',
        description: 'Đã xảy ra lỗi khi đồng bộ dữ liệu lên Firebase',
        variant: 'destructive',
      });

      setIsSyncing(false);
      return false;
    }
  };

  // Load tasks từ Firebase và cập nhật state
  const loadTasksFromFirebase = async (): Promise<void> => {
    setIsLoading(true);
    const loadedTasks = await fetchTasksFromFirebase();
    setTasks(loadedTasks);
    setIsLoading(false);
  };

  // Lấy danh sách công việc từ Firebase
  const fetchTasksFromFirebase = async (): Promise<Task[]> => {
    if (!FirebaseService.isConfigured()) {
      toast({
        title: 'Chưa cấu hình Firebase',
        description: 'Vui lòng cấu hình Firebase trước khi lấy dữ liệu',
        variant: 'destructive',
      });
      return [];
    }

    setIsSyncing(true);

    try {
      // Lấy instance Firebase
      const instance = FirebaseService.getInstance();

      // Lấy danh sách công việc từ collection 'tasks'
      const tasksData = await instance.getDocuments('tasks');

      // Chuyển đổi dữ liệu thành Task[]
      const tasks = tasksData.map((doc) => ({
        ...doc,
        id: doc.id,
      })) as Task[];

      // Cập nhật state với dữ liệu từ Firebase
      setTasks(tasks);

      toast({
        title: 'Lấy dữ liệu thành công',
        description: 'Đã lấy dữ liệu công việc từ Firebase',
      });

      setIsSyncing(false);
      return tasks;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);

      toast({
        title: 'Lỗi lấy dữ liệu',
        description: 'Đã xảy ra lỗi khi lấy dữ liệu từ Firebase',
        variant: 'destructive',
      });

      setIsSyncing(false);
      return [];
    }
  };

  // TaskDataContext value
  const taskDataValue = {
    tasks,
    setTasks,
    isLoading,
    refreshTasks: loadTasksFromFirebase,
  };

  // FirebaseTaskDataContext value
  const firebaseValue = {
    syncWithFirebase,
    fetchTasksFromFirebase,
    isSyncing,
  };

  return (
    <TaskDataContext.Provider value={taskDataValue}>
      <FirebaseTaskDataContext.Provider value={firebaseValue}>
        {children}
      </FirebaseTaskDataContext.Provider>
    </TaskDataContext.Provider>
  );
};
