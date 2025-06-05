import { useContext } from 'react';
import { TaskDataContext } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export const useTaskData = () => {
  const context = useContext(TaskDataContext);
  const { currentUser } = useAuth();
  
  if (!context) {
    throw new Error('useTaskData must be used within a TaskDataProvider');
  }
  
  return {
    ...context,
    currentUser
  };
};
