
import { createContext } from 'react';

export interface TaskDataContextType {
  tasks: any[];
  isLoading: boolean;
  addTask: (task: any) => Promise<any>;
  updateTask: (id: string, updates: any) => Promise<any>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskStatus: (id: string, status: string) => Promise<any>;
  refreshTasks: () => Promise<void>;
  currentUser: any;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);
