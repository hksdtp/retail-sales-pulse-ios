import { useContext } from 'react';

import { useAuth } from '../context/AuthContextSupabase';
import { SupabaseTaskDataContext } from '../context/SupabaseTaskDataProvider';

export const useTaskData = () => {
  const context = useContext(SupabaseTaskDataContext);
  const { currentUser } = useAuth();

  // Debug logs disabled for performance

  if (!context) {
    console.error('❌ SupabaseTaskDataContext not found!');
    throw new Error('useTaskData must be used within a SupabaseTaskDataProvider');
  }

  return {
    ...context,
    currentUser,
  };
};
