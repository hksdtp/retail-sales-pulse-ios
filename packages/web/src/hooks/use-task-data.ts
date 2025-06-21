import { useContext } from 'react';

import { useAuth } from '../context/AuthContext';
import { TaskDataContext } from '../context/TaskDataProvider';

export const useTaskData = () => {
  const context = useContext(TaskDataContext);
  const { currentUser } = useAuth();

  if (!context) {
    throw new Error('useTaskData must be used within a TaskDataProvider');
  }

  return {
    ...context,
    currentUser,
  };
};
