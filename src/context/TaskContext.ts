import { createContext } from 'react';

import { Task } from '@/components/tasks/types/TaskTypes';

// Định nghĩa kiểu cho context
export interface TaskDataContextType {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  filters: TaskFilters;
  addTask: (
    task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>,
  ) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskById: (id: string) => Task | undefined;
  updateTaskStatus: (
    id: string,
    status: 'todo' | 'in-progress' | 'on-hold' | 'completed',
  ) => Promise<Task>;
  refreshTasks: () => Promise<void>;
  filterTasks: (filters: TaskFilters) => Task[];
}

// Định nghĩa kiểu cho bộ lọc
export interface TaskFilters {
  dateRange?: 'today' | 'week' | 'month' | 'all' | 'custom';
  status?: string;
  progress?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

// Tạo context
export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);
