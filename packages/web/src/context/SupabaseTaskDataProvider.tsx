import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/components/tasks/types/TaskTypes';
import { TaskDataContextType, TaskFilters } from './TaskContext';
import SupabaseService from '@/services/SupabaseService';
import { useAuth } from './AuthContext';

interface SupabaseTaskDataProviderProps {
  children: ReactNode;
}

export const SupabaseTaskDataContext = createContext<TaskDataContextType | undefined>(undefined);

export const useSupabaseTaskData = () => {
  const context = useContext(SupabaseTaskDataContext);
  if (!context) {
    throw new Error('useSupabaseTaskData must be used within a SupabaseTaskDataProvider');
  }
  return context;
};

export const SupabaseTaskDataProvider: React.FC<SupabaseTaskDataProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const { toast } = useToast();

  // Initialize Supabase (only if not already initialized)
  useEffect(() => {
    const initializeSupabase = () => {
      console.log('🔄 [SupabaseTaskDataProvider] Checking Supabase initialization...');

      const supabaseService = SupabaseService.getInstance();

      // Check if already initialized
      if (supabaseService.isInitialized()) {
        console.log('✅ Supabase already initialized, loading tasks...');
        loadTasks();
        return;
      }

      // Try to initialize from localStorage first
      const fromLocalStorage = SupabaseService.initializeFromLocalStorage();
      if (fromLocalStorage) {
        console.log('✅ Supabase initialized from localStorage');
        loadTasks();
        return;
      }

      // Fallback: Initialize with hardcoded config (for development)
      const config = {
        url: 'https://fnakxavwxubnbucfoujd.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M'
      };

      console.log('🔧 Initializing Supabase with fallback config...');
      const initialized = supabaseService.initialize(config);

      if (initialized) {
        console.log('✅ Supabase initialized successfully');
        loadTasks();
      } else {
        console.error('❌ Failed to initialize Supabase');
        setIsLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  // Load tasks from Supabase
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      console.log('📋 Loading tasks from Supabase...');
      const supabaseService = SupabaseService.getInstance();
      const tasksData = await supabaseService.getTasks();
      
      console.log(`✅ Loaded ${tasksData.length} tasks from Supabase`);
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      console.error('❌ Error loading tasks from Supabase:', error);
      toast({
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải danh sách công việc từ Supabase',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new task
  const addTask = async (
    task: Partial<Task> & Pick<Task, 'title' | 'description' | 'type' | 'date' | 'status'>
  ): Promise<Task> => {
    try {
      console.log('➕ Adding new task to Supabase...');
      const supabaseService = SupabaseService.getInstance();
      
      // Map to existing Supabase columns only
      const taskData = {
        title: task.title,
        description: task.description,
        type: task.type === 'test' ? 'work' : task.type, // Fix type constraint
        status: task.status,
        priority: task.priority || 'normal',
        date: task.date,
        time: task.time || '09:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: task.progress || 0,
        is_new: true,
        is_shared: task.isShared || false,
        is_shared_with_team: task.isSharedWithTeam || false,
        // Map to existing columns
        assigned_to: task.assignedTo || task.assigned_to || 'user_khanh_duy',
        user_id: task.user_id || 'user_khanh_duy',
        user_name: task.user_name || 'Lê Khánh Duy',
        team_id: task.team_id || '1',
        location: task.location || 'hanoi',
        // Skip missing columns: assignedTo, created_by, visibility, deadline, types, images, shared_with
      };

      const newTask = await supabaseService.addTask(taskData);
      
      if (newTask) {
        console.log('✅ Task added successfully:', newTask.id);
        await loadTasks(); // Refresh tasks
        
        toast({
          title: 'Thành công',
          description: 'Công việc đã được thêm mới',
        });
        
        return newTask;
      } else {
        throw new Error('Failed to add task');
      }
    } catch (error) {
      console.error('❌ Error adding task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm công việc mới',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update task
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    try {
      console.log('🔄 Updating task in Supabase:', id);
      const supabaseService = SupabaseService.getInstance();
      
      const updatedTask = await supabaseService.updateTask(id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
      
      if (updatedTask) {
        console.log('✅ Task updated successfully:', id);
        await loadTasks(); // Refresh tasks
        
        toast({
          title: 'Thành công',
          description: 'Công việc đã được cập nhật',
        });
        
        return updatedTask;
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật công việc',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting task from Supabase:', id);
      const supabaseService = SupabaseService.getInstance();
      
      const success = await supabaseService.deleteTask(id);
      
      if (success) {
        console.log('✅ Task deleted successfully:', id);
        await loadTasks(); // Refresh tasks
        
        toast({
          title: 'Thành công',
          description: 'Công việc đã được xóa',
        });
        
        return true;
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa công việc',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get task by ID
  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  // Update task status
  const updateTaskStatus = async (
    id: string,
    status: 'todo' | 'in-progress' | 'on-hold' | 'completed'
  ): Promise<Task> => {
    return updateTask(id, { status });
  };

  // Refresh tasks
  const refreshTasks = async (): Promise<void> => {
    await loadTasks();
  };

  // Filter tasks
  const filterTasks = (newFilters: TaskFilters): Task[] => {
    setFilters(newFilters);
    
    const filtered = tasks.filter(task => {
      // Apply filters logic here
      if (newFilters.status && task.status !== newFilters.status) {
        return false;
      }
      
      if (newFilters.dateRange) {
        const taskDate = new Date(task.date);
        const today = new Date();
        
        switch (newFilters.dateRange) {
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
    
    setFilteredTasks(filtered);
    return filtered;
  };

  const contextValue: TaskDataContextType = {
    tasks,
    filteredTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    updateTaskStatus,
    refreshTasks,
    filterTasks,
    isLoading,
    filters,
  };

  return (
    <SupabaseTaskDataContext.Provider value={contextValue}>
      {children}
    </SupabaseTaskDataContext.Provider>
  );
};
