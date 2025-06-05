import React, { createContext } from 'react';
import { Task } from '../components/tasks/types/TaskTypes';

export interface TaskFilters {
  status?: string;
  type?: string;
  search?: string;
  date?: Date | null;
  teamId?: string;
  assignedTo?: string;
}

export interface TaskDataContextType {
  tasks: Task[];
  filteredTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>) => Promise<Task>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskById: (id: string) => Task | undefined;
  filterTasks: (filters: TaskFilters) => void;
  refreshTasks: () => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  isLoading: boolean;
  filters: TaskFilters;
}

// Create the context
export const TaskDataContext = createContext<TaskDataContextType | undefined>(undefined);
