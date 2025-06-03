import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import { TaskDataContext } from './TaskContext';
import { Task } from '../components/tasks/types/TaskTypes';
import { useToast } from '../hooks/use-toast';

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
  const taskContext = useContext(TaskDataContext);
  const { toast } = useToast();

  // Kiểm tra kết nối Firebase khi provider được tải
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      const isConfigured = FirebaseService.isConfigured();
      
      if (isConfigured) {
        try {
          // Khởi tạo Firebase từ cấu hình đã lưu
          FirebaseService.initializeFromLocalStorage();
          console.log('Firebase đã được kết nối từ cấu hình đã lưu');
        } catch (error) {
          console.error('Lỗi khi khởi tạo Firebase:', error);
        }
      }
    };
    
    checkFirebaseConnection();
  }, []);

  // Đồng bộ dữ liệu với Firebase
  const syncWithFirebase = async (): Promise<boolean> => {
    if (!FirebaseService.isConfigured()) {
      toast({
        title: "Chưa cấu hình Firebase",
        description: "Vui lòng cấu hình Firebase trước khi đồng bộ dữ liệu",
        variant: "destructive"
      });
      return false;
    }

    setIsSyncing(true);
    
    try {
      // Lấy instance Firebase
      const instance = FirebaseService.getInstance();
      const db = instance.getFirestore();
      
      if (!db || !taskContext) {
        throw new Error('Không thể kết nối đến Firestore hoặc TaskContext không tồn tại');
      }
      
      // Lấy danh sách công việc từ context
      const tasks = taskContext.tasks;
      
      // Đẩy mỗi công việc lên Firebase
      for (const task of tasks) {
        // Kiểm tra xem task.id có phải là ID mockup hay không
        const isMockId = typeof task.id === 'string' && 
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
        title: "Đồng bộ thành công",
        description: "Dữ liệu đã được đồng bộ lên Firebase"
      });
      
      setIsSyncing(false);
      return true;
    } catch (error) {
      console.error('Lỗi khi đồng bộ dữ liệu:', error);
      
      toast({
        title: "Lỗi đồng bộ",
        description: "Đã xảy ra lỗi khi đồng bộ dữ liệu lên Firebase",
        variant: "destructive"
      });
      
      setIsSyncing(false);
      return false;
    }
  };

  // Lấy danh sách công việc từ Firebase
  const fetchTasksFromFirebase = async (): Promise<Task[]> => {
    if (!FirebaseService.isConfigured()) {
      toast({
        title: "Chưa cấu hình Firebase",
        description: "Vui lòng cấu hình Firebase trước khi lấy dữ liệu",
        variant: "destructive"
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
      const tasks = tasksData.map(doc => ({
        ...doc,
        id: doc.id
      })) as Task[];
      
      // Cập nhật context với dữ liệu từ Firebase
      if (taskContext && taskContext.setTasks) {
        taskContext.setTasks(tasks);
      }
      
      toast({
        title: "Lấy dữ liệu thành công",
        description: "Đã lấy dữ liệu công việc từ Firebase"
      });
      
      setIsSyncing(false);
      return tasks;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
      
      toast({
        title: "Lỗi lấy dữ liệu",
        description: "Đã xảy ra lỗi khi lấy dữ liệu từ Firebase",
        variant: "destructive"
      });
      
      setIsSyncing(false);
      return [];
    }
  };

  const value = {
    syncWithFirebase,
    fetchTasksFromFirebase,
    isSyncing
  };

  return (
    <FirebaseTaskDataContext.Provider value={value}>
      {children}
    </FirebaseTaskDataContext.Provider>
  );
};
