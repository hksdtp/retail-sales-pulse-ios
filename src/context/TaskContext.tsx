
import React, { createContext } from 'react';
import { Task } from '../components/tasks/types/TaskTypes';

export interface TaskFilters {
  status?: string;
  type?: string;
  search?: string;
  date?: Date | null;
  teamId?: string;
  assignedTo?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all' | 'custom';
  progress?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TaskDataContextType {
  tasks: Task[];
  filteredTasks: Task[];
  addTask: (task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>) => Promise<Task>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskById: (id: string) => Task | undefined;
  filterTasks: (filters: TaskFilters) => Task[];
  refreshTasks: () => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<Task>;
  isLoading: boolean;
  filters: TaskFilters;
}

export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);
